var e={id:`vti`,h:{en:`Route-based VPN: a static VTI on the ASA and the router`,hi:`Route-based VPN: ASA aur router par static VTI`},body:{en:`
<p>With a crypto map, the gateway is like a postman who reads a long list of addresses: "if the letter is for these streets, put it in the secure bag". Every new street means editing the list on both sides. A <b>virtual tunnel interface (VTI)</b> works like a private pipe between two buildings: anything you drop into the pipe arrives at the other end, encrypted. You no longer edit address lists. You simply decide, with routing, which destinations are sent into the pipe.</p>

<h3>What changes with a VTI</h3>
<ul>
<li>There is a real interface (<code>Tunnel1</code>) with an IP address, a nameif and a line state. It is up when the IPsec SA is up.</li>
<li>Encryption is decided by the <b>routing table</b>: a route pointing at the tunnel means "encrypt".</li>
<li>The traffic selectors are <b>any to any</b> (0.0.0.0/0 both ways), so mirrored ACL mismatches disappear.</li>
<li>Dynamic routing (BGP, and OSPF or EIGRP on recent ASA releases) can run over the tunnel, which makes two-tunnel redundancy simple.</li>
<li>No crypto map and no crypto ACL. The IKE policy, IPsec proposal and tunnel-group are reused exactly as in chapters 3 and 4.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="VTI between ASA and router">
<rect x="20" y="70" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="80" y="95" text-anchor="middle" class="svg-ink" font-size="13">HQ LAN</text><text x="80" y="114" text-anchor="middle" class="svg-muted" font-size="12">10.30.0.0/24</text>
<rect x="170" y="60" width="130" height="80" rx="8" fill="#bae6fd"/><text x="235" y="85" text-anchor="middle" class="svg-ink" font-size="13">HQ-ASA</text><text x="235" y="105" text-anchor="middle" class="svg-muted" font-size="12">Tunnel1 vti-br</text><text x="235" y="123" text-anchor="middle" class="svg-muted" font-size="12">10.255.0.1/30</text>
<rect x="340" y="60" width="130" height="80" rx="8" fill="#bae6fd"/><text x="405" y="85" text-anchor="middle" class="svg-ink" font-size="13">BR router</text><text x="405" y="105" text-anchor="middle" class="svg-muted" font-size="12">Tunnel1</text><text x="405" y="123" text-anchor="middle" class="svg-muted" font-size="12">10.255.0.2/30</text>
<rect x="500" y="70" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="95" text-anchor="middle" class="svg-ink" font-size="13">BR LAN</text><text x="560" y="114" text-anchor="middle" class="svg-muted" font-size="12">10.40.0.0/24</text>
<line x1="140" y1="100" x2="170" y2="100" stroke="#64748b"/><line x1="470" y1="100" x2="500" y2="100" stroke="#64748b"/>
<line x1="300" y1="100" x2="340" y2="100" stroke="#7c3aed" stroke-width="4"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">route 10.40.0.0/24 via tunnel = encrypt</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">outer: 100.64.51.2 to 100.64.52.2</text>
</svg><p class="cap">The tunnel interfaces form a small /30 link; routes over it decide what is encrypted.</p></div>

<h3>ASA side (static VTI)</h3>
<pre class="code"><span class="c">! Reuse ikev2 policy 10, PROP-AES256 and tunnel-group 100.64.52.2</span>
crypto ipsec profile VTI-PROF
 set ikev2 ipsec-proposal PROP-AES256
 set pfs group14
interface Tunnel1
 nameif vti-br
 ip address 10.255.0.1 255.255.255.252
 tunnel source interface outside
 tunnel destination 100.64.52.2
 tunnel mode ipsec ipv4
 tunnel protection ipsec profile VTI-PROF
<span class="c">! Send the branch LAN into the tunnel</span>
route vti-br 10.40.0.0 255.255.255.0 10.255.0.2</pre>
<p>The <b>IPsec profile</b> replaces the crypto map entry: it names the proposal and optional PFS. The tunnel interface supplies the peer (<code>tunnel destination</code>) and the local address (<code>tunnel source interface outside</code>). Treat the VTI like any other ASA interface: it has a nameif and a security level, and an access-group on it controls what the branch may reach. NAT rules are written per interface pair, so an <code>(inside,outside)</code> PAT rule does not touch traffic routed out of <code>vti-br</code>; an exemption is only needed if you use <code>any</code> as an interface in NAT rules.</p>

<h3>Router side (IOS IKEv2 VTI)</h3>
<pre class="code">crypto ikev2 proposal PROP-1
 encryption aes-cbc-256
 integrity sha256
 group 14
crypto ikev2 policy POL-1
 proposal PROP-1
crypto ikev2 keyring KR-HQ
 peer HQ
  address 100.64.51.2
  pre-shared-key NKvpn2026
crypto ikev2 profile IKEV2-HQ
 match identity remote address 100.64.51.2 255.255.255.255
 authentication remote pre-share
 authentication local pre-share
 keyring local KR-HQ
crypto ipsec transform-set TS-BR esp-aes 256 esp-sha256-hmac
 mode tunnel
crypto ipsec profile VTI-PROF
 set transform-set TS-BR
 set pfs group14
 set ikev2-profile IKEV2-HQ
interface Tunnel1
 ip address 10.255.0.2 255.255.255.252
 tunnel source GigabitEthernet0/0
 tunnel mode ipsec ipv4
 tunnel destination 100.64.51.2
 tunnel protection ipsec profile VTI-PROF
ip route 10.30.0.0 255.255.255.0 Tunnel1</pre>

<div class="eg"><p><b>Worked example: adding a new subnet.</b> HQ adds a voice VLAN 10.31.0.0/24. With the crypto map design you would edit the crypto ACL on the ASA, the mirrored ACL on the router and the NAT exemption. With the VTI you add one route on the router: <code>ip route 10.31.0.0 255.255.255.0 Tunnel1</code>. If BGP runs over the tunnel, you add nothing at all: HQ advertises 10.31.0.0/24 and the branch learns it.</p></div>

<h3>Verification</h3>
<pre class="out">HQ-ASA# show interface Tunnel1
<span class="hl">Interface Tunnel1 "vti-br", is up, line protocol is up</span>
  Hardware is Virtual Tunnel
        Internet address is 10.255.0.1/30
        Tunnel Interface Information:
            Source interface: outside       IP address: 100.64.51.2
            Destination IP address: 100.64.52.2
            Mode: ipsec ipv4      IPsec profile: VTI-PROF

BR# show crypto ipsec sa | include ident
<span class="hl">     local  ident (addr/mask/prot/port): (0.0.0.0/0.0.0.0/0/0)</span>
<span class="hl">     remote ident (addr/mask/prot/port): (0.0.0.0/0.0.0.0/0/0)</span></pre>
<p>The line protocol follows the IPsec SA. The any-to-any idents confirm a route-based tunnel. Then <code>show route vti-br</code> on the ASA and <code>show ip route 10.30.0.0</code> on the router must point into the tunnel.</p>

<div class="warn"><p><b>Common mistake.</b> Mixing designs: a crypto map on one side and a VTI on the other. The crypto map proposes specific subnets, the VTI proposes any to any, and phase 2 fails with a selector mismatch. Both sides must be route-based, or both policy-based. (Some platforms can be forced to work with narrow selectors, but that is an exception, not a design.)</p></div>
<div class="exam"><p><b>Exam trap.</b> A VTI does not use a crypto ACL or crypto map. It uses an <b>IPsec profile</b> with <code>tunnel protection ipsec profile</code> and <code>tunnel mode ipsec ipv4</code>. Routing into the tunnel interface is what triggers encryption.</p></div>

<div class="scn"><h4>The tunnel that was up but carried nothing</h4><p>After a migration to VTIs, <code>show interface Tunnel1</code> was up/up on both sides and the IKEv2 SA was ready, but HQ could not reach the branch. <code>show route 10.40.0.0</code> on the ASA showed the old default route via outside; the engineer had removed the crypto map but forgotten the new static route. Adding <code>route vti-br 10.40.0.0 255.255.255.0 10.255.0.2</code> made traffic flow and the encaps counter start rising.</p><p><b>Lesson:</b> with a VTI, no route means no encryption. Always check routing after the tunnel comes up.</p></div>

<div class="iv"><p class="q">"When would you choose a route-based VTI instead of a crypto map on an ASA?"</p><p>Strong answer: when there are many or changing subnets, when you want dynamic routing over the tunnel, when you need two tunnels to two ISPs or two cloud endpoints with automatic failover, or when the peer is a cloud VPN gateway that expects any-to-any selectors. Crypto maps remain fine for small, fixed partner tunnels and for peers that only support policy-based VPNs. Mention that both sides must use the same model.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A VTI is a real interface; routes into it decide what gets encrypted.</li>
<li>ASA VTI = IPsec profile + Tunnel interface (nameif, source, destination, mode ipsec ipv4, protection).</li>
<li>Selectors are any to any, so mirrored ACL mismatches cannot happen.</li>
<li>Dynamic routing over VTIs makes redundancy and growth simple.</li>
<li>Both ends must be route-based; mixing with a crypto map breaks phase 2.</li>
</ul></div>
`,hi:`
<p>Crypto map ke saath gateway ek postman jaisa hai jo addresses ki lambi list padhta hai: "agar letter in streets ke liye hai, to use secure bag mein daalo". Har nayi street ka matlab dono sides par list edit karna. <b>Virtual tunnel interface (VTI)</b> do buildings ke beech ek private pipe jaisa kaam karta hai: pipe mein jo bhi daalo woh doosre end par encrypt hokar pahunchta hai. Ab aap address lists edit nahi karte. Aap bas routing se tay karte ho ki kaunse destinations pipe mein bheje jaayein.</p>

<h3>VTI se kya badalta hai</h3>
<ul>
<li>Ek real interface (<code>Tunnel1</code>) hota hai jiska IP address, nameif aur line state hota hai. IPsec SA up hone par yeh up hota hai.</li>
<li>Encryption <b>routing table</b> tay karti hai: tunnel ki taraf point karta route matlab "encrypt".</li>
<li>Traffic selectors <b>any to any</b> hote hain (dono taraf 0.0.0.0/0), isliye mirrored ACL mismatches gayab ho jaate hain.</li>
<li>Tunnel par dynamic routing (BGP, aur recent ASA releases par OSPF ya EIGRP) chal sakti hai, jisse do-tunnel redundancy simple ho jaati hai.</li>
<li>Na crypto map, na crypto ACL. IKE policy, IPsec proposal aur tunnel-group bilkul chapter 3 aur 4 jaise reuse hote hain.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="VTI between ASA and router">
<rect x="20" y="70" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="80" y="95" text-anchor="middle" class="svg-ink" font-size="13">HQ LAN</text><text x="80" y="114" text-anchor="middle" class="svg-muted" font-size="12">10.30.0.0/24</text>
<rect x="170" y="60" width="130" height="80" rx="8" fill="#bae6fd"/><text x="235" y="85" text-anchor="middle" class="svg-ink" font-size="13">HQ-ASA</text><text x="235" y="105" text-anchor="middle" class="svg-muted" font-size="12">Tunnel1 vti-br</text><text x="235" y="123" text-anchor="middle" class="svg-muted" font-size="12">10.255.0.1/30</text>
<rect x="340" y="60" width="130" height="80" rx="8" fill="#bae6fd"/><text x="405" y="85" text-anchor="middle" class="svg-ink" font-size="13">BR router</text><text x="405" y="105" text-anchor="middle" class="svg-muted" font-size="12">Tunnel1</text><text x="405" y="123" text-anchor="middle" class="svg-muted" font-size="12">10.255.0.2/30</text>
<rect x="500" y="70" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="95" text-anchor="middle" class="svg-ink" font-size="13">BR LAN</text><text x="560" y="114" text-anchor="middle" class="svg-muted" font-size="12">10.40.0.0/24</text>
<line x1="140" y1="100" x2="170" y2="100" stroke="#64748b"/><line x1="470" y1="100" x2="500" y2="100" stroke="#64748b"/>
<line x1="300" y1="100" x2="340" y2="100" stroke="#7c3aed" stroke-width="4"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">tunnel se route 10.40.0.0/24 = encrypt</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">outer: 100.64.51.2 se 100.64.52.2</text>
</svg><p class="cap">Tunnel interfaces ek chhota /30 link banate hain; uske upar ke routes tay karte hain ki kya encrypt hoga.</p></div>

<h3>ASA side (static VTI)</h3>
<pre class="code"><span class="c">! ikev2 policy 10, PROP-AES256 aur tunnel-group 100.64.52.2 reuse karo</span>
crypto ipsec profile VTI-PROF
 set ikev2 ipsec-proposal PROP-AES256
 set pfs group14
interface Tunnel1
 nameif vti-br
 ip address 10.255.0.1 255.255.255.252
 tunnel source interface outside
 tunnel destination 100.64.52.2
 tunnel mode ipsec ipv4
 tunnel protection ipsec profile VTI-PROF
<span class="c">! Branch LAN ko tunnel mein bhejo</span>
route vti-br 10.40.0.0 255.255.255.0 10.255.0.2</pre>
<p><b>IPsec profile</b> crypto map entry ki jagah leta hai: yeh proposal aur optional PFS ka naam deta hai. Tunnel interface peer (<code>tunnel destination</code>) aur local address (<code>tunnel source interface outside</code>) deta hai. VTI ko kisi bhi doosre ASA interface ki tarah treat karo: uska nameif aur security level hota hai, aur us par lagi access-group control karti hai ki branch kya reach kar sakti hai. NAT rules interface pair ke hisaab se likhe jaate hain, isliye <code>(inside,outside)</code> PAT rule <code>vti-br</code> se bahar route hone wale traffic ko nahi chhoota; exemption tabhi chahiye jab aap NAT rules mein interface ke roop mein <code>any</code> use karte ho.</p>

<h3>Router side (IOS IKEv2 VTI)</h3>
<pre class="code">crypto ikev2 proposal PROP-1
 encryption aes-cbc-256
 integrity sha256
 group 14
crypto ikev2 policy POL-1
 proposal PROP-1
crypto ikev2 keyring KR-HQ
 peer HQ
  address 100.64.51.2
  pre-shared-key NKvpn2026
crypto ikev2 profile IKEV2-HQ
 match identity remote address 100.64.51.2 255.255.255.255
 authentication remote pre-share
 authentication local pre-share
 keyring local KR-HQ
crypto ipsec transform-set TS-BR esp-aes 256 esp-sha256-hmac
 mode tunnel
crypto ipsec profile VTI-PROF
 set transform-set TS-BR
 set pfs group14
 set ikev2-profile IKEV2-HQ
interface Tunnel1
 ip address 10.255.0.2 255.255.255.252
 tunnel source GigabitEthernet0/0
 tunnel mode ipsec ipv4
 tunnel destination 100.64.51.2
 tunnel protection ipsec profile VTI-PROF
ip route 10.30.0.0 255.255.255.0 Tunnel1</pre>

<div class="eg"><p><b>Worked example: naya subnet jodna.</b> HQ ek voice VLAN 10.31.0.0/24 jodta hai. Crypto map design mein aapko ASA par crypto ACL, router par mirrored ACL aur NAT exemption edit karni padti. VTI ke saath aap router par ek route jodte ho: <code>ip route 10.31.0.0 255.255.255.0 Tunnel1</code>. Agar tunnel par BGP chal raha hai, to kuch bhi nahi jodna: HQ 10.31.0.0/24 advertise karta hai aur branch use seekh leti hai.</p></div>

<h3>Verification</h3>
<pre class="out">HQ-ASA# show interface Tunnel1
<span class="hl">Interface Tunnel1 "vti-br", is up, line protocol is up</span>
  Hardware is Virtual Tunnel
        Internet address is 10.255.0.1/30
        Tunnel Interface Information:
            Source interface: outside       IP address: 100.64.51.2
            Destination IP address: 100.64.52.2
            Mode: ipsec ipv4      IPsec profile: VTI-PROF

BR# show crypto ipsec sa | include ident
<span class="hl">     local  ident (addr/mask/prot/port): (0.0.0.0/0.0.0.0/0/0)</span>
<span class="hl">     remote ident (addr/mask/prot/port): (0.0.0.0/0.0.0.0/0/0)</span></pre>
<p>Line protocol IPsec SA ko follow karta hai. Any-to-any idents route-based tunnel confirm karte hain. Phir ASA par <code>show route vti-br</code> aur router par <code>show ip route 10.30.0.0</code> tunnel ki taraf point karne chahiye.</p>

<div class="warn"><p><b>Common galti.</b> Designs mix karna: ek side par crypto map aur doosri par VTI. Crypto map specific subnets propose karta hai, VTI any to any propose karta hai, aur phase 2 selector mismatch se fail hota hai. Dono sides route-based honi chahiye, ya dono policy-based. (Kuch platforms ko narrow selectors ke saath zabardasti chalaya ja sakta hai, lekin woh exception hai, design nahi.)</p></div>
<div class="exam"><p><b>Exam trap.</b> VTI crypto ACL ya crypto map use nahi karta. Woh <code>tunnel protection ipsec profile</code> aur <code>tunnel mode ipsec ipv4</code> ke saath ek <b>IPsec profile</b> use karta hai. Tunnel interface mein routing hi encryption trigger karti hai.</p></div>

<div class="scn"><h4>Woh tunnel jo up tha lekin kuch nahi le jaata tha</h4><p>VTIs par migration ke baad dono sides par <code>show interface Tunnel1</code> up/up tha aur IKEv2 SA ready tha, lekin HQ branch tak nahi pahunch pa raha tha. ASA par <code>show route 10.40.0.0</code> ne outside se purana default route dikhaya; engineer ne crypto map hata diya tha lekin naya static route bhool gaya tha. <code>route vti-br 10.40.0.0 255.255.255.0 10.255.0.2</code> jodne se traffic chalne laga aur encaps counter badhne laga.</p><p><b>Seekh:</b> VTI ke saath, route nahi to encryption nahi. Tunnel up hone ke baad hamesha routing check karo.</p></div>

<div class="iv"><p class="q">"ASA par crypto map ki jagah route-based VTI kab chunoge?"</p><p>Strong answer: jab bahut ya badalte subnets hon, jab tunnel par dynamic routing chahiye, jab do ISPs ya do cloud endpoints tak automatic failover wale do tunnels chahiye, ya jab peer cloud VPN gateway ho jo any-to-any selectors expect karta hai. Chhote, fixed partner tunnels aur sirf policy-based VPN support karne wale peers ke liye crypto maps theek hain. Batao ki dono sides ko same model use karna chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VTI ek real interface hai; usmein jaane wale routes tay karte hain ki kya encrypt hoga.</li>
<li>ASA VTI = IPsec profile + Tunnel interface (nameif, source, destination, mode ipsec ipv4, protection).</li>
<li>Selectors any to any hote hain, isliye mirrored ACL mismatches ho hi nahi sakte.</li>
<li>VTIs par dynamic routing redundancy aur growth ko simple banati hai.</li>
<li>Dono ends route-based hone chahiye; crypto map ke saath mix karne se phase 2 tootta hai.</li>
</ul></div>
`}};export{e as default};