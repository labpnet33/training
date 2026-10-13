var e={id:`backup-cron`,h:{en:`A backup script, its secrets, and cron`,hi:`Backup script, uske secrets, aur cron`},body:{en:`
<p><b>The idea of this chapter:</b> put the pieces together into a real job: a script that saves the running configuration of every router into a dated folder, and <b>cron</b>, the Linux scheduler, that runs it every night without you.</p>

<h3>Analogy: the alarm clock</h3>
<p>The script is the task. Cron is the alarm clock that starts it at the right time, even when you are asleep. But an alarm clock cannot answer questions, so the task must run without anyone typing anything: no prompts, no passwords typed by hand.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Cron runs backup.sh nightly">
<rect x="20" y="60" width="130" height="60" rx="10" fill="#fde68a"/><text x="85" y="86" text-anchor="middle" class="svg-ink" font-size="13">cron</text><text x="85" y="106" text-anchor="middle" class="svg-muted" font-size="12">0 2 * * *</text>
<line x1="150" y1="90" x2="190" y2="90" stroke="#64748b" stroke-width="2"/>
<rect x="190" y="60" width="130" height="60" rx="10" fill="#bae6fd"/><text x="255" y="86" text-anchor="middle" class="svg-ink" font-size="13">backup.sh</text><text x="255" y="106" text-anchor="middle" class="svg-muted" font-size="12">on AUTO01</text>
<line x1="320" y1="90" x2="360" y2="90" stroke="#64748b" stroke-width="2"/>
<rect x="360" y="20" width="130" height="50" rx="10" fill="#bbf7d0"/><text x="425" y="50" text-anchor="middle" class="svg-ink" font-size="13">R1  show run</text>
<rect x="360" y="110" width="130" height="50" rx="10" fill="#bbf7d0"/><text x="425" y="140" text-anchor="middle" class="svg-ink" font-size="13">R2  show run</text>
<line x1="490" y1="45" x2="530" y2="75" stroke="#64748b" stroke-width="2"/><line x1="490" y1="135" x2="530" y2="105" stroke="#64748b" stroke-width="2"/>
<rect x="530" y="60" width="95" height="60" rx="10" fill="#ddd6fe"/><text x="577" y="86" text-anchor="middle" class="svg-ink" font-size="12">backups/</text><text x="577" y="106" text-anchor="middle" class="svg-muted" font-size="12">2026-09-29</text>
</svg><p class="cap">Cron starts the script; the script logs in to each router and saves the config.</p></div>

<h3>The backup script</h3>
<p>The lab's <code>backup.sh</code> reads like this. It uses everything you have learned: a variable, <code>$(date +%F)</code>, <code>mkdir -p</code>, a <code>for</code> loop and a log file.</p>
<pre class="code">#!/bin/bash
ROUTERS="10.99.0.1 10.99.0.2"
DIR=/home/netadmin/backups/$(date +%F)
mkdir -p "$DIR"
for r in $ROUTERS; do
  sshpass -p 'NK@2026' ssh -o StrictHostKeyChecking=no netops@$r "show running-config" &gt; "$DIR/$r.cfg"
  echo "$(date +%T) saved $r" &gt;&gt; /home/netadmin/backups/backup.log
done</pre>
<p><code>mkdir -p</code> creates the folder and does nothing if it already exists. <code>ssh netops@$r "show running-config"</code> logs in and runs one command. <code>&gt; file</code> sends the output into a file (replacing it), and <code>&gt;&gt; file</code> appends a line to the log. <code>sshpass</code> supplies the password to ssh, because ssh normally asks for it from the keyboard and cron has no keyboard.</p>

<h3>The script has two flaws: read this carefully</h3>
<p>First, <code>sshpass</code> is not installed on a fresh server. Look at what happens in the lab:</p>
<pre class="out">AUTO01$ ./backup.sh
Command 'sshpass' not found, but can be installed with:
sudo apt install sshpass
Command 'sshpass' not found, but can be installed with:
sudo apt install sshpass
AUTO01$ cat backups/backup.log
09:00:30 saved 10.99.0.1
09:00:30 saved 10.99.0.2
AUTO01$ ls -l backups/2026-09-29
total 8
-rw-rw-r--  1 netadmin netadmin      <span class="hl">0</span> Sep 29 09:00 10.99.0.1.cfg
-rw-rw-r--  1 netadmin netadmin      <span class="hl">0</span> Sep 29 09:00 10.99.0.2.cfg</pre>
<p>The log says "saved" but both files are <b>0 bytes</b>. The script never checked the exit code of <code>sshpass</code>, so it logged success for a failure. This is the exact bug from the last chapter. After <code>sudo apt update</code> and <code>sudo apt install -y sshpass</code>, the same script works:</p>
<pre class="out">AUTO01$ ./backup.sh
AUTO01$ ls -lR backups
backups:
total 8
drwxrwxr-x  2 netadmin netadmin   4096 Sep 29 09:00 2026-09-29
-rw-rw-r--  1 netadmin netadmin    100 Sep 29 09:00 backup.log

backups/2026-09-29:
total 8
-rw-rw-r--  1 netadmin netadmin    <span class="hl">924</span> Sep 29 09:00 10.99.0.1.cfg
-rw-rw-r--  1 netadmin netadmin    <span class="hl">924</span> Sep 29 09:00 10.99.0.2.cfg
AUTO01$ grep hostname backups/*/*.cfg
backups/2026-09-29/10.99.0.1.cfg:hostname PUN-CORE-R1
backups/2026-09-29/10.99.0.2.cfg:hostname BLR-EDGE-R2</pre>
<p>Second flaw: the router password sits in the script. Anyone who can read the file, or look at the process list while it runs, sees it. Treat that as acceptable only in a lab. Protect the file with <code>chmod 700 backup.sh</code> so only the owner can read, write and run it (<code>-rwx------</code>), and in production replace passwords with SSH keys, covered in the SSH module.</p>

<div class="note"><p><b>Reference code (not run in the simulator).</b> A safer loop checks every result and takes the password from the environment instead of the file: <code>sshpass -e</code> reads it from the variable <code>SSHPASS</code>, which you set outside the script and never write into it.</p>
<pre class="code">failed=0
for r in $ROUTERS; do
  if sshpass -e ssh netops@"$r" "show running-config" &gt; "$DIR/$r.cfg"; then
    echo "$(date +%T) saved $r" &gt;&gt; "$LOG"
  else
    echo "$(date +%T) FAILED $r" &gt;&gt; "$LOG"
    rm -f "$DIR/$r.cfg"
    failed=1
  fi
done
exit "$failed"</pre>
<p>Also check the router's host key instead of disabling the check as the lab script does.</p></div>

<h3>cron: five time fields and a command</h3>
<pre class="code"># m   h   dom mon dow   command
  0   2   *   *   *     /home/netadmin/backup.sh       # every day at 02:00
  */15 *  *   *   *     /home/netadmin/checknet.sh     # every 15 minutes
  30  8   *   *   1-5   /home/netadmin/report.sh       # 08:30 Monday to Friday</pre>
<p>The fields are minute, hour, day of month, month and day of week. A star means "every". <code>crontab -l</code> lists your jobs and <code>crontab -e</code> edits them. In the lab you install a line with <code>echo "..." | crontab -</code>, which <b>replaces</b> the whole crontab. Test with <code>* * * * *</code> (every minute), wait, then look for proof that cron ran:</p>
<pre class="out">AUTO01$ echo "* * * * * /home/netadmin/backup.sh" | crontab -
AUTO01$ crontab -l
* * * * * /home/netadmin/backup.sh
AUTO01$ grep CRON /var/log/syslog
Sep 29 09:01:00 auto01 CRON[700]: (<span class="hl">netadmin</span>) CMD (/home/netadmin/backup.sh)
Sep 29 09:02:00 auto01 CRON[701]: (netadmin) CMD (/home/netadmin/backup.sh)
AUTO01$ echo "0 2 * * * /home/netadmin/backup.sh" | crontab -
AUTO01$ crontab -l
0 2 * * * /home/netadmin/backup.sh</pre>
<p>The syslog lines show who ran what and when. Once the test passes, replace the every-minute line with the real schedule, <code>0 2 * * *</code>.</p>

<div class="warn"><p><b>Common mistakes.</b> Leaving the every-minute test line in place. Using relative paths in cron (it starts in your home folder with a minimal PATH, so use full paths). Expecting prompts to work: cron has no terminal. Making a script with a password readable by everyone. Not checking that the files saved are not empty.</p></div>
<div class="exam"><p><b>Exam trap.</b> The cron field order is <i>minute hour day-of-month month day-of-week</i>. <code>0 2 * * *</code> is 02:00, but <code>2 0 * * *</code> is 00:02. And <code>* 2 * * *</code> runs every minute from 02:00 to 02:59.</p></div>

<div class="scn"><h4>The empty config files</h4><p>A router died and the team went to restore last night's backup. The file existed, but it was empty. The nightly job had been "succeeding" for a month while ssh was failing because a firewall change blocked port 22. Nobody checked file sizes or exit codes. Afterwards the script was changed to remove empty files, exit 1 on any failure, and a morning check listed the size of every backup.</p><p><b>Lesson:</b> a backup you have not verified is not a backup.</p></div>

<div class="iv"><p class="q">"How would you schedule a nightly config backup, and how would you know it ran?"</p><p>Write a script that logs in to each device non-interactively, saves output to a dated folder and exits non-zero on failure. Schedule it with a crontab line such as <code>0 2 * * *</code> using full paths. Verify with <code>crontab -l</code>, the CRON lines in <code>/var/log/syslog</code>, the script's own log, and file sizes. Mention SSH keys instead of stored passwords and <code>chmod 700</code> on the script.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A backup script loops over devices and saves each config into a folder named with <code>$(date +%F)</code>.</li>
<li>Check the exit code of the login command; otherwise failures are logged as success.</li>
<li>Do not store passwords in scripts; use keys or the environment, and <code>chmod 700</code>.</li>
<li>cron fields: minute hour day-of-month month day-of-week; test with <code>* * * * *</code>.</li>
<li>Prove a job ran: <code>crontab -l</code>, <code>grep CRON /var/log/syslog</code>, the log and the files.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> sab tukde jodkar ek asli job banao: ek script jo har router ki running configuration dated folder mein save kare, aur <b>cron</b>, Linux ka scheduler, jo use har raat aapke bina chalaye.</p>

<h3>Analogy: alarm clock</h3>
<p>Script kaam hai. Cron alarm clock hai jo use sahi time par shuru karta hai, aap soye hue ho tab bhi. Par alarm clock sawaalon ka jawab nahi de sakta, isliye kaam bina kisi ke kuch type kiye chalna chahiye: koi prompt nahi, haath se type kiya password nahi.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Cron nightly backup.sh chalata hai">
<rect x="20" y="60" width="130" height="60" rx="10" fill="#fde68a"/><text x="85" y="86" text-anchor="middle" class="svg-ink" font-size="13">cron</text><text x="85" y="106" text-anchor="middle" class="svg-muted" font-size="12">0 2 * * *</text>
<line x1="150" y1="90" x2="190" y2="90" stroke="#64748b" stroke-width="2"/>
<rect x="190" y="60" width="130" height="60" rx="10" fill="#bae6fd"/><text x="255" y="86" text-anchor="middle" class="svg-ink" font-size="13">backup.sh</text><text x="255" y="106" text-anchor="middle" class="svg-muted" font-size="12">AUTO01 par</text>
<line x1="320" y1="90" x2="360" y2="90" stroke="#64748b" stroke-width="2"/>
<rect x="360" y="20" width="130" height="50" rx="10" fill="#bbf7d0"/><text x="425" y="50" text-anchor="middle" class="svg-ink" font-size="13">R1  show run</text>
<rect x="360" y="110" width="130" height="50" rx="10" fill="#bbf7d0"/><text x="425" y="140" text-anchor="middle" class="svg-ink" font-size="13">R2  show run</text>
<line x1="490" y1="45" x2="530" y2="75" stroke="#64748b" stroke-width="2"/><line x1="490" y1="135" x2="530" y2="105" stroke="#64748b" stroke-width="2"/>
<rect x="530" y="60" width="95" height="60" rx="10" fill="#ddd6fe"/><text x="577" y="86" text-anchor="middle" class="svg-ink" font-size="12">backups/</text><text x="577" y="106" text-anchor="middle" class="svg-muted" font-size="12">2026-09-29</text>
</svg><p class="cap">Cron script shuru karta hai; script har router mein login karke config save karti hai.</p></div>

<h3>Backup script</h3>
<p>Lab ki <code>backup.sh</code> aisi dikhti hai. Isme woh sab hai jo aapne seekha: variable, <code>$(date +%F)</code>, <code>mkdir -p</code>, <code>for</code> loop aur log file.</p>
<pre class="code">#!/bin/bash
ROUTERS="10.99.0.1 10.99.0.2"
DIR=/home/netadmin/backups/$(date +%F)
mkdir -p "$DIR"
for r in $ROUTERS; do
  sshpass -p 'NK@2026' ssh -o StrictHostKeyChecking=no netops@$r "show running-config" &gt; "$DIR/$r.cfg"
  echo "$(date +%T) saved $r" &gt;&gt; /home/netadmin/backups/backup.log
done</pre>
<p><code>mkdir -p</code> folder banata hai aur pehle se ho to kuch nahi karta. <code>ssh netops@$r "show running-config"</code> login karke ek command chalata hai. <code>&gt; file</code> output ko file mein bhejta hai (replace karke), aur <code>&gt;&gt; file</code> log mein ek line jodta hai. <code>sshpass</code> ssh ko password deta hai, kyunki ssh normally keyboard se maangta hai aur cron ke paas keyboard nahi hota.</p>

<h3>Script mein do kamiyan hain: dhyan se padho</h3>
<p>Pehli, fresh server par <code>sshpass</code> install nahi hota. Lab mein dekho kya hota hai:</p>
<pre class="out">AUTO01$ ./backup.sh
Command 'sshpass' not found, but can be installed with:
sudo apt install sshpass
Command 'sshpass' not found, but can be installed with:
sudo apt install sshpass
AUTO01$ cat backups/backup.log
09:00:30 saved 10.99.0.1
09:00:30 saved 10.99.0.2
AUTO01$ ls -l backups/2026-09-29
total 8
-rw-rw-r--  1 netadmin netadmin      <span class="hl">0</span> Sep 29 09:00 10.99.0.1.cfg
-rw-rw-r--  1 netadmin netadmin      <span class="hl">0</span> Sep 29 09:00 10.99.0.2.cfg</pre>
<p>Log "saved" kehta hai par dono files <b>0 bytes</b> ki hain. Script ne <code>sshpass</code> ka exit code kabhi check nahi kiya, isliye failure ko success log kiya. Yeh pichhle chapter wala hi bug hai. <code>sudo apt update</code> aur <code>sudo apt install -y sshpass</code> ke baad wahi script chalti hai:</p>
<pre class="out">AUTO01$ ./backup.sh
AUTO01$ ls -lR backups
backups:
total 8
drwxrwxr-x  2 netadmin netadmin   4096 Sep 29 09:00 2026-09-29
-rw-rw-r--  1 netadmin netadmin    100 Sep 29 09:00 backup.log

backups/2026-09-29:
total 8
-rw-rw-r--  1 netadmin netadmin    <span class="hl">924</span> Sep 29 09:00 10.99.0.1.cfg
-rw-rw-r--  1 netadmin netadmin    <span class="hl">924</span> Sep 29 09:00 10.99.0.2.cfg
AUTO01$ grep hostname backups/*/*.cfg
backups/2026-09-29/10.99.0.1.cfg:hostname PUN-CORE-R1
backups/2026-09-29/10.99.0.2.cfg:hostname BLR-EDGE-R2</pre>
<p>Doosri kami: router ka password script mein pada hai. Jo bhi file padh sake, ya chalte waqt process list dekh sake, use dikh jaata hai. Ise sirf lab mein theek maano. File ko <code>chmod 700 backup.sh</code> se protect karo taaki sirf owner padh, likh aur chala sake (<code>-rwx------</code>), aur production mein passwords ki jagah SSH keys use karo, jo SSH module mein hain.</p>

<div class="note"><p><b>Reference code (not run in the simulator).</b> Safer loop har result check karta hai aur password file ki jagah environment se leta hai: <code>sshpass -e</code> use variable <code>SSHPASS</code> se padhta hai, jise aap script ke bahar set karte ho aur script mein kabhi nahi likhte.</p>
<pre class="code">failed=0
for r in $ROUTERS; do
  if sshpass -e ssh netops@"$r" "show running-config" &gt; "$DIR/$r.cfg"; then
    echo "$(date +%T) saved $r" &gt;&gt; "$LOG"
  else
    echo "$(date +%T) FAILED $r" &gt;&gt; "$LOG"
    rm -f "$DIR/$r.cfg"
    failed=1
  fi
done
exit "$failed"</pre>
<p>Router ki host key bhi check karo, lab script ki tarah check band mat karo.</p></div>

<h3>cron: paanch time fields aur ek command</h3>
<pre class="code"># m   h   dom mon dow   command
  0   2   *   *   *     /home/netadmin/backup.sh       # roz 02:00 baje
  */15 *  *   *   *     /home/netadmin/checknet.sh     # har 15 minute
  30  8   *   *   1-5   /home/netadmin/report.sh       # Somvaar se Shukravaar 08:30</pre>
<p>Fields hain minute, hour, day of month, month aur day of week. Star matlab "har". <code>crontab -l</code> aapke jobs dikhata hai aur <code>crontab -e</code> edit karta hai. Lab mein <code>echo "..." | crontab -</code> se line install karte ho, jo poori crontab ko <b>replace</b> karta hai. <code>* * * * *</code> (har minute) se test karo, ruko, phir saboot dekho ki cron ne chalaya:</p>
<pre class="out">AUTO01$ echo "* * * * * /home/netadmin/backup.sh" | crontab -
AUTO01$ crontab -l
* * * * * /home/netadmin/backup.sh
AUTO01$ grep CRON /var/log/syslog
Sep 29 09:01:00 auto01 CRON[700]: (<span class="hl">netadmin</span>) CMD (/home/netadmin/backup.sh)
Sep 29 09:02:00 auto01 CRON[701]: (netadmin) CMD (/home/netadmin/backup.sh)
AUTO01$ echo "0 2 * * * /home/netadmin/backup.sh" | crontab -
AUTO01$ crontab -l
0 2 * * * /home/netadmin/backup.sh</pre>
<p>Syslog lines dikhati hain kisne kya kab chalaya. Test pass hone par har-minute wali line ko asli schedule <code>0 2 * * *</code> se badlo.</p>

<div class="warn"><p><b>Common mistakes.</b> Har-minute wali test line chhod dena. Cron mein relative paths use karna (woh home folder mein minimal PATH ke saath shuru hota hai, isliye full paths use karo). Prompts ke kaam karne ki umeed (cron ka terminal nahi hota). Password wali script ko sabke liye readable chhodna. Yeh check na karna ki save ki gayi files khaali to nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Cron field order hai <i>minute hour day-of-month month day-of-week</i>. <code>0 2 * * *</code> 02:00 hai, par <code>2 0 * * *</code> 00:02 hai. Aur <code>* 2 * * *</code> 02:00 se 02:59 tak har minute chalta hai.</p></div>

<div class="scn"><h4>Khaali config files</h4><p>Ek router mar gaya aur team kal raat ka backup restore karne gayi. File thi, par khaali. Nightly job mahine bhar se "safal" ho raha tha jabki ssh fail ho raha tha kyunki firewall change ne port 22 block kar diya tha. Kisi ne file sizes ya exit codes check nahi kiye. Baad mein script ko khaali files hatane, kisi bhi failure par exit 1 karne ke liye badla gaya, aur subah ke check mein har backup ka size list hone laga.</p><p><b>Lesson:</b> jis backup ko aapne verify nahi kiya woh backup nahi hai.</p></div>

<div class="iv"><p class="q">"Nightly config backup kaise schedule karoge, aur kaise jaanoge ki chala?"</p><p>Aisi script likho jo devices mein non-interactive login kare, output dated folder mein save kare aur failure par non-zero exit kare. Use full paths ke saath <code>0 2 * * *</code> jaisi crontab line se schedule karo. <code>crontab -l</code>, <code>/var/log/syslog</code> ki CRON lines, script ke apne log aur file sizes se verify karo. Stored passwords ki jagah SSH keys aur script par <code>chmod 700</code> ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Backup script devices par loop karti hai aur har config <code>$(date +%F)</code> naam ke folder mein save karti hai.</li>
<li>Login command ka exit code check karo; warna failures success ki tarah log hote hain.</li>
<li>Scripts mein passwords mat rakho; keys ya environment use karo, aur <code>chmod 700</code>.</li>
<li>cron fields: minute hour day-of-month month day-of-week; <code>* * * * *</code> se test karo.</li>
<li>Job chala yeh sabit karo: <code>crontab -l</code>, <code>grep CRON /var/log/syslog</code>, log aur files.</li>
</ul></div>
`}};export{e as default};