var e={id:`ntp-config`,h:{en:`Configuring NTP, time zones and authentication`,hi:`NTP, time zones aur authentication configure karna`},body:{en:`
<p>Setting up NTP is like setting up a family WhatsApp group for "what time should we leave?". You decide who the trusted source is (one parent), everyone else follows that person, each member displays the time in their own city, and you make sure strangers cannot post fake times into the group. Those four decisions map exactly to four configuration blocks: source, clients, time zone, authentication.</p>

<h3>Step 1: point the router at a server</h3>
<p>In lab 1 the NMS (<code>10.1.1.100</code>) is a stratum-1 server. R1 becomes its client:</p>
<pre class="code">R1# configure terminal
R1(config)# ntp server 10.1.1.100
<span class="c">! production example: a second server, and prefer the first one</span>
R1(config)# ntp server 10.1.1.101
R1(config)# ntp server 10.1.1.100 prefer</pre>
<p>In production configure <b>at least two, ideally three or four</b> servers. With two servers that disagree, NTP cannot tell which one is wrong; with three or more it can outvote a bad one (a "falseticker"). The <code>prefer</code> keyword only breaks ties between otherwise good servers.</p>

<h3>Step 2: build the hierarchy</h3>
<p>R2 should not reach out to the NMS directly. The design says R2 learns time from R1, so R1 acts as a server for R2:</p>
<pre class="code">R2(config)# ntp server 10.1.12.1</pre>
<p>Nothing extra is needed on R1. A Cisco router that is synchronised automatically answers NTP clients. When R1 is at stratum 2, R2 becomes <b>stratum 3</b>. If R1 loses its own server, it becomes unsynchronised and R2 will stop trusting it too, which is correct behaviour.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Lab 1 NTP design">
<rect x="20" y="70" width="160" height="56" rx="8" fill="#bbf7d0"/><text x="100" y="93" text-anchor="middle" class="svg-ink" font-size="13">NMS 10.1.1.100</text><text x="100" y="112" text-anchor="middle" class="svg-muted" font-size="12">stratum 1</text>
<rect x="240" y="70" width="160" height="56" rx="8" fill="#bae6fd"/><text x="320" y="93" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="320" y="112" text-anchor="middle" class="svg-muted" font-size="12">ntp server 10.1.1.100</text>
<rect x="460" y="70" width="160" height="56" rx="8" fill="#bae6fd"/><text x="540" y="93" text-anchor="middle" class="svg-ink" font-size="13">R2</text><text x="540" y="112" text-anchor="middle" class="svg-muted" font-size="12">ntp server 10.1.12.1</text>
<line x1="180" y1="98" x2="240" y2="98" stroke="#64748b" stroke-width="2"/><line x1="400" y1="98" x2="460" y2="98" stroke="#64748b" stroke-width="2"/>
<text x="210" y="60" text-anchor="middle" class="svg-accent" font-size="12">UDP 123</text><text x="430" y="60" text-anchor="middle" class="svg-accent" font-size="12">UDP 123</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">R1 becomes stratum 2 and serves R2, which becomes stratum 3</text>
</svg><p class="cap">Time flows from the NMS to R1 to R2. Each arrow is a client asking a server.</p></div>

<h3>Step 3: time zone and summer time</h3>
<p>NTP gives UTC. To display local time, set the zone name and offset from UTC in hours and minutes:</p>
<pre class="code">R1(config)# clock timezone IST 5 30
<span class="c">! a zone with daylight saving, for comparison (not used in India)</span>
R3(config)# clock timezone CET 1
R3(config)# clock summer-time CEST recurring last Sun Mar 2:00 last Sun Oct 3:00</pre>
<p>The name (<code>IST</code>) is just a label that appears in <code>show clock</code> and in log timestamps; the numbers do the work. <code>clock summer-time ... recurring</code> moves the display forward one hour between the two dates every year. India does not use daylight saving, so the lab only needs <code>clock timezone IST 5 30</code>. A negative zone such as New York is written <code>clock timezone EST -5</code>.</p>

<h3>Other useful commands</h3>
<pre class="code"><span class="c">! source NTP packets from a stable address (servers may filter by source)</span>
R1(config)# ntp source Loopback0
<span class="c">! copy the NTP-corrected time into the hardware calendar</span>
R1(config)# ntp update-calendar
<span class="c">! set the clock by hand (privileged EXEC, not config mode)</span>
R1# clock set 14:05:00 29 Sep 2026
<span class="c">! isolated lab only: trust this router's own clock</span>
R1(config)# ntp master 4</pre>

<h3>Step 4: NTP authentication</h3>
<p>Without authentication, any device that can send UDP 123 to your router could pretend to be a time server and move its clock, which breaks certificates and hides attacks in the logs. NTP authentication adds a keyed hash (MD5 on classic IOS, SHA variants on newer releases) to each packet. It proves the <b>server</b> is who it says it is. It does not encrypt the time.</p>
<pre class="code"><span class="c">! on the client R2 (and the same key on R1, the server)</span>
R2(config)# ntp authenticate
R2(config)# ntp authentication-key 1 md5 NkT1me#Key
R2(config)# ntp trusted-key 1
R2(config)# ntp server 10.1.12.1 key 1

<span class="c">! on the server R1: the key must exist with the same number and value</span>
R1(config)# ntp authentication-key 1 md5 NkT1me#Key</pre>
<p>All four pieces are needed on the client: <code>ntp authenticate</code> turns checking on, <code>ntp authentication-key</code> defines the key, <code>ntp trusted-key</code> marks it as acceptable, and <code>key 1</code> on the server line says which key to use for that server. Key number and key string must match on both sides.</p>

<div class="eg"><p><b>Worked example.</b> Lab 1 in full. R1: <code>ntp server 10.1.1.100</code>, <code>clock timezone IST 5 30</code>. Wait about 20 seconds. R2: <code>ntp server 10.1.12.1</code>, <code>clock timezone IST 5 30</code>. R1 was 2 h 13 min slow; after sync its clock jumps to the correct time and <code>show clock</code> shows for example <code>14:05:31.402 IST Tue Sep 29 2026</code>. R2 was 47 min fast; after it syncs to R1 it shows the same time, stratum 3.</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring R2 before R1 is synchronised and then assuming it is broken. A router only serves time after it is synchronised itself. Give the upstream device a minute, check <code>show ntp status</code> there first, then look downstream.</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting <code>ntp trusted-key</code>. With <code>ntp authenticate</code> on and the key defined but not trusted, the client rejects every reply and never synchronises.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>clock set</code> is a privileged EXEC command; <code>clock timezone</code> and <code>clock summer-time</code> are global configuration commands. NTP authentication authenticates the time source; it does not encrypt anything. You can also restrict who may use the router's NTP service with <code>ntp access-group</code> and an ACL.</p></div>

<div class="scn"><h4>Time zone set, logs still in UTC</h4><p>After a rollout, the NOC complained that <code>show clock</code> on every router showed IST but the syslog server still received messages stamped in UTC. The engineer had configured <code>clock timezone IST 5 30</code> everywhere but left the default <code>service timestamps log datetime msec</code>, which stamps logs in UTC. Adding <code>localtime show-timezone</code> to the command fixed it.</p><p><b>Lesson:</b> the time zone changes how the clock is displayed; log timestamps have their own setting (chapter 6).</p></div>

<div class="iv"><p class="q">"How do you configure NTP authentication on a Cisco router, and what does it protect?"</p><p>Strong answer lists the four client commands: <code>ntp authenticate</code>, <code>ntp authentication-key 1 md5 &lt;string&gt;</code>, <code>ntp trusted-key 1</code> and <code>ntp server X key 1</code>, and the same key on the server. Then explain it protects against a rogue time source by authenticating the server's packets with a keyed hash; it does not encrypt. Mention using several servers and <code>ntp source Loopback0</code> for a stable identity.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ntp server X</code> makes a client; a synchronised router automatically serves time to its own clients.</li>
<li>Use three or more servers in production so a bad one can be outvoted.</li>
<li><code>clock timezone IST 5 30</code> and <code>clock summer-time</code> only change the display; NTP stays UTC.</li>
<li>Authentication needs authenticate + authentication-key + trusted-key + key on the server line.</li>
<li><code>ntp source</code>, <code>ntp update-calendar</code>, <code>clock set</code> (EXEC) and <code>ntp master</code> complete the toolkit.</li>
</ul></div>
`,hi:`
<p>NTP set up karna ek family WhatsApp group jaisa hai jismein "kitne baje nikalna hai?" tay hota hai. Aap decide karte ho ki trusted source kaun hai (ek parent), baaki sab us insaan ko follow karte hain, har member time apne sheher ke hisaab se dekhta hai, aur aap pakka karte ho ki ajnabi log group mein fake time post na kar sakein. Yeh chaar decisions exactly chaar configuration blocks se match karte hain: source, clients, time zone, authentication.</p>

<h3>Step 1: router ko server ki taraf point karo</h3>
<p>Lab 1 mein NMS (<code>10.1.1.100</code>) stratum-1 server hai. R1 uska client banta hai:</p>
<pre class="code">R1# configure terminal
R1(config)# ntp server 10.1.1.100
<span class="c">! production example: doosra server, aur pehle wale ko prefer karo</span>
R1(config)# ntp server 10.1.1.101
R1(config)# ntp server 10.1.1.100 prefer</pre>
<p>Production mein <b>kam se kam do, behtar teen ya chaar</b> servers configure karo. Do servers agar disagree karein, to NTP bata nahi sakta kaunsa galat hai; teen ya zyada ke saath woh kharab wale ko outvote kar sakta hai (ek "falseticker"). <code>prefer</code> keyword sirf baaki achhe servers ke beech tie todta hai.</p>

<h3>Step 2: hierarchy banao</h3>
<p>R2 ko seedha NMS tak nahi jaana chahiye. Design kehta hai R2 time R1 se seekhe, isliye R1 R2 ke liye server ka kaam karta hai:</p>
<pre class="code">R2(config)# ntp server 10.1.12.1</pre>
<p>R1 par kuch extra nahi chahiye. Jo Cisco router synchronised hai woh automatically NTP clients ko jawab deta hai. Jab R1 stratum 2 par hai, R2 <b>stratum 3</b> banta hai. Agar R1 apna server kho de, to woh unsynchronised ho jaata hai aur R2 bhi us par bharosa karna band kar deta hai, jo sahi behaviour hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Lab 1 NTP design">
<rect x="20" y="70" width="160" height="56" rx="8" fill="#bbf7d0"/><text x="100" y="93" text-anchor="middle" class="svg-ink" font-size="13">NMS 10.1.1.100</text><text x="100" y="112" text-anchor="middle" class="svg-muted" font-size="12">stratum 1</text>
<rect x="240" y="70" width="160" height="56" rx="8" fill="#bae6fd"/><text x="320" y="93" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="320" y="112" text-anchor="middle" class="svg-muted" font-size="12">ntp server 10.1.1.100</text>
<rect x="460" y="70" width="160" height="56" rx="8" fill="#bae6fd"/><text x="540" y="93" text-anchor="middle" class="svg-ink" font-size="13">R2</text><text x="540" y="112" text-anchor="middle" class="svg-muted" font-size="12">ntp server 10.1.12.1</text>
<line x1="180" y1="98" x2="240" y2="98" stroke="#64748b" stroke-width="2"/><line x1="400" y1="98" x2="460" y2="98" stroke="#64748b" stroke-width="2"/>
<text x="210" y="60" text-anchor="middle" class="svg-accent" font-size="12">UDP 123</text><text x="430" y="60" text-anchor="middle" class="svg-accent" font-size="12">UDP 123</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">R1 stratum 2 banta hai aur R2 ko serve karta hai, R2 stratum 3 banta hai</text>
</svg><p class="cap">Time NMS se R1 aur R1 se R2 tak behta hai. Har arrow ek client hai jo server se pooch raha hai.</p></div>

<h3>Step 3: time zone aur summer time</h3>
<p>NTP UTC deta hai. Local time dikhane ke liye zone ka naam aur UTC se offset ghante aur minute mein set karo:</p>
<pre class="code">R1(config)# clock timezone IST 5 30
<span class="c">! comparison ke liye daylight saving wala zone (India mein use nahi hota)</span>
R3(config)# clock timezone CET 1
R3(config)# clock summer-time CEST recurring last Sun Mar 2:00 last Sun Oct 3:00</pre>
<p>Naam (<code>IST</code>) sirf ek label hai jo <code>show clock</code> aur log timestamps mein dikhta hai; kaam numbers karte hain. <code>clock summer-time ... recurring</code> har saal do dates ke beech display ko ek ghanta aage kar deta hai. India daylight saving use nahi karta, isliye lab ko sirf <code>clock timezone IST 5 30</code> chahiye. New York jaisa negative zone <code>clock timezone EST -5</code> likha jaata hai.</p>

<h3>Doosre kaam ke commands</h3>
<pre class="code"><span class="c">! NTP packets ek stable address se bhejo (servers source se filter kar sakte hain)</span>
R1(config)# ntp source Loopback0
<span class="c">! NTP se correct hua time hardware calendar mein copy karo</span>
R1(config)# ntp update-calendar
<span class="c">! clock haath se set karo (privileged EXEC, config mode nahi)</span>
R1# clock set 14:05:00 29 Sep 2026
<span class="c">! sirf isolated lab: is router ki apni clock par bharosa karo</span>
R1(config)# ntp master 4</pre>

<h3>Step 4: NTP authentication</h3>
<p>Authentication ke bina, jo bhi device aapke router ko UDP 123 bhej sakta hai woh time server hone ka naatak karke uski clock hila sakta hai, jisse certificates toot jaate hain aur attacks logs mein chhup jaate hain. NTP authentication har packet mein ek keyed hash jodta hai (classic IOS par MD5, naye releases par SHA variants). Yeh sabit karta hai ki <b>server</b> wahi hai jo woh kehta hai. Yeh time ko encrypt nahi karta.</p>
<pre class="code"><span class="c">! client R2 par (aur wahi key R1, yaani server par)</span>
R2(config)# ntp authenticate
R2(config)# ntp authentication-key 1 md5 NkT1me#Key
R2(config)# ntp trusted-key 1
R2(config)# ntp server 10.1.12.1 key 1

<span class="c">! server R1 par: key same number aur value ke saath honi chahiye</span>
R1(config)# ntp authentication-key 1 md5 NkT1me#Key</pre>
<p>Client par chaaron pieces chahiye: <code>ntp authenticate</code> checking on karta hai, <code>ntp authentication-key</code> key define karta hai, <code>ntp trusted-key</code> use acceptable mark karta hai, aur server line par <code>key 1</code> batata hai ki us server ke liye kaunsi key use karni hai. Key number aur key string dono sides par match hone chahiye.</p>

<div class="eg"><p><b>Worked example.</b> Lab 1 poora. R1: <code>ntp server 10.1.1.100</code>, <code>clock timezone IST 5 30</code>. Lagbhag 20 seconds ruko. R2: <code>ntp server 10.1.12.1</code>, <code>clock timezone IST 5 30</code>. R1 2 h 13 min peeche tha; sync ke baad uski clock sahi time par kood jaati hai aur <code>show clock</code> for example <code>14:05:31.402 IST Tue Sep 29 2026</code> dikhata hai. R2 47 min aage tha; R1 se sync hone ke baad woh same time dikhata hai, stratum 3.</p></div>

<div class="warn"><p><b>Common galti.</b> R1 sync hone se pehle R2 configure karna aur phir maan lena ki woh toota hai. Router tabhi time serve karta hai jab woh khud synchronised ho. Upstream device ko ek minute do, pehle wahan <code>show ntp status</code> check karo, phir downstream dekho.</p></div>

<div class="warn"><p><b>Common galti.</b> <code>ntp trusted-key</code> bhool jaana. <code>ntp authenticate</code> on ho aur key defined ho par trusted na ho, to client har reply reject karta hai aur kabhi sync nahi hota.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>clock set</code> privileged EXEC command hai; <code>clock timezone</code> aur <code>clock summer-time</code> global configuration commands hain. NTP authentication time source ko authenticate karta hai; kuch encrypt nahi karta. Router ki NTP service kaun use kar sakta hai yeh bhi <code>ntp access-group</code> aur ek ACL se restrict kar sakte ho.</p></div>

<div class="scn"><h4>Time zone set, logs phir bhi UTC mein</h4><p>Ek rollout ke baad NOC ne complain kiya ki har router par <code>show clock</code> IST dikhata hai lekin syslog server ko messages abhi bhi UTC stamp ke saath mil rahe hain. Engineer ne har jagah <code>clock timezone IST 5 30</code> configure kiya tha lekin default <code>service timestamps log datetime msec</code> chhod diya tha, jo logs ko UTC mein stamp karta hai. Command mein <code>localtime show-timezone</code> jodne se fix ho gaya.</p><p><b>Seekh:</b> time zone clock ke dikhne ka tareeka badalta hai; log timestamps ki apni setting hai (chapter 6).</p></div>

<div class="iv"><p class="q">"Cisco router par NTP authentication kaise configure karte ho, aur yeh kis cheez se bachata hai?"</p><p>Strong answer chaaron client commands list karta hai: <code>ntp authenticate</code>, <code>ntp authentication-key 1 md5 &lt;string&gt;</code>, <code>ntp trusted-key 1</code> aur <code>ntp server X key 1</code>, aur server par wahi key. Phir samjhao ki yeh server ke packets ko keyed hash se authenticate karke rogue time source se bachata hai; encrypt nahi karta. Kai servers use karna aur stable identity ke liye <code>ntp source Loopback0</code> bhi mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ntp server X</code> client banata hai; synced router apne clients ko automatically time serve karta hai.</li>
<li>Production mein teen ya zyada servers use karo taaki kharab wala outvote ho sake.</li>
<li><code>clock timezone IST 5 30</code> aur <code>clock summer-time</code> sirf display badalte hain; NTP UTC hi rehta hai.</li>
<li>Authentication ko authenticate + authentication-key + trusted-key + server line par key chahiye.</li>
<li><code>ntp source</code>, <code>ntp update-calendar</code>, <code>clock set</code> (EXEC) aur <code>ntp master</code> toolkit poora karte hain.</li>
</ul></div>
`}};export{e as default};