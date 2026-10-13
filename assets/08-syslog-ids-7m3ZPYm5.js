var e={id:`syslog-ids`,h:{en:`Syslog message IDs every firewall engineer should know`,hi:`Woh syslog message IDs jo har firewall engineer ko pata hone chahiye`},body:{en:`
<p>Hospital staff do not read a full medical report to know what is going on with a patient; they recognise codes on the monitor at a glance. Experienced firewall engineers read ASA syslog the same way. They do not need to read "Deny tcp src outside..." word by word; they see <b>106023</b> and already know: an access-group denied a new flow, and the message names which one. This chapter is your code book. Learn the IDs by group, because the first three digits tell you the family.</p>

<h3>Anatomy of a message</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Syslog message anatomy">
<rect x="10" y="30" width="150" height="40" rx="6" fill="#e2e8f0"/><text x="85" y="55" text-anchor="middle" class="svg-ink" font-size="12">Sep 30 2026 10:14:02</text>
<rect x="168" y="30" width="60" height="40" rx="6" fill="#bae6fd"/><text x="198" y="55" text-anchor="middle" class="svg-ink" font-size="13">%ASA</text>
<rect x="236" y="30" width="40" height="40" rx="6" fill="#fde68a"/><text x="256" y="55" text-anchor="middle" class="svg-ink" font-size="13">4</text>
<rect x="284" y="30" width="80" height="40" rx="6" fill="#fed7aa"/><text x="324" y="55" text-anchor="middle" class="svg-ink" font-size="13">106023</text>
<rect x="372" y="30" width="258" height="40" rx="6" fill="#bbf7d0"/><text x="501" y="55" text-anchor="middle" class="svg-ink" font-size="12">Deny tcp src ... by access-group</text>
<text x="85" y="95" text-anchor="middle" class="svg-muted" font-size="12">timestamp (if enabled)</text>
<text x="198" y="95" text-anchor="middle" class="svg-muted" font-size="12">facility</text>
<text x="256" y="95" text-anchor="middle" class="svg-muted" font-size="12">severity</text>
<text x="324" y="95" text-anchor="middle" class="svg-muted" font-size="12">message ID</text>
<text x="501" y="95" text-anchor="middle" class="svg-muted" font-size="12">text with the details</text>
<text x="320" y="135" text-anchor="middle" class="svg-accent" font-size="12">Severity 0 (emergencies) to 7 (debugging); a lower number is more severe</text>
</svg><p class="cap">Every ASA message: optional timestamp, %ASA, severity, six-digit ID, then the text.</p></div>

<h3>Deny messages (106xxx)</h3>
<table class="cmp"><tr><th>ID and level</th><th>Meaning</th><th>Think</th></tr>
<tr><td><b>106023</b> (4)</td><td>A flow was denied by an interface or global ACL; the message names the access-group.</td><td>Policy. Find the ACL, decide whether a permit is justified.</td></tr>
<tr><td><b>106001</b> (2)</td><td>Inbound TCP connection denied, no ACL applied: security levels refused it (or it was TCP to the box itself on a port it does not serve).</td><td>Lower to higher security without an ACL.</td></tr>
<tr><td><b>106006</b> (2)</td><td>Deny inbound UDP, same situation for UDP.</td><td>As 106001.</td></tr>
<tr><td><b>106014</b> (3)</td><td>Deny inbound ICMP (no ACL, or an echo reply without ICMP inspection).</td><td>Often a missing <code>inspect icmp</code>.</td></tr>
<tr><td><b>106015</b> (6)</td><td>Deny TCP (no connection): a non-SYN packet with no matching connection.</td><td>Asymmetric routing, timed-out or cleared session.</td></tr>
<tr><td><b>106016</b> (2)</td><td>Deny IP spoof: the source address is impossible on that interface (for example the ASA's own address).</td><td>Spoofing or a misconfiguration.</td></tr>
<tr><td><b>106021</b> (1)</td><td>Deny by reverse path check (uRPF).</td><td>Spoofed source or asymmetric path.</td></tr>
<tr><td><b>106100</b> (6 by default)</td><td>An ACE with the <code>log</code> keyword was hit; shows permitted or denied and a hit count per interval.</td><td>Audit trail for specific rules.</td></tr></table>

<h3>Connection life cycle (302xxx)</h3>
<table class="cmp"><tr><th>ID</th><th>Meaning</th></tr>
<tr><td><b>302013 / 302014</b> (6)</td><td>Built / Teardown TCP connection.</td></tr>
<tr><td><b>302015 / 302016</b> (6)</td><td>Built / Teardown UDP connection.</td></tr>
<tr><td><b>302020 / 302021</b> (6)</td><td>Built / Teardown ICMP connection.</td></tr></table>
<pre class="out">%ASA-6-302013: Built inbound TCP connection 9024 for outside:198.51.100.10/55191 (198.51.100.10/55191) to <span class="hl">dmz:10.0.2.10/443 (203.0.113.3/443)</span>
%ASA-6-302014: Teardown TCP connection 9024 for outside:198.51.100.10/55191 to dmz:10.0.2.10/443 duration 0:00:05 bytes 600 <span class="hl">TCP FINs</span></pre>
<p>In a Built message each end appears as <code>interface:real/port (mapped/port)</code>, so one line shows both sides of NAT. The number (9024) is the connection ID; search for it to find the matching teardown. The <b>teardown reason</b> at the end of 302014 is gold:</p>
<table class="cmp"><tr><th>Teardown reason</th><th>Meaning</th></tr>
<tr><td>TCP FINs</td><td>Normal close by both sides.</td></tr>
<tr><td>TCP Reset-I / TCP Reset-O</td><td>A reset came from the inside (higher-security) side / from the outside side.</td></tr>
<tr><td>SYN Timeout</td><td>No three-way handshake within 30 seconds: the server never answered.</td></tr>
<tr><td>Conn-timeout</td><td>The idle timer expired.</td></tr>
<tr><td>Xlate Clear</td><td>Removed by a clear command.</td></tr>
<tr><td>Deny Terminate</td><td>Terminated by application inspection.</td></tr></table>

<h3>Translations and to-the-box (305xxx, 710xxx, 313xxx)</h3>
<table class="cmp"><tr><th>ID and level</th><th>Meaning</th></tr>
<tr><td><b>305011</b> (6)</td><td>Built dynamic TCP, UDP or ICMP translation (PAT or dynamic NAT).</td></tr>
<tr><td><b>305012</b> (6)</td><td>Teardown dynamic translation.</td></tr>
<tr><td><b>305013</b> (5)</td><td>Asymmetric NAT rules matched for forward and reverse flows; denied due to NAT reverse path failure.</td></tr>
<tr><td><b>305006</b> (3)</td><td>Translation creation failed, for example an exhausted pool.</td></tr>
<tr><td><b>710003</b> (3)</td><td>TCP access to the ASA itself denied: the source is not in the <code>ssh</code> or <code>h&#116;tp</code> allow list for that interface.</td></tr>
<tr><td><b>710001 / 710002</b> (7)</td><td>TCP access to the ASA requested / permitted (debug level).</td></tr>
<tr><td><b>313001</b> (3)</td><td>ICMP to the ASA denied by its ICMP rules.</td></tr>
<tr><td><b>313004</b> (4)</td><td>ICMP denied: no matching session (a reply the ASA did not expect).</td></tr></table>

<h3>Health and admin</h3>
<p><b>411001 / 411002</b> (4): line protocol on an interface changed to up / down. <b>111008</b> (5): a user executed a command, useful for change audits. <b>605005</b> (6): an administrator login was permitted. <b>104001</b> (1): the unit switched to active, which you will meet in the failover module.</p>

<pre class="code"><span class="c">! find messages quickly in the buffer</span>
show logging | include 106023
show logging | include 10.0.2.10
show logging | include 302014.*SYN Timeout</pre>

<div class="eg"><p><b>Worked example.</b> After the NAT fix in the portal lab, the buffer shows <code>%ASA-4-106023: Deny tcp src outside:198.51.100.10/57160 dst dmz:10.0.2.10/443 by access-group "OUTSIDE_IN"</code>. Read it field by field: protocol tcp, source on outside, destination already the <b>real</b> 10.0.2.10 on dmz (so NAT now works), port 443, and the ACL that denied it: OUTSIDE_IN. The ACL permits only <code>www</code>. One message, one missing line: <code>permit tcp any object WEB eq h&#116;tps</code>.</p></div>

<div class="warn"><p><b>Common mistake.</b> Waiting for 302013 or 305011 with <code>logging buffered warnings</code> configured. Built and teardown messages are level 6 (informational); a warnings (4) buffer silently skips them. Deny 106023 at level 4 is visible, but you will never see the successful side.</p></div>

<div class="exam"><p><b>Exam trap.</b> 106023 = denied by an ACL (names the access-group); 106001 = denied with no ACL, by security levels. 302013 = TCP built, 302015 = UDP built, 305011 = dynamic translation built. 710003 is about management access to the ASA itself, not transit traffic.</p></div>

<div class="scn"><h4>Disconnected every hour</h4><p>Traders complained that a market-data client froze once an hour and needed a reconnect. Syslog showed 302014 for those sessions with <code>duration 1:00:03</code> and reason <code>Conn-timeout</code>. The application kept a TCP session open but sent nothing while markets were quiet, and the ASA's default 1-hour idle timer removed the connection. The next packet from the server then hit 106015 (no connection). The team added a class for that server in the policy map with a longer idle timeout, and asked the vendor to enable keepalives.</p><p><b>Lesson:</b> the teardown reason in 302014 turns "random disconnects" into a precise cause.</p></div>

<div class="iv"><p class="q">"Name some ASA syslog IDs you use when troubleshooting, and what they tell you."</p><p>106023 (denied by an access-group, names the ACL), 106001 (inbound TCP denied without an ACL), 106015 (TCP with no connection, asymmetric routing), 302013/302014 (TCP built and teardown, with the teardown reason), 302015/302020 (UDP and ICMP built), 305011 (dynamic translation built), 305013 (asymmetric NAT), 710003 (management access denied). Add that built and teardown messages are level 6, so the logging level must be informational to see them.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Format: %ASA-severity-ID: text; lower severity number = more severe.</li>
<li>106023 ACL deny; 106001/106006/106014 no-ACL denies; 106015 no connection.</li>
<li>302013/302014 TCP built/teardown; 302014's reason (TCP FINs, Reset-I/O, SYN Timeout, Conn-timeout) is the diagnosis.</li>
<li>305011 translation built; 305013 asymmetric NAT; 710003 management access denied.</li>
<li>Built and teardown are level 6: log at informational to see them.</li>
</ul></div>
`,hi:`
<p>Hospital staff ko mareez ka haal jaanne ke liye poori medical report nahi padhni padti; woh monitor par codes ek nazar mein pehchaan lete hain. Experienced firewall engineers ASA syslog bhi aise hi padhte hain. Unhe "Deny tcp src outside..." shabd dar shabd padhne ki zaroorat nahi; woh <b>106023</b> dekhte hain aur pehle se jaante hain: ek access-group ne naya flow deny kiya, aur message batata hai kaunsa. Yeh chapter aapki code book hai. IDs ko groups mein seekho, kyunki pehle teen digits family batate hain.</p>

<h3>Message ki banawat</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Syslog message anatomy">
<rect x="10" y="30" width="150" height="40" rx="6" fill="#e2e8f0"/><text x="85" y="55" text-anchor="middle" class="svg-ink" font-size="12">Sep 30 2026 10:14:02</text>
<rect x="168" y="30" width="60" height="40" rx="6" fill="#bae6fd"/><text x="198" y="55" text-anchor="middle" class="svg-ink" font-size="13">%ASA</text>
<rect x="236" y="30" width="40" height="40" rx="6" fill="#fde68a"/><text x="256" y="55" text-anchor="middle" class="svg-ink" font-size="13">4</text>
<rect x="284" y="30" width="80" height="40" rx="6" fill="#fed7aa"/><text x="324" y="55" text-anchor="middle" class="svg-ink" font-size="13">106023</text>
<rect x="372" y="30" width="258" height="40" rx="6" fill="#bbf7d0"/><text x="501" y="55" text-anchor="middle" class="svg-ink" font-size="12">Deny tcp src ... by access-group</text>
<text x="85" y="95" text-anchor="middle" class="svg-muted" font-size="12">timestamp (enable ho to)</text>
<text x="198" y="95" text-anchor="middle" class="svg-muted" font-size="12">facility</text>
<text x="256" y="95" text-anchor="middle" class="svg-muted" font-size="12">severity</text>
<text x="324" y="95" text-anchor="middle" class="svg-muted" font-size="12">message ID</text>
<text x="501" y="95" text-anchor="middle" class="svg-muted" font-size="12">details wala text</text>
<text x="320" y="135" text-anchor="middle" class="svg-accent" font-size="12">Severity 0 (emergencies) se 7 (debugging); kam number zyada gambhir</text>
</svg><p class="cap">Har ASA message: optional timestamp, %ASA, severity, chhe digit ki ID, phir text.</p></div>

<h3>Deny messages (106xxx)</h3>
<table class="cmp"><tr><th>ID aur level</th><th>Matlab</th><th>Socho</th></tr>
<tr><td><b>106023</b> (4)</td><td>Interface ya global ACL ne flow deny kiya; message access-group ka naam batata hai.</td><td>Policy. ACL dhoondho, decide karo ki permit justified hai ya nahi.</td></tr>
<tr><td><b>106001</b> (2)</td><td>Inbound TCP connection denied, koi ACL lagi nahi: security levels ne mana kiya (ya box ke khud ke us port par TCP jo woh serve nahi karta).</td><td>Bina ACL ke lower se higher security.</td></tr>
<tr><td><b>106006</b> (2)</td><td>Deny inbound UDP, UDP ke liye wahi situation.</td><td>106001 jaisa.</td></tr>
<tr><td><b>106014</b> (3)</td><td>Deny inbound ICMP (koi ACL nahi, ya ICMP inspection ke bina echo reply).</td><td>Aksar missing <code>inspect icmp</code>.</td></tr>
<tr><td><b>106015</b> (6)</td><td>Deny TCP (no connection): bina matching connection ka non-SYN packet.</td><td>Asymmetric routing, timeout ya clear hua session.</td></tr>
<tr><td><b>106016</b> (2)</td><td>Deny IP spoof: source address us interface par namumkin hai (jaise ASA ka khud ka address).</td><td>Spoofing ya misconfiguration.</td></tr>
<tr><td><b>106021</b> (1)</td><td>Reverse path check (uRPF) se deny.</td><td>Spoofed source ya asymmetric path.</td></tr>
<tr><td><b>106100</b> (default 6)</td><td><code>log</code> keyword wali ACE hit hui; permitted ya denied aur har interval ka hit count dikhata hai.</td><td>Specific rules ka audit trail.</td></tr></table>

<h3>Connection life cycle (302xxx)</h3>
<table class="cmp"><tr><th>ID</th><th>Matlab</th></tr>
<tr><td><b>302013 / 302014</b> (6)</td><td>Built / Teardown TCP connection.</td></tr>
<tr><td><b>302015 / 302016</b> (6)</td><td>Built / Teardown UDP connection.</td></tr>
<tr><td><b>302020 / 302021</b> (6)</td><td>Built / Teardown ICMP connection.</td></tr></table>
<pre class="out">%ASA-6-302013: Built inbound TCP connection 9024 for outside:198.51.100.10/55191 (198.51.100.10/55191) to <span class="hl">dmz:10.0.2.10/443 (203.0.113.3/443)</span>
%ASA-6-302014: Teardown TCP connection 9024 for outside:198.51.100.10/55191 to dmz:10.0.2.10/443 duration 0:00:05 bytes 600 <span class="hl">TCP FINs</span></pre>
<p>Built message mein har end <code>interface:real/port (mapped/port)</code> ki tarah dikhta hai, isliye ek line NAT ke dono taraf dikhati hai. Number (9024) connection ID hai; matching teardown dhoondhne ke liye use search karo. 302014 ke end ka <b>teardown reason</b> sona hai:</p>
<table class="cmp"><tr><th>Teardown reason</th><th>Matlab</th></tr>
<tr><td>TCP FINs</td><td>Dono sides ne normal close kiya.</td></tr>
<tr><td>TCP Reset-I / TCP Reset-O</td><td>Reset inside (higher-security) side se aaya / outside side se.</td></tr>
<tr><td>SYN Timeout</td><td>30 second mein three-way handshake nahi hua: server ne kabhi jawab nahi diya.</td></tr>
<tr><td>Conn-timeout</td><td>Idle timer expire hua.</td></tr>
<tr><td>Xlate Clear</td><td>Clear command se hataya gaya.</td></tr>
<tr><td>Deny Terminate</td><td>Application inspection ne terminate kiya.</td></tr></table>

<h3>Translations aur to-the-box (305xxx, 710xxx, 313xxx)</h3>
<table class="cmp"><tr><th>ID aur level</th><th>Matlab</th></tr>
<tr><td><b>305011</b> (6)</td><td>Dynamic TCP, UDP ya ICMP translation bana (PAT ya dynamic NAT).</td></tr>
<tr><td><b>305012</b> (6)</td><td>Dynamic translation ka teardown.</td></tr>
<tr><td><b>305013</b> (5)</td><td>Forward aur reverse flows ke liye asymmetric NAT rules match hue; NAT reverse path failure ki wajah se denied.</td></tr>
<tr><td><b>305006</b> (3)</td><td>Translation banana fail hua, jaise exhausted pool.</td></tr>
<tr><td><b>710003</b> (3)</td><td>Khud ASA tak TCP access denied: source us interface ki <code>ssh</code> ya <code>h&#116;tp</code> allow list mein nahi hai.</td></tr>
<tr><td><b>710001 / 710002</b> (7)</td><td>ASA tak TCP access requested / permitted (debug level).</td></tr>
<tr><td><b>313001</b> (3)</td><td>ASA ko ICMP uske ICMP rules ne deny kiya.</td></tr>
<tr><td><b>313004</b> (4)</td><td>ICMP denied: koi matching session nahi (aisa reply jiski ASA ko umeed nahi thi).</td></tr></table>

<h3>Health aur admin</h3>
<p><b>411001 / 411002</b> (4): kisi interface ka line protocol up / down hua. <b>111008</b> (5): kisi user ne command chalayi, change audits ke liye kaam ki. <b>605005</b> (6): administrator login permit hua. <b>104001</b> (1): unit active par switch hua, jisse aap failover module mein miloge.</p>

<pre class="code"><span class="c">! buffer mein messages jaldi dhoondho</span>
show logging | include 106023
show logging | include 10.0.2.10
show logging | include 302014.*SYN Timeout</pre>

<div class="eg"><p><b>Worked example.</b> Portal lab mein NAT fix ke baad buffer <code>%ASA-4-106023: Deny tcp src outside:198.51.100.10/57160 dst dmz:10.0.2.10/443 by access-group "OUTSIDE_IN"</code> dikhata hai. Ise field dar field padho: protocol tcp, source outside par, destination pehle se <b>real</b> 10.0.2.10 dmz par (yaani NAT ab kaam karta hai), port 443, aur jis ACL ne deny kiya: OUTSIDE_IN. ACL sirf <code>www</code> permit karti hai. Ek message, ek missing line: <code>permit tcp any object WEB eq h&#116;tps</code>.</p></div>

<div class="warn"><p><b>Common galti.</b> <code>logging buffered warnings</code> configured hone par 302013 ya 305011 ka intezaar karna. Built aur teardown messages level 6 (informational) hain; warnings (4) buffer unhe chup chaap skip kar deta hai. Level 4 par deny 106023 dikhega, par successful side aapko kabhi nahi dikhegi.</p></div>

<div class="exam"><p><b>Exam trap.</b> 106023 = ACL se denied (access-group ka naam deta hai); 106001 = bina ACL ke, security levels se denied. 302013 = TCP built, 302015 = UDP built, 305011 = dynamic translation built. 710003 khud ASA ke management access ke baare mein hai, transit traffic ke baare mein nahi.</p></div>

<div class="scn"><h4>Har ghante disconnect</h4><p>Traders ne shikayat ki ki ek market-data client ghante mein ek baar freeze hota hai aur reconnect maangta hai. Syslog ne un sessions ke liye <code>duration 1:00:03</code> aur reason <code>Conn-timeout</code> ke saath 302014 dikhaya. Application ek TCP session khula rakhta tha par market shaant hone par kuch nahi bhejta tha, aur ASA ke default 1-ghante idle timer ne connection hata diya. Phir server ka agla packet 106015 (no connection) se takraya. Team ne policy map mein us server ke liye lambe idle timeout wali class jodi, aur vendor se keepalives enable karne ko kaha.</p><p><b>Seekh:</b> 302014 ka teardown reason "random disconnects" ko ek exact wajah mein badal deta hai.</p></div>

<div class="iv"><p class="q">"Troubleshooting mein aap kaunse ASA syslog IDs use karte ho, aur woh kya batate hain?"</p><p>106023 (access-group se denied, ACL ka naam batata hai), 106001 (bina ACL ke inbound TCP denied), 106015 (bina connection ka TCP, asymmetric routing), 302013/302014 (TCP built aur teardown, teardown reason ke saath), 302015/302020 (UDP aur ICMP built), 305011 (dynamic translation bana), 305013 (asymmetric NAT), 710003 (management access denied). Jodo ki built aur teardown messages level 6 hain, isliye unhe dekhne ke liye logging level informational hona chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Format: %ASA-severity-ID: text; kam severity number = zyada gambhir.</li>
<li>106023 ACL deny; 106001/106006/106014 bina ACL ke denies; 106015 no connection.</li>
<li>302013/302014 TCP built/teardown; 302014 ka reason (TCP FINs, Reset-I/O, SYN Timeout, Conn-timeout) hi diagnosis hai.</li>
<li>305011 translation bana; 305013 asymmetric NAT; 710003 management access denied.</li>
<li>Built aur teardown level 6 hain: unhe dekhne ke liye informational par log karo.</li>
</ul></div>
`}};export{e as default};