var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p><b>You can now control who may do what on a Linux server.</b> You can read an account and its groups, read and set permissions, build a shared team folder, onboard and offboard people, delegate one command with sudo, and diagnose "Permission denied" without reaching for 777. These are the everyday skills behind safe shared jump hosts, backup servers and automation accounts.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Module map">
<rect x="10" y="20" width="190" height="110" rx="10" fill="#bbf7d0"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="14">Who</text><text x="105" y="70" text-anchor="middle" class="svg-muted" font-size="12">id  getent  /etc/passwd</text><text x="105" y="90" text-anchor="middle" class="svg-muted" font-size="12">useradd  usermod -aG</text>
<rect x="225" y="20" width="190" height="110" rx="10" fill="#bae6fd"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">What they may do</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">ls -l  chmod  chown</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="12">setgid  2770 / 2775</text>
<rect x="440" y="20" width="190" height="110" rx="10" fill="#fde68a"/><text x="535" y="45" text-anchor="middle" class="svg-ink" font-size="14">Admin power</text><text x="535" y="70" text-anchor="middle" class="svg-muted" font-size="12">sudo  sudoers.d</text><text x="535" y="90" text-anchor="middle" class="svg-muted" font-size="12">visudo -c  auth.log</text>
</svg><p class="cap">Who, what they may do, and how much power they get.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Read an <code>/etc/passwd</code> line (seven fields) and say what UID 0 and <code>nologin</code> mean.</li>
<li>Use <code>id</code>, <code>groups</code> and <code>getent</code> to show a user's groups.</li>
<li>Read <code>-rwxr-x---</code>, convert it to 750, and say which row applies to a given user.</li>
<li>Explain <code>r</code>, <code>w</code> and <code>x</code> on files and on directories.</li>
<li>Use <code>chmod</code> in numeric and symbolic mode; make a script executable.</li>
<li>Use <code>chown</code> and <code>chgrp</code>, and build a team folder with <code>2770</code> and setgid.</li>
<li>Create a group and users, set passwords, add with <code>usermod -aG</code>, lock and delete.</li>
<li>Write a one-command sudoers drop-in, mode 440, validated with <code>visudo -c</code>.</li>
<li>Apply the routine: <code>id</code>, <code>ls -l</code>, <code>ls -ld</code>, smallest fix, test with <code>su - user</code>.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>UID / GID</dt><dd>The numbers the kernel uses for a user and a group.</dd>
<dt>Supplementary group</dt><dd>An extra group membership beyond the user's main group.</dd>
<dt>Others</dt><dd>Everybody who is neither the owner nor in the file's group.</dd>
<dt>setgid on a directory</dt><dd>New files inherit the directory's group; shown as <code>s</code>, mode digit 2.</dd>
<dt>umask</dt><dd>The default mask that removes permissions from new files.</dd>
<dt>sudoers</dt><dd>The rules that say who may run which command as which user.</dd>
<dt>Least privilege</dt><dd>Give only the access that the job needs.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Question</th><th>Answer</th></tr>
<tr><td>Where are password hashes?</td><td><code>/etc/shadow</code></td></tr>
<tr><td>UID of root</td><td>0</td></tr>
<tr><td>r, w, x as numbers</td><td>4, 2, 1</td></tr>
<tr><td><code>rw-r-----</code> as a number</td><td>640</td></tr>
<tr><td>To delete a file you need</td><td><code>w</code> and <code>x</code> on its directory</td></tr>
<tr><td>Add a user to a group safely</td><td><code>usermod -aG group user</code></td></tr>
<tr><td>Who can change a file's owner?</td><td>root only</td></tr>
<tr><td>Check sudoers syntax</td><td><code>visudo -c</code></td></tr>
<tr><td>Admin group on Ubuntu / Red Hat</td><td><code>sudo</code> / <code>wheel</code></td></tr>
<tr><td>Which password does sudo ask for?</td><td>the user's own</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">id name  /  groups name  /  getent passwd name  /  getent group grp
ls -l file  /  ls -ld dir  /  chmod 640 file  /  chmod u+x,g-w file
chown owner:group path  /  chgrp group path  /  chmod 2770 dir
sudo groupadd noc  /  sudo useradd -m -s /bin/bash -G noc name
sudo passwd name  /  sudo usermod -aG grp name  /  sudo passwd -l name
sudo userdel name  /  sudo userdel -r name
sudo -l  /  sudo -l -U name  /  sudo visudo -c  /  su - name</pre>

