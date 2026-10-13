var e={id:`tloc-color-tunnel`,h:{en:`TLOCs, colors and tunnel interfaces`,hi:`TLOCs, colors aur tunnel interfaces`},body:{en:`
<p>Imagine a large office building with two entrances: a front gate on the main road and a back gate on a private lane. Visitors can use either, and you give each gate a name on the map: "main-road gate" and "private-lane gate". In SD-WAN each WAN circuit of an edge is such a gate. The map entry that tells other sites how to reach that gate is called a <b>TLOC</b>, short for <b>Transport Locator</b>.</p>

<h3>What a TLOC is</h3>
<p>A TLOC is identified by three values: the <b>system IP</b> of the edge, a <b>color</b> and an <b>encapsulation</b> (IPsec or GRE). It is an address of a transport attachment, not an interface IP. E-DEL-1 has two circuits, so it has two TLOCs:</p>
<pre class="out">E-DEL-1 TLOC 1:  10.255.0.11 + biz-internet + ipsec   (Gi1, 203.0.113.6)
E-DEL-1 TLOC 2:  10.255.0.11 + mpls         + ipsec   (Gi2, 172.16.1.2)</pre>
<p>Each edge tells the Controller about its TLOCs, together with the real IP and UDP port behind each one. The Controller reflects them to every other edge. A route from E-BLR-1 to 10.1.10.0/24 will then point at "TLOC 10.255.0.11 biz-internet ipsec", and the sending edge looks up how to reach that TLOC. This extra level of indirection is why the overlay does not care what the underlay IP addresses are.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="TLOCs and colors">
<rect x="20" y="30" width="170" height="150" rx="10" fill="#f1f5f9" stroke="#64748b"/><text x="105" y="52" text-anchor="middle" class="svg-ink" font-size="13">E-DEL-1</text><text x="105" y="70" text-anchor="middle" class="svg-muted" font-size="12">system IP 10.255.0.11</text>
<rect x="35" y="85" width="140" height="35" rx="6" fill="#bae6fd"/><text x="105" y="107" text-anchor="middle" class="svg-ink" font-size="12">Gi1 biz-internet (public)</text>
<rect x="35" y="130" width="140" height="35" rx="6" fill="#ddd6fe"/><text x="105" y="152" text-anchor="middle" class="svg-ink" font-size="12">Gi2 mpls (private)</text>
<rect x="260" y="30" width="120" height="60" rx="30" fill="#bae6fd"/><text x="320" y="65" text-anchor="middle" class="svg-ink" font-size="13">INET</text>
<rect x="260" y="120" width="120" height="60" rx="30" fill="#ddd6fe"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="13">MPLS</text>
<rect x="450" y="30" width="170" height="150" rx="10" fill="#f1f5f9" stroke="#64748b"/><text x="535" y="52" text-anchor="middle" class="svg-ink" font-size="13">E-MUM-1</text><text x="535" y="70" text-anchor="middle" class="svg-muted" font-size="12">system IP 10.255.0.12</text>
<rect x="465" y="85" width="140" height="35" rx="6" fill="#bae6fd"/><text x="535" y="107" text-anchor="middle" class="svg-ink" font-size="12">Gi1 biz-internet</text>
<rect x="465" y="130" width="140" height="35" rx="6" fill="#ddd6fe"/><text x="535" y="152" text-anchor="middle" class="svg-ink" font-size="12">Gi2 mpls</text>
<line x1="175" y1="102" x2="260" y2="60" stroke="#64748b" stroke-width="2"/><line x1="380" y1="60" x2="465" y2="102" stroke="#64748b" stroke-width="2"/>
<line x1="175" y1="147" x2="260" y2="150" stroke="#64748b" stroke-width="2"/><line x1="380" y1="150" x2="465" y2="147" stroke="#64748b" stroke-width="2"/>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">Same color pairs build tunnels: biz-internet to biz-internet, mpls to mpls</text>
</svg><p class="cap">Each circuit is one TLOC. Colors tell the fabric which circuits belong to which kind of transport.</p></div>

<h3>Colors</h3>
<p>A <b>color</b> is a label for the type of WAN circuit. It matters for two reasons: policy (you can say "prefer mpls") and addressing (it decides whether private or public addresses are used).</p>
<table class="cmp"><tr><th>Type</th><th>Colors</th><th>Behaviour</th></tr>
<tr><td>Private</td><td>metro-ethernet, mpls, private1 to private6</td><td>Assumed to have no NAT. Two private-color TLOCs connect using their <b>private</b> IP addresses.</td></tr>
<tr><td>Public</td><td>3g, biz-internet, blue, bronze, custom1 to custom3, default, gold, green, lte, public-internet, red, silver</td><td>May sit behind NAT. Tunnels to a public color use the <b>public</b> (NAT-translated) address learned by STUN.</td></tr></table>
<p>The default color is <code>default</code>. Pick colors that describe the transport, then keep them consistent across all sites. Two edges with identical circuit types but different color names will not form the tunnels you expect.</p>

<h3>The tunnel interface and its options</h3>
<p>On an IOS XE edge two things work together. First, an interface called <b>Tunnel</b>n with <code>tunnel mode sdwan</code>, bound to the WAN interface through <code>tunnel source</code>. Second, a <b>tunnel-interface</b> block inside the <code>sdwan</code> section of the same WAN interface, where the SD-WAN transport settings live. A second circuit repeats the pattern:</p>
<pre class="code">interface Tunnel2
 ip unnumbered GigabitEthernet2
 tunnel source GigabitEthernet2
 tunnel mode sdwan
 exit
sdwan
 interface GigabitEthernet2
  tunnel-interface
   encapsulation ipsec
   <span class="hl">color mpls restrict</span>
   allow-service icmp
   exit
  exit</pre>
<p>The most important options under <code>tunnel-interface</code>:</p>
<ul>
<li><b>encapsulation</b>: <code>ipsec</code> (the default and the normal choice) or <code>gre</code>. Two TLOCs must use the same encapsulation to build a tunnel.</li>
<li><b>color</b> and <b>restrict</b>: <code>restrict</code> means this TLOC builds tunnels only to TLOCs of the <b>same color</b>. Without it, a TLOC will try tunnels to all colors. A restricted MPLS circuit never tries to reach the internet circuits of other sites, which also keeps probes off the wrong network.</li>
<li><b>carrier</b>: a label for the provider network (carrier1 to carrier8 or default). It helps decide which private TLOCs can reach each other over a private path.</li>
<li><b>bind</b>: ties a loopback tunnel interface to a physical interface, used in loopback TLOC designs. Check the exact syntax on your release.</li>
<li><b>allow-service</b>: the services that the edge answers on the WAN side: DHCP, DNS, ICMP, NTP, SSH, NETCONF, STUN and others. Only a few are allowed by default. Open only what you need. <code>allow-service all</code> is for labs, not for production.</li>
<li><b>max-control-connections</b>: how many Controllers this TLOC connects to. <b>hello-interval</b> and <b>hello-tolerance</b> tune the keepalives of the control connection (BFD is tuned separately, per color, in chapter 6).</li>
</ul>

<h3>Verification</h3>
<pre class="out">E-DEL-1# show sdwan omp tlocs
ADDRESS                                                     PSEUDO              PUBLIC              PRIVATE BFD
FAMILY  TLOC IP     COLOR        ENCAP FROM PEER    STATUS  KEY    PUBLIC IP    PORT   PRIVATE IP   PORT    STATUS
-------------------------------------------------------------------------------------------------------------------
ipv4    10.255.0.11 <span class="hl">biz-internet ipsec</span> 0.0.0.0      C,Red,R 1      203.0.113.6  12346  203.0.113.6  12346   -
ipv4    10.255.0.11 <span class="hl">mpls         ipsec</span> 0.0.0.0      C,Red,R 1      172.16.1.2   12366  172.16.1.2   12366   -
ipv4    10.255.0.12 biz-internet ipsec 10.255.255.2 C,I,R   1      203.0.113.10 12346  203.0.113.10 12346   up
ipv4    10.255.0.12 mpls         ipsec 10.255.255.2 C,I,R   1      172.16.2.2   12366  172.16.2.2   12366   up</pre>
<p>Read it as: every TLOC is a row. The first two are our own (from peer 0.0.0.0), the next two came from the Controller (10.255.255.2). The public and private columns are equal because no NAT sits in the path.</p>

<h3>TLOC extension and circuit termination</h3>
<p>Some sites have two routers, but not every router has every circuit. Router A terminates the MPLS circuit and router B terminates the internet circuit. A <b>TLOC extension</b> is a link between the two routers that lets one router use the other's WAN circuit, so both routers can present both colors without extra cabling to the ISPs. The extended circuit is visible as a TLOC of the router that sends traffic through it. You configure this in the Manager's tunnel interface template or with the extension option on the interface. At the data center and regional hubs you terminate several circuits on each hub edge, which is why those edges show many TLOCs.</p>

<div class="warn"><p><b>Common mistakes.</b> Naming the same kind of circuit differently on different sites (for example <code>biz-internet</code> on one edge and <code>public-internet</code> on the other); forgetting <code>tunnel mode sdwan</code> or the Tunnel interface; using <code>restrict</code> on every circuit and then wondering why internet and MPLS do not talk; and leaving <code>allow-service all</code> in production.</p></div>
<div class="exam"><p><b>Exam trap.</b> A TLOC is system IP plus color plus encapsulation, not an IP address of an interface. <code>restrict</code> limits tunnels to the same color. Private colors use private IPs; public colors use public IPs.</p></div>

<div class="eg"><p><b>Worked example.</b> E-DEL-1 has 2 TLOCs, E-MUM-1 has 2, E-BLR-1 has 1 (only biz-internet). With <code>mpls restrict</code>, E-DEL-1 can build 1 biz-internet tunnel to MUM, 1 mpls tunnel to MUM and 1 biz-internet tunnel to BLR, so 3 tunnels. BLR has no mpls TLOC, so there is no mpls tunnel to it.</p></div>

<div class="scn"><h4>MPLS tunnel missing between Delhi and Mumbai</h4><p>After the Mumbai circuit was upgraded, the MPLS BFD session to Delhi was gone while internet still worked. <code>show sdwan omp tlocs</code> showed that E-MUM-1 had advertised its second TLOC with color <code>private1</code> instead of <code>mpls</code>. Both are private colors, but with <code>restrict</code> they only connect to the same color. The engineer changed the color back to <code>mpls</code> and the session came up.</p><p><b>Lesson:</b> colors must match across sites for restricted TLOCs.</p></div>

<div class="iv"><p class="q">"What is a TLOC and what does the restrict keyword do?"</p><p>Strong answer: a TLOC is a transport locator made of system IP, color and encapsulation, advertised over OMP so other edges know how to reach that circuit. <code>restrict</code> on a color tells the edge to bring up tunnels only to TLOCs of the same color. Mention private versus public colors and that tunnels to public colors use the NAT-translated address.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A TLOC is system IP + color + encapsulation; one per WAN circuit and encapsulation.</li>
<li>Private colors use private IPs; public colors use public (NAT-translated) IPs.</li>
<li><code>restrict</code> means tunnels only between TLOCs of the same color.</li>
<li>On IOS XE you need the Tunnel interface and the <code>tunnel-interface</code> block under <code>sdwan</code>.</li>
<li>Restrict <code>allow-service</code> to what the WAN side really needs.</li>
</ul></div>
`,hi:`
<p>Ek bade office building ki kalpana karo jismein do entrances hain: main road par front gate aur private lane par back gate. Visitors dono mein se koi bhi use kar sakte hain, aur aap map par har gate ko ek naam dete ho: "main-road gate" aur "private-lane gate". SD-WAN mein edge ka har WAN circuit aisa ek gate hai. Map ki woh entry jo doosri sites ko batati hai ki us gate tak kaise pahunchna hai, <b>TLOC</b> kehlati hai, yaani <b>Transport Locator</b>.</p>

<h3>TLOC kya hai</h3>
<p>TLOC teen values se pehchana jaata hai: edge ka <b>system IP</b>, ek <b>color</b> aur ek <b>encapsulation</b> (IPsec ya GRE). Yeh transport attachment ka address hai, interface IP nahi. E-DEL-1 ke do circuits hain, isliye uske do TLOCs hain:</p>
<pre class="out">E-DEL-1 TLOC 1:  10.255.0.11 + biz-internet + ipsec   (Gi1, 203.0.113.6)
E-DEL-1 TLOC 2:  10.255.0.11 + mpls         + ipsec   (Gi2, 172.16.1.2)</pre>
<p>Har edge apne TLOCs Controller ko batata hai, saath mein har TLOC ke peeche ka asli IP aur UDP port. Controller unhe baaki har edge ko reflect karta hai. E-BLR-1 se 10.1.10.0/24 ka route phir "TLOC 10.255.0.11 biz-internet ipsec" ki taraf point karega, aur bhejne wala edge dekhta hai ki us TLOC tak kaise pahunchna hai. Is extra indirection ki wajah se overlay ko underlay IP addresses se matlab nahi hota.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="TLOCs aur colors">
<rect x="20" y="30" width="170" height="150" rx="10" fill="#f1f5f9" stroke="#64748b"/><text x="105" y="52" text-anchor="middle" class="svg-ink" font-size="13">E-DEL-1</text><text x="105" y="70" text-anchor="middle" class="svg-muted" font-size="12">system IP 10.255.0.11</text>
<rect x="35" y="85" width="140" height="35" rx="6" fill="#bae6fd"/><text x="105" y="107" text-anchor="middle" class="svg-ink" font-size="12">Gi1 biz-internet (public)</text>
<rect x="35" y="130" width="140" height="35" rx="6" fill="#ddd6fe"/><text x="105" y="152" text-anchor="middle" class="svg-ink" font-size="12">Gi2 mpls (private)</text>
<rect x="260" y="30" width="120" height="60" rx="30" fill="#bae6fd"/><text x="320" y="65" text-anchor="middle" class="svg-ink" font-size="13">INET</text>
<rect x="260" y="120" width="120" height="60" rx="30" fill="#ddd6fe"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="13">MPLS</text>
<rect x="450" y="30" width="170" height="150" rx="10" fill="#f1f5f9" stroke="#64748b"/><text x="535" y="52" text-anchor="middle" class="svg-ink" font-size="13">E-MUM-1</text><text x="535" y="70" text-anchor="middle" class="svg-muted" font-size="12">system IP 10.255.0.12</text>
<rect x="465" y="85" width="140" height="35" rx="6" fill="#bae6fd"/><text x="535" y="107" text-anchor="middle" class="svg-ink" font-size="12">Gi1 biz-internet</text>
<rect x="465" y="130" width="140" height="35" rx="6" fill="#ddd6fe"/><text x="535" y="152" text-anchor="middle" class="svg-ink" font-size="12">Gi2 mpls</text>
<line x1="175" y1="102" x2="260" y2="60" stroke="#64748b" stroke-width="2"/><line x1="380" y1="60" x2="465" y2="102" stroke="#64748b" stroke-width="2"/>
<line x1="175" y1="147" x2="260" y2="150" stroke="#64748b" stroke-width="2"/><line x1="380" y1="150" x2="465" y2="147" stroke="#64748b" stroke-width="2"/>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">Same color pairs tunnel banate hain: biz-internet se biz-internet, mpls se mpls</text>
</svg><p class="cap">Har circuit ek TLOC hai. Colors fabric ko batate hain ki kaunsa circuit kis tarah ke transport ka hai.</p></div>

<h3>Colors</h3>
<p><b>Color</b> WAN circuit ke type ka label hai. Yeh do wajah se matter karta hai: policy (aap keh sakte ho "mpls prefer karo") aur addressing (yeh decide karta hai ki private ya public addresses use honge).</p>
<table class="cmp"><tr><th>Type</th><th>Colors</th><th>Behaviour</th></tr>
<tr><td>Private</td><td>metro-ethernet, mpls, private1 se private6</td><td>Maana jaata hai ki NAT nahi hai. Do private-color TLOCs apne <b>private</b> IP addresses se connect karte hain.</td></tr>
<tr><td>Public</td><td>3g, biz-internet, blue, bronze, custom1 se custom3, default, gold, green, lte, public-internet, red, silver</td><td>NAT ke peeche ho sakte hain. Public color ke tunnels <b>public</b> (NAT-translated) address use karte hain jo STUN se seekha gaya.</td></tr></table>
<p>Default color <code>default</code> hai. Aise colors chuno jo transport ko describe karein, phir saari sites par consistent rakho. Do edges ke circuit type same hon lekin color names alag hon to aapke expected tunnels nahi banenge.</p>

<h3>Tunnel interface aur uske options</h3>
<p>IOS XE edge par do cheezein saath kaam karti hain. Pehli, <code>tunnel mode sdwan</code> wala <b>Tunnel</b>n naam ka interface, jo <code>tunnel source</code> se WAN interface se bandha hota hai. Doosri, usi WAN interface ke <code>sdwan</code> section ke andar <b>tunnel-interface</b> block, jahan SD-WAN transport settings hoti hain. Doosra circuit isi pattern ko repeat karta hai:</p>
<pre class="code">interface Tunnel2
 ip unnumbered GigabitEthernet2
 tunnel source GigabitEthernet2
 tunnel mode sdwan
 exit
sdwan
 interface GigabitEthernet2
  tunnel-interface
   encapsulation ipsec
   <span class="hl">color mpls restrict</span>
   allow-service icmp
   exit
  exit</pre>
<p><code>tunnel-interface</code> ke neeche sabse zaroori options:</p>
<ul>
<li><b>encapsulation</b>: <code>ipsec</code> (default aur normal choice) ya <code>gre</code>. Tunnel banane ke liye do TLOCs ki encapsulation same honi chahiye.</li>
<li><b>color</b> aur <b>restrict</b>: <code>restrict</code> ka matlab hai ki yeh TLOC sirf <b>same color</b> ke TLOCs se tunnels banata hai. Iske bina TLOC saare colors se tunnel try karta hai. Restricted MPLS circuit kabhi doosri sites ke internet circuits tak pahunchne ki koshish nahi karta, jisse probes galat network par nahi jaate.</li>
<li><b>carrier</b>: provider network ka label (carrier1 se carrier8 ya default). Yeh decide karne mein madad karta hai ki kaunse private TLOCs private path par ek dusre tak pahunch sakte hain.</li>
<li><b>bind</b>: loopback tunnel interface ko physical interface se jodta hai, loopback TLOC designs mein use hota hai. Exact syntax apni release par check karo.</li>
<li><b>allow-service</b>: woh services jinka edge WAN side par jawab deta hai: DHCP, DNS, ICMP, NTP, SSH, NETCONF, STUN aur anya. Default mein sirf kuch allowed hote hain. Sirf zaroori wale kholo. <code>allow-service all</code> labs ke liye hai, production ke liye nahi.</li>
<li><b>max-control-connections</b>: yeh TLOC kitne Controllers se connect hota hai. <b>hello-interval</b> aur <b>hello-tolerance</b> control connection ke keepalives tune karte hain (BFD alag se, per color, chapter 6 mein tune hota hai).</li>
</ul>

<h3>Verification</h3>
<pre class="out">E-DEL-1# show sdwan omp tlocs
ADDRESS                                                     PSEUDO              PUBLIC              PRIVATE BFD
FAMILY  TLOC IP     COLOR        ENCAP FROM PEER    STATUS  KEY    PUBLIC IP    PORT   PRIVATE IP   PORT    STATUS
-------------------------------------------------------------------------------------------------------------------
ipv4    10.255.0.11 <span class="hl">biz-internet ipsec</span> 0.0.0.0      C,Red,R 1      203.0.113.6  12346  203.0.113.6  12346   -
ipv4    10.255.0.11 <span class="hl">mpls         ipsec</span> 0.0.0.0      C,Red,R 1      172.16.1.2   12366  172.16.1.2   12366   -
ipv4    10.255.0.12 biz-internet ipsec 10.255.255.2 C,I,R   1      203.0.113.10 12346  203.0.113.10 12346   up
ipv4    10.255.0.12 mpls         ipsec 10.255.255.2 C,I,R   1      172.16.2.2   12366  172.16.2.2   12366   up</pre>
<p>Aise padho: har TLOC ek row hai. Pehle do hamare apne hain (from peer 0.0.0.0), agle do Controller (10.255.255.2) se aaye. Public aur private columns barabar hain kyunki raste mein NAT nahi hai.</p>

<h3>TLOC extension aur circuit termination</h3>
<p>Kuch sites par do routers hote hain, lekin har router ke paas har circuit nahi hota. Router A MPLS circuit terminate karta hai aur router B internet circuit. <b>TLOC extension</b> dono routers ke beech ek link hai jo ek router ko doosre ka WAN circuit use karne deta hai, taaki dono routers ISPs tak extra cabling ke bina dono colors present kar sakein. Extended circuit us router ke TLOC ke roop mein dikhta hai jo uske through traffic bhejta hai. Aap yeh Manager ke tunnel interface template mein ya interface par extension option se configure karte ho. Data center aur regional hubs par har hub edge par kai circuits terminate hote hain, isliye un edges par bahut saare TLOCs dikhte hain.</p>

<div class="warn"><p><b>Common mistakes.</b> Ek hi tarah ke circuit ko alag sites par alag naam dena (jaise ek edge par <code>biz-internet</code> aur doosre par <code>public-internet</code>); <code>tunnel mode sdwan</code> ya Tunnel interface bhool jaana; har circuit par <code>restrict</code> laga dena aur phir sochna ki internet aur MPLS baat kyun nahi karte; aur production mein <code>allow-service all</code> chhod dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> TLOC system IP plus color plus encapsulation hai, interface ka IP address nahi. <code>restrict</code> tunnels ko same color tak limit karta hai. Private colors private IPs use karte hain; public colors public IPs.</p></div>

<div class="eg"><p><b>Worked example.</b> E-DEL-1 ke 2 TLOCs hain, E-MUM-1 ke 2, E-BLR-1 ka 1 (sirf biz-internet). <code>mpls restrict</code> ke saath E-DEL-1 MUM tak 1 biz-internet tunnel, MUM tak 1 mpls tunnel aur BLR tak 1 biz-internet tunnel bana sakta hai, yaani 3 tunnels. BLR ka mpls TLOC nahi hai, isliye uske liye mpls tunnel nahi hai.</p></div>

<div class="scn"><h4>Delhi aur Mumbai ke beech MPLS tunnel gayab</h4><p>Mumbai circuit upgrade hone ke baad, Delhi tak MPLS BFD session gayab ho gaya jabki internet chalta raha. <code>show sdwan omp tlocs</code> ne dikhaya ki E-MUM-1 ne apna doosra TLOC <code>mpls</code> ki jagah <code>private1</code> color ke saath advertise kiya tha. Dono private colors hain, lekin <code>restrict</code> ke saath woh sirf same color se connect hote hain. Engineer ne color wapas <code>mpls</code> kiya aur session up ho gaya.</p><p><b>Seekh:</b> restricted TLOCs ke liye colors sites ke beech match hone chahiye.</p></div>

<div class="iv"><p class="q">"TLOC kya hai aur restrict keyword kya karta hai?"</p><p>Strong answer: TLOC ek transport locator hai jo system IP, color aur encapsulation se bana hai, aur OMP par advertise hota hai taaki doosre edges ko us circuit tak pahunchna aaye. Color par <code>restrict</code> edge ko batata hai ki sirf same color ke TLOCs se tunnels banao. Private versus public colors batao aur yeh bhi ki public colors ke tunnels NAT-translated address use karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>TLOC = system IP + color + encapsulation; har WAN circuit aur encapsulation par ek.</li>
<li>Private colors private IPs use karte hain; public colors public (NAT-translated) IPs.</li>
<li><code>restrict</code> ka matlab hai sirf same color ke TLOCs ke beech tunnels.</li>
<li>IOS XE par Tunnel interface aur <code>sdwan</code> ke neeche <code>tunnel-interface</code> block dono chahiye.</li>
<li><code>allow-service</code> ko wahi rakho jo WAN side ko sach mein chahiye.</li>
</ul></div>
`}};export{e as default};