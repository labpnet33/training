var e={id:`cron`,h:{en:`cron: let the server run your tool every night`,hi:`cron: server se apna tool har raat chalwao`},body:{en:`
<p><b>The idea of this chapter:</b> a tool that needs you to press Enter is still manual work. <b>cron</b> is the Linux scheduler: you give it a time pattern and a command, and it runs the command for you. The catch is that cron runs your tool in a very bare setting, and that is where most first attempts fail. You will watch two failures and fix both.</p>

<h3>Analogy: an alarm clock with no hands</h3>
<p>cron wakes up, reads its list once a minute and starts anything whose time has come. It does not know your folder, your favourite settings or your screen. It starts the command from your home directory with almost nothing else, so every path must be spelled out in full.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="The five cron time fields and the command">
<rect x="10" y="25" width="75" height="50" rx="8" fill="#bae6fd"/><text x="47" y="47" text-anchor="middle" class="svg-ink" font-size="13">30</text><text x="47" y="65" text-anchor="middle" class="svg-muted" font-size="10">minute</text>
<rect x="95" y="25" width="75" height="50" rx="8" fill="#bae6fd"/><text x="132" y="47" text-anchor="middle" class="svg-ink" font-size="13">1</text><text x="132" y="65" text-anchor="middle" class="svg-muted" font-size="10">hour</text>
<rect x="180" y="25" width="75" height="50" rx="8" fill="#bae6fd"/><text x="217" y="47" text-anchor="middle" class="svg-ink" font-size="13">*</text><text x="217" y="65" text-anchor="middle" class="svg-muted" font-size="10">day of month</text>
<rect x="265" y="25" width="75" height="50" rx="8" fill="#bae6fd"/><text x="302" y="47" text-anchor="middle" class="svg-ink" font-size="13">*</text><text x="302" y="65" text-anchor="middle" class="svg-muted" font-size="10">month</text>
<rect x="350" y="25" width="75" height="50" rx="8" fill="#bae6fd"/><text x="387" y="47" text-anchor="middle" class="svg-ink" font-size="13">*</text><text x="387" y="65" text-anchor="middle" class="svg-muted" font-size="10">weekday</text>
<rect x="445" y="25" width="185" height="50" rx="8" fill="#bbf7d0"/><text x="537" y="55" text-anchor="middle" class="svg-ink" font-size="12">command to run</text>
<text x="320" y="115" text-anchor="middle" class="svg-accent" font-size="12">30 1 * * * means: at 01:30, every day of every month</text>
</svg><p class="cap">Five time fields, then the command. A star means "every".</p></div>

<h3>Step 1: install a test schedule</h3>
<p>For learning, run the tool every minute. <code>crontab -</code> reads a new schedule from what is piped in; <code>crontab -l</code> lists it.</p>
<pre class="out">AUTO01$ ls /opt/netbackup
devices.csv  netbackup.py
AUTO01$ echo "* * * * * /opt/netbackup/netbackup.py -v" | crontab -
AUTO01$ crontab -l
<span class="hl">* * * * * /opt/netbackup/netbackup.py -v</span></pre>
<p>Here the tool lives in <code>/opt/netbackup</code>, and the command uses its <b>full path</b>. After a minute passes, ask the system log whether cron really started it:</p>
<pre class="out">AUTO01$ grep CRON /var/log/syslog
Sep 29 09:01:00 auto01 CRON[700]: (netadmin) CMD (/opt/netbackup/netbackup.py -v)
Sep 29 09:01:00 auto01 CRON[700]: (CRON) info (No MTA installed, discarding output)</pre>
<p>The first line proves cron started the command for user <code>netadmin</code>. The second says cron would normally mail the output, there is no mail system, so the output was thrown away. A scheduled job whose output vanishes is invisible. The fix is to send the output to a file with <code>&gt;&gt;</code> (append) and to merge error messages into the same place with <code>2&gt;&amp;1</code>:</p>
<pre class="out">AUTO01$ echo "* * * * * /opt/netbackup/netbackup.py -v &gt;&gt; /home/netadmin/cron-backup.log 2&gt;&amp;1" | crontab -</pre>

<h3>Failure 1: the relative path</h3>
<p>One minute later the file holds the real reason it failed:</p>
<pre class="out">AUTO01$ cat cron-backup.log
Traceback (most recent call last):
  File "/opt/netbackup/netbackup.py", line 30, in &lt;module&gt;
    with open(args.devices) as f:
<span class="hl">FileNotFoundError: [Errno 2] No such file or directory: 'devices.csv'</span></pre>
<p>By hand, you ran the tool from the folder that contains <code>devices.csv</code>. cron starts in your home folder, where that file does not exist, and the tool's default <code>devices.csv</code> is a <i>relative</i> path. That is exactly why chapter 5 gave the tool options: tell it where everything is, in full.</p>
<pre class="out">AUTO01$ echo "* * * * * /opt/netbackup/netbackup.py -v -d /opt/netbackup/devices.csv -o /home/netadmin/backups &gt;&gt; /home/netadmin/cron-backup.log 2&gt;&amp;1" | crontab -</pre>

<h3>Proof it works</h3>
<pre class="out">AUTO01$ tail -3 cron-backup.log
    with open(args.devices) as f:
FileNotFoundError: [Errno 2] No such file or directory: 'devices.csv'
<span class="hl">2 saved, 1 failed</span>
AUTO01$ ls -R backups
backups:
2026-09-29

backups/2026-09-29:
BLR-EDGE-R2.cfg  PUN-CORE-R1.cfg
AUTO01$ cat ~/netbackup.log
2026-09-29 09:03:00,000 INFO PUN-CORE-R1 (10.99.0.1): saved 53 lines to /home/netadmin/backups/2026-09-29/PUN-CORE-R1.cfg
2026-09-29 09:03:00,000 INFO BLR-EDGE-R2 (10.99.0.2): saved 53 lines to /home/netadmin/backups/2026-09-29/BLR-EDGE-R2.cfg
2026-09-29 09:03:00,000 ERROR HYD-EDGE-R3 (10.99.0.3): NetmikoTimeoutException</pre>
<p>The old error is still in the file (we only append), then "2 saved, 1 failed" is the new run. Two config files exist and the log records the third router as a timeout. Because the log entries show full paths, you know exactly where the backups went.</p>

<h3>Step 2: the real schedule</h3>
<p>Every minute was only for the lesson. A nightly backup uses fixed fields:</p>
<pre class="out">AUTO01$ echo "30 1 * * * /opt/netbackup/netbackup.py -v -d /opt/netbackup/devices.csv -o /home/netadmin/backups &gt;&gt; /home/netadmin/cron-backup.log 2&gt;&amp;1" | crontab -
AUTO01$ crontab -l
<span class="hl">30 1 * * * /opt/netbackup/netbackup.py -v -d /opt/netbackup/devices.csv -o /home/netadmin/backups &gt;&gt; /home/netadmin/cron-backup.log 2&gt;&amp;1</span></pre>
<p>Read it left to right: minute 30, hour 1, any day, any month, any weekday, then the command with every path in full, and the output appended to a log file.</p>

<div class="eg"><p><b>Worked example.</b> "Run every weekday at 06:15" is <code>15 6 * * 1-5</code>: minute 15, hour 6, weekdays Monday to Friday (1 to 5). "Every 15 minutes" is <code>*/15 * * * *</code>.</p></div>

<div class="note"><p><b>Reference code (not run in the simulator).</b> <code>crontab -e</code> opens your schedule in an editor, which is how most people edit it; <code>crontab -</code> with a pipe replaces the entire schedule, so include every line you want to keep. For a virtual environment, call that environment's Python by full path, for example <code>/opt/netbackup/.venv/bin/python3 /opt/netbackup/netbackup.py</code>. Cron has a minimal PATH, so use full paths everywhere.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Relative paths. Sending output nowhere. Replacing the whole crontab by accident with <code>crontab -</code>. Forgetting the execute bit or the first-line interpreter. Testing only by hand, never as cron. Scheduling with a real password in the command line.</p></div>
<div class="exam"><p><b>Exam trap.</b> The five fields are minute, hour, day of month, month, weekday, in that order. <code>*</code> means every. And <code>2&gt;&amp;1</code> sends error messages to the same place as normal output.</p></div>

<div class="scn"><h4>It worked yesterday, by hand</h4><p>A script ran perfectly when typed and never produced a file under cron. The engineer saw nothing because the output was discarded. Once the output was appended to a log file, the message "No such file or directory: devices.csv" appeared immediately, and an absolute path fixed the job.</p><p><b>Lesson:</b> log cron output, and use full paths.</p></div>

<div class="iv"><p class="q">"Your cron job works manually but not from cron. What do you check?"</p><p>Paths first: the working directory and PATH differ, so I use absolute paths. Then I capture output with <code>&gt;&gt; file 2&gt;&amp;1</code>, check <code>/var/log/syslog</code> for the CRON line, confirm the execute bit and interpreter, and check which Python and environment are used.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>cron fields: minute, hour, day of month, month, weekday, then the command.</li>
<li>Use absolute paths; cron does not start where you did.</li>
<li>Capture output with <code>&gt;&gt; file 2&gt;&amp;1</code>, or it is discarded.</li>
<li>Check <code>grep CRON /var/log/syslog</code> to see that the job started.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> jis tool ko chalane ke liye aapko Enter dabana pade woh abhi bhi manual kaam hai. <b>cron</b> Linux ka scheduler hai: aap use time pattern aur command dete ho, aur woh command aapke liye chalata hai. Dikkat yeh hai ki cron aapka tool bahut khaali mahaul mein chalata hai, aur zyadatar pehle prayas wahin fail hote hain. Aap do failures dekhoge aur dono fix karoge.</p>

<h3>Analogy: bina haath wali alarm clock</h3>
<p>cron minute mein ek baar jaagta hai, apni list padhta hai aur jiska samay aa gaya use shuru kar deta hai. Use aapka folder, aapki pasandida settings ya aapki screen nahi pata. Woh command ko aapke home directory se, lagbhag kuch aur ke bina shuru karta hai, isliye har path poora likhna padta hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="cron ke paanch time fields aur command">
<rect x="10" y="25" width="75" height="50" rx="8" fill="#bae6fd"/><text x="47" y="47" text-anchor="middle" class="svg-ink" font-size="13">30</text><text x="47" y="65" text-anchor="middle" class="svg-muted" font-size="10">minute</text>
<rect x="95" y="25" width="75" height="50" rx="8" fill="#bae6fd"/><text x="132" y="47" text-anchor="middle" class="svg-ink" font-size="13">1</text><text x="132" y="65" text-anchor="middle" class="svg-muted" font-size="10">hour</text>
<rect x="180" y="25" width="75" height="50" rx="8" fill="#bae6fd"/><text x="217" y="47" text-anchor="middle" class="svg-ink" font-size="13">*</text><text x="217" y="65" text-anchor="middle" class="svg-muted" font-size="10">day of month</text>
<rect x="265" y="25" width="75" height="50" rx="8" fill="#bae6fd"/><text x="302" y="47" text-anchor="middle" class="svg-ink" font-size="13">*</text><text x="302" y="65" text-anchor="middle" class="svg-muted" font-size="10">month</text>
<rect x="350" y="25" width="75" height="50" rx="8" fill="#bae6fd"/><text x="387" y="47" text-anchor="middle" class="svg-ink" font-size="13">*</text><text x="387" y="65" text-anchor="middle" class="svg-muted" font-size="10">weekday</text>
<rect x="445" y="25" width="185" height="50" rx="8" fill="#bbf7d0"/><text x="537" y="55" text-anchor="middle" class="svg-ink" font-size="12">chalane wala command</text>
<text x="320" y="115" text-anchor="middle" class="svg-accent" font-size="12">30 1 * * * ka matlab: 01:30 par, har din, har mahine</text>
</svg><p class="cap">Paanch time fields, phir command. Star ka matlab "har".</p></div>

<h3>Step 1: test schedule lagao</h3>
<p>Seekhne ke liye tool har minute chalao. <code>crontab -</code> pipe se aayi nayi schedule padhta hai; <code>crontab -l</code> use list karta hai.</p>
<pre class="out">AUTO01$ ls /opt/netbackup
devices.csv  netbackup.py
AUTO01$ echo "* * * * * /opt/netbackup/netbackup.py -v" | crontab -
AUTO01$ crontab -l
<span class="hl">* * * * * /opt/netbackup/netbackup.py -v</span></pre>
<p>Yahan tool <code>/opt/netbackup</code> mein hai, aur command uska <b>poora path</b> use karta hai. Ek minute baad system log se poocho ki cron ne sach mein use shuru kiya ya nahi:</p>
<pre class="out">AUTO01$ grep CRON /var/log/syslog
Sep 29 09:01:00 auto01 CRON[700]: (netadmin) CMD (/opt/netbackup/netbackup.py -v)
Sep 29 09:01:00 auto01 CRON[700]: (CRON) info (No MTA installed, discarding output)</pre>
<p>Pehli line saabit karti hai ki cron ne user <code>netadmin</code> ke liye command shuru kiya. Doosri kehti hai ki cron normally output mail karta, mail system nahi hai, isliye output fenk diya gaya. Jis scheduled job ka output gayab ho jaye woh dikhta hi nahi. Fix yeh hai ki output ko <code>&gt;&gt;</code> (append) se file mein bhejo aur error messages ko <code>2&gt;&amp;1</code> se usi jagah mila do:</p>
<pre class="out">AUTO01$ echo "* * * * * /opt/netbackup/netbackup.py -v &gt;&gt; /home/netadmin/cron-backup.log 2&gt;&amp;1" | crontab -</pre>

<h3>Failure 1: relative path</h3>
<p>Ek minute baad file mein fail hone ki asli wajah hai:</p>
<pre class="out">AUTO01$ cat cron-backup.log
Traceback (most recent call last):
  File "/opt/netbackup/netbackup.py", line 30, in &lt;module&gt;
    with open(args.devices) as f:
<span class="hl">FileNotFoundError: [Errno 2] No such file or directory: 'devices.csv'</span></pre>
<p>Haath se aapne tool us folder se chalaya tha jisme <code>devices.csv</code> hai. cron aapke home folder mein shuru karta hai, jahan woh file nahi hai, aur tool ka default <code>devices.csv</code> <i>relative</i> path hai. Isiliye chapter 5 ne tool ko options diye: use poora batao ki sab kahan hai.</p>
<pre class="out">AUTO01$ echo "* * * * * /opt/netbackup/netbackup.py -v -d /opt/netbackup/devices.csv -o /home/netadmin/backups &gt;&gt; /home/netadmin/cron-backup.log 2&gt;&amp;1" | crontab -</pre>

<h3>Saboot ki yeh kaam karta hai</h3>
<pre class="out">AUTO01$ tail -3 cron-backup.log
    with open(args.devices) as f:
FileNotFoundError: [Errno 2] No such file or directory: 'devices.csv'
<span class="hl">2 saved, 1 failed</span>
AUTO01$ ls -R backups
backups:
2026-09-29

backups/2026-09-29:
BLR-EDGE-R2.cfg  PUN-CORE-R1.cfg
AUTO01$ cat ~/netbackup.log
2026-09-29 09:03:00,000 INFO PUN-CORE-R1 (10.99.0.1): saved 53 lines to /home/netadmin/backups/2026-09-29/PUN-CORE-R1.cfg
2026-09-29 09:03:00,000 INFO BLR-EDGE-R2 (10.99.0.2): saved 53 lines to /home/netadmin/backups/2026-09-29/BLR-EDGE-R2.cfg
2026-09-29 09:03:00,000 ERROR HYD-EDGE-R3 (10.99.0.3): NetmikoTimeoutException</pre>
<p>Purana error file mein abhi bhi hai (hum sirf append karte hain), phir "2 saved, 1 failed" naya run hai. Do config files maujood hain aur log teesre router ko timeout ki tarah record karta hai. Log entries mein poore paths hain, isliye pata hai backups kahan gaye.</p>

<h3>Step 2: asli schedule</h3>
<p>Har minute sirf lesson ke liye tha. Nightly backup fixed fields use karta hai:</p>
<pre class="out">AUTO01$ echo "30 1 * * * /opt/netbackup/netbackup.py -v -d /opt/netbackup/devices.csv -o /home/netadmin/backups &gt;&gt; /home/netadmin/cron-backup.log 2&gt;&amp;1" | crontab -
AUTO01$ crontab -l
<span class="hl">30 1 * * * /opt/netbackup/netbackup.py -v -d /opt/netbackup/devices.csv -o /home/netadmin/backups &gt;&gt; /home/netadmin/cron-backup.log 2&gt;&amp;1</span></pre>
<p>Baayen se daayen padho: minute 30, hour 1, koi bhi din, koi bhi mahina, koi bhi weekday, phir har path poora wala command, aur output log file mein append.</p>

<div class="eg"><p><b>Worked example.</b> "Har weekday 06:15 par chalao" yaani <code>15 6 * * 1-5</code>: minute 15, hour 6, weekdays Monday se Friday (1 se 5). "Har 15 minute" yaani <code>*/15 * * * *</code>.</p></div>

<div class="note"><p><b>Reference code (not run in the simulator).</b> <code>crontab -e</code> aapki schedule ko editor mein kholta hai, jo zyadatar log edit karne ke liye use karte hain; pipe ke saath <code>crontab -</code> poori schedule replace kar deta hai, isliye jo lines rakhni hain woh sab shamil karo. Virtual environment ke liye us environment ka Python poore path se bulao, jaise <code>/opt/netbackup/.venv/bin/python3 /opt/netbackup/netbackup.py</code>. cron ka PATH bahut chhota hota hai, isliye har jagah full paths use karo.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Relative paths. Output kahin na bhejna. <code>crontab -</code> se galti se poori crontab replace kar dena. Execute bit ya first-line interpreter bhool jana. Sirf haath se test karna, cron ki tarah kabhi nahi. Command line mein asli password ke saath schedule karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Paanch fields ka order minute, hour, day of month, month, weekday hai. <code>*</code> ka matlab har. Aur <code>2&gt;&amp;1</code> error messages ko normal output wali jagah bhejta hai.</p></div>

<div class="scn"><h4>Kal haath se chali thi</h4><p>Ek script type karne par bilkul chali aur cron mein kabhi file nahi bani. Engineer ko kuch dikha nahi kyunki output fenk diya gaya tha. Output ko log file mein append karte hi "No such file or directory: devices.csv" turant dikha, aur absolute path ne job theek kar di.</p><p><b>Lesson:</b> cron ka output log karo, aur full paths use karo.</p></div>

<div class="iv"><p class="q">"Cron job haath se chalti hai par cron se nahi. Kya check karoge?"</p><p>Pehle paths: working directory aur PATH alag hote hain, isliye absolute paths use karta hoon. Phir <code>&gt;&gt; file 2&gt;&amp;1</code> se output pakadta hoon, <code>/var/log/syslog</code> mein CRON line dekhta hoon, execute bit aur interpreter confirm karta hoon, aur dekhta hoon ki kaunsa Python aur environment use ho raha hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>cron fields: minute, hour, day of month, month, weekday, phir command.</li>
<li>Absolute paths use karo; cron wahan shuru nahi karta jahan aap karte ho.</li>
<li>Output <code>&gt;&gt; file 2&gt;&amp;1</code> se pakdo, warna woh fenk diya jaata hai.</li>
<li><code>grep CRON /var/log/syslog</code> dikhata hai ki job shuru hui ya nahi.</li>
</ul></div>
`}};export{e as default};