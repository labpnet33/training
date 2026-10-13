var e={id:`ipsec`,h:{en:`Protecting DMVPN with one IPsec profile`,hi:`Ek IPsec profile se DMVPN protect karna`},body:{en:`
<p>So far our courier vans drive across the city with transparent walls: anyone on the road can read every parcel. GRE is exactly that, plain text inside a new header. IPsec adds locked boxes. The clever part in DMVPN is that one key policy, written once, locks the van to head office and every van that later drives branch to branch, without naming a single branch in advance.</p>

<h3>From crypto maps to tunnel protection</h3>
<p>The ENCOR tunnels module showed crypto maps, which need an ACL and a <code>set peer</code> for every remote site. That cannot work for DMVPN, where peers appear dynamically. Instead you build an <b>IPsec profile</b> and attach it to the tunnel interface with <code>tunnel protection ipsec profile</code>. The router then automatically protects GRE traffic between its tunnel source and <b>any</b> NBMA peer it sends to: as soon as NHRP maps a peer, IKE negotiates an SA with it. The traffic selector is always "GRE (protocol 47) from my NBMA address to that peer's NBMA address".</p>

<h3>Why transport mode</h3>
<p>GRE already adds an outer IP header whose addresses are the same as the IPsec endpoints. ESP <b>tunnel mode</b> would add another identical 20-byte IP header. <b>Transport mode</b> keeps the GRE packet's outer header and inserts ESP after it, saving 20 bytes per packet. Cisco recommends transport mode for DMVPN; the router falls back to tunnel mode only if the peer insists.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="GRE over IPsec transport mode compared with tunnel mode">
<text x="10" y="35" class="svg-ink" font-size="12">Transport</text>
<rect x="90" y="18" width="100" height="30" rx="4" fill="#bae6fd"/><text x="140" y="38" text-anchor="middle" class="svg-ink" font-size="12">IP (NBMA)</text>
<rect x="195" y="18" width="70" height="30" rx="4" fill="#ddd6fe"/><text x="230" y="38" text-anchor="middle" class="svg-ink" font-size="12">ESP</text>
<rect x="270" y="18" width="60" height="30" rx="4" fill="#fde68a"/><text x="300" y="38" text-anchor="middle" class="svg-ink" font-size="12">GRE</text>
<rect x="335" y="18" width="150" height="30" rx="4" fill="#bbf7d0"/><text x="410" y="38" text-anchor="middle" class="svg-ink" font-size="12">inner IP + data</text>
<rect x="490" y="18" width="110" height="30" rx="4" fill="#ddd6fe"/><text x="545" y="38" text-anchor="middle" class="svg-ink" font-size="12">ESP trailer+ICV</text>
<text x="10" y="95" class="svg-ink" font-size="12">Tunnel</text>
<rect x="90" y="78" width="80" height="30" rx="4" fill="#e2e8f0"/><text x="130" y="98" text-anchor="middle" class="svg-ink" font-size="12">new IP</text>
<rect x="175" y="78" width="60" height="30" rx="4" fill="#ddd6fe"/><text x="205" y="98" text-anchor="middle" class="svg-ink" font-size="12">ESP</text>
<rect x="240" y="78" width="90" height="30" rx="4" fill="#bae6fd"/><text x="285" y="98" text-anchor="middle" class="svg-ink" font-size="12">IP (NBMA)</text>
<rect x="335" y="78" width="55" height="30" rx="4" fill="#fde68a"/><text x="362" y="98" text-anchor="middle" class="svg-ink" font-size="12">GRE</text>
<rect x="395" y="78" width="100" height="30" rx="4" fill="#bbf7d0"/><text x="445" y="98" text-anchor="middle" class="svg-ink" font-size="12">inner + data</text>
<rect x="500" y="78" width="100" height="30" rx="4" fill="#ddd6fe"/><text x="550" y="98" text-anchor="middle" class="svg-ink" font-size="12">ESP trailer</text>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">Tunnel mode repeats the same NBMA addresses: 20 extra bytes</text>
<text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">Encrypted part: from GRE header to ESP trailer</text>
</svg><p class="cap">Transport mode is the DMVPN default choice because GRE already provides the outer header.</p></div>

<h3>Lab 4 configuration: IKEv1 with a wildcard key</h3>
<pre class="code"><span class="c">! identical on HUB, SPOKE1 and SPOKE2</span>
crypto isakmp policy 10
 encryption aes 256
 hash sha256
 authentication pre-share
 group 14
<span class="c">! wildcard: any peer, because spokes can appear at any address</span>
crypto isakmp key NKvpn2026 address 0.0.0.0 0.0.0.0
crypto ipsec transform-set DMVPN-TS esp-aes 256 esp-sha256-hmac
 mode transport
crypto ipsec profile DMVPN-PROF
 set transform-set DMVPN-TS
interface Tunnel0
 tunnel protection ipsec profile DMVPN-PROF</pre>
<p>The <b>same</b> profile is applied on every router. There is no peer address anywhere except the wildcard. A wildcard pre-shared key means any device that knows the key can join, so large deployments use certificates (<code>authentication rsa-sig</code> with a PKI) instead; the rest of the configuration is unchanged.</p>

<h3>The IKEv2 equivalent</h3>
<pre class="code">crypto ikev2 keyring DMVPN-KR
 peer ANY
  address 0.0.0.0 0.0.0.0
  pre-shared-key NKvpn2026
crypto ikev2 profile DMVPN-IKEV2
 match identity remote address 0.0.0.0
 authentication remote pre-share
 authentication local pre-share
 keyring local DMVPN-KR
crypto ipsec profile DMVPN-PROF
 set transform-set DMVPN-TS
 set ikev2-profile DMVPN-IKEV2</pre>
<p>IKEv2 uses built-in "smart default" proposals and policies, so a proposal is optional. The only DMVPN-specific line is still <code>tunnel protection ipsec profile DMVPN-PROF</code>.</p>

<h3>Verification (lab 4)</h3>
<pre class="out">HUB# show crypto isakmp sa
IPv4 Crypto ISAKMP SA
dst             src             state          conn-id status
<span class="hl">100.64.10.2     100.64.20.2     QM_IDLE           1001 ACTIVE</span>
<span class="hl">100.64.10.2     100.64.30.2     QM_IDLE           1002 ACTIVE</span>

HUB# show crypto session
Interface: Tunnel0
Session status: UP-ACTIVE
Peer: 100.64.20.2 port 500
  IKEv1 SA: local 100.64.10.2/500 remote 100.64.20.2/500 Active
<span class="hl">  IPSEC FLOW: permit 47 host 100.64.10.2 host 100.64.20.2</span>
        Active SAs: 2, origin: crypto map

SPOKE1# show crypto ipsec sa peer 100.64.30.2
interface: Tunnel0
    Crypto map tag: Tunnel0-head-0, local addr 100.64.20.2
   local  ident (addr/mask/prot/port): (100.64.20.2/255.255.255.255/47/0)
   remote ident (addr/mask/prot/port): (100.64.30.2/255.255.255.255/47/0)
<span class="hl">    #pkts encaps: 42, #pkts encrypt: 42, #pkts digest: 42</span>
    #pkts decaps: 41, #pkts decrypt: 41, #pkts verify: 41
        transform: esp-256-aes esp-sha256-hmac ,
<span class="hl">        in use settings ={Transport, }</span></pre>
<p>Read it like this: one ISAKMP SA (QM_IDLE) and one IPsec SA pair <b>per peer</b>, even though there is one profile. The flow is always protocol 47 between two NBMA addresses. The spoke-to-spoke SA (SPOKE1 to 100.64.30.2) exists only because traffic triggered resolution; its encaps counter grows as PC1 pings PC2. <code>show dmvpn detail</code> lists the crypto session under each NHRP peer.</p>

<div class="eg"><p><b>Worked example: change order.</b> In lab 4, task 1 protects only the hub. From that moment the hub expects ESP while the spokes still send plain GRE, so registrations and OSPF hellos fail. Within one registration interval (100 s at holdtime 300) the spokes show the NHS as E and OSPF drops after 40 s. Once task 2 protects both spokes, IKE comes up, the spokes register again, and OSPF returns to FULL within a minute. In production, push the crypto config to all routers in one window, spokes first and the hub last, or use a maintenance window.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using <code>mode tunnel</code> (works, but wastes 20 bytes and shrinks the usable MTU). Mismatched transform sets or keys on one spoke: that spoke shows <code>show dmvpn</code> state <b>IKE</b> or <b>IPSEC</b> instead of UP. Two mGRE tunnels with the same source and the same profile without the <code>shared</code> keyword (<code>tunnel protection ipsec profile DMVPN-PROF shared</code>): SAs get torn down by the wrong tunnel.</p></div>

<div class="exam"><p><b>Exam trap.</b> DMVPN uses <code>crypto ipsec profile</code> + <code>tunnel protection</code>, not a crypto map (even though <code>show crypto session</code> says "origin: crypto map"). The proxy identity is <b>GRE (47)</b> between NBMA addresses. Recommended mode is <b>transport</b>. One profile, but one SA pair per peer, spokes included.</p></div>

<div class="scn"><h4>One store stuck in IKE</h4><p>After an IPsec rollout, all stores but one registered. <code>show dmvpn</code> on the hub listed that store with state IKE. <code>show crypto isakmp sa</code> showed the peer stuck in MM_KEY_EXCH and the log reported IKE messages from it that "failed its sanity check or is malformed", the classic sign of a wrong pre-shared key. The store's template still had an old <code>crypto isakmp key</code> value. Correcting the key brought the session to QM_IDLE and the store registered.</p><p><b>Lesson:</b> when <code>show dmvpn</code> says IKE or IPSEC, stop looking at NHRP and fix the crypto layer.</p></div>

<div class="iv"><p class="q">"How is IPsec applied in DMVPN and why is transport mode preferred?"</p><p>Strong answer: build an ISAKMP or IKEv2 policy with a wildcard key or certificates, a transform set in transport mode, an IPsec profile that references it, and apply it with <code>tunnel protection ipsec profile</code> on the mGRE tunnel of every router. The router automatically protects GRE between its NBMA address and each peer, creating an SA pair per peer on demand, including spoke-to-spoke. Transport mode avoids a duplicate outer IP header because GRE already carries the NBMA addresses, saving 20 bytes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DMVPN encryption = IPsec profile + <code>tunnel protection ipsec profile</code>; no crypto map, no peer list.</li>
<li>Traffic protected: GRE (47) between NBMA addresses; one SA pair per peer, created on demand.</li>
<li>Transport mode saves 20 bytes; it is the recommended mode.</li>
<li>Wildcard PSK (<code>address 0.0.0.0 0.0.0.0</code>) for dynamic peers; certificates for scale.</li>
<li>Verify with <code>show crypto isakmp sa</code>, <code>show crypto ipsec sa</code>, <code>show crypto session</code>, <code>show dmvpn detail</code>.</li>
</ul></div>
`,hi:`
<p>Ab tak hamari courier vans transparent deewaron ke saath shehar mein chal rahi thin: sadak par koi bhi har parcel padh sakta tha. GRE bilkul yahi hai, naye header ke andar plain text. IPsec locked boxes jodta hai. DMVPN mein smart baat yeh hai ki ek key policy, ek baar likhi hui, head office jaane wali van aur baad mein branch se branch jaane wali har van ko lock karti hai, pehle se ek bhi branch ka naam liye bina.</p>

<h3>Crypto maps se tunnel protection tak</h3>
<p>ENCOR tunnels module ne crypto maps dikhaye the, jinhe har remote site ke liye ACL aur <code>set peer</code> chahiye. DMVPN mein yeh nahi chal sakta, jahan peers dynamically aate hain. Iski jagah aap ek <b>IPsec profile</b> banate ho aur use <code>tunnel protection ipsec profile</code> se tunnel interface par lagate ho. Router phir apne tunnel source aur <b>kisi bhi</b> NBMA peer ke beech GRE traffic automatically protect karta hai: jaise hi NHRP kisi peer ko map karta hai, IKE uske saath SA negotiate karta hai. Traffic selector hamesha "mere NBMA address se us peer ke NBMA address tak GRE (protocol 47)" hota hai.</p>

<h3>Transport mode kyun</h3>
<p>GRE pehle se ek outer IP header jodta hai jiske addresses IPsec endpoints jaise hi hain. ESP <b>tunnel mode</b> ek aur same 20-byte IP header jod deta. <b>Transport mode</b> GRE packet ka outer header rakhta hai aur uske baad ESP daalta hai, har packet par 20 bytes bachata hai. Cisco DMVPN ke liye transport mode recommend karta hai; router tunnel mode par tabhi jaata hai jab peer zid kare.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="GRE over IPsec transport mode vs tunnel mode">
<text x="10" y="35" class="svg-ink" font-size="12">Transport</text>
<rect x="90" y="18" width="100" height="30" rx="4" fill="#bae6fd"/><text x="140" y="38" text-anchor="middle" class="svg-ink" font-size="12">IP (NBMA)</text>
<rect x="195" y="18" width="70" height="30" rx="4" fill="#ddd6fe"/><text x="230" y="38" text-anchor="middle" class="svg-ink" font-size="12">ESP</text>
<rect x="270" y="18" width="60" height="30" rx="4" fill="#fde68a"/><text x="300" y="38" text-anchor="middle" class="svg-ink" font-size="12">GRE</text>
<rect x="335" y="18" width="150" height="30" rx="4" fill="#bbf7d0"/><text x="410" y="38" text-anchor="middle" class="svg-ink" font-size="12">inner IP + data</text>
<rect x="490" y="18" width="110" height="30" rx="4" fill="#ddd6fe"/><text x="545" y="38" text-anchor="middle" class="svg-ink" font-size="12">ESP trailer+ICV</text>
<text x="10" y="95" class="svg-ink" font-size="12">Tunnel</text>
<rect x="90" y="78" width="80" height="30" rx="4" fill="#e2e8f0"/><text x="130" y="98" text-anchor="middle" class="svg-ink" font-size="12">naya IP</text>
<rect x="175" y="78" width="60" height="30" rx="4" fill="#ddd6fe"/><text x="205" y="98" text-anchor="middle" class="svg-ink" font-size="12">ESP</text>
<rect x="240" y="78" width="90" height="30" rx="4" fill="#bae6fd"/><text x="285" y="98" text-anchor="middle" class="svg-ink" font-size="12">IP (NBMA)</text>
<rect x="335" y="78" width="55" height="30" rx="4" fill="#fde68a"/><text x="362" y="98" text-anchor="middle" class="svg-ink" font-size="12">GRE</text>
<rect x="395" y="78" width="100" height="30" rx="4" fill="#bbf7d0"/><text x="445" y="98" text-anchor="middle" class="svg-ink" font-size="12">inner + data</text>
<rect x="500" y="78" width="100" height="30" rx="4" fill="#ddd6fe"/><text x="550" y="98" text-anchor="middle" class="svg-ink" font-size="12">ESP trailer</text>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">Tunnel mode same NBMA addresses dohrata hai: 20 extra bytes</text>
<text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">Encrypted hissa: GRE header se ESP trailer tak</text>
</svg><p class="cap">Transport mode DMVPN ka default choice hai kyunki GRE pehle se outer header deta hai.</p></div>

<h3>Lab 4 configuration: wildcard key ke saath IKEv1</h3>
<pre class="code"><span class="c">! HUB, SPOKE1 aur SPOKE2 par bilkul same</span>
crypto isakmp policy 10
 encryption aes 256
 hash sha256
 authentication pre-share
 group 14
<span class="c">! wildcard: koi bhi peer, kyunki spokes kisi bhi address par aa sakte hain</span>
crypto isakmp key NKvpn2026 address 0.0.0.0 0.0.0.0
crypto ipsec transform-set DMVPN-TS esp-aes 256 esp-sha256-hmac
 mode transport
crypto ipsec profile DMVPN-PROF
 set transform-set DMVPN-TS
interface Tunnel0
 tunnel protection ipsec profile DMVPN-PROF</pre>
<p>Har router par <b>same</b> profile lagta hai. Wildcard ke alawa kahin bhi peer address nahi hai. Wildcard pre-shared key ka matlab hai jo bhi device key jaanta hai woh join kar sakta hai, isliye bade deployments certificates (<code>authentication rsa-sig</code> PKI ke saath) use karte hain; baaki configuration same rehti hai.</p>

<h3>IKEv2 equivalent</h3>
<pre class="code">crypto ikev2 keyring DMVPN-KR
 peer ANY
  address 0.0.0.0 0.0.0.0
  pre-shared-key NKvpn2026
crypto ikev2 profile DMVPN-IKEV2
 match identity remote address 0.0.0.0
 authentication remote pre-share
 authentication local pre-share
 keyring local DMVPN-KR
crypto ipsec profile DMVPN-PROF
 set transform-set DMVPN-TS
 set ikev2-profile DMVPN-IKEV2</pre>
<p>IKEv2 built-in "smart default" proposals aur policies use karta hai, isliye proposal optional hai. DMVPN-specific line ab bhi sirf <code>tunnel protection ipsec profile DMVPN-PROF</code> hai.</p>

<h3>Verification (lab 4)</h3>
<pre class="out">HUB# show crypto isakmp sa
IPv4 Crypto ISAKMP SA
dst             src             state          conn-id status
<span class="hl">100.64.10.2     100.64.20.2     QM_IDLE           1001 ACTIVE</span>
<span class="hl">100.64.10.2     100.64.30.2     QM_IDLE           1002 ACTIVE</span>

HUB# show crypto session
Interface: Tunnel0
Session status: UP-ACTIVE
Peer: 100.64.20.2 port 500
  IKEv1 SA: local 100.64.10.2/500 remote 100.64.20.2/500 Active
<span class="hl">  IPSEC FLOW: permit 47 host 100.64.10.2 host 100.64.20.2</span>
        Active SAs: 2, origin: crypto map

SPOKE1# show crypto ipsec sa peer 100.64.30.2
interface: Tunnel0
    Crypto map tag: Tunnel0-head-0, local addr 100.64.20.2
   local  ident (addr/mask/prot/port): (100.64.20.2/255.255.255.255/47/0)
   remote ident (addr/mask/prot/port): (100.64.30.2/255.255.255.255/47/0)
<span class="hl">    #pkts encaps: 42, #pkts encrypt: 42, #pkts digest: 42</span>
    #pkts decaps: 41, #pkts decrypt: 41, #pkts verify: 41
        transform: esp-256-aes esp-sha256-hmac ,
<span class="hl">        in use settings ={Transport, }</span></pre>
<p>Aise padho: <b>har peer</b> ke liye ek ISAKMP SA (QM_IDLE) aur ek IPsec SA pair, bhale hi profile ek hai. Flow hamesha do NBMA addresses ke beech protocol 47 hai. Spoke-to-spoke SA (SPOKE1 se 100.64.30.2) sirf isliye exist karta hai kyunki traffic ne resolution trigger kiya; PC1 ke PC2 ping karne par uska encaps counter badhta hai. <code>show dmvpn detail</code> har NHRP peer ke neeche crypto session list karta hai.</p>

<div class="eg"><p><b>Worked example: change ka order.</b> Lab 4 mein task 1 sirf hub ko protect karta hai. Us pal se hub ESP expect karta hai jabki spokes ab bhi plain GRE bhejte hain, isliye registrations aur OSPF hellos fail hote hain. Ek registration interval ke andar (holdtime 300 par 100 s) spokes NHS ko E dikhate hain aur 40 s baad OSPF gir jaata hai. Task 2 dono spokes ko protect karta hai to IKE up hota hai, spokes phir register hote hain, aur OSPF ek minute mein FULL par wapas aa jaata hai. Production mein crypto config saare routers par ek window mein push karo, pehle spokes aur aakhir mein hub, ya maintenance window use karo.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> <code>mode tunnel</code> use karna (chalta hai, lekin 20 bytes barbaad karta hai aur usable MTU kam karta hai). Ek spoke par mismatched transform sets ya keys: woh spoke <code>show dmvpn</code> mein UP ki jagah state <b>IKE</b> ya <b>IPSEC</b> dikhata hai. Same source aur same profile wale do mGRE tunnels bina <code>shared</code> keyword ke (<code>tunnel protection ipsec profile DMVPN-PROF shared</code>): SAs galat tunnel se tod diye jaate hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> DMVPN <code>crypto ipsec profile</code> + <code>tunnel protection</code> use karta hai, crypto map nahi (bhale hi <code>show crypto session</code> "origin: crypto map" kahe). Proxy identity NBMA addresses ke beech <b>GRE (47)</b> hai. Recommended mode <b>transport</b> hai. Profile ek, lekin har peer ka ek SA pair, spokes bhi shamil.</p></div>

<div class="scn"><h4>Ek store IKE mein atka</h4><p>IPsec rollout ke baad ek ko chhod kar saare stores register ho gaye. Hub par <code>show dmvpn</code> us store ko state IKE mein dikha raha tha. <code>show crypto isakmp sa</code> peer ko MM_KEY_EXCH mein atka dikha raha tha aur log mein us peer ke IKE messages "failed its sanity check or is malformed" aa rahe the, jo galat pre-shared key ki classic nishani hai. Store ke template mein ab bhi purani <code>crypto isakmp key</code> value thi. Key theek karte hi session QM_IDLE hua aur store register ho gaya.</p><p><b>Seekh:</b> jab <code>show dmvpn</code> IKE ya IPSEC kahe, NHRP dekhna band karo aur crypto layer theek karo.</p></div>

<div class="iv"><p class="q">"DMVPN mein IPsec kaise lagaya jaata hai aur transport mode kyun prefer kiya jaata hai?"</p><p>Strong answer: wildcard key ya certificates ke saath ISAKMP ya IKEv2 policy, transport mode mein transform set, use reference karne wala IPsec profile banao, aur har router ke mGRE tunnel par <code>tunnel protection ipsec profile</code> se lagao. Router apne NBMA address aur har peer ke beech GRE automatically protect karta hai, zaroorat par har peer ka SA pair banata hai, spoke-to-spoke bhi. Transport mode duplicate outer IP header se bachata hai kyunki GRE pehle se NBMA addresses le jaata hai, 20 bytes bachte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DMVPN encryption = IPsec profile + <code>tunnel protection ipsec profile</code>; na crypto map, na peer list.</li>
<li>Protected traffic: NBMA addresses ke beech GRE (47); har peer ka ek SA pair, zaroorat par banta hai.</li>
<li>Transport mode 20 bytes bachata hai; yahi recommended mode hai.</li>
<li>Dynamic peers ke liye wildcard PSK (<code>address 0.0.0.0 0.0.0.0</code>); scale ke liye certificates.</li>
<li><code>show crypto isakmp sa</code>, <code>show crypto ipsec sa</code>, <code>show crypto session</code>, <code>show dmvpn detail</code> se verify karo.</li>
</ul></div>
`}};export{e as default};