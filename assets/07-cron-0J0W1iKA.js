var e={id:`cron`,h:{en:`Scheduled jobs with cron: reading the five fields`,hi:`cron se scheduled jobs: paanch fields padhna`},body:{en:`
<p>Network teams run jobs on a schedule: back up configs every night, rotate logs, poll a device. On Linux the classic scheduler is <b>cron</b>. It is itself a service, so everything you learned about <code>systemctl</code> applies to it. If the cron service is off, no job runs, however perfect the schedule.</p>

<h3>Where jobs are defined</h3>
<p>System jobs are small files in <code>/etc/cron.d/</code>. Here is the nightly config backup on NMS02:</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">cat /etc/cron.d/nk-backup</span>
# nightly config backup
0 2 * * * root /usr/local/bin/nk-backup.sh</pre>
<p>Lines starting with <code>#</code> are comments. The job line has <b>five time fields</b>, then a <b>user</b> (only in <code>/etc/cron.d</code> files), then the <b>command</b>.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Cron fields: minute, hour, day of month, month, day of week, then user and command">
<rect x="10" y="30" width="80" height="50" rx="6" fill="#bae6fd"/><text x="50" y="52" text-anchor="middle" class="svg-ink" font-size="12">minute</text><text x="50" y="70" text-anchor="middle" class="svg-ink" font-size="13">0</text>
<rect x="100" y="30" width="80" height="50" rx="6" fill="#bbf7d0"/><text x="140" y="52" text-anchor="middle" class="svg-ink" font-size="12">hour</text><text x="140" y="70" text-anchor="middle" class="svg-ink" font-size="13">2</text>
<rect x="190" y="30" width="80" height="50" rx="6" fill="#fde68a"/><text x="230" y="52" text-anchor="middle" class="svg-ink" font-size="11">day-of-month</text><text x="230" y="70" text-anchor="middle" class="svg-ink" font-size="13">*</text>
<rect x="280" y="30" width="80" height="50" rx="6" fill="#fed7aa"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="12">month</text><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="13">*</text>
<rect x="370" y="30" width="80" height="50" rx="6" fill="#ddd6fe"/><text x="410" y="52" text-anchor="middle" class="svg-ink" font-size="11">day-of-week</text><text x="410" y="70" text-anchor="middle" class="svg-ink" font-size="13">*</text>
<rect x="460" y="30" width="60" height="50" rx="6" fill="#e2e8f0"/><text x="490" y="52" text-anchor="middle" class="svg-ink" font-size="12">user</text><text x="490" y="70" text-anchor="middle" class="svg-ink" font-size="13">root</text>
<rect x="530" y="30" width="100" height="50" rx="6" fill="#e2e8f0"/><text x="580" y="52" text-anchor="middle" class="svg-ink" font-size="12">command</text><text x="580" y="70" text-anchor="middle" class="svg-ink" font-size="11">nk-backup.sh</text>
<text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">Reads: every day at 02:00, run the backup script as root.</text>
</svg><p class="cap">Five time fields, then who, then what.</p></div>

<h3>How to read the five fields</h3>
<table class="cmp"><thead><tr><th>Field</th><th>Range</th><th>Example</th></tr></thead><tbody>
<tr><td>minute</td><td>0-59</td><td>0 means on the hour</td></tr>
<tr><td>hour</td><td>0-23</td><td>2 means 02:00</td></tr>
<tr><td>day of month</td><td>1-31</td><td>* means every day</td></tr>
<tr><td>month</td><td>1-12</td><td>* means every month</td></tr>
<tr><td>day of week</td><td>0-7 (0 and 7 are Sunday)</td><td>* means any weekday</td></tr>
</tbody></table>
<p>The star <code>*</code> means "every". So <code>0 2 * * *</code> reads "minute 0, hour 2, every day, every month, every weekday": daily at two in the morning. Other examples: <code>*/15 * * * *</code> every 15 minutes, <code>30 6 * * 1</code> every Monday at 06:30.</p>

<h3>A schedule is not enough: the service must run</h3>
<p>In the ticket lab, the backup never ran. The schedule is perfect, so check the service:</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">systemctl is-enabled cron</span>
disabled
netadmin@nms02:~$ <span class="hl">systemctl status cron</span>
○ cron.service - Regular background program processing daemon
     Loaded: loaded (/usr/lib/systemd/system/cron.service; disabled; preset: enabled)
     Active: <span class="hl">inactive (dead)</span></pre>
<p>The hollow circle and "inactive (dead)" mean it is not running, and "disabled" means it will not return after a reboot. The backup job has been silently skipped. Fix both at once with <code>--now</code>:</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">sudo systemctl enable --now cron</span>
Synchronizing state of cron.service with SysV service script with /usr/lib/systemd/systemd-sysv-install.
Executing: /usr/lib/systemd/systemd-sysv-install enable cron
Created symlink /etc/systemd/system/multi-user.target.wants/cron.service → /usr/lib/systemd/system/cron.service.
netadmin@nms02:~$ <span class="hl">systemctl is-enabled cron</span>
enabled
netadmin@nms02:~$ <span class="hl">systemctl is-active cron</span>
active</pre>
<p>Now the next 02:00 will run the script. Remember cron has no screen: output goes to mail or the journal, not to your terminal, so test scripts by hand first.</p>

<h3>Reference (not run in the simulator)</h3>
<pre class="code">crontab -l              <span class="c"># list your own user's jobs</span>
crontab -e              <span class="c"># edit your own user's jobs</span>
systemctl list-timers   <span class="c"># systemd timers, the modern alternative to cron</span>
sudo systemctl status cron   <span class="c"># then read journalctl -u cron for run history</span></pre>

<div class="eg"><p><b>Worked example.</b> A manager asks: "Did last night's config backup run?" You read <code>/etc/cron.d/nk-backup</code> (schedule correct), then <code>systemctl is-active cron</code> (inactive). That explains the missing backup. You enable cron with <code>--now</code> and report the gap honestly.</p></div>
<div class="warn"><p><b>Common beginner mistake.</b> Writing a job and assuming it runs, without checking the cron service or the script's permissions. A job that has never produced evidence has not been proven to work.</p></div>
<div class="exam"><p><b>Exam trap.</b> The five fields are minute, hour, day of month, month, day of week, in that order. Many candidates swap hour and minute.</p></div>

<div class="scn"><h4>Eight missing backups</h4><p>An audit found no config backups for eight days. The job file was fine; the cron service had been disabled during a hardening exercise and never turned back on. Eight nights of risk, fixed by one command.</p><p><b>Lesson:</b> when a scheduled job does not run, check the scheduler service before the job.</p></div>

<div class="iv"><p class="q">"What does 0 2 * * * mean in a crontab?"</p><p>Minute 0, hour 2, every day of the month, every month, every day of the week: the command runs every day at 02:00. The fields are minute, hour, day of month, month, day of week.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>cron is a service; if it is off, nothing runs.</li>
<li>Five fields: minute, hour, day of month, month, day of week.</li>
<li>Files in <code>/etc/cron.d</code> have an extra user field.</li>
<li><code>enable --now</code> fixes both "now" and "after reboot".</li>
</ul></div>
`,hi:`
<p>Network teams schedule par jobs chalati hain: har raat config backup, logs rotate, device poll. Linux mein classic scheduler <b>cron</b> hai. Woh khud ek service hai, isliye <code>systemctl</code> ka sab kuch us par lagta hai. Cron service off ho to koi job nahi chalti, schedule kitna bhi perfect ho.</p>

<h3>Jobs kahan define hoti hain</h3>
<p>System jobs <code>/etc/cron.d/</code> mein chhoti files hoti hain. NMS02 par raat ka config backup yeh hai:</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">cat /etc/cron.d/nk-backup</span>
# nightly config backup
0 2 * * * root /usr/local/bin/nk-backup.sh</pre>
<p><code>#</code> se shuru lines comments hain. Job line mein <b>paanch time fields</b>, phir <b>user</b> (sirf <code>/etc/cron.d</code> files mein), phir <b>command</b> hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Cron fields: minute, hour, day of month, month, day of week, phir user aur command">
<rect x="10" y="30" width="80" height="50" rx="6" fill="#bae6fd"/><text x="50" y="52" text-anchor="middle" class="svg-ink" font-size="12">minute</text><text x="50" y="70" text-anchor="middle" class="svg-ink" font-size="13">0</text>
<rect x="100" y="30" width="80" height="50" rx="6" fill="#bbf7d0"/><text x="140" y="52" text-anchor="middle" class="svg-ink" font-size="12">hour</text><text x="140" y="70" text-anchor="middle" class="svg-ink" font-size="13">2</text>
<rect x="190" y="30" width="80" height="50" rx="6" fill="#fde68a"/><text x="230" y="52" text-anchor="middle" class="svg-ink" font-size="11">day-of-month</text><text x="230" y="70" text-anchor="middle" class="svg-ink" font-size="13">*</text>
<rect x="280" y="30" width="80" height="50" rx="6" fill="#fed7aa"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="12">month</text><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="13">*</text>
<rect x="370" y="30" width="80" height="50" rx="6" fill="#ddd6fe"/><text x="410" y="52" text-anchor="middle" class="svg-ink" font-size="11">day-of-week</text><text x="410" y="70" text-anchor="middle" class="svg-ink" font-size="13">*</text>
<rect x="460" y="30" width="60" height="50" rx="6" fill="#e2e8f0"/><text x="490" y="52" text-anchor="middle" class="svg-ink" font-size="12">user</text><text x="490" y="70" text-anchor="middle" class="svg-ink" font-size="13">root</text>
<rect x="530" y="30" width="100" height="50" rx="6" fill="#e2e8f0"/><text x="580" y="52" text-anchor="middle" class="svg-ink" font-size="12">command</text><text x="580" y="70" text-anchor="middle" class="svg-ink" font-size="11">nk-backup.sh</text>
<text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">Padho: roz subah 02:00 baje backup script root se chalao.</text>
</svg><p class="cap">Paanch time fields, phir kaun, phir kya.</p></div>

<h3>Paanch fields kaise padhein</h3>
<table class="cmp"><thead><tr><th>Field</th><th>Range</th><th>Example</th></tr></thead><tbody>
<tr><td>minute</td><td>0-59</td><td>0 matlab ghante ke shuru mein</td></tr>
<tr><td>hour</td><td>0-23</td><td>2 matlab 02:00</td></tr>
<tr><td>day of month</td><td>1-31</td><td>* matlab har din</td></tr>
<tr><td>month</td><td>1-12</td><td>* matlab har mahina</td></tr>
<tr><td>day of week</td><td>0-7 (0 aur 7 Sunday)</td><td>* matlab koi bhi weekday</td></tr>
</tbody></table>
<p>Star <code>*</code> matlab "har". To <code>0 2 * * *</code> padho "minute 0, hour 2, har din, har mahina, har weekday": roz subah do baje. Aur examples: <code>*/15 * * * *</code> har 15 minute, <code>30 6 * * 1</code> har Monday 06:30.</p>

<h3>Sirf schedule kaafi nahi: service chalni chahiye</h3>
<p>Ticket lab mein backup kabhi chala hi nahi. Schedule perfect hai, isliye service check karo:</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">systemctl is-enabled cron</span>
disabled
netadmin@nms02:~$ <span class="hl">systemctl status cron</span>
○ cron.service - Regular background program processing daemon
     Loaded: loaded (/usr/lib/systemd/system/cron.service; disabled; preset: enabled)
     Active: <span class="hl">inactive (dead)</span></pre>
<p>Khaali gola aur "inactive (dead)" matlab chal nahi rahi, aur "disabled" matlab reboot ke baad bhi nahi aayegi. Backup job chupchap skip hoti rahi. <code>--now</code> se dono ek saath fix karo:</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">sudo systemctl enable --now cron</span>
Synchronizing state of cron.service with SysV service script with /usr/lib/systemd/systemd-sysv-install.
Executing: /usr/lib/systemd/systemd-sysv-install enable cron
Created symlink /etc/systemd/system/multi-user.target.wants/cron.service → /usr/lib/systemd/system/cron.service.
netadmin@nms02:~$ <span class="hl">systemctl is-enabled cron</span>
enabled
netadmin@nms02:~$ <span class="hl">systemctl is-active cron</span>
active</pre>
<p>Ab agle 02:00 par script chalegi. Yaad rakho cron ki screen nahi hoti: output mail ya journal mein jaata hai, aapke terminal par nahi, isliye scripts pehle haath se test karo.</p>

<h3>Reference (simulator mein nahi chalte)</h3>
<pre class="code">crontab -l              <span class="c"># apne user ki jobs list karo</span>
crontab -e              <span class="c"># apne user ki jobs edit karo</span>
systemctl list-timers   <span class="c"># systemd timers, cron ka modern vikalp</span>
sudo systemctl status cron   <span class="c"># phir run history ke liye journalctl -u cron</span></pre>

<div class="eg"><p><b>Worked example.</b> Manager poochta hai: "Kal raat ka config backup chala?" Aap <code>/etc/cron.d/nk-backup</code> padhte ho (schedule sahi), phir <code>systemctl is-active cron</code> (inactive). Missing backup ki wajah mil gayi. Aap <code>--now</code> se cron enable karte ho aur gap ko imandari se report karte ho.</p></div>
<div class="warn"><p><b>Common beginner mistake.</b> Job likhkar maan lena ki chalegi, cron service ya script ki permissions check kiye bina. Jis job ka kabhi saboot nahi mila use kaam karta hua saabit nahi kaha ja sakta.</p></div>
<div class="exam"><p><b>Exam trap.</b> Paanch fields ka order: minute, hour, day of month, month, day of week. Kai candidates hour aur minute ulta kar dete hain.</p></div>

<div class="scn"><h4>Aath missing backups</h4><p>Audit mein aath din se koi config backup nahi mila. Job file theek thi; cron service ek hardening exercise mein disable hui aur wapas on nahi hui. Aath raat ka risk, ek command se fix.</p><p><b>Lesson:</b> scheduled job na chale to job se pehle scheduler service check karo.</p></div>

<div class="iv"><p class="q">"Crontab mein 0 2 * * * ka kya matlab hai?"</p><p>Minute 0, hour 2, mahine ka har din, har mahina, hafte ka har din: command roz 02:00 baje chalta hai. Fields ka order minute, hour, day of month, month, day of week hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>cron ek service hai; off ho to kuch nahi chalta.</li>
<li>Paanch fields: minute, hour, day of month, month, day of week.</li>
<li><code>/etc/cron.d</code> ki files mein extra user field hota hai.</li>
<li><code>enable --now</code> "abhi" aur "reboot ke baad" dono fix karta hai.</li>
</ul></div>
`}};export{e as default};