<div class="warn"><p><b>Last reminder.</b> Permission errors are protection. Fix them with the right group and the smallest mode, never with 777. Test as the user, log out and in after group changes, and remember that credentials files are a security risk if anyone can read them.</p></div>
<div class="exam"><p><b>Exam trap recap.</b> UID decides power, not the name; first matching row wins; directory <code>w</code> controls delete; <code>usermod -G</code> without <code>-a</code> replaces; sudo uses your own password; setgid is the 2 in 2770.</p></div>

<div class="scn"><h4>The week-one onboarding</h4><p>A new L1 engineer needed access to the shared NOC notes and the ability to restart one service. In ten minutes a senior created the account, added the <code>noc</code> group, set a temporary password and added a one-line sudoers rule. The new engineer logged in, wrote to the shared folder and restarted the service, and was refused when trying anything else, exactly as designed.</p><p><b>Lesson:</b> a good account is one that can do its job and nothing more.</p></div>

<div class="iv"><p class="q">"How would you describe your Linux user and permission skills for a network engineer role?"</p><p>I can onboard and offboard users, manage groups, set owner, group and mode correctly, build shared folders with setgid, and delegate single commands with sudoers instead of full root. When a script fails with Permission denied I find the exact row, directory or group that blocks it, fix it with the smallest change, and verify as the user.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every action is checked against user, group and permissions; the first matching row applies.</li>
<li>Teams share through a group plus <code>2770</code>; people join with <code>usermod -aG</code> and a new login.</li>
<li><code>sudo</code> gives limited, logged power; grant one command, validate with <code>visudo -c</code>.</li>
<li>Troubleshoot: <code>id</code>, <code>ls -l</code>, <code>ls -ld</code>, smallest fix, test as the user.</li>
</ul></div>
`,hi:`
<p><b>Ab aap Linux server par control kar sakte ho ki kaun kya kar sakta hai.</b> Aap account aur uski groups padh sakte ho, permissions padh aur set kar sakte ho, shared team folder bana sakte ho, logon ko onboard aur offboard kar sakte ho, sudo se ek command delegate kar sakte ho, aur 777 par gaye bina "Permission denied" diagnose kar sakte ho. Safe shared jump hosts, backup servers aur automation accounts ke peeche yahi roz ke skills hain.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Module map">
<rect x="10" y="20" width="190" height="110" rx="10" fill="#bbf7d0"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="14">Kaun</text><text x="105" y="70" text-anchor="middle" class="svg-muted" font-size="12">id  getent  /etc/passwd</text><text x="105" y="90" text-anchor="middle" class="svg-muted" font-size="12">useradd  usermod -aG</text>
<rect x="225" y="20" width="190" height="110" rx="10" fill="#bae6fd"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">Kya kar sakte hain</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">ls -l  chmod  chown</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="12">setgid  2770 / 2775</text>
<rect x="440" y="20" width="190" height="110" rx="10" fill="#fde68a"/><text x="535" y="45" text-anchor="middle" class="svg-ink" font-size="14">Admin power</text><text x="535" y="70" text-anchor="middle" class="svg-muted" font-size="12">sudo  sudoers.d</text><text x="535" y="90" text-anchor="middle" class="svg-muted" font-size="12">visudo -c  auth.log</text>
</svg><p class="cap">Kaun, kya kar sakta hai, aur kitni power milti hai.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li><code>/etc/passwd</code> ki ek line (saat fields) padho aur batao UID 0 aur <code>nologin</code> ka kya matlab hai.</li>
<li><code>id</code>, <code>groups</code> aur <code>getent</code> se user ki groups dikhao.</li>
<li><code>-rwxr-x---</code> padho, use 750 mein badlo, aur batao kisi user par kaunsi row lagti hai.</li>
<li>Files aur directories par <code>r</code>, <code>w</code> aur <code>x</code> samjhao.</li>
<li><code>chmod</code> numeric aur symbolic mode mein use karo; script ko executable banao.</li>
<li><code>chown</code> aur <code>chgrp</code> use karo, aur <code>2770</code> aur setgid se team folder banao.</li>
<li>Group aur users banao, passwords set karo, <code>usermod -aG</code> se jodo, lock aur delete karo.</li>
<li>Ek-command sudoers drop-in likho, mode 440, <code>visudo -c</code> se validated.</li>
<li>Routine lagao: <code>id</code>, <code>ls -l</code>, <code>ls -ld</code>, sabse chhota fix, <code>su - user</code> se test.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>UID / GID</dt><dd>Woh numbers jo kernel user aur group ke liye use karta hai.</dd>
<dt>Supplementary group</dt><dd>User ke main group ke alawa extra group membership.</dd>
<dt>Others</dt><dd>Woh sab jo na owner hain na file ke group mein.</dd>
<dt>Directory par setgid</dt><dd>Nayi files directory ka group inherit karti hain; <code>s</code> ke roop mein dikhta hai, mode digit 2.</dd>
<dt>umask</dt><dd>Default mask jo nayi files se permissions hata deta hai.</dd>
<dt>sudoers</dt><dd>Woh rules jo batate hain kaun kaunsa command kis user ke roop mein chala sakta hai.</dd>
<dt>Least privilege</dt><dd>Sirf utna access do jitna kaam ko chahiye.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Sawal</th><th>Jawab</th></tr>
<tr><td>Password hashes kahan hain?</td><td><code>/etc/shadow</code></td></tr>
<tr><td>root ka UID</td><td>0</td></tr>
<tr><td>r, w, x numbers mein</td><td>4, 2, 1</td></tr>
<tr><td><code>rw-r-----</code> number mein</td><td>640</td></tr>
<tr><td>File delete karne ke liye chahiye</td><td>uski directory par <code>w</code> aur <code>x</code></td></tr>
<tr><td>User ko group mein safely jodna</td><td><code>usermod -aG group user</code></td></tr>
<tr><td>File ka owner kaun badal sakta hai?</td><td>sirf root</td></tr>
<tr><td>sudoers syntax check</td><td><code>visudo -c</code></td></tr>
<tr><td>Ubuntu / Red Hat par admin group</td><td><code>sudo</code> / <code>wheel</code></td></tr>
<tr><td>sudo kaunsa password maangta hai?</td><td>user ka apna</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">id name  /  groups name  /  getent passwd name  /  getent group grp
ls -l file  /  ls -ld dir  /  chmod 640 file  /  chmod u+x,g-w file
chown owner:group path  /  chgrp group path  /  chmod 2770 dir
sudo groupadd noc  /  sudo useradd -m -s /bin/bash -G noc name
sudo passwd name  /  sudo usermod -aG grp name  /  sudo passwd -l name
sudo userdel name  /  sudo userdel -r name
sudo -l  /  sudo -l -U name  /  sudo visudo -c  /  su - name</pre>

