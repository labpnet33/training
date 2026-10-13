var e={id:`status`,h:{en:`Reading systemctl status: active, enabled, loaded`,hi:`systemctl status padhna: active, enabled, loaded`},body:{en:`
<p>The most used service command is <code>systemctl status</code>. It answers in one screen whether a service is running, whether it will start at boot, and what it last said. Learning to read it quickly is the core skill of this module.</p>

<h3>The full status screen</h3>
<pre class="out">netadmin@nms02:~$ <span class="hl">systemctl status nginx</span>
● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/usr/lib/systemd/system/nginx.service; <span class="hl">enabled</span>; preset: enabled)
     Active: <span class="hl">active (running)</span> since Tue 2026-09-29 09:00:46 IST; 2s ago
   Main PID: 700 (nginx)
      Tasks: 1 (limit: 2275)
     Memory: 2.1M (peak: 2.9M)
        CPU: 38ms
     CGroup: /system.slice/nginx.service
             └─700 nginx: master process /usr/sbin/nginx -g daemon on; master_process on;

Sep 29 09:00:46 nms02 systemd[1]: Starting nginx.service - A high performance web server and a reverse proxy server...
Sep 29 09:00:46 nms02 systemd[1]: Started nginx.service - A high performance web server and a reverse proxy server.</pre>
<p>Take it top to bottom.</p>
<dl class="terms">
<dt>The dot at the start</dt><dd>A green dot means running. A cross or a hollow circle means failed or stopped.</dd>
<dt>Loaded</dt><dd>Where the service definition file is, and whether it is <b>enabled</b> (starts at boot) or disabled.</dd>
<dt>Active</dt><dd>The state right now, with the time since it began.</dd>
<dt>Main PID</dt><dd>The process number of the main program; useful when you need to find it in other tools.</dd>
<dt>Last log lines</dt><dd>The newest messages from this service, shown for free.</dd>
</dl>

<h3>Two one-word questions</h3>
<p>In scripts and quick checks you want one word, not a screen.</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">systemctl is-active nginx</span>
active
netadmin@nms02:~$ <span class="hl">systemctl is-enabled nginx</span>
enabled</pre>
<p><b>is-active</b> asks "running right now?". <b>is-enabled</b> asks "will it start at the next boot?". They are independent, which gives four combinations:</p>
<table class="cmp"><thead><tr><th>active</th><th>enabled</th><th>Meaning</th></tr></thead><tbody>
<tr><td>yes</td><td>yes</td><td>Healthy: running now and after reboot</td></tr>
<tr><td>yes</td><td>no</td><td>Works now, will disappear after reboot</td></tr>
<tr><td>no</td><td>yes</td><td>Stopped now, will come back at reboot</td></tr>
<tr><td>no</td><td>no</td><td>Fully off</td></tr>
</tbody></table>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Two switches: active means running now, enabled means starts at boot">
<rect x="20" y="30" width="270" height="90" rx="10" fill="#bbf7d0"/><text x="155" y="62" text-anchor="middle" class="svg-ink" font-size="14">is-active</text><text x="155" y="88" text-anchor="middle" class="svg-ink" font-size="12">running right now?</text>
<rect x="350" y="30" width="270" height="90" rx="10" fill="#bae6fd"/><text x="485" y="62" text-anchor="middle" class="svg-ink" font-size="14">is-enabled</text><text x="485" y="88" text-anchor="middle" class="svg-ink" font-size="12">starts at next boot?</text>
</svg><p class="cap">Two separate switches. Check both.</p></div>

<h3>What a failed service looks like</h3>
<p>In the ticket lab the SSH service is broken. Its status starts differently:</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">systemctl status ssh</span>
× ssh.service - OpenBSD Secure Shell server
     Loaded: loaded (/usr/lib/systemd/system/ssh.service; enabled; preset: enabled)
     Active: <span class="hl">failed (Result: exit-code)</span> since Tue 2026-09-29 09:00:00 IST; 32s ago

Sep 29 09:00:00 nms02 systemd[1]: Starting ssh.service - OpenBSD Secure Shell server...
Sep 29 09:00:00 nms02 sshd[700]: /etc/ssh/sshd_config line 5: Bad configuration option: PasswordAuthentcation
Sep 29 09:00:00 nms02 systemd[1]: ssh.service: Main process exited, code=exited, status=255/EXCEPTION
Sep 29 09:00:00 nms02 systemd[1]: ssh.service: Failed with result 'exit-code'.
Sep 29 09:00:00 nms02 systemd[1]: Failed to start ssh.service - OpenBSD Secure Shell server.</pre>
<p>The cross, <code>failed</code>, and the log line naming a bad option in the config file together tell the full story without any other tool. Chapter 8 repairs it.</p>

<h3>Finding failures quickly</h3>
<pre class="out">netadmin@nms02:~$ <span class="hl">systemctl --failed</span>
  UNIT                         LOAD   ACTIVE   SUB     DESCRIPTION
● ssh.service                  loaded failed   failed  OpenBSD Secure Shell server

1 loaded units listed.</pre>
<p><code>systemctl --failed</code> lists only services in a failed state: the first command on a server that "feels wrong".</p>

<h3>Names that do not exist</h3>
<pre class="out">netadmin@nms02:~$ <span class="hl">systemctl status nonesuch</span>
Unit nonesuch.service could not be found.</pre>
<p>A typo or a package that is not installed gives this message, which is different from a service that exists but failed.</p>

<div class="eg"><p><b>Worked example.</b> Monday morning check on NMS02: <code>systemctl --failed</code> shows nothing, <code>systemctl is-active nginx</code> says active, and <code>systemctl is-enabled nginx</code> says enabled. Three short commands, and you can report "web service healthy".</p></div>
<div class="warn"><p><b>Common beginner mistake.</b> Seeing "active" and stopping there. A service can be active but not enabled; it will vanish at the next reboot.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>systemctl status</code> output shows "Loaded ... enabled" and "Active ... running". The first is the boot setting; the second is the current state.</p></div>

<div class="scn"><h4>Green now, red tomorrow</h4><p>An engineer verified a service as "active" before a maintenance window and went home. After the reboot it did not return. Nobody had run <code>is-enabled</code>. Checking both words takes five seconds.</p><p><b>Lesson:</b> always check active and enabled together.</p></div>

<div class="iv"><p class="q">"How do you quickly see what is wrong on a server where something has stopped working?"</p><p>I run <code>systemctl --failed</code> to list failed services, then <code>systemctl status</code> on each to read the state and the last log lines. If more history is needed I use <code>journalctl -u</code> for that service.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>systemctl status</code> shows state, boot setting and recent log lines.</li>
<li><code>is-active</code> and <code>is-enabled</code> give one-word answers.</li>
<li>Active and enabled are independent.</li>
<li><code>systemctl --failed</code> finds broken services fast.</li>
</ul></div>
`,hi:`
<p>Sabse zyada use hone wala service command <code>systemctl status</code> hai. Woh ek screen mein batata hai ki service chal rahi hai ya nahi, boot par shuru hogi ya nahi, aur usne aakhri baar kya kaha. Ise jaldi padhna seekhna is module ka core skill hai.</p>

<h3>Poori status screen</h3>
<pre class="out">netadmin@nms02:~$ <span class="hl">systemctl status nginx</span>
● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/usr/lib/systemd/system/nginx.service; <span class="hl">enabled</span>; preset: enabled)
     Active: <span class="hl">active (running)</span> since Tue 2026-09-29 09:00:46 IST; 2s ago
   Main PID: 700 (nginx)
      Tasks: 1 (limit: 2275)
     Memory: 2.1M (peak: 2.9M)
        CPU: 38ms
     CGroup: /system.slice/nginx.service
             └─700 nginx: master process /usr/sbin/nginx -g daemon on; master_process on;

Sep 29 09:00:46 nms02 systemd[1]: Starting nginx.service - A high performance web server and a reverse proxy server...
Sep 29 09:00:46 nms02 systemd[1]: Started nginx.service - A high performance web server and a reverse proxy server.</pre>
<p>Upar se neeche padho.</p>
<dl class="terms">
<dt>Shuru ka dot</dt><dd>Hara dot matlab chal rahi hai. Cross ya khaali gola matlab failed ya stopped.</dd>
<dt>Loaded</dt><dd>Service definition file kahan hai, aur woh <b>enabled</b> (boot par start) hai ya disabled.</dd>
<dt>Active</dt><dd>Abhi ki state, aur kab se.</dd>
<dt>Main PID</dt><dd>Main program ka process number; doosre tools mein dhundhne ke kaam aata hai.</dd>
<dt>Last log lines</dt><dd>Is service ke sabse naye messages, free mein dikhte hain.</dd>
</dl>

<h3>Do ek-shabd wale sawaal</h3>
<p>Scripts aur quick checks mein ek shabd chahiye, poori screen nahi.</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">systemctl is-active nginx</span>
active
netadmin@nms02:~$ <span class="hl">systemctl is-enabled nginx</span>
enabled</pre>
<p><b>is-active</b> poochta hai "abhi chal rahi hai?". <b>is-enabled</b> poochta hai "agle boot par shuru hogi?". Dono alag hain, isliye chaar combinations hote hain:</p>
<table class="cmp"><thead><tr><th>active</th><th>enabled</th><th>Matlab</th></tr></thead><tbody>
<tr><td>haan</td><td>haan</td><td>Healthy: abhi bhi aur reboot ke baad bhi</td></tr>
<tr><td>haan</td><td>nahi</td><td>Abhi chalti hai, reboot ke baad gayab</td></tr>
<tr><td>nahi</td><td>haan</td><td>Abhi band, reboot par wapas aayegi</td></tr>
<tr><td>nahi</td><td>nahi</td><td>Poori tarah off</td></tr>
</tbody></table>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Do switches: active matlab abhi chal rahi, enabled matlab boot par start">
<rect x="20" y="30" width="270" height="90" rx="10" fill="#bbf7d0"/><text x="155" y="62" text-anchor="middle" class="svg-ink" font-size="14">is-active</text><text x="155" y="88" text-anchor="middle" class="svg-ink" font-size="12">abhi chal rahi?</text>
<rect x="350" y="30" width="270" height="90" rx="10" fill="#bae6fd"/><text x="485" y="62" text-anchor="middle" class="svg-ink" font-size="14">is-enabled</text><text x="485" y="88" text-anchor="middle" class="svg-ink" font-size="12">agle boot par start?</text>
</svg><p class="cap">Do alag switches. Dono check karo.</p></div>

<h3>Failed service kaisi dikhti hai</h3>
<p>Ticket lab mein SSH service toot gayi hai. Uska status alag tarah se shuru hota hai:</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">systemctl status ssh</span>
× ssh.service - OpenBSD Secure Shell server
     Loaded: loaded (/usr/lib/systemd/system/ssh.service; enabled; preset: enabled)
     Active: <span class="hl">failed (Result: exit-code)</span> since Tue 2026-09-29 09:00:00 IST; 32s ago

Sep 29 09:00:00 nms02 systemd[1]: Starting ssh.service - OpenBSD Secure Shell server...
Sep 29 09:00:00 nms02 sshd[700]: /etc/ssh/sshd_config line 5: Bad configuration option: PasswordAuthentcation
Sep 29 09:00:00 nms02 systemd[1]: ssh.service: Main process exited, code=exited, status=255/EXCEPTION
Sep 29 09:00:00 nms02 systemd[1]: ssh.service: Failed with result 'exit-code'.
Sep 29 09:00:00 nms02 systemd[1]: Failed to start ssh.service - OpenBSD Secure Shell server.</pre>
<p>Cross, <code>failed</code>, aur config file ka bad option batane wali log line milkar bina kisi aur tool ke poori kahani bata deti hain. Chapter 8 ise theek karta hai.</p>

<h3>Failures jaldi dhundhna</h3>
<pre class="out">netadmin@nms02:~$ <span class="hl">systemctl --failed</span>
  UNIT                         LOAD   ACTIVE   SUB     DESCRIPTION
● ssh.service                  loaded failed   failed  OpenBSD Secure Shell server

1 loaded units listed.</pre>
<p><code>systemctl --failed</code> sirf failed state wali services list karta hai: jis server par "kuch galat lag raha" ho wahan pehla command.</p>

<h3>Jo naam exist nahi karte</h3>
<pre class="out">netadmin@nms02:~$ <span class="hl">systemctl status nonesuch</span>
Unit nonesuch.service could not be found.</pre>
<p>Typo ya na-installed package yeh message deta hai, jo us service se alag hai jo exist karti hai par failed hai.</p>

<div class="eg"><p><b>Worked example.</b> NMS02 par Monday subah check: <code>systemctl --failed</code> kuch nahi dikhata, <code>systemctl is-active nginx</code> active kehta hai, aur <code>systemctl is-enabled nginx</code> enabled kehta hai. Teen chhote commands, aur aap report kar sakte ho "web service healthy".</p></div>
<div class="warn"><p><b>Common beginner mistake.</b> "active" dekhkar ruk jaana. Service active ho sakti hai par enabled nahi; agle reboot par gayab ho jayegi.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>systemctl status</code> output "Loaded ... enabled" aur "Active ... running" dikhata hai. Pehla boot setting hai; doosra maujooda state.</p></div>

<div class="scn"><h4>Abhi hara, kal laal</h4><p>Ek engineer ne maintenance window se pehle service "active" verify ki aur ghar chala gaya. Reboot ke baad woh wapas nahi aayi. Kisi ne <code>is-enabled</code> nahi chalaya tha. Dono shabd check karne mein paanch second lagte hain.</p><p><b>Lesson:</b> active aur enabled hamesha saath check karo.</p></div>

<div class="iv"><p class="q">"Jis server par kuch kaam karna band kar de, wahan jaldi kaise dekhoge kya galat hai?"</p><p>Main <code>systemctl --failed</code> se failed services list karta hoon, phir har ek par <code>systemctl status</code> chalakar state aur last log lines padhta hoon. Zyada history chahiye to us service ke liye <code>journalctl -u</code> use karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>systemctl status</code> state, boot setting aur recent log lines dikhata hai.</li>
<li><code>is-active</code> aur <code>is-enabled</code> ek shabd ka jawab dete hain.</li>
<li>Active aur enabled alag-alag hain.</li>
<li><code>systemctl --failed</code> toote services jaldi dhundhta hai.</li>
</ul></div>
`}};export{e as default};