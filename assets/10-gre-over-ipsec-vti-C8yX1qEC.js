var e={id:`gre-over-ipsec-vti`,h:{en:`GRE over IPsec and VTI: tunnel protection`,hi:`GRE over IPsec aur VTI: tunnel protection`},body:{en:`
<p>A GRE tunnel is a courier van with glass windows: it goes anywhere and carries anything, but everyone on the road can see inside. A crypto map is an armoured van, but it only accepts passengers on its checklist and refuses groups (multicast). <b>GRE over IPsec</b> puts the glass van inside the armoured one: flexible and private. A <b>VTI</b> goes one step further and builds an armoured van that behaves like a normal road lane. This chapter walks through the fourth lab and compares the options.</p>

<h3>Why not just a crypto map?</h3>
<ul>
<li>Crypto maps carry unicast only, so OSPF and EIGRP hellos cannot cross them.</li>
<li>Every new subnet means editing mirrored ACLs on both sides.</li>
<li>There is no interface, so you cannot route into it, apply QoS or see it in <code>show ip interface brief</code>.</li>
</ul>
<p>With <b>tunnel protection</b>, an <b>IPsec profile</b> is attached to a tunnel interface. Everything routed into the tunnel is encrypted. There is no crypto ACL: the protected traffic is simply "whatever this tunnel carries".</p>

<h3>Lab 4: protect the Pune–Jaipur GRE tunnel</h3>
<p>BR1 and BR2 already have a working Tunnel0 (172.16.12.0/30) and static routes for the LANs. Apply the same crypto configuration on both routers, changing only the peer address in the key.</p>
<pre class="code"><span class="c">! Task 1: phase 1 (BR1 shown; BR2 uses address 100.64.11.2)</span>
crypto isakmp policy 10
 encryption aes 256
 hash sha256
 authentication pre-share
 group 14
crypto isakmp key NKgre2026 address 100.64.22.2
<span class="c">! Task 2: phase 2 transform set in transport mode, and the profile</span>
crypto ipsec transform-set TS-GRE esp-aes 256 esp-sha-hmac
 mode transport
crypto ipsec profile GRE-PROT
 set transform-set TS-GRE
<span class="c">! Task 3: protect the tunnel</span>
interface Tunnel0
 tunnel protection ipsec profile GRE-PROT</pre>
<p><b>Why transport mode?</b> The GRE packet already has the outer header 100.64.11.2 to 100.64.22.2, which are the IPsec peers. Tunnel mode would add a second identical 20-byte header for nothing. If the peers disagree (one side tunnel, one transport), IOS usually still negotiates tunnel mode, so traffic works but with extra overhead; configure both the same. The lab uses SHA-1 HMAC (<code>esp-sha-hmac</code>); in production prefer SHA-256 or AES-GCM.</p>
<p>As soon as tunnel protection is applied on both sides, IKE starts automatically; it does not wait for interesting traffic, because the tunnel endpoints are known.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="GRE over IPsec packet in transport mode">
<rect x="10" y="30" width="120" height="40" rx="5" fill="#bae6fd"/><text x="70" y="48" text-anchor="middle" class="svg-ink" font-size="12">IP 100.64.11.2</text><text x="70" y="63" text-anchor="middle" class="svg-muted" font-size="12">proto 50</text>
<rect x="135" y="30" width="70" height="40" rx="5" fill="#ddd6fe"/><text x="170" y="55" text-anchor="middle" class="svg-ink" font-size="12">ESP</text>
<rect x="210" y="30" width="60" height="40" rx="5" fill="#bbf7d0"/><text x="240" y="55" text-anchor="middle" class="svg-ink" font-size="12">GRE</text>
<rect x="275" y="30" width="200" height="40" rx="5" fill="#fde68a"/><text x="375" y="55" text-anchor="middle" class="svg-ink" font-size="12">IP 10.1.10.10 to 10.2.20.10</text>
<rect x="480" y="30" width="70" height="40" rx="5" fill="#ddd6fe"/><text x="515" y="55" text-anchor="middle" class="svg-ink" font-size="12">trailer</text>
<rect x="555" y="30" width="75" height="40" rx="5" fill="#e2e8f0"/><text x="592" y="55" text-anchor="middle" class="svg-ink" font-size="12">ICV</text>
<line x1="210" y1="85" x2="550" y2="85" stroke="#64748b" stroke-width="2"/><text x="380" y="105" text-anchor="middle" class="svg-muted" font-size="12">encrypted: GRE header and the whole private packet</text>
</svg><p class="cap">On the wire the ISP now sees only ESP (protocol 50) between the two public addresses.</p></div>

<h3>Task 4: verification</h3>
<pre class="out">BR1# show crypto ipsec sa
interface: Tunnel0
    Crypto map tag: Tunnel0-head-0, local addr 100.64.11.2
   protected vrf: (none)
   local  ident (addr/mask/prot/port): (<span class="hl">100.64.11.2/255.255.255.255/47/0</span>)
   remote ident (addr/mask/prot/port): (<span class="hl">100.64.22.2/255.255.255.255/47/0</span>)
   current_peer 100.64.22.2 port 500
     PERMIT, flags={origin_is_acl,}
    <span class="hl">#pkts encaps: 9, #pkts encrypt: 9, #pkts digest: 9</span>
    #pkts decaps: 9, #pkts decrypt: 9, #pkts verify: 9
        transform: esp-256-aes esp-sha-hmac ,
        in use settings ={<span class="hl">Transport, </span>}</pre>
<p>Read the idents: host to host, protocol <b>47</b>. IOS built an internal crypto map (Tunnel0-head-0) that protects GRE between the two endpoints. Encaps rising after a PC1 to PC2 ping prove the traffic is encrypted. <code>show crypto isakmp sa</code> shows QM_IDLE and <code>show crypto session</code> shows the session on interface Tunnel0.</p>

<h3>Static VTI: IPsec as a real interface</h3>
<p>A <b>virtual tunnel interface (VTI)</b> uses <code>tunnel mode ipsec ipv4</code>. There is no GRE header at all: IPsec itself is the tunnel, in tunnel mode, with proxy identities of any to any. It supports routing protocols and multicast over the interface, per-tunnel QoS and features, and saves the 4-byte GRE header. Its line protocol is up only while the IPsec SA exists, so tunnel state reflects real reachability. It carries only IP (IPv4 or IPv6 with <code>tunnel mode ipsec ipv6</code>), not other passengers. VTIs pair naturally with IKEv2:</p>
<pre class="code">crypto ikev2 proposal PROP-1
 encryption aes-cbc-256
 integrity sha256
 group 14
crypto ikev2 policy POL-1
 proposal PROP-1
crypto ikev2 keyring KR-1
 peer BR2
  address 100.64.22.2
  pre-shared-key NKvti2026
crypto ikev2 profile IKEV2-PROF
 match identity remote address 100.64.22.2 255.255.255.255
 authentication remote pre-share
 authentication local pre-share
 keyring local KR-1
crypto ipsec profile VTI-PROF
 set ikev2-profile IKEV2-PROF
interface Tunnel1
 ip address 172.16.99.1 255.255.255.252
 tunnel source GigabitEthernet0/0
 tunnel mode ipsec ipv4
 tunnel destination 100.64.22.2
 tunnel protection ipsec profile VTI-PROF</pre>
<p>Verify IKEv2 with <code>show crypto ikev2 sa</code>, where the status should read READY. Dynamic VTIs (DVTI) on a hub clone virtual-access interfaces for many spokes; that belongs to FlexVPN designs.</p>

<table class="cmp"><tr><th></th><th>Crypto map</th><th>GRE over IPsec</th><th>Static VTI</th></tr>
<tr><td>Interface</td><td>None</td><td>Tunnel (GRE)</td><td>Tunnel (IPsec)</td></tr>
<tr><td>Traffic selection</td><td>Crypto ACL</td><td>Routing into tunnel</td><td>Routing into tunnel</td></tr>
<tr><td>Multicast / IGP</td><td>No</td><td>Yes</td><td>Yes</td></tr>
<tr><td>Non-IP passengers</td><td>No</td><td>Yes</td><td>No</td></tr>
<tr><td>Typical mode</td><td>Tunnel</td><td>Transport</td><td>Tunnel</td></tr>
<tr><td>Overhead</td><td>ESP + new IP</td><td>ESP + GRE (+ IP)</td><td>ESP + new IP</td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Applying tunnel protection on one router only: the tunnel goes down or traffic is dropped because one side sends ESP and the other expects plain GRE. Leaving an old crypto map on the physical interface that also matches the GRE traffic. Forgetting that a VTI's line protocol stays down until IPsec negotiates, and debugging routing first.</p></div>

<div class="exam"><p><b>Exam traps.</b> <code>tunnel protection ipsec profile</code> goes on the tunnel interface, not the physical one. GRE over IPsec idents show protocol 47. VTI = <code>tunnel mode ipsec ipv4</code>, no GRE header. IPsec profiles need no crypto ACL.</p></div>

<div class="scn"><h4>The audit finding</h4><p>A security audit at a manufacturing company captured traffic on the internet link and found plain-text SQL queries between two plants. The plants were joined by a GRE tunnel running OSPF, built years earlier as a "VPN". The team added an ISAKMP policy, a transport-mode transform set and an IPsec profile, then applied tunnel protection during a maintenance window. OSPF kept running, and the next capture showed only ESP. A year later they migrated to IKEv2 VTIs to drop the GRE header and gain tunnel state tied to the SA.</p><p><b>Lesson:</b> GRE alone is not a VPN. Protect it, or replace it with a VTI.</p></div>

<div class="iv"><p class="q">"Compare a crypto map, GRE over IPsec and a VTI. When would you use each?"</p><p>A crypto map encrypts traffic matching an ACL on the physical interface; no interface, unicast only, fine for simple or third-party interop VPNs. GRE over IPsec protects a GRE tunnel with an IPsec profile, usually in transport mode; it carries multicast and routing protocols and even non-IP. A static VTI uses <code>tunnel mode ipsec ipv4</code>, no GRE, routable, supports IGPs, and its line protocol tracks the SA; it is the modern default, often with IKEv2. Mention overhead and MTU in each case.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tunnel protection = IPsec profile on a tunnel interface; no crypto ACL, routing decides what is encrypted.</li>
<li>GRE over IPsec: transport mode, idents host to host protocol 47, only ESP on the wire.</li>
<li>VTI: <code>tunnel mode ipsec ipv4</code>, no GRE header, line protocol tied to the SA.</li>
<li>IKEv2 building blocks: proposal, policy, keyring, profile, then <code>set ikev2-profile</code>.</li>
<li>Configure both sides identically; verify with <code>show crypto ipsec sa</code> and <code>show crypto session</code>.</li>
</ul></div>
`,hi:`
<p>GRE tunnel sheeshe ki khidkiyon wali courier van hai: kahin bhi jaati hai aur kuch bhi le jaati hai, lekin sadak par sab andar dekh sakte hain. Crypto map ek armoured van hai, lekin sirf apni checklist wale passengers leti hai aur groups (multicast) mana karti hai. <b>GRE over IPsec</b> sheeshe wali van ko armoured van ke andar rakh deta hai: flexible bhi aur private bhi. <b>VTI</b> ek kadam aage jaata hai aur aisi armoured van banata hai jo normal road lane ki tarah behave karti hai. Yeh chapter chauthi lab ko step by step chalata hai aur options compare karta hai.</p>

<h3>Sirf crypto map kyun nahi?</h3>
<ul>
<li>Crypto maps sirf unicast le jaate hain, isliye OSPF aur EIGRP hellos unhe cross nahi kar sakte.</li>
<li>Har naye subnet ka matlab hai dono sides par mirrored ACLs edit karna.</li>
<li>Koi interface nahi hai, isliye aap usmein route nahi kar sakte, QoS nahi laga sakte ya <code>show ip interface brief</code> mein dekh nahi sakte.</li>
</ul>
<p><b>Tunnel protection</b> mein ek <b>IPsec profile</b> tunnel interface se juda hota hai. Tunnel mein route hone wala sab kuch encrypt hota hai. Koi crypto ACL nahi: protected traffic bas "jo bhi yeh tunnel le jaata hai" hai.</p>

<h3>Lab 4: Pune–Jaipur GRE tunnel ko protect karo</h3>
<p>BR1 aur BR2 par pehle se chalta hua Tunnel0 (172.16.12.0/30) aur LANs ke static routes hain. Dono routers par same crypto configuration lagao, key mein sirf peer address badal kar.</p>
<pre class="code"><span class="c">! Task 1: phase 1 (BR1 dikhaya; BR2 address 100.64.11.2 use karta hai)</span>
crypto isakmp policy 10
 encryption aes 256
 hash sha256
 authentication pre-share
 group 14
crypto isakmp key NKgre2026 address 100.64.22.2
<span class="c">! Task 2: transport mode mein phase 2 transform set, aur profile</span>
crypto ipsec transform-set TS-GRE esp-aes 256 esp-sha-hmac
 mode transport
crypto ipsec profile GRE-PROT
 set transform-set TS-GRE
<span class="c">! Task 3: tunnel protect karo</span>
interface Tunnel0
 tunnel protection ipsec profile GRE-PROT</pre>
<p><b>Transport mode kyun?</b> GRE packet ke paas pehle se outer header 100.64.11.2 se 100.64.22.2 hai, jo IPsec peers hi hain. Tunnel mode bekaar mein doosra identical 20-byte header jodta. Agar peers agree na karein (ek side tunnel, ek transport), to IOS aam taur par phir bhi tunnel mode negotiate kar leta hai, traffic chalta hai lekin extra overhead ke saath; dono same configure karo. Lab SHA-1 HMAC (<code>esp-sha-hmac</code>) use karti hai; production mein SHA-256 ya AES-GCM prefer karo.</p>
<p>Dono sides par tunnel protection lagte hi IKE automatically shuru ho jaata hai; yeh interesting traffic ka intezaar nahi karta, kyunki tunnel endpoints pata hain.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Transport mode mein GRE over IPsec packet">
<rect x="10" y="30" width="120" height="40" rx="5" fill="#bae6fd"/><text x="70" y="48" text-anchor="middle" class="svg-ink" font-size="12">IP 100.64.11.2</text><text x="70" y="63" text-anchor="middle" class="svg-muted" font-size="12">proto 50</text>
<rect x="135" y="30" width="70" height="40" rx="5" fill="#ddd6fe"/><text x="170" y="55" text-anchor="middle" class="svg-ink" font-size="12">ESP</text>
<rect x="210" y="30" width="60" height="40" rx="5" fill="#bbf7d0"/><text x="240" y="55" text-anchor="middle" class="svg-ink" font-size="12">GRE</text>
<rect x="275" y="30" width="200" height="40" rx="5" fill="#fde68a"/><text x="375" y="55" text-anchor="middle" class="svg-ink" font-size="12">IP 10.1.10.10 se 10.2.20.10</text>
<rect x="480" y="30" width="70" height="40" rx="5" fill="#ddd6fe"/><text x="515" y="55" text-anchor="middle" class="svg-ink" font-size="12">trailer</text>
<rect x="555" y="30" width="75" height="40" rx="5" fill="#e2e8f0"/><text x="592" y="55" text-anchor="middle" class="svg-ink" font-size="12">ICV</text>
<line x1="210" y1="85" x2="550" y2="85" stroke="#64748b" stroke-width="2"/><text x="380" y="105" text-anchor="middle" class="svg-muted" font-size="12">encrypted: GRE header aur poora private packet</text>
</svg><p class="cap">Wire par ISP ko ab dono public addresses ke beech sirf ESP (protocol 50) dikhta hai.</p></div>

<h3>Task 4: verification</h3>
<pre class="out">BR1# show crypto ipsec sa
interface: Tunnel0
    Crypto map tag: Tunnel0-head-0, local addr 100.64.11.2
   protected vrf: (none)
   local  ident (addr/mask/prot/port): (<span class="hl">100.64.11.2/255.255.255.255/47/0</span>)
   remote ident (addr/mask/prot/port): (<span class="hl">100.64.22.2/255.255.255.255/47/0</span>)
   current_peer 100.64.22.2 port 500
     PERMIT, flags={origin_is_acl,}
    <span class="hl">#pkts encaps: 9, #pkts encrypt: 9, #pkts digest: 9</span>
    #pkts decaps: 9, #pkts decrypt: 9, #pkts verify: 9
        transform: esp-256-aes esp-sha-hmac ,
        in use settings ={<span class="hl">Transport, </span>}</pre>
<p>Idents padho: host to host, protocol <b>47</b>. IOS ne ek internal crypto map (Tunnel0-head-0) banaya jo dono endpoints ke beech GRE protect karta hai. PC1 se PC2 ping ke baad badhte encaps saabit karte hain ki traffic encrypted hai. <code>show crypto isakmp sa</code> QM_IDLE dikhata hai aur <code>show crypto session</code> interface Tunnel0 par session dikhata hai.</p>

<h3>Static VTI: IPsec ek asli interface ki tarah</h3>
<p><b>Virtual tunnel interface (VTI)</b> <code>tunnel mode ipsec ipv4</code> use karta hai. Isme GRE header bilkul nahi: IPsec khud tunnel hai, tunnel mode mein, any to any proxy identities ke saath. Yeh interface par routing protocols aur multicast, per-tunnel QoS aur features support karta hai, aur 4-byte GRE header bachata hai. Iska line protocol tabhi up hota hai jab IPsec SA exist kare, isliye tunnel state asli reachability dikhata hai. Yeh sirf IP le jaata hai (IPv4, ya <code>tunnel mode ipsec ipv6</code> ke saath IPv6), doosre passengers nahi. VTIs IKEv2 ke saath natural jodi banate hain:</p>
<pre class="code">crypto ikev2 proposal PROP-1
 encryption aes-cbc-256
 integrity sha256
 group 14
crypto ikev2 policy POL-1
 proposal PROP-1
crypto ikev2 keyring KR-1
 peer BR2
  address 100.64.22.2
  pre-shared-key NKvti2026
crypto ikev2 profile IKEV2-PROF
 match identity remote address 100.64.22.2 255.255.255.255
 authentication remote pre-share
 authentication local pre-share
 keyring local KR-1
crypto ipsec profile VTI-PROF
 set ikev2-profile IKEV2-PROF
interface Tunnel1
 ip address 172.16.99.1 255.255.255.252
 tunnel source GigabitEthernet0/0
 tunnel mode ipsec ipv4
 tunnel destination 100.64.22.2
 tunnel protection ipsec profile VTI-PROF</pre>
<p>IKEv2 ko <code>show crypto ikev2 sa</code> se verify karo, jahan status READY hona chahiye. Hub par dynamic VTIs (DVTI) kai spokes ke liye virtual-access interfaces clone karte hain; yeh FlexVPN designs ka hissa hai.</p>

<table class="cmp"><tr><th></th><th>Crypto map</th><th>GRE over IPsec</th><th>Static VTI</th></tr>
<tr><td>Interface</td><td>Koi nahi</td><td>Tunnel (GRE)</td><td>Tunnel (IPsec)</td></tr>
<tr><td>Traffic selection</td><td>Crypto ACL</td><td>Tunnel mein routing</td><td>Tunnel mein routing</td></tr>
<tr><td>Multicast / IGP</td><td>Nahi</td><td>Haan</td><td>Haan</td></tr>
<tr><td>Non-IP passengers</td><td>Nahi</td><td>Haan</td><td>Nahi</td></tr>
<tr><td>Typical mode</td><td>Tunnel</td><td>Transport</td><td>Tunnel</td></tr>
<tr><td>Overhead</td><td>ESP + naya IP</td><td>ESP + GRE (+ IP)</td><td>ESP + naya IP</td></tr>
</table>

<div class="warn"><p><b>Common galtiyan.</b> Tunnel protection sirf ek router par lagana: tunnel down ho jaata hai ya traffic drop hota hai kyunki ek side ESP bhejti hai aur doosri plain GRE expect karti hai. Physical interface par purana crypto map chhod dena jo GRE traffic ko bhi match karta hai. Bhoolna ki VTI ka line protocol IPsec negotiate hone tak down rehta hai, aur pehle routing debug karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> <code>tunnel protection ipsec profile</code> tunnel interface par lagta hai, physical par nahi. GRE over IPsec idents protocol 47 dikhate hain. VTI = <code>tunnel mode ipsec ipv4</code>, koi GRE header nahi. IPsec profiles ko crypto ACL nahi chahiye.</p></div>

<div class="scn"><h4>Audit finding</h4><p>Ek manufacturing company ke security audit ne internet link par traffic capture kiya aur do plants ke beech plain-text SQL queries paayi. Plants ek GRE tunnel se jude the jis par OSPF chalta tha, saalon pehle "VPN" ke naam par bana. Team ne ek ISAKMP policy, transport-mode transform set aur IPsec profile joda, phir maintenance window mein tunnel protection lagaya. OSPF chalta raha, aur agle capture mein sirf ESP dikha. Ek saal baad unhone GRE header hatane aur SA se bandha tunnel state paane ke liye IKEv2 VTIs par migrate kiya.</p><p><b>Seekh:</b> akela GRE VPN nahi hai. Use protect karo, ya VTI se replace karo.</p></div>

<div class="iv"><p class="q">"Crypto map, GRE over IPsec aur VTI compare karo. Har ek kab use karoge?"</p><p>Crypto map physical interface par ACL se match hone wala traffic encrypt karta hai; koi interface nahi, sirf unicast, simple ya third-party interop VPNs ke liye theek. GRE over IPsec IPsec profile se GRE tunnel protect karta hai, aam taur par transport mode mein; yeh multicast aur routing protocols aur non-IP bhi le jaata hai. Static VTI <code>tunnel mode ipsec ipv4</code> use karta hai, GRE nahi, routable, IGPs support karta hai, aur iska line protocol SA track karta hai; yeh modern default hai, aksar IKEv2 ke saath. Har case mein overhead aur MTU ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tunnel protection = tunnel interface par IPsec profile; koi crypto ACL nahi, routing decide karti hai kya encrypt hoga.</li>
<li>GRE over IPsec: transport mode, idents host to host protocol 47, wire par sirf ESP.</li>
<li>VTI: <code>tunnel mode ipsec ipv4</code>, koi GRE header nahi, line protocol SA se bandha.</li>
<li>IKEv2 building blocks: proposal, policy, keyring, profile, phir <code>set ikev2-profile</code>.</li>
<li>Dono sides identical configure karo; <code>show crypto ipsec sa</code> aur <code>show crypto session</code> se verify karo.</li>
</ul></div>
`}};export{e as default};