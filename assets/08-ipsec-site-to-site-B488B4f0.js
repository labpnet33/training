var e={id:`ipsec-s2s`,h:{en:`Site-to-site VPNs: IPsec, IKE, ESP and GRE over IPsec`,hi:`Site-to-site VPNs: IPsec, IKE, ESP aur GRE over IPsec`},body:{en:`
<p>A bank moves cash between branches on public roads. It does not build a private road; it puts the cash in a locked, armoured van. The van is marked so the guards at each end know it is genuine, and the seals show whether anyone opened it. A <b>VPN</b> (virtual private network) does exactly this for packets: it carries private traffic across the public internet inside a protected "van". A <b>site-to-site VPN</b> connects two whole networks, such as a branch and HQ, and is always on.</p>

<h3>IPsec: the framework</h3>
<p><b>IPsec</b> is a framework of open standards that protects IP packets. It provides <b>confidentiality</b> (encryption such as AES), <b>integrity</b> (a keyed hash such as HMAC-SHA-256), <b>authentication</b> of the peers (pre-shared key or certificates) and <b>anti-replay</b> (sequence numbers so old packets cannot be re-sent). The end hosts do not need any software: the routers or firewalls at each site do the work.</p>

<h3>IKE: agreeing on how to protect</h3>
<p>Before they can encrypt, two peers must agree on algorithms and create shared keys. <b>IKE</b> (Internet Key Exchange, UDP port 500) does this in two phases:</p>
<ul>
<li><b>Phase 1</b> builds a secure management channel, the IKE (ISAKMP) SA. The peers agree on encryption, hash, authentication method, Diffie-Hellman group and lifetime, run a <b>Diffie-Hellman</b> exchange to create a shared secret without ever sending it, and authenticate each other. When it is done, IOS shows the state <b>QM_IDLE</b>.</li>
<li><b>Phase 2</b> (quick mode) runs inside that channel and builds the <b>IPsec SAs</b> that protect user data: which traffic (from the crypto ACL), which transform set, and fresh keys. IPsec SAs are one-way, so each tunnel has an inbound and an outbound SA.</li>
</ul>
<p><b>IKEv2</b> is the modern version: fewer messages (four in the basic exchange), built-in NAT traversal and dead peer detection, and support for EAP authentication for remote users. When a NAT device sits between the peers, IPsec uses <b>NAT-T</b>, wrapping ESP in UDP 4500.</p>

<h3>ESP, AH, tunnel mode and transport mode</h3>
<p><b>ESP</b> (Encapsulating Security Payload, IP protocol <b>50</b>) encrypts and authenticates the payload; it is what almost every VPN uses. <b>AH</b> (Authentication Header, protocol <b>51</b>) authenticates only, with no encryption, and breaks through NAT, so it is rarely used.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="IPsec tunnel mode and transport mode">
<text x="10" y="30" class="svg-ink" font-size="13">Original</text>
<rect x="120" y="14" width="110" height="26" fill="#e2e8f0"/><text x="175" y="32" text-anchor="middle" class="svg-ink" font-size="12">IP 10.52.0.10</text>
<rect x="230" y="14" width="200" height="26" fill="#bbf7d0"/><text x="330" y="32" text-anchor="middle" class="svg-ink" font-size="12">TCP + data</text>
<text x="10" y="90" class="svg-ink" font-size="13">Tunnel mode</text>
<rect x="120" y="74" width="120" height="26" fill="#fde68a"/><text x="180" y="92" text-anchor="middle" class="svg-ink" font-size="12">New IP (peers)</text>
<rect x="240" y="74" width="50" height="26" fill="#fed7aa"/><text x="265" y="92" text-anchor="middle" class="svg-ink" font-size="12">ESP</text>
<rect x="290" y="74" width="110" height="26" fill="#ddd6fe"/><text x="345" y="92" text-anchor="middle" class="svg-ink" font-size="12">IP 10.52.0.10</text>
<rect x="400" y="74" width="150" height="26" fill="#ddd6fe"/><text x="475" y="92" text-anchor="middle" class="svg-ink" font-size="12">TCP + data</text>
<rect x="550" y="74" width="70" height="26" fill="#fed7aa"/><text x="585" y="92" text-anchor="middle" class="svg-ink" font-size="12">ESP auth</text>
<text x="10" y="150" class="svg-ink" font-size="13">Transport</text>
<rect x="120" y="134" width="110" height="26" fill="#e2e8f0"/><text x="175" y="152" text-anchor="middle" class="svg-ink" font-size="12">IP 10.52.0.10</text>
<rect x="230" y="134" width="50" height="26" fill="#fed7aa"/><text x="255" y="152" text-anchor="middle" class="svg-ink" font-size="12">ESP</text>
<rect x="280" y="134" width="150" height="26" fill="#ddd6fe"/><text x="355" y="152" text-anchor="middle" class="svg-ink" font-size="12">TCP + data</text>
<rect x="430" y="134" width="70" height="26" fill="#fed7aa"/><text x="465" y="152" text-anchor="middle" class="svg-ink" font-size="12">ESP auth</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Purple = encrypted. Tunnel mode also hides the original addresses.</text>
</svg><p class="cap">Tunnel mode wraps the whole original packet behind a new header between the VPN peers.</p></div>
<p>In <b>tunnel mode</b>, the default for site-to-site VPNs, the whole original packet (header included) is encrypted and a new IP header between the two peers' public addresses is added. Internal addresses stay hidden. In <b>transport mode</b>, only the payload is protected and the original header is kept; it is used when the endpoints themselves are the peers, for example GRE between two routers.</p>

<h3>The lab network and configuration</h3>
<p>In the lab, BR (Pune branch, LAN 10.52.0.0/24, public 100.64.52.2) connects to HQ (LAN 10.51.0.0/24, public 100.64.51.2) across ISP. HQ is complete. BR already has phase 1 policy, key, transform set and the crypto ACL; you add the crypto map.</p>
<pre class="code"><span class="c">! Already on BR: phase 1 policy and pre-shared key</span>
crypto isakmp policy 10
 encryption aes 256
 hash sha256
 authentication pre-share
 group 14
crypto isakmp key NKpune2026 address 100.64.51.2
<span class="c">! Phase 2 proposal and interesting traffic (mirror of HQ's ACL 110)</span>
crypto ipsec transform-set TS-VPN esp-aes 256 esp-sha256-hmac
 mode tunnel
access-list 120 permit ip 10.52.0.0 0.0.0.255 10.51.0.0 0.0.0.255
<span class="c">! Your task: tie it together and apply it to the internet interface</span>
BR(config)# crypto map VPN 10 ipsec-isakmp
BR(config-crypto-map)# set peer 100.64.51.2
BR(config-crypto-map)# set transform-set TS-VPN
BR(config-crypto-map)# match address 120
BR(config-crypto-map)# exit
BR(config)# interface g0/0
BR(config-if)# crypto map VPN</pre>
<p>Nothing happens until <b>interesting traffic</b> (matching ACL 120) arrives. The first ping from PC-BR triggers IKE, and is usually lost while the SAs are built.</p>
<pre class="out">BR# show crypto isakmp sa
IPv4 Crypto ISAKMP SA
dst             src             state          conn-id status
<span class="hl">100.64.51.2     100.64.52.2     QM_IDLE           1001 ACTIVE</span>

BR# show crypto ipsec sa
interface: GigabitEthernet0/0
    Crypto map tag: VPN, local addr 100.64.52.2
   local  ident (addr/mask/prot/port): (10.52.0.0/255.255.255.0/0/0)
   remote ident (addr/mask/prot/port): (10.51.0.0/255.255.255.0/0/0)
   current_peer 100.64.51.2 port 500
<span class="hl">    #pkts encaps: 4, #pkts encrypt: 4, #pkts digest: 4
    #pkts decaps: 4, #pkts decrypt: 4, #pkts verify: 4</span>
     local crypto endpt.: 100.64.52.2, remote crypto endpt.: 100.64.51.2
     inbound esp sas:
        transform: esp-256-aes esp-sha256-hmac ,
        in use settings ={Tunnel, }</pre>
<p>A capture on the ISP link now shows packets between 100.64.52.2 and 100.64.51.2 with IP protocol <b>50</b> (ESP) instead of ICMP between the 10.x hosts: confidentiality on the internet link.</p>

<h3>GRE over IPsec</h3>
<p>A crypto-map tunnel carries only unicast traffic that matches the ACL; it has no interface, so routing protocols like OSPF cannot run across it. <b>GRE</b> (Generic Routing Encapsulation, IP protocol <b>47</b>) creates a virtual tunnel interface that carries multicast and routing protocols, but it provides <b>no encryption</b>. <b>GRE over IPsec</b> combines both: GRE gives the routable tunnel interface, IPsec protects the GRE packets. On IOS this is usually an IPsec profile applied with <code>tunnel protection ipsec profile</code> on the tunnel interface. <b>DMVPN</b> builds on the same idea to create many branch tunnels dynamically from one hub configuration.</p>

<div class="eg"><p><b>Worked example.</b> An ESP tunnel-mode packet from PC-BR to PC-HQ: outer header 100.64.52.2 to 100.64.51.2, protocol 50; inside, encrypted, the original 10.52.0.10 to 10.51.0.10 ICMP packet. The ISP sees only the two public addresses and an encrypted blob.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Crypto ACLs that are not mirror images on the two peers. (2) Phase 1 parameters or the pre-shared key differing. (3) Forgetting to apply the crypto map to the outside interface. (4) A NAT rule on the edge that translates the VPN traffic before encryption; exclude it from NAT. (5) Blocking UDP 500, UDP 4500 or ESP on a firewall in the path.</p></div>

<div class="exam"><p><b>Exam trap.</b> ESP = protocol 50, encrypts; AH = 51, no encryption. IKE = UDP 500, NAT-T = UDP 4500. Phase 1 = IKE SA (management channel); phase 2 = IPsec SAs (data). GRE = protocol 47, supports multicast and routing protocols but has no encryption. Site-to-site VPN: end hosts are unaware of it.</p></div>

<div class="scn"><h4>The tunnel that encrypted but never decrypted</h4><p>A retail chain added a new store VPN. <code>show crypto ipsec sa</code> at the store showed encaps rising and decaps stuck at 0. Phase 1 was QM_IDLE, so keys and policy were fine. The HQ router had no route back to the new store subnet 10.60.0.0/24 through the crypto interface, and its crypto ACL did not include the subnet either, so replies went out unencrypted to the default route. Adding the subnet to the HQ crypto ACL and the route fixed it: encaps and decaps rose together.</p><p><b>Lesson:</b> encaps without decaps usually means the far side is not sending traffic back into the tunnel; check its ACL, routing and NAT.</p></div>

<div class="iv"><p class="q">"Walk me through how an IPsec site-to-site tunnel comes up."</p><p>Strong answer: interesting traffic matching the crypto ACL hits the interface with the crypto map. IKE phase 1 on UDP 500 negotiates encryption, hash, authentication, DH group and lifetime, runs Diffie-Hellman and authenticates the peers with a PSK or certificates, giving the IKE SA (QM_IDLE). Phase 2 quick mode negotiates the transform set and proxy identities, creating a pair of unidirectional IPsec SAs. Traffic is then encapsulated in ESP, protocol 50, usually in tunnel mode. Verify with show crypto isakmp sa and the encaps/decaps counters.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Site-to-site VPN connects networks; routers or firewalls do the work, hosts are unaware.</li>
<li>IPsec gives confidentiality, integrity, peer authentication and anti-replay.</li>
<li>IKE phase 1 builds the IKE SA (QM_IDLE); phase 2 builds unidirectional IPsec SAs for the data.</li>
<li>ESP (50) in tunnel mode is the norm; AH (51) has no encryption.</li>
<li>GRE (47) adds a routable, multicast-capable tunnel; GRE over IPsec adds the encryption GRE lacks.</li>
</ul></div>
`,hi:`
<p>Bank public sadkon par branches ke beech cash le jaata hai. Woh private sadak nahi banata; woh cash ko band, armoured van mein rakhta hai. Van par nishaan hota hai taaki dono taraf ke guards jaanein ki asli hai, aur seals dikhati hain ki kisi ne khola ya nahi. <b>VPN</b> (virtual private network) packets ke liye bilkul yahi karta hai: public internet ke paar private traffic ko ek protected "van" ke andar le jaata hai. <b>Site-to-site VPN</b> do poore networks jodta hai, jaise branch aur HQ, aur hamesha on rehta hai.</p>

<h3>IPsec: framework</h3>
<p><b>IPsec</b> open standards ka ek framework hai jo IP packets ko protect karta hai. Yeh <b>confidentiality</b> (AES jaisa encryption), <b>integrity</b> (HMAC-SHA-256 jaisa keyed hash), peers ka <b>authentication</b> (pre-shared key ya certificates) aur <b>anti-replay</b> (sequence numbers taaki purane packets dobara na bheje ja sakein) deta hai. End hosts ko koi software nahi chahiye: har site ke routers ya firewalls kaam karte hain.</p>

<h3>IKE: protect karne ke tarike par sehmati</h3>
<p>Encrypt karne se pehle do peers ko algorithms par sehmat hona aur shared keys banani padti hain. <b>IKE</b> (Internet Key Exchange, UDP port 500) yeh do phases mein karta hai:</p>
<ul>
<li><b>Phase 1</b> ek secure management channel banata hai, IKE (ISAKMP) SA. Peers encryption, hash, authentication method, Diffie-Hellman group aur lifetime par sehmat hote hain, bina kabhi bheje shared secret banane ke liye <b>Diffie-Hellman</b> exchange chalate hain, aur ek doosre ko authenticate karte hain. Jab yeh ho jaata hai, IOS state <b>QM_IDLE</b> dikhata hai.</li>
<li><b>Phase 2</b> (quick mode) us channel ke andar chalta hai aur woh <b>IPsec SAs</b> banata hai jo user data protect karte hain: kaunsa traffic (crypto ACL se), kaunsa transform set, aur nayi keys. IPsec SAs one-way hote hain, isliye har tunnel mein ek inbound aur ek outbound SA hota hai.</li>
</ul>
<p><b>IKEv2</b> modern version hai: kam messages (basic exchange mein chaar), built-in NAT traversal aur dead peer detection, aur remote users ke liye EAP authentication ka support. Jab peers ke beech NAT device hota hai, IPsec <b>NAT-T</b> use karta hai, ESP ko UDP 4500 mein lapet kar.</p>

<h3>ESP, AH, tunnel mode aur transport mode</h3>
<p><b>ESP</b> (Encapsulating Security Payload, IP protocol <b>50</b>) payload ko encrypt aur authenticate karta hai; lagbhag har VPN yahi use karta hai. <b>AH</b> (Authentication Header, protocol <b>51</b>) sirf authenticate karta hai, bina encryption ke, aur NAT se toot jaata hai, isliye kam use hota hai.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="IPsec tunnel mode aur transport mode">
<text x="10" y="30" class="svg-ink" font-size="13">Original</text>
<rect x="120" y="14" width="110" height="26" fill="#e2e8f0"/><text x="175" y="32" text-anchor="middle" class="svg-ink" font-size="12">IP 10.52.0.10</text>
<rect x="230" y="14" width="200" height="26" fill="#bbf7d0"/><text x="330" y="32" text-anchor="middle" class="svg-ink" font-size="12">TCP + data</text>
<text x="10" y="90" class="svg-ink" font-size="13">Tunnel mode</text>
<rect x="120" y="74" width="120" height="26" fill="#fde68a"/><text x="180" y="92" text-anchor="middle" class="svg-ink" font-size="12">Naya IP (peers)</text>
<rect x="240" y="74" width="50" height="26" fill="#fed7aa"/><text x="265" y="92" text-anchor="middle" class="svg-ink" font-size="12">ESP</text>
<rect x="290" y="74" width="110" height="26" fill="#ddd6fe"/><text x="345" y="92" text-anchor="middle" class="svg-ink" font-size="12">IP 10.52.0.10</text>
<rect x="400" y="74" width="150" height="26" fill="#ddd6fe"/><text x="475" y="92" text-anchor="middle" class="svg-ink" font-size="12">TCP + data</text>
<rect x="550" y="74" width="70" height="26" fill="#fed7aa"/><text x="585" y="92" text-anchor="middle" class="svg-ink" font-size="12">ESP auth</text>
<text x="10" y="150" class="svg-ink" font-size="13">Transport</text>
<rect x="120" y="134" width="110" height="26" fill="#e2e8f0"/><text x="175" y="152" text-anchor="middle" class="svg-ink" font-size="12">IP 10.52.0.10</text>
<rect x="230" y="134" width="50" height="26" fill="#fed7aa"/><text x="255" y="152" text-anchor="middle" class="svg-ink" font-size="12">ESP</text>
<rect x="280" y="134" width="150" height="26" fill="#ddd6fe"/><text x="355" y="152" text-anchor="middle" class="svg-ink" font-size="12">TCP + data</text>
<rect x="430" y="134" width="70" height="26" fill="#fed7aa"/><text x="465" y="152" text-anchor="middle" class="svg-ink" font-size="12">ESP auth</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Purple = encrypted. Tunnel mode original addresses bhi chhupata hai.</text>
</svg><p class="cap">Tunnel mode poore original packet ko VPN peers ke beech naye header ke peeche lapet deta hai.</p></div>
<p><b>Tunnel mode</b> mein, jo site-to-site VPNs ka default hai, poora original packet (header samet) encrypt hota hai aur dono peers ke public addresses ke beech naya IP header juda jaata hai. Internal addresses chhupe rehte hain. <b>Transport mode</b> mein sirf payload protect hota hai aur original header rehta hai; yeh tab use hota hai jab endpoints khud peers hon, jaise do routers ke beech GRE.</p>

<h3>Lab network aur configuration</h3>
<p>Lab mein BR (Pune branch, LAN 10.52.0.0/24, public 100.64.52.2) ISP ke paar HQ (LAN 10.51.0.0/24, public 100.64.51.2) se judta hai. HQ poora hai. BR par pehle se phase 1 policy, key, transform set aur crypto ACL hai; aap crypto map jodte ho.</p>
<pre class="code"><span class="c">! BR par pehle se: phase 1 policy aur pre-shared key</span>
crypto isakmp policy 10
 encryption aes 256
 hash sha256
 authentication pre-share
 group 14
crypto isakmp key NKpune2026 address 100.64.51.2
<span class="c">! Phase 2 proposal aur interesting traffic (HQ ki ACL 110 ka mirror)</span>
crypto ipsec transform-set TS-VPN esp-aes 256 esp-sha256-hmac
 mode tunnel
access-list 120 permit ip 10.52.0.0 0.0.0.255 10.51.0.0 0.0.0.255
<span class="c">! Aapka task: sabko jodo aur internet interface par apply karo</span>
BR(config)# crypto map VPN 10 ipsec-isakmp
BR(config-crypto-map)# set peer 100.64.51.2
BR(config-crypto-map)# set transform-set TS-VPN
BR(config-crypto-map)# match address 120
BR(config-crypto-map)# exit
BR(config)# interface g0/0
BR(config-if)# crypto map VPN</pre>
<p>Jab tak <b>interesting traffic</b> (ACL 120 se match karne wala) nahi aata, kuch nahi hota. PC-BR ka pehla ping IKE trigger karta hai, aur SAs bante waqt aam taur par lost ho jaata hai.</p>
<pre class="out">BR# show crypto isakmp sa
IPv4 Crypto ISAKMP SA
dst             src             state          conn-id status
<span class="hl">100.64.51.2     100.64.52.2     QM_IDLE           1001 ACTIVE</span>

BR# show crypto ipsec sa
interface: GigabitEthernet0/0
    Crypto map tag: VPN, local addr 100.64.52.2
   local  ident (addr/mask/prot/port): (10.52.0.0/255.255.255.0/0/0)
   remote ident (addr/mask/prot/port): (10.51.0.0/255.255.255.0/0/0)
   current_peer 100.64.51.2 port 500
<span class="hl">    #pkts encaps: 4, #pkts encrypt: 4, #pkts digest: 4
    #pkts decaps: 4, #pkts decrypt: 4, #pkts verify: 4</span>
     local crypto endpt.: 100.64.52.2, remote crypto endpt.: 100.64.51.2
     inbound esp sas:
        transform: esp-256-aes esp-sha256-hmac ,
        in use settings ={Tunnel, }</pre>
<p>Ab ISP link par capture 10.x hosts ke beech ICMP ki jagah 100.64.52.2 aur 100.64.51.2 ke beech IP protocol <b>50</b> (ESP) wale packets dikhata hai: internet link par confidentiality.</p>

<h3>GRE over IPsec</h3>
<p>Crypto-map tunnel sirf ACL se match karne wala unicast traffic le jaata hai; iska koi interface nahi hota, isliye OSPF jaise routing protocols iske paar nahi chal sakte. <b>GRE</b> (Generic Routing Encapsulation, IP protocol <b>47</b>) ek virtual tunnel interface banata hai jo multicast aur routing protocols le jaata hai, lekin <b>koi encryption nahi</b> deta. <b>GRE over IPsec</b> dono ko jodta hai: GRE routable tunnel interface deta hai, IPsec GRE packets ko protect karta hai. IOS par yeh aam taur par tunnel interface par <code>tunnel protection ipsec profile</code> se lagaya gaya IPsec profile hota hai. <b>DMVPN</b> isi idea par bana hai taaki ek hub configuration se kai branch tunnels dynamically ban sakein.</p>

<div class="eg"><p><b>Worked example.</b> PC-BR se PC-HQ tak ESP tunnel-mode packet: outer header 100.64.52.2 se 100.64.51.2, protocol 50; andar, encrypted, original 10.52.0.10 se 10.51.0.10 wala ICMP packet. ISP ko sirf do public addresses aur ek encrypted blob dikhta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Dono peers par crypto ACLs ka mirror image na hona. (2) Phase 1 parameters ya pre-shared key ka alag hona. (3) Crypto map ko outside interface par apply karna bhoolna. (4) Edge par NAT rule jo encryption se pehle VPN traffic translate kar deta hai; use NAT se exclude karo. (5) Raaste ke firewall par UDP 500, UDP 4500 ya ESP block hona.</p></div>

<div class="exam"><p><b>Exam trap.</b> ESP = protocol 50, encrypt karta hai; AH = 51, encryption nahi. IKE = UDP 500, NAT-T = UDP 4500. Phase 1 = IKE SA (management channel); phase 2 = IPsec SAs (data). GRE = protocol 47, multicast aur routing protocols support karta hai lekin encryption nahi. Site-to-site VPN: end hosts ko pata nahi hota.</p></div>

<div class="scn"><h4>Tunnel jo encrypt karta tha lekin kabhi decrypt nahi</h4><p>Ek retail chain ne naye store ka VPN joda. Store par <code>show crypto ipsec sa</code> mein encaps badh raha tha aur decaps 0 par atka tha. Phase 1 QM_IDLE tha, to keys aur policy theek thi. HQ router ke paas naye store subnet 10.60.0.0/24 ka crypto interface ke through wapsi ka route nahi tha, aur uski crypto ACL mein bhi subnet nahi tha, isliye replies default route par bina encrypt hue ja rahe the. HQ crypto ACL mein subnet aur route jodne se theek hua: encaps aur decaps saath badhne lage.</p><p><b>Seekh:</b> bina decaps ke encaps ka aam matlab hai ki doosri side traffic wapas tunnel mein nahi bhej rahi; uski ACL, routing aur NAT check karo.</p></div>

<div class="iv"><p class="q">"Mujhe samjhao IPsec site-to-site tunnel kaise up hota hai."</p><p>Strong answer: crypto ACL se match karne wala interesting traffic crypto map wale interface par aata hai. UDP 500 par IKE phase 1 encryption, hash, authentication, DH group aur lifetime negotiate karta hai, Diffie-Hellman chalata hai aur PSK ya certificates se peers ko authenticate karta hai, jisse IKE SA (QM_IDLE) banta hai. Phase 2 quick mode transform set aur proxy identities negotiate karta hai, unidirectional IPsec SAs ka pair banata hai. Phir traffic ESP, protocol 50, mein encapsulate hota hai, aam taur par tunnel mode mein. show crypto isakmp sa aur encaps/decaps counters se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Site-to-site VPN networks ko jodta hai; routers ya firewalls kaam karte hain, hosts ko pata nahi hota.</li>
<li>IPsec confidentiality, integrity, peer authentication aur anti-replay deta hai.</li>
<li>IKE phase 1 IKE SA (QM_IDLE) banata hai; phase 2 data ke liye unidirectional IPsec SAs banata hai.</li>
<li>Tunnel mode mein ESP (50) norm hai; AH (51) mein encryption nahi.</li>
<li>GRE (47) routable, multicast-capable tunnel jodta hai; GRE over IPsec woh encryption jodta hai jo GRE mein nahi.</li>
</ul></div>
`}};export{e as default};