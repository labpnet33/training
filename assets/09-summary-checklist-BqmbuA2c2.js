var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>At the end of a long trip you unpack the bag and check the list: passport, tickets, charger. This chapter is that list for Log View. It repeats the facts that decide most tickets, so read it slowly once and then use it as a quick revision before an interview or a practical test. The module covered how to read and search the logs that FortiGates send to FAZ-1; the skills overlap with vendor administrator-level skills, but this is independent training and not exam preparation.</p>

<h3>What you should be able to do</h3>
<ol>
<li>Name the three log families and say which question each answers: traffic (session decision), UTM (profile verdict), event (device change).</li>
<li>Read a traffic log in five groups and pick out srcip, dstip, dstport, action, utmaction, policyid and devname in ten seconds.</li>
<li>Write a Log View search with ADOM, device, type and conditions using equal, not equal, contains, comparison and star.</li>
<li>Turn a ticket sentence into conditions and follow a session from the UTM log to the traffic log by sessionid.</li>
<li>Choose the right ADOM and device, and explain why a zero result may be a wrong name, an empty device or an archive.</li>
<li>Walk the logging chain for missing logs: logtraffic, filter and severity, implicit deny, queue and upload, transport, registration.</li>
<li>Use show full-configuration to see default values, and miglogd 6 to read upload, queued, sent and lost.</li>
<li>Run the five-step investigation: symptom, log, policy, fix, verify.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Module map">
<rect x="8" y="30" width="146" height="60" rx="8" fill="#bae6fd"/><text x="81" y="56" text-anchor="middle" class="svg-ink" font-size="13">Types and fields</text><text x="81" y="74" text-anchor="middle" class="svg-muted" font-size="12">chapters 1, 2</text>
<rect x="170" y="30" width="146" height="60" rx="8" fill="#ddd6fe"/><text x="243" y="56" text-anchor="middle" class="svg-ink" font-size="13">Filters, scope</text><text x="243" y="74" text-anchor="middle" class="svg-muted" font-size="12">chapters 3, 4</text>
<rect x="332" y="30" width="146" height="60" rx="8" fill="#fde68a"/><text x="405" y="56" text-anchor="middle" class="svg-ink" font-size="13">Missing, late</text><text x="405" y="74" text-anchor="middle" class="svg-muted" font-size="12">chapter 5</text>
<rect x="494" y="30" width="138" height="60" rx="8" fill="#bbf7d0"/><text x="563" y="56" text-anchor="middle" class="svg-ink" font-size="13">Investigation, labs</text><text x="563" y="74" text-anchor="middle" class="svg-muted" font-size="12">chapters 6 to 8</text>
</svg><p class="cap">The four blocks of the module.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Traffic log</dt><dd>One record per session with the policy decision (type traffic, subtype forward).</dd>
<dt>UTM log</dt><dd>The verdict of a security profile such as application control (type utm).</dd>
<dt>Event log</dt><dd>A record about the device itself; synthetic and configuration-only in the simulator.</dd>
<dt>sessionid</dt><dd>The number that links the traffic log and the UTM log of one session.</dd>
<dt>action / utmaction</dt><dd>Policy result (accept, deny) and profile result (block, allow) on a traffic log.</dd>
<dt>itime</dt><dd>The time the FortiAnalyzer received the log.</dd>
<dt>logtraffic</dt><dd>Policy setting: disable, utm (default, security events only) or all.</dd>
<dt>upload-option</dt><dd>realtime, 1-minute or 5-minute: how often the FortiGate sends its queue.</dd>
<dt>Analytics / archive</dt><dd>Searchable logs versus old compressed logs that Log View cannot search.</dd>
<dt>ADOM</dt><dd>Administrative domain: the container whose logs one search covers.</dd>
</dl>

<h3>The most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Filters</td><td>All conditions must match; star is the wildcard, tilde means contains; an unknown field is refused, a wrong value gives zero.</td></tr>
<tr><td>Blocked by profile</td><td>The traffic log says accept with utmaction block; the UTM log says block.</td></tr>
<tr><td>Missing logs</td><td>logtraffic utm with no security profile logs nothing; show hides the default.</td></tr>
<tr><td>Late logs</td><td>A batch upload option holds logs in the queue; realtime sends every second.</td></tr>
<tr><td>Old logs</td><td>Only analytics logs are searchable; archived logs are not.</td></tr>
<tr><td>Simulator limits</td><td>execute fazui commands, config system log quota and config faz commands are stand-ins; FortiView, saved searches and time range are theory.</td></tr></table>

