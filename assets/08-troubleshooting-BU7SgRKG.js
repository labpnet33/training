var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: the ticket with two broken services`,hi:`Troubleshooting workflow: do toote services wala ticket`},body:{en:`
<p>Here is the ticket (Lab 2). The night shift edited the SSH config. Since then nobody can log in to NMS02, and the backup report is empty. You need a method, not luck. The method has five steps and works for any service.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Five steps: find, status, journal, fix and validate, verify from the client">
<rect x="10" y="40" width="112" height="70" rx="8" fill="#fecaca"/><text x="66" y="68" text-anchor="middle" class="svg-ink" font-size="12">1 Find</text><text x="66" y="86" text-anchor="middle" class="svg-ink" font-size="11">systemctl --failed</text>
<rect x="136" y="40" width="112" height="70" rx="8" fill="#fde68a"/><text x="192" y="68" text-anchor="middle" class="svg-ink" font-size="12">2 Status</text><text x="192" y="86" text-anchor="middle" class="svg-ink" font-size="11">state + log lines</text>
<rect x="262" y="40" width="112" height="70" rx="8" fill="#bae6fd"/><text x="318" y="68" text-anchor="middle" class="svg-ink" font-size="12">3 Journal</text><text x="318" y="86" text-anchor="middle" class="svg-ink" font-size="11">journalctl -p err</text>
<rect x="388" y="40" width="112" height="70" rx="8" fill="#ddd6fe"/><text x="444" y="68" text-anchor="middle" class="svg-ink" font-size="12">4 Fix + test</text><text x="444" y="86" text-anchor="middle" class="svg-ink" font-size="11">sshd -t, restart</text>
<rect x="514" y="40" width="116" height="70" rx="8" fill="#bbf7d0"/><text x="572" y="68" text-anchor="middle" class="svg-ink" font-size="12">5 Verify</text><text x="572" y="86" text-anchor="middle" class="svg-ink" font-size="11">from the client</text>
</svg><p class="cap">Find, read, understand, fix, prove.</p></div>

<h3>Step 1: what is broken?</h3>
<pre class="out">netadmin@nms02:~$ <span class="hl">systemctl --failed</span>
  UNIT                         LOAD   ACTIVE   SUB     DESCRIPTION
● ssh.service                  loaded failed   failed  OpenBSD Secure Shell server

1 loaded units listed.</pre>
<p>One failed unit: ssh. (Chapter 3 showed the full <code>systemctl status ssh</code>, with the cross and the error lines.)</p>

<h3>Step 2 and 3: why?</h3>
<pre class="out">netadmin@nms02:~$ <span class="hl">sudo sshd -t</span>
/etc/ssh/sshd_config line 5: Bad configuration option: PasswordAuthentcation</pre>
<p>The syntax check you met in the SSH module names the file, the line and the word. Look at that line:</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">grep -n Authent /etc/ssh/sshd_config</span>
5:PasswordAuthentcation yes
7:KbdInteractiveAuthentication no</pre>
<p>Line 5 has a typo: <code>PasswordAuthentcation</code> (missing the letter "i"). Line 7 shows the correct style for comparison. Because the file is invalid, sshd refuses to start. And while it is down, other machines get this:</p>
<pre class="out">priya@ws01:~$ <span class="hl">nc -vz 10.99.0.20 22</span>
nc: connect to 10.99.0.20 port 22 (tcp) failed: Connection refused</pre>
<p>"Refused" (not "timed out") confirms the server is alive and the network is fine; only the service is down. That tells you the right place to work.</p>

