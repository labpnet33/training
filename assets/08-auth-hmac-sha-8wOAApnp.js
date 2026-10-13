var e={id:`auth-hmac-sha`,h:{en:`Authentication part 2: HMAC-SHA key chains and key rollover (lab: DC interconnect)`,hi:`Authentication part 2: HMAC-SHA key chains aur key rollover (lab: DC interconnect)`},body:{en:`
<p>Think of a bank locker room. The old lock (MD5) still works, but locksmiths know how to weaken it, so the bank installs a modern lock (HMAC-SHA). The bank also keeps a key ring with dated keys: this key opens the locker until the end of the month, the next key from the first of next month. That key ring is a <b>key chain</b>, and it is how IOS does modern OSPF authentication.</p>

<h3>Why HMAC-SHA</h3>
<p>MD5 is considered cryptographically weak, and security policies increasingly forbid it. RFC 5709 added <b>HMAC-SHA</b> authentication to OSPFv2 using the same cryptographic (type 2) framework: a key ID, a sequence number and a digest, now calculated with HMAC-SHA-1, -256, -384 or -512. On IOS and IOS XE you configure it through a <b>key chain</b>, where each key has a string, an algorithm and optional lifetimes.</p>

<h3>Building the key chain</h3>
<pre class="code"><span class="c">! DC1 and DC2: identical key chains</span>
key chain OSPF-SHA
 key 1
  key-string Nk-Sha256-Key
  cryptographic-algorithm hmac-sha-256
<span class="c">! Apply it to the interface</span>
interface GigabitEthernet0/0
 ip ospf authentication key-chain OSPF-SHA
<span class="c">! A virtual link would use: area 1 virtual-link 3.3.3.3 authentication key-chain OSPF-SHA</span></pre>
<p>Three values must agree between neighbours: the <b>key ID</b>, the <b>key string</b> and the <b>cryptographic algorithm</b>. The key chain name is local and does not have to match, although using the same name everywhere keeps operations simple. A key without a <code>cryptographic-algorithm</code> line cannot be used for OSPF, so do not skip it.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Key chain structure and key selection">
<rect x="10" y="20" width="230" height="190" rx="10" fill="#ddd6fe"/><text x="125" y="44" text-anchor="middle" class="svg-ink" font-size="13">key chain OSPF-SHA</text>
<rect x="25" y="60" width="200" height="60" rx="8" fill="#ffffff" stroke="#64748b"/><text x="125" y="82" text-anchor="middle" class="svg-ink" font-size="12">key 1: Nk-Sha256-Key</text><text x="125" y="102" text-anchor="middle" class="svg-muted" font-size="12">hmac-sha-256</text>
<rect x="25" y="132" width="200" height="60" rx="8" fill="#ffffff" stroke="#64748b"/><text x="125" y="154" text-anchor="middle" class="svg-ink" font-size="12">key 2: Nk-Sha512-Key</text><text x="125" y="174" text-anchor="middle" class="svg-muted" font-size="12">hmac-sha-512</text>
<line x1="240" y1="162" x2="330" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="80" width="140" height="60" rx="8" fill="#bae6fd"/><text x="400" y="104" text-anchor="middle" class="svg-ink" font-size="13">DC1 Gi0/0</text><text x="400" y="124" text-anchor="middle" class="svg-accent" font-size="12">sends with key 2</text>
<line x1="470" y1="110" x2="500" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="500" y="80" width="130" height="60" rx="8" fill="#bae6fd"/><text x="565" y="104" text-anchor="middle" class="svg-ink" font-size="13">DC2 Gi0/0</text><text x="565" y="124" text-anchor="middle" class="svg-muted" font-size="12">looks up key 2</text>
<text x="480" y="180" text-anchor="middle" class="svg-ink" font-size="12">Send: highest valid send key</text>
<text x="480" y="200" text-anchor="middle" class="svg-ink" font-size="12">Receive: key ID from the packet</text>
</svg><p class="cap">The sender chooses the newest valid key; the receiver uses the key ID carried in the packet to find the matching key in its own chain.</p></div>

<h3>Lab walk-through: DCI between DC1 and DC2</h3>
<p>Both routers run OSPF area 0 with no authentication. Build the chain on DC1 first. The moment you apply it to DC1's Gi0/0, DC1 starts signing its packets and dropping DC2's unsigned ones, so the adjacency will fail after the dead interval unless DC2 is configured quickly. That is the lab's lesson: always prepare both ends before applying.</p>
<pre class="out">DC1#show key chain OSPF-SHA
Key-chain OSPF-SHA:
    key 1 -- text "Nk-Sha256-Key"
<span class="hl">        cryptographic-algorithm: hmac-sha-256</span>
        accept lifetime (always valid) - (always valid) [valid now]
        send lifetime (always valid) - (always valid) [valid now]

DC1#show ip ospf interface GigabitEthernet0/0 | include authen|SA
<span class="hl">  Cryptographic authentication enabled</span>
<span class="hl">    Sending SA: Key 1, Algorithm HMAC-SHA-256 - key chain OSPF-SHA</span>

DC1#show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
<span class="hl">10.255.0.2        1   FULL/DR         00:00:36    10.200.0.2      GigabitEthernet0/0</span></pre>

<h3>Rolling over to a new key</h3>
<p>Now add key 2 with a stronger algorithm on both routers:</p>
<pre class="code">key chain OSPF-SHA
 key 2
  key-string Nk-Sha512-Key
  cryptographic-algorithm hmac-sha-512</pre>
<pre class="out">DC2#show ip ospf interface GigabitEthernet0/0 | include SA
<span class="hl">    Sending SA: Key 2, Algorithm HMAC-SHA-512 - key chain OSPF-SHA</span></pre>
<p>IOS sends with the newest key whose send lifetime is valid and accepts any key whose accept lifetime is valid. As soon as DC1 has key 2, it signs with key 2. If DC2 does not have key 2 yet, it cannot verify those packets and drops them, so you must finish the second router within the dead interval (40 seconds here). In production, remove the race completely with <b>lifetimes</b>:</p>
<pre class="code"><span class="c">! On both routers, days before the change window</span>
key chain OSPF-SHA
 key 2
  key-string Nk-Sha512-Key
  cryptographic-algorithm hmac-sha-512
  accept-lifetime 01:00:00 Oct 5 2026 infinite
  send-lifetime 02:00:00 Oct 5 2026 infinite</pre>
<p>Both routers start accepting key 2 at 01:00 and start sending it at 02:00, at the same moment, as long as their clocks agree. That makes <b>NTP</b> a prerequisite for scheduled rollover. Once key 2 is in use everywhere, give key 1 an end time or remove it.</p>

<table class="cmp"><tr><th></th><th>MD5 (message-digest-key)</th><th>Key chain</th></tr>
<tr><td>Where the key lives</td><td>Interface command</td><td>Global key chain, referenced by the interface</td></tr>
<tr><td>Algorithms</td><td>MD5 only</td><td>MD5, HMAC-SHA-1/256/384/512</td></tr>
<tr><td>Rollover</td><td>Add new key ID; IOS sends with both until peers switch</td><td>Newest valid key sends; lifetimes schedule the switch</td></tr>
<tr><td>Verification line</td><td>Youngest key id is N</td><td>Sending SA: Key N, Algorithm ...</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> DC1 has key 1 (sha-256) and key 2 (sha-512). DC2 has key 1 (sha-256) and key 2 with the right string but <code>hmac-sha-384</code>. DC1 sends with key 2, SHA-512. DC2 finds key 2 in its chain, computes an SHA-384 digest, gets a different result and drops the packet. After 40 seconds the neighbour goes down, even though "the key is the same". Fix the algorithm and the adjacency returns.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Omitting <code>cryptographic-algorithm</code>. Matching the string but not the algorithm. Using lifetimes on routers whose clocks differ by minutes. A typo in the key chain name under the interface: the interface then references a chain that does not exist. Pasting a key string with a trailing space.</p></div>

<div class="exam"><p><b>Exam trap.</b> For key-chain authentication the key ID, the key string <b>and</b> the algorithm must match; the key chain <b>name</b> need not. And the router sends with the <b>newest</b> valid key, not the lowest key number.</p></div>

<div class="scn"><h4>The five-minute DCI outage</h4><p>Two engineers rolled a new key onto a data-centre interconnect. One added key 2 on DC1 at 10:00; the other, on a different call, added it on DC2 at 10:05. From 10:00:40 the adjacency was down and east-west replication traffic stopped until 10:05. The post-incident fix was to pre-stage keys on both routers with an accept-lifetime one hour earlier than the send-lifetime, with NTP verified on both, so the switch happens simultaneously without anyone typing at the moment of change.</p><p><b>Lesson:</b> key rollover is a timing problem; key chain lifetimes are the tool that solves it.</p></div>

<div class="iv"><p class="q">"How do you configure HMAC-SHA authentication for OSPFv2, and how do you rotate keys without an outage?"</p><p>Strong answer: create a key chain with a key ID, key string and <code>cryptographic-algorithm hmac-sha-256</code> (or stronger), and apply it with <code>ip ospf authentication key-chain NAME</code> on the interface, or on a virtual link under the router process. Key ID, string and algorithm must match. For rotation, pre-stage the new key on every router with an accept-lifetime that starts before the send-lifetime, rely on NTP, and verify with the "Sending SA" line in <code>show ip ospf interface</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HMAC-SHA (RFC 5709) replaces MD5 using key chains with <code>cryptographic-algorithm</code>.</li>
<li>Apply with <code>ip ospf authentication key-chain NAME</code>; key ID, string and algorithm must match.</li>
<li>Send uses the newest valid key; receive uses the key ID in the packet.</li>
<li>Use accept-lifetime and send-lifetime with NTP for a hitless, scheduled rollover.</li>
<li>Verify with <code>show key chain</code> and "Sending SA: Key N, Algorithm ..." in <code>show ip ospf interface</code>.</li>
</ul></div>
`,hi:`
<p>Bank ka locker room socho. Purana taala (MD5) ab bhi chalta hai, lekin locksmiths use kamzor karna jaante hain, isliye bank ek modern taala (HMAC-SHA) lagata hai. Bank ek key ring bhi rakhta hai jismein dated keys hain: yeh key mahine ke end tak locker kholti hai, agli key agle mahine ki pehli tareekh se. Woh key ring <b>key chain</b> hai, aur IOS modern OSPF authentication isi se karta hai.</p>

<h3>HMAC-SHA kyun</h3>
<p>MD5 cryptographically kamzor maana jaata hai, aur security policies use zyada se zyada mana kar rahi hain. RFC 5709 ne OSPFv2 mein <b>HMAC-SHA</b> authentication joda, usi cryptographic (type 2) framework ke saath: key ID, sequence number aur digest, jo ab HMAC-SHA-1, -256, -384 ya -512 se calculate hota hai. IOS aur IOS XE par aap ise <b>key chain</b> se configure karte ho, jahan har key ke paas string, algorithm aur optional lifetimes hote hain.</p>

<h3>Key chain banana</h3>
<pre class="code"><span class="c">! DC1 aur DC2: identical key chains</span>
key chain OSPF-SHA
 key 1
  key-string Nk-Sha256-Key
  cryptographic-algorithm hmac-sha-256
<span class="c">! Interface par apply karo</span>
interface GigabitEthernet0/0
 ip ospf authentication key-chain OSPF-SHA
<span class="c">! Virtual link use karega: area 1 virtual-link 3.3.3.3 authentication key-chain OSPF-SHA</span></pre>
<p>Neighbours ke beech teen values agree honi chahiye: <b>key ID</b>, <b>key string</b> aur <b>cryptographic algorithm</b>. Key chain ka naam local hai aur match hona zaroori nahi, lekin har jagah same naam rakhne se operations simple rehte hain. <code>cryptographic-algorithm</code> line ke bina key OSPF ke liye use nahi ho sakti, isliye ise skip mat karo.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Key chain structure aur key selection">
<rect x="10" y="20" width="230" height="190" rx="10" fill="#ddd6fe"/><text x="125" y="44" text-anchor="middle" class="svg-ink" font-size="13">key chain OSPF-SHA</text>
<rect x="25" y="60" width="200" height="60" rx="8" fill="#ffffff" stroke="#64748b"/><text x="125" y="82" text-anchor="middle" class="svg-ink" font-size="12">key 1: Nk-Sha256-Key</text><text x="125" y="102" text-anchor="middle" class="svg-muted" font-size="12">hmac-sha-256</text>
<rect x="25" y="132" width="200" height="60" rx="8" fill="#ffffff" stroke="#64748b"/><text x="125" y="154" text-anchor="middle" class="svg-ink" font-size="12">key 2: Nk-Sha512-Key</text><text x="125" y="174" text-anchor="middle" class="svg-muted" font-size="12">hmac-sha-512</text>
<line x1="240" y1="162" x2="330" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="80" width="140" height="60" rx="8" fill="#bae6fd"/><text x="400" y="104" text-anchor="middle" class="svg-ink" font-size="13">DC1 Gi0/0</text><text x="400" y="124" text-anchor="middle" class="svg-accent" font-size="12">key 2 se bhejta</text>
<line x1="470" y1="110" x2="500" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="500" y="80" width="130" height="60" rx="8" fill="#bae6fd"/><text x="565" y="104" text-anchor="middle" class="svg-ink" font-size="13">DC2 Gi0/0</text><text x="565" y="124" text-anchor="middle" class="svg-muted" font-size="12">key 2 dhoondhta</text>
<text x="480" y="180" text-anchor="middle" class="svg-ink" font-size="12">Send: highest valid send key</text>
<text x="480" y="200" text-anchor="middle" class="svg-ink" font-size="12">Receive: packet ki key ID</text>
</svg><p class="cap">Sender sabse nayi valid key chunta hai; receiver packet mein aayi key ID se apni chain mein matching key dhoondhta hai.</p></div>

<h3>Lab walk-through: DC1 aur DC2 ke beech DCI</h3>
<p>Dono routers bina authentication ke OSPF area 0 chalate hain. Pehle DC1 par chain banao. Jaise hi aap ise DC1 ke Gi0/0 par apply karte ho, DC1 apne packets sign karna aur DC2 ke unsigned packets drop karna shuru kar deta hai, isliye jab tak DC2 jaldi configure na ho, dead interval ke baad adjacency fail ho jaayegi. Lab ka yahi lesson hai: apply karne se pehle hamesha dono ends taiyaar karo.</p>
<pre class="out">DC1#show key chain OSPF-SHA
Key-chain OSPF-SHA:
    key 1 -- text "Nk-Sha256-Key"
<span class="hl">        cryptographic-algorithm: hmac-sha-256</span>
        accept lifetime (always valid) - (always valid) [valid now]
        send lifetime (always valid) - (always valid) [valid now]

DC1#show ip ospf interface GigabitEthernet0/0 | include authen|SA
<span class="hl">  Cryptographic authentication enabled</span>
<span class="hl">    Sending SA: Key 1, Algorithm HMAC-SHA-256 - key chain OSPF-SHA</span>

DC1#show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
<span class="hl">10.255.0.2        1   FULL/DR         00:00:36    10.200.0.2      GigabitEthernet0/0</span></pre>

<h3>Nayi key par roll over karna</h3>
<p>Ab dono routers par zyada strong algorithm ke saath key 2 jodo:</p>
<pre class="code">key chain OSPF-SHA
 key 2
  key-string Nk-Sha512-Key
  cryptographic-algorithm hmac-sha-512</pre>
<pre class="out">DC2#show ip ospf interface GigabitEthernet0/0 | include SA
<span class="hl">    Sending SA: Key 2, Algorithm HMAC-SHA-512 - key chain OSPF-SHA</span></pre>
<p>IOS us sabse nayi key se bhejta hai jiska send lifetime valid hai aur har us key ko accept karta hai jiska accept lifetime valid hai. Jaise hi DC1 ke paas key 2 aati hai, woh key 2 se sign karta hai. Agar DC2 ke paas abhi key 2 nahi hai, to woh un packets ko verify nahi kar sakta aur drop karta hai, isliye doosra router dead interval (yahan 40 seconds) ke andar khatam karna hoga. Production mein <b>lifetimes</b> se yeh race poori tarah hata do:</p>
<pre class="code"><span class="c">! Dono routers par, change window se kuch din pehle</span>
key chain OSPF-SHA
 key 2
  key-string Nk-Sha512-Key
  cryptographic-algorithm hmac-sha-512
  accept-lifetime 01:00:00 Oct 5 2026 infinite
  send-lifetime 02:00:00 Oct 5 2026 infinite</pre>
<p>Dono routers 01:00 par key 2 accept karna aur 02:00 par bhejna shuru karte hain, ek hi pal mein, jab tak unki clocks match karti hain. Isliye scheduled rollover ke liye <b>NTP</b> prerequisite hai. Jab key 2 har jagah use hone lage, key 1 ko end time do ya hata do.</p>

<table class="cmp"><tr><th></th><th>MD5 (message-digest-key)</th><th>Key chain</th></tr>
<tr><td>Key kahan rehti hai</td><td>Interface command</td><td>Global key chain, interface se referenced</td></tr>
<tr><td>Algorithms</td><td>Sirf MD5</td><td>MD5, HMAC-SHA-1/256/384/512</td></tr>
<tr><td>Rollover</td><td>Nayi key ID jodo; peers switch hone tak IOS dono se bhejta hai</td><td>Sabse nayi valid key bhejti hai; lifetimes switch schedule karte hain</td></tr>
<tr><td>Verification line</td><td>Youngest key id is N</td><td>Sending SA: Key N, Algorithm ...</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> DC1 ke paas key 1 (sha-256) aur key 2 (sha-512) hai. DC2 ke paas key 1 (sha-256) aur sahi string wali key 2 hai lekin <code>hmac-sha-384</code> ke saath. DC1 key 2, SHA-512 se bhejta hai. DC2 apni chain mein key 2 dhoondhta hai, SHA-384 digest calculate karta hai, alag result paata hai aur packet drop karta hai. 40 seconds baad neighbour down ho jaata hai, jabki "key same hai". Algorithm theek karo aur adjacency wapas aati hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> <code>cryptographic-algorithm</code> chhod dena. String match karna lekin algorithm nahi. Aise routers par lifetimes use karna jinki clocks mein minutes ka farak hai. Interface ke andar key chain naam mein typo: tab interface aisi chain ko refer karta hai jo exist hi nahi karti. Trailing space ke saath key string paste karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Key-chain authentication mein key ID, key string <b>aur</b> algorithm match hone chahiye; key chain ka <b>naam</b> nahi. Aur router <b>sabse nayi</b> valid key se bhejta hai, sabse chhote key number se nahi.</p></div>

<div class="scn"><h4>Paanch minute ka DCI outage</h4><p>Do engineers ne data-centre interconnect par nayi key roll ki. Ek ne 10:00 par DC1 par key 2 jodi; doosre ne, alag call par, 10:05 par DC2 par. 10:00:40 se adjacency down rahi aur east-west replication traffic 10:05 tak ruka raha. Post-incident fix tha dono routers par keys pehle se stage karna, accept-lifetime send-lifetime se ek ghanta pehle, dono par NTP verify karke, taaki switch ek saath ho aur change ke pal koi type na kar raha ho.</p><p><b>Lesson:</b> key rollover timing ki problem hai; key chain lifetimes use solve karne ka tool hain.</p></div>

<div class="iv"><p class="q">"OSPFv2 ke liye HMAC-SHA authentication kaise configure karte ho, aur bina outage ke keys kaise rotate karte ho?"</p><p>Strong answer: key ID, key string aur <code>cryptographic-algorithm hmac-sha-256</code> (ya zyada strong) ke saath key chain banao, aur interface par <code>ip ospf authentication key-chain NAME</code> se apply karo, ya virtual link par router process ke andar. Key ID, string aur algorithm match hone chahiye. Rotation ke liye har router par nayi key pehle se stage karo, accept-lifetime send-lifetime se pehle shuru ho, NTP par bharosa karo, aur <code>show ip ospf interface</code> ki "Sending SA" line se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HMAC-SHA (RFC 5709) <code>cryptographic-algorithm</code> wali key chains ke saath MD5 ko replace karta hai.</li>
<li><code>ip ospf authentication key-chain NAME</code> se apply karo; key ID, string aur algorithm match hone chahiye.</li>
<li>Send sabse nayi valid key use karta hai; receive packet ki key ID use karta hai.</li>
<li>Hitless, scheduled rollover ke liye NTP ke saath accept-lifetime aur send-lifetime use karo.</li>
<li><code>show key chain</code> aur <code>show ip ospf interface</code> mein "Sending SA: Key N, Algorithm ..." se verify karo.</li>
</ul></div>
`}};export{e as default};