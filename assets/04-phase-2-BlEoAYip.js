var e={id:`phase-2`,h:{en:`Phase 2: IPsec proposal, policy and VPN`,hi:`Phase 2: IPsec proposal, policy aur VPN`},body:{en:`<p><b>Analogy.</b> Phase 1 built a secure meeting room. Phase 2 agrees how each <i>parcel</i> is packed: which lock, which seal and whether to change the lock now and then. Both sides must pack and unpack the same way.</p>
<h3>Three objects</h3>
<ol><li><b>IPsec proposal</b>: the protocol (<code>esp</code>), the authentication (integrity) algorithm, the encryption algorithm and the lifetime.</li><li><b>IPsec policy</b>: the proposals to offer and optional <b>perfect forward secrecy (PFS)</b>, which makes a fresh Diffie-Hellman exchange for the data keys.</li><li><b>IPsec VPN</b>: ties it together: <code>bind-interface st0.N</code>, the IKE gateway from phase 1, the IPsec policy and when to establish the tunnel.</li></ol>
<pre class="code">set security ipsec proposal IPS-P protocol esp
set security ipsec proposal IPS-P authentication-algorithm hmac-sha-256-128
set security ipsec proposal IPS-P encryption-algorithm aes-256-cbc
set security ipsec policy IPS-POL proposals IPS-P
set security ipsec vpn VPN1 bind-interface st0.0
set security ipsec vpn VPN1 ike gateway GW1
set security ipsec vpn VPN1 ike ipsec-policy IPS-POL
set security ipsec vpn VPN1 establish-tunnels immediately</pre>
<h3>What must match</h3>
<ul><li>At least one <b>IPsec proposal</b> in common (protocol, authentication, encryption).</li><li><b>PFS</b> on both ends with the same DH group, or on neither. One end with PFS and the other without fails phase 2.</li><li>The lifetime need not match: the shorter one is used.</li></ul>
<pre class="out">user@DELHI-SRX&gt; show security ipsec security-associations
Total active tunnels: 1     Total Ipsec sas: 2
  ID     Algorithm       SPI      Life:sec/kb  Mon lsys Port  Gateway
  &lt;131073 <span class="hl">ESP:aes-256-cbc/sha-256</span> 1833aac1 3150/ unlim  -   root 500  198.51.100.2
  &gt;131073 ESP:aes-256-cbc/sha-256 1533a608 3150/ unlim  -   root 500  198.51.100.2</pre>
<p>Two SAs per tunnel: one inbound, one outbound (the signs &lt; and &gt;). If phase 1 is up but this table is empty, phase 2 failed.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Phase 1 protects phase 2"><rect x="10" y="20" width="620" height="45" rx="10" fill="#fde68a"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">IKE SA (phase 1): protected channel</text><rect x="60" y="80" width="520" height="40" rx="10" fill="#bbf7d0"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="13">IPsec SAs (phase 2): inbound + outbound ESP</text></svg><p class="cap">Phase 2 runs inside the protection of phase 1.</p></div>
<div class="eg"><p><b>Worked example.</b> Delhi uses PFS group14, Pune has no PFS. The IKE SA comes up, but no IPsec SA appears and the log says phase 2 failed. Removing PFS on Delhi (or adding the same PFS group on Pune) fixes it.</p></div>
<div class="warn"><p><b>Common mistake.</b> Matching phase 1 carefully and copying phase 2 by memory. Compare the ESP encryption and authentication algorithms and the PFS setting on both ends.</p></div>
<div class="exam"><p><b>Exam trap.</b> The VPN object holds <code>bind-interface</code> (route-based). Phase 2 has its own algorithms and its own lifetime, separate from phase 1. <code>establish-tunnels immediately</code> brings the tunnel up without waiting for traffic.</p></div>
<div class="scn"><h4>Phase 1 up, tunnel down</h4><p>The IKE security association was UP but users had no connectivity. The IPsec table was empty. The remote end used 3DES for ESP while the local end used AES-256. Aligning the IPsec proposals created the SAs.</p><p><b>Lesson:</b> check phase 2 separately; a healthy phase 1 proves nothing about it.</p></div>
<div class="iv"><p class="q">"What is negotiated in phase 2?"</p><p>The IPsec protocol (ESP), the encryption and integrity algorithms for user data, the optional PFS group and the lifetime, producing inbound and outbound IPsec SAs. Both ends must offer at least one matching proposal and agree on PFS.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Proposal, policy and VPN object build phase 2.</li><li>Match ESP algorithms and PFS.</li><li>Two SAs (in and out) per tunnel.</li></ul></div>`,hi:`<p><b>Analogy.</b> Phase 1 ne secure meeting room banaya. Phase 2 tay karta hai har <i>parcel</i> kaise pack hoga: kaunsa lock, kaunsi seal aur kya kabhi kabhi lock badalna hai. Dono taraf ko ek hi tarah pack aur unpack karna hai.</p>
<h3>Teen objects</h3>
<ol><li><b>IPsec proposal</b>: protocol (<code>esp</code>), authentication (integrity) algorithm, encryption algorithm aur lifetime.</li><li><b>IPsec policy</b>: offer karne ke proposals aur optional <b>perfect forward secrecy (PFS)</b>, jo data keys ke liye nayi Diffie-Hellman exchange karta hai.</li><li><b>IPsec VPN</b>: sab jodta hai: <code>bind-interface st0.N</code>, phase 1 ka IKE gateway, IPsec policy aur tunnel kab establish karna hai.</li></ol>
<pre class="code">set security ipsec proposal IPS-P protocol esp
set security ipsec proposal IPS-P authentication-algorithm hmac-sha-256-128
set security ipsec proposal IPS-P encryption-algorithm aes-256-cbc
set security ipsec policy IPS-POL proposals IPS-P
set security ipsec vpn VPN1 bind-interface st0.0
set security ipsec vpn VPN1 ike gateway GW1
set security ipsec vpn VPN1 ike ipsec-policy IPS-POL
set security ipsec vpn VPN1 establish-tunnels immediately</pre>
<h3>Kya match hona chahiye</h3>
<ul><li>Kam se kam ek <b>IPsec proposal</b> common (protocol, authentication, encryption).</li><li>Dono ends par <b>PFS</b> same DH group ke saath, ya kisi par nahi. Ek end par PFS aur doosre par nahi to phase 2 fail.</li><li>Lifetime match karna zaroori nahi: chhoti wali use hoti hai.</li></ul>
<pre class="out">user@DELHI-SRX&gt; show security ipsec security-associations
Total active tunnels: 1     Total Ipsec sas: 2
  ID     Algorithm       SPI      Life:sec/kb  Mon lsys Port  Gateway
  &lt;131073 <span class="hl">ESP:aes-256-cbc/sha-256</span> 1833aac1 3150/ unlim  -   root 500  198.51.100.2
  &gt;131073 ESP:aes-256-cbc/sha-256 1533a608 3150/ unlim  -   root 500  198.51.100.2</pre>
<p>Har tunnel ke do SAs: ek inbound, ek outbound (&lt; aur &gt; nishaan). Agar phase 1 up hai lekin yeh table khaali hai, to phase 2 fail hua.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Phase 1 phase 2 ko protect karta hai"><rect x="10" y="20" width="620" height="45" rx="10" fill="#fde68a"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">IKE SA (phase 1): protected channel</text><rect x="60" y="80" width="520" height="40" rx="10" fill="#bbf7d0"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="13">IPsec SAs (phase 2): inbound + outbound ESP</text></svg><p class="cap">Phase 2 phase 1 ki protection ke andar chalta hai.</p></div>
<div class="eg"><p><b>Worked example.</b> Delhi PFS group14 use karta hai, Pune mein PFS nahi. IKE SA up ho jata hai, lekin koi IPsec SA nahi dikhta aur log kehta hai phase 2 fail hua. Delhi par PFS hatane se (ya Pune par wahi PFS group jodne se) theek ho jata hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Phase 1 dhyan se match karna aur phase 2 yaad se copy karna. Dono ends par ESP encryption aur authentication algorithms aur PFS setting compare karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> VPN object mein <code>bind-interface</code> hota hai (route-based). Phase 2 ke apne algorithms aur apna lifetime hain, phase 1 se alag. <code>establish-tunnels immediately</code> traffic ka intezaar kiye bina tunnel up karta hai.</p></div>
<div class="scn"><h4>Phase 1 up, tunnel down</h4><p>IKE security association UP tha lekin users ko connectivity nahi thi. IPsec table khaali thi. Remote end ESP ke liye 3DES use karta tha aur local end AES-256. IPsec proposals align karne se SAs ban gaye.</p><p><b>Lesson:</b> phase 2 alag se check karo; healthy phase 1 uske baare mein kuch saabit nahi karta.</p></div>
<div class="iv"><p class="q">"Phase 2 mein kya negotiate hota hai?"</p><p>IPsec protocol (ESP), user data ke liye encryption aur integrity algorithms, optional PFS group aur lifetime, jisse inbound aur outbound IPsec SAs bante hain. Dono ends ko kam se kam ek matching proposal offer karna hai aur PFS par sehmat hona hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Proposal, policy aur VPN object phase 2 banate hain.</li><li>ESP algorithms aur PFS match karo.</li><li>Har tunnel ke do SAs (in aur out).</li></ul></div>`}};export{e as default};