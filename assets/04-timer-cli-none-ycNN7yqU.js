var e={id:`timer-cli-none`,h:{en:`Timer, CLI and none event detectors`,hi:`Timer, CLI aur none event detectors`},body:{en:`
<p>A kitchen has three kinds of clock. The wall clock ticks every minute forever. The egg timer rings once, five minutes after you twist it. The weekly calendar says "clean the fridge every Sunday at 10". The kitchen also has a rule written by the door: "if anyone reaches for the good knives, ask the chef first". EEM has all of these: repeating timers, one-shot timers, calendar timers, and a detector that watches what people type.</p>

<h3>The four timer types</h3>
<table class="cmp"><tr><th>Type</th><th>Syntax</th><th>Fires</th></tr>
<tr><td>watchdog</td><td><code>event timer watchdog time 60</code></td><td>every 60 s, repeating</td></tr>
<tr><td>countdown</td><td><code>event timer countdown time 600</code></td><td>once, 600 s after registration</td></tr>
<tr><td>cron</td><td><code>event timer cron cron-entry "0 2 * * *"</code></td><td>on a calendar schedule</td></tr>
<tr><td>absolute</td><td><code>event timer absolute time SECONDS</code></td><td>once, at a fixed calendar moment given in seconds</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Timer types">
<line x1="110" y1="40" x2="620" y2="40" stroke="#64748b" stroke-width="1.5"/><text x="20" y="45" class="svg-ink" font-size="13">watchdog</text>
<circle cx="170" cy="40" r="6" fill="#bae6fd"/><circle cx="270" cy="40" r="6" fill="#bae6fd"/><circle cx="370" cy="40" r="6" fill="#bae6fd"/><circle cx="470" cy="40" r="6" fill="#bae6fd"/><circle cx="570" cy="40" r="6" fill="#bae6fd"/>
<line x1="110" y1="95" x2="620" y2="95" stroke="#64748b" stroke-width="1.5"/><text x="20" y="100" class="svg-ink" font-size="13">countdown</text>
<circle cx="300" cy="95" r="7" fill="#fed7aa"/><text x="300" y="80" text-anchor="middle" class="svg-muted" font-size="12">once</text>
<line x1="110" y1="150" x2="620" y2="150" stroke="#64748b" stroke-width="1.5"/><text x="20" y="155" class="svg-ink" font-size="13">cron</text>
<circle cx="220" cy="150" r="7" fill="#bbf7d0"/><circle cx="520" cy="150" r="7" fill="#bbf7d0"/><text x="220" y="175" text-anchor="middle" class="svg-muted" font-size="12">02:00 day 1</text><text x="520" y="175" text-anchor="middle" class="svg-muted" font-size="12">02:00 day 2</text>
<text x="115" y="192" class="svg-accent" font-size="12">registration</text>
</svg><p class="cap">Watchdog repeats, countdown fires once, cron follows the calendar clock.</p></div>

<p><b>Cron</b> uses the five classic UNIX fields: <b>minute, hour, day of month, month, day of week</b> (0 = Sunday). It follows the router's clock, so the clock must be right: configure NTP and the time zone first, or your 2 a.m. job will run at 2 a.m. UTC.</p>

<div class="eg"><p><b>Worked example.</b> Decode three cron entries:</p>
<ul>
<li><code>"0 2 * * *"</code> → 02:00 every day (a nightly config backup).</li>
<li><code>"30 18 * * 1-5"</code> → 18:30 Monday to Friday (shut a lab interface after office hours).</li>
<li><code>"0 8 1 * *"</code> → 08:00 on the first day of every month (a monthly report).</li>
</ul>
<p>A watchdog of 3600 is "every hour since the applet was registered"; <code>"0 * * * *"</code> is "at minute zero of every clock hour". They look alike but drift apart.</p></div>

<h3>The countdown as a safety net</h3>
<p>A classic trick before a risky remote change: register a countdown that restores the saved configuration unless you remove it in time.</p>
<pre class="code">BRANCH# copy running-config flash:pre-change.cfg
BRANCH(config)# event manager applet ROLLBACK
BRANCH(config-applet)# event timer countdown time 600
BRANCH(config-applet)# action 1.0 cli command "enable"
BRANCH(config-applet)# action 2.0 cli command "configure replace flash:pre-change.cfg force"
BRANCH(config-applet)# action 3.0 syslog priority critical msg "Change not confirmed - rolled back"
<span class="c">! make the change; if you still have access, remove the applet:</span>
BRANCH(config)# no event manager applet ROLLBACK</pre>

<h3>The CLI event detector</h3>
<p>The CLI detector compares every command typed on the router with a regular expression. The pattern is compared with the <b>fully expanded</b> command, so <code>wr</code> is seen as <code>write memory</code> and <code>rel</code> as <code>reload</code>. Two keywords decide what happens to the typed command:</p>
<table class="cmp"><tr><th>Keywords</th><th>What happens</th><th>Typical use</th></tr>
<tr><td><code>sync no skip no</code></td><td>Command runs; applet runs in parallel</td><td>Audit: log who ran what</td></tr>
<tr><td><code>sync no skip yes</code></td><td>Command is <b>not</b> run; applet runs</td><td>Block a command</td></tr>
<tr><td><code>sync yes</code></td><td>Applet runs <b>first</b>; command runs only if the applet sets <code>_exit_status</code> to 1 (0 skips it)</td><td>Decide at run time</td></tr></table>
<p><code>sync</code> is mandatory. <code>skip</code> is used with <code>sync no</code>; with <code>sync yes</code> the exit status decides instead.</p>
<pre class="code">event manager applet NO-DEBUG-ALL
 event cli pattern "^debug all" sync no skip yes
 action 1.0 syslog priority warnings msg "debug all is blocked on this router"

event manager applet AUDIT-CONF
 event cli pattern "^configure" sync no skip no
 action 1.0 syslog msg "Configuration mode entered: $_cli_msg"</pre>
<p>The built-in variable _cli_msg holds the expanded command that matched.</p>

<h3>The none detector: run on demand</h3>
<p><code>event none</code> registers an applet with no automatic trigger. You start it by hand, which makes it perfect for a "collect everything" toolkit that a junior engineer can run with one command:</p>
<pre class="code">event manager applet COLLECT
 event none
 action 1.0 cli command "enable"
 action 2.0 cli command "show ip interface brief | append flash:collect.txt"
 action 3.0 cli command "show ip route | append flash:collect.txt"
BRANCH# event manager run COLLECT</pre>
<p>You can pass arguments after the name; the applet reads them as _none_arg1, _none_arg2 and so on.</p>

<div class="warn"><p><b>Common mistake.</b> <code>event cli pattern ".*" sync no skip yes</code>. The pattern matches every command, including <code>configure terminal</code> and <code>no event manager applet</code>, so nobody can run anything. Test CLI applets with a very specific pattern, from a session where you have another way in, and never save them before testing.</p></div>

<div class="exam"><p><b>Exam trap.</b> Watchdog repeats, countdown runs once: swapping them is the most common distractor. For CLI events, remember that <code>skip yes</code> blocks the command and that only <code>event none</code> applets are started with <code>event manager run</code>.</p></div>

<div class="scn"><h4>The ACL that locked everyone out</h4><p>An engineer in Chennai applied a new management ACL to the VTY lines of a remote router at 23:00. One line had the wrong subnet, and his SSH session froze. Luckily he had registered a 10-minute countdown applet that ran <code>configure replace</code> with the saved pre-change file. Ten minutes later the old ACL was back, he logged in again, fixed the typo and removed the rollback applet. Without it, someone would have driven 200 km to reach the console port.</p><p><b>Lesson:</b> a countdown applet is a cheap "undo" button for remote changes.</p></div>

<div class="iv"><p class="q">"What is the difference between sync yes and sync no skip yes in an EEM CLI event?"</p><p>Strong answer: with <code>sync no skip yes</code> the command is always blocked and the applet runs; it is a hard block. With <code>sync yes</code> the applet runs before the command and decides: setting <code>_exit_status</code> to 1 lets the command run, 0 skips it. So sync yes allows conditional logic, for example allowing <code>reload</code> only in a maintenance window. Also mention that the pattern is matched against the fully expanded command.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>watchdog repeats, countdown fires once, cron follows the calendar (minute hour day month weekday), absolute fires at one moment.</li>
<li>Cron depends on a correct clock: NTP and time zone first.</li>
<li>CLI patterns match the fully expanded command; <code>sync</code> is mandatory.</li>
<li><code>skip yes</code> blocks the command; <code>sync yes</code> lets the applet decide with _exit_status.</li>
<li><code>event none</code> applets run only with <code>event manager run NAME</code>.</li>
</ul></div>
`,hi:`
<p>Ek kitchen mein teen tarah ki ghadiyan hoti hain. Deewar ki ghadi har minute hamesha tick karti hai. Egg timer ghumane ke paanch minute baad ek baar bajta hai. Weekly calendar kehta hai "har Sunday 10 baje fridge saaf karo". Kitchen ke darwaze par ek rule bhi likha hai: "agar koi achhe chaaku uthaye, to pehle chef se poochho". EEM mein yeh sab hai: repeat hone wale timers, ek baar chalne wale timers, calendar timers, aur ek detector jo dekhta hai ki log kya type karte hain.</p>

<h3>Chaar timer types</h3>
<table class="cmp"><tr><th>Type</th><th>Syntax</th><th>Kab fire</th></tr>
<tr><td>watchdog</td><td><code>event timer watchdog time 60</code></td><td>har 60 s, repeat</td></tr>
<tr><td>countdown</td><td><code>event timer countdown time 600</code></td><td>ek baar, registration ke 600 s baad</td></tr>
<tr><td>cron</td><td><code>event timer cron cron-entry "0 2 * * *"</code></td><td>calendar schedule par</td></tr>
<tr><td>absolute</td><td><code>event timer absolute time SECONDS</code></td><td>ek baar, seconds mein diye fixed calendar pal par</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Timer types">
<line x1="110" y1="40" x2="620" y2="40" stroke="#64748b" stroke-width="1.5"/><text x="20" y="45" class="svg-ink" font-size="13">watchdog</text>
<circle cx="170" cy="40" r="6" fill="#bae6fd"/><circle cx="270" cy="40" r="6" fill="#bae6fd"/><circle cx="370" cy="40" r="6" fill="#bae6fd"/><circle cx="470" cy="40" r="6" fill="#bae6fd"/><circle cx="570" cy="40" r="6" fill="#bae6fd"/>
<line x1="110" y1="95" x2="620" y2="95" stroke="#64748b" stroke-width="1.5"/><text x="20" y="100" class="svg-ink" font-size="13">countdown</text>
<circle cx="300" cy="95" r="7" fill="#fed7aa"/><text x="300" y="80" text-anchor="middle" class="svg-muted" font-size="12">ek baar</text>
<line x1="110" y1="150" x2="620" y2="150" stroke="#64748b" stroke-width="1.5"/><text x="20" y="155" class="svg-ink" font-size="13">cron</text>
<circle cx="220" cy="150" r="7" fill="#bbf7d0"/><circle cx="520" cy="150" r="7" fill="#bbf7d0"/><text x="220" y="175" text-anchor="middle" class="svg-muted" font-size="12">02:00 din 1</text><text x="520" y="175" text-anchor="middle" class="svg-muted" font-size="12">02:00 din 2</text>
<text x="115" y="192" class="svg-accent" font-size="12">registration</text>
</svg><p class="cap">Watchdog repeat hota hai, countdown ek baar fire hota hai, cron calendar clock follow karta hai.</p></div>

<p><b>Cron</b> paanch classic UNIX fields use karta hai: <b>minute, hour, day of month, month, day of week</b> (0 = Sunday). Yeh router ki clock follow karta hai, isliye clock sahi honi chahiye: pehle NTP aur time zone configure karo, warna aapka raat 2 baje ka job UTC ke 2 baje chalega.</p>

<div class="eg"><p><b>Worked example.</b> Teen cron entries decode karo:</p>
<ul>
<li><code>"0 2 * * *"</code> → roz 02:00 (raat ka config backup).</li>
<li><code>"30 18 * * 1-5"</code> → Monday se Friday 18:30 (office hours ke baad lab interface shut karna).</li>
<li><code>"0 8 1 * *"</code> → har mahine ki pehli taarikh ko 08:00 (monthly report).</li>
</ul>
<p>3600 ka watchdog matlab "applet register hone ke baad se har ghanta"; <code>"0 * * * *"</code> matlab "har clock hour ke zero minute par". Dikhne mein milte hain par dheere dheere alag ho jaate hain.</p></div>

<h3>Safety net ki tarah countdown</h3>
<p>Risky remote change se pehle ek classic trick: ek countdown register karo jo saved configuration restore kar de, jab tak aap use time par hata na do.</p>
<pre class="code">BRANCH# copy running-config flash:pre-change.cfg
BRANCH(config)# event manager applet ROLLBACK
BRANCH(config-applet)# event timer countdown time 600
BRANCH(config-applet)# action 1.0 cli command "enable"
BRANCH(config-applet)# action 2.0 cli command "configure replace flash:pre-change.cfg force"
BRANCH(config-applet)# action 3.0 syslog priority critical msg "Change not confirmed - rolled back"
<span class="c">! change karo; agar access abhi bhi hai, to applet hata do:</span>
BRANCH(config)# no event manager applet ROLLBACK</pre>

<h3>CLI event detector</h3>
<p>CLI detector router par type hone wale har command ko regular expression se compare karta hai. Pattern <b>fully expanded</b> command se compare hota hai, isliye <code>wr</code> ko <code>write memory</code> aur <code>rel</code> ko <code>reload</code> ki tarah dekha jaata hai. Do keywords decide karte hain ki type kiye command ka kya hoga:</p>
<table class="cmp"><tr><th>Keywords</th><th>Kya hota hai</th><th>Typical use</th></tr>
<tr><td><code>sync no skip no</code></td><td>Command chalta hai; applet saath mein chalta hai</td><td>Audit: kisne kya chalaya log karo</td></tr>
<tr><td><code>sync no skip yes</code></td><td>Command <b>nahi</b> chalta; applet chalta hai</td><td>Command block karna</td></tr>
<tr><td><code>sync yes</code></td><td>Applet <b>pehle</b> chalta hai; command tabhi chalta hai jab applet <code>_exit_status</code> 1 set kare (0 skip karta hai)</td><td>Run time par decide karna</td></tr></table>
<p><code>sync</code> mandatory hai. <code>skip</code> <code>sync no</code> ke saath use hota hai; <code>sync yes</code> mein exit status decide karta hai.</p>
<pre class="code">event manager applet NO-DEBUG-ALL
 event cli pattern "^debug all" sync no skip yes
 action 1.0 syslog priority warnings msg "debug all is blocked on this router"

event manager applet AUDIT-CONF
 event cli pattern "^configure" sync no skip no
 action 1.0 syslog msg "Configuration mode entered: $_cli_msg"</pre>
<p>Built-in variable _cli_msg mein woh expanded command hota hai jo match hua.</p>

<h3>None detector: maang par chalao</h3>
<p><code>event none</code> applet ko bina automatic trigger ke register karta hai. Aap use haath se start karte ho, jo ise "sab kuch collect karo" toolkit ke liye perfect banata hai jise junior engineer ek command se chala sake:</p>
<pre class="code">event manager applet COLLECT
 event none
 action 1.0 cli command "enable"
 action 2.0 cli command "show ip interface brief | append flash:collect.txt"
 action 3.0 cli command "show ip route | append flash:collect.txt"
BRANCH# event manager run COLLECT</pre>
<p>Naam ke baad aap arguments de sakte ho; applet unhe _none_arg1, _none_arg2 wagairah ki tarah padhta hai.</p>

<div class="warn"><p><b>Common galti.</b> <code>event cli pattern ".*" sync no skip yes</code>. Pattern har command match karta hai, <code>configure terminal</code> aur <code>no event manager applet</code> samet, isliye koi kuch nahi chala sakta. CLI applets ko bahut specific pattern ke saath test karo, aise session se jahan aapke paas andar aane ka doosra raasta ho, aur test se pehle kabhi save mat karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Watchdog repeat hota hai, countdown ek baar chalta hai: inhe ulatna sabse common distractor hai. CLI events ke liye yaad rakho ki <code>skip yes</code> command block karta hai aur sirf <code>event none</code> applets <code>event manager run</code> se start hote hain.</p></div>

<div class="scn"><h4>Woh ACL jisne sabko bahar kar diya</h4><p>Chennai ke ek engineer ne raat 23:00 baje remote router ki VTY lines par naya management ACL lagaya. Ek line mein galat subnet tha, aur uska SSH session freeze ho gaya. Kismat se usne 10-minute ka countdown applet register kiya tha jo saved pre-change file ke saath <code>configure replace</code> chalata tha. Das minute baad purana ACL wapas aa gaya, usne phir login kiya, typo theek kiya aur rollback applet hata diya. Iske bina kisi ko console port tak pahunchne ke liye 200 km drive karna padta.</p><p><b>Seekh:</b> countdown applet remote changes ke liye sasta "undo" button hai.</p></div>

<div class="iv"><p class="q">"EEM CLI event mein sync yes aur sync no skip yes mein kya fark hai?"</p><p>Strong answer: <code>sync no skip yes</code> mein command hamesha block hota hai aur applet chalta hai; yeh hard block hai. <code>sync yes</code> mein applet command se pehle chalta hai aur decide karta hai: <code>_exit_status</code> 1 set karne se command chalta hai, 0 use skip karta hai. Isliye sync yes conditional logic allow karta hai, jaise <code>reload</code> sirf maintenance window mein allow karna. Yeh bhi bolo ki pattern fully expanded command se match hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>watchdog repeat hota hai, countdown ek baar fire hota hai, cron calendar follow karta hai (minute hour day month weekday), absolute ek pal par fire hota hai.</li>
<li>Cron sahi clock par nirbhar hai: pehle NTP aur time zone.</li>
<li>CLI patterns fully expanded command se match hote hain; <code>sync</code> mandatory hai.</li>
<li><code>skip yes</code> command block karta hai; <code>sync yes</code> applet ko _exit_status se decide karne deta hai.</li>
<li><code>event none</code> applets sirf <code>event manager run NAME</code> se chalte hain.</li>
</ul></div>
`}};export{e as default};