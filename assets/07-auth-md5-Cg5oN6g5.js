var e={id:`auth-md5`,h:{en:`Authentication part 1: plain text and MD5, area and interface level (lab: SEC-12 ticket)`,hi:`Authentication part 1: plain text aur MD5, area aur interface level (lab: SEC-12 ticket)`},body:{en:`
<p>A society gate guard can check visitors in three ways: no check at all, asking for a password that everyone in the queue can hear, or asking for a signed pass that proves you know a secret without saying it aloud. OSPF has the same three options: <b>null</b>, <b>simple (plain-text) password</b> and <b>cryptographic</b> authentication. Only the last one is acceptable in production.</p>

<h3>The three authentication types</h3>
<table class="cmp"><tr><th>Type</th><th>Name</th><th>What travels in the packet</th><th>Protects against</th></tr>
<tr><td>0</td><td>Null</td><td>Nothing</td><td>Nothing</td></tr>
<tr><td>1</td><td>Simple password</td><td>The password in clear text (max 8 characters)</td><td>Accidents only; anyone with a capture sees it</td></tr>
<tr><td>2</td><td>Cryptographic</td><td>Key ID, a digest (MD5 or HMAC-SHA) and a sequence number; never the key</td><td>Rogue routers, tampering, replay</td></tr>
</table>
<p>With cryptographic authentication the sender computes a digest over the OSPF packet plus the shared key and appends it. The receiver repeats the calculation with its own copy of the key identified by the <b>key ID</b>. If the digests differ, the packet is dropped. A non-decreasing <b>cryptographic sequence number</b> stops an attacker from replaying old packets.</p>

<h3>Two places to switch it on: area or interface</h3>
<p>The <b>type</b> can be enabled for a whole area or per interface. The <b>key</b> is always configured on the interface.</p>
<pre class="code"><span class="c">! Area level: every interface in area 0 uses MD5</span>
router ospf 1
 area 0 authentication message-digest
interface GigabitEthernet0/0
 ip ospf message-digest-key 1 md5 N3tK1ngs
<span class="c">! Interface level: only this interface, overrides the area setting</span>
interface GigabitEthernet0/1
 ip ospf authentication message-digest
 ip ospf message-digest-key 1 md5 Br@nch23
<span class="c">! Plain text (type 1), shown for recognition only</span>
interface GigabitEthernet0/2
 ip ospf authentication
 ip ospf authentication-key NKpass1
<span class="c">! Exempt one interface from an area-wide setting</span>
interface GigabitEthernet0/3
 ip ospf authentication null</pre>
<p>Interface settings always win over area settings. Both neighbours must agree on the type, the key ID (for MD5) and the key, which is <b>case-sensitive</b>.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="MD5 lab topology and faults">
<rect x="10" y="40" width="330" height="120" rx="10" fill="#bae6fd"/><text x="175" y="60" text-anchor="middle" class="svg-ink" font-size="12">Area 0: area-level MD5, key 1 N3tK1ngs</text>
<rect x="350" y="40" width="280" height="120" rx="10" fill="#bbf7d0"/><text x="490" y="60" text-anchor="middle" class="svg-ink" font-size="12">Area 1: interface MD5, key 1 Br@nch23</text>
<rect x="40" y="85" width="90" height="45" rx="8" fill="#ffffff" stroke="#64748b"/><text x="85" y="113" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="300" y="85" width="90" height="45" rx="8" fill="#ddd6fe"/><text x="345" y="113" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<rect x="520" y="85" width="90" height="45" rx="8" fill="#ffffff" stroke="#64748b"/><text x="565" y="113" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<line x1="130" y1="107" x2="300" y2="107" stroke="#64748b" stroke-width="2"/><line x1="390" y1="107" x2="520" y2="107" stroke="#64748b" stroke-width="2"/>
<text x="215" y="185" text-anchor="middle" class="svg-accent" font-size="12">R1 sends type 0, R2 expects type 2</text>
<text x="455" y="185" text-anchor="middle" class="svg-accent" font-size="12">R3 key br@nch23: wrong case</text>
</svg><p class="cap">The SEC-12 ticket: R2 was configured first. R1 never got the policy, and R3 has a one-letter typo.</p></div>

<h3>Lab walk-through: the SEC-12 ticket</h3>
<p>R1 and R3 have both lost their neighbours since R2 was configured. Do not guess; collect evidence on R2.</p>
<pre class="out">R2#show ip ospf neighbor
<span class="hl">R2#</span>
R2#debug ip ospf adj
OSPF-1 ADJ   Gi0/0: Rcv pkt from 10.0.12.1 : <span class="hl">Mismatched Authentication type. Input packet specified type 0, we use type 2</span>
OSPF-1 ADJ   Gi0/1: Rcv pkt from 10.1.23.2 : <span class="hl">Mismatched Authentication Key - Message Digest Key 1</span></pre>
<p>The empty neighbour table and two different messages point to two different faults. On Gi0/0, R1 sends no authentication at all (type 0). On Gi0/1, the type matches but the digest does not, so the key itself differs. Fix R1 by completing the rollout, and fix R3 by re-entering the key with the correct case.</p>
<pre class="code"><span class="c">! R1</span>
router ospf 1
 area 0 authentication message-digest
interface GigabitEthernet0/0
 ip ospf message-digest-key 1 md5 N3tK1ngs
<span class="c">! R3: keys are case-sensitive</span>
interface GigabitEthernet0/0
 no ip ospf message-digest-key 1
 ip ospf message-digest-key 1 md5 Br@nch23</pre>
<pre class="out">R3#show ip ospf interface GigabitEthernet0/0 | include authen|key
<span class="hl">  Message digest authentication enabled</span>
<span class="hl">    Youngest key id is 1</span>

R2#show ip ospf | section BACKBONE
    Area BACKBONE(0)
        Number of interfaces in this area is 2 (1 loopback)
<span class="hl">        Area has message digest authentication</span>

R1#ping 3.3.3.3
!!!!!</pre>
<p>Note that <code>show ip ospf</code> for area 1 on R2 says "Area has no authentication" even though Gi0/1 uses MD5: the interface-level command does not change the area setting. That is exactly the kind of detail troubleshooting questions test.</p>

<h3>Virtual links and MD5</h3>
<p>A virtual link is an area 0 interface, so <code>area 0 authentication message-digest</code> turns on MD5 for it too. It then needs its own key, configured under the router process: <code>area 1 virtual-link 3.3.3.3 message-digest-key 1 md5 N3tK1ngs</code> on both ends. Forgetting this is one of the most common ENARSI tickets.</p>

<h3>Changing an MD5 key without an outage</h3>
<ol>
<li>Add <code>ip ospf message-digest-key 2 md5 NewKey</code> on both routers. Key 2 is now the youngest key.</li>
<li>While a neighbour still uses key 1, IOS sends every packet twice, once with each key. <code>show ip ospf interface</code> shows "Rollover in progress, 1 neighbor(s) using the old key(s)".</li>
<li>When both sides use key 2, remove key 1 with <code>no ip ospf message-digest-key 1</code>.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> An MD5 key can be up to 16 characters and a simple password only 8. If you type <code>ip ospf authentication-key NetKings2026</code>, IOS keeps only "NetKings", so the neighbour that uses the full string will not match. For the same reason, a trailing space copied from a document becomes part of an MD5 key.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Enabling the type on one side only. Matching the key string but not the key ID. Assuming the area command sets the key. Forgetting that <code>service password-encryption</code> only hides the key in the config; it does not change the key.</p></div>

<div class="exam"><p><b>Exam trap.</b> An authentication mismatch drops Hellos, so a <b>new</b> neighbour never appears at all, while an <b>existing</b> neighbour stays up until the dead timer expires (40 seconds on broadcast links). Do not expect EXSTART or INIT symptoms; those point to other problems.</p></div>

<div class="scn"><h4>The password that the auditors read</h4><p>During a security audit, a consultant captured traffic on a server VLAN that had been left OSPF-enabled and read the plain-text OSPF password straight from the packet. With it, a test router could have joined the backbone. The team made the server VLAN interface passive, moved every area to MD5 immediately, and later to HMAC-SHA key chains.</p><p><b>Lesson:</b> type 1 authentication stops mistakes, not attackers. Use cryptographic authentication and passive interfaces together.</p></div>

<div class="iv"><p class="q">"How does OSPF MD5 authentication work, and how do you change the key without dropping neighbours?"</p><p>Strong answer: each packet carries a key ID, a cryptographic sequence number and an MD5 digest computed over the packet and the secret; the key itself is never sent. It can be enabled per area or per interface, with the interface winning, and the key is always per interface. For rollover, add a new key ID on both ends; IOS sends with both keys until every neighbour uses the new one, then remove the old key. Mention that virtual links need their own key under the router process.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Types: 0 null, 1 plain text, 2 cryptographic (MD5 or HMAC-SHA).</li>
<li>Enable the type per area (<code>area 0 authentication message-digest</code>) or per interface; the interface wins; keys are always per interface.</li>
<li>Type mismatch and key mismatch produce different debug messages: read them.</li>
<li>Virtual links inherit area 0 authentication and need their own key.</li>
<li>MD5 rollover: add the new key ID on both ends, wait for the rollover to finish, then remove the old one.</li>
</ul></div>
`,hi:`
<p>Society ka gate guard visitors ko teen tareeke se check kar sakta hai: bilkul check nahi, ek password poochna jo line mein khade sab log sun sakein, ya ek signed pass maangna jo prove kare ki aap secret jaante ho bina use zor se bole. OSPF mein bhi yahi teen options hain: <b>null</b>, <b>simple (plain-text) password</b> aur <b>cryptographic</b> authentication. Production mein sirf aakhri wala acceptable hai.</p>

<h3>Teen authentication types</h3>
<table class="cmp"><tr><th>Type</th><th>Naam</th><th>Packet mein kya jaata hai</th><th>Kisse bachata hai</th></tr>
<tr><td>0</td><td>Null</td><td>Kuch nahi</td><td>Kisi se nahi</td></tr>
<tr><td>1</td><td>Simple password</td><td>Password clear text mein (max 8 characters)</td><td>Sirf galtiyon se; capture wala koi bhi use dekh leta hai</td></tr>
<tr><td>2</td><td>Cryptographic</td><td>Key ID, ek digest (MD5 ya HMAC-SHA) aur sequence number; key kabhi nahi</td><td>Rogue routers, tampering, replay</td></tr>
</table>
<p>Cryptographic authentication mein sender OSPF packet aur shared key par ek digest calculate karke jodta hai. Receiver <b>key ID</b> se pehchani gayi apni key copy se wahi calculation dohraata hai. Digests alag hon to packet drop hota hai. Ek non-decreasing <b>cryptographic sequence number</b> attacker ko purane packets replay karne se rokta hai.</p>

<h3>On karne ki do jagah: area ya interface</h3>
<p><b>Type</b> poore area ke liye ya har interface par enable ho sakta hai. <b>Key</b> hamesha interface par configure hoti hai.</p>
<pre class="code"><span class="c">! Area level: area 0 ka har interface MD5 use karta hai</span>
router ospf 1
 area 0 authentication message-digest
interface GigabitEthernet0/0
 ip ospf message-digest-key 1 md5 N3tK1ngs
<span class="c">! Interface level: sirf yeh interface, area setting ko override karta hai</span>
interface GigabitEthernet0/1
 ip ospf authentication message-digest
 ip ospf message-digest-key 1 md5 Br@nch23
<span class="c">! Plain text (type 1), sirf pehchaan ke liye dikhaya</span>
interface GigabitEthernet0/2
 ip ospf authentication
 ip ospf authentication-key NKpass1
<span class="c">! Ek interface ko area-wide setting se chhoot do</span>
interface GigabitEthernet0/3
 ip ospf authentication null</pre>
<p>Interface settings hamesha area settings par jeetti hain. Dono neighbours ko type, key ID (MD5 ke liye) aur key par agree karna hoga, jo <b>case-sensitive</b> hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="MD5 lab topology aur faults">
<rect x="10" y="40" width="330" height="120" rx="10" fill="#bae6fd"/><text x="175" y="60" text-anchor="middle" class="svg-ink" font-size="12">Area 0: area-level MD5, key 1 N3tK1ngs</text>
<rect x="350" y="40" width="280" height="120" rx="10" fill="#bbf7d0"/><text x="490" y="60" text-anchor="middle" class="svg-ink" font-size="12">Area 1: interface MD5, key 1 Br@nch23</text>
<rect x="40" y="85" width="90" height="45" rx="8" fill="#ffffff" stroke="#64748b"/><text x="85" y="113" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="300" y="85" width="90" height="45" rx="8" fill="#ddd6fe"/><text x="345" y="113" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<rect x="520" y="85" width="90" height="45" rx="8" fill="#ffffff" stroke="#64748b"/><text x="565" y="113" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<line x1="130" y1="107" x2="300" y2="107" stroke="#64748b" stroke-width="2"/><line x1="390" y1="107" x2="520" y2="107" stroke="#64748b" stroke-width="2"/>
<text x="215" y="185" text-anchor="middle" class="svg-accent" font-size="12">R1 type 0 bhejta, R2 type 2 chahta</text>
<text x="455" y="185" text-anchor="middle" class="svg-accent" font-size="12">R3 key br@nch23: galat case</text>
</svg><p class="cap">SEC-12 ticket: R2 pehle configure hua. R1 tak policy kabhi pahunchi nahi, aur R3 mein ek letter ka typo hai.</p></div>

<h3>Lab walk-through: SEC-12 ticket</h3>
<p>R2 configure hone ke baad se R1 aur R3 dono ne apne neighbours kho diye hain. Guess mat karo; R2 par evidence ikattha karo.</p>
<pre class="out">R2#show ip ospf neighbor
<span class="hl">R2#</span>
R2#debug ip ospf adj
OSPF-1 ADJ   Gi0/0: Rcv pkt from 10.0.12.1 : <span class="hl">Mismatched Authentication type. Input packet specified type 0, we use type 2</span>
OSPF-1 ADJ   Gi0/1: Rcv pkt from 10.1.23.2 : <span class="hl">Mismatched Authentication Key - Message Digest Key 1</span></pre>
<p>Khaali neighbour table aur do alag messages do alag faults ki taraf ishara karte hain. Gi0/0 par R1 koi authentication nahi bhejta (type 0). Gi0/1 par type match karta hai lekin digest nahi, yaani key hi alag hai. R1 par rollout poora karke use theek karo, aur R3 par key sahi case ke saath dobara daal kar.</p>
<pre class="code"><span class="c">! R1</span>
router ospf 1
 area 0 authentication message-digest
interface GigabitEthernet0/0
 ip ospf message-digest-key 1 md5 N3tK1ngs
<span class="c">! R3: keys case-sensitive hoti hain</span>
interface GigabitEthernet0/0
 no ip ospf message-digest-key 1
 ip ospf message-digest-key 1 md5 Br@nch23</pre>
<pre class="out">R3#show ip ospf interface GigabitEthernet0/0 | include authen|key
<span class="hl">  Message digest authentication enabled</span>
<span class="hl">    Youngest key id is 1</span>

R2#show ip ospf | section BACKBONE
    Area BACKBONE(0)
        Number of interfaces in this area is 2 (1 loopback)
<span class="hl">        Area has message digest authentication</span>

R1#ping 3.3.3.3
!!!!!</pre>
<p>Dhyaan do ki R2 par area 1 ke liye <code>show ip ospf</code> "Area has no authentication" kehta hai, jabki Gi0/1 MD5 use karta hai: interface-level command area setting nahi badalti. Troubleshooting questions yahi detail test karte hain.</p>

<h3>Virtual links aur MD5</h3>
<p>Virtual link ek area 0 interface hai, isliye <code>area 0 authentication message-digest</code> uske liye bhi MD5 on kar deta hai. Phir use apni key chahiye, jo router process ke andar configure hoti hai: dono ends par <code>area 1 virtual-link 3.3.3.3 message-digest-key 1 md5 N3tK1ngs</code>. Ise bhoolna sabse common ENARSI tickets mein se ek hai.</p>

<h3>Bina outage ke MD5 key badalna</h3>
<ol>
<li>Dono routers par <code>ip ospf message-digest-key 2 md5 NewKey</code> jodo. Key 2 ab youngest key hai.</li>
<li>Jab tak koi neighbour key 1 use kar raha hai, IOS har packet do baar bhejta hai, har key ke saath ek baar. <code>show ip ospf interface</code> dikhata hai "Rollover in progress, 1 neighbor(s) using the old key(s)".</li>
<li>Jab dono sides key 2 use karein, <code>no ip ospf message-digest-key 1</code> se key 1 hatao.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> MD5 key 16 characters tak ho sakti hai aur simple password sirf 8. Agar aap <code>ip ospf authentication-key NetKings2026</code> type karte ho, to IOS sirf "NetKings" rakhta hai, isliye poori string use karne wala neighbour match nahi karega. Isi wajah se, kisi document se copy hua trailing space MD5 key ka hissa ban jaata hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Type sirf ek side par enable karna. Key string match karna lekin key ID nahi. Yeh maan lena ki area command key set karti hai. Yeh bhoolna ki <code>service password-encryption</code> sirf config mein key chhupata hai; key nahi badalta.</p></div>

<div class="exam"><p><b>Exam trap.</b> Authentication mismatch Hellos ko drop karta hai, isliye <b>naya</b> neighbour dikhta hi nahi, jabki <b>existing</b> neighbour dead timer khatam hone tak up rehta hai (broadcast links par 40 seconds). EXSTART ya INIT symptoms expect mat karo; woh doosri problems ki taraf ishara karte hain.</p></div>

<div class="scn"><h4>Woh password jo auditors ne padh liya</h4><p>Security audit ke dauraan ek consultant ne ek server VLAN par traffic capture kiya jahan OSPF enabled chhoda gaya tha, aur plain-text OSPF password seedha packet se padh liya. Usse ek test router backbone join kar sakta tha. Team ne server VLAN interface ko passive banaya, har area ko turant MD5 par shift kiya, aur baad mein HMAC-SHA key chains par.</p><p><b>Lesson:</b> type 1 authentication galtiyan rokta hai, attackers nahi. Cryptographic authentication aur passive interfaces saath mein use karo.</p></div>

<div class="iv"><p class="q">"OSPF MD5 authentication kaise kaam karta hai, aur neighbours drop kiye bina key kaise badalte ho?"</p><p>Strong answer: har packet mein key ID, cryptographic sequence number aur packet plus secret par calculate kiya MD5 digest hota hai; key khud kabhi nahi bheji jaati. Ise per area ya per interface enable kar sakte hain, interface jeetta hai, aur key hamesha per interface hoti hai. Rollover ke liye dono ends par nayi key ID jodo; IOS dono keys se bhejta hai jab tak har neighbour nayi use na kare, phir purani key hatao. Batao ki virtual links ko router process ke andar apni key chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Types: 0 null, 1 plain text, 2 cryptographic (MD5 ya HMAC-SHA).</li>
<li>Type per area (<code>area 0 authentication message-digest</code>) ya per interface enable karo; interface jeetta hai; keys hamesha per interface.</li>
<li>Type mismatch aur key mismatch alag debug messages dete hain: unhe padho.</li>
<li>Virtual links area 0 authentication inherit karte hain aur unhe apni key chahiye.</li>
<li>MD5 rollover: dono ends par nayi key ID jodo, rollover khatam hone do, phir purani hatao.</li>
</ul></div>
`}};export{e as default};