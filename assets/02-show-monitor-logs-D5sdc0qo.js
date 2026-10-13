var e={id:`show-monitor-logs`,h:{en:`show versus monitor, pipes and system logs`,hi:`show vs monitor, pipes aur system logs`},body:{en:`
<p>Junos gives you two ways to look at a device. A <b>show</b> command prints the state at this moment and returns you to the prompt, like a photograph. A <b>monitor</b> command keeps updating until you stop it, like a live video. Knowing which to use saves a lot of time.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="show versus monitor">
<rect x="20" y="20" width="270" height="130" rx="10" fill="#bae6fd"/><text x="155" y="45" text-anchor="middle" class="svg-ink" font-size="14">show = photograph</text>
<text x="155" y="75" text-anchor="middle" class="svg-ink" font-size="12">show interfaces terse</text><text x="155" y="95" text-anchor="middle" class="svg-ink" font-size="12">show log messages</text><text x="155" y="115" text-anchor="middle" class="svg-ink" font-size="12">show route</text><text x="155" y="138" text-anchor="middle" class="svg-muted" font-size="12">prints once, returns to prompt</text>
<rect x="350" y="20" width="270" height="130" rx="10" fill="#bbf7d0"/><text x="485" y="45" text-anchor="middle" class="svg-ink" font-size="14">monitor = live video</text>
<text x="485" y="75" text-anchor="middle" class="svg-ink" font-size="12">monitor start messages</text><text x="485" y="95" text-anchor="middle" class="svg-ink" font-size="12">monitor interface ge-0/0/0</text><text x="485" y="115" text-anchor="middle" class="svg-ink" font-size="12">monitor traffic interface</text><text x="485" y="138" text-anchor="middle" class="svg-muted" font-size="12">keeps updating until you stop</text>
</svg><p class="cap">Snapshot versus live view. Use show to read, monitor to watch an event happen.</p></div>

<h3>The commands you must know</h3>
<table class="cmp"><tr><th>Command</th><th>What you get</th></tr>
<tr><td><code>show interfaces terse</code></td><td>One line per interface: Admin, Link, Proto, Local address</td></tr>
<tr><td><code>show log messages</code></td><td>The main syslog file, oldest first</td></tr>
<tr><td><code>monitor start messages</code></td><td>New lines of the messages file appear on your terminal as they are written</td></tr>
<tr><td><code>monitor stop</code></td><td>Stops every monitor start output</td></tr>
<tr><td><code>monitor interface ge-0/0/0</code></td><td>A refreshing screen of traffic and error counters for one interface (press q to quit)</td></tr>
<tr><td><code>monitor traffic interface ge-0/0/0</code></td><td>Packet headers seen by the Routing Engine on that interface, like tcpdump</td></tr></table>
<p>Note that <code>monitor traffic</code> only shows packets that go to or come from the Routing Engine itself (for example OSPF hellos or pings to the router). It does not show transit traffic that the forwarding hardware passes through.</p>

<h3>Pipes: filter the output</h3>
<p>Output can be very long. Junos lets you add a pipe <code>|</code> and a filter on any show command.</p>
<table class="cmp"><tr><th>Pipe</th><th>Effect</th></tr>
<tr><td><code>| match OSPF</code></td><td>Only lines containing the text (a regular expression)</td></tr>
<tr><td><code>| except ge-0/0/0</code></td><td>Remove matching lines</td></tr>
<tr><td><code>| count</code></td><td>Number of lines</td></tr>
<tr><td><code>| last 20</code></td><td>Only the final 20 lines</td></tr>
<tr><td><code>| no-more</code></td><td>Do not pause between pages</td></tr>
<tr><td><code>| find 10.0.12</code></td><td>Start printing from the first line that matches</td></tr></table>

<h3>Reading the messages file</h3>
<p>Junos writes system events to <code>/var/log/messages</code>. Each line has a time, the host name, the process that wrote it, and a message code. For example the routing process <code>rpd</code> logs OSPF neighbour changes with the codes <code>RPD_OSPF_NBRUP</code> and <code>RPD_OSPF_NBRDOWN</code>.</p>
<pre class="out">lab@R1-IDR&gt; show log messages | match RPD_OSPF | last 3
Oct  2 09:14:07  R1-IDR rpd[1631]: <span class="hl">RPD_OSPF_NBRUP: OSPF neighbor 10.0.12.2 (realm ospf-v2 ge-0/0/0.0 area 0.0.0.0) state changed from Loading to Full due to LoadDone (event reason: OSPF loading completed)</span>
Oct  2 09:14:02  R1-IDR rpd[1631]: RPD_OSPF_NBRUP: OSPF neighbor 10.0.12.2 (realm ospf-v2 ge-0/0/0.0 area 0.0.0.0) state changed from Exchange to Loading due to ExchangeDone
</pre>
<p>Other log files exist too: <code>chassis</code> for hardware, <code>interactive-commands</code> for what users typed, <code>security</code>, and <code>dcd</code> for interface events. List them with <code>show log</code> and read one by name.</p>

<h3>Watching an event live</h3>
<p>The best moment to start <code>monitor start messages</code> is before you fix something. Then, when you commit, the lines appear on your screen the moment the event happens. This proves cause and effect.</p>
<pre class="code">lab@R1-IDR&gt; monitor start messages
lab@R1-IDR&gt; configure
lab@R1-IDR# commit and-quit
<span class="c">! within seconds the RPD_OSPF_NBRUP line scrolls onto the screen</span>
lab@R1-IDR&gt; monitor stop</pre>
<div class="warn"><p><b>Common mistake.</b> Forgetting <code>monitor stop</code>. The log lines keep interrupting everything you type on that session until you stop them or log out.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>show log messages</code> is a snapshot, <code>monitor start messages</code> is live. If the question says "as they occur" or "in real time", the answer is monitor. Also remember the command to end it is <code>monitor stop</code>, not Ctrl+C on the CLI.</p></div>

<div class="scn"><h4>The flapping link nobody saw</h4><p>A branch complained that VoIP calls dropped "once or twice a day". The engineer logged in during working hours and everything looked fine. She ran <code>show log messages | match "UPDOWN|NBRDOWN"</code> and found a link going down at 11:02 and 15:47 yesterday, each time for four seconds. The log proved the problem was real, gave her exact times, and pointed to a bad patch cable that she replaced.</p><p><b>Lesson:</b> show snapshots miss intermittent problems; logs remember them, and monitor catches the next one live.</p></div>

<div class="iv"><p class="q">"What is the difference between show log messages and monitor start messages?"</p><p>Show log prints what is already in the file and returns. Monitor start follows the file and prints new lines as they are written until monitor stop. Add that you pipe show output through match or last to filter, and that you start the monitor before applying a fix so you see the effect immediately.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>show is a snapshot; monitor is live until monitor stop.</li>
<li>Pipes (match, except, count, last, no-more, find) filter long output.</li>
<li>/var/log/messages holds system events; RPD_OSPF_NBRUP and NBRDOWN mark OSPF neighbour changes.</li>
<li>monitor traffic shows only packets to or from the Routing Engine, not transit traffic.</li>
<li>Start the monitor before the fix to watch the event happen.</li>
</ul></div>
`,hi:`
<p>Junos device ko dekhne ke do tarike deta hai. <b>show</b> command abhi ki state print karke prompt par wapas la deta hai, ek photograph ki tarah. <b>monitor</b> command tab tak update karta rehta hai jab tak aap rok na do, live video ki tarah. Kab kaunsa use karna hai yeh pata ho to bahut time bachta hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="show versus monitor">
<rect x="20" y="20" width="270" height="130" rx="10" fill="#bae6fd"/><text x="155" y="45" text-anchor="middle" class="svg-ink" font-size="14">show = photograph</text>
<text x="155" y="75" text-anchor="middle" class="svg-ink" font-size="12">show interfaces terse</text><text x="155" y="95" text-anchor="middle" class="svg-ink" font-size="12">show log messages</text><text x="155" y="115" text-anchor="middle" class="svg-ink" font-size="12">show route</text><text x="155" y="138" text-anchor="middle" class="svg-muted" font-size="12">ek baar print, prompt wapas</text>
<rect x="350" y="20" width="270" height="130" rx="10" fill="#bbf7d0"/><text x="485" y="45" text-anchor="middle" class="svg-ink" font-size="14">monitor = live video</text>
<text x="485" y="75" text-anchor="middle" class="svg-ink" font-size="12">monitor start messages</text><text x="485" y="95" text-anchor="middle" class="svg-ink" font-size="12">monitor interface ge-0/0/0</text><text x="485" y="115" text-anchor="middle" class="svg-ink" font-size="12">monitor traffic interface</text><text x="485" y="138" text-anchor="middle" class="svg-muted" font-size="12">rokne tak update hota rehta hai</text>
</svg><p class="cap">Snapshot vs live view. Padhne ke liye show, event hota dekhne ke liye monitor.</p></div>

<h3>Jo commands aapko aane chahiye</h3>
<table class="cmp"><tr><th>Command</th><th>Kya milta hai</th></tr>
<tr><td><code>show interfaces terse</code></td><td>Har interface ki ek line: Admin, Link, Proto, Local address</td></tr>
<tr><td><code>show log messages</code></td><td>Main syslog file, purani lines pehle</td></tr>
<tr><td><code>monitor start messages</code></td><td>Messages file ki nayi lines likhte hi aapke terminal par aati hain</td></tr>
<tr><td><code>monitor stop</code></td><td>Saare monitor start output band</td></tr>
<tr><td><code>monitor interface ge-0/0/0</code></td><td>Ek interface ke traffic aur error counters ki refresh hoti screen (q dabao to quit)</td></tr>
<tr><td><code>monitor traffic interface ge-0/0/0</code></td><td>Us interface par Routing Engine ko dikhne wale packet headers, tcpdump jaisa</td></tr></table>
<p>Dhyaan rakho ki <code>monitor traffic</code> sirf wahi packets dikhata hai jo khud Routing Engine ke paas aate ya wahan se jaate hain (jaise OSPF hellos ya router ko kiye gaye pings). Forwarding hardware se guzarne wala transit traffic isme nahi dikhta.</p>

<h3>Pipes: output filter karo</h3>
<p>Output bahut lamba ho sakta hai. Junos kisi bhi show command par pipe <code>|</code> aur filter lagane deta hai.</p>
<table class="cmp"><tr><th>Pipe</th><th>Asar</th></tr>
<tr><td><code>| match OSPF</code></td><td>Sirf woh lines jinme text ho (regular expression)</td></tr>
<tr><td><code>| except ge-0/0/0</code></td><td>Match karne wali lines hata do</td></tr>
<tr><td><code>| count</code></td><td>Lines ki ginti</td></tr>
<tr><td><code>| last 20</code></td><td>Sirf aakhri 20 lines</td></tr>
<tr><td><code>| no-more</code></td><td>Pages ke beech mein mat ruko</td></tr>
<tr><td><code>| find 10.0.12</code></td><td>Pehli matching line se print karna shuru karo</td></tr></table>

<h3>Messages file padhna</h3>
<p>Junos system events <code>/var/log/messages</code> mein likhta hai. Har line mein time, host name, likhne wala process aur message code hota hai. Jaise routing process <code>rpd</code> OSPF neighbour changes ko <code>RPD_OSPF_NBRUP</code> aur <code>RPD_OSPF_NBRDOWN</code> codes ke saath log karta hai.</p>
<pre class="out">lab@R1-IDR&gt; show log messages | match RPD_OSPF | last 3
Oct  2 09:14:07  R1-IDR rpd[1631]: <span class="hl">RPD_OSPF_NBRUP: OSPF neighbor 10.0.12.2 (realm ospf-v2 ge-0/0/0.0 area 0.0.0.0) state changed from Loading to Full due to LoadDone (event reason: OSPF loading completed)</span>
Oct  2 09:14:02  R1-IDR rpd[1631]: RPD_OSPF_NBRUP: OSPF neighbor 10.0.12.2 (realm ospf-v2 ge-0/0/0.0 area 0.0.0.0) state changed from Exchange to Loading due to ExchangeDone
</pre>
<p>Aur log files bhi hain: hardware ke liye <code>chassis</code>, users ne kya type kiya uske liye <code>interactive-commands</code>, <code>security</code>, aur interface events ke liye <code>dcd</code>. <code>show log</code> se list karo aur naam se padho.</p>

<h3>Event ko live dekhna</h3>
<p><code>monitor start messages</code> chalane ka sabse achha time kuch fix karne se pehle hai. Phir commit karte hi lines screen par us pal aati hain jab event hota hai. Isse cause aur effect saabit hota hai.</p>
<pre class="code">lab@R1-IDR&gt; monitor start messages
lab@R1-IDR&gt; configure
lab@R1-IDR# commit and-quit
<span class="c">! kuch seconds mein RPD_OSPF_NBRUP line screen par aa jaati hai</span>
lab@R1-IDR&gt; monitor stop</pre>
<div class="warn"><p><b>Common mistake.</b> <code>monitor stop</code> bhool jaana. Log lines us session par aap jo bhi type karte ho usme tab tak khalal daalti rehti hain jab tak aap rok na do ya logout na karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>show log messages</code> snapshot hai, <code>monitor start messages</code> live. Agar sawaal mein "as they occur" ya "real time" likha hai to jawab monitor hai. Aur ise rokne ka command <code>monitor stop</code> hai.</p></div>

<div class="scn"><h4>Woh flapping link jo kisi ne nahi dekha</h4><p>Ek branch ne shikayat ki ki VoIP calls din mein "ek ya do baar" kat jaati hain. Engineer ne working hours mein login kiya to sab theek tha. Usne <code>show log messages | match "UPDOWN|NBRDOWN"</code> chalaya aur kal 11:02 aur 15:47 par ek link chaar chaar second ke liye down hota mila. Log ne saabit kiya ki problem asli hai, exact time diye, aur kharab patch cable ki taraf ishara kiya jise usne badal diya.</p><p><b>Lesson:</b> show snapshots intermittent problems miss kar dete hain; logs yaad rakhte hain, aur monitor agli baar use live pakadta hai.</p></div>

<div class="iv"><p class="q">"show log messages aur monitor start messages mein kya fark hai?"</p><p>Show log file mein jo pehle se hai woh print karke wapas aa jaata hai. Monitor start file ko follow karta hai aur nayi lines likhte hi print karta hai jab tak monitor stop na ho. Yeh bhi batao ki show output ko match ya last se filter karte ho, aur fix lagane se pehle monitor start karte ho taaki asar turant dikhe.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>show snapshot hai; monitor monitor stop tak live rehta hai.</li>
<li>Pipes (match, except, count, last, no-more, find) lamba output filter karte hain.</li>
<li>/var/log/messages system events rakhta hai; RPD_OSPF_NBRUP aur NBRDOWN OSPF neighbour changes mark karte hain.</li>
<li>monitor traffic sirf Routing Engine ke packets dikhata hai, transit traffic nahi.</li>
<li>Fix se pehle monitor start karo taaki event hota dikhe.</li>
</ul></div>
`}};export{e as default};