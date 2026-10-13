var e={id:`sudo`,h:{en:`sudo: limited admin power, sudoers and the audit trail`,hi:`sudo: seemit admin power, sudoers aur audit trail`},body:{en:`
<p><b>The idea of this chapter:</b> instead of logging in as root, a person runs <b>one command at a time</b> as root with <code>sudo</code> ("superuser do"). The rules live in <code>/etc/sudoers</code> and <code>/etc/sudoers.d/</code>. Because every sudo use is logged with the real user's name, you get both safety and accountability. And you can allow <b>just one command</b>, which is least privilege in practice.</p>

<h3>Using sudo</h3>
<pre class="out">netadmin@jump01:~$ sudo -l
Matching Defaults entries for netadmin on jump01:
    env_reset, secure_path=/usr/local/sbin\\:/usr/local/bin\\:/usr/sbin\\:/usr/bin\\:/sbin\\:/bin

User netadmin may run the following commands on jump01:
    (ALL : ALL) ALL</pre>
<p><code>sudo -l</code> ("list") answers "what may I run with sudo?". For <code>netadmin</code> the line <code>(ALL : ALL) ALL</code> means any command, as any user and any group. That comes from membership of the <code>sudo</code> group (chapter 2). The first <code>sudo</code> command asks for <b>your own</b> password (not root's) and remembers it for a few minutes.</p>
<table class="cmp"><tr><th>Form</th><th>Meaning</th></tr>
<tr><td><code>sudo command</code></td><td>run one command as root</td></tr>
<tr><td><code>sudo -u ravi command</code></td><td>run it as another user (here ravi) instead of root</td></tr>
<tr><td><code>sudo -l -U ravi</code></td><td>list what <i>ravi</i> may run (needs sudo yourself)</td></tr></table>

<h3>Giving one command to one person</h3>
<p>Ravi, a new L1 engineer, needs to restart the log service when it hangs, but nothing else. Do not add him to the <code>sudo</code> group. Create a small rules file in <code>/etc/sudoers.d/</code>:</p>
<pre class="out">netadmin@jump01:~$ echo "ravi ALL=(ALL) /usr/bin/systemctl restart rsyslog" | sudo tee /etc/sudoers.d/noc-l1
ravi ALL=(ALL) /usr/bin/systemctl restart rsyslog
netadmin@jump01:~$ sudo chmod 440 /etc/sudoers.d/noc-l1
netadmin@jump01:~$ sudo visudo -c
/etc/sudoers: parsed OK
/etc/sudoers.d/noc-l1: parsed OK
netadmin@jump01:~$ sudo -l -U ravi
Matching Defaults entries for ravi on jump01:
    env_reset, secure_path=/usr/local/sbin\\:/usr/local/bin\\:/usr/sbin\\:/usr/bin\\:/sbin\\:/bin

User ravi may run the following commands on jump01:
    (ALL) /usr/bin/systemctl restart rsyslog
netadmin@jump01:~$ ls -l /etc/sudoers.d
total 4
-r--r-----  1 root     root         50 Sep 29 09:00 noc-l1</pre>
<p>The rule reads: <b>who</b> (<code>ravi</code>) <b>where</b> (<code>ALL</code> hosts) <b>as whom</b> (<code>(ALL)</code>) <b>which command</b> (the full path with its argument). Four details matter:</p>
<ul>
<li><b>Full path.</b> Always the full path of the command, so nobody can run a different program with the same name.</li>
<li><b>Why <code>tee</code>.</b> <code>sudo echo ... &gt; file</code> fails because your own shell does the redirect, without root. <code>echo ... | sudo tee file</code> runs the writing part as root.</li>
<li><b>Mode 440.</b> sudoers files must not be writable by others; the system ignores unsafe ones.</li>
<li><b><code>visudo -c</code>.</b> This checks the syntax of all rules <b>before</b> you rely on them. A syntax error in sudoers can lock every admin out of sudo. For editing, use <code>sudo visudo</code> (or <code>visudo -f /etc/sudoers.d/name</code>), never a plain editor.</li>
</ul>

<h3>What Ravi can and cannot do</h3>
<pre class="out">ravi@jump01:~$ sudo systemctl restart rsyslog
ravi@jump01:~$ sudo apt update
Sorry, user ravi is not allowed to execute '/usr/bin/apt update' as root on jump01.
ravi@jump01:~$ sudo -l
Matching Defaults entries for ravi on jump01:
    env_reset, secure_path=/usr/local/sbin\\:/usr/local/bin\\:/usr/sbin\\:/usr/bin\\:/sbin\\:/bin

User ravi may run the following commands on jump01:
    (ALL) /usr/bin/systemctl restart rsyslog</pre>
<p>The allowed command runs silently (success prints nothing). Any other command is refused with a clear message, and the refusal is also logged. This is least privilege: Ravi can fix the common problem and cannot install software or read secrets.</p>

<h3>The audit trail</h3>
<p>Every sudo use writes a line to <code>/var/log/auth.log</code> on Ubuntu (<code>/var/log/secure</code> on Red Hat). You met the same file in the text-processing module:</p>
<pre class="out">netadmin@jump01:~$ tail -n 2 /var/log/auth.log
Sep 29 09:00:30 jump01 sudo:    netadmin : TTY=pts/0 ; PWD=/home/netadmin ; USER=root ; COMMAND=chown ravi newfile
Sep 29 09:00:30 jump01 sudo:    netadmin : TTY=pts/0 ; PWD=/home/netadmin ; USER=root ; COMMAND=chown ravi:netbackup newfile</pre>
<p>Each line names the real person (<code>netadmin</code>), where they were (<code>PWD</code>), whom the command ran as (<code>USER=root</code>) and the exact command. That is the evidence a manager or auditor asks for. Compare it with a shared <code>root</code> login, where the log says only "root".</p>

<p><b>Reference commands (not run in the simulator):</b> options and Red Hat differences.</p>
<pre class="code">sudo -i                           # a root login shell: use sparingly
sudo -k                           # forget the cached password now
sudo visudo -f /etc/sudoers.d/noc-l1   # safe editor for one rules file
sudo usermod -aG wheel priya      # Red Hat family: admin group is wheel
grep sudo /var/log/auth.log       # Ubuntu audit trail
sudo grep sudo /var/log/secure    # Red Hat audit trail
# A group rule: everyone in group noc may run one command
# %noc ALL=(ALL) /usr/bin/systemctl restart rsyslog</pre>

<div class="warn"><p><b>Common mistakes.</b> (1) Editing <code>/etc/sudoers</code> with a normal editor and breaking its syntax. (2) Giving <code>ALL</code> commands when one would do. (3) Allowing a command like an editor or a shell, which lets the user escape to a full root shell. (4) Wildcards or relative command names in a rule. (5) Using <code>sudo</code> on every command "to be safe": it hides real permission problems and makes mistakes more costly.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>sudo</code> asks for the <b>user's own</b> password. Edit rules with <code>visudo</code>; check them with <code>visudo -c</code>. Drop-in files live in <code>/etc/sudoers.d/</code>. Ubuntu admins are in group <code>sudo</code>; Red Hat admins in <code>wheel</code>.</p></div>

<div class="scn"><h4>The restart-only engineer</h4><p>The night shift kept calling the senior engineer to restart the log service. The senior added a one-line sudoers file for the L1 group that allowed only that command. The calls stopped, the L1 team could not touch anything else, and the auth log showed each restart with the engineer's name.</p><p><b>Lesson:</b> delegate the smallest useful command, not the whole admin role.</p></div>

<div class="iv"><p class="q">"How do you give a junior engineer limited admin rights?"</p><p>I do not add them to the admin group. I create a file in <code>/etc/sudoers.d/</code> with the exact command and its full path, set mode 440, and validate with <code>visudo -c</code>. Then I confirm with <code>sudo -l -U name</code> and by testing as that user. Every use is logged in the auth log under their own name.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>sudo</code> runs one command as root, using your own password, and logs it.</li>
<li><code>sudo -l</code> shows what you may run; <code>sudo -l -U name</code> shows another user.</li>
<li>Rules live in <code>/etc/sudoers.d/</code>, mode 440, checked with <code>visudo -c</code>.</li>
<li>Grant the minimum: one command with its full path, not <code>ALL</code>.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> root ban kar login karne ke bajay insaan <code>sudo</code> ("superuser do") se root ke roop mein <b>ek time par ek command</b> chalata hai. Rules <code>/etc/sudoers</code> aur <code>/etc/sudoers.d/</code> mein rehte hain. Har sudo use asli user ke naam ke saath log hota hai, isliye safety aur accountability dono milti hain. Aur aap <b>sirf ek command</b> allow kar sakte ho, jo practice mein least privilege hai.</p>

<h3>sudo use karna</h3>
<pre class="out">netadmin@jump01:~$ sudo -l
Matching Defaults entries for netadmin on jump01:
    env_reset, secure_path=/usr/local/sbin\\:/usr/local/bin\\:/usr/sbin\\:/usr/bin\\:/sbin\\:/bin

User netadmin may run the following commands on jump01:
    (ALL : ALL) ALL</pre>
<p><code>sudo -l</code> ("list") "main sudo se kya chala sakta hoon?" ka jawab deta hai. <code>netadmin</code> ke liye <code>(ALL : ALL) ALL</code> ka matlab koi bhi command, kisi bhi user aur group ke roop mein. Yeh <code>sudo</code> group ki membership se aata hai (chapter 2). Pehla <code>sudo</code> command <b>aapka apna</b> password (root ka nahi) maangta hai aur kuch minute yaad rakhta hai.</p>
<table class="cmp"><tr><th>Form</th><th>Matlab</th></tr>
<tr><td><code>sudo command</code></td><td>ek command root ke roop mein chalao</td></tr>
<tr><td><code>sudo -u ravi command</code></td><td>root ki jagah doosre user (yahan ravi) ke roop mein chalao</td></tr>
<tr><td><code>sudo -l -U ravi</code></td><td><i>ravi</i> kya chala sakta hai list karo (aapko khud sudo chahiye)</td></tr></table>

<h3>Ek insaan ko ek command dena</h3>
<p>Ravi, naya L1 engineer, ko log service tab restart karni hai jab woh atak jaaye, aur kuch nahi. Use <code>sudo</code> group mein mat jodo. <code>/etc/sudoers.d/</code> mein chhoti rules file banao:</p>
<pre class="out">netadmin@jump01:~$ echo "ravi ALL=(ALL) /usr/bin/systemctl restart rsyslog" | sudo tee /etc/sudoers.d/noc-l1
ravi ALL=(ALL) /usr/bin/systemctl restart rsyslog
netadmin@jump01:~$ sudo chmod 440 /etc/sudoers.d/noc-l1
netadmin@jump01:~$ sudo visudo -c
/etc/sudoers: parsed OK
/etc/sudoers.d/noc-l1: parsed OK
netadmin@jump01:~$ sudo -l -U ravi
Matching Defaults entries for ravi on jump01:
    env_reset, secure_path=/usr/local/sbin\\:/usr/local/bin\\:/usr/sbin\\:/usr/bin\\:/sbin\\:/bin

User ravi may run the following commands on jump01:
    (ALL) /usr/bin/systemctl restart rsyslog
netadmin@jump01:~$ ls -l /etc/sudoers.d
total 4
-r--r-----  1 root     root         50 Sep 29 09:00 noc-l1</pre>
<p>Rule aise padhte hain: <b>kaun</b> (<code>ravi</code>) <b>kahan</b> (<code>ALL</code> hosts) <b>kiske roop mein</b> (<code>(ALL)</code>) <b>kaunsa command</b> (argument ke saath poora path). Chaar baatein zaroori hain:</p>
<ul>
<li><b>Poora path.</b> Hamesha command ka poora path, taaki koi same naam ka doosra program na chala sake.</li>
<li><b><code>tee</code> kyun.</b> <code>sudo echo ... &gt; file</code> fail hota hai kyunki redirect aapka apna shell karta hai, root ke bina. <code>echo ... | sudo tee file</code> likhne wala hissa root se chalata hai.</li>
<li><b>Mode 440.</b> sudoers files doosron ke liye writable nahi honi chahiye; system unsafe files ko ignore karta hai.</li>
<li><b><code>visudo -c</code>.</b> Yeh bharosa karne se <b>pehle</b> saare rules ka syntax check karta hai. sudoers mein syntax error har admin ko sudo se bahar kar sakti hai. Edit ke liye <code>sudo visudo</code> (ya <code>visudo -f /etc/sudoers.d/name</code>), normal editor kabhi nahi.</li>
</ul>

<h3>Ravi kya kar sakta hai aur kya nahi</h3>
<pre class="out">ravi@jump01:~$ sudo systemctl restart rsyslog
ravi@jump01:~$ sudo apt update
Sorry, user ravi is not allowed to execute '/usr/bin/apt update' as root on jump01.
ravi@jump01:~$ sudo -l
Matching Defaults entries for ravi on jump01:
    env_reset, secure_path=/usr/local/sbin\\:/usr/local/bin\\:/usr/sbin\\:/usr/bin\\:/sbin\\:/bin

User ravi may run the following commands on jump01:
    (ALL) /usr/bin/systemctl restart rsyslog</pre>
<p>Allowed command chupchap chalta hai (success kuch print nahi karta). Koi bhi doosra command saaf message ke saath refuse hota hai, aur refusal bhi log hota hai. Yahi least privilege hai: Ravi aam problem theek kar sakta hai, software install nahi kar sakta aur secrets nahi padh sakta.</p>

<h3>Audit trail</h3>
<p>Har sudo use Ubuntu par <code>/var/log/auth.log</code> mein line likhta hai (Red Hat par <code>/var/log/secure</code>). Yahi file aap text-processing module mein mil chuke ho:</p>
<pre class="out">netadmin@jump01:~$ tail -n 2 /var/log/auth.log
Sep 29 09:00:30 jump01 sudo:    netadmin : TTY=pts/0 ; PWD=/home/netadmin ; USER=root ; COMMAND=chown ravi newfile
Sep 29 09:00:30 jump01 sudo:    netadmin : TTY=pts/0 ; PWD=/home/netadmin ; USER=root ; COMMAND=chown ravi:netbackup newfile</pre>
<p>Har line asli insaan (<code>netadmin</code>), woh kahan tha (<code>PWD</code>), command kiske roop mein chala (<code>USER=root</code>) aur exact command batati hai. Yahi evidence manager ya auditor maangta hai. Shared <code>root</code> login se compare karo, jahan log mein sirf "root" hota hai.</p>

<p><b>Reference commands (simulator mein nahi chalte):</b> options aur Red Hat ke farak.</p>
<pre class="code">sudo -i                           # root login shell: kam use karo
sudo -k                           # cached password abhi bhool jao
sudo visudo -f /etc/sudoers.d/noc-l1   # ek rules file ka safe editor
sudo usermod -aG wheel priya      # Red Hat family: admin group wheel hai
grep sudo /var/log/auth.log       # Ubuntu audit trail
sudo grep sudo /var/log/secure    # Red Hat audit trail
# Group rule: group noc ka har member ek command chala sakta hai
# %noc ALL=(ALL) /usr/bin/systemctl restart rsyslog</pre>

<div class="warn"><p><b>Aam galtiyan.</b> (1) <code>/etc/sudoers</code> ko normal editor se edit karke syntax tod dena. (2) Jab ek command kaafi ho tab <code>ALL</code> commands dena. (3) Editor ya shell jaisa command allow karna, jisse user poore root shell mein nikal sakta hai. (4) Rule mein wildcards ya relative command names. (5) "Safe rehne" ke liye har command par <code>sudo</code>: yeh asli permission problems chhupata hai aur galtiyon ko mehnga banata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>sudo</code> <b>user ka apna</b> password maangta hai. Rules <code>visudo</code> se edit karo; <code>visudo -c</code> se check karo. Drop-in files <code>/etc/sudoers.d/</code> mein rehti hain. Ubuntu admins group <code>sudo</code> mein; Red Hat admins <code>wheel</code> mein.</p></div>

<div class="scn"><h4>Sirf restart karne wala engineer</h4><p>Night shift baar baar senior engineer ko log service restart karne ke liye call karti thi. Senior ne L1 group ke liye ek line ki sudoers file jodi jo sirf wahi command allow karti thi. Calls band ho gayi, L1 team kuch aur chhu nahi sakti thi, aur auth log har restart engineer ke naam ke saath dikhata tha.</p><p><b>Lesson:</b> sabse chhota kaam ka command delegate karo, poora admin role nahi.</p></div>

<div class="iv"><p class="q">"Junior engineer ko seemit admin rights kaise doge?"</p><p>Main use admin group mein nahi jodta. <code>/etc/sudoers.d/</code> mein exact command aur uske poore path ke saath file banata hoon, mode 440 set karta hoon, aur <code>visudo -c</code> se validate karta hoon. Phir <code>sudo -l -U name</code> se aur us user ke roop mein test karke confirm karta hoon. Har use auth log mein unke apne naam se log hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>sudo</code> ek command root ke roop mein chalata hai, aapka apna password use karta hai, aur log karta hai.</li>
<li><code>sudo -l</code> dikhata hai aap kya chala sakte ho; <code>sudo -l -U name</code> doosre user ke liye.</li>
<li>Rules <code>/etc/sudoers.d/</code> mein, mode 440, <code>visudo -c</code> se checked.</li>
<li>Minimum do: poore path ke saath ek command, <code>ALL</code> nahi.</li>
</ul></div>
`}};export{e as default};