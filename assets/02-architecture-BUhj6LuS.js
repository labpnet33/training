var e={id:`architecture`,h:{en:`EEM architecture: detectors, the EEM server and policies`,hi:`EEM architecture: detectors, EEM server aur policies`},body:{en:`
<p>Think of a hospital. Sensors on each bed (heart rate, oxygen, a call button) raise alerts. A central nursing station receives every alert, checks which doctor's instructions apply, and dispatches the right nurse with the right checklist. The sensors do not decide anything; the station matches alerts to instructions; the nurse carries out the steps. EEM is built exactly the same way, with three layers.</p>

<h3>Layer 1: event detectors</h3>
<p>An <b>event detector</b> is a small piece of IOS code that watches one kind of thing and <b>publishes</b> an event when something interesting happens. Each detector has its own keyword in the applet's <code>event</code> line:</p>
<ul>
<li><b>syslog</b>: a log message matches a regular expression.</li>
<li><b>timer</b>: watchdog (repeating), countdown (once), cron (calendar), absolute (a fixed moment).</li>
<li><b>cli</b>: someone types a command matching a pattern.</li>
<li><b>track</b>: an object-tracking object (interface, IP SLA, route) changes state.</li>
<li><b>interface</b>: an interface counter such as input errors crosses a threshold.</li>
<li><b>snmp</b>: a local MIB object (OID) crosses a threshold, for example CPU utilisation.</li>
<li><b>none</b>: no automatic trigger; the policy runs only when you type <code>event manager run</code>.</li>
</ul>
<p>There are more detectors (online insertion and removal, routing table changes, IP SLA, NetFlow, redundancy, counter, resource), but the list above is what ENCOR expects you to use.</p>

<h3>Layer 2: the EEM server and policy director</h3>
<p>The <b>EEM server</b> is the core. Detectors publish events to it; policies <b>subscribe</b> to events when they are registered. When an event arrives, the server compares it against every registered subscription, and for each match it queues the policy for execution. The part that runs the policy is called the <b>policy director</b>; you will see its old internal name, Fault Manager Policy Director, in log mnemonics that start with <code>FMPD</code>, for example <code>%HA_EM-3-FMPD_ERROR</code>. The server also keeps the <b>history</b> of runs that you read with <code>show event manager history events</code>, and it enforces limits such as the maximum run time.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="EEM architecture">
<rect x="20" y="20" width="150" height="210" rx="8" fill="#bae6fd"/><text x="95" y="44" text-anchor="middle" class="svg-ink" font-size="14">Event detectors</text>
<text x="95" y="74" text-anchor="middle" class="svg-muted" font-size="12">syslog</text><text x="95" y="98" text-anchor="middle" class="svg-muted" font-size="12">timer</text><text x="95" y="122" text-anchor="middle" class="svg-muted" font-size="12">cli</text><text x="95" y="146" text-anchor="middle" class="svg-muted" font-size="12">track</text><text x="95" y="170" text-anchor="middle" class="svg-muted" font-size="12">interface, snmp</text><text x="95" y="194" text-anchor="middle" class="svg-muted" font-size="12">none</text>
<rect x="240" y="60" width="170" height="130" rx="8" fill="#ddd6fe"/><text x="325" y="88" text-anchor="middle" class="svg-ink" font-size="14">EEM server</text><text x="325" y="112" text-anchor="middle" class="svg-muted" font-size="12">match subscriptions</text><text x="325" y="134" text-anchor="middle" class="svg-muted" font-size="12">queue and run</text><text x="325" y="156" text-anchor="middle" class="svg-muted" font-size="12">history, maxrun</text>
<rect x="480" y="30" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="550" y="60" text-anchor="middle" class="svg-ink" font-size="14">Applets</text><text x="550" y="80" text-anchor="middle" class="svg-muted" font-size="12">in running-config</text>
<rect x="480" y="150" width="140" height="70" rx="8" fill="#fde68a"/><text x="550" y="180" text-anchor="middle" class="svg-ink" font-size="14">Tcl policies</text><text x="550" y="200" text-anchor="middle" class="svg-muted" font-size="12">files on flash</text>
<line x1="170" y1="125" x2="240" y2="125" stroke="#64748b" stroke-width="2"/><text x="205" y="116" text-anchor="middle" class="svg-accent" font-size="12">publish</text>
<line x1="410" y1="100" x2="480" y2="70" stroke="#64748b" stroke-width="2"/><line x1="410" y1="150" x2="480" y2="185" stroke="#64748b" stroke-width="2"/>
<text x="445" y="130" text-anchor="middle" class="svg-accent" font-size="12">run</text>
</svg><p class="cap">Detectors publish events; the EEM server matches them to registered policies and runs them.</p></div>

<h3>Layer 3: policies (applets and Tcl scripts)</h3>
<p>A <b>policy</b> is what you write. There are two main kinds:</p>
<table class="cmp"><tr><th></th><th>Applet</th><th>Tcl policy</th></tr>
<tr><td>Written in</td><td>IOS configuration commands</td><td>Tcl script file (.tcl)</td></tr>
<tr><td>Stored in</td><td>running-config / startup-config</td><td>flash, registered from a policy directory</td></tr>
<tr><td>Registered by</td><td>leaving applet configuration mode</td><td><code>event manager policy NAME.tcl type user</code></td></tr>
<tr><td>Power</td><td>set, if, while, foreach, regexp, cli, mail</td><td>full programming language, files, procedures</td></tr>
<tr><td>Exam focus</td><td><b>Yes (objective 6.6)</b></td><td>Concept only</td></tr></table>
<p>For a Tcl policy you first tell IOS where user policies live, then register the file:</p>
<pre class="code">BRANCH(config)# event manager directory user policy "flash:/eem"
BRANCH(config)# event manager policy collect_cpu.tcl type user
<span class="c">! the event is declared inside the script itself with ::cisco::eem::event_register_...</span></pre>
<p>Recent IOS XE releases can also run EEM policies written in Python through the guest shell, but for the exam, think "applet = CLI, Tcl = script".</p>

<h3>Registration and environment variables</h3>
<p>An applet is <b>registered</b> with the EEM server when you leave applet configuration mode. If it has a valid event line, it appears in <code>show event manager policy registered</code> and starts listening. You can also define global <b>environment variables</b> that every policy can read, which keeps values like interface names or mail addresses out of the applet body:</p>
<pre class="code">BRANCH(config)# event manager environment _backup_if GigabitEthernet0/1
BRANCH(config)# event manager environment _noc_mail noc@branch.example
<span class="c">! used inside actions as $_backup_if and $_noc_mail</span></pre>
<pre class="out">BRANCH# show event manager environment
No.  Name                          Value
<span class="hl">1    _backup_if                    GigabitEthernet0/1</span>
2    _noc_mail                     noc@branch.example</pre>

<h3>One event per applet, or correlated events</h3>
<p>A classic applet has <b>one</b> <code>event</code> statement. If you enter a second one, it replaces the first. From EEM 3.0 you may give several events a <b>tag</b> and combine them in a <code>trigger</code> block:</p>
<pre class="code">event manager applet WAN-WATCH
 event tag E1 syslog pattern "LINEPROTO-5-UPDOWN.*GigabitEthernet0/0, changed state to down"
 event tag E2 track 1 state down
 trigger
  correlate event E1 or event E2
 action 1.0 syslog priority critical msg "WAN failure detected"</pre>
<p>Current IOS XE runs EEM version 4.0; <code>show event manager version</code> tells you what your box supports.</p>

<div class="eg"><p><b>Worked example.</b> At 02:14:05 ISP shuts its Gi0/0. BRANCH logs the LINK and LINEPROTO messages for its own Gi0/0. The syslog detector publishes each message to the EEM server. The server compares them with two subscriptions: HEARTBEAT (timer, no match) and UPLINK-DOWN (syslog pattern). Only the LINEPROTO line matches the pattern, so one job is queued, the policy director runs actions 1.0 to 6.0, and one line is added to the history.</p></div>

<div class="warn"><p><b>Common mistake.</b> Copying a Tcl script to flash and expecting it to run. Without <code>event manager directory user policy</code> and <code>event manager policy NAME type user</code> the script is just a file. Also, applets live in the running-config: forget <code>copy running-config startup-config</code> and they vanish after a reload.</p></div>

<div class="exam"><p><b>Exam trap.</b> A basic applet has exactly one event and many actions. A question that shows two plain <code>event</code> lines in one applet is testing whether you know the second overwrites the first. Multiple events need tags and a <code>trigger</code> with <code>correlate</code>.</p></div>

<div class="scn"><h4>The script that never ran</h4><p>A senior engineer wrote a Tcl policy to collect <code>show</code> outputs during memory leaks and copied it to <code>flash:/eem</code> on 40 switches with a file-transfer tool. Weeks later a leak happened and nothing was collected. <code>show event manager policy registered</code> was empty. The deployment had skipped the two registration commands, so the EEM server had no subscription at all. The team added the directory and policy commands to the golden template and a compliance check for the registered policy.</p><p><b>Lesson:</b> a policy that is not registered does not exist for EEM. Always verify registration.</p></div>

<div class="iv"><p class="q">"Describe the EEM architecture."</p><p>Strong answer: three parts. Event detectors watch sources such as syslog, timers, CLI, object tracking, interface counters and SNMP, and publish events. The EEM server, with its policy director, matches events against registered policies, schedules them, enforces limits and keeps history. Policies are either applets, written as IOS configuration, or Tcl scripts registered from flash. Mention environment variables and that applets are saved in the configuration.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Event detectors publish; the EEM server matches and schedules; the policy director runs the policy.</li>
<li>Applets are IOS configuration; Tcl policies are files that must be registered from a user policy directory.</li>
<li>One plain event per applet; multiple events need tags and a trigger with correlate.</li>
<li>Global variables come from <code>event manager environment</code> and are read as <code>$_name</code>.</li>
<li>Log mnemonics starting with FMPD come from the policy director.</li>
</ul></div>
`,hi:`
<p>Ek hospital socho. Har bed par sensors (heart rate, oxygen, call button) alerts uthate hain. Ek central nursing station har alert receive karta hai, check karta hai ki kaunse doctor ke instructions lagu hote hain, aur sahi checklist ke saath sahi nurse bhejta hai. Sensors kuch decide nahi karte; station alerts ko instructions se match karta hai; nurse steps poore karti hai. EEM bilkul isi tarah, teen layers mein bana hai.</p>

<h3>Layer 1: event detectors</h3>
<p><b>Event detector</b> IOS code ka chhota hissa hai jo ek tarah ki cheez dekhta hai aur kuch interesting hone par event <b>publish</b> karta hai. Har detector ka applet ki <code>event</code> line mein apna keyword hai:</p>
<ul>
<li><b>syslog</b>: log message regular expression se match kare.</li>
<li><b>timer</b>: watchdog (repeat), countdown (ek baar), cron (calendar), absolute (ek fixed pal).</li>
<li><b>cli</b>: koi pattern se match hone wala command type kare.</li>
<li><b>track</b>: object-tracking object (interface, IP SLA, route) ka state badle.</li>
<li><b>interface</b>: input errors jaisa interface counter threshold cross kare.</li>
<li><b>snmp</b>: local MIB object (OID) threshold cross kare, jaise CPU utilisation.</li>
<li><b>none</b>: koi automatic trigger nahi; policy sirf tab chalti hai jab aap <code>event manager run</code> type karo.</li>
</ul>
<p>Aur bhi detectors hain (online insertion and removal, routing table changes, IP SLA, NetFlow, redundancy, counter, resource), par upar wali list woh hai jo ENCOR aapse use karwana chahta hai.</p>

<h3>Layer 2: EEM server aur policy director</h3>
<p><b>EEM server</b> core hai. Detectors events use publish karte hain; policies register hote waqt events ko <b>subscribe</b> karti hain. Jab event aata hai, server use har registered subscription se compare karta hai, aur har match ke liye policy ko execution ke liye queue karta hai. Jo hissa policy chalata hai use <b>policy director</b> kehte hain; iska purana internal naam, Fault Manager Policy Director, aapko <code>FMPD</code> se shuru hone wale log mnemonics mein dikhega, jaise <code>%HA_EM-3-FMPD_ERROR</code>. Server runs ki <b>history</b> bhi rakhta hai jo aap <code>show event manager history events</code> se padhte ho, aur maximum run time jaise limits enforce karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="EEM architecture">
<rect x="20" y="20" width="150" height="210" rx="8" fill="#bae6fd"/><text x="95" y="44" text-anchor="middle" class="svg-ink" font-size="14">Event detectors</text>
<text x="95" y="74" text-anchor="middle" class="svg-muted" font-size="12">syslog</text><text x="95" y="98" text-anchor="middle" class="svg-muted" font-size="12">timer</text><text x="95" y="122" text-anchor="middle" class="svg-muted" font-size="12">cli</text><text x="95" y="146" text-anchor="middle" class="svg-muted" font-size="12">track</text><text x="95" y="170" text-anchor="middle" class="svg-muted" font-size="12">interface, snmp</text><text x="95" y="194" text-anchor="middle" class="svg-muted" font-size="12">none</text>
<rect x="240" y="60" width="170" height="130" rx="8" fill="#ddd6fe"/><text x="325" y="88" text-anchor="middle" class="svg-ink" font-size="14">EEM server</text><text x="325" y="112" text-anchor="middle" class="svg-muted" font-size="12">subscriptions match</text><text x="325" y="134" text-anchor="middle" class="svg-muted" font-size="12">queue aur run</text><text x="325" y="156" text-anchor="middle" class="svg-muted" font-size="12">history, maxrun</text>
<rect x="480" y="30" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="550" y="60" text-anchor="middle" class="svg-ink" font-size="14">Applets</text><text x="550" y="80" text-anchor="middle" class="svg-muted" font-size="12">running-config mein</text>
<rect x="480" y="150" width="140" height="70" rx="8" fill="#fde68a"/><text x="550" y="180" text-anchor="middle" class="svg-ink" font-size="14">Tcl policies</text><text x="550" y="200" text-anchor="middle" class="svg-muted" font-size="12">flash par files</text>
<line x1="170" y1="125" x2="240" y2="125" stroke="#64748b" stroke-width="2"/><text x="205" y="116" text-anchor="middle" class="svg-accent" font-size="12">publish</text>
<line x1="410" y1="100" x2="480" y2="70" stroke="#64748b" stroke-width="2"/><line x1="410" y1="150" x2="480" y2="185" stroke="#64748b" stroke-width="2"/>
<text x="445" y="130" text-anchor="middle" class="svg-accent" font-size="12">run</text>
</svg><p class="cap">Detectors events publish karte hain; EEM server unhe registered policies se match karke chalata hai.</p></div>

<h3>Layer 3: policies (applets aur Tcl scripts)</h3>
<p><b>Policy</b> woh hai jo aap likhte ho. Do main types hain:</p>
<table class="cmp"><tr><th></th><th>Applet</th><th>Tcl policy</th></tr>
<tr><td>Kismein likha</td><td>IOS configuration commands</td><td>Tcl script file (.tcl)</td></tr>
<tr><td>Kahan store</td><td>running-config / startup-config</td><td>flash, policy directory se registered</td></tr>
<tr><td>Kaise register</td><td>applet configuration mode chhodne par</td><td><code>event manager policy NAME.tcl type user</code></td></tr>
<tr><td>Taakat</td><td>set, if, while, foreach, regexp, cli, mail</td><td>poori programming language, files, procedures</td></tr>
<tr><td>Exam focus</td><td><b>Haan (objective 6.6)</b></td><td>Sirf concept</td></tr></table>
<p>Tcl policy ke liye pehle IOS ko batao ki user policies kahan rehti hain, phir file register karo:</p>
<pre class="code">BRANCH(config)# event manager directory user policy "flash:/eem"
BRANCH(config)# event manager policy collect_cpu.tcl type user
<span class="c">! event script ke andar hi ::cisco::eem::event_register_... se declare hota hai</span></pre>
<p>Naye IOS XE releases guest shell ke through Python mein likhi EEM policies bhi chala sakte hain, par exam ke liye socho "applet = CLI, Tcl = script".</p>

<h3>Registration aur environment variables</h3>
<p>Applet configuration mode chhodte hi applet EEM server ke saath <b>register</b> hota hai. Agar uski event line valid hai, to woh <code>show event manager policy registered</code> mein dikhta hai aur sunna shuru kar deta hai. Aap global <b>environment variables</b> bhi define kar sakte ho jo har policy padh sakti hai, jisse interface names ya mail addresses jaisi values applet body se bahar rehti hain:</p>
<pre class="code">BRANCH(config)# event manager environment _backup_if GigabitEthernet0/1
BRANCH(config)# event manager environment _noc_mail noc@branch.example
<span class="c">! actions ke andar $_backup_if aur $_noc_mail ki tarah use hote hain</span></pre>
<pre class="out">BRANCH# show event manager environment
No.  Name                          Value
<span class="hl">1    _backup_if                    GigabitEthernet0/1</span>
2    _noc_mail                     noc@branch.example</pre>

<h3>Har applet mein ek event, ya correlated events</h3>
<p>Classic applet mein <b>ek</b> <code>event</code> statement hota hai. Doosra daaloge to woh pehle wale ko replace kar dega. EEM 3.0 se aap kai events ko <b>tag</b> de kar <code>trigger</code> block mein jod sakte ho:</p>
<pre class="code">event manager applet WAN-WATCH
 event tag E1 syslog pattern "LINEPROTO-5-UPDOWN.*GigabitEthernet0/0, changed state to down"
 event tag E2 track 1 state down
 trigger
  correlate event E1 or event E2
 action 1.0 syslog priority critical msg "WAN failure detected"</pre>
<p>Current IOS XE EEM version 4.0 chalata hai; <code>show event manager version</code> batata hai ki aapka box kya support karta hai.</p>

<div class="eg"><p><b>Worked example.</b> 02:14:05 par ISP apna Gi0/0 shut karta hai. BRANCH apne Gi0/0 ke LINK aur LINEPROTO messages log karta hai. Syslog detector har message EEM server ko publish karta hai. Server unhe do subscriptions se compare karta hai: HEARTBEAT (timer, koi match nahi) aur UPLINK-DOWN (syslog pattern). Sirf LINEPROTO line pattern se match karti hai, isliye ek job queue hota hai, policy director actions 1.0 se 6.0 chalata hai, aur history mein ek line judti hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Tcl script flash par copy karke umeed karna ki woh chalegi. <code>event manager directory user policy</code> aur <code>event manager policy NAME type user</code> ke bina script sirf ek file hai. Aur applets running-config mein rehte hain: <code>copy running-config startup-config</code> bhoole to reload ke baad gayab.</p></div>

<div class="exam"><p><b>Exam trap.</b> Basic applet mein bilkul ek event aur kai actions hote hain. Jo question ek applet mein do plain <code>event</code> lines dikhaye, woh test kar raha hai ki aap jaante ho doosri pehli ko overwrite karti hai. Kai events ke liye tags aur <code>correlate</code> wala <code>trigger</code> chahiye.</p></div>

<div class="scn"><h4>Woh script jo kabhi nahi chali</h4><p>Ek senior engineer ne memory leaks ke dauraan <code>show</code> outputs collect karne ke liye Tcl policy likhi aur file-transfer tool se 40 switches ke <code>flash:/eem</code> mein copy kar di. Hafton baad leak hua aur kuch collect nahi hua. <code>show event manager policy registered</code> khaali tha. Deployment ne do registration commands skip kar diye the, isliye EEM server ke paas koi subscription tha hi nahi. Team ne directory aur policy commands golden template mein jode aur registered policy ka compliance check lagaya.</p><p><b>Seekh:</b> jo policy registered nahi hai woh EEM ke liye exist hi nahi karti. Registration hamesha verify karo.</p></div>

<div class="iv"><p class="q">"EEM architecture describe karo."</p><p>Strong answer: teen hisse. Event detectors syslog, timers, CLI, object tracking, interface counters aur SNMP jaise sources dekhte hain aur events publish karte hain. EEM server, apne policy director ke saath, events ko registered policies se match karta hai, unhe schedule karta hai, limits enforce karta hai aur history rakhta hai. Policies ya to applets hain, IOS configuration ki tarah likhe, ya flash se registered Tcl scripts. Environment variables aur yeh ki applets configuration mein save hote hain, zaroor bolo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Event detectors publish karte hain; EEM server match aur schedule karta hai; policy director policy chalata hai.</li>
<li>Applets IOS configuration hain; Tcl policies files hain jinhe user policy directory se register karna padta hai.</li>
<li>Har applet mein ek plain event; kai events ke liye tags aur correlate wala trigger.</li>
<li>Global variables <code>event manager environment</code> se aate hain aur <code>$_name</code> ki tarah padhe jaate hain.</li>
<li>FMPD se shuru hone wale log mnemonics policy director se aate hain.</li>
</ul></div>
`}};export{e as default};