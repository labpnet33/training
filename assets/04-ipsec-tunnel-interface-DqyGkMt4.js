var e={id:`ipsec-tunnel-interface`,h:{en:`The tunnel interface: ip, remote-ip, exchange-interface-ip and add-route`,hi:`Tunnel interface: ip, remote-ip, exchange-interface-ip aur add-route`},body:{en:`
<p>The moment a phase 1 exists, FortiOS creates a <b>tunnel interface</b> with the same name (KR-ADVPN on the hub, TO-HQ on a spoke). It is a real interface: it can have an address, appear in routes, and be used in firewall policies. How you address it decides whether routing over the overlay works. This chapter prepares tasks 2 and 3 of <b>n7-ipsec-hub</b>.</p>

<h3>Three ways to address a tunnel</h3>
<ol>
<li><b>Unnumbered</b> (no ip). The tunnel carries traffic but has no address. Routes must be static with the tunnel as the exit interface. Simple, but a routing protocol has no next-hop address to talk to.</li>
<li><b>ip + remote-ip (point to point)</b>: the local tunnel address and the address of the far end. Useful for BGP/OSPF between two units.</li>
<li><b>Overlay subnet with a /32 ip and a wide remote-ip</b> (our design): each unit takes a /32 from 10.255.1.0/24 and sets <code>remote-ip</code> with the subnet mask. This is the hub-and-spoke pattern for ADVPN.</li>
</ol>
<pre class="code"><span class="c">! Hub HQ-FGT</span>
config system interface
    edit "KR-ADVPN"
        set ip 10.255.1.1 255.255.255.255
        set remote-ip 10.255.1.254 255.255.255.0
    next
end
<span class="c">! Spoke TRY-FGT</span>
config system interface
    edit "TO-HQ"
        set ip 10.255.1.3 255.255.255.255
        set remote-ip 10.255.1.1 255.255.255.0
    next
end</pre>

<h3>What remote-ip with a mask does</h3>
<p>The <code>remote-ip</code> value with a netmask tells FortiOS that the whole network 10.255.1.0/24 is reachable through this tunnel, and installs a route for it: a <b>connected</b> route (code C). On a spoke, <code>remote-ip 10.255.1.1/24</code> gives the route to the whole overlay, which makes the hub tunnel address 10.255.1.1 the neighbour for BGP. On the hub, <code>remote-ip 10.255.1.254/24</code> is a dummy far-end inside the same /24, because the hub has many peers, not one.</p>
<div class="dia"><svg viewBox="0 0 660 230" role="img" aria-label="Overlay addressing">
<rect x="250" y="20" width="160" height="70" rx="10" fill="#bae6fd"/><text x="330" y="45" text-anchor="middle" class="svg-ink" font-size="14">HQ-FGT KR-ADVPN</text><text x="330" y="68" text-anchor="middle" class="svg-muted" font-size="12">ip 10.255.1.1/32</text>
<rect x="30" y="140" width="170" height="70" rx="10" fill="#ddd6fe"/><text x="115" y="165" text-anchor="middle" class="svg-ink" font-size="14">MDU-FGT TO-HQ</text><text x="115" y="188" text-anchor="middle" class="svg-muted" font-size="12">ip 10.255.1.2/32</text>
<rect x="460" y="140" width="170" height="70" rx="10" fill="#ddd6fe"/><text x="545" y="165" text-anchor="middle" class="svg-ink" font-size="14">TRY-FGT TO-HQ</text><text x="545" y="188" text-anchor="middle" class="svg-muted" font-size="12">ip 10.255.1.3/32</text>
<line x1="270" y1="90" x2="140" y2="140" stroke="#22c55e" stroke-width="3"/><line x1="390" y1="90" x2="520" y2="140" stroke="#22c55e" stroke-width="3"/>
<text x="330" y="125" text-anchor="middle" class="svg-muted" font-size="12">overlay 10.255.1.0/24</text>
</svg><p class="cap">Every unit has a /32 inside one overlay subnet; remote-ip with a mask routes the whole subnet into the tunnel.</p></div>

<h3>exchange-interface-ip and add-route</h3>
<p>Two phase 1 options remove manual work:</p>
<ul>
<li><b>exchange-interface-ip enable</b> (on both ends): after IKE completes each peer tells the other the IP of its tunnel interface. The hub then knows that instance KR-ADVPN_1 belongs to 10.255.1.2.</li>
<li><b>add-route enable</b> (hub, the default on dynamic templates): the hub installs a <b>/32 route to that tunnel IP</b>, administrative distance 15, via the instance. Without it the hub would not know which dial-up tunnel leads to which spoke.</li>
</ul>
<pre class="out">HQ-FGT # get router info routing-table all
<span class="hl">S       10.255.1.2/32 [15/0] via KR-ADVPN tunnel 203.0.113.11</span>
<span class="hl">S       10.255.1.3/32 [15/0] via KR-ADVPN tunnel 203.0.113.12</span>
C       10.255.1.0/24 is directly connected, KR-ADVPN
C       10.10.0.0/24 is directly connected, port2</pre>
<p>Distance 15 is higher than the default static distance 10, so a manual static route to the same prefix would win; the automatic routes are a safe default that you can override on purpose. When the spoke goes away the routes disappear with the instance.</p>

<h3>Policies for the tunnel</h3>
<p>The tunnel interface is a normal firewall zone member. For a spoke you need LAN to tunnel and tunnel to LAN (LAN-TO-HQ, HQ-TO-LAN). On the hub you need SPOKES-TO-LAN and LAN-TO-SPOKES, using the template name KR-ADVPN, which covers all instances. A policy that names the template is also the reason the hub starts answering IKE; chapter 1 explained that rule.</p>
<div class="warn"><p><b>Common mistake.</b> Pinging the hub tunnel address from a spoke and concluding the tunnel is broken. By default the tunnel interface does not answer ICMP. Add <code>set allowaccess ping</code> on it for testing. BGP works regardless.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>remote-ip</code> is not the peer's gateway (that is <code>remote-gw</code> in phase 1). It is the far-end overlay address, and with a mask it adds a connected-style route for the subnet.</p></div>

<div class="scn"><h4>Overlay plan before the roll-out</h4><p>The Kaveri network team had to open fifteen more branches. They reserved 10.255.1.0/24 for the first batch, gave each spoke a /32 matching its number (.2, .3 ...), and kept .254 for the hub far-end. When the plan grew they moved to 10.255.0.0/22 without touching crypto. The overlay plan lived in a spreadsheet next to the BGP router-IDs, which equal the tunnel IPs.</p><p><b>Lesson:</b> plan the overlay like any address space, before the first tunnel.</p></div>

<div class="iv"><p class="q">"What do exchange-interface-ip and add-route do?"</p><p>exchange-interface-ip lets both peers learn each other's tunnel interface address after IKE; add-route lets the hub install a /32 route (distance 15) to each spoke's tunnel address through the right dial-up instance. Together they let BGP and ADVPN find spokes without static routes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A phase 1 creates a tunnel interface that you address, route and put in policies.</li>
<li>Our pattern: /32 ip per unit, remote-ip with the overlay mask.</li>
<li>remote-ip with a mask installs a connected route for the subnet.</li>
<li>exchange-interface-ip + add-route give the hub /32 routes with distance 15.</li>
<li>Allow ping on the tunnel interface if you want to test the overlay with ICMP.</li>
</ul></div>
`,hi:`
<p>Phase 1 banate hi FortiOS usi naam ka ek <b>tunnel interface</b> bana deta hai (hub par KR-ADVPN, spoke par TO-HQ). Yeh asli interface hai: ispar address ho sakta hai, yeh routes mein dikhta hai, aur firewall policies mein use hota hai. Aap ise kaise address karte ho, wahi tay karta hai ki overlay par routing chalegi ya nahi. Yeh chapter <b>n7-ipsec-hub</b> ke tasks 2 aur 3 ki taiyari karata hai.</p>

<h3>Tunnel ko address karne ke teen tareeke</h3>
<ol>
<li><b>Unnumbered</b> (ip nahi). Tunnel traffic le jata hai par uska koi address nahi. Routes static hone chahiye aur exit interface tunnel. Simple, par routing protocol ke paas baat karne ke liye next-hop address nahi hota.</li>
<li><b>ip + remote-ip (point to point)</b>: local tunnel address aur far end ka address. Do units ke beech BGP/OSPF ke liye kaam ka.</li>
<li><b>/32 ip aur wide remote-ip ke saath overlay subnet</b> (hamara design): har unit 10.255.1.0/24 se ek /32 leta hai aur <code>remote-ip</code> netmask ke saath set karta hai. ADVPN ke liye hub-and-spoke pattern yahi hai.</li>
</ol>
<pre class="code"><span class="c">! Hub HQ-FGT</span>
config system interface
    edit "KR-ADVPN"
        set ip 10.255.1.1 255.255.255.255
        set remote-ip 10.255.1.254 255.255.255.0
    next
end
<span class="c">! Spoke TRY-FGT</span>
config system interface
    edit "TO-HQ"
        set ip 10.255.1.3 255.255.255.255
        set remote-ip 10.255.1.1 255.255.255.0
    next
end</pre>

<h3>Mask ke saath remote-ip kya karta hai</h3>
<p>Netmask wala <code>remote-ip</code> FortiOS ko batata hai ki poora network 10.255.1.0/24 is tunnel se reachable hai, aur uska route install karta hai: ek <b>connected</b> route (code C). Spoke par <code>remote-ip 10.255.1.1/24</code> poore overlay ka route deta hai, jisse hub tunnel address 10.255.1.1 BGP ka neighbour ban jata hai. Hub par <code>remote-ip 10.255.1.254/24</code> usi /24 ke andar ek dummy far-end hai, kyunki hub ke kai peers hain, ek nahi.</p>
<div class="dia"><svg viewBox="0 0 660 230" role="img" aria-label="Overlay addressing">
<rect x="250" y="20" width="160" height="70" rx="10" fill="#bae6fd"/><text x="330" y="45" text-anchor="middle" class="svg-ink" font-size="14">HQ-FGT KR-ADVPN</text><text x="330" y="68" text-anchor="middle" class="svg-muted" font-size="12">ip 10.255.1.1/32</text>
<rect x="30" y="140" width="170" height="70" rx="10" fill="#ddd6fe"/><text x="115" y="165" text-anchor="middle" class="svg-ink" font-size="14">MDU-FGT TO-HQ</text><text x="115" y="188" text-anchor="middle" class="svg-muted" font-size="12">ip 10.255.1.2/32</text>
<rect x="460" y="140" width="170" height="70" rx="10" fill="#ddd6fe"/><text x="545" y="165" text-anchor="middle" class="svg-ink" font-size="14">TRY-FGT TO-HQ</text><text x="545" y="188" text-anchor="middle" class="svg-muted" font-size="12">ip 10.255.1.3/32</text>
<line x1="270" y1="90" x2="140" y2="140" stroke="#22c55e" stroke-width="3"/><line x1="390" y1="90" x2="520" y2="140" stroke="#22c55e" stroke-width="3"/>
<text x="330" y="125" text-anchor="middle" class="svg-muted" font-size="12">overlay 10.255.1.0/24</text>
</svg><p class="cap">Har unit ke paas ek overlay subnet ke andar /32 hai; mask wala remote-ip poore subnet ko tunnel mein route karta hai.</p></div>

<h3>exchange-interface-ip aur add-route</h3>
<p>Phase 1 ke do options manual kaam hata dete hain:</p>
<ul>
<li><b>exchange-interface-ip enable</b> (dono ends par): IKE poora hone ke baad har peer doosre ko apne tunnel interface ka IP batata hai. Hub ko tab pata chalta hai ki instance KR-ADVPN_1 10.255.1.2 ka hai.</li>
<li><b>add-route enable</b> (hub, dynamic templates par default): hub us tunnel IP ka <b>/32 route</b> install karta hai, administrative distance 15, us instance se. Iske bina hub ko pata nahi chalta ki kaunsa dial-up tunnel kaunse spoke tak jata hai.</li>
</ul>
<pre class="out">HQ-FGT # get router info routing-table all
<span class="hl">S       10.255.1.2/32 [15/0] via KR-ADVPN tunnel 203.0.113.11</span>
<span class="hl">S       10.255.1.3/32 [15/0] via KR-ADVPN tunnel 203.0.113.12</span>
C       10.255.1.0/24 is directly connected, KR-ADVPN
C       10.10.0.0/24 is directly connected, port2</pre>
<p>Distance 15, default static distance 10 se zyada hai, isliye same prefix ka manual static route jeet jayega; automatic routes ek safe default hain jise aap jaan-boojh kar override kar sakte ho. Spoke jane par routes instance ke saath chale jaate hain.</p>

<h3>Tunnel ki policies</h3>
<p>Tunnel interface normal firewall zone member hai. Spoke ke liye LAN se tunnel aur tunnel se LAN chahiye (LAN-TO-HQ, HQ-TO-LAN). Hub par SPOKES-TO-LAN aur LAN-TO-SPOKES template naam KR-ADVPN se chahiye, jo saare instances cover karta hai. Template ka naam rakhne wali policy hi hub ko IKE ka jawab dene ke layak banati hai; chapter 1 ne yeh rule bataya tha.</p>
<div class="warn"><p><b>Common mistake.</b> Spoke se hub tunnel address ko ping karke maan lena ki tunnel kharab hai. Default mein tunnel interface ICMP ka jawab nahi deta. Test ke liye ispar <code>set allowaccess ping</code> lagao. BGP phir bhi chalta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>remote-ip</code> peer ka gateway nahi hai (woh phase 1 ka <code>remote-gw</code> hai). Yeh far-end overlay address hai, aur mask ke saath subnet ka connected-style route jodta hai.</p></div>

<div class="scn"><h4>Roll-out se pehle overlay plan</h4><p>Kaveri network team ko pandrah branches aur kholni thi. Unhone pehle batch ke liye 10.255.1.0/24 reserve kiya, har spoke ko uske number ka /32 diya (.2, .3 ...), aur .254 hub far-end ke liye rakha. Plan badhne par crypto chhue bina 10.255.0.0/22 par chale gaye. Overlay plan ek spreadsheet mein BGP router-IDs ke saath rakha tha, jo tunnel IPs ke barabar hain.</p><p><b>Lesson:</b> overlay ko bhi kisi address space ki tarah plan karo, pehle tunnel se pehle.</p></div>

<div class="iv"><p class="q">"exchange-interface-ip aur add-route kya karte hain?"</p><p>exchange-interface-ip se IKE ke baad dono peers ek-dusre ke tunnel interface address seekh lete hain; add-route se hub har spoke ke tunnel address ka /32 route (distance 15) sahi dial-up instance se install karta hai. Dono milkar BGP aur ADVPN ko static routes ke bina spokes dhundhne dete hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Phase 1 ek tunnel interface banata hai jise aap address, route aur policy dete ho.</li>
<li>Hamara pattern: har unit ka /32 ip, overlay mask ke saath remote-ip.</li>
<li>Mask wala remote-ip subnet ka connected route install karta hai.</li>
<li>exchange-interface-ip + add-route hub ko distance 15 ke /32 routes dete hain.</li>
<li>Overlay ko ICMP se test karna ho to tunnel interface par ping allow karo.</li>
</ul></div>
`}};export{e as default};