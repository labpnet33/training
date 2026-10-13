var e={id:`trustsec-macsec`,h:{en:`TrustSec (SGT, SXP, SGACL) and MACsec`,hi:`TrustSec (SGT, SXP, SGACL) aur MACsec`},body:{en:`
<p>In a hospital, doors do not check your home address; they check the colour of your badge. Doctors, nurses, visitors and contractors each have a colour, and a door rule says "red badges may not enter the pharmacy". Nobody rewrites the rules when a doctor moves office. <b>TrustSec</b> gives every packet a badge colour, the <b>Security Group Tag</b>, and writes policy between colours instead of between IP addresses. <b>MACsec</b> is the armoured corridor: it makes sure nobody can read or change the traffic (or forge its badge) on the wire.</p>

<h3>Why IP-based ACLs stop scaling</h3>
<p>Suppose 50 user subnets must be kept away from 20 server subnets with some exceptions. That is up to 1,000 ACL lines, repeated on every enforcement point, and wrong the moment DHCP gives a user a new address or a server moves. TrustSec writes the same intent as "Employees may reach Web servers, Guests may reach nothing internal": a small <b>matrix of roles</b>.</p>

<h3>The three functions: classify, propagate, enforce</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="TrustSec classification, propagation and enforcement">
<rect x="10" y="80" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="60" y="102" text-anchor="middle" class="svg-ink" font-size="12">PC1 alice</text><text x="60" y="118" text-anchor="middle" class="svg-muted" font-size="12">10.20.20.10</text>
<rect x="150" y="80" width="120" height="50" rx="8" fill="#bae6fd"/><text x="210" y="102" text-anchor="middle" class="svg-ink" font-size="12">Access switch</text><text x="210" y="118" text-anchor="middle" class="svg-accent" font-size="12">classify: SGT 10</text>
<rect x="320" y="80" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="380" y="102" text-anchor="middle" class="svg-ink" font-size="12">Core / DC switch</text><text x="380" y="118" text-anchor="middle" class="svg-muted" font-size="12">egress enforce</text>
<rect x="490" y="80" width="140" height="50" rx="8" fill="#fed7aa"/><text x="560" y="102" text-anchor="middle" class="svg-ink" font-size="12">Printer server</text><text x="560" y="118" text-anchor="middle" class="svg-muted" font-size="12">SGT 30</text>
<line x1="110" y1="105" x2="150" y2="105" stroke="#64748b" stroke-width="2"/><line x1="270" y1="105" x2="320" y2="105" stroke="#64748b" stroke-width="3"/><line x1="440" y1="105" x2="490" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="295" y="70" text-anchor="middle" class="svg-accent" font-size="12">inline tag</text>
<rect x="150" y="165" width="120" height="40" rx="8" fill="#e2e8f0"/><text x="210" y="190" text-anchor="middle" class="svg-ink" font-size="12">Old switch</text>
<rect x="320" y="165" width="120" height="40" rx="8" fill="#fde68a"/><text x="380" y="190" text-anchor="middle" class="svg-ink" font-size="12">Firewall</text>
<line x1="270" y1="185" x2="320" y2="185" stroke="#64748b" stroke-dasharray="5 4"/><text x="295" y="157" text-anchor="middle" class="svg-muted" font-size="12">SXP</text>
<rect x="150" y="10" width="290" height="36" rx="8" fill="#fde68a"/><text x="295" y="33" text-anchor="middle" class="svg-ink" font-size="12">ISE: SGT names and SGACL matrix</text>
</svg><p class="cap">Tag at the edge, carry the tag inline (or share bindings with SXP), enforce with SGACLs near the destination.</p></div>
<ol>
<li><b>Classification.</b> An SGT (a 16-bit number with a name, e.g. 10 = Employees) is assigned where traffic enters. <b>Dynamic</b>: from ISE in the Access-Accept after 802.1X, MAB or WebAuth, exactly as alice gets SGT 10 in the lab. <b>Static</b>: IP to SGT (<code>cts role-based sgt-map 10.99.99.10 sgt 99</code>), VLAN to SGT, subnet to SGT or port to SGT, typically for servers in the data center.</li>
<li><b>Propagation.</b> The tag must reach the enforcement point. <b>Inline tagging</b> adds a Cisco Meta Data header (EtherType 0x8909) carrying the SGT to each frame between capable devices, hop by hop, in hardware. Where hardware cannot tag, <b>SXP</b> (SGT Exchange Protocol, TCP 64999) sends IP-to-SGT bindings in the control plane from a <b>speaker</b> to a <b>listener</b>. pxGrid shares bindings with firewalls, and in SD-Access the VXLAN header carries the SGT.</li>
<li><b>Enforcement.</b> ISE holds the <b>SGACL matrix</b>: rows are source SGTs, columns destination SGTs, cells are role-based ACLs. Switches download the cells for destinations attached to them and enforce at <b>egress</b>, where both source and destination tags are known. Secure Firewall can also use SGTs in its rules.</li>
</ol>

<h3>Configuration snapshots</h3>
<pre class="code"><span class="c">! enforcement and a local role-based ACL (also works in the lab)</span>
SW1(config)# ip access-list role-based NO-PRINT
SW1(config-rb-acl)# deny ip
SW1(config)# cts role-based permissions from 50 to 30 NO-PRINT
SW1(config)# cts role-based enforcement
SW1(config)# cts role-based sgt-map 10.99.99.10 sgt 99
<span class="c">! inline tagging on an uplink between two TrustSec-capable switches</span>
SW1(config)# interface TenGigabitEthernet1/1/1
SW1(config-if)# cts manual
SW1(config-if-cts-manual)# policy static sgt 2 trusted
<span class="c">! SXP from an access switch without inline tagging to a firewall</span>
SW2(config)# cts sxp enable
SW2(config)# cts sxp default password NKsxp
SW2(config)# cts sxp connection peer 10.99.99.2 source 10.99.99.3 password default mode local speaker</pre>
<pre class="out">SW1# show cts role-based sgt-map all
Active IPv4-SGT Bindings Information

IP Address              SGT     Source
============================================
<span class="hl">10.20.20.10             10      LOCAL</span>
10.30.30.10             30      LOCAL
10.99.99.10             99      CLI

IP-SGT Active Bindings Summary
============================================
Total number of LOCAL    bindings = 2
Total number of CLI      bindings = 1
Total number of active   bindings = 3</pre>
<p><b>LOCAL</b> bindings were learned from authentication sessions (alice and the printer); <b>CLI</b> bindings are static. <code>show cts role-based permissions</code> shows the matrix cells and whether enforcement is enabled.</p>

<h3>MACsec: encryption on the wire</h3>
<p><b>MACsec (IEEE 802.1AE)</b> encrypts and integrity-protects Ethernet frames <b>hop by hop</b> between two directly connected devices, at line rate in hardware, with AES-GCM (128 or 256 bit). Each frame gains a SecTAG (EtherType 0x88E5) and a 16-byte ICV, up to 32 bytes of overhead, so raise the MTU on MACsec links. Keys are negotiated by <b>MKA</b> (MACsec Key Agreement, 802.1X-2010) in EAPOL-MKA frames: a long-term <b>CAK</b> is used to distribute short-term <b>SAKs</b> chosen by the key server.</p>
<table class="cmp"><tr><th></th><th>Downlink (switch to host)</th><th>Uplink (switch to switch)</th></tr>
<tr><td>Where the CAK comes from</td><td>The 802.1X EAP session (EAP-TLS or PEAP key material)</td><td>A pre-shared key in a key chain (or 802.1X between switches)</td></tr>
<tr><td>Policy</td><td>ISE returns <code>linksec-policy</code> must-secure or should-secure</td><td>Configured on both ends</td></tr>
<tr><td>Typical use</td><td>Protect users on untrusted floors</td><td>Links between buildings, dark fibre, carrier Ethernet</td></tr>
</table>
<pre class="code">SW1(config)# key chain MKA-KC macsec
SW1(config-keychain-macsec)# key 01
SW1(config-keychain-macsec-key)# cryptographic-algorithm aes-128-cmac
SW1(config-keychain-macsec-key)# key-string 00112233445566778899AABBCCDDEEFF
SW1(config)# mka policy MKA-POL
SW1(config-mka-policy)# macsec-cipher-suite gcm-aes-128
SW1(config)# interface TenGigabitEthernet1/1/2
SW1(config-if)# macsec network-link
SW1(config-if)# mka policy MKA-POL
SW1(config-if)# mka pre-shared-key key-chain MKA-KC</pre>
<p>Verify with <code>show mka sessions</code> (status <b>Secured</b>) and <code>show macsec summary</code>.</p>

<div class="eg"><p><b>Worked example.</b> A campus has 12 buildings joined by leased dark fibre. The security team fears a tap on the fibre. MACsec on the 24 inter-building 10G links adds at most 32 bytes per frame; the team raises the link MTU from 1500 to 1600 so full-size frames and the CMD header both fit, and keeps line-rate throughput because encryption runs in the switch ASIC.</p></div>

<div class="warn"><p><b>Common mistake.</b> Turning on <code>cts role-based enforcement</code> before every server has an SGT. Traffic to untagged destinations is evaluated as "Unknown" (SGT 0) and a default-deny matrix cell silently blocks it. Classify first, monitor, then enforce.</p></div>

<div class="exam"><p><b>Exam trap.</b> SXP is a <b>control-plane</b> protocol (TCP) that shares IP-to-SGT bindings; inline tagging is <b>data-plane</b>. SGACLs are enforced at <b>egress</b>. MACsec is <b>hop by hop</b> at layer 2, unlike IPsec, which is end to end at layer 3.</p></div>

<div class="scn"><h4>The ACL that nobody could maintain</h4><p>A university had 4,800 lines of ACLs across its distribution switches to keep students, staff, research labs and building systems apart. Each semester, subnet changes broke something. The team moved to TrustSec: ISE assigned SGTs from 802.1X and MAB, data center servers got static IP-to-SGT mappings, older access switches used SXP, and the policy became a 9 x 9 matrix in ISE. Moving a lab to a new building now needed no ACL change at all.</p><p><b>Lesson:</b> policy by role survives address changes; policy by IP does not.</p></div>

<div class="iv"><p class="q">"Explain TrustSec in three steps, and when you would use SXP."</p><p>Strong answer: classify (assign an SGT dynamically via ISE after 802.1X/MAB or statically by IP, subnet, VLAN or port), propagate (inline tagging with the CMD header between capable devices, or SXP over TCP 64999 from speaker to listener where hardware cannot tag, or pxGrid to firewalls), enforce (SGACL matrix from ISE, applied at egress on switches, or SGT-based firewall rules). Use SXP for older access switches or across devices that cannot tag. Mention MACsec to protect tags on the wire.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SGT = 16-bit role tag; policy is a source-by-destination SGACL matrix in ISE.</li>
<li>Classify dynamically (ISE) or statically (IP, subnet, VLAN, port).</li>
<li>Propagate inline (CMD header, EtherType 0x8909) or via SXP (TCP 64999, speaker to listener).</li>
<li>Enforce at egress with SGACLs; enable with <code>cts role-based enforcement</code>.</li>
<li>MACsec 802.1AE: hop-by-hop AES-GCM, keys by MKA; downlink from 802.1X, uplink from pre-shared keys.</li>
</ul></div>
`,hi:`
<p>Hospital mein darwaze aapke ghar ka address check nahi karte; woh aapke badge ka rang check karte hain. Doctors, nurses, visitors aur contractors ka apna rang hai, aur door rule kehta hai "red badges pharmacy mein nahi ja sakte". Doctor office badle to koi rules dobara nahi likhta. <b>TrustSec</b> har packet ko badge ka rang deta hai, <b>Security Group Tag</b>, aur policy IP addresses ke beech nahi, rangon ke beech likhta hai. <b>MACsec</b> armoured corridor hai: yeh pakka karta hai ki wire par koi traffic padh ya badal na sake (ya uska badge forge na kar sake).</p>

<h3>IP-based ACLs scale karna kyun band kar dete hain</h3>
<p>Maan lo 50 user subnets ko kuch exceptions ke saath 20 server subnets se door rakhna hai. Yeh 1,000 tak ACL lines hain, har enforcement point par repeat, aur jaise hi DHCP user ko naya address de ya server move ho, galat. TrustSec wahi intent aise likhta hai "Employees Web servers tak ja sakte hain, Guests andar kahin nahi": <b>roles ka chhota matrix</b>.</p>

<h3>Teen functions: classify, propagate, enforce</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="TrustSec classification, propagation aur enforcement">
<rect x="10" y="80" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="60" y="102" text-anchor="middle" class="svg-ink" font-size="12">PC1 alice</text><text x="60" y="118" text-anchor="middle" class="svg-muted" font-size="12">10.20.20.10</text>
<rect x="150" y="80" width="120" height="50" rx="8" fill="#bae6fd"/><text x="210" y="102" text-anchor="middle" class="svg-ink" font-size="12">Access switch</text><text x="210" y="118" text-anchor="middle" class="svg-accent" font-size="12">classify: SGT 10</text>
<rect x="320" y="80" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="380" y="102" text-anchor="middle" class="svg-ink" font-size="12">Core / DC switch</text><text x="380" y="118" text-anchor="middle" class="svg-muted" font-size="12">egress enforce</text>
<rect x="490" y="80" width="140" height="50" rx="8" fill="#fed7aa"/><text x="560" y="102" text-anchor="middle" class="svg-ink" font-size="12">Printer server</text><text x="560" y="118" text-anchor="middle" class="svg-muted" font-size="12">SGT 30</text>
<line x1="110" y1="105" x2="150" y2="105" stroke="#64748b" stroke-width="2"/><line x1="270" y1="105" x2="320" y2="105" stroke="#64748b" stroke-width="3"/><line x1="440" y1="105" x2="490" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="295" y="70" text-anchor="middle" class="svg-accent" font-size="12">inline tag</text>
<rect x="150" y="165" width="120" height="40" rx="8" fill="#e2e8f0"/><text x="210" y="190" text-anchor="middle" class="svg-ink" font-size="12">Purana switch</text>
<rect x="320" y="165" width="120" height="40" rx="8" fill="#fde68a"/><text x="380" y="190" text-anchor="middle" class="svg-ink" font-size="12">Firewall</text>
<line x1="270" y1="185" x2="320" y2="185" stroke="#64748b" stroke-dasharray="5 4"/><text x="295" y="157" text-anchor="middle" class="svg-muted" font-size="12">SXP</text>
<rect x="150" y="10" width="290" height="36" rx="8" fill="#fde68a"/><text x="295" y="33" text-anchor="middle" class="svg-ink" font-size="12">ISE: SGT names aur SGACL matrix</text>
</svg><p class="cap">Edge par tag lagao, tag inline carry karo (ya SXP se bindings share karo), destination ke paas SGACLs se enforce karo.</p></div>
<ol>
<li><b>Classification.</b> SGT (naam wala 16-bit number, jaise 10 = Employees) wahan assign hota hai jahan traffic enter karta hai. <b>Dynamic</b>: 802.1X, MAB ya WebAuth ke baad Access-Accept mein ISE se, bilkul jaise lab mein alice ko SGT 10 milta hai. <b>Static</b>: IP to SGT (<code>cts role-based sgt-map 10.99.99.10 sgt 99</code>), VLAN to SGT, subnet to SGT ya port to SGT, aam taur par data center ke servers ke liye.</li>
<li><b>Propagation.</b> Tag ko enforcement point tak pahunchna chahiye. <b>Inline tagging</b> capable devices ke beech har frame mein SGT carry karne wala Cisco Meta Data header (EtherType 0x8909) jodta hai, hop by hop, hardware mein. Jahan hardware tag nahi kar sakta, wahan <b>SXP</b> (SGT Exchange Protocol, TCP 64999) control plane mein IP-to-SGT bindings <b>speaker</b> se <b>listener</b> ko bhejta hai. pxGrid firewalls ke saath bindings share karta hai, aur SD-Access mein VXLAN header SGT carry karta hai.</li>
<li><b>Enforcement.</b> ISE <b>SGACL matrix</b> rakhta hai: rows source SGTs, columns destination SGTs, cells role-based ACLs. Switches un destinations ke cells download karte hain jo unse jude hain aur <b>egress</b> par enforce karte hain, jahan source aur destination dono tags pata hote hain. Secure Firewall bhi apne rules mein SGTs use kar sakta hai.</li>
</ol>

<h3>Configuration snapshots</h3>
<pre class="code"><span class="c">! enforcement aur local role-based ACL (lab mein bhi chalta hai)</span>
SW1(config)# ip access-list role-based NO-PRINT
SW1(config-rb-acl)# deny ip
SW1(config)# cts role-based permissions from 50 to 30 NO-PRINT
SW1(config)# cts role-based enforcement
SW1(config)# cts role-based sgt-map 10.99.99.10 sgt 99
<span class="c">! do TrustSec-capable switches ke beech uplink par inline tagging</span>
SW1(config)# interface TenGigabitEthernet1/1/1
SW1(config-if)# cts manual
SW1(config-if-cts-manual)# policy static sgt 2 trusted
<span class="c">! bina inline tagging wale access switch se firewall tak SXP</span>
SW2(config)# cts sxp enable
SW2(config)# cts sxp default password NKsxp
SW2(config)# cts sxp connection peer 10.99.99.2 source 10.99.99.3 password default mode local speaker</pre>
<pre class="out">SW1# show cts role-based sgt-map all
Active IPv4-SGT Bindings Information

IP Address              SGT     Source
============================================
<span class="hl">10.20.20.10             10      LOCAL</span>
10.30.30.10             30      LOCAL
10.99.99.10             99      CLI

IP-SGT Active Bindings Summary
============================================
Total number of LOCAL    bindings = 2
Total number of CLI      bindings = 1
Total number of active   bindings = 3</pre>
<p><b>LOCAL</b> bindings authentication sessions se seekhi gayi (alice aur printer); <b>CLI</b> bindings static hain. <code>show cts role-based permissions</code> matrix cells aur enforcement enabled hai ya nahi dikhata hai.</p>

<h3>MACsec: wire par encryption</h3>
<p><b>MACsec (IEEE 802.1AE)</b> do directly connected devices ke beech Ethernet frames ko <b>hop by hop</b> encrypt aur integrity-protect karta hai, hardware mein line rate par, AES-GCM (128 ya 256 bit) ke saath. Har frame mein SecTAG (EtherType 0x88E5) aur 16-byte ICV judta hai, 32 bytes tak overhead, isliye MACsec links par MTU badhao. Keys <b>MKA</b> (MACsec Key Agreement, 802.1X-2010) EAPOL-MKA frames mein negotiate karta hai: long-term <b>CAK</b> se key server ke chune short-term <b>SAKs</b> distribute hote hain.</p>
<table class="cmp"><tr><th></th><th>Downlink (switch se host)</th><th>Uplink (switch se switch)</th></tr>
<tr><td>CAK kahan se aata hai</td><td>802.1X EAP session se (EAP-TLS ya PEAP key material)</td><td>Key chain mein pre-shared key (ya switches ke beech 802.1X)</td></tr>
<tr><td>Policy</td><td>ISE <code>linksec-policy</code> must-secure ya should-secure return karta hai</td><td>Dono ends par configured</td></tr>
<tr><td>Typical use</td><td>Untrusted floors par users ko protect karna</td><td>Buildings ke beech links, dark fibre, carrier Ethernet</td></tr>
</table>
<pre class="code">SW1(config)# key chain MKA-KC macsec
SW1(config-keychain-macsec)# key 01
SW1(config-keychain-macsec-key)# cryptographic-algorithm aes-128-cmac
SW1(config-keychain-macsec-key)# key-string 00112233445566778899AABBCCDDEEFF
SW1(config)# mka policy MKA-POL
SW1(config-mka-policy)# macsec-cipher-suite gcm-aes-128
SW1(config)# interface TenGigabitEthernet1/1/2
SW1(config-if)# macsec network-link
SW1(config-if)# mka policy MKA-POL
SW1(config-if)# mka pre-shared-key key-chain MKA-KC</pre>
<p><code>show mka sessions</code> (status <b>Secured</b>) aur <code>show macsec summary</code> se verify karo.</p>

<div class="eg"><p><b>Worked example.</b> Ek campus ki 12 buildings leased dark fibre se judi hain. Security team ko fibre par tap ka darr hai. 24 inter-building 10G links par MACsec har frame mein zyada se zyada 32 bytes jodta hai; team link MTU 1500 se 1600 karti hai taaki full-size frames aur CMD header dono fit hon, aur line-rate throughput bana rehta hai kyunki encryption switch ASIC mein chalta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Har server ko SGT milne se pehle <code>cts role-based enforcement</code> on kar dena. Untagged destinations ka traffic "Unknown" (SGT 0) ki tarah evaluate hota hai aur default-deny matrix cell use chupchaap block kar deta hai. Pehle classify karo, monitor karo, phir enforce karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> SXP <b>control-plane</b> protocol (TCP) hai jo IP-to-SGT bindings share karta hai; inline tagging <b>data-plane</b> hai. SGACLs <b>egress</b> par enforce hote hain. MACsec layer 2 par <b>hop by hop</b> hai, IPsec ke ulat jo layer 3 par end to end hai.</p></div>

<div class="scn"><h4>ACL jise koi maintain nahi kar pata tha</h4><p>Ek university ke distribution switches par students, staff, research labs aur building systems ko alag rakhne ke liye 4,800 lines ke ACLs the. Har semester subnet changes kuch na kuch tod dete the. Team TrustSec par gayi: ISE ne 802.1X aur MAB se SGTs assign kiye, data center servers ko static IP-to-SGT mappings mili, purane access switches ne SXP use kiya, aur policy ISE mein 9 x 9 matrix ban gayi. Ab lab ko nayi building mein le jaane par koi ACL change nahi chahiye tha.</p><p><b>Seekh:</b> role se bani policy address changes jhel leti hai; IP se bani policy nahi.</p></div>

<div class="iv"><p class="q">"TrustSec ko teen steps mein explain karo, aur aap SXP kab use karoge."</p><p>Strong answer: classify (802.1X/MAB ke baad ISE se dynamically ya IP, subnet, VLAN ya port se statically SGT assign karo), propagate (capable devices ke beech CMD header ke saath inline tagging, ya jahan hardware tag nahi kar sakta wahan speaker se listener tak TCP 64999 par SXP, ya firewalls ko pxGrid), enforce (ISE ka SGACL matrix, switches par egress par apply, ya SGT-based firewall rules). Purane access switches ya tag na kar sakne wale devices ke across SXP use karo. Wire par tags protect karne ke liye MACsec mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SGT = 16-bit role tag; policy ISE mein source-by-destination SGACL matrix hai.</li>
<li>Dynamically (ISE) ya statically (IP, subnet, VLAN, port) classify karo.</li>
<li>Inline (CMD header, EtherType 0x8909) ya SXP (TCP 64999, speaker se listener) se propagate karo.</li>
<li>SGACLs se egress par enforce karo; <code>cts role-based enforcement</code> se enable karo.</li>
<li>MACsec 802.1AE: hop-by-hop AES-GCM, keys MKA se; downlink 802.1X se, uplink pre-shared keys se.</li>
</ul></div>
`}};export{e as default};