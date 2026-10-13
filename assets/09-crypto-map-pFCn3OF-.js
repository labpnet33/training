var e={id:`crypto-map`,h:{en:`Site-to-site IPsec with a crypto map`,hi:`Crypto map se site-to-site IPsec`},body:{en:`
<p>A crypto map is like a security guard standing at the building's exit door with a checklist. Every person (packet) walking out is compared with the list. If they match, the guard puts them into the armoured van to the other office; if not, they walk out normally. The guard does not change where people go; he only decides who travels in the van. This is the oldest and still very common way to build an IPsec site-to-site VPN on IOS, and it is exactly what the third lab asks you to fix.</p>

<h3>The lab</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="IPsec crypto map lab">
<rect x="10" y="70" width="110" height="46" rx="8" fill="#fde68a"/><text x="65" y="90" text-anchor="middle" class="svg-ink" font-size="13">PC-HQ</text><text x="65" y="107" text-anchor="middle" class="svg-muted" font-size="12">10.30.0.10</text>
<rect x="150" y="70" width="110" height="46" rx="8" fill="#bae6fd"/><text x="205" y="90" text-anchor="middle" class="svg-ink" font-size="13">HQ Delhi</text><text x="205" y="107" text-anchor="middle" class="svg-muted" font-size="12">100.64.31.2</text>
<rect x="270" y="10" width="100" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">ISP</text>
<rect x="380" y="70" width="110" height="46" rx="8" fill="#bae6fd"/><text x="435" y="90" text-anchor="middle" class="svg-ink" font-size="13">BR Bengaluru</text><text x="435" y="107" text-anchor="middle" class="svg-muted" font-size="12">100.64.32.2</text>
<rect x="520" y="70" width="110" height="46" rx="8" fill="#fde68a"/><text x="575" y="90" text-anchor="middle" class="svg-ink" font-size="13">PC-BR</text><text x="575" y="107" text-anchor="middle" class="svg-muted" font-size="12">10.40.0.10</text>
<line x1="120" y1="93" x2="150" y2="93" stroke="#64748b" stroke-width="2"/><line x1="490" y1="93" x2="520" y2="93" stroke="#64748b" stroke-width="2"/>
<line x1="240" y1="70" x2="290" y2="50" stroke="#64748b" stroke-width="2"/><line x1="350" y1="50" x2="400" y2="70" stroke="#64748b" stroke-width="2"/>
<path d="M205 116 Q320 175 435 116" fill="none" stroke="#64748b" stroke-width="3" stroke-dasharray="2 4"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="13">ESP: 10.30.0.0/24 with 10.40.0.0/24</text>
</svg><p class="cap">No tunnel interface: the crypto map on Gi0/0 encrypts matching traffic as it leaves.</p></div>
<p>HQ is already complete. The branch router BR was started by a trainee: the pre-shared key is <code>NKdelBlr25</code> instead of <code>NKdelBlr26</code>, the transform set is <code>esp-aes esp-sha-hmac</code> (AES-128, SHA-1) instead of AES-256 with SHA-256, and there is no crypto map.</p>

<h3>The five building blocks (HQ side)</h3>
<pre class="code"><span class="c">! 1. Phase 1 policy (HAGLE)</span>
crypto isakmp policy 10
 encryption aes 256
 hash sha256
 authentication pre-share
 group 14
<span class="c">! 2. Pre-shared key for this peer</span>
crypto isakmp key NKdelBlr26 address 100.64.32.2
<span class="c">! 3. Phase 2 transform set</span>
crypto ipsec transform-set TS-HQ esp-aes 256 esp-sha256-hmac
 mode tunnel
<span class="c">! 4. Proxy ACL: which traffic to protect</span>
access-list 110 permit ip 10.30.0.0 0.0.0.255 10.40.0.0 0.0.0.255
<span class="c">! 5. Crypto map ties it together, applied on the WAN interface</span>
crypto map VPN-MAP 10 ipsec-isakmp
 set peer 100.64.32.2
 set transform-set TS-HQ
 match address 110
interface GigabitEthernet0/0
 crypto map VPN-MAP</pre>
<p>When you first type <code>crypto map VPN-MAP 10 ipsec-isakmp</code>, IOS warns that the map "will remain disabled until a peer and a valid access list have been configured". Several peers use several sequence numbers in the same map; an interface holds only one crypto map.</p>

<h3>Task 1: compare both sides and fix the key</h3>
<pre class="out">BR# show crypto isakmp policy
Global IKE policy
Protection suite of priority 10
        encryption algorithm:   AES - Advanced Encryption Standard (256 bit keys).
        hash algorithm:         Secure Hash Standard 2 (256 bit)
        authentication method:  Pre-Shared Key
        Diffie-Hellman group:   #14 (2048 bit)
        lifetime:               86400 seconds, no volume limit</pre>
<p>The policy matches HQ, so phase 1 negotiation will succeed, but authentication would fail with the wrong key. Re-entering the key for the same address replaces it:</p>
<pre class="code">BR(config)# crypto isakmp key NKdelBlr26 address 100.64.31.2</pre>

<h3>Task 2: match the transform set</h3>
<pre class="out">BR# show crypto ipsec transform-set
Transform set TS-BR: { <span class="hl">esp-aes esp-sha-hmac</span>  }
   will negotiate = { Tunnel,  },</pre>
<pre class="code">BR(config)# crypto ipsec transform-set TS-BR esp-aes 256 esp-sha256-hmac
BR(cfg-crypto-trans)# mode tunnel</pre>
<p>The transform set <b>name</b> is local and does not need to match (TS-HQ and TS-BR are fine). The contents must match: protocol, algorithm, key size, hash and mode.</p>

<h3>Task 3: the crypto map on BR</h3>
<pre class="code">crypto map VPN-MAP 10 ipsec-isakmp
 set peer 100.64.31.2
 set transform-set TS-BR
 match address 120
interface GigabitEthernet0/0
 crypto map VPN-MAP</pre>
<p>ACL 120 is the <b>mirror image</b> of HQ's ACL 110: <code>permit ip 10.40.0.0 0.0.0.255 10.30.0.0 0.0.0.255</code>. Source and destination swap, the networks and masks stay identical. If the ACLs are not mirrors, phase 2 fails with a proxy identity mismatch.</p>

<h3>Task 4 and 5: interesting traffic and verification</h3>
<p>The VPN is <b>on demand</b>: nothing happens until a packet matches the ACL. A ping between the WAN addresses would not match and would travel in clear text.</p>
<pre class="out">PC-BR&gt; ping 10.30.0.10
10.30.0.10 icmp_seq=1 timeout
84 bytes from 10.30.0.10 icmp_seq=2 ttl=62 time=3.214 ms
84 bytes from 10.30.0.10 icmp_seq=3 ttl=62 time=2.887 ms

HQ# show crypto isakmp sa
IPv4 Crypto ISAKMP SA
dst             src             state          conn-id status
100.64.31.2     100.64.32.2     <span class="hl">QM_IDLE</span>           1001 ACTIVE

HQ# show crypto ipsec sa
interface: GigabitEthernet0/0
    Crypto map tag: VPN-MAP, local addr 100.64.31.2
   local  ident (addr/mask/prot/port): (<span class="hl">10.30.0.0/255.255.255.0/0/0</span>)
   remote ident (addr/mask/prot/port): (<span class="hl">10.40.0.0/255.255.255.0/0/0</span>)
   current_peer 100.64.32.2 port 500
     PERMIT, flags={origin_is_acl,}
    <span class="hl">#pkts encaps: 4, #pkts encrypt: 4, #pkts digest: 4</span>
    <span class="hl">#pkts decaps: 4, #pkts decrypt: 4, #pkts verify: 4</span>
     local crypto endpt.: 100.64.31.2, remote crypto endpt.: 100.64.32.2
     current outbound spi: 0x6A3F1C2B(1782521899)
     inbound esp sas:
      spi: 0x1B2C3D4E(456932686)
        transform: esp-256-aes esp-sha256-hmac ,
        in use settings ={Tunnel, }</pre>
<p>The first ping is lost while IKE runs. <b>QM_IDLE</b> means phase 1 is up and idle, ready for more Quick Mode exchanges. Encaps and decaps rising on both routers prove traffic flows both ways. <code>show crypto session</code> gives a one-line summary (UP-ACTIVE) per peer.</p>

<h3>Two real-world gotchas</h3>
<ul>
<li><b>NAT runs before crypto</b> on the way out. If the router also does PAT for internet access, exclude the VPN traffic from NAT with a deny line in the NAT ACL, or the source gets translated and no longer matches the crypto ACL.</li>
<li><b>Routing still decides the exit.</b> The remote LAN must route out of the interface that holds the crypto map; here the default route via Gi0/0 does that.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Non-mirrored crypto ACLs. Applying the crypto map to the LAN interface. Testing with a ping from the router itself (sourced from the WAN IP, so it does not match the ACL). Forgetting the NAT exemption.</p></div>

<div class="exam"><p><b>Exam traps.</b> Transform set names are local; contents must match. The crypto ACL defines interesting traffic, not a filter; a deny means "send in clear", not "drop". A crypto map carries unicast only, so no routing protocol runs across it.</p></div>

<div class="scn"><h4>The VPN that only encrypted one way</h4><p>After a change, HQ showed encaps growing but decaps stuck at 0, while BR showed decaps growing and encaps at 0. Replies from Bengaluru left the router unencrypted. BR's router also did PAT for internet users, and a new NAT rule translated 10.40.0.0/24 to the WAN address before the crypto map saw it. Adding <code>deny ip 10.40.0.0 0.0.0.255 10.30.0.0 0.0.0.255</code> at the top of the NAT ACL restored two-way encryption.</p><p><b>Lesson:</b> one-way counters mean the return path is not matching the crypto ACL: check NAT and routing on the side that is not encrypting.</p></div>

<div class="iv"><p class="q">"List what you need to configure a crypto-map site-to-site VPN, and how you verify it."</p><p>An ISAKMP policy, a pre-shared key per peer, a transform set, a mirrored crypto ACL, and a crypto map with peer, transform set and ACL, applied to the WAN interface. Generate interesting traffic, then check <code>show crypto isakmp sa</code> for QM_IDLE, <code>show crypto ipsec sa</code> for idents, peers and rising encaps and decaps on both sides, and <code>show crypto session</code>. Mention NAT exemption and that the first packet is dropped while IKE negotiates.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Crypto map VPN = ISAKMP policy + key + transform set + mirrored ACL + crypto map on the WAN interface.</li>
<li>Only traffic matching the crypto ACL triggers IKE and is encrypted; the first packet is usually lost.</li>
<li>QM_IDLE = phase 1 up; <code>show crypto ipsec sa</code> encaps and decaps prove phase 2 works both ways.</li>
<li>Transform set contents must match; names are local.</li>
<li>Exempt VPN traffic from NAT; crypto maps carry unicast only.</li>
</ul></div>
`,hi:`
<p>Crypto map building ke exit darwaze par checklist lekar khade security guard jaisa hai. Bahar jaane wala har insaan (packet) list se compare hota hai. Agar match karta hai, guard use doosre office ki armoured van mein bitha deta hai; agar nahi, woh normal bahar chala jaata hai. Guard yeh nahi badalta ki log kahan jaate hain; woh sirf decide karta hai ki kaun van mein jaayega. IOS par IPsec site-to-site VPN banane ka yeh sabse purana aur ab bhi bahut common tareeka hai, aur teesri lab aapse bilkul ise hi fix karwati hai.</p>

<h3>Lab</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="IPsec crypto map lab">
<rect x="10" y="70" width="110" height="46" rx="8" fill="#fde68a"/><text x="65" y="90" text-anchor="middle" class="svg-ink" font-size="13">PC-HQ</text><text x="65" y="107" text-anchor="middle" class="svg-muted" font-size="12">10.30.0.10</text>
<rect x="150" y="70" width="110" height="46" rx="8" fill="#bae6fd"/><text x="205" y="90" text-anchor="middle" class="svg-ink" font-size="13">HQ Delhi</text><text x="205" y="107" text-anchor="middle" class="svg-muted" font-size="12">100.64.31.2</text>
<rect x="270" y="10" width="100" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">ISP</text>
<rect x="380" y="70" width="110" height="46" rx="8" fill="#bae6fd"/><text x="435" y="90" text-anchor="middle" class="svg-ink" font-size="13">BR Bengaluru</text><text x="435" y="107" text-anchor="middle" class="svg-muted" font-size="12">100.64.32.2</text>
<rect x="520" y="70" width="110" height="46" rx="8" fill="#fde68a"/><text x="575" y="90" text-anchor="middle" class="svg-ink" font-size="13">PC-BR</text><text x="575" y="107" text-anchor="middle" class="svg-muted" font-size="12">10.40.0.10</text>
<line x1="120" y1="93" x2="150" y2="93" stroke="#64748b" stroke-width="2"/><line x1="490" y1="93" x2="520" y2="93" stroke="#64748b" stroke-width="2"/>
<line x1="240" y1="70" x2="290" y2="50" stroke="#64748b" stroke-width="2"/><line x1="350" y1="50" x2="400" y2="70" stroke="#64748b" stroke-width="2"/>
<path d="M205 116 Q320 175 435 116" fill="none" stroke="#64748b" stroke-width="3" stroke-dasharray="2 4"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="13">ESP: 10.30.0.0/24 aur 10.40.0.0/24</text>
</svg><p class="cap">Koi tunnel interface nahi: Gi0/0 par crypto map matching traffic ko bahar jaate waqt encrypt karta hai.</p></div>
<p>HQ pehle se complete hai. Branch router BR ek trainee ne shuru kiya tha: pre-shared key <code>NKdelBlr26</code> ki jagah <code>NKdelBlr25</code> hai, transform set AES-256 aur SHA-256 ki jagah <code>esp-aes esp-sha-hmac</code> (AES-128, SHA-1) hai, aur koi crypto map nahi hai.</p>

<h3>Paanch building blocks (HQ side)</h3>
<pre class="code"><span class="c">! 1. Phase 1 policy (HAGLE)</span>
crypto isakmp policy 10
 encryption aes 256
 hash sha256
 authentication pre-share
 group 14
<span class="c">! 2. Is peer ke liye pre-shared key</span>
crypto isakmp key NKdelBlr26 address 100.64.32.2
<span class="c">! 3. Phase 2 transform set</span>
crypto ipsec transform-set TS-HQ esp-aes 256 esp-sha256-hmac
 mode tunnel
<span class="c">! 4. Proxy ACL: kaunsa traffic protect karna hai</span>
access-list 110 permit ip 10.30.0.0 0.0.0.255 10.40.0.0 0.0.0.255
<span class="c">! 5. Crypto map sabko jodta hai, WAN interface par apply</span>
crypto map VPN-MAP 10 ipsec-isakmp
 set peer 100.64.32.2
 set transform-set TS-HQ
 match address 110
interface GigabitEthernet0/0
 crypto map VPN-MAP</pre>
<p>Jab aap pehli baar <code>crypto map VPN-MAP 10 ipsec-isakmp</code> type karte ho, IOS warn karta hai ki map "will remain disabled until a peer and a valid access list have been configured". Kai peers same map mein kai sequence numbers use karte hain; ek interface par sirf ek crypto map hota hai.</p>

<h3>Task 1: dono sides compare karo aur key theek karo</h3>
<pre class="out">BR# show crypto isakmp policy
Global IKE policy
Protection suite of priority 10
        encryption algorithm:   AES - Advanced Encryption Standard (256 bit keys).
        hash algorithm:         Secure Hash Standard 2 (256 bit)
        authentication method:  Pre-Shared Key
        Diffie-Hellman group:   #14 (2048 bit)
        lifetime:               86400 seconds, no volume limit</pre>
<p>Policy HQ se match karti hai, isliye phase 1 negotiation successful hoga, lekin galat key se authentication fail hoga. Same address ke liye key dobara daalne se woh replace ho jaati hai:</p>
<pre class="code">BR(config)# crypto isakmp key NKdelBlr26 address 100.64.31.2</pre>

<h3>Task 2: transform set match karo</h3>
<pre class="out">BR# show crypto ipsec transform-set
Transform set TS-BR: { <span class="hl">esp-aes esp-sha-hmac</span>  }
   will negotiate = { Tunnel,  },</pre>
<pre class="code">BR(config)# crypto ipsec transform-set TS-BR esp-aes 256 esp-sha256-hmac
BR(cfg-crypto-trans)# mode tunnel</pre>
<p>Transform set ka <b>naam</b> local hai aur match hone ki zaroorat nahi (TS-HQ aur TS-BR theek hain). Contents match hone chahiye: protocol, algorithm, key size, hash aur mode.</p>

<h3>Task 3: BR par crypto map</h3>
<pre class="code">crypto map VPN-MAP 10 ipsec-isakmp
 set peer 100.64.31.2
 set transform-set TS-BR
 match address 120
interface GigabitEthernet0/0
 crypto map VPN-MAP</pre>
<p>ACL 120 HQ ke ACL 110 ka <b>mirror image</b> hai: <code>permit ip 10.40.0.0 0.0.0.255 10.30.0.0 0.0.0.255</code>. Source aur destination ulte, networks aur masks same. Agar ACLs mirror nahi hain, to phase 2 proxy identity mismatch ke saath fail hota hai.</p>

<h3>Task 4 aur 5: interesting traffic aur verification</h3>
<p>VPN <b>on demand</b> hai: jab tak koi packet ACL se match na kare, kuch nahi hota. WAN addresses ke beech ping match nahi karega aur clear text mein jaayega.</p>
<pre class="out">PC-BR&gt; ping 10.30.0.10
10.30.0.10 icmp_seq=1 timeout
84 bytes from 10.30.0.10 icmp_seq=2 ttl=62 time=3.214 ms
84 bytes from 10.30.0.10 icmp_seq=3 ttl=62 time=2.887 ms

HQ# show crypto isakmp sa
IPv4 Crypto ISAKMP SA
dst             src             state          conn-id status
100.64.31.2     100.64.32.2     <span class="hl">QM_IDLE</span>           1001 ACTIVE

HQ# show crypto ipsec sa
interface: GigabitEthernet0/0
    Crypto map tag: VPN-MAP, local addr 100.64.31.2
   local  ident (addr/mask/prot/port): (<span class="hl">10.30.0.0/255.255.255.0/0/0</span>)
   remote ident (addr/mask/prot/port): (<span class="hl">10.40.0.0/255.255.255.0/0/0</span>)
   current_peer 100.64.32.2 port 500
     PERMIT, flags={origin_is_acl,}
    <span class="hl">#pkts encaps: 4, #pkts encrypt: 4, #pkts digest: 4</span>
    <span class="hl">#pkts decaps: 4, #pkts decrypt: 4, #pkts verify: 4</span>
     local crypto endpt.: 100.64.31.2, remote crypto endpt.: 100.64.32.2
     current outbound spi: 0x6A3F1C2B(1782521899)
     inbound esp sas:
      spi: 0x1B2C3D4E(456932686)
        transform: esp-256-aes esp-sha256-hmac ,
        in use settings ={Tunnel, }</pre>
<p>IKE chalte waqt pehla ping kho jaata hai. <b>QM_IDLE</b> ka matlab phase 1 up aur idle hai, aur Quick Mode exchanges ke liye ready. Dono routers par encaps aur decaps badhna saabit karta hai ki traffic dono taraf ja raha hai. <code>show crypto session</code> har peer ke liye ek-line summary (UP-ACTIVE) deta hai.</p>

<h3>Do real-world gotchas</h3>
<ul>
<li>Bahar jaate waqt <b>NAT crypto se pehle chalta hai</b>. Agar router internet access ke liye PAT bhi karta hai, to NAT ACL mein deny line se VPN traffic ko NAT se exclude karo, warna source translate ho jaata hai aur crypto ACL se match nahi karta.</li>
<li><b>Exit ab bhi routing decide karti hai.</b> Remote LAN ko us interface se route hona chahiye jis par crypto map hai; yahan Gi0/0 via default route yahi karta hai.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> Non-mirrored crypto ACLs. Crypto map LAN interface par lagana. Router se hi ping karke test karna (WAN IP se sourced, isliye ACL match nahi karta). NAT exemption bhoolna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Transform set names local hain; contents match hone chahiye. Crypto ACL interesting traffic define karta hai, filter nahi; deny ka matlab "clear mein bhejo" hai, "drop" nahi. Crypto map sirf unicast le jaata hai, isliye uske paar koi routing protocol nahi chalta.</p></div>

<div class="scn"><h4>VPN jo sirf ek taraf encrypt karta tha</h4><p>Ek change ke baad HQ par encaps badh rahe the lekin decaps 0 par atke the, jabki BR par decaps badh rahe the aur encaps 0 the. Bengaluru se replies router se bina encrypt hue nikal rahe the. BR ka router internet users ke liye PAT bhi karta tha, aur ek naya NAT rule 10.40.0.0/24 ko crypto map ke dekhne se pehle WAN address mein translate kar deta tha. NAT ACL ke top par <code>deny ip 10.40.0.0 0.0.0.255 10.30.0.0 0.0.0.255</code> jodne se two-way encryption wapas aa gaya.</p><p><b>Seekh:</b> one-way counters ka matlab hai return path crypto ACL se match nahi kar raha: jo side encrypt nahi kar rahi, wahan NAT aur routing check karo.</p></div>

<div class="iv"><p class="q">"Crypto-map site-to-site VPN configure karne ke liye kya chahiye, aur aap use kaise verify karoge?"</p><p>Ek ISAKMP policy, har peer ke liye pre-shared key, ek transform set, mirrored crypto ACL, aur peer, transform set aur ACL wala crypto map, WAN interface par applied. Interesting traffic generate karo, phir QM_IDLE ke liye <code>show crypto isakmp sa</code>, idents, peers aur dono sides par badhte encaps aur decaps ke liye <code>show crypto ipsec sa</code>, aur <code>show crypto session</code> check karo. NAT exemption aur yeh batao ki IKE negotiate karte waqt pehla packet drop hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Crypto map VPN = ISAKMP policy + key + transform set + mirrored ACL + WAN interface par crypto map.</li>
<li>Sirf crypto ACL se match hone wala traffic IKE trigger karta hai aur encrypt hota hai; pehla packet aam taur par kho jaata hai.</li>
<li>QM_IDLE = phase 1 up; <code>show crypto ipsec sa</code> ke encaps aur decaps saabit karte hain ki phase 2 dono taraf chal raha hai.</li>
<li>Transform set contents match hone chahiye; names local hain.</li>
<li>VPN traffic ko NAT se exempt karo; crypto maps sirf unicast le jaate hain.</li>
</ul></div>
`}};export{e as default};