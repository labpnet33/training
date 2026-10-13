var e={id:`ntp-hierarchy`,h:{en:`NTP in depth: stratum, modes, clock sources and hierarchy design`,hi:`NTP gehraai mein: stratum, modes, clock sources aur hierarchy design`},body:{en:`
<p>Think of how the Indian Standard Time signal reaches you. The atomic clocks at the national lab are the truth. A few official servers copy that truth directly. Your office server copies one of those, your laptop copies the office server. Each copy adds a little error, and each step is one level further from the truth. NTP works exactly like this, and the "level" is called the <b>stratum</b>.</p>

<h3>Stratum, precisely</h3>
<dl class="terms">
<dt>Stratum 0</dt><dd>A reference clock: GPS receiver, atomic clock, radio clock. It is not on the network; it is wired to a server.</dd>
<dt>Stratum 1</dt><dd>A server directly attached to a stratum 0 source.</dd>
<dt>Stratum N</dt><dd>A device synchronised to a stratum N-1 server. It can serve others at stratum N+1. NTPv4 allows up to 15.</dd>
<dt>Stratum 16</dt><dd>Unsynchronised. A router showing stratum 16 is not serving time to anyone.</dd>
</dl>
<p>Stratum is a <b>distance</b>, not a quality score. A stratum 3 server one LAN hop away is often more accurate than a stratum 1 server across a congested internet path, because NTP accuracy is limited by path <b>jitter and asymmetry</b>, not by the stratum number.</p>

<h3>How NTP computes the offset</h3>
<p>The client sends a request stamped T1. The server stamps arrival T2 and departure T3. The client stamps the reply's arrival T4. Round-trip delay = (T4 - T1) - (T3 - T2). Offset = ((T2 - T1) + (T3 - T4)) / 2. The formula assumes the path is symmetric; if the outbound path takes 30 ms and the return 10 ms, the clock will be wrong by 10 ms and NTP cannot detect it. The client polls every 64 to 1024 seconds by default (poll exponent 6 to 10) and uses a clock filter and selection algorithm to throw away outliers ("falsetickers") before it disciplines the local clock.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="NTP hierarchy in the lab">
<rect x="250" y="12" width="140" height="40" rx="8" fill="#fde68a"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">GPS / stratum 1</text>
<rect x="240" y="92" width="160" height="44" rx="8" fill="#bae6fd"/><text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="13">HQ 10.255.0.1</text><text x="320" y="128" text-anchor="middle" class="svg-muted" font-size="12">stratum 3 (ntp master 3)</text>
<rect x="70" y="185" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="150" y="205" text-anchor="middle" class="svg-ink" font-size="13">BR1 10.0.11.2</text><text x="150" y="221" text-anchor="middle" class="svg-muted" font-size="12">stratum 4, client</text>
<rect x="410" y="185" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="490" y="205" text-anchor="middle" class="svg-ink" font-size="13">BR2 10.0.12.2</text><text x="490" y="221" text-anchor="middle" class="svg-muted" font-size="12">stratum 4, client</text>
<line x1="320" y1="52" x2="320" y2="92" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="420" y="76" text-anchor="middle" class="svg-muted" font-size="12">production design</text>
<line x1="280" y1="136" x2="170" y2="185" stroke="#64748b" stroke-width="2"/><line x1="360" y1="136" x2="470" y2="185" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">UDP 123, key 1</text>
</svg><p class="cap">Lab 3: HQ acts as the internal master at stratum 3; each branch lands one level below, at stratum 4.</p></div>

<h3>The NTP modes on IOS XE</h3>
<table class="cmp"><tr><th>Command</th><th>Mode</th><th>Behaviour</th></tr>
<tr><td><code>ntp server 10.255.0.1</code></td><td>Client (mode 3) to server (mode 4)</td><td>The router takes time from the server but never gives time back to it. The usual choice.</td></tr>
<tr><td><code>ntp peer 10.0.0.2</code></td><td>Symmetric active</td><td>Two routers at a similar level back each other up; either can synchronise the other. Used between two HQ core routers.</td></tr>
<tr><td><code>ntp broadcast</code> / <code>ntp broadcast client</code></td><td>Broadcast</td><td>Server floods time on a LAN; clients listen. Cheaper, less accurate and easy to spoof without authentication.</td></tr>
<tr><td><code>ntp master 3</code></td><td>Local reference</td><td>The router trusts its own clock and serves it at stratum 3. Default stratum is 8 if you omit the number.</td></tr></table>
<p>A router with <code>ntp server</code> configured automatically answers client requests from others once it is synchronised; you do not need a separate "server" command. That is how BR1 could serve the switches behind it at stratum 5.</p>

<h3>Clock sources on a Cisco device</h3>
<p>A router has two clocks. The <b>software clock</b> (<code>show clock</code>) is what logs and NTP use. The <b>hardware calendar</b> (<code>show calendar</code>) is a battery-backed chip that survives reloads on platforms that have one. At boot the software clock is set from the calendar. <code>ntp update-calendar</code> writes NTP time back into the calendar periodically, so after a reload the router starts close to correct instead of 1993. A leading asterisk in <code>show clock</code> means the time is not authoritative; a dot means it was authoritative but NTP is not synchronised now.</p>

<h3>Designing the hierarchy</h3>
<pre class="code"><span class="c">! HQ core routers (production): external sources, peer each other</span>
ntp server 192.0.2.123 prefer
ntp server 198.51.100.123
ntp peer 10.255.0.2
ntp source Loopback0
ntp update-calendar
<span class="c">! Lab 3 HQ: no external source reachable, so it becomes the master</span>
ntp master 3
<span class="c">! Branches</span>
ntp server 10.255.0.1
ntp source Loopback0
clock timezone IST 5 30</pre>
<ul>
<li>Use two to four upstream sources. With two sources and a disagreement, NTP cannot tell which one is wrong; with three or more it can vote out a falseticker.</li>
<li><code>ntp source Loopback0</code> makes all NTP packets come from a stable address, so the server's access group and firewall rules need one entry per router, and time survives a single link failure.</li>
<li><code>ntp master</code> should only exist where there is no better source. If a router has both good servers and <code>ntp master</code>, the internal clock (reference 127.127.1.1) becomes a fallback that can wrongly win when upstream is lost.</li>
<li>NTP always runs in UTC; <code>clock timezone</code> only changes how the time is displayed.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> HQ uses <code>ntp master 3</code>. BR1 synchronises to HQ, so BR1 becomes stratum 4. Access switch SW-BR1 points at BR1's loopback and becomes stratum 5. If HQ instead synchronised to an external stratum 2 server, HQ would become stratum 3 anyway, BR1 4 and SW-BR1 5, but the whole company would now follow real UTC rather than HQ's free-running oscillator. BR1's clock started 37 minutes behind; NTP steps a large offset once (it does not slew 37 minutes slowly), then disciplines small drift.</p></div>

<div class="warn"><p><b>Common mistake.</b> Expecting instant synchronisation. After configuring <code>ntp server</code>, IOS needs several poll exchanges before it trusts the source; five minutes or more is normal. Checking <code>show ntp status</code> after ten seconds and "fixing" a working configuration is a classic lab error.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>ntp master</code> without a number means stratum <b>8</b>, and a client of it becomes stratum 9. Also, <code>ntp peer</code> lets <i>both</i> sides synchronise each other; <code>ntp server</code> is one-way. If a question asks which command stops the router from being synchronised by the other side, the answer is server, not peer.</p></div>

<div class="scn"><h4>The router that went back to 1993</h4><p>After a power failure, a branch router in Kochi came up with its clock at 00:02 on 1 March 1993, because the platform had no working calendar and nobody had set one. Its WAN link was up, but the SSH certificate on the jump host appeared "not yet valid", so admins could not log in, and syslog timestamps were useless. The router did eventually synchronise to HQ, but only after the WAN routing converged. The fix was <code>ntp update-calendar</code> on platforms with a calendar and a second NTP server reachable over the backup path.</p><p><b>Lesson:</b> know which clock the device boots from, and give the hierarchy redundant, reachable sources.</p></div>

<div class="iv"><p class="q">"What is the difference between ntp server, ntp peer and ntp master?"</p><p>Answer in terms of direction. <code>ntp server</code> is client/server: I take time and never give time back to that server. <code>ntp peer</code> is symmetric: two devices can synchronise each other, used between redundant core routers. <code>ntp master</code> makes the router trust its own clock as a reference at the given stratum, default 8, and should only be used when no external source exists. Mention that a synchronised client automatically serves time to others at one stratum lower.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Stratum is distance from the reference clock: 1 is attached to it, 16 means unsynchronised; a client is always one higher than its server.</li>
<li>Offset = ((T2 - T1) + (T3 - T4)) / 2; path asymmetry directly becomes clock error.</li>
<li>server = one-way client, peer = symmetric, master = local clock as reference (default stratum 8).</li>
<li>Use several sources, ntp source Loopback0, and ntp update-calendar in a real design.</li>
<li>Synchronisation takes several poll intervals; do not judge it in the first minute.</li>
</ul></div>
`,hi:`
<p>Socho Indian Standard Time ka signal aap tak kaise pahunchta hai. National lab ki atomic clocks sach hain. Kuch official servers us sach ko seedha copy karte hain. Aapke office ka server unmein se ek ko copy karta hai, aapka laptop office server ko. Har copy thodi galti jodti hai, aur har step sach se ek level door hai. NTP bilkul aise hi kaam karta hai, aur is "level" ko <b>stratum</b> kehte hain.</p>

<h3>Stratum, bilkul sahi</h3>
<dl class="terms">
<dt>Stratum 0</dt><dd>Reference clock: GPS receiver, atomic clock, radio clock. Yeh network par nahi hota; yeh server se wire kiya hota hai.</dd>
<dt>Stratum 1</dt><dd>Server jo seedha stratum 0 source se juda hai.</dd>
<dt>Stratum N</dt><dd>Device jo stratum N-1 server se sync hai. Yeh doosron ko stratum N+1 par serve kar sakta hai. NTPv4 15 tak allow karta hai.</dd>
<dt>Stratum 16</dt><dd>Unsynchronised. Stratum 16 dikhane wala router kisi ko time serve nahi kar raha.</dd>
</dl>
<p>Stratum ek <b>doori</b> hai, quality score nahi. Ek LAN hop door stratum 3 server aksar congested internet path ke paar stratum 1 server se zyada accurate hota hai, kyunki NTP accuracy path ke <b>jitter aur asymmetry</b> se limit hoti hai, stratum number se nahi.</p>

<h3>NTP offset kaise nikaalta hai</h3>
<p>Client request bhejta hai jis par T1 stamp hai. Server arrival T2 aur departure T3 stamp karta hai. Client reply ka arrival T4 stamp karta hai. Round-trip delay = (T4 - T1) - (T3 - T2). Offset = ((T2 - T1) + (T3 - T4)) / 2. Formula maanta hai ki path symmetric hai; agar jaane mein 30 ms lage aur wapas aane mein 10 ms, to clock 10 ms galat hogi aur NTP ise detect nahi kar sakta. Client default mein har 64 se 1024 second mein poll karta hai (poll exponent 6 se 10) aur local clock discipline karne se pehle clock filter aur selection algorithm se outliers ("falsetickers") nikaal deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Lab mein NTP hierarchy">
<rect x="250" y="12" width="140" height="40" rx="8" fill="#fde68a"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">GPS / stratum 1</text>
<rect x="240" y="92" width="160" height="44" rx="8" fill="#bae6fd"/><text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="13">HQ 10.255.0.1</text><text x="320" y="128" text-anchor="middle" class="svg-muted" font-size="12">stratum 3 (ntp master 3)</text>
<rect x="70" y="185" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="150" y="205" text-anchor="middle" class="svg-ink" font-size="13">BR1 10.0.11.2</text><text x="150" y="221" text-anchor="middle" class="svg-muted" font-size="12">stratum 4, client</text>
<rect x="410" y="185" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="490" y="205" text-anchor="middle" class="svg-ink" font-size="13">BR2 10.0.12.2</text><text x="490" y="221" text-anchor="middle" class="svg-muted" font-size="12">stratum 4, client</text>
<line x1="320" y1="52" x2="320" y2="92" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="420" y="76" text-anchor="middle" class="svg-muted" font-size="12">production design</text>
<line x1="280" y1="136" x2="170" y2="185" stroke="#64748b" stroke-width="2"/><line x1="360" y1="136" x2="470" y2="185" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">UDP 123, key 1</text>
</svg><p class="cap">Lab 3: HQ stratum 3 par internal master ka kaam karta hai; har branch ek level neeche, stratum 4 par aati hai.</p></div>

<h3>IOS XE par NTP modes</h3>
<table class="cmp"><tr><th>Command</th><th>Mode</th><th>Behaviour</th></tr>
<tr><td><code>ntp server 10.255.0.1</code></td><td>Client (mode 3) se server (mode 4)</td><td>Router server se time leta hai lekin use kabhi time wapas nahi deta. Aam choice.</td></tr>
<tr><td><code>ntp peer 10.0.0.2</code></td><td>Symmetric active</td><td>Milte-julte level ke do routers ek doosre ka backup hain; koi bhi doosre ko sync kar sakta hai. Do HQ core routers ke beech use hota hai.</td></tr>
<tr><td><code>ntp broadcast</code> / <code>ntp broadcast client</code></td><td>Broadcast</td><td>Server LAN par time flood karta hai; clients sunte hain. Sasta, kam accurate aur bina authentication ke spoof karna aasaan.</td></tr>
<tr><td><code>ntp master 3</code></td><td>Local reference</td><td>Router apni clock par bharosa karke use stratum 3 par serve karta hai. Number na do to default stratum 8 hai.</td></tr></table>
<p>Jis router par <code>ntp server</code> configure hai, woh sync hone ke baad doosron ki client requests ka jawab apne aap deta hai; alag "server" command ki zaroorat nahi. Isi tarah BR1 apne peeche ke switches ko stratum 5 par serve kar sakta hai.</p>

<h3>Cisco device par clock sources</h3>
<p>Router ke paas do clocks hoti hain. <b>Software clock</b> (<code>show clock</code>) woh hai jo logs aur NTP use karte hain. <b>Hardware calendar</b> (<code>show calendar</code>) battery-backed chip hai jo un platforms par reload ke baad bhi bachi rehti hai jin par yeh hoti hai. Boot par software clock calendar se set hoti hai. <code>ntp update-calendar</code> NTP time ko samay samay par calendar mein wapas likhta hai, taaki reload ke baad router 1993 ki jagah sahi ke kareeb start ho. <code>show clock</code> mein aage asterisk ka matlab hai time authoritative nahi hai; dot ka matlab hai pehle authoritative tha lekin abhi NTP sync nahi hai.</p>

<h3>Hierarchy design karna</h3>
<pre class="code"><span class="c">! HQ core routers (production): external sources, ek doosre ke peer</span>
ntp server 192.0.2.123 prefer
ntp server 198.51.100.123
ntp peer 10.255.0.2
ntp source Loopback0
ntp update-calendar
<span class="c">! Lab 3 HQ: koi external source reachable nahi, isliye yeh master banta hai</span>
ntp master 3
<span class="c">! Branches</span>
ntp server 10.255.0.1
ntp source Loopback0
clock timezone IST 5 30</pre>
<ul>
<li>Do se chaar upstream sources use karo. Do sources mein asehmati ho to NTP nahi bata sakta kaunsa galat hai; teen ya zyada ke saath woh falseticker ko vote karke nikaal sakta hai.</li>
<li><code>ntp source Loopback0</code> saare NTP packets ek stable address se bhejta hai, to server ke access group aur firewall rules mein har router ki ek entry chahiye, aur time single link failure ke baad bhi bacha rehta hai.</li>
<li><code>ntp master</code> sirf wahan hona chahiye jahan isse behtar source na ho. Agar router par achhe servers aur <code>ntp master</code> dono hain, to internal clock (reference 127.127.1.1) fallback ban jaati hai jo upstream khone par galti se jeet sakti hai.</li>
<li>NTP hamesha UTC mein chalta hai; <code>clock timezone</code> sirf time dikhane ka tareeka badalta hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> HQ <code>ntp master 3</code> use karta hai. BR1 HQ se sync hota hai, to BR1 stratum 4 banta hai. Access switch SW-BR1 BR1 ke loopback ko point karta hai aur stratum 5 banta hai. Agar HQ iski jagah external stratum 2 server se sync hota, to bhi HQ stratum 3, BR1 4 aur SW-BR1 5 banta, lekin poori company ab HQ ke free-running oscillator ki jagah asli UTC follow karti. BR1 ki clock 37 minute peeche start hui thi; NTP bade offset ko ek baar step karta hai (37 minute dheere dheere slew nahi karta), phir chhote drift ko discipline karta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Turant sync ki ummeed karna. <code>ntp server</code> configure karne ke baad IOS ko source par bharosa karne se pehle kai poll exchanges chahiye; paanch minute ya zyada normal hai. Das second baad <code>show ntp status</code> check karke chalti hui configuration ko "theek" karna classic lab galti hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Bina number ke <code>ntp master</code> ka matlab stratum <b>8</b> hai, aur uska client stratum 9 banta hai. Aur <code>ntp peer</code> <i>dono</i> sides ko ek doosre ko sync karne deta hai; <code>ntp server</code> one-way hai. Agar sawaal pooche kaunsi command router ko doosri side se sync hone se rokti hai, to jawab server hai, peer nahi.</p></div>

<div class="scn"><h4>Router jo 1993 mein wapas chala gaya</h4><p>Power failure ke baad Kochi ka ek branch router 1 March 1993, 00:02 ki clock ke saath aaya, kyunki platform par koi working calendar nahi tha aur kisi ne set nahi kiya tha. Uska WAN link up tha, lekin jump host par SSH certificate "not yet valid" dikha, to admins login nahi kar paaye, aur syslog timestamps bekaar the. Router aakhirkaar HQ se sync hua, lekin sirf WAN routing converge hone ke baad. Fix tha calendar wale platforms par <code>ntp update-calendar</code> aur backup path par reachable ek doosra NTP server.</p><p><b>Seekh:</b> jaano device kis clock se boot hota hai, aur hierarchy ko redundant, reachable sources do.</p></div>

<div class="iv"><p class="q">"ntp server, ntp peer aur ntp master mein kya fark hai?"</p><p>Direction ke terms mein jawab do. <code>ntp server</code> client/server hai: main time leta hoon aur us server ko kabhi wapas nahi deta. <code>ntp peer</code> symmetric hai: do devices ek doosre ko sync kar sakte hain, redundant core routers ke beech use hota hai. <code>ntp master</code> router ko apni clock par diye gaye stratum par reference ki tarah bharosa karwata hai, default 8, aur sirf tab use hona chahiye jab koi external source na ho. Batao ki synced client apne aap doosron ko ek stratum neeche time serve karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Stratum reference clock se doori hai: 1 us se juda hai, 16 ka matlab unsynchronised; client hamesha apne server se ek zyada hota hai.</li>
<li>Offset = ((T2 - T1) + (T3 - T4)) / 2; path asymmetry seedhe clock error ban jaati hai.</li>
<li>server = one-way client, peer = symmetric, master = local clock reference ki tarah (default stratum 8).</li>
<li>Real design mein kai sources, ntp source Loopback0 aur ntp update-calendar use karo.</li>
<li>Sync hone mein kai poll intervals lagte hain; pehle minute mein judge mat karo.</li>
</ul></div>
`}};export{e as default};