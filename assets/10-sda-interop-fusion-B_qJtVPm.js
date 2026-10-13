var e={id:`sda-interop`,h:{en:`SD-Access meets the traditional campus: borders, fusion routers and transits`,hi:`SD-Access aur traditional campus: borders, fusion routers aur transits`},body:{en:`
<p>A new gated community still has to connect to the old town. Its main gate (the <b>border</b>) has separate lanes for residents of each block (virtual networks). Just outside there is a <b>roundabout</b> (the <b>fusion router</b>) where the lanes meet the town's shared services: the hospital, the post office, the water board. And for a while, some families live half in the new block and half in an old house next door, connected by a temporary bridge (the <b>Layer 2 handoff</b>). Blueprint item 1.5b is exactly this: how an SD-Access fabric interoperates with the traditional campus.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Border, fusion router and shared services">
<rect x="10" y="100" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="85" y="125" text-anchor="middle" class="svg-ink" font-size="13">SD-Access fabric</text><text x="85" y="145" text-anchor="middle" class="svg-muted" font-size="12">VNs CLINICAL, CORP</text>
<rect x="200" y="100" width="110" height="60" rx="8" fill="#fde68a"/><text x="255" y="125" text-anchor="middle" class="svg-ink" font-size="13">Border</text><text x="255" y="145" text-anchor="middle" class="svg-muted" font-size="12">AS 65001</text>
<rect x="360" y="100" width="120" height="60" rx="8" fill="#fed7aa"/><text x="420" y="125" text-anchor="middle" class="svg-ink" font-size="13">Fusion router</text><text x="420" y="145" text-anchor="middle" class="svg-muted" font-size="12">AS 65002</text>
<rect x="520" y="30" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="575" y="55" text-anchor="middle" class="svg-ink" font-size="12">Shared services</text><text x="575" y="75" text-anchor="middle" class="svg-muted" font-size="11">DHCP DNS ISE</text>
<rect x="520" y="170" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="575" y="195" text-anchor="middle" class="svg-ink" font-size="12">Traditional</text><text x="575" y="215" text-anchor="middle" class="svg-muted" font-size="11">campus / WAN</text>
<line x1="160" y1="130" x2="200" y2="130" stroke="#64748b"/>
<line x1="310" y1="120" x2="360" y2="120" stroke="#64748b"/><line x1="310" y1="140" x2="360" y2="140" stroke="#64748b"/>
<text x="335" y="95" text-anchor="middle" class="svg-accent" font-size="11">VRF-lite + eBGP per VN</text>
<line x1="480" y1="115" x2="520" y2="65" stroke="#64748b"/><line x1="480" y1="145" x2="520" y2="195" stroke="#64748b"/>
<text x="420" y="190" text-anchor="middle" class="svg-muted" font-size="11">route leaking</text>
</svg><p class="cap">The border hands each VN out on its own subinterface; the fusion router leaks routes between VNs and shared services.</p></div>

<h3>The border handoff (IP-based)</h3>
<p>A VN is a VRF, and a VRF has to stay a VRF when it leaves the fabric. The usual handoff is <b>VRF-lite</b>: one 802.1Q subinterface (or SVI) per VN between the border and the next device, with an <b>eBGP</b> session in each VRF. Catalyst Center automates the border side when you configure an IP transit; the peer side is configured by you. The border advertises the fabric's pools outwards and learns external routes, which it registers into the control plane (internal border) or treats as the default exit (external border).</p>

<h3>The fusion router</h3>
<p>Endpoints in VN CLINICAL still need DHCP, DNS, ISE and often the WLC, which usually live in a <b>shared services</b> network in the global table or their own VRF. VRFs are isolated by design, so something must <b>leak</b> routes between them in a controlled way. That device, outside the fabric, is the <b>fusion router</b> (a router, L3 switch or firewall). It peers with the border per VN and uses route-target import/export (or route maps) to leak just the needed prefixes.</p>
<pre class="code"><span class="c">! Fusion router: leak between VN CLINICAL and SHARED services</span>
vrf definition CLINICAL
 rd 65002:10
 address-family ipv4
  route-target export 65002:10
  route-target import 65002:10
  route-target import 65002:99
vrf definition SHARED
 rd 65002:99
 address-family ipv4
  route-target export 65002:99
  route-target import 65002:99
  route-target import 65002:10
interface GigabitEthernet1/0/1.3001
 encapsulation dot1Q 3001
 vrf forwarding CLINICAL
 ip address 172.31.0.2 255.255.255.252
router bgp 65002
 address-family ipv4 vrf CLINICAL
  neighbor 172.31.0.1 remote-as 65001
  neighbor 172.31.0.1 activate</pre>
<pre class="out">Fusion# show ip route vrf SHARED | include 10.40
<span class="hl">B        10.40.0.0/16 [20/0] via 172.31.0.1 (CLINICAL), 00:12:44</span></pre>
<p>The SHARED VRF now reaches the CLINICAL pool through the CLINICAL subinterface, and CLINICAL learns the DHCP/DNS subnet in return. When the fusion device is a firewall, it can also inspect traffic between VNs.</p>

<h3>Layer 2 handoff: living with the old network</h3>
<p>During migration a subnet may have users both in the fabric and on old switches. A <b>Layer 2 border handoff</b> bridges a fabric Layer 2 segment to a traditional VLAN on a trunk, so both halves share one subnet. The gateway must exist in only one place: the fabric's anycast gateway, with the old SVI shut down. It is a migration tool, not a permanent design, because it brings back a Layer 2 domain.</p>

<h3>Keeping group policy outside the fabric</h3>
<p>Traditional devices do not read VXLAN-GPO. SGTs can still reach them by <b>inline tagging</b> on the handoff links (if the next device supports it) or by <b>SXP</b>, which lets ISE or the border tell firewalls and legacy switches which IP belongs to which SGT, so they can enforce group policy too.</p>

<h3>Connecting sites: transits</h3>
<table class="cmp"><tr><th>Transit</th><th>How VNs and SGTs cross</th><th>When</th></tr>
<tr><td>IP-based transit</td><td>VRF-lite + BGP across any IP WAN; SGT via SXP or inline tagging</td><td>Traditional WAN, MPLS, internet with a separate VPN</td></tr>
<tr><td>SD-Access transit</td><td>VXLAN end to end with transit control plane nodes; VN and SGT preserved natively</td><td>Metro fibre or campus with high MTU between sites</td></tr>
<tr><td>SD-WAN transit</td><td>Catalyst SD-WAN carries each VN as a service VPN and the SGT inline in its tunnels</td><td>Many sites over internet/MPLS, joint SD-WAN + SD-Access design</td></tr></table>

<div class="eg"><p><b>Worked example: migration choice.</b> A university has a 10-year-old campus. Plan A (<b>parallel</b>): install new fabric-capable switches beside the old ones, connect them through a border and fusion router, and move users building by building, with a temporary Layer 2 handoff for the one subnet that spans two buildings. Plan B (<b>incremental</b>): convert existing switches in place, possible only if they support fabric roles. Most teams choose parallel because it gives a clean rollback.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting the fusion router, so fabric clients never get DHCP addresses (DHCP server unreachable from the VN). Leaking every route between every VRF, which destroys segmentation. Leaving the old SVI up during a Layer 2 handoff, creating two gateways for one subnet.</p></div>

<div class="exam"><p><b>Exam traps.</b> Fusion routers are <b>outside</b> the fabric and do inter-VRF route leaking to shared services. Border handoff is usually VRF-lite with BGP per VN. Layer 2 handoff is for migration. SXP propagates IP-to-SGT bindings to non-fabric devices.</p></div>

<div class="scn"><h4>Laptops with 169.254 addresses</h4><p>On the first day of a new SD-Access floor, every wired laptop showed a self-assigned 169.254 address. Authentication had worked and the edge showed the right VN. The DHCP server was in the SHARED VRF behind the fusion router, but the fusion router only imported CLINICAL routes into SHARED, not the reverse, so DHCP offers could not route back to the relay address on the edge anycast gateway. Adding the missing route-target import fixed addressing for the whole floor.</p><p><b>Lesson:</b> route leaking must work in both directions. DHCP is usually the first thing that tells you it does not.</p></div>

<div class="iv"><p class="q">"What is a fusion router and why does SD-Access need one?"</p><p>Strong answer: virtual networks are VRFs and isolated; endpoints still need shared services such as DHCP, DNS, ISE and WLC that live outside the fabric. The fusion router, outside the fabric, peers with the border per VN via VRF-lite and BGP and selectively leaks routes between the VNs and the shared-services VRF (route-target import/export or route maps), optionally with a firewall inspecting inter-VN traffic. Mention Layer 2 handoff and SXP as other interop tools.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Border handoff: one subinterface and one eBGP session per VN (VRF-lite).</li>
<li>Fusion router: outside the fabric, leaks routes between VNs and shared services.</li>
<li>Layer 2 handoff bridges a fabric subnet to a legacy VLAN during migration.</li>
<li>SGTs leave the fabric via inline tagging or SXP.</li>
<li>Transits: IP-based, SD-Access, or SD-WAN; migration: parallel or incremental.</li>
</ul></div>
`,hi:`
<p>Ek nayi gated community ko purane sheher se phir bhi judna padta hai. Uske main gate (<b>border</b>) par har block ke residents (virtual networks) ke liye alag lanes hain. Thoda bahar ek <b>chauraha</b> (<b>fusion router</b>) hai jahan lanes sheher ki shared services se milti hain: hospital, post office, water board. Aur kuch samay ke liye, kuch parivaar aadhe naye block mein aur aadhe bagal ke purane ghar mein rehte hain, ek temporary pul (<b>Layer 2 handoff</b>) se jude. Blueprint item 1.5b bilkul yahi hai: SD-Access fabric traditional campus ke saath kaise interoperate karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Border, fusion router aur shared services">
<rect x="10" y="100" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="85" y="125" text-anchor="middle" class="svg-ink" font-size="13">SD-Access fabric</text><text x="85" y="145" text-anchor="middle" class="svg-muted" font-size="12">VNs CLINICAL, CORP</text>
<rect x="200" y="100" width="110" height="60" rx="8" fill="#fde68a"/><text x="255" y="125" text-anchor="middle" class="svg-ink" font-size="13">Border</text><text x="255" y="145" text-anchor="middle" class="svg-muted" font-size="12">AS 65001</text>
<rect x="360" y="100" width="120" height="60" rx="8" fill="#fed7aa"/><text x="420" y="125" text-anchor="middle" class="svg-ink" font-size="13">Fusion router</text><text x="420" y="145" text-anchor="middle" class="svg-muted" font-size="12">AS 65002</text>
<rect x="520" y="30" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="575" y="55" text-anchor="middle" class="svg-ink" font-size="12">Shared services</text><text x="575" y="75" text-anchor="middle" class="svg-muted" font-size="11">DHCP DNS ISE</text>
<rect x="520" y="170" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="575" y="195" text-anchor="middle" class="svg-ink" font-size="12">Traditional</text><text x="575" y="215" text-anchor="middle" class="svg-muted" font-size="11">campus / WAN</text>
<line x1="160" y1="130" x2="200" y2="130" stroke="#64748b"/>
<line x1="310" y1="120" x2="360" y2="120" stroke="#64748b"/><line x1="310" y1="140" x2="360" y2="140" stroke="#64748b"/>
<text x="335" y="95" text-anchor="middle" class="svg-accent" font-size="11">har VN ka VRF-lite + eBGP</text>
<line x1="480" y1="115" x2="520" y2="65" stroke="#64748b"/><line x1="480" y1="145" x2="520" y2="195" stroke="#64748b"/>
<text x="420" y="190" text-anchor="middle" class="svg-muted" font-size="11">route leaking</text>
</svg><p class="cap">Border har VN ko apne subinterface par bahar deta hai; fusion router VNs aur shared services ke beech routes leak karta hai.</p></div>

<h3>Border handoff (IP-based)</h3>
<p>VN ek VRF hai, aur VRF ko fabric se bahar jaate waqt bhi VRF hi rehna padta hai. Aam handoff <b>VRF-lite</b> hai: border aur agle device ke beech har VN ka ek 802.1Q subinterface (ya SVI), har VRF mein ek <b>eBGP</b> session ke saath. Jab aap IP transit configure karte ho to Catalyst Center border side automate karta hai; peer side aap khud configure karte ho. Border fabric ke pools bahar advertise karta hai aur external routes seekhta hai, jinhe woh control plane mein register karta hai (internal border) ya default exit ki tarah treat karta hai (external border).</p>

<h3>Fusion router</h3>
<p>VN CLINICAL ke endpoints ko phir bhi DHCP, DNS, ISE aur aksar WLC chahiye, jo aam taur par global table ya apne VRF mein <b>shared services</b> network mein rehte hain. VRFs design se isolated hain, isliye kisi ko unke beech controlled tareeke se routes <b>leak</b> karne padte hain. Fabric ke bahar woh device <b>fusion router</b> hai (router, L3 switch ya firewall). Yeh har VN ke liye border se peer karta hai aur route-target import/export (ya route maps) se sirf zaroori prefixes leak karta hai.</p>
<pre class="code"><span class="c">! Fusion router: VN CLINICAL aur SHARED services ke beech leak</span>
vrf definition CLINICAL
 rd 65002:10
 address-family ipv4
  route-target export 65002:10
  route-target import 65002:10
  route-target import 65002:99
vrf definition SHARED
 rd 65002:99
 address-family ipv4
  route-target export 65002:99
  route-target import 65002:99
  route-target import 65002:10
interface GigabitEthernet1/0/1.3001
 encapsulation dot1Q 3001
 vrf forwarding CLINICAL
 ip address 172.31.0.2 255.255.255.252
router bgp 65002
 address-family ipv4 vrf CLINICAL
  neighbor 172.31.0.1 remote-as 65001
  neighbor 172.31.0.1 activate</pre>
<pre class="out">Fusion# show ip route vrf SHARED | include 10.40
<span class="hl">B        10.40.0.0/16 [20/0] via 172.31.0.1 (CLINICAL), 00:12:44</span></pre>
<p>SHARED VRF ab CLINICAL subinterface ke through CLINICAL pool tak pahunchta hai, aur badle mein CLINICAL DHCP/DNS subnet seekhta hai. Jab fusion device firewall ho, to woh VNs ke beech traffic inspect bhi kar sakta hai.</p>

<h3>Layer 2 handoff: purane network ke saath rehna</h3>
<p>Migration ke dauraan ek subnet ke users fabric mein bhi aur purane switches par bhi ho sakte hain. <b>Layer 2 border handoff</b> fabric ke Layer 2 segment ko trunk par traditional VLAN se bridge karta hai, taaki dono hisse ek subnet share karein. Gateway sirf ek jagah hona chahiye: fabric ka anycast gateway, purana SVI shut down. Yeh migration tool hai, permanent design nahi, kyunki yeh Layer 2 domain wapas le aata hai.</p>

<h3>Fabric ke bahar group policy rakhna</h3>
<p>Traditional devices VXLAN-GPO nahi padhte. SGTs phir bhi unhe <b>inline tagging</b> se handoff links par (agar agla device support kare) ya <b>SXP</b> se mil sakte hain, jisse ISE ya border firewalls aur legacy switches ko batata hai ki kaunsa IP kis SGT ka hai, taaki woh bhi group policy enforce kar sakein.</p>

<h3>Sites jodna: transits</h3>
<table class="cmp"><tr><th>Transit</th><th>VNs aur SGTs kaise paar jaate hain</th><th>Kab</th></tr>
<tr><td>IP-based transit</td><td>Kisi bhi IP WAN par VRF-lite + BGP; SGT SXP ya inline tagging se</td><td>Traditional WAN, MPLS, alag VPN wala internet</td></tr>
<tr><td>SD-Access transit</td><td>Transit control plane nodes ke saath end to end VXLAN; VN aur SGT natively bache rehte hain</td><td>Sites ke beech high MTU wala metro fibre ya campus</td></tr>
<tr><td>SD-WAN transit</td><td>Catalyst SD-WAN har VN ko service VPN ki tarah aur SGT ko apne tunnels mein inline le jaata hai</td><td>Internet/MPLS par kai sites, joint SD-WAN + SD-Access design</td></tr></table>

<div class="eg"><p><b>Worked example: migration ka chunaav.</b> Ek university ka 10 saal purana campus hai. Plan A (<b>parallel</b>): purane switches ke bagal mein naye fabric-capable switches lagao, unhe border aur fusion router se jodo, aur users ko building by building move karo, us ek subnet ke liye temporary Layer 2 handoff ke saath jo do buildings mein faila hai. Plan B (<b>incremental</b>): maujooda switches ko wahi convert karo, sirf tab possible jab woh fabric roles support karte hon. Zyada tar teams parallel chunti hain kyunki usme saaf rollback milta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Fusion router bhoolna, jisse fabric clients ko kabhi DHCP address nahi milta (VN se DHCP server unreachable). Har VRF ke beech har route leak kar dena, jo segmentation khatam kar deta hai. Layer 2 handoff ke dauraan purana SVI up chhod dena, jisse ek subnet ke do gateways ban jaate hain.</p></div>

<div class="exam"><p><b>Exam traps.</b> Fusion routers fabric ke <b>bahar</b> hote hain aur shared services tak inter-VRF route leaking karte hain. Border handoff aksar har VN ke liye BGP ke saath VRF-lite hota hai. Layer 2 handoff migration ke liye hai. SXP non-fabric devices tak IP-to-SGT bindings propagate karta hai.</p></div>

<div class="scn"><h4>169.254 addresses wale laptops</h4><p>Naye SD-Access floor ke pehle din har wired laptop self-assigned 169.254 address dikha raha tha. Authentication chal gaya tha aur edge sahi VN dikha raha tha. DHCP server fusion router ke peeche SHARED VRF mein tha, lekin fusion router sirf CLINICAL routes ko SHARED mein import kar raha tha, ulta nahi, isliye DHCP offers edge anycast gateway ke relay address tak wapas route nahi ho paate the. Missing route-target import jodne se poore floor ki addressing theek ho gayi.</p><p><b>Seekh:</b> route leaking dono directions mein kaam karni chahiye. Aksar DHCP hi sabse pehle batata hai ki aisa nahi hai.</p></div>

<div class="iv"><p class="q">"Fusion router kya hai aur SD-Access ko iski zaroorat kyun hai?"</p><p>Strong answer: virtual networks VRFs hain aur isolated hain; endpoints ko phir bhi DHCP, DNS, ISE aur WLC jaisi shared services chahiye jo fabric ke bahar rehti hain. Fusion router, fabric ke bahar, har VN ke liye VRF-lite aur BGP se border se peer karta hai aur VNs aur shared-services VRF ke beech selectively routes leak karta hai (route-target import/export ya route maps), optionally firewall inter-VN traffic inspect karta hai. Doosre interop tools ke roop mein Layer 2 handoff aur SXP ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Border handoff: har VN ka ek subinterface aur ek eBGP session (VRF-lite).</li>
<li>Fusion router: fabric ke bahar, VNs aur shared services ke beech routes leak karta hai.</li>
<li>Layer 2 handoff migration ke dauraan fabric subnet ko legacy VLAN se bridge karta hai.</li>
<li>SGTs inline tagging ya SXP se fabric ke bahar jaate hain.</li>
<li>Transits: IP-based, SD-Access, ya SD-WAN; migration: parallel ya incremental.</li>
</ul></div>
`}};export{e as default};