var e={id:`syslog-concepts`,h:{en:`Syslog: message format, severity and facility`,hi:`Syslog: message format, severity aur facility`},body:{en:`
<p>Every hospital nurse writes in the patient chart in the same format: time, who, how serious, what happened. "08:35, ward 3, WARNING, blood pressure high." Because the format is fixed, a doctor can scan a hundred entries and jump straight to the serious ones. <b>Syslog</b> is that chart for network devices: a standard message format with a <b>severity</b> number, sent to places where people and tools can read it.</p>

<h3>Anatomy of a Cisco syslog message</h3>
<pre class="out">000045: *Sep 29 08:35:31.432: %LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to down</pre>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Syslog message anatomy">
<rect x="10" y="20" width="70" height="36" rx="6" fill="#e2e8f0"/><text x="45" y="43" text-anchor="middle" class="svg-ink" font-size="12">000045</text>
<rect x="88" y="20" width="190" height="36" rx="6" fill="#bae6fd"/><text x="183" y="43" text-anchor="middle" class="svg-ink" font-size="12">*Sep 29 08:35:31.432</text>
<rect x="286" y="20" width="60" height="36" rx="6" fill="#bbf7d0"/><text x="316" y="43" text-anchor="middle" class="svg-ink" font-size="12">LINK</text>
<rect x="352" y="20" width="30" height="36" rx="6" fill="#fed7aa"/><text x="367" y="43" text-anchor="middle" class="svg-ink" font-size="13">3</text>
<rect x="388" y="20" width="80" height="36" rx="6" fill="#ddd6fe"/><text x="428" y="43" text-anchor="middle" class="svg-ink" font-size="12">UPDOWN</text>
<rect x="474" y="20" width="156" height="36" rx="6" fill="#fde68a"/><text x="552" y="43" text-anchor="middle" class="svg-ink" font-size="12">Interface ... down</text>
<text x="45" y="80" text-anchor="middle" class="svg-muted" font-size="12">sequence</text>
<text x="183" y="80" text-anchor="middle" class="svg-muted" font-size="12">timestamp</text>
<text x="316" y="80" text-anchor="middle" class="svg-muted" font-size="12">facility</text>
<text x="367" y="100" text-anchor="middle" class="svg-accent" font-size="12">severity</text>
<text x="428" y="80" text-anchor="middle" class="svg-muted" font-size="12">mnemonic</text>
<text x="552" y="80" text-anchor="middle" class="svg-muted" font-size="12">description</text>
<text x="20" y="150" class="svg-muted" font-size="12">* before the time = clock not synchronised; sequence number only with service sequence-numbers</text>
</svg><p class="cap">Every part has a job. The number between the first two dashes is the severity.</p></div>

<dl class="terms">
<dt>Sequence number</dt><dd>A counter (<code>service sequence-numbers</code>). If the server receives 45 and 47, it knows 46 was lost.</dd>
<dt>Timestamp</dt><dd>When the event happened, according to the device clock. A leading <code>*</code> warns that the clock is not authoritative.</dd>
<dt>Facility (Cisco sense)</dt><dd>The feature or process that generated the message: <code>LINK</code>, <code>LINEPROTO</code>, <code>OSPF</code>, <code>SYS</code>, <code>SEC_LOGIN</code>.</dd>
<dt>Severity</dt><dd>A number from 0 (worst) to 7 (least important).</dd>
<dt>Mnemonic</dt><dd>A short code for the exact event, such as <code>UPDOWN</code>, <code>ADJCHG</code>, <code>CONFIG_I</code>.</dd>
<dt>Description</dt><dd>Human-readable text with the details.</dd>
</dl>

<h3>The eight severity levels</h3>
<table class="cmp"><tr><th>Level</th><th>Keyword</th><th>Meaning</th><th>Typical example</th></tr>
<tr><td>0</td><td>emergencies</td><td>System unusable</td><td>Device about to crash</td></tr>
<tr><td>1</td><td>alerts</td><td>Immediate action needed</td><td>Temperature critical</td></tr>
<tr><td>2</td><td>critical</td><td>Critical condition</td><td>Memory allocation failure</td></tr>
<tr><td>3</td><td>errors</td><td>Error condition</td><td><code>%LINK-3-UPDOWN</code></td></tr>
<tr><td>4</td><td>warnings</td><td>Warning condition</td><td>Duplex mismatch, config file warning</td></tr>
<tr><td>5</td><td>notifications</td><td>Normal but significant</td><td><code>%LINEPROTO-5-UPDOWN</code>, <code>%SYS-5-CONFIG_I</code>, <code>%OSPF-5-ADJCHG</code></td></tr>
<tr><td>6</td><td>informational</td><td>Informational</td><td>ACL log hits, <code>%SYS-6-LOGGINGHOST_STARTSTOP</code></td></tr>
<tr><td>7</td><td>debugging</td><td>Debug output</td><td>Output of any <code>debug</code> command</td></tr></table>

<div class="tip"><p><b>Mnemonic.</b> "<b>E</b>very <b>A</b>wesome <b>C</b>isco <b>E</b>ngineer <b>W</b>ill <b>N</b>eed <b>I</b>ce-cream <b>D</b>aily" = Emergencies, Alerts, Critical, Errors, Warnings, Notifications, Informational, Debugging, levels 0 to 7.</p></div>

<p><b>The one rule to remember:</b> when you set a logging level, the device sends messages at <b>that level and every more severe level</b>, which means that number and all <b>lower</b> numbers. <code>logging trap warnings</code> sends 0, 1, 2, 3 and 4. <code>logging trap debugging</code> sends everything.</p>

<div class="eg"><p><b>Worked example.</b> A server is set to <code>logging trap notifications</code> (5). Which of these reach it? <code>%LINK-3-UPDOWN</code> (3): yes. <code>%LINEPROTO-5-UPDOWN</code> (5): yes. <code>%SEC-6-IPACCESSLOGP</code> (6): no. OSPF debug output (7): no. The lab needs <code>logging trap informational</code> (6) so that level 6 messages also arrive.</p></div>

<h3>Facility in the syslog protocol sense</h3>
<p>The word facility has a second meaning. The syslog <b>protocol</b> tags each message with a facility code so the server can sort sources into files. Network devices normally use <code>local0</code> to <code>local7</code>; Cisco IOS defaults to <b>local7</b> (<code>logging facility local7</code>). The packet starts with a <b>PRI</b> value: PRI = facility × 8 + severity. local7 is facility 23.</p>
<div class="eg"><p><b>Worked example.</b> <code>%SYS-5-CONFIG_I</code> from a router using local7: 23 × 8 + 5 = 189, so the packet begins with <code>&lt;189&gt;</code>. A <code>%LINK-3-UPDOWN</code> becomes <code>&lt;187&gt;</code>. If a server team asks "send network logs as local5", you change <code>logging facility local5</code> and the PRI becomes 21 × 8 + severity.</p></div>

<h3>The transport</h3>
<p>Classic syslog travels on <b>UDP 514</b>, in clear text, with no acknowledgement. That makes it light and simple, but a message lost in congestion is simply gone, and anyone on the path can read it. Newer systems can use TCP and TLS; for the CCNA, remember UDP 514. Because of the loss risk, devices also keep a local copy in the <b>logging buffer</b> (next chapter).</p>

<div class="warn"><p><b>Common mistake.</b> Reading the level rule backwards. "Level 4" does not mean "level 4 and above in number". It means 4 and everything more serious: 0 to 4. Informational (6) catches almost everything except debug.</p></div>

<div class="exam"><p><b>Exam trap.</b> Expect "which keyword is level 5?" (notifications) and "what severity is %OSPF-5-ADJCHG?" (5). Do not confuse the Cisco facility in the message text (OSPF, LINK) with the protocol facility (local7).</p></div>

<div class="scn"><h4>The flood that filled the disk</h4><p>A new engineer set <code>logging trap debugging</code> on all 200 routers "to see everything", then turned on <code>debug ip packet</code> on one router during a test. The syslog server received tens of thousands of messages per second, its disk filled overnight, and real alerts from other devices were lost. The fix was <code>logging trap informational</code> on every router and a rule never to send debug output to the central server.</p><p><b>Lesson:</b> choose the level for each destination on purpose. Informational to the server is a sane default; debugging belongs on the local session only.</p></div>

<div class="iv"><p class="q">"List the syslog severity levels. If I set level 3, what do I get?"</p><p>Strong answer recites 0 emergencies, 1 alerts, 2 critical, 3 errors, 4 warnings, 5 notifications, 6 informational, 7 debugging, maybe with the mnemonic, then says level 3 sends 0 through 3 because a level includes itself and everything more severe. Bonus: show how to read severity from a message such as %LINEPROTO-5-UPDOWN, and mention UDP 514.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Format: seq: timestamp: %FACILITY-SEVERITY-MNEMONIC: description.</li>
<li>Levels 0 to 7: emergencies, alerts, critical, errors, warnings, notifications, informational, debugging.</li>
<li>A configured level sends that level and all lower numbers.</li>
<li>Protocol facility defaults to local7; PRI = facility × 8 + severity.</li>
<li>Syslog uses UDP 514, clear text, no acknowledgement.</li>
</ul></div>
`,hi:`
<p>Hospital ki har nurse patient chart mein ek hi format mein likhti hai: time, kaun, kitna serious, kya hua. "08:35, ward 3, WARNING, blood pressure high." Format fixed hai, isliye doctor sau entries scan karke seedha serious walon par pahunch sakta hai. <b>Syslog</b> network devices ke liye wahi chart hai: ek standard message format jismein <b>severity</b> number hota hai, aur jo aisi jagahon par bheja jaata hai jahan log aur tools use padh sakein.</p>

<h3>Cisco syslog message ki anatomy</h3>
<pre class="out">000045: *Sep 29 08:35:31.432: %LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to down</pre>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Syslog message anatomy">
<rect x="10" y="20" width="70" height="36" rx="6" fill="#e2e8f0"/><text x="45" y="43" text-anchor="middle" class="svg-ink" font-size="12">000045</text>
<rect x="88" y="20" width="190" height="36" rx="6" fill="#bae6fd"/><text x="183" y="43" text-anchor="middle" class="svg-ink" font-size="12">*Sep 29 08:35:31.432</text>
<rect x="286" y="20" width="60" height="36" rx="6" fill="#bbf7d0"/><text x="316" y="43" text-anchor="middle" class="svg-ink" font-size="12">LINK</text>
<rect x="352" y="20" width="30" height="36" rx="6" fill="#fed7aa"/><text x="367" y="43" text-anchor="middle" class="svg-ink" font-size="13">3</text>
<rect x="388" y="20" width="80" height="36" rx="6" fill="#ddd6fe"/><text x="428" y="43" text-anchor="middle" class="svg-ink" font-size="12">UPDOWN</text>
<rect x="474" y="20" width="156" height="36" rx="6" fill="#fde68a"/><text x="552" y="43" text-anchor="middle" class="svg-ink" font-size="12">Interface ... down</text>
<text x="45" y="80" text-anchor="middle" class="svg-muted" font-size="12">sequence</text>
<text x="183" y="80" text-anchor="middle" class="svg-muted" font-size="12">timestamp</text>
<text x="316" y="80" text-anchor="middle" class="svg-muted" font-size="12">facility</text>
<text x="367" y="100" text-anchor="middle" class="svg-accent" font-size="12">severity</text>
<text x="428" y="80" text-anchor="middle" class="svg-muted" font-size="12">mnemonic</text>
<text x="552" y="80" text-anchor="middle" class="svg-muted" font-size="12">description</text>
<text x="20" y="150" class="svg-muted" font-size="12">time se pehle * = clock sync nahi; sequence number sirf service sequence-numbers ke saath</text>
</svg><p class="cap">Har hisse ka ek kaam hai. Pehle do dashes ke beech ka number severity hai.</p></div>

<dl class="terms">
<dt>Sequence number</dt><dd>Ek counter (<code>service sequence-numbers</code>). Agar server ko 45 aur 47 milte hain, to use pata chalta hai ki 46 kho gaya.</dd>
<dt>Timestamp</dt><dd>Event kab hua, device clock ke hisaab se. Aage <code>*</code> chetavni deta hai ki clock authoritative nahi hai.</dd>
<dt>Facility (Cisco wala matlab)</dt><dd>Woh feature ya process jisne message banaya: <code>LINK</code>, <code>LINEPROTO</code>, <code>OSPF</code>, <code>SYS</code>, <code>SEC_LOGIN</code>.</dd>
<dt>Severity</dt><dd>0 (sabse bura) se 7 (sabse kam important) tak ka number.</dd>
<dt>Mnemonic</dt><dd>Exact event ka chhota code, jaise <code>UPDOWN</code>, <code>ADJCHG</code>, <code>CONFIG_I</code>.</dd>
<dt>Description</dt><dd>Details ke saath insaan ke padhne layak text.</dd>
</dl>

<h3>Aath severity levels</h3>
<table class="cmp"><tr><th>Level</th><th>Keyword</th><th>Matlab</th><th>Typical example</th></tr>
<tr><td>0</td><td>emergencies</td><td>System use layak nahi</td><td>Device crash hone wala hai</td></tr>
<tr><td>1</td><td>alerts</td><td>Turant action chahiye</td><td>Temperature critical</td></tr>
<tr><td>2</td><td>critical</td><td>Critical condition</td><td>Memory allocation failure</td></tr>
<tr><td>3</td><td>errors</td><td>Error condition</td><td><code>%LINK-3-UPDOWN</code></td></tr>
<tr><td>4</td><td>warnings</td><td>Warning condition</td><td>Duplex mismatch, config file warning</td></tr>
<tr><td>5</td><td>notifications</td><td>Normal lekin significant</td><td><code>%LINEPROTO-5-UPDOWN</code>, <code>%SYS-5-CONFIG_I</code>, <code>%OSPF-5-ADJCHG</code></td></tr>
<tr><td>6</td><td>informational</td><td>Jaankari</td><td>ACL log hits, <code>%SYS-6-LOGGINGHOST_STARTSTOP</code></td></tr>
<tr><td>7</td><td>debugging</td><td>Debug output</td><td>Kisi bhi <code>debug</code> command ka output</td></tr></table>

<div class="tip"><p><b>Mnemonic.</b> "<b>E</b>very <b>A</b>wesome <b>C</b>isco <b>E</b>ngineer <b>W</b>ill <b>N</b>eed <b>I</b>ce-cream <b>D</b>aily" = Emergencies, Alerts, Critical, Errors, Warnings, Notifications, Informational, Debugging, levels 0 se 7.</p></div>

<p><b>Yaad rakhne ka ek rule:</b> jab aap logging level set karte ho, device <b>us level aur usse zyada serious har level</b> ke messages bhejta hai, yaani woh number aur saare <b>chhote</b> numbers. <code>logging trap warnings</code> 0, 1, 2, 3 aur 4 bhejta hai. <code>logging trap debugging</code> sab kuch bhejta hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek server <code>logging trap notifications</code> (5) par set hai. Inmein se kaunse pahunchenge? <code>%LINK-3-UPDOWN</code> (3): haan. <code>%LINEPROTO-5-UPDOWN</code> (5): haan. <code>%SEC-6-IPACCESSLOGP</code> (6): nahi. OSPF debug output (7): nahi. Lab ko <code>logging trap informational</code> (6) chahiye taaki level 6 messages bhi pahunchein.</p></div>

<h3>Syslog protocol wale matlab mein facility</h3>
<p>Facility shabd ka ek doosra matlab bhi hai. Syslog <b>protocol</b> har message par facility code lagata hai taaki server sources ko files mein sort kar sake. Network devices normally <code>local0</code> se <code>local7</code> use karte hain; Cisco IOS ka default <b>local7</b> hai (<code>logging facility local7</code>). Packet ek <b>PRI</b> value se shuru hota hai: PRI = facility × 8 + severity. local7 facility 23 hai.</p>
<div class="eg"><p><b>Worked example.</b> local7 use karne wale router se <code>%SYS-5-CONFIG_I</code>: 23 × 8 + 5 = 189, isliye packet <code>&lt;189&gt;</code> se shuru hota hai. <code>%LINK-3-UPDOWN</code> <code>&lt;187&gt;</code> banta hai. Agar server team kahe "network logs local5 ke roop mein bhejo", to aap <code>logging facility local5</code> badalte ho aur PRI 21 × 8 + severity ban jaata hai.</p></div>

<h3>Transport</h3>
<p>Classic syslog <b>UDP 514</b> par, clear text mein, bina acknowledgement ke jaata hai. Isse yeh halka aur simple hai, lekin congestion mein khoya message bas chala gaya, aur path par koi bhi use padh sakta hai. Naye systems TCP aur TLS use kar sakte hain; CCNA ke liye UDP 514 yaad rakho. Loss ke risk ki wajah se devices <b>logging buffer</b> mein ek local copy bhi rakhte hain (agla chapter).</p>

<div class="warn"><p><b>Common galti.</b> Level rule ko ulta padhna. "Level 4" ka matlab "number mein 4 aur upar" nahi hai. Matlab hai 4 aur usse zyada serious sab: 0 se 4. Informational (6) debug ke alawa lagbhag sab pakad leta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Level 5 ka keyword kya hai?" (notifications) aur "%OSPF-5-ADJCHG ki severity kya hai?" (5) jaise sawaal expect karo. Message text ki Cisco facility (OSPF, LINK) ko protocol facility (local7) se confuse mat karo.</p></div>

<div class="scn"><h4>Woh flood jisne disk bhar di</h4><p>Ek naye engineer ne "sab kuch dekhne ke liye" saare 200 routers par <code>logging trap debugging</code> set kiya, phir ek test ke dauran ek router par <code>debug ip packet</code> on kar diya. Syslog server ko har second hazaaron messages mile, raat bhar mein uski disk bhar gayi, aur doosre devices ke asli alerts kho gaye. Fix tha har router par <code>logging trap informational</code> aur ek rule ki debug output kabhi central server par nahi bhejna.</p><p><b>Seekh:</b> har destination ka level soch samajh kar chuno. Server ke liye informational ek samajhdaar default hai; debugging sirf local session ke liye hai.</p></div>

<div class="iv"><p class="q">"Syslog severity levels list karo. Agar main level 3 set karun to kya milega?"</p><p>Strong answer 0 emergencies, 1 alerts, 2 critical, 3 errors, 4 warnings, 5 notifications, 6 informational, 7 debugging bolta hai, shayad mnemonic ke saath, phir kehta hai ki level 3 0 se 3 tak bhejta hai kyunki level khud ko aur usse zyada serious sabko include karta hai. Bonus: %LINEPROTO-5-UPDOWN jaise message se severity padh kar dikhao, aur UDP 514 mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Format: seq: timestamp: %FACILITY-SEVERITY-MNEMONIC: description.</li>
<li>Levels 0 se 7: emergencies, alerts, critical, errors, warnings, notifications, informational, debugging.</li>
<li>Configured level woh level aur saare chhote numbers bhejta hai.</li>
<li>Protocol facility ka default local7; PRI = facility × 8 + severity.</li>
<li>Syslog UDP 514, clear text, bina acknowledgement use karta hai.</li>
</ul></div>
`}};export{e as default};