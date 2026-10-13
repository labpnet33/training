var e={id:`tables`,h:{en:`Inside the ASA: packet flow, the connection table and the xlate table`,hi:`ASA ke andar: packet flow, connection table aur xlate table`},body:{en:`
<p>Back to the security desk. The guard keeps two notebooks. The first, the <b>logbook</b>, lists every person who went out and has not come back yet, with time and destination; that is how returning people are recognised. The second, the <b>badge register</b>, lists which visitor badge number was handed to which employee. On the ASA these are the <b>connection table</b> and the <b>xlate (translation) table</b>. If you can read these two tables, you can explain almost any ASA behaviour.</p>

<h3>How the ASA handles a packet</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="ASA packet flow">
<rect x="10" y="20" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="65" y="45" text-anchor="middle" class="svg-ink" font-size="12">Packet arrives</text>
<rect x="150" y="20" width="130" height="40" rx="8" fill="#fde68a"/><text x="215" y="45" text-anchor="middle" class="svg-ink" font-size="12">Existing conn?</text>
<line x1="120" y1="40" x2="150" y2="40" stroke="#64748b"/>
<rect x="320" y="20" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="395" y="45" text-anchor="middle" class="svg-ink" font-size="12">Yes: fast path</text>
<line x1="280" y1="40" x2="320" y2="40" stroke="#64748b"/>
<rect x="500" y="20" width="130" height="40" rx="8" fill="#e2e8f0"/><text x="565" y="45" text-anchor="middle" class="svg-ink" font-size="12">Translate, send</text>
<line x1="470" y1="40" x2="500" y2="40" stroke="#64748b"/>
<line x1="215" y1="60" x2="215" y2="95" stroke="#64748b"/><text x="232" y="82" class="svg-muted" font-size="11">no</text>
<rect x="10" y="95" width="115" height="40" rx="8" fill="#bae6fd"/><text x="67" y="120" text-anchor="middle" class="svg-ink" font-size="12">Un-NAT, route</text>
<rect x="135" y="95" width="115" height="40" rx="8" fill="#bae6fd"/><text x="192" y="120" text-anchor="middle" class="svg-ink" font-size="12">ACL / level</text>
<rect x="260" y="95" width="115" height="40" rx="8" fill="#bae6fd"/><text x="317" y="120" text-anchor="middle" class="svg-ink" font-size="12">NAT rule</text>
<rect x="385" y="95" width="115" height="40" rx="8" fill="#bae6fd"/><text x="442" y="120" text-anchor="middle" class="svg-ink" font-size="12">Inspection</text>
<rect x="510" y="95" width="120" height="40" rx="8" fill="#ddd6fe"/><text x="570" y="120" text-anchor="middle" class="svg-ink" font-size="12">Create conn</text>
<line x1="125" y1="115" x2="135" y2="115" stroke="#64748b"/><line x1="250" y1="115" x2="260" y2="115" stroke="#64748b"/><line x1="375" y1="115" x2="385" y2="115" stroke="#64748b"/><line x1="500" y1="115" x2="510" y2="115" stroke="#64748b"/>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Slow path: only the first packet of a new flow does all the checks.</text>
<text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">A drop at any step ends the journey; packet-tracer shows each step as a phase.</text>
</svg><p class="cap">New flows take the slow path once; every later packet of the flow matches the connection and takes the fast path.</p></div>
<ol>
<li><b>Connection lookup.</b> Does this packet belong to an existing connection? If yes, it takes the <b>fast path</b>: no ACL check, just translation and forwarding.</li>
<li>If not, it is a <b>new flow</b> and takes the slow path: un-translate the destination if it is a mapped address, look up the route to find the egress interface, check the <b>ACL or security levels</b>, find the <b>NAT rule</b> and build a translation, run <b>inspection</b>, and finally <b>create the connection</b>.</li>
<li>For TCP, the first packet must be a SYN. A mid-flow packet that matches no connection is dropped, which is how the ASA exposes <b>asymmetric routing</b>.</li>
</ol>

<h3>The connection table</h3>
<pre class="out">NK-ASA# show conn
3 in use, 12 most used
<span class="hl">TCP outside  8.8.8.8:80 inside  10.0.1.10:51544, idle 0:00:02, bytes 1843, flags UIO</span>
UDP outside  8.8.8.8:53 inside  10.0.1.10:60021, idle 0:00:01, bytes 128, flags -
TCP dmz  10.0.2.10:80 inside  10.0.1.50:51820, idle 0:00:09, bytes 5270, flags UIO</pre>
<p>Each line shows the protocol, the two interfaces and the <b>real</b> addresses and ports on each side (not the translated ones), how long the connection has been idle and how many bytes passed. The most useful flags: <b>U</b> = up, <b>I</b> = inbound data seen, <b>O</b> = outbound data seen, <b>B</b> = initial SYN came from outside. <code>show conn detail</code> prints the full flag legend. "UIO" on a TCP line means data flowed both ways: the connection is healthy. A TCP entry stuck without I means requests go out but nothing comes back.</p>

<h3>The xlate table</h3>
<pre class="out">NK-ASA# show xlate
2 in use, 5 most used
Flags: D - DNS, e - extended, I - identity, i - dynamic, r - portmap,
       s - static, T - twice, N - net-to-net
<span class="hl">TCP PAT from inside:10.0.1.10/51544 to outside:203.0.113.2/51544 flags ri idle 0:00:02 timeout 0:00:30</span>
UDP PAT from inside:10.0.1.10/60021 to outside:203.0.113.2/60021 flags ri idle 0:00:01 timeout 0:00:30</pre>
<p>Here PC1's port 51544 is translated to the outside interface address 203.0.113.2, port 51544. Flags <b>ri</b> = portmap (PAT) and dynamic. The ASA keeps the original port when it is free and picks another when it is not.</p>

<h3>Timeouts and clearing</h3>
<pre class="out">NK-ASA# show running-config all timeout
timeout xlate 3:00:00
<span class="hl">timeout pat-xlate 0:00:30</span>
<span class="hl">timeout conn 1:00:00 half-closed 0:10:00 udp 0:02:00 sctp 0:02:00 icmp 0:00:02</span>
...(trimmed)</pre>
<p>Idle TCP connections are removed after 1 hour, UDP after 2 minutes, and a PAT translation 30 seconds after its last connection closes. After a policy or NAT change, existing flows keep their old treatment until they end or you remove them:</p>
<pre class="code"><span class="c">! remove connections of one host</span>
clear conn address 10.0.1.10
<span class="c">! remove translations (and their connections)</span>
clear xlate
<span class="c">! count only</span>
show conn count</pre>

<div class="eg"><p><b>Worked example.</b> PC1 opens a web page on 8.8.8.8. The first SYN arrives on inside: no connection exists, so slow path. Route lookup says outside. Level 100 to 0: allowed. NAT rule INSIDE-NET matches: xlate 10.0.1.10/51544 to 203.0.113.2/51544. Connection created. The SYN-ACK from 8.8.8.8 arrives on outside, matches the connection, is un-translated to 10.0.1.10 and forwarded, without any level or ACL check. <code>show conn</code> shows one line with flags UIO and <code>show xlate</code> one PAT line with flags ri.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Reading <code>show conn</code> and expecting to see the public address 203.0.113.2: conn shows real addresses, xlate shows translations. Changing a NAT rule and testing immediately without <code>clear xlate</code>: old translations still win. Running <code>clear conn</code> with no filter on a busy production firewall: every user session drops.</p></div>

<div class="exam"><p><b>Exam trap.</b> Replies are allowed because they match the <b>connection table</b>, not because of the security level or an ACL. And the fast path skips the ACL, which is why adding a deny rule does not stop a flow that is already established until you clear it.</p></div>

<div class="scn"><h4>The web app that froze after two minutes</h4><p>Users complained that a login session to an internal reporting app dropped every few minutes. Syslog showed <code>%ASA-6-106015: Deny TCP (no connection) from 10.0.1.10/51544 to 10.20.5.20/443 flags ACK on interface inside</code>. The ASA had no connection for that flow, because the SYN had gone through a different path: a new core route sent part of the traffic around the ASA. Fixing the routing so both directions crossed the ASA removed the errors.</p><p><b>Lesson:</b> "Deny TCP (no connection)" is the signature of asymmetric routing or a connection that timed out.</p></div>

<div class="iv"><p class="q">"What is the difference between show conn and show xlate?"</p><p>Strong answer: <code>show conn</code> is the stateful connection table: every live flow with real addresses, ports, idle time, bytes and flags; it is what lets replies back in. <code>show xlate</code> lists NAT/PAT translations, real to mapped. A flow usually has both, but a flow with no NAT has a connection and no xlate. Mention fast path vs slow path, timeouts (conn 1 hour, PAT 30 seconds) and <code>clear conn</code>/<code>clear xlate</code> after changes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>First packet: slow path (route, ACL or level, NAT, inspection, create conn). Later packets: fast path.</li>
<li><code>show conn</code> = live flows with real addresses; flags U, I, O, B tell you the state.</li>
<li><code>show xlate</code> = real to mapped translations; PAT entries carry flags ri.</li>
<li>Default timeouts: conn 1:00:00, UDP 0:02:00, PAT xlate 0:00:30.</li>
<li>Clear conn or xlate after policy or NAT changes; "Deny TCP (no connection)" points to asymmetric routing.</li>
</ul></div>
`,hi:`
<p>Wapas security desk par chalo. Guard do notebooks rakhta hai. Pehli, <b>logbook</b>, har us insaan ki list hai jo bahar gaya aur abhi wapas nahi aaya, time aur destination ke saath; isi se wapas aane walon ko pehchana jaata hai. Doosri, <b>badge register</b>, list karti hai ki kaunsa visitor badge number kis employee ko diya gaya. ASA par yeh <b>connection table</b> aur <b>xlate (translation) table</b> hain. Agar aap yeh do tables padh sakte ho, to aap ASA ka lagbhag har behaviour samjha sakte ho.</p>

<h3>ASA ek packet ko kaise handle karta hai</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="ASA packet flow">
<rect x="10" y="20" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="65" y="45" text-anchor="middle" class="svg-ink" font-size="12">Packet aata hai</text>
<rect x="150" y="20" width="130" height="40" rx="8" fill="#fde68a"/><text x="215" y="45" text-anchor="middle" class="svg-ink" font-size="12">Existing conn?</text>
<line x1="120" y1="40" x2="150" y2="40" stroke="#64748b"/>
<rect x="320" y="20" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="395" y="45" text-anchor="middle" class="svg-ink" font-size="12">Haan: fast path</text>
<line x1="280" y1="40" x2="320" y2="40" stroke="#64748b"/>
<rect x="500" y="20" width="130" height="40" rx="8" fill="#e2e8f0"/><text x="565" y="45" text-anchor="middle" class="svg-ink" font-size="12">Translate, bhejo</text>
<line x1="470" y1="40" x2="500" y2="40" stroke="#64748b"/>
<line x1="215" y1="60" x2="215" y2="95" stroke="#64748b"/><text x="232" y="82" class="svg-muted" font-size="11">nahi</text>
<rect x="10" y="95" width="115" height="40" rx="8" fill="#bae6fd"/><text x="67" y="120" text-anchor="middle" class="svg-ink" font-size="12">Un-NAT, route</text>
<rect x="135" y="95" width="115" height="40" rx="8" fill="#bae6fd"/><text x="192" y="120" text-anchor="middle" class="svg-ink" font-size="12">ACL / level</text>
<rect x="260" y="95" width="115" height="40" rx="8" fill="#bae6fd"/><text x="317" y="120" text-anchor="middle" class="svg-ink" font-size="12">NAT rule</text>
<rect x="385" y="95" width="115" height="40" rx="8" fill="#bae6fd"/><text x="442" y="120" text-anchor="middle" class="svg-ink" font-size="12">Inspection</text>
<rect x="510" y="95" width="120" height="40" rx="8" fill="#ddd6fe"/><text x="570" y="120" text-anchor="middle" class="svg-ink" font-size="12">Conn banao</text>
<line x1="125" y1="115" x2="135" y2="115" stroke="#64748b"/><line x1="250" y1="115" x2="260" y2="115" stroke="#64748b"/><line x1="375" y1="115" x2="385" y2="115" stroke="#64748b"/><line x1="500" y1="115" x2="510" y2="115" stroke="#64748b"/>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Slow path: sirf naye flow ka pehla packet saare checks karta hai.</text>
<text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">Kisi bhi step par drop safar khatam kar deta hai; packet-tracer har step ko phase ki tarah dikhata hai.</text>
</svg><p class="cap">Naye flows ek baar slow path lete hain; flow ka har baad wala packet connection se match karke fast path leta hai.</p></div>
<ol>
<li><b>Connection lookup.</b> Kya yeh packet kisi existing connection ka hai? Agar haan, to yeh <b>fast path</b> leta hai: koi ACL check nahi, bas translation aur forwarding.</li>
<li>Agar nahi, to yeh <b>naya flow</b> hai aur slow path leta hai: agar destination mapped address hai to use un-translate karo, egress interface dhoondhne ke liye route lookup karo, <b>ACL ya security levels</b> check karo, <b>NAT rule</b> dhoondho aur translation banao, <b>inspection</b> chalao, aur aakhir mein <b>connection banao</b>.</li>
<li>TCP ke liye pehla packet SYN hona chahiye. Beech-flow ka packet jo kisi connection se match nahi karta, drop hota hai, aur isi se ASA <b>asymmetric routing</b> ko expose karta hai.</li>
</ol>

<h3>Connection table</h3>
<pre class="out">NK-ASA# show conn
3 in use, 12 most used
<span class="hl">TCP outside  8.8.8.8:80 inside  10.0.1.10:51544, idle 0:00:02, bytes 1843, flags UIO</span>
UDP outside  8.8.8.8:53 inside  10.0.1.10:60021, idle 0:00:01, bytes 128, flags -
TCP dmz  10.0.2.10:80 inside  10.0.1.50:51820, idle 0:00:09, bytes 5270, flags UIO</pre>
<p>Har line protocol, dono interfaces aur har side ke <b>real</b> addresses aur ports dikhati hai (translated wale nahi), connection kitni der se idle hai aur kitne bytes guzre. Sabse useful flags: <b>U</b> = up, <b>I</b> = inbound data dikha, <b>O</b> = outbound data dikha, <b>B</b> = initial SYN outside se aaya. <code>show conn detail</code> poora flag legend print karta hai. TCP line par "UIO" ka matlab hai data dono taraf gaya: connection healthy hai. Bina I ke atki TCP entry ka matlab hai requests bahar jaati hain lekin kuch wapas nahi aata.</p>

<h3>Xlate table</h3>
<pre class="out">NK-ASA# show xlate
2 in use, 5 most used
Flags: D - DNS, e - extended, I - identity, i - dynamic, r - portmap,
       s - static, T - twice, N - net-to-net
<span class="hl">TCP PAT from inside:10.0.1.10/51544 to outside:203.0.113.2/51544 flags ri idle 0:00:02 timeout 0:00:30</span>
UDP PAT from inside:10.0.1.10/60021 to outside:203.0.113.2/60021 flags ri idle 0:00:01 timeout 0:00:30</pre>
<p>Yahan PC1 ka port 51544 outside interface address 203.0.113.2, port 51544 mein translate hua hai. Flags <b>ri</b> = portmap (PAT) aur dynamic. ASA original port rakhta hai jab woh free ho aur free na ho to doosra chunta hai.</p>

<h3>Timeouts aur clearing</h3>
<pre class="out">NK-ASA# show running-config all timeout
timeout xlate 3:00:00
<span class="hl">timeout pat-xlate 0:00:30</span>
<span class="hl">timeout conn 1:00:00 half-closed 0:10:00 udp 0:02:00 sctp 0:02:00 icmp 0:00:02</span>
...(trimmed)</pre>
<p>Idle TCP connections 1 ghante baad hat jaate hain, UDP 2 minute baad, aur PAT translation apne aakhri connection ke band hone ke 30 second baad. Policy ya NAT change ke baad, existing flows apna purana treatment tab tak rakhte hain jab tak woh khatam na hon ya aap unhe hata na do:</p>
<pre class="code"><span class="c">! ek host ke connections hatao</span>
clear conn address 10.0.1.10
<span class="c">! translations (aur unke connections) hatao</span>
clear xlate
<span class="c">! sirf count</span>
show conn count</pre>

<div class="eg"><p><b>Worked example.</b> PC1 8.8.8.8 par web page kholta hai. Pehla SYN inside par aata hai: koi connection nahi hai, isliye slow path. Route lookup kehta hai outside. Level 100 se 0: allowed. NAT rule INSIDE-NET match hota hai: xlate 10.0.1.10/51544 se 203.0.113.2/51544. Connection bana. 8.8.8.8 se SYN-ACK outside par aata hai, connection se match hota hai, 10.0.1.10 mein un-translate hota hai aur forward ho jaata hai, bina kisi level ya ACL check ke. <code>show conn</code> flags UIO ke saath ek line dikhata hai aur <code>show xlate</code> flags ri ke saath ek PAT line.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> <code>show conn</code> padh kar public address 203.0.113.2 dekhne ki umeed karna: conn real addresses dikhata hai, xlate translations dikhata hai. NAT rule badalna aur bina <code>clear xlate</code> ke turant test karna: purani translations hi jeet'ti hain. Busy production firewall par bina filter ke <code>clear conn</code> chalana: har user ka session drop ho jaata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Replies isliye allow hote hain kyunki woh <b>connection table</b> se match karte hain, security level ya ACL ki wajah se nahi. Aur fast path ACL skip karta hai, isiliye deny rule jodne se pehle se established flow tab tak nahi rukta jab tak aap use clear na karo.</p></div>

<div class="scn"><h4>Web app jo do minute baad freeze ho jaata tha</h4><p>Users ki shikayat thi ki internal reporting app ka login session har kuch minute mein drop ho jaata tha. Syslog mein dikha <code>%ASA-6-106015: Deny TCP (no connection) from 10.0.1.10/51544 to 10.20.5.20/443 flags ACK on interface inside</code>. ASA ke paas us flow ka koi connection nahi tha, kyunki SYN ek alag raaste se gaya tha: ek naye core route ne traffic ka kuch hissa ASA ke bagal se bhej diya. Routing theek karne se, taaki dono directions ASA se guzrein, errors hat gaye.</p><p><b>Seekh:</b> "Deny TCP (no connection)" asymmetric routing ya timeout ho chuke connection ki pehchaan hai.</p></div>

<div class="iv"><p class="q">"show conn aur show xlate mein kya farak hai?"</p><p>Strong answer: <code>show conn</code> stateful connection table hai: har live flow real addresses, ports, idle time, bytes aur flags ke saath; isi se replies andar aa paate hain. <code>show xlate</code> NAT/PAT translations list karta hai, real se mapped. Ek flow ke paas aam taur par dono hote hain, lekin bina NAT wale flow ka connection hota hai aur xlate nahi. Fast path vs slow path, timeouts (conn 1 ghanta, PAT 30 second) aur changes ke baad <code>clear conn</code>/<code>clear xlate</code> mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehla packet: slow path (route, ACL ya level, NAT, inspection, conn banao). Baad ke packets: fast path.</li>
<li><code>show conn</code> = real addresses ke saath live flows; flags U, I, O, B state batate hain.</li>
<li><code>show xlate</code> = real se mapped translations; PAT entries par flags ri hote hain.</li>
<li>Default timeouts: conn 1:00:00, UDP 0:02:00, PAT xlate 0:00:30.</li>
<li>Policy ya NAT changes ke baad conn ya xlate clear karo; "Deny TCP (no connection)" asymmetric routing ki taraf ishara karta hai.</li>
</ul></div>
`}};export{e as default};