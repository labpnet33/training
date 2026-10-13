var e={id:`verify-troubleshoot`,h:{en:`Verify and troubleshoot: walking the lab, plus construct-the-applet drills`,hi:`Verify aur troubleshoot: lab walkthrough, plus construct-the-applet drills`},body:{en:`
<p>When a smoke alarm fails to warn you, a good inspector asks four questions in order: is the alarm installed, did it sense the smoke, did it sound, and did anyone hear it? EEM troubleshooting follows the same four questions: <b>is the applet registered, did the event fire, did the actions work, and did the network change?</b> Asking them in order stops you guessing.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Troubleshooting workflow">
<rect x="10" y="40" width="140" height="60" rx="8" fill="#bae6fd"/><text x="80" y="66" text-anchor="middle" class="svg-ink" font-size="13">1. Registered?</text><text x="80" y="86" text-anchor="middle" class="svg-muted" font-size="12">policy registered</text>
<rect x="170" y="40" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="240" y="66" text-anchor="middle" class="svg-ink" font-size="13">2. Fired?</text><text x="240" y="86" text-anchor="middle" class="svg-muted" font-size="12">history events</text>
<rect x="330" y="40" width="140" height="60" rx="8" fill="#fde68a"/><text x="400" y="66" text-anchor="middle" class="svg-ink" font-size="13">3. Actions OK?</text><text x="400" y="86" text-anchor="middle" class="svg-muted" font-size="12">debug action cli</text>
<rect x="490" y="40" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="66" text-anchor="middle" class="svg-ink" font-size="13">4. Network OK?</text><text x="560" y="86" text-anchor="middle" class="svg-muted" font-size="12">interfaces, route, ping</text>
<line x1="150" y1="70" x2="170" y2="70" stroke="#64748b" stroke-width="2"/><line x1="310" y1="70" x2="330" y2="70" stroke="#64748b" stroke-width="2"/><line x1="470" y1="70" x2="490" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">stop at the first step that fails</text>
</svg><p class="cap">Four questions in order, each with its own command.</p></div>

<h3>Step 1: is the applet registered, and as you intended?</h3>
<pre class="out">BRANCH# show event manager policy registered
No.  Class     Type    Event Type          Trap  Time Registered           Name
1    applet    user    syslog              Off   Wed Sep 30 01:58:12 2026  UPLINK-DOWN
<span class="hl"> pattern {LINEPROTO-5-UPDOWN.*GigabitEthernet0/0, changed state to down}</span>
 maxrun 20.000
 action 1.0 syslog priority critical msg "Primary circuit down - enabling backup Gi0/1"
 action 2.0 cli command "enable"
 action 3.0 cli command "configure terminal"
 action 4.0 cli command "interface GigabitEthernet0/1"
 action 5.0 cli command "no shutdown"
 action 6.0 cli command "end"
2    applet    user    timer watchdog      Off   Wed Sep 30 01:59:40 2026  HEARTBEAT
 time 60.000
 maxrun 20.000
 action 1.0 syslog msg "Kochi branch router alive"</pre>
<p>Read three things: the event type, the exact pattern or timer, and the <b>order</b> of the actions as they will run.</p>

<h3>Step 2: did the event fire?</h3>
<pre class="out">BRANCH# show event manager history events
No.  Job Id Proc Status    Time of Event            Event Type          Name
13   14     Actv success   Wed Sep30 02:13:40 2026  timer watchdog      applet: HEARTBEAT
<span class="hl">14   15     Actv success   Wed Sep30 02:14:06 2026  syslog              applet: UPLINK-DOWN</span>
15   16     Actv success   Wed Sep30 02:14:40 2026  timer watchdog      applet: HEARTBEAT</pre>
<p>No syslog line at the failure time means the pattern did not match. Compare it with the real message: <code>show logging | include LINEPROTO</code>. The status column also shows problems: a run killed by maxrun is not a success.</p>

<h3>Step 3: did the actions work?</h3>
<p>"success" only means the applet finished. To see what its hidden session typed and received, use <code>debug event manager action cli</code> (and <code>undebug all</code> afterwards). You will see each prompt and each reply, which exposes a missing <code>enable</code>, an AAA refusal or a mistyped interface.</p>

<h3>Step 4: did the network change?</h3>
<pre class="out">BRANCH# show ip interface brief | include GigabitEthernet0/[01]
GigabitEthernet0/0     10.0.1.2        YES manual down                  down
<span class="hl">GigabitEthernet0/1     10.0.2.2        YES manual up                    up</span>
BRANCH# show ip route static | include 0.0.0.0/0
<span class="hl">S*    0.0.0.0/0 [20/0] via 10.0.2.1</span>
PC1&gt; ping 203.0.113.10
84 bytes from 203.0.113.10 icmp_seq=1 ttl=62 time=2.1 ms</pre>
<p>The floating static (distance 20) is now in the table, and PC1 reaches the server through Gi0/1.</p>

<h3>Common lab faults, from symptom to fix</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Fix</th></tr>
<tr><td>No run in history</td><td>Pattern uses <code>Gi0/0</code>; the log says <code>GigabitEthernet0/0</code></td><td>Match the full name exactly as logged</td></tr>
<tr><td>Runs twice per failure</td><td>Pattern also matches %LINK-3-UPDOWN</td><td>Add the LINEPROTO mnemonic</td></tr>
<tr><td>Success, backup still shut</td><td>No <code>enable</code>, AAA refusal, or label order</td><td>debug action cli; fix first CLI action; renumber</td></tr>
<tr><td>Status not success</td><td>maxrun expired</td><td>Raise maxrun on the event line</td></tr>
<tr><td>Gone after reload</td><td>Not saved</td><td><code>copy running-config startup-config</code></td></tr></table>
<p>Tip: to test the actions without breaking a link, clone the applet with <code>event none</code> and start it with <code>event manager run NAME</code>.</p>

<h3>Construct-the-applet drills</h3>
<div class="eg"><p><b>Drill 1.</b> Save the configuration every night at 23:00.</p>
<pre class="code">event manager applet NIGHTLY-SAVE
 event timer cron cron-entry "0 23 * * *"
 action 1.0 cli command "enable"
 action 2.0 cli command "write memory"
 action 3.0 syslog msg "Nightly save done"</pre>
<p><b>Drill 2.</b> Block every <code>reload</code> command and log a warning.</p>
<pre class="code">event manager applet NO-RELOAD
 event cli pattern "^reload" sync no skip yes
 action 1.0 syslog priority warnings msg "reload blocked by EEM policy"</pre>
<p><b>Drill 3.</b> When track 1 goes down, log a critical message and save the routing table to flash.</p>
<pre class="code">event manager applet TRACK1-DOWN
 event track 1 state down
 action 010 syslog priority critical msg "Track 1 down"
 action 020 cli command "enable"
 action 030 cli command "show ip route | append flash:track1.txt"</pre>
<p><b>Drill 4 (find the bug).</b> Actions labelled 1 to 10, where 1 is syslog, 2 is enable and 10 is <code>no shutdown</code>. Answer: 10 runs second, before enable, and fails; renumber to 010 … 100 or 1.0 … 9.0.</p></div>

<div class="warn"><p><b>Common mistake.</b> Leaving <code>debug event manager all</code> running on a busy router. It prints for every event and every action. Use the narrowest debug (<code>action cli</code>) and turn it off when done.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>show event manager policy registered</code> shows what is configured; <code>show event manager history events</code> shows what actually ran. A question asking "how do you confirm the applet executed" wants history, not registered.</p></div>

<div class="scn"><h4>The pattern that never matched</h4><p>A trainee in the Kochi lab wrote <code>event syslog pattern "Gi0/0.*down"</code>. ISP's Gi0/0 was shut, the branch lost its primary, and nothing happened. Step 1 showed the applet registered. Step 2 showed only HEARTBEAT runs, no syslog run. <code>show logging | include LINEPROTO</code> showed the message with <code>GigabitEthernet0/0</code>, never <code>Gi0/0</code>: IOS logs full interface names. The trainee corrected the pattern, and the next shutdown brought Gi0/1 up in 3 seconds.</p><p><b>Lesson:</b> build patterns from real log lines copied from the device, not from how you type commands.</p></div>

<div class="iv"><p class="q">"Your EEM applet did not work during an outage. How do you troubleshoot it?"</p><p>Strong answer: I follow four steps. One, <code>show event manager policy registered</code> to confirm the event, pattern and action order. Two, <code>show event manager history events</code> to see if it ran at the failure time; if not, compare the pattern with the real log line. Three, <code>debug event manager action cli</code> to see the CLI session: missing enable, AAA refusal, wrong interface. Four, verify the network result with interface, route and ping checks. I test changes with an event none clone and <code>event manager run</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ask in order: registered, fired, actions worked, network changed.</li>
<li><code>show event manager policy registered</code> = configuration; <code>show event manager history events</code> = what ran.</li>
<li><code>debug event manager action cli</code> shows the hidden session's prompts and errors.</li>
<li>Syslog shows full interface names; build patterns from real log lines.</li>
<li>Test actions safely with an <code>event none</code> clone and <code>event manager run</code>.</li>
</ul></div>
`,hi:`
<p>Jab smoke alarm aapko warn karne mein fail hota hai, achha inspector order mein chaar sawaal poochhta hai: kya alarm laga hai, kya usne dhuan mehsoos kiya, kya woh baja, aur kya kisi ne suna? EEM troubleshooting bhi yahi chaar sawaal follow karti hai: <b>kya applet registered hai, kya event fire hua, kya actions ne kaam kiya, aur kya network badla?</b> Unhe order mein poochhne se aap andaaze lagana band kar dete ho.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Troubleshooting workflow">
<rect x="10" y="40" width="140" height="60" rx="8" fill="#bae6fd"/><text x="80" y="66" text-anchor="middle" class="svg-ink" font-size="13">1. Registered?</text><text x="80" y="86" text-anchor="middle" class="svg-muted" font-size="12">policy registered</text>
<rect x="170" y="40" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="240" y="66" text-anchor="middle" class="svg-ink" font-size="13">2. Fire hua?</text><text x="240" y="86" text-anchor="middle" class="svg-muted" font-size="12">history events</text>
<rect x="330" y="40" width="140" height="60" rx="8" fill="#fde68a"/><text x="400" y="66" text-anchor="middle" class="svg-ink" font-size="13">3. Actions OK?</text><text x="400" y="86" text-anchor="middle" class="svg-muted" font-size="12">debug action cli</text>
<rect x="490" y="40" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="66" text-anchor="middle" class="svg-ink" font-size="13">4. Network OK?</text><text x="560" y="86" text-anchor="middle" class="svg-muted" font-size="12">interfaces, route, ping</text>
<line x1="150" y1="70" x2="170" y2="70" stroke="#64748b" stroke-width="2"/><line x1="310" y1="70" x2="330" y2="70" stroke="#64748b" stroke-width="2"/><line x1="470" y1="70" x2="490" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">pehle fail hone wale step par ruko</text>
</svg><p class="cap">Order mein chaar sawaal, har ek ka apna command.</p></div>

<h3>Step 1: kya applet registered hai, aur jaisa aapne socha waisa?</h3>
<pre class="out">BRANCH# show event manager policy registered
No.  Class     Type    Event Type          Trap  Time Registered           Name
1    applet    user    syslog              Off   Wed Sep 30 01:58:12 2026  UPLINK-DOWN
<span class="hl"> pattern {LINEPROTO-5-UPDOWN.*GigabitEthernet0/0, changed state to down}</span>
 maxrun 20.000
 action 1.0 syslog priority critical msg "Primary circuit down - enabling backup Gi0/1"
 action 2.0 cli command "enable"
 action 3.0 cli command "configure terminal"
 action 4.0 cli command "interface GigabitEthernet0/1"
 action 5.0 cli command "no shutdown"
 action 6.0 cli command "end"
2    applet    user    timer watchdog      Off   Wed Sep 30 01:59:40 2026  HEARTBEAT
 time 60.000
 maxrun 20.000
 action 1.0 syslog msg "Kochi branch router alive"</pre>
<p>Teen cheezein padho: event type, exact pattern ya timer, aur actions ka <b>order</b> jaise woh chalenge.</p>

<h3>Step 2: kya event fire hua?</h3>
<pre class="out">BRANCH# show event manager history events
No.  Job Id Proc Status    Time of Event            Event Type          Name
13   14     Actv success   Wed Sep30 02:13:40 2026  timer watchdog      applet: HEARTBEAT
<span class="hl">14   15     Actv success   Wed Sep30 02:14:06 2026  syslog              applet: UPLINK-DOWN</span>
15   16     Actv success   Wed Sep30 02:14:40 2026  timer watchdog      applet: HEARTBEAT</pre>
<p>Failure ke time par koi syslog line nahi matlab pattern match nahi hua. Use asli message se compare karo: <code>show logging | include LINEPROTO</code>. Status column bhi problems dikhata hai: maxrun se maara gaya run success nahi hota.</p>

<h3>Step 3: kya actions ne kaam kiya?</h3>
<p>"success" ka matlab sirf itna hai ki applet khatam hua. Uske chhupe session ne kya type kiya aur kya paaya, yeh dekhne ke liye <code>debug event manager action cli</code> use karo (aur baad mein <code>undebug all</code>). Aapko har prompt aur har reply dikhega, jo missing <code>enable</code>, AAA refusal ya galat type kiya interface pakad leta hai.</p>

<h3>Step 4: kya network badla?</h3>
<pre class="out">BRANCH# show ip interface brief | include GigabitEthernet0/[01]
GigabitEthernet0/0     10.0.1.2        YES manual down                  down
<span class="hl">GigabitEthernet0/1     10.0.2.2        YES manual up                    up</span>
BRANCH# show ip route static | include 0.0.0.0/0
<span class="hl">S*    0.0.0.0/0 [20/0] via 10.0.2.1</span>
PC1&gt; ping 203.0.113.10
84 bytes from 203.0.113.10 icmp_seq=1 ttl=62 time=2.1 ms</pre>
<p>Floating static (distance 20) ab table mein hai, aur PC1 Gi0/1 ke through server tak pahunchta hai.</p>

<h3>Common lab faults, symptom se fix tak</h3>
<table class="cmp"><tr><th>Symptom</th><th>Sambhavit wajah</th><th>Fix</th></tr>
<tr><td>History mein koi run nahi</td><td>Pattern <code>Gi0/0</code> use karta hai; log <code>GigabitEthernet0/0</code> kehta hai</td><td>Poora naam bilkul waise match karo jaise log hota hai</td></tr>
<tr><td>Har failure par do baar chalta hai</td><td>Pattern %LINK-3-UPDOWN bhi match karta hai</td><td>LINEPROTO mnemonic jodo</td></tr>
<tr><td>Success, backup phir bhi shut</td><td><code>enable</code> nahi, AAA refusal, ya label order</td><td>debug action cli; pehla CLI action theek karo; renumber</td></tr>
<tr><td>Status success nahi</td><td>maxrun expire hua</td><td>Event line par maxrun badhao</td></tr>
<tr><td>Reload ke baad gayab</td><td>Save nahi hua</td><td><code>copy running-config startup-config</code></td></tr></table>
<p>Tip: link tode bina actions test karne ke liye applet ko <code>event none</code> ke saath clone karo aur <code>event manager run NAME</code> se start karo.</p>

<h3>Construct-the-applet drills</h3>
<div class="eg"><p><b>Drill 1.</b> Har raat 23:00 baje configuration save karo.</p>
<pre class="code">event manager applet NIGHTLY-SAVE
 event timer cron cron-entry "0 23 * * *"
 action 1.0 cli command "enable"
 action 2.0 cli command "write memory"
 action 3.0 syslog msg "Nightly save done"</pre>
<p><b>Drill 2.</b> Har <code>reload</code> command block karo aur warning log karo.</p>
<pre class="code">event manager applet NO-RELOAD
 event cli pattern "^reload" sync no skip yes
 action 1.0 syslog priority warnings msg "reload blocked by EEM policy"</pre>
<p><b>Drill 3.</b> Jab track 1 down ho, critical message log karo aur routing table flash mein save karo.</p>
<pre class="code">event manager applet TRACK1-DOWN
 event track 1 state down
 action 010 syslog priority critical msg "Track 1 down"
 action 020 cli command "enable"
 action 030 cli command "show ip route | append flash:track1.txt"</pre>
<p><b>Drill 4 (bug dhoondho).</b> Actions 1 se 10 labelled, jahan 1 syslog, 2 enable aur 10 <code>no shutdown</code> hai. Jawab: 10 doosre number par, enable se pehle chalta hai, aur fail hota hai; 010 … 100 ya 1.0 … 9.0 mein renumber karo.</p></div>

<div class="warn"><p><b>Common galti.</b> Busy router par <code>debug event manager all</code> chalta chhod dena. Yeh har event aur har action ke liye print karta hai. Sabse narrow debug (<code>action cli</code>) use karo aur kaam hone par band karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>show event manager policy registered</code> dikhata hai kya configured hai; <code>show event manager history events</code> dikhata hai asal mein kya chala. "Aap kaise confirm karoge ki applet execute hua" poochhne wala question history chahta hai, registered nahi.</p></div>

<div class="scn"><h4>Woh pattern jo kabhi match nahi hua</h4><p>Kochi lab mein ek trainee ne <code>event syslog pattern "Gi0/0.*down"</code> likha. ISP ka Gi0/0 shut hua, branch ka primary gaya, aur kuch nahi hua. Step 1 ne applet registered dikhaya. Step 2 ne sirf HEARTBEAT runs dikhaye, koi syslog run nahi. <code>show logging | include LINEPROTO</code> ne message <code>GigabitEthernet0/0</code> ke saath dikhaya, kabhi <code>Gi0/0</code> nahi: IOS poore interface names log karta hai. Trainee ne pattern theek kiya, aur agle shutdown ne Gi0/1 ko 3 second mein up kar diya.</p><p><b>Seekh:</b> patterns device se copy ki gayi asli log lines se banao, is baat se nahi ki aap commands kaise type karte ho.</p></div>

<div class="iv"><p class="q">"Outage ke dauraan aapka EEM applet kaam nahi kiya. Aap kaise troubleshoot karoge?"</p><p>Strong answer: main chaar steps follow karta hoon. Ek, event, pattern aur action order confirm karne ke liye <code>show event manager policy registered</code>. Do, <code>show event manager history events</code> se dekhna ki failure ke time par chala ya nahi; agar nahi, to pattern ko asli log line se compare karna. Teen, CLI session dekhne ke liye <code>debug event manager action cli</code>: missing enable, AAA refusal, galat interface. Chaar, interface, route aur ping checks se network result verify karna. Changes main event none clone aur <code>event manager run</code> se test karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order mein poochho: registered, fire hua, actions ne kaam kiya, network badla.</li>
<li><code>show event manager policy registered</code> = configuration; <code>show event manager history events</code> = kya chala.</li>
<li><code>debug event manager action cli</code> chhupe session ke prompts aur errors dikhata hai.</li>
<li>Syslog poore interface names dikhata hai; patterns asli log lines se banao.</li>
<li>Actions ko <code>event none</code> clone aur <code>event manager run</code> se safely test karo.</li>
</ul></div>
`}};export{e as default};