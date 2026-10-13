var e={id:`authentication`,h:{en:`OSPFv3 authentication: IPsec and key chains`,hi:`OSPFv3 authentication: IPsec aur key chains`},body:{en:`
<p>OSPFv2 authentication is like writing a password on the outside of an envelope: the header of every packet carries the key digest. When OSPFv3 was designed, the authors removed those header fields completely and said: IPv6 already has a security layer, <b>IPsec</b>, so use it. That is like sending routing updates in a sealed diplomatic pouch instead. Years later, a lighter option arrived: an <b>authentication trailer</b> glued to the end of each packet, configured with a normal key chain. ENARSI expects you to know both.</p>

<h3>Why OSPFv3 is different</h3>
<p>The OSPFv3 packet header (RFC 5340) has no AuType or authentication field. Authentication happens in one of two ways:</p>
<table class="cmp"><tr><th>Method</th><th>Standard</th><th>How</th><th>Notes</th></tr>
<tr><td>IPsec AH</td><td>RFC 4552</td><td>Authentication header, integrity only</td><td>Manual SPI and key; needs a crypto (k9) image</td></tr>
<tr><td>IPsec ESP</td><td>RFC 4552</td><td>Integrity plus optional encryption</td><td>Can hide the OSPFv3 payload from sniffers</td></tr>
<tr><td>Authentication trailer</td><td>RFC 7166</td><td>HMAC digest appended to the packet</td><td>Key chain based, SHA-2, easy key rollover; newer IOS XE</td></tr>
</table>
<p>IPsec for OSPFv3 uses <b>manual keys</b>: there is no IKE negotiation, because OSPFv3 talks to multicast groups. You pick a <b>Security Parameter Index (SPI)</b>, a number from 256 to 4294967295 that labels the security association, and a key. Both ends of a link must use the <b>same SPI, same algorithm and same key</b>.</p>

<h3>IPsec on an interface (traditional style)</h3>
<pre class="code"><span class="c">! authentication only (AH), SHA-1 needs a 40-hex-digit key</span>
interface GigabitEthernet0/0
 ipv6 ospf authentication ipsec spi 256 sha1 1234567890ABCDEF1234567890ABCDEF12345678
<span class="c">! or ESP: encryption plus authentication (AES-128 needs 32 hex digits)</span>
interface GigabitEthernet0/0
 ipv6 ospf encryption ipsec spi 257 esp aes-cbc 128 0123456789ABCDEF0123456789ABCDEF sha1 1234567890ABCDEF1234567890ABCDEF12345678</pre>

<h3>IPsec for a whole area</h3>
<pre class="code">ipv6 router ospf 1
 area 0 authentication ipsec spi 500 md5 1234567890ABCDEF1234567890ABCDEF
<span class="c">! exempt one interface from the area policy</span>
interface GigabitEthernet0/2
 ipv6 ospf authentication null</pre>
<p><b>Interface settings override area settings.</b> MD5 keys are 32 hex digits, SHA-1 keys 40. In AF mode the same commands start with <code>ospfv3</code> on the interface (<code>ospfv3 authentication ipsec spi 256 sha1 ...</code>) and the area command goes under <code>router ospfv3</code>.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="OSPFv3 authentication options">
<rect x="20" y="30" width="190" height="60" rx="8" fill="#e2e8f0"/><text x="115" y="55" text-anchor="middle" class="svg-ink" font-size="13">IPv6 header</text><text x="115" y="74" text-anchor="middle" class="svg-muted" font-size="12">src FE80::, dst FF02::5</text>
<rect x="220" y="30" width="170" height="60" rx="8" fill="#fde68a"/><text x="305" y="55" text-anchor="middle" class="svg-ink" font-size="13">AH or ESP</text><text x="305" y="74" text-anchor="middle" class="svg-muted" font-size="12">SPI + key (IPsec)</text>
<rect x="400" y="30" width="220" height="60" rx="8" fill="#bae6fd"/><text x="510" y="64" text-anchor="middle" class="svg-ink" font-size="13">OSPFv3 packet</text>
<rect x="20" y="140" width="190" height="60" rx="8" fill="#e2e8f0"/><text x="115" y="175" text-anchor="middle" class="svg-ink" font-size="13">IPv6 header</text>
<rect x="220" y="140" width="220" height="60" rx="8" fill="#bae6fd"/><text x="330" y="175" text-anchor="middle" class="svg-ink" font-size="13">OSPFv3 packet</text>
<rect x="450" y="140" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="535" y="165" text-anchor="middle" class="svg-ink" font-size="13">Auth trailer</text><text x="535" y="184" text-anchor="middle" class="svg-muted" font-size="12">HMAC from key chain</text>
<text x="320" y="120" text-anchor="middle" class="svg-accent" font-size="12">IPsec (RFC 4552) above, authentication trailer (RFC 7166) below</text>
</svg><p class="cap">IPsec wraps the OSPFv3 packet; the newer trailer is appended after it and keyed from a key chain.</p></div>

<h3>The key-chain method (authentication trailer)</h3>
<p>Newer IOS XE releases support RFC 7166 for OSPFv3. It works like OSPFv2 HMAC-SHA authentication: a key chain holds one or more keys with an algorithm, and optional send and accept lifetimes for hitless key rollover.</p>
<pre class="code">key chain NK-OSPFV3
 key 1
  key-string NK-v3-Secret-01
  cryptographic-algorithm hmac-sha-256
interface GigabitEthernet0/0
 ospfv3 authentication key-chain NK-OSPFV3</pre>
<p>Advantages over IPsec: no crypto image or SPI planning, SHA-2 algorithms, and key rotation using lifetimes. Both neighbours must use the same key ID, key string and algorithm, and both must support the trailer; a router that does not understand it cannot form the adjacency.</p>

<h3>Verification and failure symptoms</h3>
<pre class="out">R1# show ipv6 ospf interface GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  Link Local Address FE80::5200:FF:FE01:0, Interface ID 3
  Area 0, Process ID 1, Instance ID 0, Router ID 1.1.1.1
  Network Type POINT_TO_POINT, Cost: 1
  <span class="hl">SHA-1 authentication SPI 256, secure socket UP (errors: 0)</span>
  Transmit Delay is 1 sec, State POINT_TO_POINT</pre>
<p><code>show crypto ipsec sa interface GigabitEthernet0/0</code> shows the inbound and outbound SAs with the SPI and packet counters. When the SPI or key differs, the neighbour disappears after the dead interval and nothing in <code>show ipv6 ospf neighbor</code> explains why. Look for errors in the interface output, rising drop counters in the SA, and syslog messages about packets with an invalid SPI.</p>

<div class="eg"><p><b>Worked example.</b> Secure the R1 to R2 link. On both routers, under Gi0/0: <code>ipv6 ospf authentication ipsec spi 256 sha1</code> followed by the same 40-hex-digit key. If you configure R1 first, the adjacency drops after up to 40 seconds (the dead interval) because R2 still sends unauthenticated Hellos; it comes back as soon as R2 matches. In production, configure both ends within the dead interval, or use a key chain whose accept lifetime overlaps.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using a key of the wrong length. SHA-1 needs exactly 40 hex digits and MD5 exactly 32; IOS rejects anything else. Another mistake: using the same SPI with different keys on two interfaces of one router; an SPI identifies one SA, so reuse it only with the same key and algorithm.</p></div>

<div class="exam"><p><b>Exam trap.</b> "OSPFv3 uses the same MD5 authentication field as OSPFv2" is false. OSPFv3 relies on IPsec (AH or ESP) or on the RFC 7166 trailer. Also, OSPFv2 authentication commands (<code>ip ospf authentication</code>) never protect OSPFv3.</p></div>

<div class="scn"><h4>The key rotation that dropped a site</h4><p>A bank's security policy required quarterly key changes on OSPFv3 IPsec links. During one change the engineer pasted a new SHA-1 key that was missing one hex digit on the branch router. IOS rejected the line, but the old line had already been removed, so the branch side now had no authentication while the hub still required it. After 40 seconds the neighbour dropped. <code>show ipv6 ospf interface</code> on the hub showed the SPI with errors; the branch interface showed no authentication line. Re-entering the full key fixed it. The team then moved to key chains with overlapping lifetimes.</p><p><b>Lesson:</b> check key length and both ends; prefer key chains where supported so rotations are hitless.</p></div>

<div class="iv"><p class="q">"How is OSPFv3 authentication different from OSPFv2?"</p><p>Strong answer: OSPFv3 removed the authentication fields from its header. Traditionally it uses IPsec, AH for integrity or ESP for integrity plus encryption, with manually configured SPIs and keys per interface or per area; interface settings override area settings. Newer IOS XE also supports the RFC 7166 authentication trailer with key chains and HMAC-SHA algorithms, which is simpler and allows hitless key rollover. Mention that a mismatch shows as a missing neighbour with no clear error, so you verify with <code>show ipv6 ospf interface</code> and <code>show crypto ipsec sa</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPFv3 has no authentication fields in its header; it uses IPsec (RFC 4552) or the auth trailer (RFC 7166).</li>
<li>IPsec: manual SPI (256 and up) plus key; AH for integrity, ESP for integrity and encryption.</li>
<li>Interface-level authentication overrides area-level; <code>authentication null</code> exempts an interface.</li>
<li>Key chains with HMAC-SHA give simpler config and hitless rotation on newer IOS XE.</li>
<li>Mismatch symptom: neighbour lost after the dead interval; check interface errors and SA counters.</li>
</ul></div>
`,hi:`
<p>OSPFv2 authentication aisa hai jaise envelope ke bahar password likhna: har packet ka header key digest le jaata hai. Jab OSPFv3 design hua, to authors ne woh header fields poori tarah hata diye aur kaha: IPv6 ke paas pehle se ek security layer hai, <b>IPsec</b>, use hi use karo. Yeh routing updates ko sealed diplomatic pouch mein bhejne jaisa hai. Saalon baad ek halka option aaya: har packet ke end par chipka ek <b>authentication trailer</b>, jo normal key chain se configure hota hai. ENARSI expect karta hai ki aap dono jaano.</p>

<h3>OSPFv3 alag kyun hai</h3>
<p>OSPFv3 packet header (RFC 5340) mein koi AuType ya authentication field nahi hai. Authentication do mein se ek tarike se hota hai:</p>
<table class="cmp"><tr><th>Method</th><th>Standard</th><th>Kaise</th><th>Notes</th></tr>
<tr><td>IPsec AH</td><td>RFC 4552</td><td>Authentication header, sirf integrity</td><td>Manual SPI aur key; crypto (k9) image chahiye</td></tr>
<tr><td>IPsec ESP</td><td>RFC 4552</td><td>Integrity plus optional encryption</td><td>OSPFv3 payload ko sniffers se chhupa sakta hai</td></tr>
<tr><td>Authentication trailer</td><td>RFC 7166</td><td>Packet ke saath juda HMAC digest</td><td>Key chain based, SHA-2, aasaan key rollover; naya IOS XE</td></tr>
</table>
<p>OSPFv3 ke liye IPsec <b>manual keys</b> use karta hai: koi IKE negotiation nahi hota, kyunki OSPFv3 multicast groups se baat karta hai. Aap ek <b>Security Parameter Index (SPI)</b> chunte ho, 256 se 4294967295 tak ka number jo security association ko label karta hai, aur ek key. Link ke dono ends par <b>same SPI, same algorithm aur same key</b> hona chahiye.</p>

<h3>Interface par IPsec (traditional style)</h3>
<pre class="code"><span class="c">! sirf authentication (AH), SHA-1 ko 40-hex-digit key chahiye</span>
interface GigabitEthernet0/0
 ipv6 ospf authentication ipsec spi 256 sha1 1234567890ABCDEF1234567890ABCDEF12345678
<span class="c">! ya ESP: encryption plus authentication (AES-128 ko 32 hex digits chahiye)</span>
interface GigabitEthernet0/0
 ipv6 ospf encryption ipsec spi 257 esp aes-cbc 128 0123456789ABCDEF0123456789ABCDEF sha1 1234567890ABCDEF1234567890ABCDEF12345678</pre>

<h3>Poore area ke liye IPsec</h3>
<pre class="code">ipv6 router ospf 1
 area 0 authentication ipsec spi 500 md5 1234567890ABCDEF1234567890ABCDEF
<span class="c">! ek interface ko area policy se chhoot do</span>
interface GigabitEthernet0/2
 ipv6 ospf authentication null</pre>
<p><b>Interface settings area settings ko override karti hain.</b> MD5 keys 32 hex digits ki hoti hain, SHA-1 keys 40 ki. AF mode mein same commands interface par <code>ospfv3</code> se shuru hoti hain (<code>ospfv3 authentication ipsec spi 256 sha1 ...</code>) aur area command <code>router ospfv3</code> ke neeche jaati hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="OSPFv3 authentication options">
<rect x="20" y="30" width="190" height="60" rx="8" fill="#e2e8f0"/><text x="115" y="55" text-anchor="middle" class="svg-ink" font-size="13">IPv6 header</text><text x="115" y="74" text-anchor="middle" class="svg-muted" font-size="12">src FE80::, dst FF02::5</text>
<rect x="220" y="30" width="170" height="60" rx="8" fill="#fde68a"/><text x="305" y="55" text-anchor="middle" class="svg-ink" font-size="13">AH ya ESP</text><text x="305" y="74" text-anchor="middle" class="svg-muted" font-size="12">SPI + key (IPsec)</text>
<rect x="400" y="30" width="220" height="60" rx="8" fill="#bae6fd"/><text x="510" y="64" text-anchor="middle" class="svg-ink" font-size="13">OSPFv3 packet</text>
<rect x="20" y="140" width="190" height="60" rx="8" fill="#e2e8f0"/><text x="115" y="175" text-anchor="middle" class="svg-ink" font-size="13">IPv6 header</text>
<rect x="220" y="140" width="220" height="60" rx="8" fill="#bae6fd"/><text x="330" y="175" text-anchor="middle" class="svg-ink" font-size="13">OSPFv3 packet</text>
<rect x="450" y="140" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="535" y="165" text-anchor="middle" class="svg-ink" font-size="13">Auth trailer</text><text x="535" y="184" text-anchor="middle" class="svg-muted" font-size="12">key chain se HMAC</text>
<text x="320" y="120" text-anchor="middle" class="svg-accent" font-size="12">Upar IPsec (RFC 4552), neeche authentication trailer (RFC 7166)</text>
</svg><p class="cap">IPsec OSPFv3 packet ko wrap karta hai; naya trailer uske baad juda hota hai aur key chain se key hota hai.</p></div>

<h3>Key-chain method (authentication trailer)</h3>
<p>Naye IOS XE releases OSPFv3 ke liye RFC 7166 support karte hain. Yeh OSPFv2 HMAC-SHA authentication jaisa kaam karta hai: key chain mein ek ya zyada keys algorithm ke saath hoti hain, aur hitless key rollover ke liye optional send aur accept lifetimes.</p>
<pre class="code">key chain NK-OSPFV3
 key 1
  key-string NK-v3-Secret-01
  cryptographic-algorithm hmac-sha-256
interface GigabitEthernet0/0
 ospfv3 authentication key-chain NK-OSPFV3</pre>
<p>IPsec se fayde: crypto image ya SPI planning nahi chahiye, SHA-2 algorithms, aur lifetimes se key rotation. Dono neighbours ko same key ID, key string aur algorithm use karna chahiye, aur dono ko trailer support karna chahiye; jo router ise nahi samajhta woh adjacency nahi bana sakta.</p>

<h3>Verification aur failure symptoms</h3>
<pre class="out">R1# show ipv6 ospf interface GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  Link Local Address FE80::5200:FF:FE01:0, Interface ID 3
  Area 0, Process ID 1, Instance ID 0, Router ID 1.1.1.1
  Network Type POINT_TO_POINT, Cost: 1
  <span class="hl">SHA-1 authentication SPI 256, secure socket UP (errors: 0)</span>
  Transmit Delay is 1 sec, State POINT_TO_POINT</pre>
<p><code>show crypto ipsec sa interface GigabitEthernet0/0</code> SPI aur packet counters ke saath inbound aur outbound SAs dikhata hai. Jab SPI ya key alag ho, to dead interval ke baad neighbour gayab ho jaata hai aur <code>show ipv6 ospf neighbor</code> mein kuch nahi batata kyun. Interface output mein errors, SA mein badhte drop counters, aur invalid SPI wale packets ke baare mein syslog messages dekho.</p>

<div class="eg"><p><b>Worked example.</b> R1 se R2 link secure karo. Dono routers par Gi0/0 ke neeche: <code>ipv6 ospf authentication ipsec spi 256 sha1</code> ke baad same 40-hex-digit key. Agar aap pehle R1 configure karte ho, to adjacency 40 seconds tak (dead interval) mein drop hoti hai kyunki R2 abhi bhi bina authentication ke Hellos bhejta hai; R2 match karte hi wapas aa jaati hai. Production mein dono ends dead interval ke andar configure karo, ya overlapping accept lifetime wali key chain use karo.</p></div>

<div class="warn"><p><b>Common galti.</b> Galat length ki key use karna. SHA-1 ko exactly 40 hex digits aur MD5 ko exactly 32 chahiye; IOS baaki sab reject karta hai. Ek aur galti: ek router ke do interfaces par same SPI alag keys ke saath use karna; SPI ek SA ko identify karta hai, isliye use sirf same key aur algorithm ke saath reuse karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> "OSPFv3 OSPFv2 wala hi MD5 authentication field use karta hai" galat hai. OSPFv3 IPsec (AH ya ESP) ya RFC 7166 trailer par nirbhar hai. Aur OSPFv2 authentication commands (<code>ip ospf authentication</code>) OSPFv3 ko kabhi protect nahi karti.</p></div>

<div class="scn"><h4>Key rotation jisne ek site gira di</h4><p>Ek bank ki security policy OSPFv3 IPsec links par har quarter key change maangti thi. Ek change ke dauraan engineer ne branch router par nayi SHA-1 key paste ki jisme ek hex digit kam tha. IOS ne line reject kar di, lekin purani line pehle hi hata di gayi thi, isliye branch side par ab koi authentication nahi thi jabki hub abhi bhi maang raha tha. 40 seconds baad neighbour drop ho gaya. Hub par <code>show ipv6 ospf interface</code> ne errors ke saath SPI dikhaya; branch interface par koi authentication line nahi thi. Poori key dobara daalne se fix hua. Phir team overlapping lifetimes wali key chains par shift ho gayi.</p><p><b>Seekh:</b> key length aur dono ends check karo; jahan support ho wahan key chains prefer karo taaki rotations hitless hon.</p></div>

<div class="iv"><p class="q">"OSPFv3 authentication OSPFv2 se kaise alag hai?"</p><p>Strong answer: OSPFv3 ne apne header se authentication fields hata diye. Traditionally yeh IPsec use karta hai, integrity ke liye AH ya integrity plus encryption ke liye ESP, har interface ya har area par manually configure SPIs aur keys ke saath; interface settings area settings ko override karti hain. Naya IOS XE key chains aur HMAC-SHA algorithms ke saath RFC 7166 authentication trailer bhi support karta hai, jo simple hai aur hitless key rollover deta hai. Batao ki mismatch bina clear error ke missing neighbour ki tarah dikhta hai, isliye aap <code>show ipv6 ospf interface</code> aur <code>show crypto ipsec sa</code> se verify karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPFv3 ke header mein authentication fields nahi hain; yeh IPsec (RFC 4552) ya auth trailer (RFC 7166) use karta hai.</li>
<li>IPsec: manual SPI (256 aur upar) plus key; integrity ke liye AH, integrity aur encryption ke liye ESP.</li>
<li>Interface-level authentication area-level ko override karta hai; <code>authentication null</code> ek interface ko chhoot deta hai.</li>
<li>HMAC-SHA wali key chains naye IOS XE par simple config aur hitless rotation deti hain.</li>
<li>Mismatch symptom: dead interval ke baad neighbour lost; interface errors aur SA counters check karo.</li>
</ul></div>
`}};export{e as default};