<h3>Step 4: fix, validate, restart</h3>
<p><code>sed -i 's/old/new/' file</code> replaces text inside a file (<code>-i</code> means in place). Always validate before restarting:</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">sudo sed -i 's/PasswordAuthentcation/PasswordAuthentication/' /etc/ssh/sshd_config</span>
netadmin@nms02:~$ <span class="hl">sudo sshd -t</span>
netadmin@nms02:~$ <span class="hl">sudo systemctl restart ssh</span>
netadmin@nms02:~$ <span class="hl">systemctl is-active ssh</span>
active</pre>
<p>Silence from <code>sshd -t</code> is the green light. Restarting before the fix would just fail again with "Job for ssh.service failed because the control process exited with error code. See systemctl status ssh.service and journalctl -xeu ssh.service for details", the exact message you get when the cause is not fixed.</p>

<h3>Step 5: prove it from the client</h3>
<pre class="out">priya@ws01:~$ <span class="hl">nc -vz 10.99.0.20 22</span>
Connection to 10.99.0.20 22 port [tcp/ssh] succeeded!</pre>
<p>The same check that was "refused" now succeeds. That is proof; "it says active" is only a hint.</p>

<h3>The second fault: the backup</h3>
<p>Chapter 7 diagnosed it: <code>/etc/cron.d/nk-backup</code> is fine, but <code>systemctl is-enabled cron</code> says disabled. One command:</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">sudo systemctl enable --now cron</span>
Created symlink /etc/systemd/system/multi-user.target.wants/cron.service → /usr/lib/systemd/system/cron.service.
netadmin@nms02:~$ <span class="hl">systemctl --failed</span>
  UNIT LOAD ACTIVE SUB DESCRIPTION

0 loaded units listed.</pre>
<p>"0 loaded units listed" is the end state you want: nothing failed. (The Synchronizing and Executing lines that normally appear above the symlink line are shortened here.)</p>

<h3>Close the ticket properly</h3>
<ul>
<li>Say what the cause was: typo on line 5 of sshd_config, and cron disabled.</li>
<li>Say what you changed: one sed correction, one enable --now.</li>
<li>Say how you proved it: nc from WS01 succeeded; <code>--failed</code> empty.</li>
<li>Recommend prevention: run <code>sshd -t</code> before every restart, and change files with a second session open.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A copy of this ticket arrives on a different host with a service named <code>telegraf</code> failing. You do not need to know telegraf. Find with <code>--failed</code>, read with <code>status</code> and <code>journalctl -p err</code>, fix what the log names, restart, verify from a client. The method transfers.</p></div>
<div class="warn"><p><b>Common beginner mistake.</b> Restarting a failed service again and again hoping it will work. If the cause is in the log, a restart changes nothing. Read first.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Connection refused" points to the service or port; "timed out" points to the network or a firewall. Choose the right layer before you touch anything.</p></div>

<div class="scn"><h4>Two faults, one night</h4><p>After a change window the monitoring server was down and reports were empty. The team fixed the web service first and declared victory. Only a morning check of <code>systemctl --failed</code> found the second problem. A fixed list of five steps, ending with an empty failed list, would have caught both at once.</p><p><b>Lesson:</b> finish by confirming that nothing is left failed.</p></div>

