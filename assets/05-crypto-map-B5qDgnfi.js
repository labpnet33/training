var e={id:`crypto-map`,h:{en:`The crypto map: match address, set peer, set proposal and apply to the interface`,hi:`Crypto map: match address, set peer, set proposal aur interface par apply`},body:{en:`
<p>A courier company has one dispatch desk at the exit gate. Every parcel passes the desk, and the clerk checks a binder of route cards: "parcels for Pune go in van 10 with the blue seal; parcels for Delhi go in van 20 with the red seal". Parcels that match no card leave normally. The <b>crypto map</b> is that binder, and the outside interface is the gate. Each numbered <b>entry</b> (sequence number) is one route card for one peer.</p>

<h3>What one crypto map entry contains</h3>
<table class="cmp"><tr><th>Command</th><th>Meaning</th></tr>
<tr><td><code>match address VPN-BR</code></td><td>The crypto ACL: which traffic this entry protects</td></tr>
<tr><td><code>set peer 100.64.52.2</code></td><td>Where to send the encrypted traffic (the peer gateway)</td></tr>
<tr><td><code>set ikev2 ipsec-proposal PROP-AES256</code></td><td>Phase 2 algorithms (or <code>set ikev1 transform-set</code>)</td></tr>
<tr><td><code>set pfs group14</code></td><td>Optional: new DH exchange for every phase 2 rekey (Perfect Forward Secrecy)</td></tr>
<tr><td><code>set security-association lifetime seconds 3600</code></td><td>Optional: phase 2 lifetime</td></tr>
<tr><td><code>set reverse-route</code></td><td>Optional: inject a static route for the remote LAN while the SA is up (RRI)</td></tr></table>
<p>Only one crypto map can be applied to an interface. To reach a second peer, you add <b>another sequence number</b> to the same map, not a new map. The ASA checks entries from the lowest sequence number up and uses the first one whose ACL matches the packet.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Crypto map entries on the outside interface">
<rect x="20" y="20" width="180" height="190" rx="8" fill="#e2e8f0"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="13">OUTSIDE_MAP</text><text x="110" y="65" text-anchor="middle" class="svg-muted" font-size="12">on interface outside</text>
<rect x="35" y="80" width="150" height="34" rx="6" fill="#bae6fd"/><text x="110" y="102" text-anchor="middle" class="svg-ink" font-size="12">seq 10: branch BR</text>
<rect x="35" y="122" width="150" height="34" rx="6" fill="#bbf7d0"/><text x="110" y="144" text-anchor="middle" class="svg-ink" font-size="12">seq 20: partner</text>
<rect x="35" y="164" width="150" height="34" rx="6" fill="#fde68a"/><text x="110" y="186" text-anchor="middle" class="svg-ink" font-size="12">seq 65535: dynamic</text>
<rect x="260" y="80" width="360" height="34" rx="6" fill="#bae6fd"/><text x="440" y="102" text-anchor="middle" class="svg-ink" font-size="12">ACL VPN-BR, peer 100.64.52.2, PROP-AES256</text>
<rect x="260" y="122" width="360" height="34" rx="6" fill="#bbf7d0"/><text x="440" y="144" text-anchor="middle" class="svg-ink" font-size="12">ACL VPN-PARTNER, peer 198.51.100.20, IKEv1</text>
<rect x="260" y="164" width="360" height="34" rx="6" fill="#fde68a"/><text x="440" y="186" text-anchor="middle" class="svg-ink" font-size="12">peers with changing IPs (always last)</text>
<line x1="185" y1="97" x2="260" y2="97" stroke="#64748b"/><line x1="185" y1="139" x2="260" y2="139" stroke="#64748b"/><line x1="185" y1="181" x2="260" y2="181" stroke="#64748b"/>
</svg><p class="cap">One map per interface, one sequence number per peer, a dynamic map entry (if any) at the end.</p></div>

<h3>Full ASA configuration for the HQ to branch tunnel</h3>
<p>Here is every piece from chapters 2 to 5 in the order an engineer types it on the HQ ASA (outside 100.64.51.2, inside 10.30.0.0/24). NAT exemption follows in chapter 6.</p>
<pre class="code"><span class="c">! 1. Objects and the crypto ACL (interesting traffic)</span>
object network LAN-HQ
 subnet 10.30.0.0 255.255.255.0
object network LAN-BR
 subnet 10.40.0.0 255.255.255.0
access-list VPN-BR extended permit ip object LAN-HQ object LAN-BR
<span class="c">! 2. Phase 1 and phase 2 proposals</span>
crypto ikev2 policy 10
 encryption aes-256
 integrity sha256
 group 14
 prf sha256
 lifetime seconds 86400
crypto ipsec ikev2 ipsec-proposal PROP-AES256
 protocol esp encryption aes-256
 protocol esp integrity sha-256
<span class="c">! 3. Peer identity</span>
group-policy GP-L2L internal
group-policy GP-L2L attributes
 vpn-tunnel-protocol ikev2
tunnel-group 100.64.52.2 type ipsec-l2l
tunnel-group 100.64.52.2 general-attributes
 default-group-policy GP-L2L
tunnel-group 100.64.52.2 ipsec-attributes
 ikev2 remote-authentication pre-shared-key NKvpn2026
 ikev2 local-authentication pre-shared-key NKvpn2026
<span class="c">! 4. Crypto map entry</span>
crypto map OUTSIDE_MAP 10 match address VPN-BR
crypto map OUTSIDE_MAP 10 set peer 100.64.52.2
crypto map OUTSIDE_MAP 10 set ikev2 ipsec-proposal PROP-AES256
crypto map OUTSIDE_MAP 10 set pfs group14
crypto map OUTSIDE_MAP 10 set security-association lifetime seconds 3600
<span class="c">! 5. Bind to the interface and enable IKE</span>
crypto map OUTSIDE_MAP interface outside
crypto ikev2 enable outside</pre>

<div class="eg"><p><b>Worked example: following one packet.</b> PC-HQ 10.30.0.10 sends a ping to 10.40.0.10. The ASA routes it: the default route points out of <code>outside</code>. Before the packet leaves, the crypto map on outside is checked. Entry 10's ACL <code>VPN-BR</code> matches (10.30.0.0/24 to 10.40.0.0/24). No SA exists yet, so the ASA starts IKEv2 with 100.64.52.2 using policy 10 and the tunnel-group keys, then negotiates a Child SA with PROP-AES256 and PFS group 14. The packet is encrypted into ESP with outer header 100.64.51.2 to 100.64.52.2. A ping to 8.8.8.8 matches no entry and leaves normally through PAT.</p></div>

<h3>Checking what you built</h3>
<pre class="out">HQ-ASA# show running-config crypto map
crypto map OUTSIDE_MAP 10 match address VPN-BR
<span class="hl">crypto map OUTSIDE_MAP 10 set peer 100.64.52.2</span>
crypto map OUTSIDE_MAP 10 set ikev2 ipsec-proposal PROP-AES256
crypto map OUTSIDE_MAP 10 set pfs group14
crypto map OUTSIDE_MAP 10 set security-association lifetime seconds 3600
<span class="hl">crypto map OUTSIDE_MAP interface outside</span></pre>
<p>Check two things every time: the peer address is the other side's public IP, and the last line shows the map bound to the interface that faces that peer.</p>

<h3>PFS and dynamic crypto maps in one paragraph each</h3>
<p><b>PFS.</b> Without PFS, phase 2 keys are derived from the phase 1 key material. With <code>set pfs group14</code>, every phase 2 negotiation runs a fresh DH exchange, so one stolen key does not expose later traffic. If one side sets PFS and the other does not, IKEv1 phase 2 fails; in IKEv2, the first Child SA (created inside IKE_AUTH) still forms, but rekeys can fail, so the tunnel drops at the first rekey. Configure PFS on both sides or on neither.</p>
<p><b>Dynamic crypto map.</b> When a branch has a changing public IP, the HQ cannot <code>set peer</code>. A <code>crypto dynamic-map</code> without a peer is attached to the main map with the highest sequence number, and the branch must always initiate. The branch's PSK then lives in <code>DefaultL2LGroup</code> or is replaced by certificates.</p>

<div class="warn"><p><b>Common mistake.</b> Creating a second map name for a new peer and applying it to outside. The second <code>crypto map ... interface outside</code> replaces the first one, and the old tunnels drop. Always add sequence numbers to the existing map.</p></div>
<div class="exam"><p><b>Exam trap.</b> If the crypto map entry lacks a peer, a proposal or a match address, the ASA warns that the entry is incomplete and it is not used. Also: a dynamic map entry must have a higher sequence number than all static entries, or it catches traffic meant for them.</p></div>

<div class="scn"><h4>The new partner who took down three branches</h4><p>On a Friday change, an engineer built a partner VPN with a fresh map called PARTNER_MAP and applied it to outside. The partner tunnel worked, and within minutes three branch tunnels on OUTSIDE_MAP went down. <code>show running-config crypto map</code> showed only PARTNER_MAP bound to outside. The fix was to move the partner entry into OUTSIDE_MAP as sequence 20 and re-apply OUTSIDE_MAP.</p><p><b>Lesson:</b> one interface, one crypto map; new peers get new sequence numbers.</p></div>

<div class="iv"><p class="q">"Walk me through the crypto map commands on an ASA for a new site-to-site peer."</p><p>Strong answer: pick the next free sequence number in the existing map, then <code>match address</code> the mirrored crypto ACL, <code>set peer</code> the public IP, <code>set ikev2 ipsec-proposal</code> (or ikev1 transform-set), optionally PFS and lifetime. Make sure the map is applied to the interface toward the peer and IKE is enabled there. Then add the tunnel-group and the NAT exemption. Mention that the dynamic map always goes last.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Each crypto map entry = crypto ACL + peer + proposal (+ optional PFS, lifetime, RRI).</li>
<li>One crypto map per interface; a new peer is a new sequence number.</li>
<li>Bind with <code>crypto map NAME interface outside</code> and enable IKE on that interface.</li>
<li>PFS must be configured the same way on both sides.</li>
<li>Dynamic crypto map entries serve peers with changing IPs and always sit last.</li>
</ul></div>
`,hi:`
<p>Ek courier company ke exit gate par ek dispatch desk hai. Har parcel desk se guzarta hai, aur clerk route cards ka ek binder check karta hai: "Pune ke parcels van 10 mein blue seal ke saath; Delhi ke parcels van 20 mein red seal ke saath". Jo parcels kisi card se match nahi karte woh normal nikal jaate hain. <b>Crypto map</b> woh binder hai, aur outside interface gate hai. Har numbered <b>entry</b> (sequence number) ek peer ke liye ek route card hai.</p>

<h3>Ek crypto map entry mein kya hota hai</h3>
<table class="cmp"><tr><th>Command</th><th>Matlab</th></tr>
<tr><td><code>match address VPN-BR</code></td><td>Crypto ACL: yeh entry kaunsa traffic protect karti hai</td></tr>
<tr><td><code>set peer 100.64.52.2</code></td><td>Encrypted traffic kahan bhejna hai (peer gateway)</td></tr>
<tr><td><code>set ikev2 ipsec-proposal PROP-AES256</code></td><td>Phase 2 algorithms (ya <code>set ikev1 transform-set</code>)</td></tr>
<tr><td><code>set pfs group14</code></td><td>Optional: har phase 2 rekey par naya DH exchange (Perfect Forward Secrecy)</td></tr>
<tr><td><code>set security-association lifetime seconds 3600</code></td><td>Optional: phase 2 lifetime</td></tr>
<tr><td><code>set reverse-route</code></td><td>Optional: SA up rehne tak remote LAN ka static route inject karo (RRI)</td></tr></table>
<p>Ek interface par sirf ek crypto map apply ho sakta hai. Doosre peer tak pahunchne ke liye aap usi map mein <b>doosra sequence number</b> jodte ho, naya map nahi. ASA entries ko sabse chhote sequence number se upar check karta hai aur pehli woh use karta hai jiski ACL packet se match kare.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Crypto map entries on the outside interface">
<rect x="20" y="20" width="180" height="190" rx="8" fill="#e2e8f0"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="13">OUTSIDE_MAP</text><text x="110" y="65" text-anchor="middle" class="svg-muted" font-size="12">interface outside par</text>
<rect x="35" y="80" width="150" height="34" rx="6" fill="#bae6fd"/><text x="110" y="102" text-anchor="middle" class="svg-ink" font-size="12">seq 10: branch BR</text>
<rect x="35" y="122" width="150" height="34" rx="6" fill="#bbf7d0"/><text x="110" y="144" text-anchor="middle" class="svg-ink" font-size="12">seq 20: partner</text>
<rect x="35" y="164" width="150" height="34" rx="6" fill="#fde68a"/><text x="110" y="186" text-anchor="middle" class="svg-ink" font-size="12">seq 65535: dynamic</text>
<rect x="260" y="80" width="360" height="34" rx="6" fill="#bae6fd"/><text x="440" y="102" text-anchor="middle" class="svg-ink" font-size="12">ACL VPN-BR, peer 100.64.52.2, PROP-AES256</text>
<rect x="260" y="122" width="360" height="34" rx="6" fill="#bbf7d0"/><text x="440" y="144" text-anchor="middle" class="svg-ink" font-size="12">ACL VPN-PARTNER, peer 198.51.100.20, IKEv1</text>
<rect x="260" y="164" width="360" height="34" rx="6" fill="#fde68a"/><text x="440" y="186" text-anchor="middle" class="svg-ink" font-size="12">badalte IP wale peers (hamesha last)</text>
<line x1="185" y1="97" x2="260" y2="97" stroke="#64748b"/><line x1="185" y1="139" x2="260" y2="139" stroke="#64748b"/><line x1="185" y1="181" x2="260" y2="181" stroke="#64748b"/>
</svg><p class="cap">Har interface par ek map, har peer ka ek sequence number, dynamic map entry (agar ho) end mein.</p></div>

<h3>HQ se branch tunnel ki poori ASA configuration</h3>
<p>Yahan chapter 2 se 5 tak ka har piece us order mein hai jismein engineer HQ ASA (outside 100.64.51.2, inside 10.30.0.0/24) par type karta hai. NAT exemption chapter 6 mein aata hai.</p>
<pre class="code"><span class="c">! 1. Objects aur crypto ACL (interesting traffic)</span>
object network LAN-HQ
 subnet 10.30.0.0 255.255.255.0
object network LAN-BR
 subnet 10.40.0.0 255.255.255.0
access-list VPN-BR extended permit ip object LAN-HQ object LAN-BR
<span class="c">! 2. Phase 1 aur phase 2 proposals</span>
crypto ikev2 policy 10
 encryption aes-256
 integrity sha256
 group 14
 prf sha256
 lifetime seconds 86400
crypto ipsec ikev2 ipsec-proposal PROP-AES256
 protocol esp encryption aes-256
 protocol esp integrity sha-256
<span class="c">! 3. Peer identity</span>
group-policy GP-L2L internal
group-policy GP-L2L attributes
 vpn-tunnel-protocol ikev2
tunnel-group 100.64.52.2 type ipsec-l2l
tunnel-group 100.64.52.2 general-attributes
 default-group-policy GP-L2L
tunnel-group 100.64.52.2 ipsec-attributes
 ikev2 remote-authentication pre-shared-key NKvpn2026
 ikev2 local-authentication pre-shared-key NKvpn2026
<span class="c">! 4. Crypto map entry</span>
crypto map OUTSIDE_MAP 10 match address VPN-BR
crypto map OUTSIDE_MAP 10 set peer 100.64.52.2
crypto map OUTSIDE_MAP 10 set ikev2 ipsec-proposal PROP-AES256
crypto map OUTSIDE_MAP 10 set pfs group14
crypto map OUTSIDE_MAP 10 set security-association lifetime seconds 3600
<span class="c">! 5. Interface se bind karo aur IKE enable karo</span>
crypto map OUTSIDE_MAP interface outside
crypto ikev2 enable outside</pre>

<div class="eg"><p><b>Worked example: ek packet ko follow karna.</b> PC-HQ 10.30.0.10, 10.40.0.10 ko ping bhejta hai. ASA use route karta hai: default route <code>outside</code> se bahar point karta hai. Packet nikalne se pehle outside par crypto map check hota hai. Entry 10 ki ACL <code>VPN-BR</code> match karti hai (10.30.0.0/24 se 10.40.0.0/24). Abhi koi SA nahi hai, isliye ASA policy 10 aur tunnel-group keys use karke 100.64.52.2 ke saath IKEv2 shuru karta hai, phir PROP-AES256 aur PFS group 14 ke saath Child SA negotiate karta hai. Packet outer header 100.64.51.2 se 100.64.52.2 ke saath ESP mein encrypt hota hai. 8.8.8.8 ka ping kisi entry se match nahi karta aur PAT se normal nikal jaata hai.</p></div>

<h3>Jo banaya use check karna</h3>
<pre class="out">HQ-ASA# show running-config crypto map
crypto map OUTSIDE_MAP 10 match address VPN-BR
<span class="hl">crypto map OUTSIDE_MAP 10 set peer 100.64.52.2</span>
crypto map OUTSIDE_MAP 10 set ikev2 ipsec-proposal PROP-AES256
crypto map OUTSIDE_MAP 10 set pfs group14
crypto map OUTSIDE_MAP 10 set security-association lifetime seconds 3600
<span class="hl">crypto map OUTSIDE_MAP interface outside</span></pre>
<p>Har baar do cheezein check karo: peer address doosri side ka public IP hai, aur aakhri line dikhati hai ki map us interface se bound hai jo peer ki taraf hai.</p>

<h3>PFS aur dynamic crypto maps ek-ek paragraph mein</h3>
<p><b>PFS.</b> PFS ke bina phase 2 keys phase 1 key material se derive hoti hain. <code>set pfs group14</code> ke saath har phase 2 negotiation ek fresh DH exchange chalati hai, isliye ek chori hui key baad ka traffic expose nahi karti. Agar ek side PFS set kare aur doosri nahi, to IKEv1 phase 2 fail hota hai; IKEv2 mein pehla Child SA (jo IKE_AUTH ke andar banta hai) phir bhi banta hai, lekin rekeys fail ho sakte hain, isliye tunnel pehle rekey par gir jaata hai. PFS dono sides par configure karo ya kisi par nahi.</p>
<p><b>Dynamic crypto map.</b> Jab branch ka public IP badalta rehta hai, HQ <code>set peer</code> nahi kar sakta. Bina peer wala <code>crypto dynamic-map</code> sabse bade sequence number ke saath main map se joda jaata hai, aur branch ko hamesha initiate karna padta hai. Tab branch ka PSK <code>DefaultL2LGroup</code> mein rehta hai ya certificates se replace hota hai.</p>

<div class="warn"><p><b>Common galti.</b> Naye peer ke liye doosra map naam banana aur use outside par apply karna. Doosra <code>crypto map ... interface outside</code> pehle wale ko replace kar deta hai, aur purane tunnels gir jaate hain. Hamesha existing map mein sequence numbers jodo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Agar crypto map entry mein peer, proposal ya match address nahi hai, to ASA warn karta hai ki entry incomplete hai aur woh use nahi hoti. Aur: dynamic map entry ka sequence number saari static entries se bada hona chahiye, warna woh unke liye bana traffic pakad leti hai.</p></div>

<div class="scn"><h4>Naya partner jisne teen branches gira di</h4><p>Friday ke change mein ek engineer ne PARTNER_MAP naam ke naye map se partner VPN banaya aur use outside par apply kiya. Partner tunnel chal gaya, aur kuch minute mein OUTSIDE_MAP ke teen branch tunnels down ho gaye. <code>show running-config crypto map</code> mein sirf PARTNER_MAP outside se bound dikha. Fix tha partner entry ko OUTSIDE_MAP mein sequence 20 ki tarah le jaana aur OUTSIDE_MAP dobara apply karna.</p><p><b>Seekh:</b> ek interface, ek crypto map; naye peers ko naye sequence numbers milte hain.</p></div>

<div class="iv"><p class="q">"Naye site-to-site peer ke liye ASA par crypto map commands samjhao."</p><p>Strong answer: existing map mein agla free sequence number chuno, phir mirrored crypto ACL ka <code>match address</code>, public IP ka <code>set peer</code>, <code>set ikev2 ipsec-proposal</code> (ya ikev1 transform-set), optionally PFS aur lifetime. Ensure karo ki map peer ki taraf wale interface par applied hai aur wahan IKE enabled hai. Phir tunnel-group aur NAT exemption jodo. Batao ki dynamic map hamesha last mein jaata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har crypto map entry = crypto ACL + peer + proposal (+ optional PFS, lifetime, RRI).</li>
<li>Har interface par ek crypto map; naya peer = naya sequence number.</li>
<li><code>crypto map NAME interface outside</code> se bind karo aur us interface par IKE enable karo.</li>
<li>PFS dono sides par ek jaisa configure hona chahiye.</li>
<li>Dynamic crypto map entries badalte IP wale peers ke liye hain aur hamesha last mein hoti hain.</li>
</ul></div>
`}};export{e as default};