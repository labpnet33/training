var e=e=>`<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Rotation">
<rect x="10" y="40" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="70" text-anchor="middle" class="svg-ink" font-size="13">10.99.0.1.log</text>
<rect x="190" y="40" width="130" height="50" rx="8" fill="#fde68a"/><text x="255" y="70" text-anchor="middle" class="svg-ink" font-size="13">10.99.0.1.log.1</text>
<rect x="370" y="40" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="435" y="70" text-anchor="middle" class="svg-ink" font-size="13">.log.2.gz</text>
<rect x="545" y="40" width="85" height="50" rx="8" fill="#e2e8f0"/><text x="587" y="70" text-anchor="middle" class="svg-ink" font-size="13">deleted</text>
<line x1="140" y1="65" x2="190" y2="65" stroke="#64748b" stroke-width="2"/><line x1="320" y1="65" x2="370" y2="65" stroke="#64748b" stroke-width="2"/><line x1="500" y1="65" x2="545" y2="65" stroke="#64748b" stroke-width="2"/>
<text x="320" y="115" text-anchor="middle" class="svg-accent" font-size="12">each rotation renames the files one step to the right</text>
</svg><p class="cap">`+e+`</p></div>`,t=`<pre class="code">netadmin@syslog01:~$ sudo cp /var/log/remote/10.99.0.1.log /var/log/remote/10.99.0.1.log.1
netadmin@syslog01:~$ ls -l /var/log/remote</pre>
<pre class="out">total 16
-rw-r-----  1 syslog   adm         112 Sep 29 09:00 10.255.9.1.log
-rw-r-----  1 syslog   adm         227 Sep 29 09:00 10.99.0.1.log
-rw-r-----  1 root     root        227 Sep 29 09:00 <span class="hl">10.99.0.1.log.1</span>
-rw-r-----  1 syslog   adm        1607 Sep 29 09:00 10.99.0.2.log</pre>`,n=`<pre class="code">PUN-CORE-R1# show clock
netadmin@syslog01:~$ date
netadmin@syslog01:~$ timedatectl</pre>
<pre class="out">*02:19:49.781 UTC Fri Oct 2 2026
Tue Sep 29 09:00:30 IST 2026
               Local time: Tue Sep 29 09:00:30 IST
                Time zone: Asia/Kolkata (IST, +0530)
<span class="hl">System clock synchronized: yes</span>
              NTP service: active</pre>`,r=`<pre class="code"><span class="c"># Reference commands (not run in the simulator): /etc/logrotate.d/remote</span>
/var/log/remote/*.log {
    weekly
    rotate 8
    compress
    delaycompress
    missingok
    notifempty
    create 0640 syslog adm
    sharedscripts
    postrotate
        /usr/lib/rsyslog/rsyslog-rotate
    endscript
}
<span class="c"># dry run: show what would happen, change nothing</span>
sudo logrotate -d /etc/logrotate.d/remote</pre>`,i={id:`rotation-time-security`,h:{en:`Rotation, time and security: keeping the logs trustworthy`,hi:`Rotation, time aur security: logs ko bharosemand rakhna`},body:{en:`
<p>A working syslog server is not finished. Three quiet problems turn a good log system into a bad one: files that grow until the disk is full, time stamps that disagree, and logs that anybody can read, forge or erase. This chapter closes all three.</p>

<h3>1. Rotation: do not let the disk fill</h3>
<p>Remote log files only grow. A chatty router can write 100 MB a week. <b>Log rotation</b> is the housekeeping routine: at a fixed interval the current file is renamed to <code>.1</code>, the old <code>.1</code> becomes <code>.2</code>, older ones are compressed to <code>.gz</code>, and the oldest is deleted. Rotation gives you two things: a bounded disk and small files that are quick to search.</p>
`+e(`Rotation renames files step by step; the oldest one is removed after N rotations.`)+`
<p>You can see the idea with two ordinary commands. <code>cp</code> copies a file. After the copy, the <code>.1</code> file is the "yesterday" copy:</p>
`+t+`
<p>This is only a demonstration (the extra <code>10.255.9.1.log</code> is left over from the source-interface test in chapter 6). Notice that the copy is owned by <code>root</code>, while rsyslog writes as <code>syslog</code>. A real rotation tool must recreate the new file with the right owner and tell rsyslog to reopen it. On Ubuntu that tool is <b>logrotate</b>, started once a day by the system timer. It reads small policy files in <code>/etc/logrotate.d/</code>:</p>
`+r+`
<ul>
<li><code>weekly</code> and <code>rotate 8</code>: rotate every week, keep eight old files, which is about two months.</li>
<li><code>compress</code> and <code>delaycompress</code>: gzip old files, but keep the newest old file uncompressed for one cycle.</li>
<li><code>missingok</code> and <code>notifempty</code>: do not complain when a file is absent; skip empty files.</li>
<li><code>create 0640 syslog adm</code>: make the new file with the same private owner and mode as before.</li>
<li><code>postrotate</code> script: ask rsyslog to reopen its files. Without it rsyslog keeps writing into the renamed file.</li>
</ul>
<p>Always test with <code>logrotate -d</code> (debug, dry run) before trusting a new policy.</p>

<h3>2. Time: a log without a trusted clock is a story without dates</h3>
<p>When R1 and R2 both complain at "02:10", you must be sure both clocks agree. Compare the router and the server:</p>
`+n+`
<p>The server reports its time and says the clock is synchronized with NTP (the Network Time Protocol). The router's clock is days away from the server and begins with an asterisk, which means it is not synchronised. In the file you saw two timestamps per line: the server's receive time at the left, and the router's own time inside. Investigators trust the receive time, which is why the server clock must be correct. The fix is to point every device to the same NTP source and, ideally, use the same time zone (many teams log in UTC). NTP itself has a module of its own in the network track.</p>

<h3>3. Security: protect the logs and the path</h3>
<ul>
<li><b>Syslog over UDP has no authentication.</b> Anyone who can reach UDP 514 can send fake lines or flood the server. Allow only the management network in the firewall, and keep the server on that network.</li>
<li><b>Logs are evidence.</b> Keep the files mode 640, readable only by the <code>syslog</code> user and the <code>adm</code> group. Do not give everyone sudo on the log server.</li>
<li><b>Logs may hold secrets.</b> Usernames, IP addresses and sometimes commands. Treat them like configuration backups.</li>
<li><b>Do not rely on the sender's buffer.</b> An attacker who gains access to a device may clear its local log. The central copy survives, which is a strong reason to have it.</li>
<li><b>Encryption.</b> Plain UDP syslog is readable on the wire. Where policy needs confidentiality, use TLS-based syslog; the details belong to a security module.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Disk planning. Ten routers produce about 20 MB each per week, which is 200 MB a week. With <code>rotate 8</code> and compression (text compresses roughly ten to one), the archive costs about 200 MB plus 16 MB per week of compressed files, well under 1 GB for two months. Without rotation, the same server would fill a 25 GB disk in about two years and then stop logging silently.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Rotating without the postrotate step, so new lines vanish into a renamed file; keeping logs for "ever" without a disk plan; comparing logs from devices with different clocks and blaming the wrong event.</p></div>
<div class="exam"><p><b>Exam trap.</b> The asterisk before a Cisco time stamp means the time is <b>not</b> authoritative (not synchronised). A syslog message without it was stamped with a trusted clock.</p></div>

<div class="scn"><h4>The disk that filled at 03:00</h4><p>A server stopped receiving logs on a Sunday. The root disk was 100 percent full because a debug setting on a test router produced a 14 GB file in four days. rsyslog could not write, and UDP gave the routers no error. After cleaning the file, the team lowered the trap level, added rotation, and added a disk-usage alert at 80 percent.</p><p><b>Lesson:</b> a full disk fails silently. Rotate, limit levels, and monitor free space.</p></div>

<div class="iv"><p class="q">"How do you keep a syslog server from running out of disk and keep its logs trustworthy?"</p><p>Rotate with logrotate (weekly, keep N, compress, create with the right owner, reopen files in postrotate) and test with <code>logrotate -d</code>. Use NTP everywhere so timestamps line up. Restrict UDP 514 to the management network, keep files 640, and consider TLS where confidentiality is required.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rotation renames, compresses and deletes old logs to bound disk use; logrotate does it daily.</li>
<li>A postrotate step must make rsyslog reopen its files.</li>
<li>Time must be synchronised (NTP); an asterisk on a Cisco time stamp means it is not.</li>
<li>UDP syslog has no authentication: filter by source and keep files private.</li>
<li>The central copy survives when a device log is wiped.</li>
</ul></div>
`,hi:`
<p>Chalta hua syslog server poora nahi hota. Teen chupchaap problems ek achhe log system ko kharab bana deti hain: files jo disk bharne tak badhti hain, time stamps jo aapas mein match nahi karte, aur logs jinhe koi bhi padh, forge ya mita sakta hai. Yeh chapter teeno band karta hai.</p>

<h3>1. Rotation: disk ko bharne mat do</h3>
<p>Remote log files sirf badhti hain. Ek chatty router hafte mein 100 MB likh sakta hai. <b>Log rotation</b> housekeeping routine hai: tay interval par current file ka naam <code>.1</code> ho jaata hai, purani <code>.1</code> <code>.2</code> ban jaati hai, aur purani files <code>.gz</code> mein compress hoti hain, aur sabse purani delete ho jaati hai. Rotation do cheezein deti hai: bounded disk aur chhoti files jo search mein tez hain.</p>
`+e(`Rotation files ke naam step by step badalta hai; N rotations ke baad sabse purani hat jaati hai.`)+`
<p>Aap idea ko do aam commands se dekh sakte ho. <code>cp</code> file copy karta hai. Copy ke baad <code>.1</code> file "kal wali" copy hai:</p>
`+t+`
<p>Yeh sirf demonstration hai (extra <code>10.255.9.1.log</code> chapter 6 ke source-interface test ka bacha hua hai). Dhyan do ki copy <code>root</code> ki hai, jabki rsyslog <code>syslog</code> ki tarah likhta hai. Asli rotation tool ko nayi file sahi owner ke saath banani hoti hai aur rsyslog ko use dobara kholne ko kehna hota hai. Ubuntu par woh tool <b>logrotate</b> hai, jo system timer se din mein ek baar chalta hai. Woh <code>/etc/logrotate.d/</code> mein chhoti policy files padhta hai:</p>
`+r+`
<ul>
<li><code>weekly</code> aur <code>rotate 8</code>: har hafte rotate karo, aath purani files rakho, jo lagbhag do mahine hai.</li>
<li><code>compress</code> aur <code>delaycompress</code>: purani files gzip karo, par sabse nayi purani file ko ek cycle ke liye uncompressed rakho.</li>
<li><code>missingok</code> aur <code>notifempty</code>: file na ho to shikayat mat karo; khali files skip karo.</li>
<li><code>create 0640 syslog adm</code>: nayi file pehle jaise hi private owner aur mode ke saath banao.</li>
<li><code>postrotate</code> script: rsyslog ko apni files dobara kholne ko kaho. Iske bina rsyslog renamed file mein likhta rehta hai.</li>
</ul>
<p>Nayi policy par bharosa karne se pehle hamesha <code>logrotate -d</code> (debug, dry run) se test karo.</p>

<h3>2. Time: bharosemand clock ke bina log tareekh ke bina kahani hai</h3>
<p>Jab R1 aur R2 dono "02:10" par shikayat karte hain, to aapko pakka hona chahiye ki dono clocks sahmat hain. Router aur server compare karo:</p>
`+n+`
<p>Server apna time batata hai aur kehta hai ki clock NTP (Network Time Protocol) se synchronized hai. Router ki clock server se dino door hai aur asterisk se shuru hoti hai, jiska matlab hai ki woh synchronised nahi hai. File mein aapne har line mein do timestamps dekhe: left mein server ka receive time, aur andar router ka apna time. Investigators receive time par bharosa karte hain, isliye server ki clock sahi honi chahiye. Fix hai ki har device ko ek hi NTP source par point karo aur, behtar ho, ek hi time zone use karo (bahut si teams UTC mein log karti hain). NTP ka apna alag module network track mein hai.</p>

<h3>3. Security: logs aur path ki raksha</h3>
<ul>
<li><b>UDP par syslog mein authentication nahi hota.</b> Jo bhi UDP 514 tak pahunch sake woh fake lines bhej sakta hai ya server ko flood kar sakta hai. Firewall mein sirf management network allow karo, aur server ko usi network par rakho.</li>
<li><b>Logs saboot hain.</b> Files mode 640 rakho, sirf <code>syslog</code> user aur <code>adm</code> group padh sake. Log server par sabko sudo mat do.</li>
<li><b>Logs mein secrets ho sakte hain.</b> Usernames, IP addresses aur kabhi commands. Unhe configuration backups ki tarah treat karo.</li>
<li><b>Sender ke buffer par bharosa mat karo.</b> Device tak pahunchne wala attacker uska local log saaf kar sakta hai. Central copy bach jaati hai, jo ise rakhne ki mazboot wajah hai.</li>
<li><b>Encryption.</b> Plain UDP syslog wire par padha ja sakta hai. Jahan policy ko confidentiality chahiye wahan TLS-based syslog use karo; details security module ki hain.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Disk planning. Das routers har ek hafte mein lagbhag 20 MB banate hain, yaani hafte mein 200 MB. <code>rotate 8</code> aur compression ke saath (text lagbhag das gune compress hota hai) archive ki keemat lagbhag 200 MB plus har hafte 16 MB compressed files hai, do mahine ke liye 1 GB se kaafi kam. Rotation ke bina wahi server 25 GB disk ko lagbhag do saal mein bhar deta aur phir chupchaap logging band kar deta.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> postrotate step ke bina rotate karna, jisse nayi lines renamed file mein kho jaati hain; disk plan ke bina logs ko "hamesha" rakhna; alag clocks wale devices ke logs compare karke galat event ko dosh dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Cisco time stamp se pehle ka asterisk ka matlab time <b>authoritative nahi</b> hai (synchronised nahi). Uske bina wala syslog message bharosemand clock se stamp hua tha.</p></div>

<div class="scn"><h4>Woh disk jo 03:00 par bhar gayi</h4><p>Ek server Sunday ko logs lena band kar gaya. Root disk 100 percent full thi kyunki test router ki debug setting ne chaar din mein 14 GB file banayi. rsyslog likh nahi paya, aur UDP ne routers ko koi error nahi diya. File saaf karne ke baad team ne trap level kam kiya, rotation jodi, aur 80 percent par disk-usage alert lagaya.</p><p><b>Lesson:</b> full disk chupchaap fail hoti hai. Rotate karo, levels limit karo aur free space monitor karo.</p></div>

<div class="iv"><p class="q">"Syslog server ki disk ko bharne se kaise rokte ho aur uske logs ko bharosemand kaise rakhte ho?"</p><p>logrotate se rotate karo (weekly, N rakho, compress, sahi owner ke saath create, postrotate mein files reopen) aur <code>logrotate -d</code> se test karo. Timestamps line up hon isliye har jagah NTP use karo. UDP 514 ko management network tak restrict karo, files 640 rakho, aur jahan confidentiality chahiye wahan TLS consider karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rotation purane logs ka naam badalta, compress aur delete karta hai taaki disk use bounded rahe; logrotate roz karta hai.</li>
<li>postrotate step rsyslog ko files dobara kholne par majboor kare.</li>
<li>Time synchronised hona chahiye (NTP); Cisco time stamp par asterisk ka matlab woh nahi hai.</li>
<li>UDP syslog mein authentication nahi: source se filter karo aur files private rakho.</li>
<li>Device ka log mit jaaye tab bhi central copy bachti hai.</li>
</ul></div>
`}};export{i as default};