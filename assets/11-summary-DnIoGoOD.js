var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started this module with a night guard and an instruction card. You now know how to write that card for a Cisco router: which alarm to listen for, which steps to run, in which order, with which permissions, and how to prove afterwards that it worked. This chapter packs everything into checklists you can revise the night before the exam.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="EEM applet anatomy">
<rect x="20" y="20" width="600" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">event manager applet NAME [authorization bypass]</text>
<rect x="20" y="75" width="600" height="40" rx="8" fill="#bae6fd"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">event syslog | timer | cli | track | interface | snmp | none  [maxrun] [ratelimit]</text>
<rect x="20" y="130" width="600" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="13">action LABEL cli | syslog | mail | set | if | regexp | wait | puts | info | reload</text>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">labels run in text order; CLI session starts in user EXEC</text>
</svg><p class="cap">The anatomy of every applet: the applet line, one event line, numbered action lines.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain on-box versus off-box automation and when EEM is the right tool.</li>
<li>Describe the architecture: event detectors, EEM server with policy director, applets and Tcl policies.</li>
<li>Write a syslog pattern that matches exactly one message type, and use occurs/period.</li>
<li>Choose between watchdog, countdown, cron and absolute timers; decode a cron entry.</li>
<li>Build CLI events with the right sync/skip combination, and on-demand applets with <code>event none</code>.</li>
<li>Trigger from track objects, interface counters and SNMP OIDs with entry and exit thresholds.</li>
<li>Chain CLI actions correctly (enable, configure terminal, commands, end) and handle prompts.</li>
<li>Order labels safely and use set, if/else/end, regexp and built-in variables.</li>
<li>Make applets work under AAA and safe with maxrun and ratelimit.</li>
<li>Verify with registered/history, debug with <code>debug event manager action cli</code>, and test with <code>event manager run</code>.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>EEM</dt><dd>Embedded Event Manager, event-driven automation inside IOS and IOS XE.</dd>
<dt>Event detector</dt><dd>Code that watches a source (syslog, timer, CLI…) and publishes events.</dd>
<dt>EEM server / policy director</dt><dd>Matches events to registered policies, runs them and keeps history (FMPD in log mnemonics).</dd>
<dt>Applet</dt><dd>A policy written as IOS configuration: one event and numbered actions.</dd>
<dt>Tcl policy</dt><dd>A script file registered with <code>event manager policy</code> from a user policy directory.</dd>
<dt>Label</dt><dd>The name of an action; labels are sorted as text.</dd>
<dt>Environment variable</dt><dd>Global value defined with <code>event manager environment</code>.</dd>
<dt>maxrun / ratelimit</dt><dd>Maximum run time (default 20 s) / minimum seconds between runs.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Answer</th></tr>
<tr><td>Events per basic applet</td><td>One (more need tags and trigger/correlate)</td></tr>
<tr><td>Labels 1, 2, 10 run as</td><td>1, 10, 2</td></tr>
<tr><td>Repeating timer / one-shot timer</td><td>watchdog / countdown</td></tr>
<tr><td>CLI session starts in</td><td>user EXEC, so first action is <code>enable</code></td></tr>
<tr><td>Default syslog action message</td><td><code>%HA_EM-6-LOG: NAME: text</code></td></tr>
<tr><td>priority critical produces</td><td><code>%HA_EM-2-LOG</code></td></tr>
<tr><td>Block a command</td><td><code>sync no skip yes</code></td></tr>
<tr><td>Decide at run time</td><td><code>sync yes</code> + _exit_status (1 run, 0 skip)</td></tr>
<tr><td>Manual start</td><td><code>event none</code> + <code>event manager run NAME</code></td></tr>
<tr><td>AAA fix</td><td><code>event manager session cli username</code> or <code>authorization bypass</code></td></tr>
<tr><td>Default maxrun</td><td>20 seconds</td></tr>
<tr><td>Matched log text / CLI output</td><td>_syslog_msg / _cli_result</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! build</span>
event manager applet NAME [authorization bypass]
 event syslog pattern "REGEX" [occurs N period S] [maxrun S] [ratelimit S]
 event timer watchdog|countdown time S
 event timer cron cron-entry "M H DOM MON DOW"
 event cli pattern "REGEX" sync no skip yes|no
 event track N state up|down|any
 event interface name IF parameter COUNTER entry-op ge entry-val N entry-type increment poll-interval S
 event snmp oid OID get-type exact entry-op ge entry-val N exit-op lt exit-val M poll-interval S
 event none
 action 1.0 syslog priority critical msg "TEXT"
 action 2.0 cli command "enable"
 action 3.0 regexp "PATTERN" "$_syslog_msg" match sub
 action 4.0 if $sub eq "VALUE"
 action 5.0 end
