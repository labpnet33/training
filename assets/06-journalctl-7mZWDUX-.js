var e={id:`journalctl`,h:{en:`Reading service logs with journalctl`,hi:`journalctl se service logs padhna`},body:{en:`
<p>When a service misbehaves, the log tells you why. On modern Ubuntu, systemd collects the messages of every service in the <b>journal</b>, and <code>journalctl</code> reads it. This is your "show logging" command for Linux services.</p>

<h3>One service's story: -u</h3>
<p><code>-u</code> means "unit": show only the messages for that service. Here is nginx after the stop and start drill from Chapter 4:</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">journalctl -u nginx</span>
Sep 29 09:00:46 nms02 systemd[1]: Starting nginx.service - A high performance web server and a reverse proxy server...
Sep 29 09:00:46 nms02 systemd[1]: Started nginx.service - A high performance web server and a reverse proxy server.
Sep 29 09:01:04 nms02 systemd[1]: Stopping nginx.service - A high performance web server and a reverse proxy server...
Sep 29 09:01:04 nms02 systemd[1]: nginx.service: <span class="hl">Deactivated successfully.</span>
Sep 29 09:01:04 nms02 systemd[1]: Stopped nginx.service - A high performance web server and a reverse proxy server.
Sep 29 09:01:10 nms02 systemd[1]: Starting nginx.service - A high performance web server and a reverse proxy server...
Sep 29 09:01:10 nms02 systemd[1]: Started nginx.service - A high performance web server and a reverse proxy server.
Sep 29 09:01:14 nms02 systemd[1]: Stopping nginx.service - A high performance web server and a reverse proxy server...
...</pre>
<p>Each line has a timestamp, the host name (<code>nms02</code>), the program that wrote it (<code>systemd[1]</code>) and a message. "Deactivated successfully" is the normal message after a clean stop. The journal remembers your drill in order, which makes it a timeline of what happened.</p>

<h3>Only the latest: -n</h3>
<pre class="out">netadmin@nms02:~$ <span class="hl">journalctl -u nginx -n 3</span>
Sep 29 09:01:14 nms02 systemd[1]: Starting nginx.service - A high performance web server and a reverse proxy server...
Sep 29 09:01:14 nms02 systemd[1]: Started nginx.service - A high performance web server and a reverse proxy server.
Sep 29 09:01:16 nms02 systemd[1]: Reloaded nginx.service - A high performance web server and a reverse proxy server.</pre>
<p><code>-n 3</code> prints the last three lines. Note the word <b>Reloaded</b>: that is the record of the <code>reload</code> from Chapter 4, proof that reload does not stop the service (there is no Stopping line before it).</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="journalctl filters: by service -u, by count -n, by severity -p, by time --since">
<rect x="10" y="50" width="140" height="60" rx="8" fill="#bae6fd"/><text x="80" y="76" text-anchor="middle" class="svg-ink" font-size="12">-u nginx</text><text x="80" y="94" text-anchor="middle" class="svg-ink" font-size="11">which service</text>
<rect x="170" y="50" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="240" y="76" text-anchor="middle" class="svg-ink" font-size="12">-n 20</text><text x="240" y="94" text-anchor="middle" class="svg-ink" font-size="11">how many lines</text>
<rect x="330" y="50" width="140" height="60" rx="8" fill="#fde68a"/><text x="400" y="76" text-anchor="middle" class="svg-ink" font-size="12">-p err</text><text x="400" y="94" text-anchor="middle" class="svg-ink" font-size="11">how serious</text>
<rect x="490" y="50" width="140" height="60" rx="8" fill="#fed7aa"/><text x="560" y="76" text-anchor="middle" class="svg-ink" font-size="12">--since today</text><text x="560" y="94" text-anchor="middle" class="svg-ink" font-size="11">which time</text>
</svg><p class="cap">Combine filters to cut the noise.</p></div>

<h3>Only the problems: -p err</h3>
<p>Priority <code>err</code> shows errors and worse. In the ticket lab (the broken SSH server) this is the quickest way to the cause:</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">journalctl -p err -n 5</span>
Sep 29 09:00:00 nms02 sshd[700]: /etc/ssh/sshd_config line 5: <span class="hl">Bad configuration option: PasswordAuthentcation</span>
Sep 29 09:00:00 nms02 systemd[1]: ssh.service: Failed with result 'exit-code'.
Sep 29 09:00:00 nms02 systemd[1]: Failed to start ssh.service - OpenBSD Secure Shell server.</pre>
<p>Three error lines, and the first one names the exact file, the line number and the misspelled word. Compare "PasswordAuthentcation" with the correct spelling: the letter "i" is missing.</p>

<h3>Only a time range: --since</h3>
<pre class="out">netadmin@nms02:~$ <span class="hl">journalctl --since today -n 3</span>
Sep 29 09:01:04 nms02 sudo:    netadmin : TTY=pts/0 ; PWD=/home/netadmin ; USER=root ; COMMAND=systemctl enable --now cron
Sep 29 09:01:04 nms02 systemd[1]: Starting cron.service - Regular background program processing daemon...
Sep 29 09:01:04 nms02 systemd[1]: Started cron.service - Regular background program processing daemon.</pre>
<p>Interesting: the journal also records every <code>sudo</code> command, with who ran it and in which folder. That makes the journal an audit trail: you can see exactly who enabled cron and when.</p>

<h3>Following live: -f</h3>
<p><code>journalctl -f</code> follows new messages as they arrive, like <code>tail -f</code> (press Ctrl+C to stop). In the simulator it prints the latest entries and returns; on a real server it keeps running.</p>

<h3>Reference (not run in the simulator)</h3>
<pre class="code">journalctl -u nginx --since "1 hour ago"   <span class="c"># relative time window</span>
journalctl -b                               <span class="c"># everything since this boot</span>
journalctl -xeu ssh.service                 <span class="c"># newest first, with explanations</span></pre>

<div class="eg"><p><b>Worked example.</b> A colleague says "ssh stopped working after last night's change". You run <code>journalctl -p err -n 5</code> and read the first line: a bad option at line 5 of sshd_config. You never opened the config file to hunt for the fault, because the log pointed straight at it.</p></div>
<div class="warn"><p><b>Common beginner mistake.</b> Reading from the top of a huge log instead of using <code>-u</code>, <code>-n</code> and <code>-p</code>. Filter first; read second.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>journalctl</code> shows the systemd journal; <code>/var/log/auth.log</code> is a plain text file. Both exist on Ubuntu, and a question may ask which command reads which.</p></div>

<div class="scn"><h4>Who restarted the service?</h4><p>nginx restarted at 3 am and customers asked why. The journal showed a <code>sudo</code> line from a colleague's account just before. It was a planned certificate renewal that had not been announced. The log settled the question in a minute.</p><p><b>Lesson:</b> the journal records actions as well as errors.</p></div>

<div class="iv"><p class="q">"How do you find out why a systemd service failed?"</p><p>I run <code>systemctl status</code> for the summary, then <code>journalctl -u name</code> or <code>journalctl -p err</code> for the detail. The first error line normally names the file and the line number that caused it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>journalctl -u name</code> shows one service's log.</li>
<li><code>-n</code> limits lines, <code>-p err</code> keeps errors, <code>--since</code> limits time.</li>
<li>The journal also records sudo commands.</li>
<li>Filter before you read.</li>
</ul></div>
`,hi:`
<p>Service gadbad kare to log batata hai kyun. Modern Ubuntu par systemd har service ke messages <b>journal</b> mein jama karta hai, aur <code>journalctl</code> use padhta hai. Yeh Linux services ke liye aapka "show logging" command hai.</p>

<h3>Ek service ki kahani: -u</h3>
<p><code>-u</code> matlab "unit": sirf us service ke messages dikhao. Yeh Chapter 4 ke stop aur start drill ke baad nginx hai:</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">journalctl -u nginx</span>
Sep 29 09:00:46 nms02 systemd[1]: Starting nginx.service - A high performance web server and a reverse proxy server...
Sep 29 09:00:46 nms02 systemd[1]: Started nginx.service - A high performance web server and a reverse proxy server.
Sep 29 09:01:04 nms02 systemd[1]: Stopping nginx.service - A high performance web server and a reverse proxy server...
Sep 29 09:01:04 nms02 systemd[1]: nginx.service: <span class="hl">Deactivated successfully.</span>
Sep 29 09:01:04 nms02 systemd[1]: Stopped nginx.service - A high performance web server and a reverse proxy server.
Sep 29 09:01:10 nms02 systemd[1]: Starting nginx.service - A high performance web server and a reverse proxy server...
Sep 29 09:01:10 nms02 systemd[1]: Started nginx.service - A high performance web server and a reverse proxy server.
Sep 29 09:01:14 nms02 systemd[1]: Stopping nginx.service - A high performance web server and a reverse proxy server...
...</pre>
<p>Har line mein timestamp, host name (<code>nms02</code>), likhne wala program (<code>systemd[1]</code>) aur message hota hai. "Deactivated successfully" saaf stop ke baad ka normal message hai. Journal aapka drill order mein yaad rakhta hai, isliye woh kya hua uski timeline hai.</p>

<h3>Sirf latest: -n</h3>
<pre class="out">netadmin@nms02:~$ <span class="hl">journalctl -u nginx -n 3</span>
Sep 29 09:01:14 nms02 systemd[1]: Starting nginx.service - A high performance web server and a reverse proxy server...
Sep 29 09:01:14 nms02 systemd[1]: Started nginx.service - A high performance web server and a reverse proxy server.
Sep 29 09:01:16 nms02 systemd[1]: Reloaded nginx.service - A high performance web server and a reverse proxy server.</pre>
<p><code>-n 3</code> aakhri teen lines print karta hai. <b>Reloaded</b> shabd dekho: yeh Chapter 4 ke <code>reload</code> ka record hai, saboot ki reload service ko stop nahi karta (iske pehle koi Stopping line nahi).</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="journalctl filters: service -u, count -n, severity -p, time --since">
<rect x="10" y="50" width="140" height="60" rx="8" fill="#bae6fd"/><text x="80" y="76" text-anchor="middle" class="svg-ink" font-size="12">-u nginx</text><text x="80" y="94" text-anchor="middle" class="svg-ink" font-size="11">kaunsi service</text>
<rect x="170" y="50" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="240" y="76" text-anchor="middle" class="svg-ink" font-size="12">-n 20</text><text x="240" y="94" text-anchor="middle" class="svg-ink" font-size="11">kitni lines</text>
<rect x="330" y="50" width="140" height="60" rx="8" fill="#fde68a"/><text x="400" y="76" text-anchor="middle" class="svg-ink" font-size="12">-p err</text><text x="400" y="94" text-anchor="middle" class="svg-ink" font-size="11">kitna serious</text>
<rect x="490" y="50" width="140" height="60" rx="8" fill="#fed7aa"/><text x="560" y="76" text-anchor="middle" class="svg-ink" font-size="12">--since today</text><text x="560" y="94" text-anchor="middle" class="svg-ink" font-size="11">kaunsa samay</text>
</svg><p class="cap">Shor kam karne ke liye filters jodo.</p></div>

<h3>Sirf problems: -p err</h3>
<p>Priority <code>err</code> errors aur usse bure dikhata hai. Ticket lab (toota SSH server) mein kaaran tak pahunchne ka sabse tez tareeka yehi hai:</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">journalctl -p err -n 5</span>
Sep 29 09:00:00 nms02 sshd[700]: /etc/ssh/sshd_config line 5: <span class="hl">Bad configuration option: PasswordAuthentcation</span>
Sep 29 09:00:00 nms02 systemd[1]: ssh.service: Failed with result 'exit-code'.
Sep 29 09:00:00 nms02 systemd[1]: Failed to start ssh.service - OpenBSD Secure Shell server.</pre>
<p>Teen error lines, aur pehli exact file, line number aur galat spelling batati hai. "PasswordAuthentcation" ko sahi spelling se compare karo: letter "i" gayab hai.</p>

<h3>Sirf time range: --since</h3>
<pre class="out">netadmin@nms02:~$ <span class="hl">journalctl --since today -n 3</span>
Sep 29 09:01:04 nms02 sudo:    netadmin : TTY=pts/0 ; PWD=/home/netadmin ; USER=root ; COMMAND=systemctl enable --now cron
Sep 29 09:01:04 nms02 systemd[1]: Starting cron.service - Regular background program processing daemon...
Sep 29 09:01:04 nms02 systemd[1]: Started cron.service - Regular background program processing daemon.</pre>
<p>Dilchasp: journal har <code>sudo</code> command bhi record karta hai, kisne chalaya aur kaunse folder mein. Isliye journal audit trail hai: aap dekh sakte ho cron kisne aur kab enable kiya.</p>

<h3>Live follow: -f</h3>
<p><code>journalctl -f</code> naye messages aate hi follow karta hai, <code>tail -f</code> ki tarah (rokne ke liye Ctrl+C). Simulator mein yeh latest entries print karke wapas aa jaata hai; asli server par chalta rehta hai.</p>

<h3>Reference (simulator mein nahi chalte)</h3>
<pre class="code">journalctl -u nginx --since "1 hour ago"   <span class="c"># relative time window</span>
journalctl -b                               <span class="c"># is boot ke baad sab kuch</span>
journalctl -xeu ssh.service                 <span class="c"># newest first, explanations ke saath</span></pre>

<div class="eg"><p><b>Worked example.</b> Colleague kehta hai "kal raat ke change ke baad ssh band ho gaya". Aap <code>journalctl -p err -n 5</code> chalate ho aur pehli line padhte ho: sshd_config ki line 5 par bad option. Aapne fault dhundhne ke liye config file kholi hi nahi, kyunki log seedha ishara kar raha tha.</p></div>
<div class="warn"><p><b>Common beginner mistake.</b> <code>-u</code>, <code>-n</code> aur <code>-p</code> ki jagah bade log ko upar se padhna. Pehle filter karo; phir padho.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>journalctl</code> systemd journal dikhata hai; <code>/var/log/auth.log</code> plain text file hai. Ubuntu par dono hain, aur sawaal pooch sakta hai kaunsa command kya padhta hai.</p></div>

<div class="scn"><h4>Service kisne restart ki?</h4><p>nginx raat 3 baje restart hui aur customers ne poocha kyun. Journal mein ek colleague ke account ki <code>sudo</code> line thi, bilkul pehle. Woh planned certificate renewal tha jo announce nahi hua tha. Log ne ek minute mein sawaal tay kar diya.</p><p><b>Lesson:</b> journal errors ke saath actions bhi record karta hai.</p></div>

<div class="iv"><p class="q">"systemd service fail kyun hui yeh kaise pata karte ho?"</p><p>Main summary ke liye <code>systemctl status</code> chalata hoon, phir detail ke liye <code>journalctl -u name</code> ya <code>journalctl -p err</code>. Pehli error line aam taur par us file aur line number ka naam leti hai jo kaaran hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>journalctl -u name</code> ek service ka log dikhata hai.</li>
<li><code>-n</code> lines seemit karta hai, <code>-p err</code> errors rakhta hai, <code>--since</code> samay seemit karta hai.</li>
<li>Journal sudo commands bhi record karta hai.</li>
<li>Padhne se pehle filter karo.</li>
</ul></div>
`}};export{e as default};