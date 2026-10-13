var e={id:`secure-syslog`,h:{en:`Secure logging: severity levels, timestamps, export and syslog over TLS`,hi:`Secure logging: severity levels, timestamps, export aur TLS par syslog`},body:{en:`
<p>An aircraft carries a black box because the evidence must survive the crash. A router that keeps its logs only in a small memory buffer is a plane whose black box is inside the cockpit: when the device reloads, or an intruder clears the buffer, the evidence is gone. Secure logging means exporting timestamped messages to a collector the attacker cannot reach, over a transport that does not lose or leak them.</p>

<h3>Anatomy of a syslog message</h3>
<pre class="out">000123: <span class="hl">Sep 30 2026 10:15:02.123 IST</span>: %LINK-5-CHANGED: Interface GigabitEthernet0/2, changed state to administratively down
000124: Sep 30 2026 10:15:02.127 IST: <span class="hl">%SYS-5-CONFIG_I</span>: Configured from console by admin on vty0 (10.10.10.9)</pre>
<p>Each message has an optional <b>sequence number</b> (000123), a <b>timestamp</b>, and the tag <code>%FACILITY-SEVERITY-MNEMONIC</code>: the facility is the software component (LINK, SYS, SEC_LOGIN), the severity is a number 0 to 7, and the mnemonic names the event. If the timestamp starts with an asterisk, such as <code>*Sep 30 ...</code>, the clock is <b>not synchronised</b> to an authoritative source, the direct link to the previous chapter.</p>

<table class="cmp">
<tr><th>Level</th><th>Keyword</th><th>Example</th></tr>
<tr><td>0</td><td>emergencies</td><td>system unusable</td></tr>
<tr><td>1</td><td>alerts</td><td>immediate action needed (temperature)</td></tr>
<tr><td>2</td><td>critical</td><td>hardware or software failure</td></tr>
<tr><td>3</td><td>errors</td><td>interface down (%LINK-3-UPDOWN)</td></tr>
<tr><td>4</td><td>warnings</td><td>failed login (%SEC_LOGIN-4-LOGIN_FAILED)</td></tr>
<tr><td>5</td><td>notifications</td><td>config change (%SYS-5-CONFIG_I), line protocol</td></tr>
<tr><td>6</td><td>informational</td><td>ACL log hits, routine events</td></tr>
<tr><td>7</td><td>debugging</td><td>debug output</td></tr>
</table>
<p>A level setting means "this level and everything more severe". <code>logging trap informational</code> sends levels 0 to 6 to the collector. Memory aid: "Every Awesome Cisco Engineer Will Need Ice cream Daily".</p>

<h3>Configuration</h3>
<pre class="code"><span class="c">! trustworthy timestamps (needs NTP from chapter 7)</span>
service timestamps log datetime msec localtime show-timezone year
service timestamps debug datetime msec localtime show-timezone year
service sequence-numbers
<span class="c">! local buffer, quiet console</span>
logging buffered 64000 informational
logging console critical
<span class="c">! export to the collector (lab values)</span>
logging host 10.10.10.50
logging trap informational
logging source-interface GigabitEthernet0/0
<span class="c">! record logins and configuration changes</span>
login on-failure log
login on-success log
archive
 log config
  logging enable
  notify syslog contenttype plaintext
  hidekeys</pre>
<p><code>login on-failure log</code> and <code>login on-success log</code> produce SEC_LOGIN messages with the username and source address. The <code>archive log config</code> block logs every configuration command a user types (hiding passwords with <code>hidekeys</code>), which complements TACACS+ command accounting when ISE is unavailable. <code>logging source-interface</code> makes messages always come from the address the collector expects.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Syslog transports">
<rect x="20" y="80" width="140" height="60" rx="8" fill="#bae6fd"/><text x="90" y="105" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="90" y="123" text-anchor="middle" class="svg-muted" font-size="12">logging host</text>
<rect x="480" y="80" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="550" y="105" text-anchor="middle" class="svg-ink" font-size="13">LOG / SIEM</text><text x="550" y="123" text-anchor="middle" class="svg-muted" font-size="12">10.10.10.50</text>
<line x1="160" y1="92" x2="480" y2="92" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="84" text-anchor="middle" class="svg-muted" font-size="12">UDP 514: clear text, may be lost</text>
<line x1="160" y1="110" x2="480" y2="110" stroke="#64748b" stroke-width="2"/><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="12">TCP: reliable, still clear text</text>
<line x1="160" y1="128" x2="480" y2="128" stroke="#64748b" stroke-width="4"/><text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">TLS on TCP 6514: reliable, private, server authenticated</text>
<text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="13">Secure logging = right content + right time + right transport</text>
</svg><p class="cap">Classic syslog uses UDP 514. TCP adds reliability; TLS on TCP 6514 adds encryption and server authentication.</p></div>

<h3>Transport: from UDP to TLS</h3>
<p>Classic syslog uses <b>UDP 514</b>: no acknowledgement, no encryption, easy to spoof. Messages can be lost under load and read by anyone on the path, and many contain usernames and addresses. <b>Syslog over TCP</b> (IOS: <code>logging host 10.10.10.50 transport tcp port 601</code>) adds reliable delivery. <b>Syslog over TLS</b>, standardised on <b>TCP 6514</b>, adds encryption and lets the device verify the collector's certificate. On IOS XE releases that support it, the <code>logging host</code> command takes a TLS transport tied to a TLS profile and a PKI trustpoint. On Cisco ASA the equivalent is the <code>secure</code> keyword:</p>
<pre class="code"><span class="c">! Cisco ASA: syslog over TLS to the collector</span>
logging enable
logging timestamp
logging trap informational
logging host inside 10.10.10.50 tcp/6514 secure</pre>
<p>On the collector side, protect integrity: forward to a SIEM, restrict who can delete logs, and keep them for the retention period your policy or regulator requires.</p>

<h3>Beyond syslog: NetFlow as a security sensor</h3>
<p>Syslog tells you what the device did; <b>NetFlow</b> tells you who talked to whom. Each flow record (source, destination, ports, protocol, bytes) is exported as NetFlow v9 or IPFIX to a collector such as Cisco Secure Network Analytics, which baselines behaviour and flags scanning, data exfiltration or beaconing. The SCOR exam expects the concept, not tuning:</p>
<pre class="code">flow exporter NK-EXP
 destination 10.10.10.60
 transport udp 2055
flow monitor NK-MON
 record netflow ipv4 original-input
 exporter NK-EXP
interface GigabitEthernet0/1
 ip flow monitor NK-MON input</pre>

<h3>Verification</h3>
<pre class="out">R1# show logging | begin Trap
    Trap logging: level informational, 58 message lines logged
<span class="hl">        Logging to 10.10.10.50  (udp port 514, audit disabled,</span>
              link up),
<span class="hl">              4 message lines logged,</span>
              0 message lines rate-limited,
              0 message lines dropped-by-MD,
              xml disabled, sequence number disabled
              filtering disabled</pre>

<div class="eg"><p><b>Worked example (Lab 4, task 3).</b> You configure <code>logging host 10.10.10.50</code> and <code>logging trap informational</code> on R1, then generate an event: <code>interface g0/2</code>, <code>shutdown</code>, <code>no shutdown</code>. R1 logs %LINK-5-CHANGED (level 5) and %SYS-5-CONFIG_I (level 5) when you leave configuration mode. Both are at or above informational, so they are sent. On LOG, <code>show syslog</code> lists the messages from 10.10.10.1; enter the count it shows (any number of at least 1) as the answer.</p></div>

<div class="warn"><p><b>Common mistake.</b> Setting <code>logging trap debugging</code> "to be safe". Debug-level output can flood the collector and the CPU. Another classic: leaving <code>logging console</code> at debugging on a busy device, which slows every console session. Send informational to the collector and keep the console at critical.</p></div>

<div class="exam"><p><b>Exam trap.</b> Severity 0 is the most severe, 7 the least. A trap level includes every more-severe level. Default syslog is UDP 514; syslog over TLS uses TCP 6514. An asterisk before the timestamp means the clock is not synchronised.</p></div>

<div class="scn"><h4>The deleted buffer</h4><p>An intruder with a stolen admin password logged into a branch router, changed an ACL, and ran <code>clear logging</code> before leaving. The local buffer was empty, but the SIEM had already received %SEC_LOGIN-5-LOGIN_SUCCESS with the source address, the %PARSER-5-CFGLOG_LOGGEDCMD lines for each command, and %SYS-5-CONFIG_I, all with NTP-synchronised timestamps. The team rotated the password, blocked the source and restored the ACL within the hour.</p><p><b>Lesson:</b> logs that stay on the device can be erased by whoever controls it; export them, timestamp them, and log config changes.</p></div>

<div class="iv"><p class="q">"How would you make syslog from network devices trustworthy for an investigation?"</p><p>Four points: synchronised, authenticated NTP with <code>service timestamps ... msec</code>; export with <code>logging host</code>, a fixed <code>logging source-interface</code> and an appropriate trap level (informational); log logins and config changes (<code>login on-failure log</code>, <code>archive log config</code>); and protect transport and storage with TCP or TLS on 6514 to a SIEM with restricted deletion rights.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Message format: sequence number, timestamp, %FACILITY-SEVERITY-MNEMONIC; an asterisk means unsynchronised time.</li>
<li>Severity 0 emergencies to 7 debugging; a level includes everything more severe.</li>
<li>Export with <code>logging host</code> and <code>logging trap informational</code>, with timestamps and source-interface.</li>
<li>Log logins and configuration changes so the collector holds the audit trail.</li>
<li>UDP 514 is clear and lossy; TCP adds reliability; TLS on TCP 6514 adds encryption and server authentication.</li>
</ul></div>
`,hi:`
<p>Aircraft mein black box isliye hota hai kyunki evidence crash se bachna chahiye. Jo router apne logs sirf ek chhote memory buffer mein rakhta hai, woh aisa plane hai jiska black box cockpit ke andar hai: jab device reload hota hai, ya intruder buffer clear karta hai, to evidence chala jaata hai. Secure logging ka matlab hai timestamped messages ko aise collector par export karna jahan attacker na pahunch sake, aise transport par jo unhe na khoye na leak kare.</p>

<h3>Syslog message ki banawat</h3>
<pre class="out">000123: <span class="hl">Sep 30 2026 10:15:02.123 IST</span>: %LINK-5-CHANGED: Interface GigabitEthernet0/2, changed state to administratively down
000124: Sep 30 2026 10:15:02.127 IST: <span class="hl">%SYS-5-CONFIG_I</span>: Configured from console by admin on vty0 (10.10.10.9)</pre>
<p>Har message mein ek optional <b>sequence number</b> (000123), ek <b>timestamp</b>, aur tag <code>%FACILITY-SEVERITY-MNEMONIC</code> hota hai: facility software component hai (LINK, SYS, SEC_LOGIN), severity 0 se 7 ka number hai, aur mnemonic event ka naam hai. Agar timestamp asterisk se shuru hota hai, jaise <code>*Sep 30 ...</code>, to clock kisi authoritative source se <b>synchronised nahi</b> hai, pichhle chapter se seedha link.</p>

<table class="cmp">
<tr><th>Level</th><th>Keyword</th><th>Example</th></tr>
<tr><td>0</td><td>emergencies</td><td>system unusable</td></tr>
<tr><td>1</td><td>alerts</td><td>turant action chahiye (temperature)</td></tr>
<tr><td>2</td><td>critical</td><td>hardware ya software failure</td></tr>
<tr><td>3</td><td>errors</td><td>interface down (%LINK-3-UPDOWN)</td></tr>
<tr><td>4</td><td>warnings</td><td>failed login (%SEC_LOGIN-4-LOGIN_FAILED)</td></tr>
<tr><td>5</td><td>notifications</td><td>config change (%SYS-5-CONFIG_I), line protocol</td></tr>
<tr><td>6</td><td>informational</td><td>ACL log hits, routine events</td></tr>
<tr><td>7</td><td>debugging</td><td>debug output</td></tr>
</table>
<p>Level setting ka matlab hai "yeh level aur usse zyada severe sab kuch". <code>logging trap informational</code> levels 0 se 6 collector ko bhejta hai. Yaad rakhne ka tarika: "Every Awesome Cisco Engineer Will Need Ice cream Daily".</p>

<h3>Configuration</h3>
<pre class="code"><span class="c">! bharosemand timestamps (chapter 7 ka NTP chahiye)</span>
service timestamps log datetime msec localtime show-timezone year
service timestamps debug datetime msec localtime show-timezone year
service sequence-numbers
<span class="c">! local buffer, shaant console</span>
logging buffered 64000 informational
logging console critical
<span class="c">! collector ko export (lab values)</span>
logging host 10.10.10.50
logging trap informational
logging source-interface GigabitEthernet0/0
<span class="c">! logins aur configuration changes record karo</span>
login on-failure log
login on-success log
archive
 log config
  logging enable
  notify syslog contenttype plaintext
  hidekeys</pre>
<p><code>login on-failure log</code> aur <code>login on-success log</code> username aur source address ke saath SEC_LOGIN messages banate hain. <code>archive log config</code> block user ka type kiya har configuration command log karta hai (<code>hidekeys</code> se passwords chhupa kar), jo ISE unavailable hone par TACACS+ command accounting ko complement karta hai. <code>logging source-interface</code> messages ko hamesha us address se bhejta hai jiski collector ummeed karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Syslog transports">
<rect x="20" y="80" width="140" height="60" rx="8" fill="#bae6fd"/><text x="90" y="105" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="90" y="123" text-anchor="middle" class="svg-muted" font-size="12">logging host</text>
<rect x="480" y="80" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="550" y="105" text-anchor="middle" class="svg-ink" font-size="13">LOG / SIEM</text><text x="550" y="123" text-anchor="middle" class="svg-muted" font-size="12">10.10.10.50</text>
<line x1="160" y1="92" x2="480" y2="92" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="84" text-anchor="middle" class="svg-muted" font-size="12">UDP 514: clear text, kho sakta hai</text>
<line x1="160" y1="110" x2="480" y2="110" stroke="#64748b" stroke-width="2"/><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="12">TCP: reliable, par clear text</text>
<line x1="160" y1="128" x2="480" y2="128" stroke="#64748b" stroke-width="4"/><text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">TCP 6514 par TLS: reliable, private, server authenticated</text>
<text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="13">Secure logging = sahi content + sahi time + sahi transport</text>
</svg><p class="cap">Classic syslog UDP 514 use karta hai. TCP reliability jodta hai; TCP 6514 par TLS encryption aur server authentication jodta hai.</p></div>

<h3>Transport: UDP se TLS tak</h3>
<p>Classic syslog <b>UDP 514</b> use karta hai: koi acknowledgement nahi, koi encryption nahi, spoof karna aasaan. Load par messages kho sakte hain aur path par koi bhi unhe padh sakta hai, aur kai mein usernames aur addresses hote hain. <b>TCP par syslog</b> (IOS: <code>logging host 10.10.10.50 transport tcp port 601</code>) reliable delivery jodta hai. <b>TLS par syslog</b>, jo <b>TCP 6514</b> par standardised hai, encryption jodta hai aur device ko collector ka certificate verify karne deta hai. Jin IOS XE releases mein support hai, wahan <code>logging host</code> command TLS profile aur PKI trustpoint se bandha TLS transport leta hai. Cisco ASA par equivalent <code>secure</code> keyword hai:</p>
<pre class="code"><span class="c">! Cisco ASA: collector ko TLS par syslog</span>
logging enable
logging timestamp
logging trap informational
logging host inside 10.10.10.50 tcp/6514 secure</pre>
<p>Collector side par integrity protect karo: SIEM ko forward karo, logs delete karne wale ko seemit karo, aur unhe utne samay rakho jitna aapki policy ya regulator maangta hai.</p>

<h3>Syslog se aage: NetFlow ek security sensor ke roop mein</h3>
<p>Syslog batata hai device ne kya kiya; <b>NetFlow</b> batata hai kisne kisse baat ki. Har flow record (source, destination, ports, protocol, bytes) NetFlow v9 ya IPFIX ke roop mein ek collector ko export hota hai, jaise Cisco Secure Network Analytics, jo behaviour ka baseline banata hai aur scanning, data exfiltration ya beaconing ko flag karta hai. SCOR exam concept expect karta hai, tuning nahi:</p>
<pre class="code">flow exporter NK-EXP
 destination 10.10.10.60
 transport udp 2055
flow monitor NK-MON
 record netflow ipv4 original-input
 exporter NK-EXP
interface GigabitEthernet0/1
 ip flow monitor NK-MON input</pre>

<h3>Verification</h3>
<pre class="out">R1# show logging | begin Trap
    Trap logging: level informational, 58 message lines logged
<span class="hl">        Logging to 10.10.10.50  (udp port 514, audit disabled,</span>
              link up),
<span class="hl">              4 message lines logged,</span>
              0 message lines rate-limited,
              0 message lines dropped-by-MD,
              xml disabled, sequence number disabled
              filtering disabled</pre>

<div class="eg"><p><b>Worked example (Lab 4, task 3).</b> Aap R1 par <code>logging host 10.10.10.50</code> aur <code>logging trap informational</code> configure karte ho, phir ek event banate ho: <code>interface g0/2</code>, <code>shutdown</code>, <code>no shutdown</code>. R1 %LINK-5-CHANGED (level 5) aur configuration mode chhodne par %SYS-5-CONFIG_I (level 5) log karta hai. Dono informational ya usse upar hain, isliye bheje jaate hain. LOG par <code>show syslog</code> 10.10.10.1 se aaye messages list karta hai; jo count dikhe (kam se kam 1) woh answer mein daalo.</p></div>

<div class="warn"><p><b>Common galti.</b> "Safe rehne ke liye" <code>logging trap debugging</code> set karna. Debug-level output collector aur CPU ko flood kar sakta hai. Ek aur classic: busy device par <code>logging console</code> ko debugging par chhodna, jo har console session ko slow karta hai. Collector ko informational bhejo aur console ko critical par rakho.</p></div>

<div class="exam"><p><b>Exam trap.</b> Severity 0 sabse severe hai, 7 sabse kam. Trap level har zyada-severe level shamil karta hai. Default syslog UDP 514 hai; TLS par syslog TCP 6514 use karta hai. Timestamp se pehle asterisk ka matlab clock synchronised nahi hai.</p></div>

<div class="scn"><h4>Delete kiya hua buffer</h4><p>Chori ke admin password ke saath ek intruder ne branch router mein login kiya, ek ACL badla, aur jaane se pehle <code>clear logging</code> chalaya. Local buffer khaali tha, par SIEM ko pehle hi source address ke saath %SEC_LOGIN-5-LOGIN_SUCCESS, har command ke liye %PARSER-5-CFGLOG_LOGGEDCMD lines, aur %SYS-5-CONFIG_I mil chuke the, sab NTP-synchronised timestamps ke saath. Team ne ek ghante ke andar password rotate kiya, source block kiya aur ACL restore kiya.</p><p><b>Seekh:</b> device par rehne wale logs use control karne wala mita sakta hai; unhe export karo, timestamp karo, aur config changes log karo.</p></div>

<div class="iv"><p class="q">"Investigation ke liye network devices ke syslog ko bharosemand kaise banaoge?"</p><p>Chaar points: <code>service timestamps ... msec</code> ke saath synchronised, authenticated NTP; <code>logging host</code>, fixed <code>logging source-interface</code> aur sahi trap level (informational) ke saath export; logins aur config changes log karo (<code>login on-failure log</code>, <code>archive log config</code>); aur transport aur storage ko 6514 par TCP ya TLS se SIEM tak protect karo jahan deletion rights seemit hon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Message format: sequence number, timestamp, %FACILITY-SEVERITY-MNEMONIC; asterisk ka matlab unsynchronised time.</li>
<li>Severity 0 emergencies se 7 debugging; ek level usse zyada severe sab kuch shamil karta hai.</li>
<li><code>logging host</code> aur <code>logging trap informational</code> se export karo, timestamps aur source-interface ke saath.</li>
<li>Logins aur configuration changes log karo taaki collector ke paas audit trail ho.</li>
<li>UDP 514 clear aur lossy hai; TCP reliability jodta hai; TCP 6514 par TLS encryption aur server authentication jodta hai.</li>
</ul></div>
`}};export{e as default};