event manager environment NAME VALUE
event manager session cli username USER
<span class="c">! run and verify</span>
event manager run NAME
show event manager policy registered
show event manager history events
show event manager environment
debug event manager action cli</pre>

<div class="eg"><p><b>Worked example: one-minute exam answer.</b> "Construct an applet that, when GigabitEthernet0/0 loses line protocol, logs a critical message and enables GigabitEthernet0/1." Answer: the UPLINK-DOWN applet from the lab, with the LINEPROTO pattern, <code>action 1.0 syslog priority critical</code>, then enable, configure terminal, interface GigabitEthernet0/1, no shutdown, end, labelled 2.0 to 6.0.</p></div>

<div class="warn"><p><b>Common mistake.</b> Revising only the syntax. Many questions test behaviour: what runs first, what happens under AAA, why an applet fires twice. Walk through each applet in your head, action by action.</p></div>

<div class="exam"><p><b>Exam trap.</b> Distractors often use commands that sound right but do not exist, such as <code>test applet NAME</code> or <code>event manager start</code>. The manual trigger is <code>event manager run</code>, and only for <code>event none</code> applets.</p></div>

<div class="scn"><h4>From ticket to automation</h4><p>A NOC team in Kochi reviewed its tickets for three months and found the same three manual jobs again and again: enable the backup at branches, collect CPU evidence, and find out who changed a configuration. They built one applet for each, tested them with <code>event none</code> clones in the lab, gave EEM a TACACS+ identity, added maxrun and ratelimit, and rolled them out in the golden template. Night-time backup tickets dropped to zero.</p><p><b>Lesson:</b> look for repeated manual reactions in your ticket history; those are your first applets.</p></div>

