var e={id:`remote-access`,h:{en:`ssh, telnet, file copy and system health commands`,hi:`ssh, telnet, file copy aur system health commands`},body:{en:`
<p>You rarely sit next to the router. You reach it over the network, and from one router you often hop to another. This chapter covers how devices are reached, how to copy files, and the handful of <code>show system</code> and <code>show chassis</code> commands that tell you whether the device itself is healthy.</p>

<h3>ssh and telnet</h3>
<p>Both are ways to get a remote command line. <b>ssh</b> (TCP port 22) encrypts everything, including your password. <b>telnet</b> (TCP port 23) sends everything in clear text, so anyone sniffing the path can read your password. In production you use ssh and keep telnet switched off.</p>
<pre class="code">lab@R1&gt; ssh 10.255.3.3              <span class="c">! log in to another device, user lab</span>
lab@R1&gt; ssh lab@10.255.3.3
lab@R1&gt; telnet 10.255.3.3           <span class="c">! clear text, avoid in production</span></pre>
<p>A Junos device only accepts these connections if the service is enabled under <code>system services</code>:</p>
<pre class="code">lab@R3# set system services ssh
lab@R3# set system services telnet     <span class="c">! only if you really need it</span>
lab@R3# commit</pre>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Management access paths">
<rect x="20" y="40" width="120" height="60" rx="10" fill="#e2e8f0"/><text x="80" y="68" text-anchor="middle" class="svg-ink" font-size="13">Laptop</text><text x="80" y="86" text-anchor="middle" class="svg-muted" font-size="12">console or ssh</text>
<rect x="260" y="40" width="120" height="60" rx="10" fill="#bae6fd"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="320" y="86" text-anchor="middle" class="svg-muted" font-size="12">10.255.1.1</text>
<rect x="500" y="40" width="120" height="60" rx="10" fill="#bbf7d0"/><text x="560" y="68" text-anchor="middle" class="svg-ink" font-size="13">R3</text><text x="560" y="86" text-anchor="middle" class="svg-muted" font-size="12">10.255.3.3</text>
<line x1="140" y1="70" x2="260" y2="70" stroke="#64748b" stroke-width="2"/><line x1="380" y1="70" x2="500" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="200" y="60" text-anchor="middle" class="svg-accent" font-size="12">ssh 22</text><text x="440" y="60" text-anchor="middle" class="svg-accent" font-size="12">ssh 22</text>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">R3 must have: set system services ssh</text>
</svg><p class="cap">Hop-by-hop access. The target device must have the service enabled, and a route back to you.</p></div>

<h3>Copying files</h3>
<p>Use <code>file list</code> to see files and <code>file copy</code> to move them. File copy accepts local paths and remote ones with scp-style syntax. Software packages and saved configurations usually go to <code>/var/tmp/</code>.</p>
<pre class="code">lab@R1&gt; file list /var/tmp/ detail
lab@R1&gt; file copy lab@10.255.9.9:/images/junos-install.tgz /var/tmp/
lab@R1&gt; file show /var/log/messages | last 5
lab@R1&gt; show system storage</pre>
<p>You can also save and load configurations: <code>save /var/tmp/r1.conf</code> from configuration mode writes the candidate to a file, and <code>load override /var/tmp/r1.conf</code> replaces the candidate with it. Treat <code>load override</code> carefully; it replaces the whole candidate.</p>

<h3>Is the device itself healthy?</h3>
<table class="cmp"><tr><th>Command</th><th>Tells you</th></tr>
<tr><td><code>show version</code></td><td>Hostname, model, Junos release</td></tr>
<tr><td><code>show system uptime</code></td><td>Current time, boot time, how long it has been up, and the last configuration commit</td></tr>
<tr><td><code>show system alarms</code> and <code>show chassis alarms</code></td><td>Active software and hardware alarms, such as a rescue configuration missing</td></tr>
<tr><td><code>show chassis hardware</code></td><td>Inventory with serial numbers</td></tr>
<tr><td><code>show chassis environment</code></td><td>Fans, power and temperature (platform dependent)</td></tr>
<tr><td><code>show system processes</code></td><td>Running processes, like top</td></tr>
<tr><td><code>show system users</code></td><td>Who is logged in right now</td></tr>
<tr><td><code>show system storage</code></td><td>Disk usage per file system</td></tr></table>
<pre class="out">lab@R1-IDR&gt; show system uptime
Current time: 2026-10-02 09:21:44 UTC
System booted: 2026-09-30 06:02:10 UTC (2d 03:19 ago)
Protocols started: 2026-09-30 06:03:51 UTC (2d 03:17 ago)
<span class="hl">Last configured: 2026-10-02 09:14:00 UTC (00:07:44 ago) by lab</span>
12:21AM  up 2 days, 3:19, 2 users, load averages: 0.11, 0.09, 0.08
</pre>
<p>The "Last configured" line is gold when someone says "it worked until this morning": it shows when and by whom the configuration was last changed. You can then compare with <code>show system commit</code> and <code>show configuration | compare rollback 1</code>.</p>

<div class="warn"><p><b>Common mistake.</b> Enabling telnet "just for the lab" and leaving it on. Any service you enable is attack surface; ssh is enough. Another one: ssh from a router fails because the far end has no route back to the source address, so check routes both ways.</p></div>
<div class="exam"><p><b>Exam trap.</b> Junos does not allow root to log in over ssh by default. If a question asks why "ssh root@router" is refused, the answer is the root-login setting, not a network fault. Use a named user in class super-user.</p></div>

<div class="scn"><h4>Who changed the router?</h4><p>On Monday the Indore link stopped carrying traffic. The engineer ssh-ed from R1 to the neighbour hub using its loopback, ran <code>show system uptime</code>, and saw "Last configured 02:11 by anil". Show system commit listed what was committed at that time and <code>show configuration | compare rollback 1</code> showed one deleted line. The change had been made during a maintenance window and was simply incomplete. Rollback fixed it in one command.</p><p><b>Lesson:</b> the device remembers who did what. Ask it before you ask the team.</p></div>

<div class="iv"><p class="q">"Why prefer ssh to telnet, and what must be true for ssh to work?"</p><p>Ssh encrypts the session including credentials; telnet is clear text. For ssh to work the target needs <code>set system services ssh</code> committed, IP reachability both ways between source and target, no filter blocking TCP 22, and valid credentials. Mention that root login over ssh is denied by default.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ssh uses TCP 22 and encrypts; telnet uses TCP 23 and does not.</li>
<li>The service must be enabled under system services before the device accepts logins.</li>
<li>file list, file copy and file show manage files; packages go to /var/tmp.</li>
<li>show version, system uptime, system alarms, chassis hardware and system storage check device health.</li>
<li>Last configured in show system uptime tells you when the config last changed.</li>
</ul></div>
`,hi:`
<p>Aap shayad hi kabhi router ke paas baithte ho. Network se connect karte ho, aur ek router se aksar doosre par hop karte ho. Is chapter mein devices tak kaise pahunchte hain, files kaise copy karte hain, aur woh kuch <code>show system</code> aur <code>show chassis</code> commands jo batate hain ki device khud theek hai ya nahi.</p>

<h3>ssh aur telnet</h3>
<p>Dono remote command line paane ke tarike hain. <b>ssh</b> (TCP port 22) sab kuch encrypt karta hai, password samet. <b>telnet</b> (TCP port 23) sab kuch clear text mein bhejta hai, isliye path par sniff karne wala koi bhi aapka password padh sakta hai. Production mein ssh use hota hai aur telnet band rakhte hain.</p>
<pre class="code">lab@R1&gt; ssh 10.255.3.3              <span class="c">! dusre device par login, user lab</span>
lab@R1&gt; ssh lab@10.255.3.3
lab@R1&gt; telnet 10.255.3.3           <span class="c">! clear text, production mein avoid</span></pre>
<p>Junos device yeh connections tabhi accept karta hai jab <code>system services</code> ke neeche service enabled ho:</p>
<pre class="code">lab@R3# set system services ssh
lab@R3# set system services telnet     <span class="c">! sirf agar sach mein zaroorat ho</span>
lab@R3# commit</pre>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Management access paths">
<rect x="20" y="40" width="120" height="60" rx="10" fill="#e2e8f0"/><text x="80" y="68" text-anchor="middle" class="svg-ink" font-size="13">Laptop</text><text x="80" y="86" text-anchor="middle" class="svg-muted" font-size="12">console ya ssh</text>
<rect x="260" y="40" width="120" height="60" rx="10" fill="#bae6fd"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="320" y="86" text-anchor="middle" class="svg-muted" font-size="12">10.255.1.1</text>
<rect x="500" y="40" width="120" height="60" rx="10" fill="#bbf7d0"/><text x="560" y="68" text-anchor="middle" class="svg-ink" font-size="13">R3</text><text x="560" y="86" text-anchor="middle" class="svg-muted" font-size="12">10.255.3.3</text>
<line x1="140" y1="70" x2="260" y2="70" stroke="#64748b" stroke-width="2"/><line x1="380" y1="70" x2="500" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="200" y="60" text-anchor="middle" class="svg-accent" font-size="12">ssh 22</text><text x="440" y="60" text-anchor="middle" class="svg-accent" font-size="12">ssh 22</text>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">R3 par chahiye: set system services ssh</text>
</svg><p class="cap">Hop-by-hop access. Target device par service enabled honi chahiye, aur aapki taraf wapas route bhi.</p></div>

<h3>Files copy karna</h3>
<p>Files dekhne ke liye <code>file list</code> aur move karne ke liye <code>file copy</code> use karo. File copy local paths aur scp-style syntax wale remote paths dono leta hai. Software packages aur saved configurations aam taur par <code>/var/tmp/</code> mein jaate hain.</p>
<pre class="code">lab@R1&gt; file list /var/tmp/ detail
lab@R1&gt; file copy lab@10.255.9.9:/images/junos-install.tgz /var/tmp/
lab@R1&gt; file show /var/log/messages | last 5
lab@R1&gt; show system storage</pre>
<p>Configurations save aur load bhi kar sakte ho: configuration mode mein <code>save /var/tmp/r1.conf</code> candidate ko file mein likhta hai, aur <code>load override /var/tmp/r1.conf</code> candidate ko us se replace karta hai. <code>load override</code> dhyaan se use karo; yeh poora candidate badal deta hai.</p>

<h3>Kya device khud healthy hai?</h3>
<table class="cmp"><tr><th>Command</th><th>Batata hai</th></tr>
<tr><td><code>show version</code></td><td>Hostname, model, Junos release</td></tr>
<tr><td><code>show system uptime</code></td><td>Current time, boot time, kitni der se up, aur last configuration commit</td></tr>
<tr><td><code>show system alarms</code> aur <code>show chassis alarms</code></td><td>Active software aur hardware alarms, jaise rescue configuration missing</td></tr>
<tr><td><code>show chassis hardware</code></td><td>Serial numbers ke saath inventory</td></tr>
<tr><td><code>show chassis environment</code></td><td>Fans, power aur temperature (platform par depend)</td></tr>
<tr><td><code>show system processes</code></td><td>Chalte hue processes, top jaisa</td></tr>
<tr><td><code>show system users</code></td><td>Abhi kaun logged in hai</td></tr>
<tr><td><code>show system storage</code></td><td>Har file system ka disk usage</td></tr></table>
<pre class="out">lab@R1-IDR&gt; show system uptime
Current time: 2026-10-02 09:21:44 UTC
System booted: 2026-09-30 06:02:10 UTC (2d 03:19 ago)
Protocols started: 2026-09-30 06:03:51 UTC (2d 03:17 ago)
<span class="hl">Last configured: 2026-10-02 09:14:00 UTC (00:07:44 ago) by lab</span>
12:21AM  up 2 days, 3:19, 2 users, load averages: 0.11, 0.09, 0.08
</pre>
<p>Jab koi kahe "aaj subah tak chal raha tha" to "Last configured" line sone jaisi hai: yeh batati hai ki configuration kab aur kisne last badli. Phir <code>show system commit</code> aur <code>show configuration | compare rollback 1</code> se compare kar sakte ho.</p>

<div class="warn"><p><b>Common mistake.</b> "Sirf lab ke liye" telnet enable karke chhod dena. Jo bhi service on karte ho woh attack surface hai; ssh kaafi hai. Ek aur: router se ssh fail hota hai kyunki far end ke paas source address tak wapas route nahi, isliye dono taraf routes check karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Junos by default root ko ssh se login nahi karne deta. Agar sawaal poochta hai "ssh root@router" kyun refuse ho raha hai to jawab root-login setting hai, network fault nahi. Class super-user wala named user use karo.</p></div>

<div class="scn"><h4>Router kisne badla?</h4><p>Monday ko Indore link par traffic band ho gaya. Engineer ne R1 se neighbour hub par uske loopback se ssh kiya, <code>show system uptime</code> chalaya, aur "Last configured 02:11 by anil" dikha. Show system commit ne us waqt ka commit list kiya aur <code>show configuration | compare rollback 1</code> ne ek deleted line dikhayi. Change maintenance window mein hua tha aur bas adhoora tha. Rollback ne ek command mein theek kar diya.</p><p><b>Lesson:</b> device yaad rakhta hai kisne kya kiya. Team se poochne se pehle device se poocho.</p></div>

<div class="iv"><p class="q">"ssh ko telnet par kyun prefer karte ho, aur ssh chalne ke liye kya true hona chahiye?"</p><p>Ssh session ko credentials samet encrypt karta hai; telnet clear text hai. Ssh ke liye target par <code>set system services ssh</code> committed ho, source aur target ke beech dono taraf IP reachability ho, TCP 22 block karne wala filter na ho, aur valid credentials hon. Yeh bhi batao ki root login over ssh by default denied hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ssh TCP 22 use karta hai aur encrypt karta hai; telnet TCP 23 use karta hai aur encrypt nahi karta.</li>
<li>Device login accept kare isse pehle system services ke neeche service enabled honi chahiye.</li>
<li>file list, file copy aur file show files manage karte hain; packages /var/tmp mein jaate hain.</li>
<li>show version, system uptime, system alarms, chassis hardware aur system storage device health check karte hain.</li>
<li>show system uptime ka Last configured batata hai config last kab badli.</li>
</ul></div>
`}};export{e as default};