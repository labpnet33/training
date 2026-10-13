var e={id:`hardening`,h:{en:`Hardening BGP: MD5, GTSM, maximum-prefix and bogon filtering`,hi:`BGP hardening: MD5, GTSM, maximum-prefix aur bogon filtering`},body:{en:`
<p>A bank vault has several independent defences: a guard who checks that you walked in from the lobby, a password at the door, a limit on how much cash one person can withdraw, and a list of forged notes to reject. A BGP session deserves the same layers, because a single bad session can black-hole a company or leak thousands of routes. In the hardening lab you work through audit finding <b>SEC-114</b> on the peering between PEER-A (AS 65401, 10.40.0.1) and PEER-B (AS 65402, 10.40.0.2).</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Layers of BGP session protection">
<rect x="20" y="20" width="600" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="13">GTSM: only packets that arrive with TTL 254 or more reach BGP</text>
<rect x="50" y="64" width="540" height="36" rx="8" fill="#bae6fd"/><text x="320" y="87" text-anchor="middle" class="svg-ink" font-size="13">MD5 (TCP option): every segment must carry the right digest</text>
<rect x="80" y="108" width="480" height="36" rx="8" fill="#ddd6fe"/><text x="320" y="131" text-anchor="middle" class="svg-ink" font-size="13">Prefix filters: no bogons, no own prefixes, nothing longer than /24</text>
<rect x="110" y="152" width="420" height="36" rx="8" fill="#fde68a"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">maximum-prefix: session drops if the peer leaks</text>
<text x="320" y="212" text-anchor="middle" class="svg-muted" font-size="12">Independent layers: one mistake does not open everything</text>
</svg><p class="cap">Defence in depth for one BGP session, from the transport inwards.</p></div>

<h3>1. MD5 authentication (and the stuck session)</h3>
<p><code>neighbor X password KEY</code> adds a TCP MD5 signature option to every segment of the session, computed over the segment and the shared key. A spoofed RST or data segment without the right digest is dropped by TCP before BGP sees it. Both sides must use the <b>same key</b>. The logs tell you exactly which problem you have:</p>
<pre class="out">PEER-A#
<span class="hl">%TCP-6-BADAUTH: Invalid MD5 digest from 10.40.0.2(179) to 10.40.0.1(23512) tableid - 0</span>
PEER-B#
%TCP-6-BADAUTH: Invalid MD5 digest from 10.40.0.1(23777) to 10.40.0.2(179) tableid - 0</pre>
<table class="cmp"><tr><th>Log message</th><th>Meaning</th></tr>
<tr><td>Invalid MD5 digest</td><td>Both sides have a key, but the keys differ</td></tr>
<tr><td>No MD5 digest from X</td><td>This router has a key, the peer X sends none</td></tr>
<tr><td>No log, session stays Active</td><td>This router has no key; look at the peer, which logs "No MD5 digest"</td></tr>
</table>
<p>In the lab the keys were rolled on one side only: PEER-A has <code>Nk$Peer#2026</code>, PEER-B still has <code>Nk$Peer#2025</code>. The agreed key is PEER-A's, so the fix goes on PEER-B:</p>
<pre class="code"><span class="c">! PEER-B (lab task 1)</span>
router bgp 65402
 neighbor 10.40.0.1 password Nk$Peer#2026</pre>
<p>Changing a key on an established session does not drop it at once. Segments start failing validation, keepalives are lost, and the session falls when the hold timer expires or at the next reset. Plan key changes on both sides inside one window. Newer IOS XE releases also support TCP-AO, which adds key chains with rollover, but MD5 is what the ENARSI blueprint tests.</p>

<h3>2. GTSM: TTL security</h3>
<p>The <b>Generalized TTL Security Mechanism</b> uses a simple fact: a packet's TTL decreases at every router, and nobody can raise it again. With <code>neighbor X ttl-security hops 1</code> the router sends BGP packets with TTL 255 and accepts only packets that arrive with TTL of at least 255 - 1 = <b>254</b>. An attacker three hops away can send TTL 255 at most, which arrives as 252 or lower, so the packet is dropped in hardware or early in the input path before it can load the CPU.</p>
<pre class="code"><span class="c">! Both routers (lab task 2)</span>
PEER-A(config-router)# neighbor 10.40.0.2 ttl-security hops 1
PEER-B(config-router)# neighbor 10.40.0.1 ttl-security hops 1</pre>
<pre class="out">PEER-A# show ip bgp neighbors 10.40.0.2 | include TTL
<span class="hl">Minimum incoming TTL 254, Outgoing TTL 255</span></pre>
<p>Configure it on <b>both</b> sides. If only PEER-A enables it, PEER-B still sends eBGP packets with TTL 1, PEER-A drops them, and the session dies. <code>ttl-security</code> and <code>ebgp-multihop</code> cannot be used together on one neighbor; for loopback peering two hops apart, use <code>ttl-security hops 2</code>.</p>

<h3>3. maximum-prefix</h3>
<p>A peer that suddenly sends your full routing table by mistake (a route leak) can exhaust memory or divert traffic. <code>neighbor 10.40.0.2 maximum-prefix 10</code> tears the session down when more than 10 prefixes arrive, and keeps it down in state <b>Idle (PfxCt)</b> until you run <code>clear ip bgp 10.40.0.2</code>. Options: a warning threshold percentage (default 75), <code>restart N</code> to retry automatically after N minutes, or <code>warning-only</code> to log without dropping. The lab requires a hard limit, so no <code>warning-only</code>.</p>
<pre class="out">PEER-A# show ip bgp neighbors 10.40.0.2 | include prefixes|Threshold
<span class="hl">  Maximum prefixes allowed 10</span>
  Threshold for warning message 75%
PEER-A# show ip bgp summary | include 10.40.0.2
10.40.0.2       4        65402      14      12        6    0    0 00:02:41        4</pre>
<p>If PEER-B later leaks, you would see <code>%BGP-3-MAXPFXEXCEED: Number of prefixes received from 10.40.0.2 (afi 0): 11 exceeds limit 10</code> followed by the session going down.</p>

<h3>4. Timers (and a preview of BFD)</h3>
<p>Lab task 4 sets <code>neighbor 10.40.0.2 timers 10 30</code> on PEER-A and resets the session with <code>clear ip bgp 10.40.0.2</code>. After the reset both peers use hold time 30 (chapter 5). For sub-second failure detection, BGP can register with <b>BFD</b> (<code>neighbor X fall-over bfd</code>), which the PBR, VRF-lite and BFD module covers.</p>

<h3>5. Bogon and sanity filtering</h3>
<p>On Internet-facing sessions, filter what you accept and what you send. Inbound, reject <b>bogons</b> (addresses that should never appear on the public Internet), your own prefixes, and anything longer than /24:</p>
<pre class="code">ip prefix-list BOGONS seq 5 deny 0.0.0.0/8 le 32
ip prefix-list BOGONS seq 10 deny 10.0.0.0/8 le 32
ip prefix-list BOGONS seq 15 deny 100.64.0.0/10 le 32
ip prefix-list BOGONS seq 20 deny 127.0.0.0/8 le 32
ip prefix-list BOGONS seq 25 deny 169.254.0.0/16 le 32
ip prefix-list BOGONS seq 30 deny 172.16.0.0/12 le 32
ip prefix-list BOGONS seq 35 deny 192.168.0.0/16 le 32
ip prefix-list BOGONS seq 40 deny 224.0.0.0/3 le 32
ip prefix-list BOGONS seq 45 deny 0.0.0.0/0 ge 25
ip prefix-list BOGONS seq 50 permit 0.0.0.0/0 le 24
router bgp 65401
 neighbor 10.40.0.2 prefix-list BOGONS in</pre>
<p>The real list also includes the documentation ranges (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24) and a few others. Our labs use those ranges on purpose, so the lab routers do not apply a bogon filter. Outbound, advertise only your own prefixes (for example <code>ip as-path access-list 1 permit ^$</code> as a filter-list, chapter 7) so you never become transit between two providers.</p>

<div class="eg"><p><b>Worked example: GTSM maths.</b> hops 1: accept TTL 254 or 255. hops 2: accept 253 or more. A spoofed packet from 5 routers away started at 255 at best and arrives at 250, below every threshold. Now the failure case: PEER-B without GTSM sends TTL 1; it arrives at PEER-A with TTL 1, which is less than 254, so it is dropped.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Rolling an MD5 key on one side and closing the change as successful because the session stayed up for a few minutes. Enabling GTSM on one side only. Using <code>warning-only</code> when the requirement says the session must go down. Forgetting that a PfxCt session never comes back by itself unless <code>restart</code> is configured.</p></div>

<div class="exam"><p><b>Exam traps.</b> "No MD5 digest" means the <i>peer</i> has no key; "Invalid MD5 digest" means different keys. ttl-security hops N accepts TTL 255 - N or more. ttl-security and ebgp-multihop are mutually exclusive. Idle (PfxCt) needs a manual clear.</p></div>

<div class="scn"><h4>SEC-114: the key roll that broke the peering</h4><p>An engineer began the SEC-114 work by rolling the MD5 key on PEER-B to last year's value from an old template, while PEER-A had the new agreed key. The session stayed up for a few minutes, then dropped at the hold-timer expiry. Both routers logged <code>Invalid MD5 digest</code>. The fix was the agreed key on PEER-B, then GTSM on both ends, a hard maximum-prefix of 10 on PEER-A (PEER-B sends 4 today), timers 10/30 and a documented <code>show ip bgp neighbors</code> output.</p><p><b>Lesson:</b> read the exact BADAUTH wording; it tells you which side to fix.</p></div>

<div class="iv"><p class="q">"How would you secure an eBGP session with a customer or partner?"</p><p>List layers: MD5 (or TCP-AO) authentication; GTSM with ttl-security hops 1 for directly connected peers; inbound prefix-lists that accept only the customer's registered prefixes, plus bogon and length filters; maximum-prefix to catch leaks; outbound filters so you only send what was agreed; infrastructure ACLs or CoPP protecting TCP 179. Mention verification commands and that GTSM must be on both ends.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MD5: same key on both sides; the BADAUTH wording tells you which side is wrong.</li>
<li>GTSM: send TTL 255, accept 255 - hops or more; enable it on both ends; not with ebgp-multihop.</li>
<li>maximum-prefix drops the session to Idle (PfxCt) until <code>clear ip bgp</code> (or restart).</li>
<li>Filter bogons, own prefixes and too-specific routes inbound; send only your own prefixes outbound.</li>
<li>New timers need a session reset; BFD gives faster detection.</li>
</ul></div>
`,hi:`
<p>Bank vault ki kai independent defences hoti hain: ek guard jo check karta hai ki aap lobby se andar aaye, darwaze par password, ek insaan kitna cash nikaal sakta hai uski limit, aur reject karne ke liye nakli noton ki list. BGP session ko bhi yahi layers chahiye, kyunki ek kharab session company ko black-hole kar sakta hai ya hazaaron routes leak kar sakta hai. Hardening lab mein aap PEER-A (AS 65401, 10.40.0.1) aur PEER-B (AS 65402, 10.40.0.2) ki peering par audit finding <b>SEC-114</b> par kaam karte ho.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="BGP session protection ki layers">
<rect x="20" y="20" width="600" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="13">GTSM: sirf TTL 254 ya zyada ke saath aaye packets BGP tak pahunchte hain</text>
<rect x="50" y="64" width="540" height="36" rx="8" fill="#bae6fd"/><text x="320" y="87" text-anchor="middle" class="svg-ink" font-size="13">MD5 (TCP option): har segment mein sahi digest hona chahiye</text>
<rect x="80" y="108" width="480" height="36" rx="8" fill="#ddd6fe"/><text x="320" y="131" text-anchor="middle" class="svg-ink" font-size="13">Prefix filters: bogons nahi, apne prefixes nahi, /24 se lamba kuch nahi</text>
<rect x="110" y="152" width="420" height="36" rx="8" fill="#fde68a"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">maximum-prefix: peer leak kare to session girta hai</text>
<text x="320" y="212" text-anchor="middle" class="svg-muted" font-size="12">Independent layers: ek galti se sab kuch nahi khulta</text>
</svg><p class="cap">Ek BGP session ke liye defence in depth, transport se andar ki taraf.</p></div>

<h3>1. MD5 authentication (aur atka hua session)</h3>
<p><code>neighbor X password KEY</code> session ke har segment mein TCP MD5 signature option jodta hai, jo segment aur shared key par calculate hota hai. Sahi digest ke bina spoofed RST ya data segment BGP tak pahunchne se pehle hi TCP drop kar deta hai. Dono sides ko <b>same key</b> use karni hogi. Logs aapko exactly batate hain ki problem kya hai:</p>
<pre class="out">PEER-A#
<span class="hl">%TCP-6-BADAUTH: Invalid MD5 digest from 10.40.0.2(179) to 10.40.0.1(23512) tableid - 0</span>
PEER-B#
%TCP-6-BADAUTH: Invalid MD5 digest from 10.40.0.1(23777) to 10.40.0.2(179) tableid - 0</pre>
<table class="cmp"><tr><th>Log message</th><th>Matlab</th></tr>
<tr><td>Invalid MD5 digest</td><td>Dono sides par key hai, par keys alag hain</td></tr>
<tr><td>No MD5 digest from X</td><td>Is router par key hai, peer X koi nahi bhejta</td></tr>
<tr><td>Koi log nahi, session Active rehta hai</td><td>Is router par key nahi; peer ko dekho, woh "No MD5 digest" log karta hai</td></tr>
</table>
<p>Lab mein keys sirf ek side roll hui: PEER-A par <code>Nk$Peer#2026</code> hai, PEER-B par abhi bhi <code>Nk$Peer#2025</code>. Agreed key PEER-A wali hai, isliye fix PEER-B par jaata hai:</p>
<pre class="code"><span class="c">! PEER-B (lab task 1)</span>
router bgp 65402
 neighbor 10.40.0.1 password Nk$Peer#2026</pre>
<p>Established session par key badalne se woh turant nahi girta. Segments validation fail karna shuru karte hain, keepalives kho jaate hain, aur hold timer expire hone par ya agle reset par session gir jaata hai. Key changes dono sides par ek hi window mein plan karo. Naye IOS XE releases TCP-AO bhi support karte hain, jo rollover ke saath key chains deta hai, par ENARSI blueprint MD5 test karta hai.</p>

<h3>2. GTSM: TTL security</h3>
<p><b>Generalized TTL Security Mechanism</b> ek simple fact use karta hai: packet ka TTL har router par ghatta hai, aur koi use dobara badha nahi sakta. <code>neighbor X ttl-security hops 1</code> ke saath router BGP packets TTL 255 ke saath bhejta hai aur sirf woh packets accept karta hai jo kam se kam 255 - 1 = <b>254</b> TTL ke saath pahunchein. Teen hop door attacker zyada se zyada TTL 255 bhej sakta hai, jo 252 ya kam par pahunchta hai, isliye packet hardware mein ya input path mein jaldi drop ho jaata hai, CPU par load daalne se pehle.</p>
<pre class="code"><span class="c">! Dono routers (lab task 2)</span>
PEER-A(config-router)# neighbor 10.40.0.2 ttl-security hops 1
PEER-B(config-router)# neighbor 10.40.0.1 ttl-security hops 1</pre>
<pre class="out">PEER-A# show ip bgp neighbors 10.40.0.2 | include TTL
<span class="hl">Minimum incoming TTL 254, Outgoing TTL 255</span></pre>
<p>Ise <b>dono</b> sides par configure karo. Agar sirf PEER-A enable kare, to PEER-B abhi bhi eBGP packets TTL 1 ke saath bhejta hai, PEER-A unhe drop karta hai, aur session mar jaata hai. <code>ttl-security</code> aur <code>ebgp-multihop</code> ek neighbor par saath use nahi ho sakte; do hop door loopback peering ke liye <code>ttl-security hops 2</code> use karo.</p>

<h3>3. maximum-prefix</h3>
<p>Jo peer galti se achanak apni poori routing table bhej de (route leak), woh memory khatam kar sakta hai ya traffic mod sakta hai. <code>neighbor 10.40.0.2 maximum-prefix 10</code> 10 se zyada prefixes aane par session gira deta hai, aur use state <b>Idle (PfxCt)</b> mein tab tak down rakhta hai jab tak aap <code>clear ip bgp 10.40.0.2</code> na chalao. Options: warning threshold percentage (default 75), N minute baad automatic retry ke liye <code>restart N</code>, ya bina giraye sirf log ke liye <code>warning-only</code>. Lab ko hard limit chahiye, isliye <code>warning-only</code> nahi.</p>
<pre class="out">PEER-A# show ip bgp neighbors 10.40.0.2 | include prefixes|Threshold
<span class="hl">  Maximum prefixes allowed 10</span>
  Threshold for warning message 75%
PEER-A# show ip bgp summary | include 10.40.0.2
10.40.0.2       4        65402      14      12        6    0    0 00:02:41        4</pre>
<p>Agar PEER-B baad mein leak kare, to aapko <code>%BGP-3-MAXPFXEXCEED: Number of prefixes received from 10.40.0.2 (afi 0): 11 exceeds limit 10</code> dikhega aur uske baad session down hoga.</p>

<h3>4. Timers (aur BFD ka preview)</h3>
<p>Lab task 4 PEER-A par <code>neighbor 10.40.0.2 timers 10 30</code> set karta hai aur <code>clear ip bgp 10.40.0.2</code> se session reset karta hai. Reset ke baad dono peers hold time 30 use karte hain (chapter 5). Sub-second failure detection ke liye BGP <b>BFD</b> ke saath register ho sakta hai (<code>neighbor X fall-over bfd</code>), jo PBR, VRF-lite aur BFD module cover karta hai.</p>

<h3>5. Bogon aur sanity filtering</h3>
<p>Internet-facing sessions par, jo accept karte ho aur jo bhejte ho dono filter karo. Inbound mein <b>bogons</b> (aise addresses jo public Internet par kabhi nahi dikhne chahiye), apne prefixes, aur /24 se lambi har cheez reject karo:</p>
<pre class="code">ip prefix-list BOGONS seq 5 deny 0.0.0.0/8 le 32
ip prefix-list BOGONS seq 10 deny 10.0.0.0/8 le 32
ip prefix-list BOGONS seq 15 deny 100.64.0.0/10 le 32
ip prefix-list BOGONS seq 20 deny 127.0.0.0/8 le 32
ip prefix-list BOGONS seq 25 deny 169.254.0.0/16 le 32
ip prefix-list BOGONS seq 30 deny 172.16.0.0/12 le 32
ip prefix-list BOGONS seq 35 deny 192.168.0.0/16 le 32
ip prefix-list BOGONS seq 40 deny 224.0.0.0/3 le 32
ip prefix-list BOGONS seq 45 deny 0.0.0.0/0 ge 25
ip prefix-list BOGONS seq 50 permit 0.0.0.0/0 le 24
router bgp 65401
 neighbor 10.40.0.2 prefix-list BOGONS in</pre>
<p>Asli list mein documentation ranges (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24) aur kuch aur bhi hote hain. Hamare labs jaan boojh kar yahi ranges use karte hain, isliye lab routers par bogon filter nahi lagta. Outbound mein sirf apne prefixes advertise karo (jaise filter-list ke roop mein <code>ip as-path access-list 1 permit ^$</code>, chapter 7) taaki aap kabhi do providers ke beech transit na bano.</p>

<div class="eg"><p><b>Worked example: GTSM ka hisaab.</b> hops 1: TTL 254 ya 255 accept. hops 2: 253 ya zyada accept. 5 routers door se spoofed packet best case mein 255 se shuru hua aur 250 par pahunchta hai, har threshold se neeche. Ab failure case: bina GTSM wala PEER-B TTL 1 bhejta hai; woh PEER-A par TTL 1 ke saath pahunchta hai, jo 254 se kam hai, isliye drop hota hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Ek side par MD5 key roll karke change ko successful close kar dena kyunki session kuch minute up raha. GTSM sirf ek side enable karna. Jab requirement kehti hai session girna chahiye tab <code>warning-only</code> use karna. Yeh bhoolna ki PfxCt session <code>restart</code> configure kiye bina khud wapas nahi aata.</p></div>

<div class="exam"><p><b>Exam traps.</b> "No MD5 digest" matlab <i>peer</i> ke paas key nahi; "Invalid MD5 digest" matlab alag keys. ttl-security hops N TTL 255 - N ya zyada accept karta hai. ttl-security aur ebgp-multihop mutually exclusive hain. Idle (PfxCt) ko manual clear chahiye.</p></div>

<div class="scn"><h4>SEC-114: key roll jisne peering tod di</h4><p>Ek engineer ne SEC-114 ka kaam PEER-B par MD5 key ko purane template se pichhle saal ki value par roll karke shuru kiya, jabki PEER-A par nayi agreed key thi. Session kuch minute up raha, phir hold-timer expiry par gir gaya. Dono routers ne <code>Invalid MD5 digest</code> log kiya. Fix tha PEER-B par agreed key, phir dono ends par GTSM, PEER-A par 10 ka hard maximum-prefix (PEER-B aaj 4 bhejta hai), timers 10/30 aur documented <code>show ip bgp neighbors</code> output.</p><p><b>Seekh:</b> BADAUTH ki exact wording padho; woh batati hai kaunsi side fix karni hai.</p></div>

<div class="iv"><p class="q">"Customer ya partner ke saath eBGP session ko aap kaise secure karoge?"</p><p>Layers list karo: MD5 (ya TCP-AO) authentication; directly connected peers ke liye ttl-security hops 1 ke saath GTSM; inbound prefix-lists jo sirf customer ke registered prefixes accept karein, plus bogon aur length filters; leaks pakadne ke liye maximum-prefix; outbound filters taaki aap sirf agreed cheez bhejo; TCP 179 ko protect karne wale infrastructure ACLs ya CoPP. Verification commands batao aur yeh ki GTSM dono ends par hona chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MD5: dono sides same key; BADAUTH ki wording batati hai kaunsi side galat hai.</li>
<li>GTSM: TTL 255 bhejo, 255 - hops ya zyada accept karo; dono ends par enable karo; ebgp-multihop ke saath nahi.</li>
<li>maximum-prefix session ko <code>clear ip bgp</code> (ya restart) tak Idle (PfxCt) mein gira deta hai.</li>
<li>Inbound mein bogons, apne prefixes aur bahut specific routes filter karo; outbound mein sirf apne prefixes bhejo.</li>
<li>Naye timers ko session reset chahiye; BFD faster detection deta hai.</li>
</ul></div>
`}};export{e as default};