<div class="iv"><p class="q">"Walk me through writing and validating an EEM applet from scratch."</p><p>Strong answer: define the trigger and pick the detector; build the pattern from a real log line; write actions with fixed-width labels, starting CLI with enable; add safety (maxrun, ratelimit, a maintenance check); consider AAA (session username); verify registration, test with an event none clone and <code>event manager run</code>, confirm the run in history and the result on the network; save the configuration and document it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Applet = one event + ordered actions; labels sort as text.</li>
<li>Pick the detector from the verb: message, schedule, command, state, counter, MIB value, on demand.</li>
<li>CLI actions start in user EXEC; AAA needs a session username or bypass.</li>
<li>Safety: specific patterns, maxrun, ratelimit, no self-triggering, careful with reload.</li>
<li>Verify with registered, history and debug action cli; test with event manager run.</li>
</ul></div>
`,hi:`
<p>Aapne yeh module ek night guard aur instruction card ke saath shuru kiya tha. Ab aap jaante ho ki Cisco router ke liye woh card kaise likhna hai: kaunsa alarm sunna hai, kaunse steps chalane hain, kis order mein, kin permissions ke saath, aur baad mein kaise saabit karna hai ki usne kaam kiya. Yeh chapter sab kuch aisi checklists mein pack karta hai jinhe aap exam se pehli raat revise kar sako.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="EEM applet anatomy">
<rect x="20" y="20" width="600" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">event manager applet NAME [authorization bypass]</text>
<rect x="20" y="75" width="600" height="40" rx="8" fill="#bae6fd"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">event syslog | timer | cli | track | interface | snmp | none  [maxrun] [ratelimit]</text>
<rect x="20" y="130" width="600" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="13">action LABEL cli | syslog | mail | set | if | regexp | wait | puts | info | reload</text>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">labels text order mein chalte hain; CLI session user EXEC mein shuru hota hai</text>
</svg><p class="cap">Har applet ki anatomy: applet line, ek event line, numbered action lines.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>On-box versus off-box automation samjhao aur batao ki EEM kab sahi tool hai.</li>
<li>Architecture describe karo: event detectors, policy director wala EEM server, applets aur Tcl policies.</li>
<li>Aisa syslog pattern likho jo bilkul ek message type match kare, aur occurs/period use karo.</li>
<li>Watchdog, countdown, cron aur absolute timers mein chuno; cron entry decode karo.</li>
<li>Sahi sync/skip combination ke saath CLI events, aur <code>event none</code> ke saath on-demand applets banao.</li>
<li>Entry aur exit thresholds ke saath track objects, interface counters aur SNMP OIDs se trigger karo.</li>
<li>CLI actions sahi jodo (enable, configure terminal, commands, end) aur prompts handle karo.</li>
<li>Labels safely order karo aur set, if/else/end, regexp aur built-in variables use karo.</li>
<li>Applets ko AAA ke neeche chalao aur maxrun aur ratelimit se safe banao.</li>
<li>Registered/history se verify karo, <code>debug event manager action cli</code> se debug karo, aur <code>event manager run</code> se test karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>EEM</dt><dd>Embedded Event Manager, IOS aur IOS XE ke andar event-driven automation.</dd>
<dt>Event detector</dt><dd>Code jo ek source (syslog, timer, CLI…) dekhta hai aur events publish karta hai.</dd>
<dt>EEM server / policy director</dt><dd>Events ko registered policies se match karta hai, unhe chalata hai aur history rakhta hai (log mnemonics mein FMPD).</dd>
<dt>Applet</dt><dd>IOS configuration ki tarah likhi policy: ek event aur numbered actions.</dd>
<dt>Tcl policy</dt><dd>Script file jo user policy directory se <code>event manager policy</code> ke saath register hoti hai.</dd>
<dt>Label</dt><dd>Action ka naam; labels text ki tarah sort hote hain.</dd>
<dt>Environment variable</dt><dd><code>event manager environment</code> se define hui global value.</dd>
<dt>maxrun / ratelimit</dt><dd>Maximum run time (default 20 s) / runs ke beech minimum seconds.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Jawab</th></tr>
<tr><td>Basic applet mein events</td><td>Ek (zyada ke liye tags aur trigger/correlate)</td></tr>
<tr><td>Labels 1, 2, 10 kaise chalte hain</td><td>1, 10, 2</td></tr>
<tr><td>Repeat timer / ek baar ka timer</td><td>watchdog / countdown</td></tr>
<tr><td>CLI session kahan shuru hota hai</td><td>user EXEC, isliye pehla action <code>enable</code></td></tr>
<tr><td>Default syslog action message</td><td><code>%HA_EM-6-LOG: NAME: text</code></td></tr>
<tr><td>priority critical kya banata hai</td><td><code>%HA_EM-2-LOG</code></td></tr>
<tr><td>Command block karna</td><td><code>sync no skip yes</code></td></tr>
<tr><td>Run time par decide karna</td><td><code>sync yes</code> + _exit_status (1 chalao, 0 skip)</td></tr>
<tr><td>Manual start</td><td><code>event none</code> + <code>event manager run NAME</code></td></tr>
<tr><td>AAA fix</td><td><code>event manager session cli username</code> ya <code>authorization bypass</code></td></tr>
<tr><td>Default maxrun</td><td>20 second</td></tr>
<tr><td>Match hua log text / CLI output</td><td>_syslog_msg / _cli_result</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! banao</span>
event manager applet NAME [authorization bypass]
 event syslog pattern "REGEX" [occurs N period S] [maxrun S] [ratelimit S]
 event timer watchdog|countdown time S
 event timer cron cron-entry "M H DOM MON DOW"
 event cli pattern "REGEX" sync no skip yes|no
 event track N state up|down|any
 event interface name IF parameter COUNTER entry-op ge entry-val N entry-type increment poll-interval S
 event snmp oid OID get-type exact entry-op ge entry-val N exit-op lt exit-val M poll-interval S
 event none
 action 1.0 syslog priority critical msg "TEXT"
 action 2.0 cli command "enable"
 action 3.0 regexp "PATTERN" "$_syslog_msg" match sub
 action 4.0 if $sub eq "VALUE"
 action 5.0 end