<div class="iv"><p class="q">"Walk me through how you would troubleshoot a Linux service that will not start."</p><p>I list failed units with <code>systemctl --failed</code>, read <code>systemctl status</code> and the journal for the first error line, fix the named cause, validate the configuration if the service has a test mode such as <code>sshd -t</code>, restart, and verify from a client. I also confirm that nothing else is failed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Five steps: find, status, journal, fix and test, verify from a client.</li>
<li><code>sshd -t</code> names the file, line and bad word.</li>
<li>Refused means the service is down, not the network.</li>
<li>Finish with an empty <code>systemctl --failed</code>.</li>
</ul></div>
`,hi:`
<p>Yeh ticket hai (Lab 2). Night shift ne SSH config edit ki. Tab se NMS02 mein koi login nahi kar pa raha, aur backup report khaali hai. Aapko tarika chahiye, kismat nahi. Tarike ke paanch steps hain aur har service par kaam karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Paanch steps: find, status, journal, fix aur validate, client se verify">
<rect x="10" y="40" width="112" height="70" rx="8" fill="#fecaca"/><text x="66" y="68" text-anchor="middle" class="svg-ink" font-size="12">1 Find</text><text x="66" y="86" text-anchor="middle" class="svg-ink" font-size="11">systemctl --failed</text>
<rect x="136" y="40" width="112" height="70" rx="8" fill="#fde68a"/><text x="192" y="68" text-anchor="middle" class="svg-ink" font-size="12">2 Status</text><text x="192" y="86" text-anchor="middle" class="svg-ink" font-size="11">state + log lines</text>
<rect x="262" y="40" width="112" height="70" rx="8" fill="#bae6fd"/><text x="318" y="68" text-anchor="middle" class="svg-ink" font-size="12">3 Journal</text><text x="318" y="86" text-anchor="middle" class="svg-ink" font-size="11">journalctl -p err</text>
<rect x="388" y="40" width="112" height="70" rx="8" fill="#ddd6fe"/><text x="444" y="68" text-anchor="middle" class="svg-ink" font-size="12">4 Fix + test</text><text x="444" y="86" text-anchor="middle" class="svg-ink" font-size="11">sshd -t, restart</text>
<rect x="514" y="40" width="116" height="70" rx="8" fill="#bbf7d0"/><text x="572" y="68" text-anchor="middle" class="svg-ink" font-size="12">5 Verify</text><text x="572" y="86" text-anchor="middle" class="svg-ink" font-size="11">client se</text>
</svg><p class="cap">Dhundho, padho, samjho, theek karo, saabit karo.</p></div>

<h3>Step 1: kya toota hai?</h3>
<pre class="out">netadmin@nms02:~$ <span class="hl">systemctl --failed</span>
  UNIT                         LOAD   ACTIVE   SUB     DESCRIPTION
● ssh.service                  loaded failed   failed  OpenBSD Secure Shell server

1 loaded units listed.</pre>
<p>Ek failed unit: ssh. (Chapter 3 ne cross aur error lines ke saath poora <code>systemctl status ssh</code> dikhaya tha.)</p>

<h3>Step 2 aur 3: kyun?</h3>
<pre class="out">netadmin@nms02:~$ <span class="hl">sudo sshd -t</span>
/etc/ssh/sshd_config line 5: Bad configuration option: PasswordAuthentcation</pre>
<p>SSH module ka syntax check file, line aur shabd ka naam leta hai. Woh line dekho:</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">grep -n Authent /etc/ssh/sshd_config</span>
5:PasswordAuthentcation yes
7:KbdInteractiveAuthentication no</pre>
<p>Line 5 mein typo hai: <code>PasswordAuthentcation</code> (letter "i" gayab). Line 7 compare ke liye sahi style dikhati hai. File invalid hone se sshd start hone se mana karta hai. Aur jab tak woh down hai, doosri machines ko yeh milta hai:</p>
<pre class="out">priya@ws01:~$ <span class="hl">nc -vz 10.99.0.20 22</span>
nc: connect to 10.99.0.20 port 22 (tcp) failed: Connection refused</pre>
<p>"Refused" (timed out nahi) confirm karta hai ki server zinda hai aur network theek hai; sirf service down hai. Isse pata chalta hai kaam kahan karna hai.</p>

<h3>Step 4: fix, validate, restart</h3>
<p><code>sed -i 's/old/new/' file</code> file ke andar text badalta hai (<code>-i</code> matlab wahin par). Restart se pehle hamesha validate karo:</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">sudo sed -i 's/PasswordAuthentcation/PasswordAuthentication/' /etc/ssh/sshd_config</span>
netadmin@nms02:~$ <span class="hl">sudo sshd -t</span>
netadmin@nms02:~$ <span class="hl">sudo systemctl restart ssh</span>
netadmin@nms02:~$ <span class="hl">systemctl is-active ssh</span>
active</pre>
<p><code>sshd -t</code> ki khamoshi green light hai. Fix se pehle restart phir fail hota "Job for ssh.service failed because the control process exited with error code. See systemctl status ssh.service and journalctl -xeu ssh.service for details", jo kaaran fix na hone par milne wala exact message hai.</p>