<div class="warn"><p><b>Aakhri yaad-dehani.</b> Permission errors protection hain. Unhe sahi group aur sabse chhote mode se theek karo, 777 se kabhi nahi. User ke roop mein test karo, group changes ke baad logout aur login karo, aur yaad rakho ki credentials files koi bhi padh sake to security risk hain.</p></div>
<div class="exam"><p><b>Exam trap recap.</b> Power UID tay karta hai, naam nahi; pehli matching row jeetti hai; directory ka <code>w</code> delete control karta hai; <code>-a</code> ke bina <code>usermod -G</code> replace karta hai; sudo aapka apna password use karta hai; setgid 2770 ka 2 hai.</p></div>

<div class="scn"><h4>Pehle hafte ka onboarding</h4><p>Naye L1 engineer ko shared NOC notes ka access aur ek service restart karne ki ability chahiye thi. Das minute mein senior ne account banaya, <code>noc</code> group jodha, temporary password set kiya aur ek line ka sudoers rule jodha. Naye engineer ne login kiya, shared folder mein likha aur service restart ki, aur kuch aur try karne par refuse hua, bilkul design ke mutabiq.</p><p><b>Lesson:</b> achha account woh hai jo apna kaam kar sake aur usse zyada kuch nahi.</p></div>

<div class="iv"><p class="q">"Network engineer role ke liye apne Linux user aur permission skills kaise batoge?"</p><p>Main users ko onboard aur offboard kar sakta hoon, groups manage kar sakta hoon, owner, group aur mode sahi set kar sakta hoon, setgid se shared folders bana sakta hoon, aur poore root ki jagah sudoers se single commands delegate kar sakta hoon. Script Permission denied se fail ho to main wahi exact row, directory ya group dhoondta hoon jo rok raha hai, sabse chhote change se theek karta hoon, aur user ke roop mein verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har action user, group aur permissions se check hota hai; pehli matching row lagti hai.</li>
<li>Teams group plus <code>2770</code> se share karti hain; log <code>usermod -aG</code> aur naye login se judte hain.</li>
<li><code>sudo</code> seemit, logged power deta hai; ek command do, <code>visudo -c</code> se validate karo.</li>
<li>Troubleshoot: <code>id</code>, <code>ls -l</code>, <code>ls -ld</code>, sabse chhota fix, user ke roop mein test.</li>
</ul></div>
`}};export{e as default};