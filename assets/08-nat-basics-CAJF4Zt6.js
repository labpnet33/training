var e={id:`nat`,h:{en:`NAT basics for firewalls`,hi:`Firewalls ke liye NAT basics`},body:{en:`
<p>A company has one reception phone number. When an employee calls a supplier, the supplier sees the reception number, not the employee's desk extension. When the supplier calls back, the receptionist remembers who made the call and transfers it. <b>Network Address Translation (NAT)</b> does the same for IP addresses, and on the internet edge the firewall is almost always the "receptionist". You met NAT in CCNA on routers; here we look at it through the firewall's eyes.</p>

<h3>The words the ASA uses</h3>
<dl class="terms">
<dt>Real address</dt><dd>The address the host actually has (PC1 is 10.0.1.10).</dd>
<dt>Mapped address</dt><dd>The address it is translated to (203.0.113.2).</dd>
<dt>Translation (xlate)</dt><dd>A table entry linking real and mapped, shown with <code>show xlate</code>. Each connection in <code>show conn</code> points to one.</dd>
<dt>Dynamic PAT</dt><dd>Many real hosts share one mapped IP, told apart by port (also called NAT overload).</dd>
<dt>Dynamic NAT</dt><dd>Real hosts borrow addresses from a pool of mapped IPs, one-to-one while in use.</dd>
<dt>Static NAT</dt><dd>A permanent one-to-one mapping, needed for servers the internet must reach.</dd>
<dt>Identity NAT</dt><dd>Translating an address to itself, used to exempt traffic (for example site-to-site VPN) from other NAT rules.</dd>
</dl>

<h3>How the lab translates</h3>
<pre class="code"><span class="c">! Object (auto) NAT: inside and DMZ hide behind the outside interface</span>
object network INSIDE-NET
 subnet 10.0.1.0 255.255.255.0
 nat (inside,outside) dynamic interface
object network DMZ-NET
 subnet 10.0.2.0 255.255.255.0
 nat (dmz,outside) dynamic interface</pre>
<p><code>dynamic interface</code> means PAT to whatever address the outside interface has (203.0.113.2). When PC1 opens a connection, the ASA keeps the source port if it is free, or picks another, and records the mapping:</p>
<pre class="out">NK-ASA# show xlate
1 in use, 2 most used
Flags: D - DNS, e - extended, I - identity, i - dynamic, r - portmap,
       s - static, T - twice, N - net-to-net
<span class="hl">TCP PAT from inside:10.0.1.10/51544 to outside:203.0.113.2/51544 flags ri idle 0:00:04 timeout 0:00:30</span></pre>
<p>The flags <b>r</b> (portmap, meaning PAT) and <b>i</b> (dynamic) tell you what kind of translation it is. The 30-second timeout starts after the last connection using it closes.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="PAT on the firewall">
<rect x="10" y="20" width="150" height="34" rx="8" fill="#bbf7d0"/><text x="85" y="42" text-anchor="middle" class="svg-ink" font-size="12">10.0.1.10 : 51544</text>
<rect x="10" y="70" width="150" height="34" rx="8" fill="#bbf7d0"/><text x="85" y="92" text-anchor="middle" class="svg-ink" font-size="12">10.0.1.50 : 51544</text>
<rect x="10" y="120" width="150" height="34" rx="8" fill="#fde68a"/><text x="85" y="142" text-anchor="middle" class="svg-ink" font-size="12">10.0.2.10 : 40022</text>
<rect x="230" y="40" width="150" height="100" rx="10" fill="#fed7aa"/><text x="305" y="80" text-anchor="middle" class="svg-ink" font-size="13">NK-ASA</text><text x="305" y="100" text-anchor="middle" class="svg-muted" font-size="12">xlate table</text>
<line x1="160" y1="37" x2="230" y2="70" stroke="#64748b"/><line x1="160" y1="87" x2="230" y2="90" stroke="#64748b"/><line x1="160" y1="137" x2="230" y2="110" stroke="#64748b"/>
<rect x="450" y="20" width="180" height="34" rx="8" fill="#bae6fd"/><text x="540" y="42" text-anchor="middle" class="svg-ink" font-size="12">203.0.113.2 : 51544</text>
<rect x="450" y="70" width="180" height="34" rx="8" fill="#bae6fd"/><text x="540" y="92" text-anchor="middle" class="svg-ink" font-size="12">203.0.113.2 : 12001</text>
<rect x="450" y="120" width="180" height="34" rx="8" fill="#bae6fd"/><text x="540" y="142" text-anchor="middle" class="svg-ink" font-size="12">203.0.113.2 : 40022</text>
<line x1="380" y1="70" x2="450" y2="37" stroke="#64748b"/><line x1="380" y1="90" x2="450" y2="87" stroke="#64748b"/><line x1="380" y1="110" x2="450" y2="137" stroke="#64748b"/>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Same source port in use? The ASA picks a different mapped port.</text>
</svg><p class="cap">Dynamic PAT: many real hosts share the outside address, told apart by the mapped port.</p></div>

<h3>Publishing a server: static NAT plus an ACL</h3>
<p>PAT alone only works for connections that start inside. To let the internet reach the DMZ web server, you need a permanent mapping <b>and</b> a rule, because outside (0) to dmz (50) is low to high:</p>
<pre class="code"><span class="c">! Static NAT for the web server</span>
object network WEB-SRV
 host 10.0.2.10
 nat (dmz,outside) static 203.0.113.3
<span class="c">! The ACL permits the REAL address, not the mapped one</span>
access-list OUTSIDE-IN extended permit tcp any host 10.0.2.10 eq www
access-group OUTSIDE-IN in interface outside</pre>
<p>That comment is the single most tested ASA NAT fact: since ASA 8.3, <b>interface ACLs use the real (untranslated) IP address</b>. The ASA un-translates the destination first, then checks the ACL. Writing the public 203.0.113.3 in the ACL is a classic migration bug; the module sec-asa-acl calls it "the real-IP rule".</p>

<h3>Object NAT and twice NAT (a preview)</h3>
<p>The ASA has two ways to write NAT. <b>Object NAT</b> (auto NAT) sits inside a network object and translates only the source, as above. <b>Twice NAT</b> (manual NAT) is a separate rule that can match and translate both source and destination, used for policy NAT and VPN exemptions. They are evaluated in order: section 1 (manual rules), section 2 (object rules, statics before dynamics), section 3 (manual rules marked after-auto). Details and practice come in the sec-asa-nat module.</p>

<h3>NAT is not a security control</h3>
<p>PAT has a side effect that people mistake for security: an unsolicited packet from the internet to 203.0.113.2 has no translation to follow, so it goes nowhere. But the protection actually comes from the <b>stateful policy</b>, not from NAT. IPv6 networks usually use no NAT at all and are just as protected by a stateful firewall. Hiding addresses slows reconnaissance a little; it does not replace access control.</p>

<div class="eg"><p><b>Worked example.</b> PARTNER (198.51.100.10) runs <code>curl 203.0.113.2</code>. There is no static NAT for 203.0.113.2 port 80, no existing connection, and outside (0) to anything higher is denied. The ASA logs <code>%ASA-2-106001: Inbound TCP connection denied from 198.51.100.10/40001 to 203.0.113.2/80 flags SYN on interface outside</code>. If you later add the WEB-SRV static and ACL above, PARTNER can reach 203.0.113.3, and <code>show xlate</code> shows a line with flag <b>s</b> (static).</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting the NAT for a new internal subnet. Users in 10.0.3.0/24 can reach the DMZ but not the internet: their traffic leaves with a private source and replies never return. <code>show xlate</code> shows no entries for them; add the subnet to an object NAT rule.</p></div>

<div class="exam"><p><b>Exam trap.</b> On ASA 8.3 and later, ACLs reference the <b>real</b> IP, never the mapped IP. And "NAT provides security" is a wrong answer; the stateful firewall provides the security.</p></div>

<div class="scn"><h4>Everyone lost the internet at 9:05</h4><p>At 9:05 on a Monday, users reported random websites failing. <code>show xlate count</code> was at tens of thousands and syslog showed PAT port allocation failures for the interface address. A new backup agent was opening thousands of short connections per minute to a cloud service, exhausting ports on the single outside address. The team moved backup traffic to its own PAT pool of additional public addresses from the ISP block and rate-limited the agent.</p><p><b>Lesson:</b> PAT has a finite port budget per mapped address; big flows need their own addresses.</p></div>

<div class="iv"><p class="q">"On an ASA, why can't you write the public IP of a server in the outside ACL?"</p><p>Since 8.3 the ASA un-translates the destination before the ACL check, so the ACL must reference the real (private) address and the service port. The static NAT publishes the server; the ACL, using the real IP, allows the traffic. Add that <code>packet-tracer</code> shows the UN-NAT phase before the ACCESS-LIST phase, which proves it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Real vs mapped addresses; <code>show xlate</code> shows translations, <code>show conn</code> the sessions using them.</li>
<li>Dynamic PAT lets many hosts share one address; static NAT publishes servers.</li>
<li>Publishing a server needs static NAT plus an ACL, because outside to DMZ is low to high.</li>
<li>ASA 8.3+ ACLs always use the real IP address.</li>
<li>NAT is not security; the stateful policy is.</li>
</ul></div>
`,hi:`
<p>Ek company ka ek reception phone number hai. Jab koi employee supplier ko call karta hai, supplier ko reception number dikhta hai, employee ka desk extension nahi. Jab supplier wapas call karta hai, receptionist yaad rakhti hai ki call kisne kiya tha aur transfer kar deti hai. <b>Network Address Translation (NAT)</b> IP addresses ke liye yahi karta hai, aur internet edge par firewall lagbhag hamesha "receptionist" hota hai. Aapne CCNA mein routers par NAT dekha tha; yahan hum use firewall ki nazar se dekhte hain.</p>

<h3>ASA ke use kiye words</h3>
<dl class="terms">
<dt>Real address</dt><dd>Woh address jo host ke paas asal mein hai (PC1 10.0.1.10 hai).</dd>
<dt>Mapped address</dt><dd>Woh address jismein translate hota hai (203.0.113.2).</dd>
<dt>Translation (xlate)</dt><dd>Real aur mapped ko jodne wali table entry, <code>show xlate</code> se dikhti hai. <code>show conn</code> ka har connection ek xlate ki taraf point karta hai.</dd>
<dt>Dynamic PAT</dt><dd>Bahut saare real hosts ek mapped IP share karte hain, port se alag pehchaane jaate hain (NAT overload bhi kehte hain).</dd>
<dt>Dynamic NAT</dt><dd>Real hosts mapped IPs ke pool se addresses udhaar lete hain, use ke dauraan one-to-one.</dd>
<dt>Static NAT</dt><dd>Permanent one-to-one mapping, un servers ke liye zaroori jin tak internet ko pahunchna hai.</dd>
<dt>Identity NAT</dt><dd>Address ko khud mein hi translate karna, traffic ko (jaise site-to-site VPN) doosre NAT rules se exempt karne ke liye.</dd>
</dl>

<h3>Lab kaise translate karta hai</h3>
<pre class="code"><span class="c">! Object (auto) NAT: inside aur DMZ outside interface ke peeche chhupte hain</span>
object network INSIDE-NET
 subnet 10.0.1.0 255.255.255.0
 nat (inside,outside) dynamic interface
object network DMZ-NET
 subnet 10.0.2.0 255.255.255.0
 nat (dmz,outside) dynamic interface</pre>
<p><code>dynamic interface</code> ka matlab hai outside interface ka jo bhi address ho (203.0.113.2) usmein PAT. Jab PC1 connection kholta hai, ASA source port free ho to wahi rakhta hai, warna koi aur chunta hai, aur mapping record karta hai:</p>
<pre class="out">NK-ASA# show xlate
1 in use, 2 most used
Flags: D - DNS, e - extended, I - identity, i - dynamic, r - portmap,
       s - static, T - twice, N - net-to-net
<span class="hl">TCP PAT from inside:10.0.1.10/51544 to outside:203.0.113.2/51544 flags ri idle 0:00:04 timeout 0:00:30</span></pre>
<p>Flags <b>r</b> (portmap, yaani PAT) aur <b>i</b> (dynamic) batate hain ki yeh kis tarah ka translation hai. 30-second timeout use karne wale aakhri connection ke band hone ke baad shuru hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Firewall par PAT">
<rect x="10" y="20" width="150" height="34" rx="8" fill="#bbf7d0"/><text x="85" y="42" text-anchor="middle" class="svg-ink" font-size="12">10.0.1.10 : 51544</text>
<rect x="10" y="70" width="150" height="34" rx="8" fill="#bbf7d0"/><text x="85" y="92" text-anchor="middle" class="svg-ink" font-size="12">10.0.1.50 : 51544</text>
<rect x="10" y="120" width="150" height="34" rx="8" fill="#fde68a"/><text x="85" y="142" text-anchor="middle" class="svg-ink" font-size="12">10.0.2.10 : 40022</text>
<rect x="230" y="40" width="150" height="100" rx="10" fill="#fed7aa"/><text x="305" y="80" text-anchor="middle" class="svg-ink" font-size="13">NK-ASA</text><text x="305" y="100" text-anchor="middle" class="svg-muted" font-size="12">xlate table</text>
<line x1="160" y1="37" x2="230" y2="70" stroke="#64748b"/><line x1="160" y1="87" x2="230" y2="90" stroke="#64748b"/><line x1="160" y1="137" x2="230" y2="110" stroke="#64748b"/>
<rect x="450" y="20" width="180" height="34" rx="8" fill="#bae6fd"/><text x="540" y="42" text-anchor="middle" class="svg-ink" font-size="12">203.0.113.2 : 51544</text>
<rect x="450" y="70" width="180" height="34" rx="8" fill="#bae6fd"/><text x="540" y="92" text-anchor="middle" class="svg-ink" font-size="12">203.0.113.2 : 12001</text>
<rect x="450" y="120" width="180" height="34" rx="8" fill="#bae6fd"/><text x="540" y="142" text-anchor="middle" class="svg-ink" font-size="12">203.0.113.2 : 40022</text>
<line x1="380" y1="70" x2="450" y2="37" stroke="#64748b"/><line x1="380" y1="90" x2="450" y2="87" stroke="#64748b"/><line x1="380" y1="110" x2="450" y2="137" stroke="#64748b"/>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Same source port pehle se use mein? ASA alag mapped port chunta hai.</text>
</svg><p class="cap">Dynamic PAT: bahut saare real hosts outside address share karte hain, mapped port se alag pehchaane jaate hain.</p></div>

<h3>Server publish karna: static NAT plus ACL</h3>
<p>Akela PAT sirf un connections ke liye kaam karta hai jo inside se shuru hote hain. Internet ko DMZ web server tak pahunchane ke liye aapko permanent mapping <b>aur</b> rule dono chahiye, kyunki outside (0) se dmz (50) low se high hai:</p>
<pre class="code"><span class="c">! Web server ke liye static NAT</span>
object network WEB-SRV
 host 10.0.2.10
 nat (dmz,outside) static 203.0.113.3
<span class="c">! ACL REAL address permit karta hai, mapped nahi</span>
access-list OUTSIDE-IN extended permit tcp any host 10.0.2.10 eq www
access-group OUTSIDE-IN in interface outside</pre>
<p>Woh comment ASA NAT ka sabse zyada test hone wala fact hai: ASA 8.3 se, <b>interface ACLs real (untranslated) IP address use karte hain</b>. ASA pehle destination un-translate karta hai, phir ACL check karta hai. ACL mein public 203.0.113.3 likhna classic migration bug hai; module sec-asa-acl ise "real-IP rule" kehta hai.</p>

<h3>Object NAT aur twice NAT (ek preview)</h3>
<p>ASA mein NAT likhne ke do tareeke hain. <b>Object NAT</b> (auto NAT) network object ke andar baithta hai aur sirf source translate karta hai, jaise upar. <b>Twice NAT</b> (manual NAT) ek alag rule hai jo source aur destination dono match aur translate kar sakta hai, policy NAT aur VPN exemptions ke liye use hota hai. Inka evaluation order mein hota hai: section 1 (manual rules), section 2 (object rules, statics dynamics se pehle), section 3 (after-auto marked manual rules). Details aur practice sec-asa-nat module mein aate hain.</p>

<h3>NAT security control nahi hai</h3>
<p>PAT ka ek side effect hai jise log security samajh lete hain: internet se 203.0.113.2 par aaye bina bulaye packet ke paas follow karne ko koi translation nahi hota, isliye woh kahin nahi jaata. Lekin protection asal mein <b>stateful policy</b> se aati hai, NAT se nahi. IPv6 networks aam taur par bilkul NAT use nahi karte aur stateful firewall se utne hi protected hote hain. Addresses chhupana reconnaissance ko thoda slow karta hai; access control ki jagah nahi leta.</p>

<div class="eg"><p><b>Worked example.</b> PARTNER (198.51.100.10) <code>curl 203.0.113.2</code> chalata hai. 203.0.113.2 port 80 ke liye koi static NAT nahi, koi existing connection nahi, aur outside (0) se kisi bhi higher level par denied hai. ASA log karta hai <code>%ASA-2-106001: Inbound TCP connection denied from 198.51.100.10/40001 to 203.0.113.2/80 flags SYN on interface outside</code>. Agar aap baad mein upar wala WEB-SRV static aur ACL jodte ho, to PARTNER 203.0.113.3 tak pahunch sakta hai, aur <code>show xlate</code> flag <b>s</b> (static) wali line dikhata hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Naye internal subnet ke liye NAT bhool jaana. 10.0.3.0/24 ke users DMZ tak pahunch sakte hain lekin internet tak nahi: unka traffic private source ke saath bahar jaata hai aur replies kabhi wapas nahi aate. <code>show xlate</code> unke liye koi entry nahi dikhata; subnet ko object NAT rule mein jodo.</p></div>

<div class="exam"><p><b>Exam trap.</b> ASA 8.3 aur baad mein, ACLs <b>real</b> IP reference karte hain, kabhi mapped IP nahi. Aur "NAT security deta hai" galat answer hai; security stateful firewall deta hai.</p></div>

<div class="scn"><h4>9:05 par sabka internet chala gaya</h4><p>Monday 9:05 par users ne report kiya ki random websites fail ho rahi hain. <code>show xlate count</code> das hazaaron mein tha aur syslog interface address ke liye PAT port allocation failures dikha raha tha. Ek naya backup agent ek cloud service ke liye har minute hazaaron chhote connections khol raha tha, single outside address ke ports khatam kar raha tha. Team ne backup traffic ko ISP block ke additional public addresses wale apne PAT pool par shift kiya aur agent ko rate-limit kiya.</p><p><b>Seekh:</b> PAT ka har mapped address par port budget seemit hai; bade flows ko apne addresses chahiye.</p></div>

<div class="iv"><p class="q">"ASA par outside ACL mein server ka public IP kyun nahi likh sakte?"</p><p>8.3 se ASA ACL check se pehle destination un-translate karta hai, isliye ACL ko real (private) address aur service port reference karna chahiye. Static NAT server ko publish karta hai; real IP use karta ACL traffic allow karta hai. Jodo ki <code>packet-tracer</code> ACCESS-LIST phase se pehle UN-NAT phase dikhata hai, jo ise prove karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Real vs mapped addresses; <code>show xlate</code> translations dikhata hai, <code>show conn</code> unhe use karne wale sessions.</li>
<li>Dynamic PAT bahut hosts ko ek address share karne deta hai; static NAT servers publish karta hai.</li>
<li>Server publish karne ke liye static NAT plus ACL chahiye, kyunki outside se DMZ low se high hai.</li>
<li>ASA 8.3+ ACLs hamesha real IP address use karte hain.</li>
<li>NAT security nahi hai; stateful policy hai.</li>
</ul></div>
`}};export{e as default};