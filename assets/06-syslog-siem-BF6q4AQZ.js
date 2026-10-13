var e={id:`syslog`,h:{en:`Syslog, log aggregation and SIEM`,hi:`Syslog, log aggregation aur SIEM`},body:{en:`
<p>Every aircraft carries a flight recorder that writes down what happened, second by second. After an incident, investigators read it to understand the sequence of events. Network devices keep their own diaries: <b>log messages</b>. The problem is that each device keeps its diary in a small memory buffer that is overwritten, and lost at reboot. <b>Syslog</b> sends copies of those diaries to a central collector, and a <b>SIEM</b> reads all the diaries together to spot patterns no single device could see.</p>

<h3>What a syslog message contains</h3>
<p>Syslog is the standard way network devices, servers and appliances send event messages. Classic syslog uses <b>UDP 514</b>; reliable delivery can use TCP, and <b>syslog over TLS</b> uses <b>TCP 6514</b> for encryption. Each message has:</p>
<ul>
<li>a <b>facility</b> (which part of the system produced it; network devices commonly use local0 to local7),</li>
<li>a <b>severity</b> from 0 to 7,</li>
<li>a <b>timestamp</b> and the device's name or address,</li>
<li>the message text, such as <code>%LINEPROTO-5-UPDOWN: Line protocol on Interface Loopback1, changed state to down</code>.</li>
</ul>

<table class="cmp"><tr><th>Level</th><th>Name</th><th>Example</th></tr>
<tr><td>0</td><td>Emergency</td><td>System unusable</td></tr>
<tr><td>1</td><td>Alert</td><td>Immediate action needed (e.g. temperature critical)</td></tr>
<tr><td>2</td><td>Critical</td><td>Hardware failure</td></tr>
<tr><td>3</td><td>Error</td><td>Interface hardware error</td></tr>
<tr><td>4</td><td>Warning</td><td>Configuration or resource warning</td></tr>
<tr><td>5</td><td>Notice / notification</td><td>Normal but significant: link up/down, configuration change</td></tr>
<tr><td>6</td><td>Informational</td><td>Routine events, ACL hits</td></tr>
<tr><td>7</td><td>Debug</td><td>Troubleshooting detail; very noisy</td></tr>
</table>
<p>A <b>lower number is more severe</b>. Setting a logging level sends that level and everything more severe. The memory aid "<b>E</b>very <b>A</b>wesome <b>C</b>omputer <b>E</b>ngineer <b>W</b>ill <b>N</b>eed <b>I</b>ce-cream <b>D</b>aily" gives the order 0 to 7.</p>

<h3>Log aggregation and the syslog collector</h3>
<p><b>Log aggregation</b> means collecting logs from many sources into one place, with consistent timestamps, so they can be searched, correlated and kept for as long as policy requires. The <b>syslog collector</b> (syslog server) is the receiver. For timestamps from different devices to line up, every device must use <b>NTP</b>, which you configured in earlier modules.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Devices send syslog to a collector feeding a SIEM">
<rect x="10" y="20" width="130" height="40" rx="8" fill="#bae6fd"/><text x="75" y="45" text-anchor="middle" class="svg-ink" font-size="13">R1, R2</text>
<rect x="10" y="80" width="130" height="40" rx="8" fill="#bae6fd"/><text x="75" y="105" text-anchor="middle" class="svg-ink" font-size="13">Switches, APs</text>
<rect x="10" y="140" width="130" height="40" rx="8" fill="#bae6fd"/><text x="75" y="165" text-anchor="middle" class="svg-ink" font-size="13">Firewalls, servers</text>
<rect x="230" y="70" width="160" height="60" rx="8" fill="#bbf7d0"/><text x="310" y="96" text-anchor="middle" class="svg-ink" font-size="13">Syslog collector</text><text x="310" y="115" text-anchor="middle" class="svg-muted" font-size="12">UDP 514 / TCP 6514</text>
<rect x="470" y="70" width="160" height="60" rx="8" fill="#fed7aa"/><text x="550" y="96" text-anchor="middle" class="svg-ink" font-size="13">SIEM</text><text x="550" y="115" text-anchor="middle" class="svg-muted" font-size="12">correlate, alert</text>
<line x1="140" y1="40" x2="230" y2="90" stroke="#64748b"/><line x1="140" y1="100" x2="230" y2="100" stroke="#64748b"/><line x1="140" y1="160" x2="230" y2="110" stroke="#64748b"/>
<line x1="390" y1="100" x2="470" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">All devices synchronised with NTP so events line up</text>
</svg><p class="cap">Many sources, one collector, one SIEM. Without NTP the timeline falls apart.</p></div>

<h3>SIEM</h3>
<p>A <b>security information and event management (SIEM)</b> system goes beyond storing logs. It <b>normalises</b> logs from different vendors into common fields, <b>correlates</b> events across sources (five failed VPN logins, then a successful one from a new country, then a firewall rule change), raises <b>alerts</b>, provides dashboards and reports for compliance, and keeps logs for the retention period. Many SIEMs also accept flow data and API feeds.</p>

<h3>Configuring syslog in the lab</h3>
<pre class="code"><span class="c">! on R1 and on R2</span>
R1(config)# logging host 192.168.50.100
R1(config)# logging trap informational
<span class="c">! optional but recommended: precise timestamps</span>
R1(config)# service timestamps log datetime msec
R1(config)# end</pre>
<p><code>logging trap</code> here sets the level sent to syslog servers (it is not an SNMP trap, despite the name). Leaving configuration mode creates a severity-5 message, so the collector should receive something immediately:</p>
<pre class="out">NMS&gt; show syslog
Syslog collector on 192.168.50.100 (UDP 514): 7 messages received
Received (UTC)   From            Sev  Message
Sep 29 18:05:16  192.168.50.1    5    &lt;189&gt;1: *Sep 29 18:05:16.507: %SYS-5-CONFIG_I: Configured from console by console
<span class="hl">Sep 29 18:05:19  10.0.12.2       5    &lt;189&gt;3: *Sep 29 18:05:19.507: %LINEPROTO-5-UPDOWN: Line protocol on Interface Loopback1, changed state to down</span></pre>
<p>Notice R2's messages arrive from 10.0.12.2, the address of the interface that faces the NMS. The <code>&lt;189&gt;</code> is the <b>priority</b> value: facility × 8 + severity. local7 is facility 23, so 23 × 8 + 5 = 189. The <b>*</b> before the timestamp means the router's clock is not synchronised by NTP.</p>

<div class="eg"><p><b>Worked example: choosing a level.</b> If you set <code>logging trap warnings</code> (4), the collector receives levels 0 to 4 only. Interface up/down messages are level 5, so they would never reach the collector, and nobody would see link flaps. Informational (6) is a common choice; debugging (7) is used only briefly while troubleshooting because it can overload the device and the collector.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Setting the syslog level too low (too severe) and missing link events. Forgetting NTP, so logs from different devices cannot be lined up. Leaving debug logging on. Sending syslog through a firewall that blocks UDP 514. Keeping logs only in the device buffer, where a reboot erases them.</p></div>

<div class="exam"><p><b>Exam trap.</b> Syslog uses <b>UDP 514</b> (TLS on TCP 6514). Severity <b>0 is the most severe</b> (emergency), 7 is debug. Setting a level includes all <b>more severe</b> levels (lower numbers). A SIEM <b>correlates</b> and alerts; a syslog server only collects.</p></div>

<div class="scn"><h4>The password spray nobody saw</h4><p>A company's VPN concentrator logged failed logins locally, but the buffer held only a few hours. Over three weeks an attacker tried common passwords against hundreds of accounts, slowly, so no single device ever showed a spike. After a breach, the company sent all firewall, VPN and domain controller logs to a SIEM. A correlation rule now alerts when failed logins for more than 20 different users come from one source within an hour. It fired twice in the first month.</p><p><b>Lesson:</b> aggregation plus correlation reveals slow, distributed events that no single device log would show.</p></div>

<div class="iv"><p class="q">"What is the difference between a syslog server and a SIEM?"</p><p>Strong answer: a syslog server receives and stores log messages (UDP 514, or TLS on TCP 6514). A SIEM ingests logs and other data from many sources, normalises them, correlates events across devices, raises alerts, supports investigations and compliance reports, and enforces retention. Mention severity levels, NTP for consistent timestamps, and that you choose the level carefully so link events are not filtered out.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Syslog carries facility, severity (0 most severe to 7 debug), timestamp and text; UDP 514, TLS on TCP 6514.</li>
<li>A logging level sends that level and everything more severe.</li>
<li>Log aggregation centralises logs; NTP makes their timestamps comparable.</li>
<li>A SIEM normalises, correlates, alerts and retains; a collector only stores.</li>
<li>In the lab: <code>logging host 192.168.50.100</code> and <code>logging trap informational</code>, checked with <code>show syslog</code> on the NMS.</li>
</ul></div>
`,hi:`
<p>Har aircraft mein ek flight recorder hota hai jo second by second likhta hai ki kya hua. Incident ke baad investigators events ka sequence samajhne ke liye use padhte hain. Network devices bhi apni diaries rakhte hain: <b>log messages</b>. Problem yeh hai ki har device apni diary ek chhote memory buffer mein rakhta hai jo overwrite ho jaata hai, aur reboot par kho jaata hai. <b>Syslog</b> un diaries ki copies ek central collector ko bhejta hai, aur <b>SIEM</b> saari diaries ek saath padh kar aise patterns pakadta hai jo koi ek device nahi dekh sakta.</p>

<h3>Syslog message mein kya hota hai</h3>
<p>Syslog woh standard tareeka hai jisse network devices, servers aur appliances event messages bhejte hain. Classic syslog <b>UDP 514</b> use karta hai; reliable delivery ke liye TCP use ho sakta hai, aur <b>syslog over TLS</b> encryption ke liye <b>TCP 6514</b> use karta hai. Har message mein hota hai:</p>
<ul>
<li>ek <b>facility</b> (system ke kis hisse ne banaya; network devices aam taur par local0 se local7 use karte hain),</li>
<li>0 se 7 tak ek <b>severity</b>,</li>
<li>ek <b>timestamp</b> aur device ka naam ya address,</li>
<li>message text, jaise <code>%LINEPROTO-5-UPDOWN: Line protocol on Interface Loopback1, changed state to down</code>.</li>
</ul>

<table class="cmp"><tr><th>Level</th><th>Naam</th><th>Example</th></tr>
<tr><td>0</td><td>Emergency</td><td>System use karne laayak nahi</td></tr>
<tr><td>1</td><td>Alert</td><td>Turant action chahiye (jaise temperature critical)</td></tr>
<tr><td>2</td><td>Critical</td><td>Hardware failure</td></tr>
<tr><td>3</td><td>Error</td><td>Interface hardware error</td></tr>
<tr><td>4</td><td>Warning</td><td>Configuration ya resource warning</td></tr>
<tr><td>5</td><td>Notice / notification</td><td>Normal lekin significant: link up/down, configuration change</td></tr>
<tr><td>6</td><td>Informational</td><td>Routine events, ACL hits</td></tr>
<tr><td>7</td><td>Debug</td><td>Troubleshooting detail; bahut noisy</td></tr>
</table>
<p><b>Chhota number zyada serious</b> hai. Logging level set karne par woh level aur usse zyada serious sab bheja jaata hai. Yaad rakhne ke liye "<b>E</b>very <b>A</b>wesome <b>C</b>omputer <b>E</b>ngineer <b>W</b>ill <b>N</b>eed <b>I</b>ce-cream <b>D</b>aily" 0 se 7 ka order deta hai.</p>

<h3>Log aggregation aur syslog collector</h3>
<p><b>Log aggregation</b> ka matlab bahut saare sources ke logs ek jagah jama karna, consistent timestamps ke saath, taaki unhe search, correlate kiya ja sake aur jitna policy kahe utne samay rakha ja sake. <b>Syslog collector</b> (syslog server) receiver hai. Alag devices ke timestamps match hon, iske liye har device ko <b>NTP</b> use karna chahiye, jo aapne pichhle modules mein configure kiya tha.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Devices syslog collector ko bhejte hain jo SIEM ko feed karta hai">
<rect x="10" y="20" width="130" height="40" rx="8" fill="#bae6fd"/><text x="75" y="45" text-anchor="middle" class="svg-ink" font-size="13">R1, R2</text>
<rect x="10" y="80" width="130" height="40" rx="8" fill="#bae6fd"/><text x="75" y="105" text-anchor="middle" class="svg-ink" font-size="13">Switches, APs</text>
<rect x="10" y="140" width="130" height="40" rx="8" fill="#bae6fd"/><text x="75" y="165" text-anchor="middle" class="svg-ink" font-size="13">Firewalls, servers</text>
<rect x="230" y="70" width="160" height="60" rx="8" fill="#bbf7d0"/><text x="310" y="96" text-anchor="middle" class="svg-ink" font-size="13">Syslog collector</text><text x="310" y="115" text-anchor="middle" class="svg-muted" font-size="12">UDP 514 / TCP 6514</text>
<rect x="470" y="70" width="160" height="60" rx="8" fill="#fed7aa"/><text x="550" y="96" text-anchor="middle" class="svg-ink" font-size="13">SIEM</text><text x="550" y="115" text-anchor="middle" class="svg-muted" font-size="12">correlate, alert</text>
<line x1="140" y1="40" x2="230" y2="90" stroke="#64748b"/><line x1="140" y1="100" x2="230" y2="100" stroke="#64748b"/><line x1="140" y1="160" x2="230" y2="110" stroke="#64748b"/>
<line x1="390" y1="100" x2="470" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Saare devices NTP se synced taaki events line up hon</text>
</svg><p class="cap">Bahut saare sources, ek collector, ek SIEM. NTP ke bina timeline bikhar jaati hai.</p></div>

<h3>SIEM</h3>
<p><b>Security information and event management (SIEM)</b> system logs store karne se aage jaata hai. Yeh alag vendors ke logs ko common fields mein <b>normalise</b> karta hai, sources ke beech events <b>correlate</b> karta hai (paanch failed VPN logins, phir naye desh se ek successful, phir firewall rule change), <b>alerts</b> raise karta hai, compliance ke liye dashboards aur reports deta hai, aur retention period tak logs rakhta hai. Bahut saare SIEMs flow data aur API feeds bhi lete hain.</p>

<h3>Lab mein syslog configure karna</h3>
<pre class="code"><span class="c">! R1 aur R2 dono par</span>
R1(config)# logging host 192.168.50.100
R1(config)# logging trap informational
<span class="c">! optional lekin recommended: precise timestamps</span>
R1(config)# service timestamps log datetime msec
R1(config)# end</pre>
<p>Yahan <code>logging trap</code> syslog servers ko bheja jaane wala level set karta hai (naam ke bawajood yeh SNMP trap nahi hai). Configuration mode se bahar aane par severity-5 message banta hai, isliye collector ko turant kuch milna chahiye:</p>
<pre class="out">NMS&gt; show syslog
Syslog collector on 192.168.50.100 (UDP 514): 7 messages received
Received (UTC)   From            Sev  Message
Sep 29 18:05:16  192.168.50.1    5    &lt;189&gt;1: *Sep 29 18:05:16.507: %SYS-5-CONFIG_I: Configured from console by console
<span class="hl">Sep 29 18:05:19  10.0.12.2       5    &lt;189&gt;3: *Sep 29 18:05:19.507: %LINEPROTO-5-UPDOWN: Line protocol on Interface Loopback1, changed state to down</span></pre>
<p>Dhyaan do ki R2 ke messages 10.0.12.2 se aate hain, us interface ka address jo NMS ki taraf hai. <code>&lt;189&gt;</code> <b>priority</b> value hai: facility × 8 + severity. local7 facility 23 hai, isliye 23 × 8 + 5 = 189. Timestamp se pehle <b>*</b> ka matlab router ki clock NTP se synchronised nahi hai.</p>

<div class="eg"><p><b>Worked example: level chunna.</b> Agar aap <code>logging trap warnings</code> (4) set karte ho, to collector ko sirf levels 0 se 4 milte hain. Interface up/down messages level 5 hain, isliye woh collector tak kabhi nahi pahunchenge, aur link flaps kisi ko nahi dikhenge. Informational (6) common choice hai; debugging (7) sirf troubleshooting ke dauraan thodi der use hota hai kyunki yeh device aur collector ko overload kar sakta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Syslog level bahut neecha (bahut serious) set karna aur link events miss karna. NTP bhoolna, taaki alag devices ke logs line up na ho sakein. Debug logging on chhod dena. Syslog ko aise firewall se bhejna jo UDP 514 block karta hai. Logs sirf device buffer mein rakhna, jahan reboot unhe mita deta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Syslog <b>UDP 514</b> use karta hai (TLS TCP 6514 par). Severity <b>0 sabse serious</b> hai (emergency), 7 debug. Level set karne mein saare <b>zyada serious</b> levels (chhote numbers) shamil hote hain. SIEM <b>correlate</b> aur alert karta hai; syslog server sirf collect karta hai.</p></div>

<div class="scn"><h4>Password spray jo kisi ne nahi dekha</h4><p>Ek company ka VPN concentrator failed logins locally log karta tha, lekin buffer sirf kuch ghante ka data rakhta tha. Teen hafton tak ek attacker ne sainkdon accounts par common passwords dheere dheere try kiye, taaki kisi ek device par kabhi spike na dikhe. Breach ke baad company ne saare firewall, VPN aur domain controller logs SIEM ko bhejne shuru kiye. Ab ek correlation rule tab alert karta hai jab ek ghante mein ek hi source se 20 se zyada alag users ke failed logins aate hain. Pehle mahine mein yeh do baar fire hua.</p><p><b>Seekh:</b> aggregation aur correlation dheere, bikhre hue events dikhate hain jo koi single device log nahi dikhata.</p></div>

<div class="iv"><p class="q">"Syslog server aur SIEM mein kya farak hai?"</p><p>Strong answer: syslog server log messages receive aur store karta hai (UDP 514, ya TLS TCP 6514 par). SIEM bahut saare sources se logs aur doosra data leta hai, unhe normalise karta hai, devices ke beech events correlate karta hai, alerts raise karta hai, investigations aur compliance reports mein madad karta hai, aur retention enforce karta hai. Severity levels, consistent timestamps ke liye NTP, aur yeh ki level dhyaan se chuna jaata hai taaki link events filter na ho jaayein, iska zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Syslog facility, severity (0 sabse serious se 7 debug), timestamp aur text le jaata hai; UDP 514, TLS TCP 6514 par.</li>
<li>Logging level woh level aur usse zyada serious sab bhejta hai.</li>
<li>Log aggregation logs ko centralise karta hai; NTP unke timestamps ko comparable banata hai.</li>
<li>SIEM normalise, correlate, alert aur retain karta hai; collector sirf store karta hai.</li>
<li>Lab mein: <code>logging host 192.168.50.100</code> aur <code>logging trap informational</code>, NMS par <code>show syslog</code> se check.</li>
</ul></div>
`}};export{e as default};