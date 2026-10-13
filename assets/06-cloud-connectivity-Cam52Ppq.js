var e={id:`cloud-connectivity`,h:{en:`Connecting to the cloud: VPN and direct connect`,hi:`Cloud se judna: VPN aur direct connect`},body:{en:`
<p>Suppose your company has two offices in the same city and needs to send documents between them every day. You could hire an armoured van that drives on the public roads: cheap, ready tomorrow, safe because the box is locked, but stuck in the same traffic as everyone else. Or you could build a private road between the two buildings: expensive and slow to build, but with no traffic jams and a predictable travel time. The armoured van is a <b>VPN over the internet</b>; the private road is a <b>direct connect</b> circuit.</p>

<h3>Option 1: site-to-site VPN over the internet</h3>
<p>A <b>site-to-site VPN</b> joins a whole network (Harbourline HQ, 10.10.0.0/16) to the VPC (10.20.0.0/16) through an encrypted <b>IPsec</b> tunnel across the public internet. On the cloud side you create a <b>VPN gateway</b> (AWS: virtual private gateway or transit gateway; Azure: VPN Gateway) and a <b>customer gateway</b> object that describes your on-premises router's public IP. The provider normally gives you <b>two tunnels</b> to two different endpoints for redundancy, and you exchange routes with <b>BGP</b> or configure static routes.</p>
<ul>
<li>Pros: quick to set up (hours), cheap, encrypted by design, uses the internet link you already have.</li>
<li>Cons: performance depends on the internet; latency and jitter vary; bandwidth per tunnel is limited to a few Gbps at most.</li>
</ul>
<p>A <b>client-to-site</b> (remote access) VPN is different: individual laptops connect with VPN client software. Chapter 9 explains why many companies now replace it with zero trust access.</p>

<h3>Option 2: direct connect (private dedicated connection)</h3>
<p><b>Direct connect</b> is a private, dedicated circuit from your network to the cloud provider that never touches the public internet. You order a port at a colocation facility where the provider is present, and a cross-connect or a telecom partner carries it to your office. AWS calls it <b>Direct Connect</b>, Azure calls it <b>ExpressRoute</b>. Routes are exchanged with BGP over a VLAN (virtual interface).</p>
<ul>
<li>Pros: predictable latency, high bandwidth (1, 10, 100 Gbps), often lower data-transfer charges for large volumes.</li>
<li>Cons: weeks to provision, monthly port and circuit costs, and it is <b>not encrypted by default</b>. Run IPsec over it or use MACsec where supported if the data must be encrypted.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="VPN and direct connect paths">
<rect x="20" y="95" width="150" height="70" rx="8" fill="#e2e8f0"/><text x="95" y="122" text-anchor="middle" class="svg-ink" font-size="14">HQ-R1</text><text x="95" y="142" text-anchor="middle" class="svg-muted" font-size="12">10.10.0.0/16</text>
<rect x="470" y="95" width="150" height="70" rx="8" fill="#bae6fd"/><text x="545" y="122" text-anchor="middle" class="svg-ink" font-size="14">VPC hl-prod</text><text x="545" y="142" text-anchor="middle" class="svg-muted" font-size="12">10.20.0.0/16</text>
<rect x="245" y="15" width="150" height="50" rx="25" fill="#fde68a"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<path d="M170 105 Q 320 60 470 105" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="320" y="92" text-anchor="middle" class="svg-accent" font-size="12">IPsec tunnels 1 and 2 (backup)</text>
<rect x="245" y="185" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="207" text-anchor="middle" class="svg-ink" font-size="13">Colocation</text><text x="320" y="224" text-anchor="middle" class="svg-muted" font-size="12">cross-connect</text>
<line x1="170" y1="155" x2="245" y2="205" stroke="#64748b" stroke-width="4"/><line x1="395" y1="205" x2="470" y2="155" stroke="#64748b" stroke-width="4"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">direct connect 1 Gbps (primary)</text>
</svg><p class="cap">Harbourline's hybrid design: a private direct connect circuit as the primary path and IPsec VPN tunnels over the internet as the backup. BGP prefers the direct path.</p></div>

<table class="cmp"><tr><th></th><th>Site-to-site VPN</th><th>Direct connect</th></tr>
<tr><td>Path</td><td>Public internet</td><td>Private circuit</td></tr>
<tr><td>Encryption</td><td>Yes, IPsec</td><td>No by default</td></tr>
<tr><td>Setup time</td><td>Hours</td><td>Weeks</td></tr>
<tr><td>Performance</td><td>Variable</td><td>Consistent, high bandwidth</td></tr>
<tr><td>Cost</td><td>Low</td><td>Higher fixed monthly cost</td></tr>
<tr><td>Typical role</td><td>Small sites, quick start, backup path</td><td>Primary path for heavy or latency-sensitive traffic</td></tr>
</table>

<div class="eg"><p><b>Worked example: is the VPN enough?</b> Harbourline copies a 2 TB nightly backup to cloud storage. Over the internet VPN it achieves about 500 Mbps: 2 TB = 16,000,000 Mb, and 16,000,000 / 500 = 32,000 seconds, almost <b>9 hours</b>, spilling into the working day. Over a 1 Gbps direct connect at 90% efficiency: 16,000,000 / 900 = about 17,800 seconds, just under <b>5 hours</b>. Meera orders direct connect as the primary path and keeps the VPN as the backup.</p></div>

<h3>Configuring the HQ side of the VPN (IOS style)</h3>
<pre class="code"><span class="c">! IKEv2 and IPsec settings must match the cloud VPN gateway</span>
crypto ikev2 proposal CLOUD-PROP
 encryption aes-cbc-256
 integrity sha256
 group 14
crypto ikev2 policy CLOUD-POL
 proposal CLOUD-PROP
crypto ikev2 keyring CLOUD-KR
 peer TUN1
  address 198.51.100.20
  pre-shared-key Harb0ur-Tun1-Key
crypto ikev2 profile CLOUD-PROF
 match identity remote address 198.51.100.20 255.255.255.255
 authentication remote pre-share
 authentication local pre-share
 keyring local CLOUD-KR
crypto ipsec transform-set CLOUD-TS esp-aes 256 esp-sha256-hmac
 mode tunnel
crypto ipsec profile CLOUD-IPSEC
 set transform-set CLOUD-TS
 set ikev2-profile CLOUD-PROF
<span class="c">! route-based VPN: a tunnel interface with inside addresses from the cloud</span>
interface Tunnel1
 ip address 169.254.10.2 255.255.255.252
 ip tcp adjust-mss 1379
 tunnel source GigabitEthernet0/0
 tunnel mode ipsec ipv4
 tunnel destination 198.51.100.20
 tunnel protection ipsec profile CLOUD-IPSEC
<span class="c">! BGP with the cloud gateway: advertise HQ, learn the VPC</span>
router bgp 65010
 neighbor 169.254.10.1 remote-as 64512
 address-family ipv4
  network 10.10.0.0 mask 255.255.0.0
  neighbor 169.254.10.1 activate</pre>
<pre class="out">HQ-R1# show crypto ikev2 sa
 IPv4 Crypto IKEv2  SA

Tunnel-id Local                 Remote                fvrf/ivrf            Status
<span class="hl">1         203.0.113.10/500      198.51.100.20/500     none/none            READY</span>
      Encr: AES-CBC, keysize: 256, PRF: SHA256, Hash: SHA256, DH Grp:14, Auth sign: PSK, Auth verify: PSK
      Life/Active Time: 86400/3721 sec

HQ-R1# show ip route bgp
<span class="hl">B        10.20.0.0/16 [20/0] via 169.254.10.1, 01:02:05</span></pre>
<p>The IKEv2 SA is READY, and the router has learned the VPC prefix 10.20.0.0/16 over the tunnel with BGP. The <code>adjust-mss</code> line lowers TCP segment size so encrypted packets fit without fragmentation.</p>

<div class="warn"><p><b>Common mistakes.</b> Configuring only one of the two tunnels, so a routine provider maintenance takes the link down. Overlapping address ranges on both sides, which no VPN can route. Assuming direct connect is encrypted. Forgetting to advertise new on-premises subnets, so they cannot reach the cloud.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Private, dedicated, consistent performance, not over the internet" = direct connect. "Encrypted over the internet, fast to deploy, low cost" = site-to-site VPN. The cloud-side objects for Network+ are the <b>VPN gateway</b> and the private link; do not confuse them with the internet gateway, which is for internet traffic.</p></div>

<div class="scn"><h4>Every night at 2 a.m. the VPN dropped</h4><p>A company had one IPsec tunnel to its VPC. Every few weeks at night the tunnel went down for a few minutes and backups failed. The provider's notices explained that tunnel endpoints are patched one at a time, which is why two tunnels are provided. The company had configured only tunnel 1. After tunnel 2 and BGP were added, maintenance events passed without anyone noticing.</p><p><b>Lesson:</b> cloud VPN redundancy only works if you build both tunnels and let a routing protocol fail over between them.</p></div>

<div class="iv"><p class="q">"How would you connect an on-premises data center to a public cloud VPC, and what are the trade-offs?"</p><p>Strong answer: two options. A site-to-site IPsec VPN from the on-premises router to the cloud VPN gateway: fast, cheap and encrypted, but performance depends on the internet; always build both tunnels and use BGP. A direct connect or ExpressRoute private circuit through a colocation partner: consistent latency and high bandwidth, but weeks to deliver, more expensive, and not encrypted unless you add IPsec or MACsec. Many designs use direct connect as primary and VPN as backup. Mention non-overlapping address plans and MSS adjustment.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Site-to-site VPN: IPsec over the internet to a cloud VPN gateway; quick, cheap, encrypted, variable performance.</li>
<li>Direct connect (AWS Direct Connect, Azure ExpressRoute): private dedicated circuit; consistent, high bandwidth, not encrypted by default.</li>
<li>Build both cloud VPN tunnels and use BGP for automatic failover.</li>
<li>A common design: direct connect primary, VPN backup.</li>
<li>Address ranges on both sides must not overlap, and MSS should be lowered for tunnel overhead.</li>
</ul></div>
`,hi:`
<p>Maan lo aapki company ke same city mein do offices hain aur unhe roz documents bhejne hain. Aap ek armoured van hire kar sakte ho jo public roads par chalti hai: sasti, kal se ready, safe kyunki box locked hai, par sabke saath same traffic mein fansi. Ya aap dono buildings ke beech private road bana sakte ho: mehngi aur banane mein time lagta hai, par koi traffic jam nahi aur travel time predictable. Armoured van <b>internet par VPN</b> hai; private road <b>direct connect</b> circuit hai.</p>

<h3>Option 1: internet par site-to-site VPN</h3>
<p><b>Site-to-site VPN</b> ek poore network (Harbourline HQ, 10.10.0.0/16) ko VPC (10.20.0.0/16) se public internet ke across encrypted <b>IPsec</b> tunnel se jodta hai. Cloud side par aap ek <b>VPN gateway</b> banate ho (AWS: virtual private gateway ya transit gateway; Azure: VPN Gateway) aur ek <b>customer gateway</b> object jo aapke on-premises router ka public IP describe karta hai. Provider aam taur par redundancy ke liye do alag endpoints tak <b>do tunnels</b> deta hai, aur aap routes <b>BGP</b> se exchange karte ho ya static routes configure karte ho.</p>
<ul>
<li>Pros: jaldi set up (ghante), sasta, design se hi encrypted, jo internet link pehle se hai wahi use karta hai.</li>
<li>Cons: performance internet par depend karti hai; latency aur jitter badalte rehte hain; har tunnel ki bandwidth zyada se zyada kuch Gbps tak limited hai.</li>
</ul>
<p><b>Client-to-site</b> (remote access) VPN alag hai: individual laptops VPN client software se connect karte hain. Chapter 9 samjhata hai ki kai companies ab ise zero trust access se kyun replace kar rahi hain.</p>

<h3>Option 2: direct connect (private dedicated connection)</h3>
<p><b>Direct connect</b> aapke network se cloud provider tak ek private, dedicated circuit hai jo kabhi public internet ko nahi chhoota. Aap ek colocation facility mein port order karte ho jahan provider present hai, aur ek cross-connect ya telecom partner use aapke office tak le jaata hai. AWS ise <b>Direct Connect</b> kehta hai, Azure <b>ExpressRoute</b>. Routes ek VLAN (virtual interface) par BGP se exchange hote hain.</p>
<ul>
<li>Pros: predictable latency, high bandwidth (1, 10, 100 Gbps), bade volumes ke liye aksar kam data-transfer charges.</li>
<li>Cons: provision hone mein hafte lagte hain, monthly port aur circuit cost, aur yeh <b>default mein encrypted nahi</b> hai. Agar data encrypt hona zaroori hai to iske upar IPsec chalao ya jahan support ho MACsec use karo.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="VPN and direct connect paths">
<rect x="20" y="95" width="150" height="70" rx="8" fill="#e2e8f0"/><text x="95" y="122" text-anchor="middle" class="svg-ink" font-size="14">HQ-R1</text><text x="95" y="142" text-anchor="middle" class="svg-muted" font-size="12">10.10.0.0/16</text>
<rect x="470" y="95" width="150" height="70" rx="8" fill="#bae6fd"/><text x="545" y="122" text-anchor="middle" class="svg-ink" font-size="14">VPC hl-prod</text><text x="545" y="142" text-anchor="middle" class="svg-muted" font-size="12">10.20.0.0/16</text>
<rect x="245" y="15" width="150" height="50" rx="25" fill="#fde68a"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<path d="M170 105 Q 320 60 470 105" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="320" y="92" text-anchor="middle" class="svg-accent" font-size="12">IPsec tunnels 1 aur 2 (backup)</text>
<rect x="245" y="185" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="207" text-anchor="middle" class="svg-ink" font-size="13">Colocation</text><text x="320" y="224" text-anchor="middle" class="svg-muted" font-size="12">cross-connect</text>
<line x1="170" y1="155" x2="245" y2="205" stroke="#64748b" stroke-width="4"/><line x1="395" y1="205" x2="470" y2="155" stroke="#64748b" stroke-width="4"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">direct connect 1 Gbps (primary)</text>
</svg><p class="cap">Harbourline ka hybrid design: primary path ki tarah private direct connect circuit aur backup ki tarah internet par IPsec VPN tunnels. BGP direct path ko prefer karta hai.</p></div>

<table class="cmp"><tr><th></th><th>Site-to-site VPN</th><th>Direct connect</th></tr>
<tr><td>Path</td><td>Public internet</td><td>Private circuit</td></tr>
<tr><td>Encryption</td><td>Haan, IPsec</td><td>Default mein nahi</td></tr>
<tr><td>Setup time</td><td>Ghante</td><td>Hafte</td></tr>
<tr><td>Performance</td><td>Badalti rehti hai</td><td>Consistent, high bandwidth</td></tr>
<tr><td>Cost</td><td>Kam</td><td>Zyada fixed monthly cost</td></tr>
<tr><td>Typical role</td><td>Chhoti sites, jaldi start, backup path</td><td>Heavy ya latency-sensitive traffic ka primary path</td></tr>
</table>

<div class="eg"><p><b>Worked example: kya VPN kaafi hai?</b> Harbourline roz raat 2 TB ka backup cloud storage mein copy karti hai. Internet VPN par yeh lagbhag 500 Mbps achieve karta hai: 2 TB = 16,000,000 Mb, aur 16,000,000 / 500 = 32,000 seconds, lagbhag <b>9 ghante</b>, jo working day mein ghus jaata hai. 90% efficiency par 1 Gbps direct connect par: 16,000,000 / 900 = lagbhag 17,800 seconds, <b>5 ghante</b> se thoda kam. Meera direct connect ko primary path ki tarah order karti hai aur VPN ko backup rakhti hai.</p></div>

<h3>VPN ka HQ side configure karna (IOS style)</h3>
<pre class="code"><span class="c">! IKEv2 aur IPsec settings cloud VPN gateway se match honi chahiye</span>
crypto ikev2 proposal CLOUD-PROP
 encryption aes-cbc-256
 integrity sha256
 group 14
crypto ikev2 policy CLOUD-POL
 proposal CLOUD-PROP
crypto ikev2 keyring CLOUD-KR
 peer TUN1
  address 198.51.100.20
  pre-shared-key Harb0ur-Tun1-Key
crypto ikev2 profile CLOUD-PROF
 match identity remote address 198.51.100.20 255.255.255.255
 authentication remote pre-share
 authentication local pre-share
 keyring local CLOUD-KR
crypto ipsec transform-set CLOUD-TS esp-aes 256 esp-sha256-hmac
 mode tunnel
crypto ipsec profile CLOUD-IPSEC
 set transform-set CLOUD-TS
 set ikev2-profile CLOUD-PROF
<span class="c">! route-based VPN: cloud se mile inside addresses wala tunnel interface</span>
interface Tunnel1
 ip address 169.254.10.2 255.255.255.252
 ip tcp adjust-mss 1379
 tunnel source GigabitEthernet0/0
 tunnel mode ipsec ipv4
 tunnel destination 198.51.100.20
 tunnel protection ipsec profile CLOUD-IPSEC
<span class="c">! cloud gateway ke saath BGP: HQ advertise karo, VPC seekho</span>
router bgp 65010
 neighbor 169.254.10.1 remote-as 64512
 address-family ipv4
  network 10.10.0.0 mask 255.255.0.0
  neighbor 169.254.10.1 activate</pre>
<pre class="out">HQ-R1# show crypto ikev2 sa
 IPv4 Crypto IKEv2  SA

Tunnel-id Local                 Remote                fvrf/ivrf            Status
<span class="hl">1         203.0.113.10/500      198.51.100.20/500     none/none            READY</span>
      Encr: AES-CBC, keysize: 256, PRF: SHA256, Hash: SHA256, DH Grp:14, Auth sign: PSK, Auth verify: PSK
      Life/Active Time: 86400/3721 sec

HQ-R1# show ip route bgp
<span class="hl">B        10.20.0.0/16 [20/0] via 169.254.10.1, 01:02:05</span></pre>
<p>IKEv2 SA READY hai, aur router ne tunnel ke upar BGP se VPC prefix 10.20.0.0/16 seekh liya hai. <code>adjust-mss</code> line TCP segment size kam karti hai taaki encrypted packets bina fragmentation ke fit ho jaayein.</p>

<div class="warn"><p><b>Common galtiyan.</b> Do mein se sirf ek tunnel configure karna, jisse provider ki routine maintenance link gira deti hai. Dono sides par overlapping address ranges, jinhe koi VPN route nahi kar sakta. Yeh maanna ki direct connect encrypted hai. Naye on-premises subnets advertise karna bhool jaana, jisse woh cloud tak nahi pahunch paate.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Private, dedicated, consistent performance, internet par nahi" = direct connect. "Internet par encrypted, jaldi deploy, kam cost" = site-to-site VPN. Network+ ke liye cloud-side objects <b>VPN gateway</b> aur private link hain; inhe internet gateway se confuse mat karo, jo internet traffic ke liye hai.</p></div>

<div class="scn"><h4>Har raat 2 baje VPN gir jaata tha</h4><p>Ek company ka apne VPC tak ek hi IPsec tunnel tha. Har kuch hafton mein raat ko tunnel kuch minute ke liye down hota aur backups fail ho jaate. Provider ke notices ne samjhaya ki tunnel endpoints ek ek karke patch hote hain, isiliye do tunnels diye jaate hain. Company ne sirf tunnel 1 configure kiya tha. Tunnel 2 aur BGP jodne ke baad, maintenance events bina kisi ke notice kiye nikal gaye.</p><p><b>Seekh:</b> cloud VPN redundancy tabhi kaam karti hai jab aap dono tunnels banao aur routing protocol ko unke beech failover karne do.</p></div>

<div class="iv"><p class="q">"On-premises data center ko public cloud VPC se kaise jodoge, aur trade-offs kya hain?"</p><p>Strong answer: do options. On-premises router se cloud VPN gateway tak site-to-site IPsec VPN: tez, sasta aur encrypted, par performance internet par depend karti hai; hamesha dono tunnels banao aur BGP use karo. Colocation partner ke through direct connect ya ExpressRoute private circuit: consistent latency aur high bandwidth, par deliver hone mein hafte, zyada mehnga, aur jab tak IPsec ya MACsec na jodo encrypted nahi. Kai designs direct connect ko primary aur VPN ko backup rakhte hain. Non-overlapping address plans aur MSS adjustment ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Site-to-site VPN: internet par cloud VPN gateway tak IPsec; jaldi, sasta, encrypted, performance badalti hai.</li>
<li>Direct connect (AWS Direct Connect, Azure ExpressRoute): private dedicated circuit; consistent, high bandwidth, default mein encrypted nahi.</li>
<li>Dono cloud VPN tunnels banao aur automatic failover ke liye BGP use karo.</li>
<li>Common design: direct connect primary, VPN backup.</li>
<li>Dono sides ki address ranges overlap nahi honi chahiye, aur tunnel overhead ke liye MSS kam karna chahiye.</li>
</ul></div>
`}};export{e as default};