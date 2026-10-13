var e={id:`trace-options-logs`,h:{en:`Trace options and live monitoring: the Junos debugger`,hi:`Trace options aur live monitoring: Junos ka debugger`},body:{en:`
<p>Syslog is the ship's logbook: it records the important events of the voyage. <b>Trace options</b> are the black-box recorder: when you switch them on for one protocol, they record every small action in detail, so you can replay what happened. Other vendors call this debugging. On Junos the output goes to a <b>file</b>, not to your screen, so you can turn it on safely, wait, and read it later.</p>

<h3>Enabling trace options</h3>
<pre class="code">set protocols ospf traceoptions file ospf-trace size 1m files 3
set protocols ospf traceoptions flag hello
set protocols ospf traceoptions flag error
commit</pre>
<ul>
<li><code>file ospf-trace</code> names the log file in <code>/var/log</code>.</li>
<li><code>size 1m files 3</code> caps disk use: when the file reaches 1 MB it rotates to <code>ospf-trace.0.gz</code>, <code>.1.gz</code>, keeping three files in total.</li>
<li><code>flag</code> selects what to record: <code>hello</code>, <code>error</code>, <code>packets</code>, <code>state</code>, <code>all</code>. Each protocol has its own flags (for BGP <code>open</code>, <code>update</code>, <code>keepalive</code>).</li>
<li><code>no-remote-trace</code> and <code>world-readable</code> control who can read the file.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Syslog versus trace options">
<rect x="20" y="20" width="280" height="130" rx="10" fill="#bae6fd"/><text x="160" y="46" text-anchor="middle" class="svg-ink" font-size="14">syslog</text>
<text x="160" y="72" text-anchor="middle" class="svg-muted" font-size="12">important events (commits, link changes)</text><text x="160" y="92" text-anchor="middle" class="svg-muted" font-size="12">always on, low volume</text><text x="160" y="112" text-anchor="middle" class="svg-muted" font-size="12">file: messages</text>
<rect x="340" y="20" width="280" height="130" rx="10" fill="#fde68a"/><text x="480" y="46" text-anchor="middle" class="svg-ink" font-size="14">traceoptions</text>
<text x="480" y="72" text-anchor="middle" class="svg-muted" font-size="12">detailed protocol internals (every hello)</text><text x="480" y="92" text-anchor="middle" class="svg-muted" font-size="12">on for a problem, then off</text><text x="480" y="112" text-anchor="middle" class="svg-muted" font-size="12">file: ospf-trace</text>
</svg><p class="cap">Syslog tells you what happened; trace options tell you how and why.</p></div>

<h3>Reading and watching the trace</h3>
<pre class="code">lab@R1&gt; show log ospf-trace
Oct  1 11:40:02.114 OSPF rcvd Hello 10.20.1.2 -&gt; 224.0.0.5 (ge-0/0/0.0 IFL 71 area 0.0.0.0)
Oct  1 11:40:02.114   Version 2, length 44, ID 192.0.2.2, area 0.0.0.0
Oct  1 11:40:02.114   <span class="hl">Hello timer mismatch: neighbor 10, ours 30</span>
lab@R1&gt; monitor start ospf-trace
lab@R1&gt; monitor stop
lab@R1&gt; show log ospf-trace | match mismatch | last 5</pre>
<p><code>monitor start FILE</code> streams new lines to your terminal as they arrive (press Enter then <code>monitor stop</code> to end it; <code>monitor stop</code> without an argument ends all). This is much easier than reading a huge file, and the pipe filters work on both.</p>
<p>This is the clearest way to see <i>why</i> an OSPF neighbour fails: the trace shows the received hello and the exact mismatch. The CLI module's troubleshooting chapter found the same fault through the commit history; here you would see it directly in the packets.</p>

<h3>Other log tools in your kit</h3>
<table class="cmp"><tr><th>Command</th><th>Use</th></tr>
<tr><td><code>show log</code></td><td>list log files on the device</td></tr>
<tr><td><code>show log messages | last 20</code></td><td>latest system events</td></tr>
<tr><td><code>show log messages | match "UI_|SNMP|RPD"</code></td><td>filter by keyword</td></tr>
<tr><td><code>show log interactive-commands</code></td><td>commands typed by users</td></tr>
<tr><td><code>monitor start messages</code></td><td>live system log</td></tr>
<tr><td><code>monitor traffic interface ge-0/0/0 no-resolve size 1500</code></td><td>packet capture of RE traffic</td></tr>
<tr><td><code>file list /var/log detail</code></td><td>sizes and times of log files</td></tr>
<tr><td><code>clear log ospf-trace</code></td><td>empty a trace file</td></tr>
<tr><td><code>file delete /var/log/ospf-trace.0.gz</code></td><td>remove old files</td></tr></table>

<h3>Switching trace off</h3>
<p>Tracing uses CPU and disk. Always turn it off when done, but remember your settings in case you need them again:</p>
<pre class="code">deactivate protocols ospf traceoptions     <span class="c">! keeps the lines, ignored</span>
delete protocols ospf traceoptions         <span class="c">! removes them</span>
commit</pre>

<div class="eg"><p><b>Worked example.</b> Between R1 (192.0.2.1) and R2 (192.0.2.2) the OSPF neighbour will not form. You enable flag <code>hello</code> and <code>error</code>, wait 30 seconds, and run <code>show log ospf-trace | match mismatch</code>. The line shows R2 sends hello interval 10 while R1 expects 30. You fix the interval, check that the trace now shows normal hellos, and delete the traceoptions.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Leaving <code>flag all</code> on in production (CPU and disk load); forgetting <code>size</code> and <code>files</code> and filling the disk; reading the log with no filter and drowning in lines; confusing a trace file with the system <code>messages</code> log.</p></div>
<div class="exam"><p><b>Exam trap.</b> Trace options write to a named file under <code>/var/log</code>, configured under the protocol (<code>protocols ospf traceoptions</code>). <code>monitor start FILE</code> streams a file live. Trace options are not syslog.</p></div>

<div class="scn"><h4>The trace that filled the disk</h4><p>An engineer enabled <code>traceoptions flag all</code> for BGP on a busy edge router and went home. By morning the log partition was 100% full and the router could not write its own messages or commit. The next engineer deleted old files with <code>file delete</code>, removed the trace and re-enabled it with <code>size 5m files 3</code> and only <code>flag open</code> and <code>flag error</code>.</p><p><b>Lesson:</b> always limit size and files, choose specific flags, and turn tracing off afterwards.</p></div>

<div class="iv"><p class="q">"What is the difference between syslog and traceoptions?"</p><p>Syslog records significant system events, always on and at low volume, to files and remote servers. Traceoptions record detailed internal operation of a single protocol or process into a dedicated file for troubleshooting, and should be limited in size and turned off afterwards. I read traces with <code>show log</code> or watch them with <code>monitor start</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Traceoptions are Junos's protocol-level debugging, written to a file.</li>
<li>Set <code>size</code> and <code>files</code> to limit disk use and choose specific <code>flag</code> values.</li>
<li>Read with <code>show log FILE</code>; stream with <code>monitor start FILE</code>.</li>
<li>Switch tracing off with <code>deactivate</code> or <code>delete</code> when finished.</li>
<li>Syslog = events; traceoptions = detail.</li>
</ul></div>
`,hi:`
<p>Syslog jahaaz ki logbook hai: yeh safar ke important events record karti hai. <b>Trace options</b> black-box recorder hain: ek protocol ke liye on karo to yeh har chhoti action detail mein record karte hain, taaki aap replay karke dekh sako kya hua. Doosre vendors ise debugging kehte hain. Junos mein output aapki screen par nahi, ek <b>file</b> mein jaata hai, isliye aap ise safely on karke, intezaar karke, baad mein padh sakte ho.</p>

<h3>Trace options enable karna</h3>
<pre class="code">set protocols ospf traceoptions file ospf-trace size 1m files 3
set protocols ospf traceoptions flag hello
set protocols ospf traceoptions flag error
commit</pre>
<ul>
<li><code>file ospf-trace</code> <code>/var/log</code> mein log file ka naam deta hai.</li>
<li><code>size 1m files 3</code> disk use cap karta hai: file 1 MB hote hi <code>ospf-trace.0.gz</code>, <code>.1.gz</code> mein rotate hoti hai, kul teen files rakhi jaati hain.</li>
<li><code>flag</code> chunta hai kya record karna hai: <code>hello</code>, <code>error</code>, <code>packets</code>, <code>state</code>, <code>all</code>. Har protocol ke apne flags hain (BGP ke liye <code>open</code>, <code>update</code>, <code>keepalive</code>).</li>
<li><code>no-remote-trace</code> aur <code>world-readable</code> file kaun padh sakta hai control karte hain.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Syslog versus trace options">
<rect x="20" y="20" width="280" height="130" rx="10" fill="#bae6fd"/><text x="160" y="46" text-anchor="middle" class="svg-ink" font-size="14">syslog</text>
<text x="160" y="72" text-anchor="middle" class="svg-muted" font-size="12">important events (commits, link changes)</text><text x="160" y="92" text-anchor="middle" class="svg-muted" font-size="12">hamesha on, kam volume</text><text x="160" y="112" text-anchor="middle" class="svg-muted" font-size="12">file: messages</text>
<rect x="340" y="20" width="280" height="130" rx="10" fill="#fde68a"/><text x="480" y="46" text-anchor="middle" class="svg-ink" font-size="14">traceoptions</text>
<text x="480" y="72" text-anchor="middle" class="svg-muted" font-size="12">protocol ke andar ki detail (har hello)</text><text x="480" y="92" text-anchor="middle" class="svg-muted" font-size="12">problem ke liye on, phir off</text><text x="480" y="112" text-anchor="middle" class="svg-muted" font-size="12">file: ospf-trace</text>
</svg><p class="cap">Syslog batata hai kya hua; trace options batate hain kaise aur kyun.</p></div>

<h3>Trace padhna aur dekhna</h3>
<pre class="code">lab@R1&gt; show log ospf-trace
Oct  1 11:40:02.114 OSPF rcvd Hello 10.20.1.2 -&gt; 224.0.0.5 (ge-0/0/0.0 IFL 71 area 0.0.0.0)
Oct  1 11:40:02.114   Version 2, length 44, ID 192.0.2.2, area 0.0.0.0
Oct  1 11:40:02.114   <span class="hl">Hello timer mismatch: neighbor 10, ours 30</span>
lab@R1&gt; monitor start ospf-trace
lab@R1&gt; monitor stop
lab@R1&gt; show log ospf-trace | match mismatch | last 5</pre>
<p><code>monitor start FILE</code> nayi lines aate hi aapke terminal par stream karta hai (khatam karne ke liye Enter dabakar <code>monitor stop</code>; bina argument ke <code>monitor stop</code> sab band karta hai). Yeh bahut badi file padhne se aasaan hai, aur pipe filters dono par chalte hain.</p>
<p>OSPF neighbour kyun fail hota hai yeh dekhne ka sabse saaf tareeka yahi hai: trace received hello aur exact mismatch dikhata hai. CLI module ke troubleshooting chapter mein wahi fault commit history se mila tha; yahan aap use seedhe packets mein dekhte.</p>

<h3>Aapki kit ke aur log tools</h3>
<table class="cmp"><tr><th>Command</th><th>Use</th></tr>
<tr><td><code>show log</code></td><td>device par log files list karta hai</td></tr>
<tr><td><code>show log messages | last 20</code></td><td>latest system events</td></tr>
<tr><td><code>show log messages | match "UI_|SNMP|RPD"</code></td><td>keyword se filter</td></tr>
<tr><td><code>show log interactive-commands</code></td><td>users ne kaunse commands type kiye</td></tr>
<tr><td><code>monitor start messages</code></td><td>live system log</td></tr>
<tr><td><code>monitor traffic interface ge-0/0/0 no-resolve size 1500</code></td><td>RE traffic ka packet capture</td></tr>
<tr><td><code>file list /var/log detail</code></td><td>log files ke sizes aur times</td></tr>
<tr><td><code>clear log ospf-trace</code></td><td>trace file khaali karo</td></tr>
<tr><td><code>file delete /var/log/ospf-trace.0.gz</code></td><td>purani files hatao</td></tr></table>

<h3>Trace band karna</h3>
<p>Tracing CPU aur disk khaati hai. Khatam hote hi band karo, lekin settings yaad rakho jab dobara chahiye hon:</p>
<pre class="code">deactivate protocols ospf traceoptions     <span class="c">! lines rakhta hai, ignore hoti hain</span>
delete protocols ospf traceoptions         <span class="c">! hata deta hai</span>
commit</pre>

<div class="eg"><p><b>Worked example.</b> R1 (192.0.2.1) aur R2 (192.0.2.2) ke beech OSPF neighbour nahi ban raha. Aap flag <code>hello</code> aur <code>error</code> enable karte ho, 30 second ruk kar <code>show log ospf-trace | match mismatch</code> chalate ho. Line dikhati hai R2 hello interval 10 bhej raha hai jabki R1 30 expect karta hai. Aap interval theek karte ho, check karte ho ki trace ab normal hellos dikha raha hai, aur traceoptions delete kar dete ho.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Production mein <code>flag all</code> on chhod dena (CPU aur disk load); <code>size</code> aur <code>files</code> bhool kar disk bhar dena; bina filter ke log padhna aur lines mein doob jaana; trace file ko system <code>messages</code> log se confuse karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Trace options <code>/var/log</code> ke neeche named file mein likhte hain, protocol ke neeche configure hote hain (<code>protocols ospf traceoptions</code>). <code>monitor start FILE</code> file ko live stream karta hai. Trace options syslog nahi hain.</p></div>

<div class="scn"><h4>Trace jisne disk bhar di</h4><p>Ek engineer ne busy edge router par BGP ke liye <code>traceoptions flag all</code> enable kiya aur ghar chala gaya. Subah tak log partition 100% bhari thi aur router apne messages likh nahi pa raha tha aur commit nahi kar pa raha tha. Agle engineer ne <code>file delete</code> se purani files hataayin, trace hataya aur use <code>size 5m files 3</code> aur sirf <code>flag open</code> aur <code>flag error</code> ke saath dobara enable kiya.</p><p><b>Lesson:</b> hamesha size aur files limit karo, specific flags chuno, aur baad mein tracing band karo.</p></div>

<div class="iv"><p class="q">"Syslog aur traceoptions mein kya difference hai?"</p><p>Syslog significant system events record karta hai, hamesha on aur kam volume mein, files aur remote servers par. Traceoptions ek protocol ya process ka detailed internal operation troubleshooting ke liye alag file mein record karte hain, aur inhe size mein limit karke baad mein band karna chahiye. Traces ko <code>show log</code> se padhta hoon ya <code>monitor start</code> se dekhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Traceoptions Junos ki protocol-level debugging hain, file mein likhi jaati hain.</li>
<li>Disk use limit karne ke liye <code>size</code> aur <code>files</code> set karo aur specific <code>flag</code> values chuno.</li>
<li><code>show log FILE</code> se padho; <code>monitor start FILE</code> se stream karo.</li>
<li>Khatam hone par <code>deactivate</code> ya <code>delete</code> se tracing band karo.</li>
<li>Syslog = events; traceoptions = detail.</li>
</ul></div>
`}};export{e as default};