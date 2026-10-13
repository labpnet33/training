var e={id:`ntp-security-verify`,h:{en:`Securing and verifying NTP: keys, trusted keys, access groups and associations detail`,hi:`NTP secure aur verify karna: keys, trusted keys, access groups aur associations detail`},body:{en:`
<p>Imagine a bank that sets its vault timer from any phone call that says "the time is now 3 am". A thief would call, the vault would think the day is over and lock the guards out, or open early. Unauthenticated NTP is that phone line. Anyone who can reach UDP 123 on a router and answer faster than the real server can move its clock, which breaks certificates, makes logs lie, and can hide an attack. The auditor's finding in lab 3, "branches accept time from anyone who answers on UDP 123", is a real audit item in many companies.</p>

<h3>NTP authentication: four pieces, two sides</h3>
<p>NTP authentication adds a key ID and a keyed digest (MD5 on classic configurations, SHA-based HMACs on newer IOS XE releases) to each packet. The receiver recomputes the digest with its own copy of the secret; if it matches and the key is trusted, the packet is accepted.</p>
<table class="cmp"><tr><th>Command</th><th>Where</th><th>What it does</th></tr>
<tr><td><code>ntp authentication-key 1 md5 NK-Time</code></td><td>Server and client</td><td>Defines key 1 and its secret. Case-sensitive.</td></tr>
<tr><td><code>ntp authenticate</code></td><td>Client</td><td>Turns on checking: only synchronise to sources that are authenticated.</td></tr>
<tr><td><code>ntp trusted-key 1</code></td><td>Client</td><td>Lists which key IDs are acceptable for synchronisation.</td></tr>
<tr><td><code>ntp server 10.255.0.1 key 1</code></td><td>Client</td><td>Sends requests signed with key 1 to that server.</td></tr></table>
<p>The server only needs the key definition. When a signed request arrives, the server signs the reply with the same key ID. The server does <b>not</b> need <code>ntp authenticate</code>; that command controls what <i>this</i> device accepts when it synchronises. If the server itself is a client of something upstream, then it would need the full client set for that upstream relationship.</p>

<pre class="code"><span class="c">! Lab 3, HQ</span>
ntp master 3
ntp authentication-key 1 md5 NK-Time
<span class="c">! Lab 3, BR1 (BR2 is the same, once fixed)</span>
ntp authentication-key 1 md5 NK-Time
ntp authenticate
ntp trusted-key 1
ntp server 10.255.0.1 key 1</pre>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Authenticated NTP exchange">
<rect x="30" y="70" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="105" y="95" text-anchor="middle" class="svg-ink" font-size="13">BR1 (client)</text><text x="105" y="115" text-anchor="middle" class="svg-muted" font-size="12">authenticate, trusted 1</text>
<rect x="460" y="70" width="150" height="60" rx="8" fill="#bae6fd"/><text x="535" y="95" text-anchor="middle" class="svg-ink" font-size="13">HQ (server)</text><text x="535" y="115" text-anchor="middle" class="svg-muted" font-size="12">key 1 defined</text>
<line x1="180" y1="85" x2="460" y2="85" stroke="#64748b" stroke-width="2"/><text x="320" y="75" text-anchor="middle" class="svg-accent" font-size="12">request: key ID 1 + digest</text>
<line x1="460" y1="120" x2="180" y2="120" stroke="#64748b" stroke-width="2"/><text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">reply: key ID 1 + digest</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">digest check fails or key not trusted = reply ignored, no sync</text>
</svg><p class="cap">Both sides compute the digest from the same secret; the client also requires the key ID to be trusted.</p></div>

<h3>NTP access groups</h3>
<p>Authentication proves who sent the time. <b>Access groups</b> decide who may talk NTP with this router at all. There are four levels, from most to least permissive:</p>
<ul>
<li><code>ntp access-group peer 10</code>: full access; the listed hosts may request time, run control queries, and this router may synchronise to them.</li>
<li><code>ntp access-group serve 20</code>: may request time and run control queries, but this router will not synchronise to them.</li>
<li><code>ntp access-group serve-only 30</code>: may only request time.</li>
<li><code>ntp access-group query-only 40</code>: may only send control queries (no time).</li>
</ul>
<p>The router checks the groups from most to least permissive and uses the first match. The important trap: <b>once any access group exists, sources not matched by any group are denied</b>. If you add only <code>serve-only</code> on HQ for the branches and HQ also had an upstream server, HQ would stop synchronising to its upstream unless that server is permitted in <code>peer</code>.</p>
<pre class="code"><span class="c">! HQ: let the branch subnets ask for time, and keep our own upstream</span>
access-list 10 permit 192.0.2.123
access-list 20 permit 10.0.0.0 0.0.255.255
ntp access-group peer 10
ntp access-group serve-only 20</pre>

<h3>Verification: reading the two key commands</h3>
<pre class="out">BR1# show ntp associations

  address         ref clock       st   when   poll reach  delay  offset   disp
<span class="hl">*~10.255.0.1      127.127.1.1      3     14     64   377  1.024   0.512  1.940</span>
 * sys.peer, # selected, + candidate, - outlyer, x falseticker, ~ configured

BR1# show ntp associations detail
<span class="hl">10.255.0.1 configured, ipv4, authenticated, our_master, sane, valid, stratum 3</span>
ref ID 127.127.1.1    , time E8F1A2B3.1C2D3E4F (10:15:22.110 IST Wed Sep 30 2026)
our mode client, peer mode server, our poll intvl 64, peer poll intvl 64
root delay 0.00 msec, root disp 2.44, reach 377, sync dist 4.97
delay 1.02 msec, offset 0.5120 msec, dispersion 1.94, jitter 0.40 msec
precision 2**10, version 4

BR1# show ntp status
<span class="hl">Clock is synchronized, stratum 4, reference is 10.255.0.1</span>
nominal freq is 250.0000 Hz, actual freq is 250.0000 Hz, precision is 2**10
reference time is E8F1A2B3.1C2D3E4F (10:15:22.110 IST Wed Sep 30 2026)
clock offset is 0.5120 msec, root delay is 1.02 msec
root dispersion is 3.94 msec, peer dispersion is 1.94 msec</pre>
<ul>
<li><b>*</b> = the chosen system peer; <b>~</b> = configured (not learned). A server with <b>x</b> is a falseticker that was voted out.</li>
<li><b>st 3</b> is the <i>server's</i> stratum; BR1 itself is 4 in <code>show ntp status</code>.</li>
<li><b>reach</b> is an octal shift register of the last eight polls: 377 = all eight answered, 0 = none, 376 = the most recent one missed.</li>
<li>In the detail view, look for <b>authenticated, our_master, sane, valid</b>. A failing association shows <b>insane, invalid</b>, often stratum 16 and a reach stuck at 0 or a clock that never syncs.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> BR2 in lab 3 has every client command, yet stays unsynchronised. <code>show ntp associations detail</code> shows <code>10.255.0.1 configured, ipv4, insane, invalid, unsynced, stratum 16</code>, and <code>show running-config | include ntp</code> shows the key as <code>ntp authentication-key 1 md5 0822455D0A16 7</code>: type 7 hides the secret. Re-entering the key as <code>NK-Time</code> fixes it; the colleague had typed <code>NKtime</code>. The digest never matched, so every reply was silently dropped.</p></div>

<div class="warn"><p><b>Common mistake.</b> Removing <code>ntp authenticate</code> to "make it work". The clock synchronises, the ticket closes, and the audit finding is back. The right fix is always to find which of the four pieces is missing or different.</p></div>

<div class="exam"><p><b>Exam trap.</b> A question shows a client with <code>ntp authenticate</code>, a key and <code>ntp server X key 1</code> but no <code>ntp trusted-key 1</code>. The answer is "does not synchronise". Another shows the server without <code>ntp authenticate</code> and asks if that breaks the client: it does not.</p></div>

<div class="scn"><h4>The ACL that ate NTP</h4><p>A bank added an infrastructure ACL on its WAN edge permitting only SSH, SNMP and routing protocols toward router addresses. Two weeks later, syslog timestamps across 60 branches drifted by seconds and then minutes. <code>show ntp associations</code> showed reach 0 everywhere. The ACL permitted the branch requests out but dropped the replies from UDP source port 123 coming in. Adding a permit for UDP 123 from the HQ NTP loopbacks restored sync within ten minutes.</p><p><b>Lesson:</b> when reach falls to 0, check the path and filters before touching NTP keys.</p></div>

<div class="iv"><p class="q">"Your client has NTP authentication configured but stays unsynchronised. How do you troubleshoot?"</p><p>Check reachability first: <code>show ntp associations</code> reach value, ACLs and <code>ntp source</code>. Then compare the four pieces: same key ID and same case-sensitive secret on both sides, <code>ntp authenticate</code> and <code>ntp trusted-key</code> on the client, <code>key</code> on the <code>ntp server</code> line. Read <code>show ntp associations detail</code> for authenticated, sane and valid, and use <code>debug ntp packets</code> briefly if needed. Mention access groups on the server as the last check.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Client needs four lines: authentication-key, authenticate, trusted-key, and server with key; the server needs only the key.</li>
<li>Secrets are case-sensitive and shown as type 7 in the running config, so re-type them when in doubt.</li>
<li>Access groups: peer, serve, serve-only, query-only; unmatched sources are denied once any group exists.</li>
<li>Read associations: * = sys.peer, reach 377 = healthy, st = the server's stratum.</li>
<li>Detail must say authenticated, sane, valid; show ntp status must say synchronized.</li>
</ul></div>
`,hi:`
<p>Ek bank socho jo apne vault ka timer kisi bhi phone call se set kar deta hai jo kahe "abhi raat ke 3 baje hain". Chor call karega, vault sochega din khatam hua aur guards ko bahar lock kar dega, ya jaldi khul jaayega. Unauthenticated NTP wahi phone line hai. Jo bhi router ke UDP 123 tak pahunch sake aur asli server se tez jawab de, woh uski clock hila sakta hai, jisse certificates toot-te hain, logs jhooth bolte hain, aur attack chhup sakta hai. Lab 3 mein auditor ki finding, "branches UDP 123 par jawab dene wale kisi se bhi time le leti hain", kai companies mein asli audit item hai.</p>

<h3>NTP authentication: chaar pieces, do sides</h3>
<p>NTP authentication har packet mein key ID aur keyed digest jodta hai (classic configurations par MD5, naye IOS XE releases par SHA-based HMACs). Receiver apni secret copy se digest dobara nikaalta hai; match ho aur key trusted ho, to packet accept hota hai.</p>
<table class="cmp"><tr><th>Command</th><th>Kahan</th><th>Kya karta hai</th></tr>
<tr><td><code>ntp authentication-key 1 md5 NK-Time</code></td><td>Server aur client</td><td>Key 1 aur uska secret define karta hai. Case-sensitive.</td></tr>
<tr><td><code>ntp authenticate</code></td><td>Client</td><td>Checking on karta hai: sirf authenticated sources se sync karo.</td></tr>
<tr><td><code>ntp trusted-key 1</code></td><td>Client</td><td>List karta hai ki sync ke liye kaunse key IDs acceptable hain.</td></tr>
<tr><td><code>ntp server 10.255.0.1 key 1</code></td><td>Client</td><td>Us server ko key 1 se signed requests bhejta hai.</td></tr></table>
<p>Server ko sirf key definition chahiye. Signed request aane par server reply ko same key ID se sign karta hai. Server ko <code>ntp authenticate</code> ki zaroorat <b>nahi</b>; woh command control karti hai ki <i>yeh</i> device sync karte waqt kya accept karta hai. Agar server khud kisi upstream ka client hai, to us upstream relationship ke liye use poora client set chahiye hoga.</p>

<pre class="code"><span class="c">! Lab 3, HQ</span>
ntp master 3
ntp authentication-key 1 md5 NK-Time
<span class="c">! Lab 3, BR1 (BR2 bhi same, theek hone ke baad)</span>
ntp authentication-key 1 md5 NK-Time
ntp authenticate
ntp trusted-key 1
ntp server 10.255.0.1 key 1</pre>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Authenticated NTP exchange">
<rect x="30" y="70" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="105" y="95" text-anchor="middle" class="svg-ink" font-size="13">BR1 (client)</text><text x="105" y="115" text-anchor="middle" class="svg-muted" font-size="12">authenticate, trusted 1</text>
<rect x="460" y="70" width="150" height="60" rx="8" fill="#bae6fd"/><text x="535" y="95" text-anchor="middle" class="svg-ink" font-size="13">HQ (server)</text><text x="535" y="115" text-anchor="middle" class="svg-muted" font-size="12">key 1 defined</text>
<line x1="180" y1="85" x2="460" y2="85" stroke="#64748b" stroke-width="2"/><text x="320" y="75" text-anchor="middle" class="svg-accent" font-size="12">request: key ID 1 + digest</text>
<line x1="460" y1="120" x2="180" y2="120" stroke="#64748b" stroke-width="2"/><text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">reply: key ID 1 + digest</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">digest fail ya key trusted nahi = reply ignore, sync nahi</text>
</svg><p class="cap">Dono sides same secret se digest nikaalti hain; client ko key ID ka trusted hona bhi chahiye.</p></div>

<h3>NTP access groups</h3>
<p>Authentication saabit karta hai ki time kisne bheja. <b>Access groups</b> tay karte hain ki is router se NTP mein baat hi kaun kar sakta hai. Chaar levels hain, sabse zyada se sabse kam permissive:</p>
<ul>
<li><code>ntp access-group peer 10</code>: full access; listed hosts time maang sakte hain, control queries chala sakte hain, aur yeh router unse sync ho sakta hai.</li>
<li><code>ntp access-group serve 20</code>: time maang sakte hain aur control queries chala sakte hain, lekin yeh router unse sync nahi hoga.</li>
<li><code>ntp access-group serve-only 30</code>: sirf time maang sakte hain.</li>
<li><code>ntp access-group query-only 40</code>: sirf control queries bhej sakte hain (time nahi).</li>
</ul>
<p>Router groups ko sabse zyada se sabse kam permissive order mein check karta hai aur pehla match use karta hai. Important trap: <b>jaise hi koi bhi access group exist karta hai, jo sources kisi group mein match nahi hote woh deny hote hain</b>. Agar aap HQ par branches ke liye sirf <code>serve-only</code> jodte ho aur HQ ka koi upstream server bhi tha, to HQ apne upstream se sync karna band kar dega jab tak woh server <code>peer</code> mein permit na ho.</p>
<pre class="code"><span class="c">! HQ: branch subnets ko time maangne do, aur apna upstream rakho</span>
access-list 10 permit 192.0.2.123
access-list 20 permit 10.0.0.0 0.0.255.255
ntp access-group peer 10
ntp access-group serve-only 20</pre>

<h3>Verification: do key commands padhna</h3>
<pre class="out">BR1# show ntp associations

  address         ref clock       st   when   poll reach  delay  offset   disp
<span class="hl">*~10.255.0.1      127.127.1.1      3     14     64   377  1.024   0.512  1.940</span>
 * sys.peer, # selected, + candidate, - outlyer, x falseticker, ~ configured

BR1# show ntp associations detail
<span class="hl">10.255.0.1 configured, ipv4, authenticated, our_master, sane, valid, stratum 3</span>
ref ID 127.127.1.1    , time E8F1A2B3.1C2D3E4F (10:15:22.110 IST Wed Sep 30 2026)
our mode client, peer mode server, our poll intvl 64, peer poll intvl 64
root delay 0.00 msec, root disp 2.44, reach 377, sync dist 4.97
delay 1.02 msec, offset 0.5120 msec, dispersion 1.94, jitter 0.40 msec
precision 2**10, version 4

BR1# show ntp status
<span class="hl">Clock is synchronized, stratum 4, reference is 10.255.0.1</span>
nominal freq is 250.0000 Hz, actual freq is 250.0000 Hz, precision is 2**10
reference time is E8F1A2B3.1C2D3E4F (10:15:22.110 IST Wed Sep 30 2026)
clock offset is 0.5120 msec, root delay is 1.02 msec
root dispersion is 3.94 msec, peer dispersion is 1.94 msec</pre>
<ul>
<li><b>*</b> = chuna hua system peer; <b>~</b> = configured (learned nahi). <b>x</b> wala server falseticker hai jise vote karke nikaala gaya.</li>
<li><b>st 3</b> <i>server</i> ka stratum hai; <code>show ntp status</code> mein BR1 khud 4 hai.</li>
<li><b>reach</b> pichhle aath polls ka octal shift register hai: 377 = aathon ka jawab aaya, 0 = kisi ka nahi, 376 = sabse naya wala miss hua.</li>
<li>Detail view mein <b>authenticated, our_master, sane, valid</b> dhoondho. Fail hone wali association <b>insane, invalid</b> dikhati hai, aksar stratum 16 aur reach 0 par atka, ya clock jo kabhi sync nahi hoti.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Lab 3 mein BR2 par har client command hai, phir bhi woh unsynchronised rehta hai. <code>show ntp associations detail</code> dikhata hai <code>10.255.0.1 configured, ipv4, insane, invalid, unsynced, stratum 16</code>, aur <code>show running-config | include ntp</code> key ko <code>ntp authentication-key 1 md5 0822455D0A16 7</code> dikhata hai: type 7 secret chhupa deta hai. Key ko <code>NK-Time</code> ki tarah dobara daalne se theek ho jaata hai; colleague ne <code>NKtime</code> type kiya tha. Digest kabhi match nahi hua, to har reply chupchaap drop hua.</p></div>

<div class="warn"><p><b>Common galti.</b> "Chalane ke liye" <code>ntp authenticate</code> hata dena. Clock sync ho jaati hai, ticket band ho jaata hai, aur audit finding wapas aa jaati hai. Sahi fix hamesha yeh dhoondhna hai ki chaar pieces mein se kaunsa missing ya alag hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Sawaal ek client dikhata hai jis par <code>ntp authenticate</code>, key aur <code>ntp server X key 1</code> hai lekin <code>ntp trusted-key 1</code> nahi. Jawab hai "sync nahi hota". Doosra sawaal server ko bina <code>ntp authenticate</code> ke dikhata hai aur poochta hai kya isse client toot-ta hai: nahi toot-ta.</p></div>

<div class="scn"><h4>ACL jo NTP kha gaya</h4><p>Ek bank ne apne WAN edge par infrastructure ACL lagaya jo router addresses ki taraf sirf SSH, SNMP aur routing protocols permit karta tha. Do hafte baad 60 branches ke syslog timestamps seconds aur phir minutes se drift hue. <code>show ntp associations</code> har jagah reach 0 dikha raha tha. ACL branch requests ko bahar jaane deta tha lekin UDP source port 123 se andar aate replies drop karta tha. HQ NTP loopbacks se UDP 123 ka permit jodne se das minute mein sync wapas aa gaya.</p><p><b>Seekh:</b> jab reach 0 par gire, to NTP keys chhoone se pehle path aur filters check karo.</p></div>

<div class="iv"><p class="q">"Aapke client par NTP authentication configured hai lekin woh unsynchronised rehta hai. Kaise troubleshoot karoge?"</p><p>Pehle reachability check karo: <code>show ntp associations</code> ka reach value, ACLs aur <code>ntp source</code>. Phir chaar pieces compare karo: dono sides par same key ID aur same case-sensitive secret, client par <code>ntp authenticate</code> aur <code>ntp trusted-key</code>, <code>ntp server</code> line par <code>key</code>. <code>show ntp associations detail</code> mein authenticated, sane aur valid padho, aur zaroorat ho to thodi der <code>debug ntp packets</code> use karo. Aakhri check ke roop mein server ke access groups batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Client ko chaar lines chahiye: authentication-key, authenticate, trusted-key, aur key ke saath server; server ko sirf key.</li>
<li>Secrets case-sensitive hain aur running config mein type 7 dikhte hain, to shak ho to dobara type karo.</li>
<li>Access groups: peer, serve, serve-only, query-only; koi bhi group exist karte hi unmatched sources deny hote hain.</li>
<li>Associations padho: * = sys.peer, reach 377 = healthy, st = server ka stratum.</li>
<li>Detail mein authenticated, sane, valid aana chahiye; show ntp status mein synchronized.</li>
</ul></div>
`}};export{e as default};