<div class="eg"><p><b>Worked checklist run.</b> Ticket: "The Trichy PC cannot reach a file-sharing site and we see no log." Do: device table (counters), miglogd 6 on TRY-FGT, show full-configuration of the policy, correct logtraffic, new traffic, UTM search by source, read devname and policyid, report. If you can do this without notes, the module is done.</p></div>

<div class="warn"><p><b>Last reminders.</b> Do not trust a zero until you have checked ADOM, device name and the age of the period. Do not trust plain show for defaults. Remember that the real Log View is a GUI with a time range, and that the simulator command is only a stand-in.</p></div>

<div class="exam"><p><b>Exam traps.</b> Mixing action and utmaction; searching traffic for a verdict; reading date and time as the receive time; believing archived logs are searchable; assuming a connection test proves logs are written.</p></div>

<div class="scn"><h4>The one-page runbook</h4><p>After three tickets in one week, the Kaveri Retail team wrote a one-page runbook: five search commands, the logging chain with the miglogd command, and the rule "compare with a working site". New engineers closed their first log tickets within a day. The runbook did the job that saved searches would do in a GUI.</p><p><b>Lesson:</b> turn what you learned into a short, repeatable checklist for the team.</p></div>

<div class="iv"><p class="q">"What would you check first if Log View is empty for one branch?"</p><p>Exact ADOM and device name, then the device log counters, then on the FortiGate the logtraffic value, the filter and severity, and the queue and upload option. I would only then look at registration and the connection, and finally the age of the period against retention.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pick the log type first, then ADOM and device, then conditions.</li>
<li>A profile block shows accept in action and block in utmaction of the traffic log.</li>
<li>Walk the logging chain from the policy to the FortiAnalyzer for missing or late logs.</li>
<li>Only analytics logs are searchable; zero can also mean wrong name or archive.</li>
<li>Always verify a fix with new traffic and a new search.</li>
</ul></div>
`,hi:`
<p>Lambi trip ke end mein bag kholkar list check karte ho: passport, tickets, charger. Ye chapter Log View ke liye wahi list hai. Ye wo facts dohrata hai jo zyaadatar tickets decide karte hain, to ise ek baar dhyan se padho aur phir interview ya practical test se pehle quick revision ki tarah use karo. Module ne cover kiya ki FortiGates jo logs FAZ-1 ko bhejte hain unhe kaise padhein aur search karein; ye skills vendor administrator-level skills se overlap karte hain, par ye independent training hai, exam preparation nahi.</p>

