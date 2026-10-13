var e={id:`edge-ha`,h:{en:`High availability: two edges per site, VRRP, OMP and hubs`,hi:`High availability: ek site par do edges, VRRP, OMP aur hubs`},body:{en:`
<p>A bank branch with one cashier counter loses business when the cashier is ill. A branch with two counters carries on. High availability (HA) in a WAN is the same idea, and it can be built at several levels. The cheapest level is two <b>circuits</b> on one router, which protects you when an ISP fails. The next level is two <b>edges</b> in the site, which protects you when a router fails, is being upgraded, or loses power.</p>

<h3>Level 1: two circuits on one edge</h3>
<p>E-DEL-1 already has this: biz-internet and mpls. If the MPLS circuit dies, BFD declares the mpls tunnels down after about 7 seconds (7 missed hellos of 1 second) and the edge keeps using biz-internet. No change on the LAN. This does not help if the router itself fails.</p>

<h3>Level 2: two edges at one site</h3>
<p>For important sites such as the data center and large branches you install two WAN edges. Two rules matter:</p>
<ul>
<li>Both edges use the <b>same site ID</b> (for example 100) and <b>different system IPs</b>. Edges with the same site ID never build tunnels to each other, so the two routers do not waste tunnels talking to each other. The site ID tells the fabric "these routers belong to one location".</li>
<li>Both edges advertise the same LAN prefixes to the Controller. Remote sites then see <b>two paths</b> to 10.1.10.0/24, one through each edge, and can use both (active-active) or prefer one (active-standby).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Two edges at one site">
<rect x="230" y="10" width="180" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">INET + MPLS (underlay)</text>
<rect x="60" y="100" width="180" height="60" rx="8" fill="#bae6fd"/><text x="150" y="125" text-anchor="middle" class="svg-ink" font-size="13">E-DEL-1  (site 100)</text><text x="150" y="145" text-anchor="middle" class="svg-muted" font-size="12">sys 10.255.0.11  LAN .2</text>
<rect x="400" y="100" width="180" height="60" rx="8" fill="#bae6fd"/><text x="490" y="125" text-anchor="middle" class="svg-ink" font-size="13">E-DEL-2  (site 100)</text><text x="490" y="145" text-anchor="middle" class="svg-muted" font-size="12">sys 10.255.0.15  LAN .3</text>
<rect x="230" y="200" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="222" text-anchor="middle" class="svg-ink" font-size="13">LAN switch  VPN 10</text><text x="320" y="240" text-anchor="middle" class="svg-muted" font-size="12">gateway VRRP 10.1.10.1</text>
<line x1="270" y1="60" x2="170" y2="100" stroke="#64748b" stroke-width="2"/><line x1="370" y1="60" x2="470" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="170" y1="160" x2="270" y2="200" stroke="#64748b" stroke-width="2"/><line x1="470" y1="160" x2="370" y2="200" stroke="#64748b" stroke-width="2"/>
<text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">no tunnel between</text><text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="12">same-site edges</text>
</svg><p class="cap">Two edges, one site ID, one virtual gateway. Both reach the same WAN and the same LAN.</p></div>

<h3>The LAN side: VRRP or routing</h3>
<p>Hosts need a default gateway that survives the loss of one edge. Two common designs:</p>
<ul>
<li><b>VRRP</b> on the service VPN. Both edges share a virtual IP (10.1.10.1). The master answers ARP and forwards; if it fails, the backup takes over. In the Manager's VPN interface template you can also <b>track OMP</b> or a prefix list so that an edge that lost its overlay gives up the master role instead of black-holing traffic.</li>
<li><b>Routing</b> to a LAN core or distribution switch with OSPF, BGP or EIGRP. Both edges peer with the switch, and the switch load-shares or prefers one. This is typical for data centers, where the LAN is a routed core.</li>
</ul>
<pre class="code"><span class="c">! E-DEL-1: VRRP master for VPN 10 (VRRPv3 syntax as on IOS XE)</span>
interface GigabitEthernet3
 vrf forwarding 10
 ip address 10.1.10.2 255.255.255.0
 vrrp 10 address-family ipv4
  address 10.1.10.1 primary
  priority 110
  exit
<span class="c">! E-DEL-2 uses ip address 10.1.10.3 and the default priority 100</span></pre>

<h3>Active-active or active-standby across the WAN</h3>
<p>By default the Controller gives remote sites <b>both</b> paths and they use equal-cost multipathing over the two edges. That is active-active and is often what you want. To prefer one edge you influence the OMP attributes: raise the <b>OMP preference</b> or the <b>TLOC preference</b> of the primary edge (tunnel-interface setting), or apply a control policy at the Controller (the next module). Keep the LAN return path matched: if VRRP master is E-DEL-1 but remote sites prefer E-DEL-2, traffic takes an extra hop across the LAN. Align VRRP priority, routing metrics and OMP preference.</p>
<table class="cmp"><tr><th>Failure</th><th>What happens</th><th>Typical recovery</th></tr>
<tr><td>One circuit fails</td><td>BFD for that TLOC goes down, the other circuit carries traffic</td><td>about 7 seconds with default BFD</td></tr>
<tr><td>One edge fails</td><td>Controller withdraws its routes, VRRP backup becomes master</td><td>VRRP timers plus OMP convergence</td></tr>
<tr><td>Controllers unreachable</td><td>Existing tunnels and routes stay (OMP graceful restart, default 12 hours)</td><td>No data-plane impact; no new changes</td></tr></table>

<h3>Data center and regional hubs</h3>
<p>A <b>hub</b> is an edge that many spokes connect to. A data center hub terminates several circuits, usually two edges (for example E-DEL-1 and E-DEL-2), has a routed LAN toward the data center core, and advertises the data center prefixes or a summary. A <b>regional hub</b> does the same for an area. Hubs need fixed public addresses (or static NAT), higher-capacity platforms (Catalyst 8500) and conservative BFD timers. In Multi-Region Fabric, regional hubs become border routers that connect access regions to the core region; the exam only expects the idea at this stage.</p>

<h3>Verification</h3>
<pre class="out">E-MUM-1# show sdwan omp routes vpn 10 10.1.10.0/24
VPN PREFIX       FROM PEER    ID   LABEL STATUS  TYPE      TLOC IP     COLOR        ENCAP PREFERENCE
10  10.1.10.0/24 10.255.255.2 1    1012  C,I,R   installed <span class="hl">10.255.0.11</span> biz-internet ipsec -
10  10.1.10.0/24 10.255.255.2 2    1012  C,I,R   installed <span class="hl">10.255.0.15</span> biz-internet ipsec -

E-DEL-1# show vrrp brief
Interface          Grp  Pri Time  Own Pre State   Master addr/Group addr
Gi3                10   110       Y         Master  10.1.10.2   10.1.10.1</pre>

<div class="warn"><p><b>Common mistakes.</b> Giving the two edges different site IDs (they then try to tunnel to each other and look like two sites); giving them the same system IP; not tracking OMP in VRRP so that a router with a dead WAN stays master; and mismatched primary choices that make traffic cross the LAN.</p></div>
<div class="exam"><p><b>Exam trap.</b> Same site ID means no tunnels between those edges. Dual-edge sites rely on VRRP or routing on the LAN, and OMP preference or policy to choose the primary path.</p></div>

<div class="scn"><h4>The router upgrade that nobody noticed</h4><p>Bharat Retail's Delhi data center runs E-DEL-1 and E-DEL-2 with VRRP and equal OMP preference. During a Saturday-night software upgrade, E-DEL-1 reloaded. The Controller withdrew its routes, remote sites kept using E-DEL-2, and VRRP moved the LAN gateway in about three seconds. The only complaint was one dropped video call. Before the change they had tested by shutting the primary's WAN interface and watching that the backup became master because VRRP tracked OMP.</p><p><b>Lesson:</b> design for failure of the router, test it, and keep VRRP, routing and OMP preference aligned.</p></div>

<div class="iv"><p class="q">"How do you build a highly available site with two WAN edges?"</p><p>Strong answer: same site ID, different system IPs, each edge with its own circuits. On the LAN use VRRP (with OMP tracking) or routing with the core. Both advertise the prefixes over OMP, so remote sites see two paths. Use OMP or TLOC preference or a control policy to choose active-standby, and align return traffic. Mention BFD failure detection and graceful restart.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HA levels: two circuits protect from ISP failure; two edges protect from router failure.</li>
<li>Same site ID, unique system IPs; same-site edges do not tunnel to each other.</li>
<li>LAN gateway redundancy uses VRRP (track OMP) or routing to a core.</li>
<li>Both edges advertise the prefix; remote sites get two paths and choose by preference or policy.</li>
<li>Hubs terminate many circuits and need fixed public addresses and strong platforms.</li>
</ul></div>
`,hi:`
<p>Ek bank branch jismein ek hi cashier counter hai, cashier bimar hone par business kho deti hai. Do counters wali branch chalti rehti hai. WAN mein high availability (HA) yahi idea hai, aur ise kai levels par banaya ja sakta hai. Sabse sasta level ek router par do <b>circuits</b> hain, jo ISP fail hone par bachata hai. Agla level site mein do <b>edges</b> hain, jo router fail hone, upgrade hone ya power jaane par bachata hai.</p>

<h3>Level 1: ek edge par do circuits</h3>
<p>E-DEL-1 ke paas yeh pehle se hai: biz-internet aur mpls. Agar MPLS circuit mar jaaye, to BFD lagbhag 7 seconds baad (1 second ke 7 missed hellos) mpls tunnels ko down declare karta hai aur edge biz-internet use karta rehta hai. LAN par koi change nahi. Agar router khud fail ho jaye to yeh madad nahi karta.</p>

<h3>Level 2: ek site par do edges</h3>
<p>Data center aur bade branches jaisi important sites ke liye aap do WAN edges lagate ho. Do rules matter karte hain:</p>
<ul>
<li>Dono edges <b>same site ID</b> (jaise 100) aur <b>alag system IPs</b> use karte hain. Same site ID wale edges ek dusre tak kabhi tunnel nahi banate, isliye do routers aapas mein baat karne mein tunnels waste nahi karte. Site ID fabric ko batata hai "yeh routers ek hi location ke hain".</li>
<li>Dono edges same LAN prefixes Controller ko advertise karte hain. Remote sites 10.1.10.0/24 tak <b>do paths</b> dekhte hain, har edge se ek, aur dono use kar sakte hain (active-active) ya ek ko prefer kar sakte hain (active-standby).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Ek site par do edges">
<rect x="230" y="10" width="180" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">INET + MPLS (underlay)</text>
<rect x="60" y="100" width="180" height="60" rx="8" fill="#bae6fd"/><text x="150" y="125" text-anchor="middle" class="svg-ink" font-size="13">E-DEL-1  (site 100)</text><text x="150" y="145" text-anchor="middle" class="svg-muted" font-size="12">sys 10.255.0.11  LAN .2</text>
<rect x="400" y="100" width="180" height="60" rx="8" fill="#bae6fd"/><text x="490" y="125" text-anchor="middle" class="svg-ink" font-size="13">E-DEL-2  (site 100)</text><text x="490" y="145" text-anchor="middle" class="svg-muted" font-size="12">sys 10.255.0.15  LAN .3</text>
<rect x="230" y="200" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="222" text-anchor="middle" class="svg-ink" font-size="13">LAN switch  VPN 10</text><text x="320" y="240" text-anchor="middle" class="svg-muted" font-size="12">gateway VRRP 10.1.10.1</text>
<line x1="270" y1="60" x2="170" y2="100" stroke="#64748b" stroke-width="2"/><line x1="370" y1="60" x2="470" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="170" y1="160" x2="270" y2="200" stroke="#64748b" stroke-width="2"/><line x1="470" y1="160" x2="370" y2="200" stroke="#64748b" stroke-width="2"/>
<text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">same-site edges ke</text><text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="12">beech tunnel nahi</text>
</svg><p class="cap">Do edges, ek site ID, ek virtual gateway. Dono same WAN aur same LAN tak pahunchte hain.</p></div>

<h3>LAN side: VRRP ya routing</h3>
<p>Hosts ko aisa default gateway chahiye jo ek edge ke jaane par bhi bacha rahe. Do common designs:</p>
<ul>
<li>Service VPN par <b>VRRP</b>. Dono edges ek virtual IP (10.1.10.1) share karte hain. Master ARP ka jawab deta hai aur forward karta hai; woh fail ho to backup sambhal leta hai. Manager ke VPN interface template mein aap <b>OMP track</b> ya prefix list bhi track kar sakte ho, taaki jis edge ka overlay chala gaya woh master role chhod de aur traffic black-hole na kare.</li>
<li>LAN core ya distribution switch ke saath OSPF, BGP ya EIGRP se <b>routing</b>. Dono edges switch se peer karte hain, aur switch load-share karta hai ya ek ko prefer karta hai. Data centers mein yeh typical hai, jahan LAN ek routed core hota hai.</li>
</ul>
<pre class="code"><span class="c">! E-DEL-1: VPN 10 ke liye VRRP master (IOS XE jaisa VRRPv3 syntax)</span>
interface GigabitEthernet3
 vrf forwarding 10
 ip address 10.1.10.2 255.255.255.0
 vrrp 10 address-family ipv4
  address 10.1.10.1 primary
  priority 110
  exit
<span class="c">! E-DEL-2 ip address 10.1.10.3 aur default priority 100 use karta hai</span></pre>

<h3>WAN par active-active ya active-standby</h3>
<p>Default mein Controller remote sites ko <b>dono</b> paths deta hai aur woh do edges par equal-cost multipathing use karte hain. Yeh active-active hai aur aksar yahi chahiye hota hai. Ek edge ko prefer karne ke liye aap OMP attributes ko influence karte ho: primary edge ka <b>OMP preference</b> ya <b>TLOC preference</b> (tunnel-interface setting) badhao, ya Controller par control policy lagao (agla module). LAN return path match rakho: agar VRRP master E-DEL-1 hai lekin remote sites E-DEL-2 prefer karte hain, to traffic LAN ke across ek extra hop leta hai. VRRP priority, routing metrics aur OMP preference ko align rakho.</p>
<table class="cmp"><tr><th>Failure</th><th>Kya hota hai</th><th>Typical recovery</th></tr>
<tr><td>Ek circuit fail</td><td>Us TLOC ka BFD down, doosra circuit traffic le jaata hai</td><td>default BFD ke saath lagbhag 7 seconds</td></tr>
<tr><td>Ek edge fail</td><td>Controller uske routes withdraw karta hai, VRRP backup master ban jaata hai</td><td>VRRP timers plus OMP convergence</td></tr>
<tr><td>Controllers unreachable</td><td>Existing tunnels aur routes bane rehte hain (OMP graceful restart, default 12 ghante)</td><td>Data-plane par asar nahi; naye changes nahi</td></tr></table>

<h3>Data center aur regional hubs</h3>
<p><b>Hub</b> woh edge hai jisse bahut saare spokes connect hote hain. Data center hub kai circuits terminate karta hai, aam taur par do edges (jaise E-DEL-1 aur E-DEL-2), data center core ki taraf routed LAN rakhta hai, aur data center prefixes ya summary advertise karta hai. <b>Regional hub</b> kisi area ke liye wahi karta hai. Hubs ko fixed public addresses (ya static NAT), zyada capacity wale platforms (Catalyst 8500) aur conservative BFD timers chahiye. Multi-Region Fabric mein regional hubs border routers ban jaate hain jo access regions ko core region se jodte hain; exam abhi sirf idea expect karta hai.</p>

<h3>Verification</h3>
<pre class="out">E-MUM-1# show sdwan omp routes vpn 10 10.1.10.0/24
VPN PREFIX       FROM PEER    ID   LABEL STATUS  TYPE      TLOC IP     COLOR        ENCAP PREFERENCE
10  10.1.10.0/24 10.255.255.2 1    1012  C,I,R   installed <span class="hl">10.255.0.11</span> biz-internet ipsec -
10  10.1.10.0/24 10.255.255.2 2    1012  C,I,R   installed <span class="hl">10.255.0.15</span> biz-internet ipsec -

E-DEL-1# show vrrp brief
Interface          Grp  Pri Time  Own Pre State   Master addr/Group addr
Gi3                10   110       Y         Master  10.1.10.2   10.1.10.1</pre>

<div class="warn"><p><b>Common mistakes.</b> Dono edges ko alag site IDs dena (tab woh ek dusre se tunnel banane ki koshish karte hain aur do sites jaise dikhte hain); dono ko same system IP dena; VRRP mein OMP track na karna jisse dead WAN wala router master bana rehta hai; aur mismatched primary choices jinse traffic LAN cross karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Same site ID ka matlab un edges ke beech tunnels nahi. Dual-edge sites LAN par VRRP ya routing par, aur primary path chunne ke liye OMP preference ya policy par depend karte hain.</p></div>

<div class="scn"><h4>Router upgrade jo kisi ko pata nahi chala</h4><p>Bharat Retail ka Delhi data center VRRP aur equal OMP preference ke saath E-DEL-1 aur E-DEL-2 chalata hai. Saturday raat ke software upgrade mein E-DEL-1 reload hua. Controller ne uske routes withdraw kiye, remote sites E-DEL-2 use karte rahe, aur VRRP ne LAN gateway lagbhag teen seconds mein move kar diya. Sirf ek video call drop hone ki shikayat aayi. Change se pehle unhone primary ka WAN interface shutdown karke test kiya tha aur dekha tha ki backup master ban gaya kyunki VRRP OMP track karta tha.</p><p><b>Seekh:</b> router ke fail hone ke liye design karo, test karo, aur VRRP, routing aur OMP preference ko align rakho.</p></div>

<div class="iv"><p class="q">"Do WAN edges ke saath highly available site kaise banate ho?"</p><p>Strong answer: same site ID, alag system IPs, har edge ke apne circuits. LAN par VRRP (OMP tracking ke saath) ya core ke saath routing. Dono OMP par prefixes advertise karte hain, isliye remote sites do paths dekhte hain. Active-standby ke liye OMP ya TLOC preference ya control policy use karo, aur return traffic align karo. BFD failure detection aur graceful restart batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HA levels: do circuits ISP failure se bachate hain; do edges router failure se.</li>
<li>Same site ID, unique system IPs; same-site edges ek dusre se tunnel nahi banate.</li>
<li>LAN gateway redundancy VRRP (OMP track) ya core ke saath routing se hoti hai.</li>
<li>Dono edges prefix advertise karte hain; remote sites do paths pate hain aur preference ya policy se chunte hain.</li>
<li>Hubs kai circuits terminate karte hain aur fixed public addresses aur strong platforms chahiye.</li>
</ul></div>
`}};export{e as default};