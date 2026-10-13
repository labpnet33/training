var e=e=>`<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Source interface changes the file">
<rect x="15" y="20" width="170" height="100" rx="10" fill="#bae6fd"/><text x="100" y="45" text-anchor="middle" class="svg-ink" font-size="14">PUN-CORE-R1</text><text x="100" y="66" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 10.99.0.1</text><text x="100" y="86" text-anchor="middle" class="svg-muted" font-size="12">Loopback9 10.255.9.1</text>
<rect x="400" y="15" width="225" height="45" rx="8" fill="#bbf7d0"/><text x="512" y="43" text-anchor="middle" class="svg-ink" font-size="13">10.99.0.1.log  (default source)</text>
<rect x="400" y="80" width="225" height="45" rx="8" fill="#fde68a"/><text x="512" y="108" text-anchor="middle" class="svg-ink" font-size="13">10.255.9.1.log (source-interface)</text>
<line x1="185" y1="45" x2="400" y2="38" stroke="#64748b" stroke-width="2"/><line x1="185" y1="95" x2="400" y2="102" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">`+e+`</p></div>`,t=`<pre class="code">PUN-CORE-R1# configure terminal
PUN-CORE-R1(config)# service timestamps log datetime msec
PUN-CORE-R1(config)# logging host 10.99.0.30
PUN-CORE-R1(config)# logging trap informational
PUN-CORE-R1(config)# end
PUN-CORE-R1# send log 5 "NK-2400 syslog test"
PUN-CORE-R1# show logging | include Trap|Logging to</pre>
<pre class="out">    Trap logging: level informational, 2 message lines logged
        <span class="hl">Logging to 10.99.0.30</span>  (udp port 514, audit disabled,</pre>`,n=`<pre class="code">netadmin@syslog01:~$ cat /var/log/remote/10.99.0.1.log</pre>
<pre class="out">Sep 29 09:00:32 10.99.0.1 1: *Oct  2 02:19:24.781: %SYS-5-CONFIG_I: Configured from console by console
Sep 29 09:00:32 10.99.0.1 2: *Oct  2 02:19:24.781: %SYS-5-USERLOG_NOTICE: Message from tty0(user id: ): <span class="hl">NK-2400 syslog test</span></pre>`,r=`<pre class="code">PUN-CORE-R1(config)# logging source-interface Loopback9
netadmin@syslog01:~$ grep -n CONFIG_I /var/log/remote/*.log</pre>
<pre class="out">/var/log/remote/<span class="hl">10.255.9.1.log</span>:1:Sep 29 09:00:57 10.255.9.1 3: 000003: *Oct  2 02:23:28.506: %SYS-5-CONFIG_I: Configured from console by console
/var/log/remote/10.99.0.1.log:1:Sep 29 09:00:32 10.99.0.1 1: *Oct  2 02:23:03.506: %SYS-5-CONFIG_I: Configured from console by console
/var/log/remote/10.99.0.2.log:1:Sep 29 09:00:32 10.99.0.2 1: *Oct  2 02:23:03.506: %SYS-5-CONFIG_I: Configured from console by console
<span class="c"># (two more lines, from 10.99.0.2.log, are left out here)</span></pre>`,i=`<pre class="code"><span class="c"># Reference commands (not run in the simulator)</span>
<span class="c"># Junos (a Juniper device as the sender):</span>
set system syslog host 10.99.0.30 any notice
set system syslog host 10.99.0.30 port 514
<span class="c"># Another Linux server as the sender: /etc/rsyslog.d/90-forward.conf</span>
*.* @10.99.0.30:514        <span class="c"># one @ = UDP</span>
*.* @@10.99.0.30:514       <span class="c"># two @@ = TCP</span></pre>`,a={id:`router-sender`,h:{en:`The sender side: pointing routers at the server`,hi:`Sender side: routers ko server ki taraf point karna`},body:{en:`
<p>The server is ready, but a receiver with no sender is silent. Now you configure the routers PUN-CORE-R1 (10.99.0.1) and BLR-EDGE-R2 (10.99.0.2). The same four ideas apply to any vendor: <b>where</b> to send, <b>what level</b> to send, <b>what time stamp</b> to add, and <b>which source address</b> to use.</p>

<h3>The four Cisco IOS commands</h3>
<dl class="terms">
<dt>service timestamps log datetime msec</dt><dd>Adds date, time and milliseconds to each log message. Without it the lines carry only the uptime, which is useless when you compare devices.</dd>
<dt>logging host 10.99.0.30</dt><dd>The server address. By default IOS sends UDP port 514. You can repeat the command for a second server.</dd>
<dt>logging trap informational</dt><dd>The severity threshold for the server: send levels 0 to 6. The word <i>trap</i> here only means "messages sent to a syslog server".</dd>
<dt>send log 5 "text"</dt><dd>Creates a test message of severity 5 on purpose. It is your end-to-end test: if the text shows up on the server, the whole path works.</dd>
</dl>
`+t+`
<p><code>show logging</code> has many lines; filter it with <code>| include</code>. The two lines above are the ones to read: the <b>trap level</b> and <b>Logging to 10.99.0.30</b> with port 514. The counter "2 message lines logged" proves the router really sent two messages.</p>
<p>Now check the server. Both the configuration change and your test message arrived:</p>
`+n+`
<p>Look at the line layout. The server stamped its own receive time first (<code>Sep 29 09:00:32</code>), then the sender address <code>10.99.0.1</code>, then the router's message: a sequence number <code>1:</code> and the router's own time <code>*Oct  2 02:19:24.781</code>. The leading asterisk is IOS saying "my clock is not synchronised". Notice that the two times differ by days. We fix that in chapter 8.</p>

<h3>Choosing the source address</h3>
<p>A router has many interfaces and addresses. By default it uses the address of the interface that leaves towards the server. That address can change after a routing change, and then the server files your messages under a new name. <code>logging source-interface</code> pins it to a stable address, normally a loopback. In the simulator the effect is easy to see:</p>
`+r+`
`+e(`After logging source-interface Loopback9 the router appears under a second file name.`)+`
<p>The messages now come from 10.255.9.1, so rsyslog created a <b>new file</b> named after that address, and the sequence number format changed too. Neither is an error, but your old file stopped growing. Choose one source address deliberately, tell the server team, and keep it. A firewall rule that allows only 10.99.0.0/24 would also drop 10.255.9.1.</p>

<h3>Other vendors and Linux clients</h3>
<p>Every platform answers the same four questions with different words. For completeness:</p>
`+i+`

<div class="eg"><p><b>Worked example.</b> For a new branch router you paste the three-line template: timestamps, <code>logging host 10.99.0.30</code>, <code>logging trap informational</code>. You send a test with <code>send log 5 "NK-2400 syslog test"</code> and run <code>grep NK-2400 /var/log/remote/*.log</code> on the server. One matching line with the new router's IP proves the whole path: router, network, firewall, rsyslog and file. Total time: two minutes.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Typing the wrong server address (a typo in one octet sends your logs to nobody and the router shows no error); setting the trap level too low so your test is filtered; forgetting that UDP gives no error when the server is down. Always finish with a test message.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>logging trap</code> controls the syslog server. <code>logging console</code>, <code>logging monitor</code> and <code>logging buffered</code> have their own levels. A question may show all of them and ask which one affects the server.</p></div>

<div class="scn"><h4>The loopback that split the logs</h4><p>A team standardised <code>logging source-interface Loopback0</code> on all routers. The next morning the analysts' saved searches on the file for R4 returned nothing new, because the router now logged under its loopback address. The data was safe in a new file. They added both names to the search and updated the documentation.</p><p><b>Lesson:</b> the sender address is part of your data model. Change it deliberately.</p></div>

<div class="iv"><p class="q">"How do you verify that a router is really sending syslog to the server?"</p><p>On the router, <code>show logging</code> must list the server host with the right port and a rising message counter. Then generate a known message, for example <code>send log 5 "test"</code>, and search for it on the server. Finally check that the trap level allows the test severity and that the source address matches what the firewall and file naming expect.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Four decisions per sender: server address, level, time stamps, source address.</li>
<li><code>logging host</code> + <code>logging trap informational</code> + <code>service timestamps log datetime msec</code> is the standard template.</li>
<li><code>send log 5 "text"</code> creates a test message; find it on the server with grep.</li>
<li><code>logging source-interface</code> changes the sender address and therefore the file name on the server.</li>
<li>The leading asterisk in an IOS timestamp means the clock is not synchronised.</li>
</ul></div>
`,hi:`
<p>Server ready hai, par sender ke bina receiver chup rehta hai. Ab aap routers PUN-CORE-R1 (10.99.0.1) aur BLR-EDGE-R2 (10.99.0.2) configure karte ho. Yahi chaar ideas har vendor par lagte hain: <b>kahan</b> bhejna hai, <b>kaunsa level</b> bhejna hai, <b>kaunsa time stamp</b> jodna hai, aur <b>kaunsa source address</b> use karna hai.</p>

<h3>Chaar Cisco IOS commands</h3>
<dl class="terms">
<dt>service timestamps log datetime msec</dt><dd>Har log message mein date, time aur milliseconds jodta hai. Iske bina lines mein sirf uptime hota hai, jo devices compare karte waqt bekaar hai.</dd>
<dt>logging host 10.99.0.30</dt><dd>Server address. Default mein IOS UDP port 514 bhejta hai. Doosre server ke liye command dohra sakte ho.</dd>
<dt>logging trap informational</dt><dd>Server ke liye severity threshold: levels 0 se 6 bhejo. Yahan <i>trap</i> shabd ka matlab sirf "syslog server ko bheje gaye messages" hai.</dd>
<dt>send log 5 "text"</dt><dd>Jaan-boojh kar severity 5 ka test message banata hai. Yeh aapka end-to-end test hai: agar text server par dikhe to poora path chalta hai.</dd>
</dl>
`+t+`
<p><code>show logging</code> mein bahut lines hoti hain; use <code>| include</code> se filter karo. Upar ki do lines padhne wali hain: <b>trap level</b> aur port 514 ke saath <b>Logging to 10.99.0.30</b>. Counter "2 message lines logged" sabit karta hai ki router ne sach mein do messages bheje.</p>
<p>Ab server check karo. Configuration change aur aapka test message dono pahunche:</p>
`+n+`
<p>Line ka layout dekho. Server ne pehle apna receive time lagaya (<code>Sep 29 09:00:32</code>), phir sender address <code>10.99.0.1</code>, phir router ka message: sequence number <code>1:</code> aur router ka apna time <code>*Oct  2 02:19:24.781</code>. Shuru ka asterisk IOS ka kehna hai "meri clock synchronised nahi hai". Dhyan do ki dono times mein dino ka farak hai. Isko hum chapter 8 mein theek karenge.</p>

<h3>Source address chunna</h3>
<p>Router ke paas bahut saare interfaces aur addresses hote hain. Default mein woh us interface ka address use karta hai jo server ki taraf jaata hai. Woh address routing change ke baad badal sakta hai, aur tab server aapke messages naye naam se file karta hai. <code>logging source-interface</code> use ek stable address par pin karta hai, aam taur par loopback. Simulator mein asar aasaani se dikhta hai:</p>
`+r+`
`+e(`logging source-interface Loopback9 ke baad router doosre file naam ke neeche dikhta hai.`)+`
<p>Messages ab 10.255.9.1 se aate hain, isliye rsyslog ne us address ke naam par <b>nayi file</b> banayi, aur sequence number ka format bhi badal gaya. Dono error nahi hain, par aapki purani file badhna band ho gayi. Ek source address soch samajh kar chuno, server team ko batao aur use rakho. Sirf 10.99.0.0/24 allow karne wala firewall rule 10.255.9.1 ko bhi drop kar deta.</p>

<h3>Doosre vendors aur Linux clients</h3>
<p>Har platform wahi chaar sawaal alag shabdon mein hal karta hai. Poore hone ke liye:</p>
`+i+`

<div class="eg"><p><b>Worked example.</b> Naye branch router ke liye aap teen-line template paste karte ho: timestamps, <code>logging host 10.99.0.30</code>, <code>logging trap informational</code>. Aap <code>send log 5 "NK-2400 syslog test"</code> se test bhejte ho aur server par <code>grep NK-2400 /var/log/remote/*.log</code> chalate ho. Naye router ke IP ke saath ek matching line poora path sabit karti hai: router, network, firewall, rsyslog aur file. Kul time: do minute.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Galat server address type karna (ek octet ka typo aapke logs ko kisi ko nahi bhejta aur router koi error nahi dikhata); trap level bahut neeche rakhna jisse aapka test filter ho jaaye; yeh bhoolna ki server down ho to UDP koi error nahi deta. Hamesha test message se khatam karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>logging trap</code> syslog server ko control karta hai. <code>logging console</code>, <code>logging monitor</code> aur <code>logging buffered</code> ke apne levels hain. Sawaal mein sab dikha kar poochha ja sakta hai ki kaunsa server ko affect karta hai.</p></div>

<div class="scn"><h4>Loopback jisne logs baant diye</h4><p>Ek team ne sab routers par <code>logging source-interface Loopback0</code> standard kiya. Agli subah analysts ki R4 ki file par saved searches mein kuch naya nahi mila, kyunki router ab apne loopback address ke naam se log kar raha tha. Data nayi file mein surakshit tha. Unhone search mein dono naam jode aur documentation update ki.</p><p><b>Lesson:</b> sender address aapke data model ka hissa hai. Use soch kar badlo.</p></div>

<div class="iv"><p class="q">"Kaise verify karte ho ki router sach mein server ko syslog bhej raha hai?"</p><p>Router par <code>show logging</code> mein server host sahi port ke saath aur badhta hua message counter dikhna chahiye. Phir ek known message banao, jaise <code>send log 5 "test"</code>, aur server par use dhoondho. Aakhir mein check karo ki trap level test severity allow karta hai aur source address wahi hai jo firewall aur file naming expect karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har sender ke chaar faisle: server address, level, time stamps, source address.</li>
<li><code>logging host</code> + <code>logging trap informational</code> + <code>service timestamps log datetime msec</code> standard template hai.</li>
<li><code>send log 5 "text"</code> test message banata hai; server par grep se dhoondho.</li>
<li><code>logging source-interface</code> sender address badalta hai aur isliye server par file naam bhi.</li>
<li>IOS timestamp ke shuru ka asterisk ka matlab clock synchronised nahi hai.</li>
</ul></div>
`}};export{a as default};