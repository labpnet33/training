var e={id:`neighbours`,h:{en:`Neighbours: what must match, and what need not`,hi:`Neighbours: kya match hona chahiye, aur kya nahi`},body:{en:`
<p>Joining a cricket club is a good way to picture an EIGRP adjacency. You must turn up at the right club (the <b>AS number</b>), agree to the same scoring rules (the <b>K values</b>), actually be in the same ground (a <b>common subnet</b>), and know the password at the gate (<b>authentication</b>). What time you usually arrive does not matter much, as long as you do not disappear for too long. EIGRP neighbours work exactly like this.</p>

<h3>The requirements</h3>
<table class="cmp"><tr><th>Must match</th><th>What you see when it does not</th></tr>
<tr><td>Autonomous system number (<code>router eigrp 100</code>)</td><td>Nothing. Hellos from a different AS are silently ignored; no log message.</td></tr>
<tr><td>K values (metric weights)</td><td><code>%DUAL-5-NBRCHANGE ... is down: K-value mismatch</code> on both sides, repeating</td></tr>
<tr><td>Primary IP addresses in a common subnet</td><td><code>%DUAL-6-NBRINFO ... is blocked: not on common subnet</code></td></tr>
<tr><td>Authentication (mode, key ID and key string)</td><td>No neighbour; <code>debug eigrp packets</code> shows authentication mismatch</td></tr>
<tr><td>Interface enabled and not passive on both ends</td><td>No Hellos on that link, so no neighbour</td></tr>
</table>
<p>Things that do <b>not</b> have to match: <b>hello and hold timers</b>, <b>MTU</b> (unlike OSPF) and the <b>router ID</b>. A duplicate router ID does not block the adjacency, but it causes external routes from the "other" router to be ignored, because EIGRP drops external routes that carry its own router ID.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Neighbour checklist between R1 and R2">
<rect x="30" y="90" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="90" y="115" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="90" y="135" text-anchor="middle" class="svg-muted" font-size="12">10.0.12.1/24</text>
<rect x="490" y="90" width="120" height="60" rx="8" fill="#bae6fd"/><text x="550" y="115" text-anchor="middle" class="svg-ink" font-size="14">R2</text><text x="550" y="135" text-anchor="middle" class="svg-muted" font-size="12">10.0.12.2/24</text>
<line x1="150" y1="120" x2="490" y2="120" stroke="#64748b" stroke-width="2"/>
<rect x="200" y="20" width="240" height="190" rx="8" fill="#fde68a" opacity="0.6"/>
<text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">Must match</text>
<text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="12">AS 100 = AS 100</text>
<text x="320" y="88" text-anchor="middle" class="svg-muted" font-size="12">K 1 0 1 0 0 = K 1 0 1 0 0</text>
<text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="12">same subnet 10.0.12.0/24</text>
<text x="320" y="128" text-anchor="middle" class="svg-muted" font-size="12">same auth key</text>
<text x="320" y="156" text-anchor="middle" class="svg-accent" font-size="13">Need not match</text>
<text x="320" y="178" text-anchor="middle" class="svg-muted" font-size="12">hello/hold, MTU, router ID</text>
</svg><p class="cap">The adjacency checklist for the R1 to R2 link in lab 1.</p></div>

<h3>Reading show ip eigrp neighbors</h3>
<pre class="out">R1# show ip eigrp neighbors
EIGRP-IPv4 Neighbors for AS(100)
H   Address                 Interface              Hold Uptime   SRTT   RTO  Q  Seq
                                                   (sec)         (ms)       Cnt Num
<span class="hl">1   10.0.13.3               Gi0/1                    13 00:01:52    9   100  0  7</span>
<span class="hl">0   10.0.12.2               Gi0/0                    11 00:02:30    6   100  0  15</span></pre>
<dl class="terms">
<dt>H</dt><dd>Handle: the order in which neighbours came up, starting at 0.</dd>
<dt>Hold</dt><dd>Seconds left before the neighbour is declared dead. It counts down from 15 and resets with every packet, so it normally moves between about 10 and 15.</dd>
<dt>Uptime</dt><dd>How long the adjacency has been up. A small uptime that keeps resetting means flapping.</dd>
<dt>SRTT and RTO</dt><dd>Smoothed round-trip time and retransmission timeout used by RTP.</dd>
<dt>Q Cnt</dt><dd>Reliable packets waiting to be acknowledged. It should be 0.</dd>
<dt>Seq Num</dt><dd>The last sequence number received from that neighbour.</dd>
</dl>

<h3>Timers: they may differ, but be careful</h3>
<p>Each router puts <b>its own hold time</b> inside its Hellos, and the neighbour uses that value. So R1 can say hello every 5 seconds and R2 every 10, and the adjacency is fine. Classic configuration is per interface:</p>
<pre class="code"><span class="c">! classic mode, on the interface</span>
interface GigabitEthernet0/0
 ip hello-interval eigrp 100 5
 ip hold-time eigrp 100 15</pre>

<div class="eg"><p><b>Worked example: the flapping hello.</b> An engineer sets <code>ip hello-interval eigrp 100 20</code> on R1 Gi0/0 to "save bandwidth" but does not change the hold time. R1 still advertises a hold time of <b>15</b> seconds. R2 therefore waits 15 seconds for R1's next packet, but R1 only speaks every 20 seconds. At second 15, R2 logs <code>Neighbor 10.0.12.1 (GigabitEthernet0/0) is down: holding time expired</code>; at second 20 the Hello arrives and the adjacency re-forms. The link flaps every cycle. Unlike OSPF, EIGRP does <b>not</b> adjust the hold time automatically when you change the hello. Rule of thumb: always set hold to three times hello.</p></div>

<h3>Authentication</h3>
<p>Authentication stops an unknown router from forming an adjacency and injecting routes. Classic mode supports MD5 with a key chain; named mode adds <b>HMAC-SHA-256</b>.</p>
<pre class="code"><span class="c">! classic mode: MD5 with a key chain</span>
key chain NK-KEYS
 key 1
  key-string N3tK1ngs
interface GigabitEthernet0/0
 ip authentication mode eigrp 100 md5
 ip authentication key-chain eigrp 100 NK-KEYS

<span class="c">! named mode: HMAC-SHA-256</span>
router eigrp NK
 address-family ipv4 unicast autonomous-system 100
  af-interface GigabitEthernet0/0
   authentication mode hmac-sha-256 N3tK1ngs</pre>
<p>With MD5, the router sends using the <b>lowest valid key ID</b> in its key chain, and the receiver must have that same key ID with the same string. Mismatched key numbers are a classic cause of "the passwords are identical but it still fails".</p>

<div class="warn"><p><b>Common mistake.</b> Using secondary IP addresses to "join" a neighbour on another subnet. EIGRP sources Hellos from the interface's <b>primary</b> address and checks the neighbour against the primary subnet only, so two routers whose primary addresses sit in different subnets never become neighbours.</p></div>

<div class="exam"><p><b>Exam trap.</b> An AS mismatch produces <b>no</b> error message at all, while a K-value mismatch produces loud log messages. Hello and hold timers do not need to match in EIGRP, but they do in OSPF (hello and dead). MTU mismatch breaks OSPF adjacencies, not EIGRP.</p></div>

<div class="scn"><h4>Same password, no neighbour</h4><p>During a key rotation, R1 was given a key chain with key 1 (old string) and key 2 (new string). R2 was given only key 2. Both had the new string, yet the adjacency dropped. <code>debug eigrp packets</code> on R2 showed authentication failures for key id 1. R1 was sending with its lowest valid key, key 1, which R2 did not have. Adding key 1 to R2 (or removing it from R1 once rotation finished) restored the neighbour.</p><p><b>Lesson:</b> with EIGRP MD5, the key ID must match as well as the string. Rotate keys by adding the new key everywhere first, then removing the old one.</p></div>

<div class="iv"><p class="q">"What must match for two routers to form an EIGRP adjacency, and what does not have to?"</p><p>Strong answer: the AS number, the K values, a common primary subnet, and the authentication settings must match, and the interface must not be passive. Timers, MTU and router ID need not match. Then add the symptoms: AS mismatch is silent, K mismatch logs "K-value mismatch", and subnet mismatch logs "not on common subnet". That second half shows real troubleshooting experience.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Must match: AS, K values, common primary subnet, authentication; and the interface must not be passive.</li>
<li>Need not match: hello and hold timers, MTU, router ID.</li>
<li>Each router advertises its own hold time; changing the hello does not change the hold automatically.</li>
<li>In <code>show ip eigrp neighbors</code>, watch Uptime (flaps) and Q Cnt (stuck reliable packets).</li>
<li>Classic mode uses MD5 key chains; named mode also supports HMAC-SHA-256; key IDs must match.</li>
</ul></div>
`,hi:`
<p>EIGRP adjacency ko samajhne ke liye cricket club join karne ka example achha hai. Aapko sahi club mein pahunchna hoga (<b>AS number</b>), same scoring rules par agree karna hoga (<b>K values</b>), sach mein same ground par hona hoga (<b>common subnet</b>), aur gate ka password pata hona chahiye (<b>authentication</b>). Aap aam taur par kis time aate ho, isse zyada farak nahi padta, bas bahut der tak gaayab mat raho. EIGRP neighbours bilkul aise hi kaam karte hain.</p>

<h3>Requirements</h3>
<table class="cmp"><tr><th>Match hona chahiye</th><th>Match na ho to kya dikhta hai</th></tr>
<tr><td>Autonomous system number (<code>router eigrp 100</code>)</td><td>Kuch nahi. Alag AS ke Hellos chupchaap ignore hote hain; koi log message nahi.</td></tr>
<tr><td>K values (metric weights)</td><td>Dono sides par baar baar <code>%DUAL-5-NBRCHANGE ... is down: K-value mismatch</code></td></tr>
<tr><td>Primary IP addresses ek common subnet mein</td><td><code>%DUAL-6-NBRINFO ... is blocked: not on common subnet</code></td></tr>
<tr><td>Authentication (mode, key ID aur key string)</td><td>Neighbour nahi; <code>debug eigrp packets</code> authentication mismatch dikhata hai</td></tr>
<tr><td>Dono ends par interface enabled aur passive nahi</td><td>Us link par Hellos nahi, isliye neighbour nahi</td></tr>
</table>
<p>Jin cheezon ka match hona <b>zaroori nahi</b>: <b>hello aur hold timers</b>, <b>MTU</b> (OSPF se alag) aur <b>router ID</b>. Duplicate router ID adjacency nahi rokta, lekin "doosre" router ke external routes ignore ho jaate hain, kyunki EIGRP un external routes ko drop kar deta hai jinme uska apna router ID hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="R1 aur R2 ke beech neighbour checklist">
<rect x="30" y="90" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="90" y="115" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="90" y="135" text-anchor="middle" class="svg-muted" font-size="12">10.0.12.1/24</text>
<rect x="490" y="90" width="120" height="60" rx="8" fill="#bae6fd"/><text x="550" y="115" text-anchor="middle" class="svg-ink" font-size="14">R2</text><text x="550" y="135" text-anchor="middle" class="svg-muted" font-size="12">10.0.12.2/24</text>
<line x1="150" y1="120" x2="490" y2="120" stroke="#64748b" stroke-width="2"/>
<rect x="200" y="20" width="240" height="190" rx="8" fill="#fde68a" opacity="0.6"/>
<text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">Match hona chahiye</text>
<text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="12">AS 100 = AS 100</text>
<text x="320" y="88" text-anchor="middle" class="svg-muted" font-size="12">K 1 0 1 0 0 = K 1 0 1 0 0</text>
<text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="12">same subnet 10.0.12.0/24</text>
<text x="320" y="128" text-anchor="middle" class="svg-muted" font-size="12">same auth key</text>
<text x="320" y="156" text-anchor="middle" class="svg-accent" font-size="13">Match zaroori nahi</text>
<text x="320" y="178" text-anchor="middle" class="svg-muted" font-size="12">hello/hold, MTU, router ID</text>
</svg><p class="cap">Lab 1 ke R1 se R2 link ki adjacency checklist.</p></div>

<h3>show ip eigrp neighbors padhna</h3>
<pre class="out">R1# show ip eigrp neighbors
EIGRP-IPv4 Neighbors for AS(100)
H   Address                 Interface              Hold Uptime   SRTT   RTO  Q  Seq
                                                   (sec)         (ms)       Cnt Num
<span class="hl">1   10.0.13.3               Gi0/1                    13 00:01:52    9   100  0  7</span>
<span class="hl">0   10.0.12.2               Gi0/0                    11 00:02:30    6   100  0  15</span></pre>
<dl class="terms">
<dt>H</dt><dd>Handle: jis order mein neighbours up hue, 0 se shuru.</dd>
<dt>Hold</dt><dd>Neighbour ko dead declare karne mein bache seconds. Yeh 15 se neeche ginta hai aur har packet par reset hota hai, isliye normally lagbhag 10 aur 15 ke beech ghoomta hai.</dd>
<dt>Uptime</dt><dd>Adjacency kitni der se up hai. Chhota uptime jo baar baar reset ho, matlab flapping.</dd>
<dt>SRTT aur RTO</dt><dd>RTP ka smoothed round-trip time aur retransmission timeout.</dd>
<dt>Q Cnt</dt><dd>Acknowledgement ka wait kar rahe reliable packets. Yeh 0 hona chahiye.</dd>
<dt>Seq Num</dt><dd>Us neighbour se aaya last sequence number.</dd>
</dl>

<h3>Timers: alag ho sakte hain, par dhyan se</h3>
<p>Har router apne Hellos ke andar <b>apna hold time</b> daalta hai, aur neighbour wahi value use karta hai. Isliye R1 har 5 second hello bol sakta hai aur R2 har 10 second, aur adjacency theek rahegi. Classic configuration per interface hoti hai:</p>
<pre class="code"><span class="c">! classic mode, interface par</span>
interface GigabitEthernet0/0
 ip hello-interval eigrp 100 5
 ip hold-time eigrp 100 15</pre>

<div class="eg"><p><b>Worked example: flap karta hello.</b> Ek engineer "bandwidth bachane" ke liye R1 Gi0/0 par <code>ip hello-interval eigrp 100 20</code> set karta hai lekin hold time nahi badalta. R1 ab bhi <b>15</b> second ka hold time advertise karta hai. Isliye R2, R1 ke agle packet ka 15 second wait karta hai, lekin R1 sirf har 20 second bolta hai. Second 15 par R2 log karta hai <code>Neighbor 10.0.12.1 (GigabitEthernet0/0) is down: holding time expired</code>; second 20 par Hello aata hai aur adjacency dobara banti hai. Link har cycle mein flap karta hai. OSPF se alag, jab aap hello badalte ho to EIGRP hold time ko apne aap adjust <b>nahi</b> karta. Rule of thumb: hold ko hamesha hello ka teen guna rakho.</p></div>

<h3>Authentication</h3>
<p>Authentication kisi anjaan router ko adjacency banane aur routes inject karne se rokta hai. Classic mode key chain ke saath MD5 support karta hai; named mode <b>HMAC-SHA-256</b> bhi jodta hai.</p>
<pre class="code"><span class="c">! classic mode: key chain ke saath MD5</span>
key chain NK-KEYS
 key 1
  key-string N3tK1ngs
interface GigabitEthernet0/0
 ip authentication mode eigrp 100 md5
 ip authentication key-chain eigrp 100 NK-KEYS

<span class="c">! named mode: HMAC-SHA-256</span>
router eigrp NK
 address-family ipv4 unicast autonomous-system 100
  af-interface GigabitEthernet0/0
   authentication mode hmac-sha-256 N3tK1ngs</pre>
<p>MD5 mein router apni key chain ke <b>sabse chhote valid key ID</b> se bhejta hai, aur receiver ke paas wahi key ID same string ke saath honi chahiye. Key numbers ka mismatch "passwords bilkul same hain phir bhi fail ho raha hai" ki ek classic wajah hai.</p>

<div class="warn"><p><b>Common galti.</b> Doosre subnet ke neighbour ko "join" karne ke liye secondary IP addresses use karna. EIGRP Hellos interface ke <b>primary</b> address se bhejta hai aur neighbour ko sirf primary subnet se check karta hai, isliye jin do routers ke primary addresses alag subnets mein hain woh kabhi neighbour nahi bante.</p></div>

<div class="exam"><p><b>Exam trap.</b> AS mismatch <b>koi</b> error message nahi deta, jabki K-value mismatch zor se log messages deta hai. EIGRP mein hello aur hold timers ka match zaroori nahi, lekin OSPF mein (hello aur dead) zaroori hai. MTU mismatch OSPF adjacencies todta hai, EIGRP nahi.</p></div>

<div class="scn"><h4>Same password, neighbour nahi</h4><p>Key rotation ke dauraan R1 ko key 1 (purani string) aur key 2 (nayi string) wali key chain di gayi. R2 ko sirf key 2 di gayi. Dono ke paas nayi string thi, phir bhi adjacency drop ho gayi. R2 par <code>debug eigrp packets</code> ne key id 1 ke liye authentication failures dikhaye. R1 apni sabse chhoti valid key, key 1, se bhej raha tha, jo R2 ke paas thi hi nahi. R2 par key 1 jodne se (ya rotation khatam hone par R1 se hatane se) neighbour wapas aa gaya.</p><p><b>Seekh:</b> EIGRP MD5 mein string ke saath key ID bhi match honi chahiye. Keys rotate karne ke liye pehle nayi key har jagah jodo, phir purani hatao.</p></div>

<div class="iv"><p class="q">"Do routers ki EIGRP adjacency banne ke liye kya match hona chahiye, aur kya zaroori nahi?"</p><p>Strong answer: AS number, K values, common primary subnet aur authentication settings match hone chahiye, aur interface passive nahi hona chahiye. Timers, MTU aur router ID ka match zaroori nahi. Phir symptoms jodo: AS mismatch silent hota hai, K mismatch "K-value mismatch" log karta hai, aur subnet mismatch "not on common subnet" log karta hai. Yeh doosra hissa real troubleshooting experience dikhata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Match hona chahiye: AS, K values, common primary subnet, authentication; aur interface passive nahi hona chahiye.</li>
<li>Match zaroori nahi: hello aur hold timers, MTU, router ID.</li>
<li>Har router apna hold time advertise karta hai; hello badalne se hold apne aap nahi badalta.</li>
<li><code>show ip eigrp neighbors</code> mein Uptime (flaps) aur Q Cnt (atke reliable packets) dekho.</li>
<li>Classic mode MD5 key chains use karta hai; named mode HMAC-SHA-256 bhi support karta hai; key IDs match honi chahiye.</li>
</ul></div>
`}};export{e as default};