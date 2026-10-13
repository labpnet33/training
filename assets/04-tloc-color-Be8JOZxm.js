var e={id:`tloc-color`,h:{en:`TLOCs, system IP and colours: how an edge attaches to a transport`,hi:`TLOCs, system IP aur colours: edge transport se kaise judta hai`},body:{en:`
<p>If you understand TLOCs, most of the rest of SD-WAN falls into place, because every route and every tunnel in the overlay is expressed in terms of TLOCs. This chapter starts with identities, builds up to the TLOC and its colour, explains how colours decide which address a tunnel uses, and finishes with the commands to read and to configure a TLOC.</p>

<h3>System IP and site ID: who and where</h3>
<p>Every device has a <b>system IP</b>: a /32 identifier written like an IPv4 address, similar to a router ID. It does not have to be reachable in the underlay; it is simply the device's name in the overlay. In the lab fabric the controllers use 10.255.255.1 to 3 and the edges use 10.255.0.11 and up. Every device also has a <b>site ID</b>, a number shared by all devices in one location. Two edges with the same site ID never build tunnels to each other, so duplicates must be avoided between different locations.</p>

<h3>The TLOC</h3>
<p>A <b>TLOC</b> (transport locator) is how an edge attaches to a transport. It is identified by three items:</p>
<ul>
<li>the <b>system IP</b> of the edge,</li>
<li>the <b>colour</b>, a label for the type of transport, and</li>
<li>the <b>encapsulation</b>, normally IPsec (GRE is an option mostly used towards service devices).</li>
</ul>
<p>An edge with MPLS and broadband has two TLOCs: <code>10.255.0.11 / mpls / ipsec</code> and <code>10.255.0.11 / biz-internet / ipsec</code>. Each TLOC also carries the private and public IP address and the UDP port the edge uses for its tunnels. The interface IP address is an attribute, not part of the identity.</p>

<h3>Colours and why they matter</h3>
<p>The colour is a label chosen from a fixed list. Its job is practical: it tells the edge which address of the remote TLOC to aim at, and it lets policy refer to a transport by name.</p>
<table class="cmp"><tr><th>Private colours</th><th>Public colours</th></tr>
<tr><td>mpls, metro-ethernet, private1 to private6</td><td>default, biz-internet, public-internet, lte, 3g, blue, green, red, gold, silver, bronze, custom1 to custom3</td></tr>
<tr><td>Between two private colours the tunnel is built to the peer's <b>private</b> (pre-NAT) address</td><td>If either side uses a public colour, the tunnel is built to the peer's <b>public</b> (post-NAT) address, which the Validator and Controller learned</td></tr></table>
<p>Why? A private transport such as MPLS has no NAT: the address on the interface is the real address, so edges can talk to each other directly. The internet is different: an edge behind a NAT device is known to the outside only by its translated address and port, so the tunnel must be built to that. The Validator discovers this translated (public) address when the edge first connects.</p>

<h3>Restrict: keeping colours apart</h3>
<p>By default each TLOC tries to build a tunnel to every remote TLOC, whatever its colour. If the MPLS cloud has no way to reach internet addresses, those attempts are wasted and the edge may log failures. The keyword <code>restrict</code> after a colour limits that TLOC to peers with the <b>same</b> colour. In the lab, the MPLS TLOCs use <code>color mpls restrict</code>, so an MPLS TLOC only pairs with other MPLS TLOCs.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="TLOC pairing with restrict">
<rect x="20" y="30" width="130" height="150" rx="10" fill="#bbf7d0"/><text x="85" y="52" text-anchor="middle" class="svg-ink" font-size="12">E-DEL-1</text>
<rect x="30" y="66" width="110" height="30" rx="6" fill="#fff"/><text x="85" y="86" text-anchor="middle" class="svg-ink" font-size="11">biz-internet</text>
<rect x="30" y="116" width="110" height="30" rx="6" fill="#ddd6fe"/><text x="85" y="136" text-anchor="middle" class="svg-ink" font-size="11">mpls restrict</text>
<rect x="490" y="30" width="130" height="150" rx="10" fill="#bbf7d0"/><text x="555" y="52" text-anchor="middle" class="svg-ink" font-size="12">E-MUM-1</text>
<rect x="500" y="66" width="110" height="30" rx="6" fill="#fff"/><text x="555" y="86" text-anchor="middle" class="svg-ink" font-size="11">biz-internet</text>
<rect x="500" y="116" width="110" height="30" rx="6" fill="#ddd6fe"/><text x="555" y="136" text-anchor="middle" class="svg-ink" font-size="11">mpls restrict</text>
<line x1="140" y1="81" x2="500" y2="81" stroke="#16a34a" stroke-width="3"/>
<line x1="140" y1="131" x2="500" y2="131" stroke="#16a34a" stroke-width="3"/>
<line x1="140" y1="86" x2="500" y2="126" stroke="#ef4444" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="140" y1="126" x2="500" y2="86" stroke="#ef4444" stroke-width="2" stroke-dasharray="5 4"/>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">Green: same colour, tunnel forms. Red dashed: cross-colour, blocked by restrict.</text>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="11">E-DEL-1 and E-MUM-1 therefore have 2 BFD sessions to each other.</text>
</svg><p class="cap">With restrict on the MPLS colour, only same-colour pairs form tunnels.</p></div>

<h3>Reading the TLOCs</h3>
<p><code>show sdwan omp tlocs</code> lists the TLOCs known to an edge: its own and those learned from the Controller.</p>
<pre class="code">E-DEL-1# show sdwan omp tlocs
ADDRESS                                                     PSEUDO              PUBLIC              PRIVATE BFD
FAMILY  TLOC IP     COLOR        ENCAP FROM PEER    STATUS  KEY    PUBLIC IP    PORT   PRIVATE IP   PORT    STATUS
-------------------------------------------------------------------------------------------------------------------
ipv4    10.255.0.11 biz-internet ipsec 0.0.0.0      C,Red,R 1      203.0.113.6  12346  203.0.113.6  12346   -
ipv4    10.255.0.11 mpls         ipsec 0.0.0.0      C,Red,R 1      172.16.1.2   12366  172.16.1.2   12366   -
ipv4    10.255.0.12 biz-internet ipsec 10.255.255.2 C,I,R   1      203.0.113.10 12346  203.0.113.10 12346   <span class="hl">up</span>
ipv4    10.255.0.12 mpls         ipsec 10.255.255.2 C,I,R   1      172.16.2.2   12366  172.16.2.2   12366   <span class="hl">up</span>
ipv4    10.255.0.13 biz-internet ipsec 10.255.255.2 C,I,R   1      203.0.113.14 12346  203.0.113.14 12346   <span class="hl">up</span></pre>
<p>The first two lines are E-DEL-1's own TLOCs (<code>FROM PEER 0.0.0.0</code>, status <code>Red</code> for redistributed); the rest were reflected by the Controller (10.255.255.2). The last column tells you whether a BFD session to that TLOC is up. Notice the ports: IPsec tunnels can use 12346, 12366, 12386 and so on (steps of 20), so that several TLOCs or several devices behind one NAT address do not collide. In this lab the second TLOC of each edge shows 12366.</p>

<h3>Configuring a TLOC on an IOS XE edge</h3>
<p>Two pieces are needed: a tunnel interface that is bound to the physical transport interface, and a <code>tunnel-interface</code> section under <code>sdwan</code> that sets the encapsulation and colour. The physical interface must already have an IP address and a route out.</p>
<pre class="code"><span class="c">! Make GigabitEthernet1 a TLOC with colour biz-internet</span>
config-transaction
interface Tunnel1
 ip unnumbered GigabitEthernet1
 tunnel source GigabitEthernet1
 tunnel mode sdwan
 exit
sdwan
 interface GigabitEthernet1
  tunnel-interface
   encapsulation ipsec
   color biz-internet
   exit
  exit
 exit
commit
end</pre>
<p>The tunnel number is only a local name; pick one that is not already used (Tunnel2 may belong to the MPLS transport). <code>tunnel mode sdwan</code> tells IOS XE that this tunnel interface belongs to the SD-WAN overlay.</p>

<div class="eg"><p><b>Worked example.</b> E-HYD-1 in another fabric has only an MPLS TLOC (<code>10.255.0.14 / mpls / ipsec</code>, restricted). After the configuration above, it also advertises <code>10.255.0.14 / biz-internet / ipsec</code>. The Controller reflects the new TLOC to every other edge; E-DEL-1, which has a biz-internet TLOC, now builds a second tunnel to E-HYD-1 over the internet. E-DEL-1 goes from one BFD session with E-HYD-1 to two.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>tunnel mode sdwan</code>; forgetting <code>commit</code>; choosing a colour that does not match the transport (a private colour on an internet link means tunnels are built to the private address, which is not reachable); using <code>restrict</code> on a colour that other sites use as public; assuming the system IP is the tunnel source.</p></div>

<div class="exam"><p><b>Exam traps.</b> A TLOC is <b>system IP + colour + encapsulation</b>, not an interface address. <i>Private to private</i> uses private addresses; <i>anything with a public colour</i> uses public addresses. <code>restrict</code> means same colour only. Only <code>default</code> (public) is the colour assigned when none is configured.</p></div>

<div class="scn"><h4>The internet link configured as MPLS</h4><p>A new store was onboarded with its broadband link given the colour private1 because a template was copied from a store with a private circuit. Control connections came up, but data tunnels to other stores never did: the other edges tried to reach the store's private (pre-NAT) address, which sits behind the ISP's NAT and is unreachable from outside. The fix was changing the colour to biz-internet, which makes peers use the public address.</p><p><b>Lesson:</b> the colour is not cosmetic; it decides which address peers aim at.</p></div>

<div class="iv"><p class="q">"What is the role of colours in SD-WAN?"</p><p>Strong answer: colours label transports on TLOCs. They split into private (mpls, metro-ethernet, private1 to 6) and public (biz-internet, public-internet, lte and others). Colour determines which remote address a tunnel uses: private to private uses the private (pre-NAT) address; any public colour uses the public (post-NAT) address learned through the Validator. The restrict keyword limits tunnels to the same colour, and policies refer to colours to select a path.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>System IP names the device; site ID names the location; same site ID means no tunnels between those edges.</li>
<li>A TLOC is system IP + colour + encapsulation; one edge has one TLOC per transport.</li>
<li>Colour decides private versus public addressing for the tunnel; restrict limits tunnels to the same colour.</li>
<li>Use <code>show sdwan omp tlocs</code> to read TLOCs and their BFD status.</li>
<li>To add a TLOC: a Tunnel interface with tunnel mode sdwan, plus tunnel-interface with encapsulation and colour under sdwan, then commit.</li>
</ul></div>
`,hi:`
<p>Agar aap TLOCs samajh gaye to SD-WAN ka baaki zyada tar hissa apni jagah par aa jaata hai, kyunki overlay ka har route aur har tunnel TLOCs ke terms mein express hota hai. Yeh chapter identities se shuru karta hai, TLOC aur uske colour tak banata hai, samjhata hai ki colours kaise tay karte hain ki tunnel kaunsa address use kare, aur ant mein TLOC padhne aur configure karne ki commands deta hai.</p>

<h3>System IP aur site ID: kaun aur kahan</h3>
<p>Har device ka ek <b>system IP</b> hota hai: IPv4 address jaisa likha /32 identifier, router ID jaisa. Underlay mein reachable hona zaroori nahi; woh overlay mein device ka naam hai. Lab fabric mein controllers 10.255.255.1 se 3 aur edges 10.255.0.11 aur upar use karte hain. Har device ka ek <b>site ID</b> bhi hota hai, ek number jo ek location ke saare devices share karte hain. Same site ID wale do edges aapas mein kabhi tunnel nahi banate, isliye alag locations ke beech duplicates se bacho.</p>

<h3>TLOC</h3>
<p><b>TLOC</b> (transport locator) woh tareeka hai jisse edge transport se attach hota hai. Iski pehchaan teen cheezon se hoti hai:</p>
<ul>
<li>edge ka <b>system IP</b>,</li>
<li><b>colour</b>, transport ke type ka label, aur</li>
<li><b>encapsulation</b>, aam taur par IPsec (GRE ek option hai, zyada tar service devices ki taraf).</li>
</ul>
<p>MPLS aur broadband wale edge ke do TLOCs hote hain: <code>10.255.0.11 / mpls / ipsec</code> aur <code>10.255.0.11 / biz-internet / ipsec</code>. Har TLOC apne tunnels ke liye edge ka use kiya hua private aur public IP address aur UDP port bhi carry karta hai. Interface IP address ek attribute hai, identity ka hissa nahi.</p>

<h3>Colours aur woh kyun matter karte hain</h3>
<p>Colour ek fixed list se chuna gaya label hai. Uska kaam practical hai: woh edge ko batata hai ki remote TLOC ka kaunsa address target karna hai, aur policy ko transport ko naam se refer karne deta hai.</p>
<table class="cmp"><tr><th>Private colours</th><th>Public colours</th></tr>
<tr><td>mpls, metro-ethernet, private1 se private6</td><td>default, biz-internet, public-internet, lte, 3g, blue, green, red, gold, silver, bronze, custom1 se custom3</td></tr>
<tr><td>Do private colours ke beech tunnel peer ke <b>private</b> (pre-NAT) address par banta hai</td><td>Agar kisi bhi taraf public colour ho, tunnel peer ke <b>public</b> (post-NAT) address par banta hai, jo Validator aur Controller ne seekha</td></tr></table>
<p>Kyun? MPLS jaise private transport mein NAT nahi hota: interface par jo address hai woh asli address hai, isliye edges seedha baat kar sakte hain. Internet alag hai: NAT device ke peeche wala edge bahar ko sirf apne translated address aur port se pehchana jaata hai, isliye tunnel us par banana padta hai. Validator yeh translated (public) address tab discover karta hai jab edge pehli baar connect hota hai.</p>

<h3>Restrict: colours ko alag rakhna</h3>
<p>Default mein har TLOC har remote TLOC se tunnel banane ki koshish karta hai, chahe colour kuch bhi ho. Agar MPLS cloud internet addresses tak pahunch nahi sakta, to woh koshishein bekaar jaati hain aur edge failures log kar sakta hai. Colour ke baad <code>restrict</code> keyword us TLOC ko sirf <b>same</b> colour wale peers tak limit karta hai. Lab mein MPLS TLOCs <code>color mpls restrict</code> use karte hain, isliye MPLS TLOC sirf doosre MPLS TLOCs se pair hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Restrict ke saath TLOC pairing">
<rect x="20" y="30" width="130" height="150" rx="10" fill="#bbf7d0"/><text x="85" y="52" text-anchor="middle" class="svg-ink" font-size="12">E-DEL-1</text>
<rect x="30" y="66" width="110" height="30" rx="6" fill="#fff"/><text x="85" y="86" text-anchor="middle" class="svg-ink" font-size="11">biz-internet</text>
<rect x="30" y="116" width="110" height="30" rx="6" fill="#ddd6fe"/><text x="85" y="136" text-anchor="middle" class="svg-ink" font-size="11">mpls restrict</text>
<rect x="490" y="30" width="130" height="150" rx="10" fill="#bbf7d0"/><text x="555" y="52" text-anchor="middle" class="svg-ink" font-size="12">E-MUM-1</text>
<rect x="500" y="66" width="110" height="30" rx="6" fill="#fff"/><text x="555" y="86" text-anchor="middle" class="svg-ink" font-size="11">biz-internet</text>
<rect x="500" y="116" width="110" height="30" rx="6" fill="#ddd6fe"/><text x="555" y="136" text-anchor="middle" class="svg-ink" font-size="11">mpls restrict</text>
<line x1="140" y1="81" x2="500" y2="81" stroke="#16a34a" stroke-width="3"/>
<line x1="140" y1="131" x2="500" y2="131" stroke="#16a34a" stroke-width="3"/>
<line x1="140" y1="86" x2="500" y2="126" stroke="#ef4444" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="140" y1="126" x2="500" y2="86" stroke="#ef4444" stroke-width="2" stroke-dasharray="5 4"/>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">Green: same colour, tunnel banta hai. Red dashed: cross-colour, restrict se blocked.</text>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="11">Isliye E-DEL-1 aur E-MUM-1 ke aapas mein 2 BFD sessions hain.</text>
</svg><p class="cap">MPLS colour par restrict ke saath sirf same-colour pairs tunnel banate hain.</p></div>

<h3>TLOCs ko padhna</h3>
<p><code>show sdwan omp tlocs</code> edge ko pata TLOCs list karta hai: apne aur Controller se seekhe hue.</p>
<pre class="code">E-DEL-1# show sdwan omp tlocs
ADDRESS                                                     PSEUDO              PUBLIC              PRIVATE BFD
FAMILY  TLOC IP     COLOR        ENCAP FROM PEER    STATUS  KEY    PUBLIC IP    PORT   PRIVATE IP   PORT    STATUS
-------------------------------------------------------------------------------------------------------------------
ipv4    10.255.0.11 biz-internet ipsec 0.0.0.0      C,Red,R 1      203.0.113.6  12346  203.0.113.6  12346   -
ipv4    10.255.0.11 mpls         ipsec 0.0.0.0      C,Red,R 1      172.16.1.2   12366  172.16.1.2   12366   -
ipv4    10.255.0.12 biz-internet ipsec 10.255.255.2 C,I,R   1      203.0.113.10 12346  203.0.113.10 12346   <span class="hl">up</span>
ipv4    10.255.0.12 mpls         ipsec 10.255.255.2 C,I,R   1      172.16.2.2   12366  172.16.2.2   12366   <span class="hl">up</span>
ipv4    10.255.0.13 biz-internet ipsec 10.255.255.2 C,I,R   1      203.0.113.14 12346  203.0.113.14 12346   <span class="hl">up</span></pre>
<p>Pehli do lines E-DEL-1 ke apne TLOCs hain (<code>FROM PEER 0.0.0.0</code>, status <code>Red</code> yaani redistributed); baaki Controller (10.255.255.2) ne reflect kiye. Aakhri column batata hai ki us TLOC tak BFD session up hai ya nahi. Ports dekho: IPsec tunnels 12346, 12366, 12386 aur aise hi (20 ke steps mein) use kar sakte hain, taaki ek NAT address ke peeche kai TLOCs ya devices takraayein nahi. Is lab mein har edge ka doosra TLOC 12366 dikhata hai.</p>

<h3>IOS XE edge par TLOC configure karna</h3>
<p>Do hisse chahiye: ek tunnel interface jo physical transport interface se bound ho, aur <code>sdwan</code> ke neeche ek <code>tunnel-interface</code> section jo encapsulation aur colour set kare. Physical interface par pehle se IP address aur bahar ka route hona chahiye.</p>
<pre class="code"><span class="c">! Make GigabitEthernet1 a TLOC with colour biz-internet</span>
config-transaction
interface Tunnel1
 ip unnumbered GigabitEthernet1
 tunnel source GigabitEthernet1
 tunnel mode sdwan
 exit
sdwan
 interface GigabitEthernet1
  tunnel-interface
   encapsulation ipsec
   color biz-internet
   exit
  exit
 exit
commit
end</pre>
<p>Tunnel number sirf local naam hai; aisa chuno jo pehle se use mein na ho (Tunnel2 MPLS transport ka ho sakta hai). <code>tunnel mode sdwan</code> IOS XE ko batata hai ki yeh tunnel interface SD-WAN overlay ka hai.</p>

<div class="eg"><p><b>Worked example.</b> Doosre fabric mein E-HYD-1 ke paas sirf ek MPLS TLOC hai (<code>10.255.0.14 / mpls / ipsec</code>, restricted). Upar ki configuration ke baad woh <code>10.255.0.14 / biz-internet / ipsec</code> bhi advertise karta hai. Controller naya TLOC har doosre edge ko reflect karta hai; E-DEL-1, jiska biz-internet TLOC hai, ab internet par E-HYD-1 tak doosra tunnel banata hai. E-DEL-1 ke E-HYD-1 ke saath ek BFD session se do ho jaate hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> <code>tunnel mode sdwan</code> bhool jaana; <code>commit</code> bhool jaana; transport se match na karne wala colour chunna (internet link par private colour ka matlab tunnels private address par banenge, jo reachable nahi); jis colour ko doosri sites public ki tarah use karti hain us par <code>restrict</code> lagana; system IP ko tunnel source samajhna.</p></div>

<div class="exam"><p><b>Exam traps.</b> TLOC <b>system IP + colour + encapsulation</b> hai, interface address nahi. <i>Private se private</i> private addresses use karta hai; <i>jisme public colour ho</i> woh public addresses. <code>restrict</code> matlab sirf same colour. Koi colour configure na ho to <code>default</code> (public) hi assign hota hai.</p></div>

<div class="scn"><h4>MPLS ki tarah configure hua internet link</h4><p>Ek naya store onboard hua jiske broadband link ko colour private1 mila kyunki template aise store se copy hua tha jiska private circuit tha. Control connections up aa gaye, par doosre stores tak data tunnels kabhi nahi bane: doosre edges store ke private (pre-NAT) address tak pahunchne ki koshish kar rahe the, jo ISP ke NAT ke peeche hai aur bahar se unreachable hai. Fix colour ko biz-internet karna tha, jisse peers public address use karte hain.</p><p><b>Seekh:</b> colour cosmetic nahi hai; woh tay karta hai ki peers kaunsa address target karenge.</p></div>

<div class="iv"><p class="q">"SD-WAN mein colours ka role kya hai?"</p><p>Strong answer: colours TLOCs par transports ko label karte hain. Woh private (mpls, metro-ethernet, private1 se 6) aur public (biz-internet, public-internet, lte aur doosre) mein baante hain. Colour tay karta hai ki tunnel remote ka kaunsa address use kare: private se private private (pre-NAT) address; koi bhi public colour Validator se seekha public (post-NAT) address. Restrict keyword tunnels ko same colour tak limit karta hai, aur policies path chunne ke liye colours refer karti hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>System IP device ka naam hai; site ID location ka naam; same site ID ka matlab un edges ke beech tunnel nahi.</li>
<li>TLOC system IP + colour + encapsulation hai; ek edge ka har transport par ek TLOC hota hai.</li>
<li>Colour tunnel ke liye private versus public addressing tay karta hai; restrict tunnels ko same colour tak limit karta hai.</li>
<li>TLOCs aur unka BFD status padhne ke liye <code>show sdwan omp tlocs</code> use karo.</li>
<li>TLOC jodne ke liye: tunnel mode sdwan wala Tunnel interface, plus sdwan ke neeche encapsulation aur colour ke saath tunnel-interface, phir commit.</li>
</ul></div>
`}};export{e as default};