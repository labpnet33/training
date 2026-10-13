var e={id:`time`,h:{en:`Time services: NTP, PTP and NTS`,hi:`Time services: NTP, PTP aur NTS`},body:{en:`
<p>A railway network runs on time. Every station clock follows the master clock at headquarters, which itself follows an atomic standard. If one station's clock drifts by five minutes, trains are cleared onto the same track. Networks are no different: when every device agrees on the time, you can line up logs, trust certificates and authenticate users. The protocols that do this are <b>NTP</b> for everyday accuracy, <b>PTP</b> for extreme precision, and <b>NTS</b> for trustworthy, authenticated NTP.</p>

<h3>Why accurate time matters</h3>
<ul>
<li><b>Log correlation.</b> During an incident you compare firewall, switch and server logs. If clocks differ by minutes, the story makes no sense.</li>
<li><b>Security.</b> Kerberos (used by Active Directory) rejects logins when the client and server clocks differ by more than five minutes by default. TLS certificates look "not yet valid" or "expired" on a device with a wrong clock.</li>
<li><b>Operations.</b> Scheduled backups, SNMP and syslog timestamps, and billing records all depend on the clock.</li>
</ul>

<h3>NTP: Network Time Protocol</h3>
<p>NTP runs on <b>UDP 123</b>. Time flows down a hierarchy measured in <b>stratum</b> levels:</p>
<ul>
<li><b>Stratum 0</b>: the reference clock itself (GPS receiver, atomic clock). It is not on the network.</li>
<li><b>Stratum 1</b>: a server directly attached to a stratum 0 source.</li>
<li><b>Stratum 2, 3...</b>: each hop away from the reference adds one. A router that syncs to a stratum 2 server becomes stratum 3.</li>
<li><b>Stratum 16</b>: unsynchronised. Do not trust this clock.</li>
</ul>
<p>An NTP client exchanges timestamps with its server, measures the round-trip delay, and slowly adjusts its clock. Over the internet NTP is accurate to a few milliseconds; on a good LAN, to well under a millisecond. Best practice is to point devices at <b>at least three</b> internal time sources (or three upstream servers), so a single wrong clock can be outvoted.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="NTP stratum hierarchy">
<rect x="250" y="10" width="140" height="36" rx="8" fill="#fde68a"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Stratum 0: GPS</text>
<rect x="250" y="70" width="140" height="36" rx="8" fill="#fed7aa"/><text x="320" y="93" text-anchor="middle" class="svg-ink" font-size="13">Stratum 1 server</text>
<rect x="130" y="130" width="160" height="36" rx="8" fill="#bbf7d0"/><text x="210" y="153" text-anchor="middle" class="svg-ink" font-size="13">Stratum 2: SRV</text>
<rect x="350" y="130" width="160" height="36" rx="8" fill="#bbf7d0"/><text x="430" y="153" text-anchor="middle" class="svg-ink" font-size="13">Stratum 2: SRV-B</text>
<rect x="250" y="182" width="140" height="34" rx="8" fill="#bae6fd"/><text x="320" y="204" text-anchor="middle" class="svg-ink" font-size="13">Stratum 3: R1</text>
<line x1="320" y1="46" x2="320" y2="70" stroke="#64748b"/><line x1="300" y1="106" x2="220" y2="130" stroke="#64748b"/><line x1="340" y1="106" x2="420" y2="130" stroke="#64748b"/>
<line x1="210" y1="166" x2="300" y2="182" stroke="#64748b"/><line x1="430" y1="166" x2="340" y2="182" stroke="#64748b"/>
</svg><p class="cap">Each hop from the reference clock adds one to the stratum number.</p></div>

<h3>Configuring and verifying NTP on a router</h3>
<pre class="code">clock timezone IST 5 30
ntp server 10.0.20.10 prefer
ntp server 10.0.20.11
<span class="c">! Optional: log messages carry the synchronised time</span>
service timestamps log datetime msec localtime</pre>
<pre class="out">R1# show ntp status
<span class="hl">Clock is synchronized, stratum 3, reference is 10.0.20.10</span>
nominal freq is 250.0000 Hz, actual freq is 250.0003 Hz, precision is 2**10
clock offset is -0.4120 msec, root delay is 1.20 msec

R1# show ntp associations
  address         ref clock       st   when   poll reach  delay  offset   disp
<span class="hl">*~10.0.20.10      192.0.2.123      2     33     64   377  1.204  -0.412  1.021</span>
+~10.0.20.11      192.0.2.123      2     12     64   377  1.311  -0.389  1.110
 * sys.peer, # selected, + candidate, - outlyer, x falseticker, ~ configured</pre>
<p>The asterisk marks the server R1 is actually synchronised to. <b>reach 377</b> (octal) means the last eight polls all succeeded. A router with no upstream source can be made an authoritative source with <code>ntp master 3</code>, but that is only suitable for an isolated lab.</p>

<h3>PTP: Precision Time Protocol (IEEE 1588)</h3>
<p>Some systems need far better than a millisecond. <b>PTP</b> reaches <b>sub-microsecond</b> (down to nanoseconds) accuracy by using <b>hardware timestamping</b> in network interfaces, so software delays do not spoil the measurement. Its roles:</p>
<ul>
<li><b>Grandmaster clock</b>: the best clock in the domain, usually GPS-fed, chosen automatically by the Best Master Clock Algorithm (BMCA).</li>
<li><b>Boundary clock</b>: a switch that syncs to the grandmaster on one port and acts as a master on its other ports.</li>
<li><b>Transparent clock</b>: a switch that measures how long each PTP message spent inside it and corrects the timestamp.</li>
<li><b>Ordinary clock</b>: an end device that follows the master.</li>
</ul>
<p>PTP runs over UDP 319 (event messages) and 320 (general messages), or directly over Ethernet. It is used in 5G mobile networks, stock exchanges and trading (where regulation requires microsecond timestamps), broadcast studios and power grids.</p>

<h3>NTS: Network Time Security</h3>
<p>Classic NTP packets are not authenticated, so an attacker on the path could shift a device's clock and make certificates or logs meaningless. <b>NTS</b> (RFC 8915) fixes this. First, the client runs an <b>NTS Key Establishment</b> handshake over TLS on <b>TCP 4460</b> and receives keys and cookies. Then ordinary NTP packets on UDP 123 carry cryptographic authentication. NTS proves the time came from the real server and was not changed; it does not hide the time, which is not secret. It replaces the older approach of pre-shared symmetric keys (<code>ntp authenticate</code> with <code>ntp authentication-key</code>), and is supported by modern time daemons such as chrony.</p>

<div class="eg"><p><b>Worked example.</b> An engineer investigates a login at 02:14:07 in the VPN log. The firewall shows the session at 02:21:40 and the server at 02:13:59. Firewall offset: +7 minutes 33 seconds, so it is not using NTP. After pointing the firewall at 10.0.20.10 and 10.0.20.11, all three devices agree within 2 ms, and the next investigation takes minutes instead of hours.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Configuring only one NTP server: if it drifts, everything drifts with it. (2) An ACL or firewall blocking UDP 123, so the router stays at stratum 16 ("Clock is unsynchronized"). (3) Forgetting the time zone, so logs are "correct" in UTC but confuse the local team.</p></div>

<div class="exam"><p><b>Exam trap.</b> NTP = UDP 123, millisecond accuracy. PTP = IEEE 1588, sub-microsecond, hardware timestamping. NTS = authentication for NTP (TLS key exchange on TCP 4460). A lower stratum number means closer to the reference clock; stratum 16 means unsynchronised.</p></div>

<div class="scn"><h4>Nobody can log in after a power cut</h4><p>After a weekend power cut, users at a branch could not log in to their domain accounts: "The time difference between the client and server is too large." The branch server's battery-backed clock had reset and it had come up with the wrong date. It had no NTP configuration, so Kerberos tickets were rejected. The engineer configured the server and the branch router to use the HQ NTP servers; within minutes the clocks agreed and logins worked.</p><p><b>Lesson:</b> time is a dependency of authentication. Every device should follow NTP, from at least three sources where possible.</p></div>

<div class="iv"><p class="q">"What is NTP stratum, and when would you choose PTP instead of NTP?"</p><p>Strong answer: stratum is the distance from a reference clock: stratum 0 is the source (GPS, atomic), stratum 1 is directly attached, each hop adds one, and 16 means unsynchronised. NTP on UDP 123 gives millisecond accuracy, fine for logs and authentication. PTP (IEEE 1588) uses hardware timestamping and boundary/transparent clocks for sub-microsecond accuracy, needed in 5G, trading and broadcast. Add NTS for authenticated NTP.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Accurate time is needed for logs, Kerberos authentication and certificates.</li>
<li>NTP: UDP 123, stratum hierarchy, millisecond accuracy, use at least three sources.</li>
<li>PTP (IEEE 1588): hardware timestamps, grandmaster/boundary/transparent clocks, sub-microsecond.</li>
<li>NTS: TLS key exchange on TCP 4460, then authenticated NTP on UDP 123.</li>
<li>Verify with <code>show ntp status</code> and <code>show ntp associations</code> (look for the asterisk).</li>
</ul></div>
`,hi:`
<p>Railway network time par chalta hai. Har station ki ghadi headquarters ki master clock ko follow karti hai, jo khud ek atomic standard ko follow karti hai. Agar ek station ki ghadi paanch minute khisak jaaye, to trains ek hi track par bhej di jaati hain. Networks bhi alag nahi hain: jab har device time par agree karta hai, tab aap logs line up kar sakte ho, certificates par bharosa kar sakte ho aur users ko authenticate kar sakte ho. Yeh kaam karne wale protocols hain <b>NTP</b> roz ki accuracy ke liye, <b>PTP</b> extreme precision ke liye, aur <b>NTS</b> trustworthy, authenticated NTP ke liye.</p>

<h3>Accurate time kyun zaroori hai</h3>
<ul>
<li><b>Log correlation.</b> Incident ke dauraan aap firewall, switch aur server logs compare karte ho. Agar clocks minutes se alag hain, to kahani samajh nahi aati.</li>
<li><b>Security.</b> Kerberos (Active Directory jise use karta hai) default mein login reject kar deta hai jab client aur server clocks mein paanch minute se zyada farak ho. Galat clock wale device par TLS certificates "abhi valid nahi" ya "expired" dikhte hain.</li>
<li><b>Operations.</b> Scheduled backups, SNMP aur syslog timestamps, aur billing records sab clock par depend karte hain.</li>
</ul>

<h3>NTP: Network Time Protocol</h3>
<p>NTP <b>UDP 123</b> par chalta hai. Time ek hierarchy mein neeche aata hai jo <b>stratum</b> levels mein naapi jaati hai:</p>
<ul>
<li><b>Stratum 0</b>: reference clock khud (GPS receiver, atomic clock). Yeh network par nahi hota.</li>
<li><b>Stratum 1</b>: stratum 0 source se seedha juda server.</li>
<li><b>Stratum 2, 3...</b>: reference se har hop ek jodta hai. Stratum 2 server se sync hone wala router stratum 3 ban jaata hai.</li>
<li><b>Stratum 16</b>: unsynchronised. Is clock par bharosa mat karo.</li>
</ul>
<p>NTP client apne server ke saath timestamps exchange karta hai, round-trip delay naapta hai, aur apni clock dheere dheere adjust karta hai. Internet par NTP kuch milliseconds tak accurate hai; achhe LAN par ek millisecond se kaafi kam. Best practice hai devices ko <b>kam se kam teen</b> internal time sources (ya teen upstream servers) par point karna, taaki ek galat clock ko outvote kiya ja sake.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="NTP stratum hierarchy">
<rect x="250" y="10" width="140" height="36" rx="8" fill="#fde68a"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Stratum 0: GPS</text>
<rect x="250" y="70" width="140" height="36" rx="8" fill="#fed7aa"/><text x="320" y="93" text-anchor="middle" class="svg-ink" font-size="13">Stratum 1 server</text>
<rect x="130" y="130" width="160" height="36" rx="8" fill="#bbf7d0"/><text x="210" y="153" text-anchor="middle" class="svg-ink" font-size="13">Stratum 2: SRV</text>
<rect x="350" y="130" width="160" height="36" rx="8" fill="#bbf7d0"/><text x="430" y="153" text-anchor="middle" class="svg-ink" font-size="13">Stratum 2: SRV-B</text>
<rect x="250" y="182" width="140" height="34" rx="8" fill="#bae6fd"/><text x="320" y="204" text-anchor="middle" class="svg-ink" font-size="13">Stratum 3: R1</text>
<line x1="320" y1="46" x2="320" y2="70" stroke="#64748b"/><line x1="300" y1="106" x2="220" y2="130" stroke="#64748b"/><line x1="340" y1="106" x2="420" y2="130" stroke="#64748b"/>
<line x1="210" y1="166" x2="300" y2="182" stroke="#64748b"/><line x1="430" y1="166" x2="340" y2="182" stroke="#64748b"/>
</svg><p class="cap">Reference clock se har hop stratum number mein ek jodta hai.</p></div>

<h3>Router par NTP configure aur verify karna</h3>
<pre class="code">clock timezone IST 5 30
ntp server 10.0.20.10 prefer
ntp server 10.0.20.11
<span class="c">! Optional: log messages synchronised time ke saath aate hain</span>
service timestamps log datetime msec localtime</pre>
<pre class="out">R1# show ntp status
<span class="hl">Clock is synchronized, stratum 3, reference is 10.0.20.10</span>
nominal freq is 250.0000 Hz, actual freq is 250.0003 Hz, precision is 2**10
clock offset is -0.4120 msec, root delay is 1.20 msec

R1# show ntp associations
  address         ref clock       st   when   poll reach  delay  offset   disp
<span class="hl">*~10.0.20.10      192.0.2.123      2     33     64   377  1.204  -0.412  1.021</span>
+~10.0.20.11      192.0.2.123      2     12     64   377  1.311  -0.389  1.110
 * sys.peer, # selected, + candidate, - outlyer, x falseticker, ~ configured</pre>
<p>Asterisk us server ko mark karta hai jisse R1 asal mein synchronised hai. <b>reach 377</b> (octal) ka matlab hai ki pichhle aath polls sab successful rahe. Bina upstream source wale router ko <code>ntp master 3</code> se authoritative source banaya ja sakta hai, lekin yeh sirf isolated lab ke liye theek hai.</p>

<h3>PTP: Precision Time Protocol (IEEE 1588)</h3>
<p>Kuch systems ko millisecond se kahin behtar chahiye. <b>PTP</b> network interfaces mein <b>hardware timestamping</b> use karke <b>sub-microsecond</b> (nanoseconds tak) accuracy tak pahunchta hai, taaki software delays measurement kharab na karein. Iske roles:</p>
<ul>
<li><b>Grandmaster clock</b>: domain ki best clock, aam taur par GPS-fed, Best Master Clock Algorithm (BMCA) se apne aap chuni jaati hai.</li>
<li><b>Boundary clock</b>: ek switch jo ek port par grandmaster se sync hota hai aur apne baaki ports par master ka kaam karta hai.</li>
<li><b>Transparent clock</b>: ek switch jo naapta hai ki har PTP message uske andar kitni der raha aur timestamp correct karta hai.</li>
<li><b>Ordinary clock</b>: ek end device jo master ko follow karta hai.</li>
</ul>
<p>PTP UDP 319 (event messages) aur 320 (general messages) par, ya seedha Ethernet par chalta hai. Yeh 5G mobile networks, stock exchanges aur trading (jahan regulation microsecond timestamps maangta hai), broadcast studios aur power grids mein use hota hai.</p>

<h3>NTS: Network Time Security</h3>
<p>Classic NTP packets authenticated nahi hote, to path par attacker device ki clock khiska sakta hai aur certificates ya logs ko bekaar bana sakta hai. <b>NTS</b> (RFC 8915) ise theek karta hai. Pehle client <b>TCP 4460</b> par TLS ke upar <b>NTS Key Establishment</b> handshake chalata hai aur keys aur cookies paata hai. Phir UDP 123 par normal NTP packets cryptographic authentication le kar chalte hain. NTS saabit karta hai ki time asli server se aaya aur badla nahi gaya; yeh time ko chupata nahi, jo secret nahi hai. Yeh pre-shared symmetric keys (<code>ntp authenticate</code> aur <code>ntp authentication-key</code>) wale purane approach ki jagah leta hai, aur chrony jaise modern time daemons ise support karte hain.</p>

<div class="eg"><p><b>Worked example.</b> Ek engineer VPN log mein 02:14:07 par hue login ki jaanch karta hai. Firewall session 02:21:40 par dikhata hai aur server 02:13:59 par. Firewall offset: +7 minute 33 second, to woh NTP use nahi kar raha. Firewall ko 10.0.20.10 aur 10.0.20.11 par point karne ke baad teeno devices 2 ms ke andar agree karte hain, aur agli investigation ghanton ki jagah minutes leti hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Sirf ek NTP server configure karna: agar woh khiske, to sab uske saath khisakta hai. (2) ACL ya firewall UDP 123 block kar raha ho, to router stratum 16 par rehta hai ("Clock is unsynchronized"). (3) Time zone bhool jaana, jisse logs UTC mein "sahi" hote hain lekin local team confuse hoti hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> NTP = UDP 123, millisecond accuracy. PTP = IEEE 1588, sub-microsecond, hardware timestamping. NTS = NTP ke liye authentication (TCP 4460 par TLS key exchange). Kam stratum number matlab reference clock ke zyada paas; stratum 16 matlab unsynchronised.</p></div>

<div class="scn"><h4>Power cut ke baad koi login nahi kar pa raha</h4><p>Weekend ke power cut ke baad ek branch ke users apne domain accounts mein login nahi kar pa rahe the: "The time difference between the client and server is too large." Branch server ki battery-backed clock reset ho gayi thi aur woh galat date ke saath aaya tha. Us par koi NTP configuration nahi thi, to Kerberos tickets reject ho rahe the. Engineer ne server aur branch router ko HQ NTP servers use karne ke liye configure kiya; minutes mein clocks agree ho gayi aur logins chalne lage.</p><p><b>Seekh:</b> time authentication ki dependency hai. Har device ko NTP follow karna chahiye, jahan possible ho kam se kam teen sources se.</p></div>

<div class="iv"><p class="q">"NTP stratum kya hai, aur aap NTP ki jagah PTP kab chunoge?"</p><p>Strong answer: stratum reference clock se doori hai: stratum 0 source hai (GPS, atomic), stratum 1 seedha juda hai, har hop ek jodta hai, aur 16 ka matlab unsynchronised. UDP 123 par NTP millisecond accuracy deta hai, jo logs aur authentication ke liye kaafi hai. PTP (IEEE 1588) sub-microsecond accuracy ke liye hardware timestamping aur boundary/transparent clocks use karta hai, jo 5G, trading aur broadcast mein chahiye. Authenticated NTP ke liye NTS jodo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Accurate time logs, Kerberos authentication aur certificates ke liye chahiye.</li>
<li>NTP: UDP 123, stratum hierarchy, millisecond accuracy, kam se kam teen sources use karo.</li>
<li>PTP (IEEE 1588): hardware timestamps, grandmaster/boundary/transparent clocks, sub-microsecond.</li>
<li>NTS: TCP 4460 par TLS key exchange, phir UDP 123 par authenticated NTP.</li>
<li><code>show ntp status</code> aur <code>show ntp associations</code> se verify karo (asterisk dekho).</li>
</ul></div>
`}};export{e as default};