<h3>Aap kya kar sakte ho</h3>
<ol>
<li>Teen log families ke naam batao aur kaho har ek kaun sa sawaal answer karti hai: traffic (session decision), UTM (profile verdict), event (device change).</li>
<li>Traffic log ko paanch groups mein padho aur srcip, dstip, dstport, action, utmaction, policyid aur devname dus second mein pehchaano.</li>
<li>ADOM, device, type aur conditions ke saath Log View search likho jisme equal, not equal, contains, comparison aur star ho.</li>
<li>Ticket sentence ko conditions mein badlo aur sessionid se UTM log se traffic log tak session follow karo.</li>
<li>Sahi ADOM aur device chuno, aur explain karo ki zero result galat name, khaali device ya archive kyun ho sakta hai.</li>
<li>Missing logs ke liye logging chain chalo: logtraffic, filter aur severity, implicit deny, queue aur upload, transport, registration.</li>
<li>Default values dekhne ke liye show full-configuration aur upload, queued, sent, lost padhne ke liye miglogd 6 use karo.</li>
<li>Paanch-step investigation chalao: symptom, log, policy, fix, verify.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Module map">
<rect x="8" y="30" width="146" height="60" rx="8" fill="#bae6fd"/><text x="81" y="56" text-anchor="middle" class="svg-ink" font-size="13">Types aur fields</text><text x="81" y="74" text-anchor="middle" class="svg-muted" font-size="12">chapters 1, 2</text>
<rect x="170" y="30" width="146" height="60" rx="8" fill="#ddd6fe"/><text x="243" y="56" text-anchor="middle" class="svg-ink" font-size="13">Filters, scope</text><text x="243" y="74" text-anchor="middle" class="svg-muted" font-size="12">chapters 3, 4</text>
<rect x="332" y="30" width="146" height="60" rx="8" fill="#fde68a"/><text x="405" y="56" text-anchor="middle" class="svg-ink" font-size="13">Missing, late</text><text x="405" y="74" text-anchor="middle" class="svg-muted" font-size="12">chapter 5</text>
<rect x="494" y="30" width="138" height="60" rx="8" fill="#bbf7d0"/><text x="563" y="56" text-anchor="middle" class="svg-ink" font-size="13">Investigation, labs</text><text x="563" y="74" text-anchor="middle" class="svg-muted" font-size="12">chapters 6 se 8</text>
</svg><p class="cap">Module ke chaar blocks.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Traffic log</dt><dd>Policy decision ke saath har session ka ek record (type traffic, subtype forward).</dd>
<dt>UTM log</dt><dd>Application control jaise security profile ka verdict (type utm).</dd>
<dt>Event log</dt><dd>Device ke baare mein record; simulator mein synthetic aur sirf configuration-only.</dd>
<dt>sessionid</dt><dd>Wo number jo ek session ke traffic log aur UTM log ko link karta hai.</dd>
<dt>action / utmaction</dt><dd>Traffic log par policy result (accept, deny) aur profile result (block, allow).</dd>
<dt>itime</dt><dd>Wo time jab FortiAnalyzer ne log receive kiya.</dd>
<dt>logtraffic</dt><dd>Policy setting: disable, utm (default, sirf security events) ya all.</dd>
<dt>upload-option</dt><dd>realtime, 1-minute ya 5-minute: FortiGate apni queue kitni baar bhejta hai.</dd>
<dt>Analytics / archive</dt><dd>Searchable logs versus purane compressed logs jo Log View search nahi kar sakta.</dd>
<dt>ADOM</dt><dd>Administrative domain: wo container jiske logs ek search cover karta hai.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Filters</td><td>Saari conditions match hoti hain; star wildcard hai, tilde contains hai; unknown field refuse hota hai, galat value zero deti hai.</td></tr>
<tr><td>Profile se blocked</td><td>Traffic log accept aur utmaction block kehta hai; UTM log block kehta hai.</td></tr>
<tr><td>Missing logs</td><td>Security profile ke bina logtraffic utm kuch log nahi karta; show default chhupata hai.</td></tr>
<tr><td>Late logs</td><td>Batch upload option logs ko queue mein rokta hai; realtime har second bhejta hai.</td></tr>
<tr><td>Purane logs</td><td>Sirf analytics logs searchable hain; archived logs nahi.</td></tr>
<tr><td>Simulator limits</td><td>execute fazui commands, config system log quota aur config faz commands stand-ins hain; FortiView, saved searches aur time range theory hain.</td></tr></table>

<div class="eg"><p><b>Worked checklist run.</b> Ticket: "Trichy PC file-sharing site tak nahi pahunch pa raha aur koi log nahi dikhta." Karo: device table (counters), TRY-FGT par miglogd 6, policy ka show full-configuration, logtraffic sahi karo, naya traffic, source se UTM search, devname aur policyid padho, report karo. Agar ye bina notes ke kar sako to module complete hai.</p></div>

<div class="warn"><p><b>Aakhri reminders.</b> Zero par tab tak bharosa mat karo jab tak ADOM, device name aur period ki age check na ho. Defaults ke liye plain show par bharosa mat karo. Yaad rakho ki real Log View time range wala GUI hai, aur simulator command sirf stand-in hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> action aur utmaction ko mix karna; verdict ke liye traffic search karna; date aur time ko receive time padhna; archived logs ko searchable maanna; ye maanna ki connection test prove karta hai ki logs likhe ja rahe hain.</p></div>

<div class="scn"><h4>Ek-page ka runbook</h4><p>Ek hafte mein teen tickets ke baad Kaveri Retail team ne ek-page ka runbook likha: paanch search commands, miglogd command ke saath logging chain, aur rule "working site se compare karo". Naye engineers ne apne pehle log tickets ek din mein close kiye. Runbook ne wo kaam kiya jo GUI mein saved searches karte hain.</p><p><b>Lesson:</b> jo seekha use team ke liye chhoti, repeatable checklist mein badlo.</p></div>

<div class="iv"><p class="q">"Ek branch ke liye Log View khaali ho to pehle kya check karoge?"</p><p>Exact ADOM aur device name, phir device log counters, phir FortiGate par logtraffic value, filter aur severity, aur queue aur upload option. Uske baad hi registration aur connection dekhunga, aur aakhir mein period ki age retention ke against.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle log type chuno, phir ADOM aur device, phir conditions.</li>
<li>Profile block traffic log ke action mein accept aur utmaction mein block dikhata hai.</li>
<li>Missing ya late logs ke liye policy se FortiAnalyzer tak logging chain chalo.</li>
<li>Sirf analytics logs searchable hain; zero ka matlab galat name ya archive bhi ho sakta hai.</li>
<li>Fix ko hamesha naye traffic aur naye search se verify karo.</li>
</ul></div>
`}};export{e as default};