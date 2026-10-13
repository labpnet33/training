var e={id:`authentication`,h:{en:`Authentication: MD5 key chains and HMAC-SHA-256`,hi:`Authentication: MD5 key chains aur HMAC-SHA-256`},body:{en:`
<p>Picture a housing society where every guard has a ring of numbered keys. A visitor does not just say the password; the visitor says "I am using key number 1" and shows it. The guard looks for key number 1 on his own ring and compares. If the guard's ring has the same password hanging on hook number 2, the visitor is still refused. That is EIGRP MD5 authentication: the <b>key ID travels with every packet</b>, and the receiver checks that exact ID. Most authentication tickets come from this one detail.</p>

<h3>MD5 with key chains</h3>
<pre class="code">key chain NK-KEYS
 key 1
  key-string Kings@26
!
<span class="c">! classic mode, per interface</span>
interface GigabitEthernet0/0
 ip authentication mode eigrp 10 md5
 ip authentication key-chain eigrp 10 NK-KEYS
!
<span class="c">! named mode, per af-interface (or af-interface default)</span>
router eigrp NK-WAN
 address-family ipv4 unicast autonomous-system 10
  af-interface GigabitEthernet0/0
   authentication mode md5
   authentication key-chain NK-KEYS</pre>
<p>The rules you must remember:</p>
<ul>
<li>The sender uses the <b>lowest-numbered key that is valid now</b> (send lifetime) and puts its key ID in the packet.</li>
<li>The receiver looks up that key ID in its own chain; the key must exist, be within its accept lifetime and have the <b>same string</b>.</li>
<li>Key strings are case-sensitive, and a trailing space typed at the end of the string becomes part of it.</li>
<li>Both the mode and the key chain are needed. A mode with no key chain, or a key chain with no mode, does not authenticate.</li>
<li>The key chain name is local; it does not have to match between routers.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Key ID mismatch">
<rect x="20" y="30" width="200" height="120" rx="10" fill="#fed7aa"/><text x="120" y="56" text-anchor="middle" class="svg-ink" font-size="14">SP1 NK-KEYS</text><text x="120" y="84" text-anchor="middle" class="svg-ink" font-size="13">key 2 = Kings@26</text><text x="120" y="110" text-anchor="middle" class="svg-muted" font-size="12">sends key ID 2</text>
<rect x="420" y="30" width="200" height="120" rx="10" fill="#bae6fd"/><text x="520" y="56" text-anchor="middle" class="svg-ink" font-size="14">HUB NK-KEYS</text><text x="520" y="84" text-anchor="middle" class="svg-ink" font-size="13">key 1 = Kings@26</text><text x="520" y="110" text-anchor="middle" class="svg-muted" font-size="12">sends key ID 1</text>
<line x1="220" y1="75" x2="420" y2="75" stroke="#64748b" stroke-width="2"/><text x="320" y="68" text-anchor="middle" class="svg-accent" font-size="12">key ID 2: not on HUB</text>
<line x1="220" y1="115" x2="420" y2="115" stroke="#64748b" stroke-width="2"/><text x="320" y="135" text-anchor="middle" class="svg-accent" font-size="12">key ID 1: not on SP1</text>
<text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="13">Same password, different IDs: both sides drop every packet</text>
</svg><p class="cap">The troubleshooting lab's SP1 fault: the password is right but the key ID is wrong.</p></div>

<h3>Proving the key-ID fault</h3>
<pre class="out">HUB#show key chain
Key-chain NK-KEYS:
    key 1 -- text "Kings@26"
        accept lifetime (always valid) - (always valid) [valid now]
        send lifetime (always valid) - (always valid) [valid now]
SP1#show key chain
Key-chain NK-KEYS:
<span class="hl">    key 2 -- text "Kings@26"</span>
        accept lifetime (always valid) - (always valid) [valid now]
        send lifetime (always valid) - (always valid) [valid now]
HUB#debug eigrp packets
EIGRP: pkt key id = 2, authentication mismatch
<span class="hl">EIGRP: GigabitEthernet0/0: ignored packet from 10.20.1.2, opcode = 5 (invalid authentication)</span></pre>
<p>Opcode 5 is a Hello. The fix on SP1: <code>key chain NK-KEYS</code>, <code>no key 2</code>, <code>key 1</code>, <code>key-string Kings@26</code>. Both sides now send and accept key ID 1.</p>

<h3>One side only: the flapping neighbour</h3>
<p>In the lab, HUB's Gi0/1 has no authentication while SP2 has MD5. HUB accepts SP2's Hellos and brings the neighbour up. SP2, however, drops HUB's unauthenticated packets as <code>(missing authentication)</code>, so HUB's Updates are never acknowledged. After 16 retries HUB logs <code>retry limit exceeded</code>, and the cycle repeats.</p>
<pre class="out">HUB#show ip eigrp interfaces detail GigabitEthernet0/1
EIGRP-IPv4 Interfaces for AS(10)
                              Xmit Queue   PeerQ        Mean   Pacing Time   Multicast    Pending
Interface              Peers  Un/Reliable  Un/Reliable  SRTT   Un/Reliable   Flow Timer   Routes
Gi0/1                    1        0/1       0/0           0       0/0           50           1
  Hello-interval is 5, Hold-time is 15
  Split-horizon is enabled
  Retransmissions sent: 48  Out-of-sequence rcvd: 0
<span class="hl">  Authentication mode is not set</span>
HUB#show ip eigrp interfaces detail GigabitEthernet0/0 | include Authentication
  Authentication mode is md5,  key-chain is "NK-KEYS"</pre>

<h3>HMAC-SHA-256 (named mode only)</h3>
<p>Named mode adds <b>HMAC-SHA-256</b>, a much stronger hash than MD5. It is configured with a password directly on the af-interface. Classic mode cannot do it.</p>
<pre class="code">router eigrp NK-WAN
 address-family ipv4 unicast autonomous-system 10
  af-interface default
   authentication mode hmac-sha-256 Kings@26   <span class="c">! all EIGRP interfaces</span>
  exit-af-interface</pre>
<pre class="out">SP1#show eigrp address-family ipv4 interfaces detail | include Authentication
<span class="hl">  Authentication mode is HMAC-SHA-256, key-chain is not set</span></pre>
<p>Both ends must use the same mode. MD5 on one side and SHA-256 on the other fails exactly like a wrong password.</p>

<div class="eg"><p><b>Worked example: a clean key rollover.</b> Today key 1 is in use. You add key 2 with a new string on every router, with <code>send-lifetime</code> starting next Sunday at 02:00 and <code>accept-lifetime</code> starting now. Key 1 gets a send lifetime that ends next Sunday at 02:10, and an accept lifetime that ends a day later. Between 02:00 and 02:10 both keys are valid for sending, so each router still sends the lowest, key 1. From 02:10, when key 1's send lifetime ends, every router sends key 2. Because both keys are accepted during the overlap, nobody drops a packet. This only works if clocks are synchronised with NTP.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Matching the password but not the key ID; configuring authentication on one side first during a rollout (that neighbour flaps until the other side is done); a key with lifetimes in the past because the router clock is wrong; typing the mode but forgetting the key chain.</p></div>

<div class="exam"><p><b>Exam trap.</b> HMAC-SHA-256 is available only in named mode. MD5 is available in both. With MD5, the key chain name need not match but the key ID and string must. An authentication failure usually produces <b>no log message</b>; you find it with <code>show ip eigrp interfaces detail</code>, <code>show key chain</code> and <code>debug eigrp packets</code>.</p></div>

<div class="scn"><h4>The midnight rollover that took down 30 sites</h4><p>A bank rotated EIGRP keys with send and accept lifetimes that ended at midnight. At 00:00 every branch whose clock was correct stopped accepting key 1, but eight routers without NTP were still sending key 1 because their clocks were hours behind. Their neighbours dropped and routes to 30 sites were lost. <code>show key chain</code> on a failing router showed key 2 as "[not valid]" because the router believed it was still yesterday. Fixing NTP and adding overlapping accept lifetimes solved it.</p><p><b>Lesson:</b> time-based keys need synchronised clocks and generous overlapping accept windows.</p></div>

<div class="iv"><p class="q">"Two routers use the same MD5 password but will not form an adjacency. Why?"</p><p>Explain that the key ID travels in the packet: the sender uses its lowest valid key, and the receiver must have that same key ID with the same string and a valid accept lifetime. So key 1 on one side and key 2 on the other fails. Mention checking <code>show key chain</code> for "[valid now]", a wrong clock, trailing spaces, and that named mode also supports HMAC-SHA-256, which must match on both ends.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MD5: the sender uses its lowest valid key; the receiver needs the same key ID and string.</li>
<li>The key chain name is local; the key ID and string are not.</li>
<li>One-sided authentication makes a neighbour flap with retry limit exceeded.</li>
<li>HMAC-SHA-256 exists only in named mode and is set per af-interface.</li>
<li>Verify with <code>show ip eigrp interfaces detail</code>, <code>show key chain</code> and <code>debug eigrp packets</code>.</li>
</ul></div>
`,hi:`
<p>Ek housing society socho jahan har guard ke paas numbered keys ka ring hai. Visitor sirf password nahi bolta; visitor bolta hai "main key number 1 use kar raha hoon" aur use dikhata hai. Guard apne ring mein key number 1 dhoondhta hai aur compare karta hai. Agar guard ke ring mein same password hook number 2 par latka hai, to bhi visitor mana ho jaata hai. Yahi EIGRP MD5 authentication hai: <b>key ID har packet ke saath jaati hai</b>, aur receiver wahi exact ID check karta hai. Zyada tar authentication tickets isi ek detail se aate hain.</p>

<h3>Key chains ke saath MD5</h3>
<pre class="code">key chain NK-KEYS
 key 1
  key-string Kings@26
!
<span class="c">! classic mode, har interface par</span>
interface GigabitEthernet0/0
 ip authentication mode eigrp 10 md5
 ip authentication key-chain eigrp 10 NK-KEYS
!
<span class="c">! named mode, har af-interface par (ya af-interface default)</span>
router eigrp NK-WAN
 address-family ipv4 unicast autonomous-system 10
  af-interface GigabitEthernet0/0
   authentication mode md5
   authentication key-chain NK-KEYS</pre>
<p>Yeh rules yaad rakhne hain:</p>
<ul>
<li>Sender <b>sabse chhote number wali key jo abhi valid hai</b> (send lifetime) use karta hai aur uski key ID packet mein daalta hai.</li>
<li>Receiver apni chain mein wahi key ID dhoondhta hai; key exist karni chahiye, accept lifetime ke andar honi chahiye aur uski <b>same string</b> honi chahiye.</li>
<li>Key strings case-sensitive hain, aur string ke end mein type kiya gaya extra space bhi uska hissa ban jaata hai.</li>
<li>Mode aur key chain dono chahiye. Bina key chain ka mode, ya bina mode ki key chain, authenticate nahi karti.</li>
<li>Key chain ka naam local hai; routers ke beech match hona zaroori nahi.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Key ID mismatch">
<rect x="20" y="30" width="200" height="120" rx="10" fill="#fed7aa"/><text x="120" y="56" text-anchor="middle" class="svg-ink" font-size="14">SP1 NK-KEYS</text><text x="120" y="84" text-anchor="middle" class="svg-ink" font-size="13">key 2 = Kings@26</text><text x="120" y="110" text-anchor="middle" class="svg-muted" font-size="12">key ID 2 bhejta hai</text>
<rect x="420" y="30" width="200" height="120" rx="10" fill="#bae6fd"/><text x="520" y="56" text-anchor="middle" class="svg-ink" font-size="14">HUB NK-KEYS</text><text x="520" y="84" text-anchor="middle" class="svg-ink" font-size="13">key 1 = Kings@26</text><text x="520" y="110" text-anchor="middle" class="svg-muted" font-size="12">key ID 1 bhejta hai</text>
<line x1="220" y1="75" x2="420" y2="75" stroke="#64748b" stroke-width="2"/><text x="320" y="68" text-anchor="middle" class="svg-accent" font-size="12">key ID 2: HUB par nahi</text>
<line x1="220" y1="115" x2="420" y2="115" stroke="#64748b" stroke-width="2"/><text x="320" y="135" text-anchor="middle" class="svg-accent" font-size="12">key ID 1: SP1 par nahi</text>
<text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="13">Same password, alag IDs: dono side har packet drop karti hain</text>
</svg><p class="cap">Troubleshooting lab ka SP1 fault: password sahi hai lekin key ID galat.</p></div>

<h3>Key-ID fault prove karna</h3>
<pre class="out">HUB#show key chain
Key-chain NK-KEYS:
    key 1 -- text "Kings@26"
        accept lifetime (always valid) - (always valid) [valid now]
        send lifetime (always valid) - (always valid) [valid now]
SP1#show key chain
Key-chain NK-KEYS:
<span class="hl">    key 2 -- text "Kings@26"</span>
        accept lifetime (always valid) - (always valid) [valid now]
        send lifetime (always valid) - (always valid) [valid now]
HUB#debug eigrp packets
EIGRP: pkt key id = 2, authentication mismatch
<span class="hl">EIGRP: GigabitEthernet0/0: ignored packet from 10.20.1.2, opcode = 5 (invalid authentication)</span></pre>
<p>Opcode 5 ek Hello hai. SP1 par fix: <code>key chain NK-KEYS</code>, <code>no key 2</code>, <code>key 1</code>, <code>key-string Kings@26</code>. Ab dono side key ID 1 bhejti aur accept karti hain.</p>

<h3>Sirf ek side: flap karta neighbour</h3>
<p>Lab mein HUB ke Gi0/1 par koi authentication nahi hai jabki SP2 par MD5 hai. HUB SP2 ke Hellos accept karke neighbour up kar deta hai. Lekin SP2 HUB ke unauthenticated packets ko <code>(missing authentication)</code> bol kar drop karta hai, isliye HUB ke Updates ka kabhi acknowledgement nahi aata. 16 retries ke baad HUB <code>retry limit exceeded</code> log karta hai, aur cycle repeat hoti hai.</p>
<pre class="out">HUB#show ip eigrp interfaces detail GigabitEthernet0/1
EIGRP-IPv4 Interfaces for AS(10)
                              Xmit Queue   PeerQ        Mean   Pacing Time   Multicast    Pending
Interface              Peers  Un/Reliable  Un/Reliable  SRTT   Un/Reliable   Flow Timer   Routes
Gi0/1                    1        0/1       0/0           0       0/0           50           1
  Hello-interval is 5, Hold-time is 15
  Split-horizon is enabled
  Retransmissions sent: 48  Out-of-sequence rcvd: 0
<span class="hl">  Authentication mode is not set</span>
HUB#show ip eigrp interfaces detail GigabitEthernet0/0 | include Authentication
  Authentication mode is md5,  key-chain is "NK-KEYS"</pre>

<h3>HMAC-SHA-256 (sirf named mode)</h3>
<p>Named mode <b>HMAC-SHA-256</b> jodta hai, jo MD5 se kahin zyada strong hash hai. Yeh af-interface par seedha password ke saath configure hota hai. Classic mode yeh nahi kar sakta.</p>
<pre class="code">router eigrp NK-WAN
 address-family ipv4 unicast autonomous-system 10
  af-interface default
   authentication mode hmac-sha-256 Kings@26   <span class="c">! saare EIGRP interfaces</span>
  exit-af-interface</pre>
<pre class="out">SP1#show eigrp address-family ipv4 interfaces detail | include Authentication
<span class="hl">  Authentication mode is HMAC-SHA-256, key-chain is not set</span></pre>
<p>Dono ends par same mode hona chahiye. Ek side MD5 aur doosri side SHA-256 bilkul galat password ki tarah fail hota hai.</p>

<div class="eg"><p><b>Worked example: saaf key rollover.</b> Aaj key 1 use ho rahi hai. Aap har router par nayi string ke saath key 2 add karte ho, jiska <code>send-lifetime</code> agle Sunday 02:00 se shuru hota hai aur <code>accept-lifetime</code> abhi se. Key 1 ko aisa send lifetime milta hai jo agle Sunday 02:10 par khatam ho, aur aisa accept lifetime jo ek din baad khatam ho. 02:00 se 02:10 ke beech dono keys sending ke liye valid hain, isliye har router ab bhi sabse chhoti, key 1, bhejta hai. 02:10 se, jab key 1 ka send lifetime khatam hota hai, har router key 2 bhejta hai. Overlap ke dauraan dono keys accept hoti hain, isliye koi packet drop nahi hota. Yeh tabhi chalta hai jab clocks NTP se synchronised hon.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Password match karna lekin key ID nahi; rollout ke dauraan pehle sirf ek side authentication configure karna (woh neighbour tab tak flap karta hai jab tak doosri side na ho jaaye); router clock galat hone se key ki lifetimes past mein hona; mode type karna lekin key chain bhool jaana.</p></div>

<div class="exam"><p><b>Exam trap.</b> HMAC-SHA-256 sirf named mode mein available hai. MD5 dono mein hai. MD5 ke saath key chain name match hona zaroori nahi lekin key ID aur string zaroori hain. Authentication failure aam taur par <b>koi log message nahi</b> deta; aap ise <code>show ip eigrp interfaces detail</code>, <code>show key chain</code> aur <code>debug eigrp packets</code> se dhoondhte ho.</p></div>

<div class="scn"><h4>Aadhi raat ka rollover jisne 30 sites gira di</h4><p>Ek bank ne EIGRP keys aise send aur accept lifetimes ke saath rotate ki jo aadhi raat ko khatam hoti thi. 00:00 par har branch jiska clock sahi tha usne key 1 accept karna band kar diya, lekin bina NTP wale aath routers ab bhi key 1 bhej rahe the kyunki unke clocks ghanton peeche the. Unke neighbours gire aur 30 sites ke routes chale gaye. Failing router par <code>show key chain</code> ne key 2 ko "[not valid]" dikhaya kyunki router samajh raha tha ki abhi kal hi hai. NTP theek karne aur overlapping accept lifetimes add karne se problem solve hui.</p><p><b>Seekh:</b> time-based keys ko synchronised clocks aur khule overlapping accept windows chahiye.</p></div>

<div class="iv"><p class="q">"Do routers same MD5 password use karte hain lekin adjacency nahi banti. Kyun?"</p><p>Samjhao ki key ID packet mein jaati hai: sender apni sabse chhoti valid key use karta hai, aur receiver ke paas wahi key ID same string aur valid accept lifetime ke saath honi chahiye. Isliye ek side key 1 aur doosri side key 2 fail hota hai. Batao ki aap <code>show key chain</code> mein "[valid now]", galat clock, trailing spaces check karoge, aur named mode HMAC-SHA-256 bhi support karta hai, jo dono ends par match hona chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MD5: sender apni sabse chhoti valid key use karta hai; receiver ko same key ID aur string chahiye.</li>
<li>Key chain ka naam local hai; key ID aur string nahi.</li>
<li>Ek side authentication neighbour ko retry limit exceeded ke saath flap karwata hai.</li>
<li>HMAC-SHA-256 sirf named mode mein hai aur har af-interface par set hota hai.</li>
<li>Verify karo <code>show ip eigrp interfaces detail</code>, <code>show key chain</code> aur <code>debug eigrp packets</code> se.</li>
</ul></div>
`}};export{e as default};