<h3>Step 5: client se saabit karo</h3>
<pre class="out">priya@ws01:~$ <span class="hl">nc -vz 10.99.0.20 22</span>
Connection to 10.99.0.20 22 port [tcp/ssh] succeeded!</pre>
<p>Wahi check jo "refused" tha ab succeed hota hai. Yeh saboot hai; "active likha hai" sirf hint hai.</p>

<h3>Doosra fault: backup</h3>
<p>Chapter 7 ne diagnose kiya: <code>/etc/cron.d/nk-backup</code> theek hai, par <code>systemctl is-enabled cron</code> disabled kehta hai. Ek command:</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">sudo systemctl enable --now cron</span>
Created symlink /etc/systemd/system/multi-user.target.wants/cron.service → /usr/lib/systemd/system/cron.service.
netadmin@nms02:~$ <span class="hl">systemctl --failed</span>
  UNIT LOAD ACTIVE SUB DESCRIPTION

0 loaded units listed.</pre>
<p>"0 loaded units listed" woh end state hai jo aap chahte ho: kuch failed nahi. (Symlink line ke upar jo Synchronizing aur Executing lines aati hain woh yahan chhoti ki gayi hain.)</p>

<h3>Ticket sahi tarah band karo</h3>
<ul>
<li>Batao kaaran kya tha: sshd_config ki line 5 mein typo, aur cron disabled.</li>
<li>Batao kya badla: ek sed correction, ek enable --now.</li>
<li>Batao kaise saabit kiya: WS01 se nc succeed; <code>--failed</code> khaali.</li>
<li>Prevention suggest karo: har restart se pehle <code>sshd -t</code> chalao, aur files badalte waqt doosri session khuli rakho.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Is ticket ki copy doosre host par aati hai jahan <code>telegraf</code> naam ki service fail ho rahi hai. Aapko telegraf jaanne ki zaroorat nahi. <code>--failed</code> se dhundho, <code>status</code> aur <code>journalctl -p err</code> se padho, log jo naam leta hai use theek karo, restart karo, client se verify karo. Tarika transfer hota hai.</p></div>
<div class="warn"><p><b>Common beginner mistake.</b> Failed service ko baar baar restart karna is umeed mein ki chal jayegi. Kaaran log mein ho to restart kuch nahi badalta. Pehle padho.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Connection refused" service ya port ki taraf ishara karta hai; "timed out" network ya firewall ki taraf. Kuch chhoone se pehle sahi layer chuno.</p></div>

<div class="scn"><h4>Ek raat, do faults</h4><p>Change window ke baad monitoring server down tha aur reports khaali. Team ne pehle web service theek ki aur jeet ka elaan kar diya. Subah <code>systemctl --failed</code> check karne par hi doosri problem mili. Paanch steps ki fixed list jo khaali failed list par khatam hoti, dono ek saath pakad leti.</p><p><b>Lesson:</b> ant mein confirm karo ki kuch failed nahi bacha.</p></div>

<div class="iv"><p class="q">"Jo Linux service start nahi ho rahi uska troubleshoot kaise karoge?"</p><p>Main <code>systemctl --failed</code> se failed units list karta hoon, <code>systemctl status</code> aur journal se pehli error line padhta hoon, bataya gaya kaaran theek karta hoon, service ka test mode ho (jaise <code>sshd -t</code>) to configuration validate karta hoon, restart karta hoon, aur client se verify karta hoon. Yeh bhi confirm karta hoon ki aur kuch failed nahi hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch steps: find, status, journal, fix aur test, client se verify.</li>
<li><code>sshd -t</code> file, line aur bad shabd batata hai.</li>
<li>Refused matlab service down, network nahi.</li>
<li>Khaali <code>systemctl --failed</code> par khatam karo.</li>
</ul></div>
`}};export{e as default};