event manager environment NAME VALUE
event manager session cli username USER
<span class="c">! chalao aur verify karo</span>
event manager run NAME
show event manager policy registered
show event manager history events
show event manager environment
debug event manager action cli</pre>

<div class="eg"><p><b>Worked example: ek minute ka exam jawab.</b> "Aisa applet construct karo jo, jab GigabitEthernet0/0 ka line protocol jaaye, critical message log kare aur GigabitEthernet0/1 enable kare." Jawab: lab ka UPLINK-DOWN applet, LINEPROTO pattern ke saath, <code>action 1.0 syslog priority critical</code>, phir enable, configure terminal, interface GigabitEthernet0/1, no shutdown, end, labels 2.0 se 6.0.</p></div>

<div class="warn"><p><b>Common galti.</b> Sirf syntax revise karna. Kai questions behaviour test karte hain: pehle kya chalta hai, AAA ke neeche kya hota hai, applet do baar kyun fire hota hai. Har applet ko dimaag mein action by action chalao.</p></div>

<div class="exam"><p><b>Exam trap.</b> Distractors aksar aise commands use karte hain jo sahi lagte hain par exist nahi karte, jaise <code>test applet NAME</code> ya <code>event manager start</code>. Manual trigger <code>event manager run</code> hai, aur sirf <code>event none</code> applets ke liye.</p></div>

<div class="scn"><h4>Ticket se automation tak</h4><p>Kochi ki ek NOC team ne teen mahine ke tickets review kiye aur wahi teen manual kaam baar baar paaye: branches par backup enable karna, CPU saboot collect karna, aur pata karna ki configuration kisne badli. Unhone har ek ke liye ek applet banaya, lab mein <code>event none</code> clones se test kiya, EEM ko TACACS+ identity di, maxrun aur ratelimit jode, aur golden template mein roll out kiya. Raat ke backup tickets zero ho gaye.</p><p><b>Seekh:</b> apni ticket history mein baar baar hone wale manual reactions dhoondho; wahi aapke pehle applets hain.</p></div>

<div class="iv"><p class="q">"Mujhe scratch se EEM applet likhne aur validate karne ka process batao."</p><p>Strong answer: trigger define karo aur detector chuno; pattern asli log line se banao; fixed-width labels ke saath actions likho, CLI enable se shuru; safety jodo (maxrun, ratelimit, maintenance check); AAA socho (session username); registration verify karo, event none clone aur <code>event manager run</code> se test karo, history mein run aur network par result confirm karo; configuration save karo aur document karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Applet = ek event + ordered actions; labels text ki tarah sort hote hain.</li>
<li>Verb se detector chuno: message, schedule, command, state, counter, MIB value, on demand.</li>
<li>CLI actions user EXEC mein shuru hote hain; AAA ko session username ya bypass chahiye.</li>
<li>Safety: specific patterns, maxrun, ratelimit, self-triggering nahi, reload ke saath savdhaan.</li>
<li>Registered, history aur debug action cli se verify karo; event manager run se test karo.</li>
</ul></div>
`}};export{e as default};