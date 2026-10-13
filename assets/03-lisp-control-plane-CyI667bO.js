var e={id:`lisp-control-plane`,h:{en:`LISP control plane: packet walks for register, request and reply`,hi:`LISP control plane: register, request aur reply ke packet walks`},body:{en:`
<p>LISP works like a phone directory service. First, every business <b>lists</b> itself in the directory (register). When you want to call a business you have never called, you <b>ask</b> the directory (request), and you get the number back (reply). You write it in your personal notebook (map-cache) so you do not ask again for a while. If the business is not listed, the directory tells you so (negative reply). Keep that picture and the four messages will feel obvious.</p>

<h3>The control messages</h3>
<table class="cmp"><tr><th>Message</th><th>From → To</th><th>Purpose</th></tr>
<tr><td><b>Map-Register</b></td><td>ETR → MS</td><td>"I serve EID prefix 10.2.2.0/24 at RLOC 100.64.2.2." Signed with the site key, repeated every 60 seconds.</td></tr>
<tr><td><b>Map-Notify</b></td><td>MS → ETR</td><td>Acknowledges a registration when the ETR asks for it, and signals mobility changes.</td></tr>
<tr><td><b>Map-Request</b></td><td>ITR → MR (→ MS → ETR)</td><td>"Where is 10.2.2.10?" Sent on a map-cache miss.</td></tr>
<tr><td><b>Map-Reply</b></td><td>ETR (or MS as proxy) → ITR</td><td>"10.2.2.0/24 is at RLOC 100.64.2.2, priority 1, weight 100, TTL 24 hours."</td></tr>
<tr><td><b>Negative Map-Reply</b></td><td>MR → ITR</td><td>"No LISP site owns that address"; the ITR forwards natively or to a PETR.</td></tr>
</table>
<p>All LISP control messages use <b>UDP port 4342</b>. Data uses 4341 (next chapter).</p>

<h3>Packet walk 1: registration</h3>
<ol>
<li>XTR2 has <code>database-mapping 10.2.2.0/24 100.64.2.2 priority 1 weight 100</code> and <code>etr map-server 100.64.3.2 key NK-LISP</code>.</li>
<li>XTR2 sends a Map-Register from its RLOC to 100.64.3.2, UDP 4342. The message carries the EID prefix, the locator set and an HMAC authentication field computed with the key.</li>
<li>MSMR looks for a configured <code>site</code> that lists an <code>eid-prefix</code> covering 10.2.2.0/24. It finds SITE-B, recomputes the HMAC with SITE-B's <code>authentication-key</code>, and they match.</li>
<li>The registration is stored. <code>show lisp site</code> now shows SITE-B "Up: yes" with "Who Last Registered" = XTR2's RLOC.</li>
<li>XTR2 re-registers every 60 seconds. If the MS hears nothing for about 3 minutes, the registration expires.</li>
</ol>
<p>Two things make the MS silently reject a Map-Register: the EID prefix is not listed in any site, or the key does not match. The second one produces an authentication-failure log on the MS; you will fix exactly that in the troubleshooting lab.</p>

<div class="dia"><svg viewBox="0 0 640 310" role="img" aria-label="LISP resolution ladder">
<text x="80" y="22" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="210" y="22" text-anchor="middle" class="svg-ink" font-size="13">XTR1 (ITR)</text><text x="370" y="22" text-anchor="middle" class="svg-ink" font-size="13">MSMR</text><text x="540" y="22" text-anchor="middle" class="svg-ink" font-size="13">XTR2 (ETR)</text>
<line x1="80" y1="30" x2="80" y2="300" stroke="#64748b" stroke-dasharray="3 3"/><line x1="210" y1="30" x2="210" y2="300" stroke="#64748b" stroke-dasharray="3 3"/><line x1="370" y1="30" x2="370" y2="300" stroke="#64748b" stroke-dasharray="3 3"/><line x1="540" y1="30" x2="540" y2="300" stroke="#64748b" stroke-dasharray="3 3"/>
<line x1="540" y1="50" x2="370" y2="50" stroke="#64748b" stroke-width="2"/><text x="455" y="44" text-anchor="middle" class="svg-muted" font-size="12">0. Map-Register (4342)</text>
<line x1="80" y1="90" x2="210" y2="90" stroke="#64748b" stroke-width="2"/><text x="145" y="84" text-anchor="middle" class="svg-muted" font-size="12">1. ping 10.2.2.10</text>
<text x="210" y="112" text-anchor="middle" class="svg-accent" font-size="12">miss: drop packet</text>
<line x1="210" y1="140" x2="370" y2="140" stroke="#64748b" stroke-width="2"/><text x="290" y="134" text-anchor="middle" class="svg-muted" font-size="12">2. Map-Request</text>
<line x1="370" y1="180" x2="540" y2="180" stroke="#64748b" stroke-width="2"/><text x="455" y="174" text-anchor="middle" class="svg-muted" font-size="12">3. forwarded to ETR</text>
<line x1="540" y1="225" x2="210" y2="225" stroke="#64748b" stroke-width="2"/><text x="375" y="219" text-anchor="middle" class="svg-muted" font-size="12">4. Map-Reply direct to ITR</text>
<text x="210" y="250" text-anchor="middle" class="svg-accent" font-size="12">map-cache 10.2.2.0/24</text>
<line x1="210" y1="285" x2="540" y2="285" stroke="#64748b" stroke-width="3"/><text x="375" y="279" text-anchor="middle" class="svg-muted" font-size="12">5. data in LISP (4341)</text>
</svg><p class="cap">Resolution in the lab: the MS relays the request, the ETR replies straight to the ITR.</p></div>

<h3>Packet walk 2: the first ping from PC1 to PC2</h3>
<ol>
<li>PC1 sends ICMP to 10.2.2.10 via its gateway XTR1 (10.1.1.1).</li>
<li>XTR1 has no route to 10.2.2.0/24 in its RIB and no map-cache entry. Its default map-cache entry 0.0.0.0/0 says <code>send-map-request</code>. XTR1 <b>drops that packet</b> and sends a Map-Request for 10.2.2.10 to its map-resolver 100.64.3.2. The request travels inside an Encapsulated Control Message so the MR can see the original EID.</li>
<li>MSMR (as MR) finds that 10.2.2.0/24 is registered by SITE-B. As MS it forwards the Map-Request to the registering ETR, XTR2.</li>
<li>XTR2 answers <b>directly to XTR1</b> with a Map-Reply: EID prefix 10.2.2.0/24, locator 100.64.2.2, priority 1, weight 100, TTL 1440 minutes.</li>
<li>XTR1 installs 10.2.2.0/24 in its map-cache. The next packet is encapsulated to 100.64.2.2.</li>
<li>The echo reply from PC2 hits XTR2, which does the same lookup for 10.1.1.0/24. So both directions resolve, and the first one or two pings in the lab time out.</li>
</ol>

<h3>Variations the exam likes</h3>
<ul>
<li><b>Proxy Map-Reply</b>: if the ETR registers with the proxy-reply flag, the MS answers the ITR itself instead of forwarding. SD-Access control-plane nodes answer this way.</li>
<li><b>Negative Map-Reply</b>: if the requested address is in no registered or configured EID prefix, the MR returns a negative reply for the largest covering "hole", with a short TTL (typically 15 minutes). The ITR caches it and forwards natively, or to a PETR if <code>use-petr</code> is configured.</li>
<li><b>SMR (Solicit-Map-Request)</b>: an ETR tells a remote ITR "your cache for my EID is stale, ask again". Used after mobility events.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> PC1 pings 203.0.113.50, a public server. XTR1 misses, sends a Map-Request. MSMR finds no site covering 203.0.113.50 and returns a Negative Map-Reply for, say, 128.0.0.0/2 minus the registered EIDs, with action "forward-native". XTR1 caches that negative entry and routes the packet natively, which will fail in the lab because CORE has no default route. In a real design the xTR would use a PETR.</p></div>

<pre class="out">XTR1# show ip lisp map-cache
LISP IPv4 Mapping Cache for EID-table default (IID 0), 2 entries

0.0.0.0/0, uptime: 00:12:04, expires: never, via static-send-map-request
  Negative cache entry, action: send-map-request
<span class="hl">10.2.2.0/24, uptime: 00:00:09, expires: 23:59:50, via map-reply, complete</span>
  Locator     Uptime    State      Pri/Wgt     Encap-IID
  100.64.2.2  00:00:09  up           1/100       -</pre>

<div class="warn"><p><b>Common mistake.</b> Expecting the map-resolver to send the Map-Reply. In classic LISP it only relays; the reply comes from the ETR's RLOC. If the ETR cannot reach the ITR's RLOC in the underlay, resolution fails even though the MS looks perfect.</p></div>

<div class="exam"><p><b>Exam trap.</b> The ITR sends Map-Requests to the <b>map-resolver</b>, never to the map-server. The ETR sends Map-Registers to the <b>map-server</b>. And LISP is <b>pull-based</b>: nothing is pushed to ITRs in advance, which is why the first packet is dropped.</p></div>

<div class="scn"><h4>Every first call fails</h4><p>A contact-centre team complained that the first VoIP call of the morning to each branch always failed, while redials worked. Branch routers were LISP xTRs. Overnight, idle map-cache entries had not expired (24 hours), but a firmware change had reset the caches at 2 a.m. The first SIP INVITE to each branch triggered a Map-Request and was dropped. The fix was a pre-warm: a scheduled IP SLA probe from each hub xTR to each branch EID at 6 a.m.</p><p><b>Lesson:</b> LISP is on-demand. Anything that clears caches makes the next first packet pay the resolution cost.</p></div>

<div class="iv"><p class="q">"Walk me through what happens when an ITR receives a packet for an unknown EID."</p><p>Strong answer: the ITR misses in its map-cache, drops or buffers the packet, sends an encapsulated Map-Request to the map-resolver on UDP 4342. The MR finds the registration and the MS forwards the request to the ETR that registered the prefix; the ETR sends a Map-Reply straight to the ITR with RLOCs, priority, weight and TTL. The ITR caches it and encapsulates subsequent packets on UDP 4341. Mention proxy-reply and negative map-reply as variations.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Control messages use UDP 4342: Map-Register, Map-Notify, Map-Request, Map-Reply.</li>
<li>ETRs register every 60 seconds with a key; the MS checks site EID prefix and key.</li>
<li>ITR miss → Map-Request to MR → MS forwards to ETR → ETR replies directly to ITR.</li>
<li>Negative Map-Reply = no LISP site owns the address; forward natively or to PETR.</li>
<li>LISP is pull-based, so the first packet to a new destination is lost.</li>
</ul></div>
`,hi:`
<p>LISP ek phone directory service ki tarah kaam karta hai. Pehle har business directory mein apna naam <b>list</b> karta hai (register). Jab aapko kisi aise business ko call karna ho jise pehle kabhi nahi kiya, aap directory se <b>poochte</b> ho (request), aur number wapas milta hai (reply). Aap use apni personal notebook (map-cache) mein likh lete ho taaki kuch der dobara na poochna pade. Agar business list nahi hai, directory yahi bata deti hai (negative reply). Yeh picture yaad rakho aur chaaron messages aasaan lagenge.</p>

<h3>Control messages</h3>
<table class="cmp"><tr><th>Message</th><th>Kahan se → Kahan</th><th>Maqsad</th></tr>
<tr><td><b>Map-Register</b></td><td>ETR → MS</td><td>"Main EID prefix 10.2.2.0/24 ko RLOC 100.64.2.2 par serve karta hoon." Site key se sign, har 60 second repeat.</td></tr>
<tr><td><b>Map-Notify</b></td><td>MS → ETR</td><td>ETR maange to registration ka acknowledgement deta hai, aur mobility changes signal karta hai.</td></tr>
<tr><td><b>Map-Request</b></td><td>ITR → MR (→ MS → ETR)</td><td>"10.2.2.10 kahan hai?" Map-cache miss par bheja jaata hai.</td></tr>
<tr><td><b>Map-Reply</b></td><td>ETR (ya proxy ki tarah MS) → ITR</td><td>"10.2.2.0/24 RLOC 100.64.2.2 par hai, priority 1, weight 100, TTL 24 ghante."</td></tr>
<tr><td><b>Negative Map-Reply</b></td><td>MR → ITR</td><td>"Yeh address kisi LISP site ka nahi hai"; ITR natively ya PETR ko forward karta hai.</td></tr>
</table>
<p>Saare LISP control messages <b>UDP port 4342</b> use karte hain. Data 4341 use karta hai (agla chapter).</p>

<h3>Packet walk 1: registration</h3>
<ol>
<li>XTR2 par <code>database-mapping 10.2.2.0/24 100.64.2.2 priority 1 weight 100</code> aur <code>etr map-server 100.64.3.2 key NK-LISP</code> hai.</li>
<li>XTR2 apne RLOC se 100.64.3.2 ko UDP 4342 par Map-Register bhejta hai. Message mein EID prefix, locator set aur key se bana HMAC authentication field hota hai.</li>
<li>MSMR ek configured <code>site</code> dhoondta hai jiska <code>eid-prefix</code> 10.2.2.0/24 ko cover kare. Use SITE-B milta hai, woh SITE-B ke <code>authentication-key</code> se HMAC dobara nikaalta hai, aur dono match karte hain.</li>
<li>Registration store ho jaata hai. Ab <code>show lisp site</code> SITE-B ko "Up: yes" dikhata hai aur "Who Last Registered" = XTR2 ka RLOC.</li>
<li>XTR2 har 60 second re-register karta hai. Agar MS ko lagbhag 3 minute tak kuch nahi milta, registration expire ho jaata hai.</li>
</ol>
<p>Do cheezein MS se Map-Register ko chupchaap reject karwati hain: EID prefix kisi site mein list nahi hai, ya key match nahi karti. Doosri wali MS par authentication-failure log banati hai; troubleshooting lab mein aap bilkul yahi theek karoge.</p>

<div class="dia"><svg viewBox="0 0 640 310" role="img" aria-label="LISP resolution ladder">
<text x="80" y="22" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="210" y="22" text-anchor="middle" class="svg-ink" font-size="13">XTR1 (ITR)</text><text x="370" y="22" text-anchor="middle" class="svg-ink" font-size="13">MSMR</text><text x="540" y="22" text-anchor="middle" class="svg-ink" font-size="13">XTR2 (ETR)</text>
<line x1="80" y1="30" x2="80" y2="300" stroke="#64748b" stroke-dasharray="3 3"/><line x1="210" y1="30" x2="210" y2="300" stroke="#64748b" stroke-dasharray="3 3"/><line x1="370" y1="30" x2="370" y2="300" stroke="#64748b" stroke-dasharray="3 3"/><line x1="540" y1="30" x2="540" y2="300" stroke="#64748b" stroke-dasharray="3 3"/>
<line x1="540" y1="50" x2="370" y2="50" stroke="#64748b" stroke-width="2"/><text x="455" y="44" text-anchor="middle" class="svg-muted" font-size="12">0. Map-Register (4342)</text>
<line x1="80" y1="90" x2="210" y2="90" stroke="#64748b" stroke-width="2"/><text x="145" y="84" text-anchor="middle" class="svg-muted" font-size="12">1. ping 10.2.2.10</text>
<text x="210" y="112" text-anchor="middle" class="svg-accent" font-size="12">miss: packet drop</text>
<line x1="210" y1="140" x2="370" y2="140" stroke="#64748b" stroke-width="2"/><text x="290" y="134" text-anchor="middle" class="svg-muted" font-size="12">2. Map-Request</text>
<line x1="370" y1="180" x2="540" y2="180" stroke="#64748b" stroke-width="2"/><text x="455" y="174" text-anchor="middle" class="svg-muted" font-size="12">3. ETR ko forward</text>
<line x1="540" y1="225" x2="210" y2="225" stroke="#64748b" stroke-width="2"/><text x="375" y="219" text-anchor="middle" class="svg-muted" font-size="12">4. Map-Reply seedhe ITR ko</text>
<text x="210" y="250" text-anchor="middle" class="svg-accent" font-size="12">map-cache 10.2.2.0/24</text>
<line x1="210" y1="285" x2="540" y2="285" stroke="#64748b" stroke-width="3"/><text x="375" y="279" text-anchor="middle" class="svg-muted" font-size="12">5. data LISP mein (4341)</text>
</svg><p class="cap">Lab mein resolution: MS request aage badhata hai, ETR seedhe ITR ko reply karta hai.</p></div>

<h3>Packet walk 2: PC1 se PC2 ka pehla ping</h3>
<ol>
<li>PC1 apne gateway XTR1 (10.1.1.1) ke through 10.2.2.10 ko ICMP bhejta hai.</li>
<li>XTR1 ke RIB mein 10.2.2.0/24 ka route nahi hai aur map-cache entry bhi nahi. Uski default map-cache entry 0.0.0.0/0 kehti hai <code>send-map-request</code>. XTR1 <b>woh packet drop karta hai</b> aur apne map-resolver 100.64.3.2 ko 10.2.2.10 ke liye Map-Request bhejta hai. Request ek Encapsulated Control Message ke andar jaati hai taaki MR original EID dekh sake.</li>
<li>MSMR (MR ki tarah) dekhta hai ki 10.2.2.0/24 SITE-B ne register kiya hai. MS ki tarah woh Map-Request ko register karne wale ETR, XTR2, ko forward karta hai.</li>
<li>XTR2 <b>seedhe XTR1 ko</b> Map-Reply deta hai: EID prefix 10.2.2.0/24, locator 100.64.2.2, priority 1, weight 100, TTL 1440 minute.</li>
<li>XTR1 10.2.2.0/24 ko map-cache mein daalta hai. Agla packet 100.64.2.2 ki taraf encapsulate hota hai.</li>
<li>PC2 ka echo reply XTR2 par aata hai, jo 10.1.1.0/24 ke liye yahi lookup karta hai. Isliye dono directions resolve hoti hain, aur lab mein pehle ek-do pings time out hote hain.</li>
</ol>

<h3>Variations jo exam ko pasand hain</h3>
<ul>
<li><b>Proxy Map-Reply</b>: agar ETR proxy-reply flag ke saath register kare, to MS forward karne ki jagah khud ITR ko jawab deta hai. SD-Access control-plane nodes aise hi jawab dete hain.</li>
<li><b>Negative Map-Reply</b>: agar poocha gaya address kisi registered ya configured EID prefix mein nahi hai, MR sabse bade covering "hole" ke liye negative reply deta hai, chhote TTL ke saath (aam taur par 15 minute). ITR use cache karta hai aur natively forward karta hai, ya <code>use-petr</code> configured ho to PETR ko.</li>
<li><b>SMR (Solicit-Map-Request)</b>: ETR remote ITR ko batata hai "mere EID ke liye tumhara cache purana hai, dobara poocho". Mobility events ke baad use hota hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> PC1 203.0.113.50 ko ping karta hai, ek public server. XTR1 ko miss hota hai, Map-Request bhejta hai. MSMR ko 203.0.113.50 cover karne wali koi site nahi milti aur woh Negative Map-Reply lautata hai, maan lo 128.0.0.0/2 ke liye (registered EIDs chhod kar), action "forward-native" ke saath. XTR1 woh negative entry cache karta hai aur packet natively route karta hai, jo lab mein fail hoga kyunki CORE ke paas default route nahi hai. Asli design mein xTR PETR use karta.</p></div>

<pre class="out">XTR1# show ip lisp map-cache
LISP IPv4 Mapping Cache for EID-table default (IID 0), 2 entries

0.0.0.0/0, uptime: 00:12:04, expires: never, via static-send-map-request
  Negative cache entry, action: send-map-request
<span class="hl">10.2.2.0/24, uptime: 00:00:09, expires: 23:59:50, via map-reply, complete</span>
  Locator     Uptime    State      Pri/Wgt     Encap-IID
  100.64.2.2  00:00:09  up           1/100       -</pre>

<div class="warn"><p><b>Common galti.</b> Yeh umeed karna ki map-resolver Map-Reply bhejega. Classic LISP mein woh sirf relay karta hai; reply ETR ke RLOC se aata hai. Agar ETR underlay mein ITR ke RLOC tak nahi pahunch sakta, to resolution fail hota hai bhale hi MS bilkul theek dikhe.</p></div>

<div class="exam"><p><b>Exam trap.</b> ITR Map-Requests <b>map-resolver</b> ko bhejta hai, map-server ko kabhi nahi. ETR Map-Registers <b>map-server</b> ko bhejta hai. Aur LISP <b>pull-based</b> hai: ITRs ko pehle se kuch push nahi hota, isiliye pehla packet drop hota hai.</p></div>

<div class="scn"><h4>Har pehli call fail</h4><p>Ek contact-centre team ki shikayat thi ki subah har branch ki pehli VoIP call hamesha fail hoti thi, jabki redial chal jaata tha. Branch routers LISP xTRs the. Raat bhar idle map-cache entries expire nahi hui thi (24 ghante), lekin ek firmware change ne raat 2 baje caches reset kar diye the. Har branch ka pehla SIP INVITE Map-Request trigger karta aur drop ho jaata. Fix tha pre-warm: har hub xTR se har branch EID tak subah 6 baje scheduled IP SLA probe.</p><p><b>Seekh:</b> LISP on-demand hai. Jo bhi cheez caches saaf karti hai, agle pehle packet ko resolution ki keemat chukani padti hai.</p></div>

<div class="iv"><p class="q">"Batao kya hota hai jab ITR ko unknown EID ka packet milta hai."</p><p>Strong answer: ITR ko map-cache mein miss hota hai, packet drop ya buffer karta hai, map-resolver ko UDP 4342 par encapsulated Map-Request bhejta hai. MR registration dhoondta hai aur MS request ko us ETR tak forward karta hai jisne prefix register kiya; ETR seedhe ITR ko RLOCs, priority, weight aur TTL ke saath Map-Reply bhejta hai. ITR use cache karta hai aur aage ke packets UDP 4341 par encapsulate karta hai. Variations ki tarah proxy-reply aur negative map-reply bhi batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Control messages UDP 4342 use karte hain: Map-Register, Map-Notify, Map-Request, Map-Reply.</li>
<li>ETRs har 60 second key ke saath register karte hain; MS site EID prefix aur key check karta hai.</li>
<li>ITR miss → MR ko Map-Request → MS ETR ko forward karta hai → ETR seedhe ITR ko reply karta hai.</li>
<li>Negative Map-Reply = address kisi LISP site ka nahi; natively ya PETR ko forward karo.</li>
<li>LISP pull-based hai, isliye naye destination ka pehla packet kho jaata hai.</li>
</ul></div>
`}};export{e as default};