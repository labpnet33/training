var e={id:`managing-users`,h:{en:`Managing users: useradd, passwd, usermod, groupadd, userdel`,hi:`Users manage karna: useradd, passwd, usermod, groupadd, userdel`},body:{en:`
<p><b>The idea of this chapter:</b> onboarding and offboarding is routine NOC work: a new engineer joins, someone changes teams, someone leaves. Each step is one short command run with <code>sudo</code>. Learn the five verbs: <b>add a group, add a user, set a password, change membership, remove</b>.</p>

<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="User life cycle">
<rect x="10" y="30" width="110" height="50" rx="10" fill="#bbf7d0"/><text x="65" y="60" text-anchor="middle" class="svg-ink" font-size="13">groupadd</text>
<rect x="140" y="30" width="110" height="50" rx="10" fill="#bae6fd"/><text x="195" y="60" text-anchor="middle" class="svg-ink" font-size="13">useradd</text>
<rect x="270" y="30" width="110" height="50" rx="10" fill="#fde68a"/><text x="325" y="60" text-anchor="middle" class="svg-ink" font-size="13">passwd</text>
<rect x="400" y="30" width="110" height="50" rx="10" fill="#e9d5ff"/><text x="455" y="60" text-anchor="middle" class="svg-ink" font-size="13">usermod</text>
<rect x="530" y="30" width="100" height="50" rx="10" fill="#fecaca"/><text x="580" y="60" text-anchor="middle" class="svg-ink" font-size="13">userdel</text>
<line x1="120" y1="55" x2="140" y2="55" stroke="#64748b" stroke-width="2"/><line x1="250" y1="55" x2="270" y2="55" stroke="#64748b" stroke-width="2"/><line x1="380" y1="55" x2="400" y2="55" stroke="#64748b" stroke-width="2"/><line x1="510" y1="55" x2="530" y2="55" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Create, secure, change, remove.</p></div>

<h3>1. Create the group, then the users</h3>
<pre class="out">netadmin@jump01:~$ sudo groupadd noc
netadmin@jump01:~$ getent group noc
noc:x:1002:
netadmin@jump01:~$ sudo useradd -m -s /bin/bash -G noc ravi
netadmin@jump01:~$ sudo useradd -m -s /bin/bash -G noc priya
netadmin@jump01:~$ id ravi
uid=1002(ravi) gid=1003(ravi) groups=1003(ravi),1002(noc)
netadmin@jump01:~$ getent passwd ravi
ravi:x:1002:1003::/home/ravi:/bin/bash
netadmin@jump01:~$ ls -l /home
total 12
drwxr-x---  2 netadmin netadmin   4096 Sep 29 09:00 netadmin
drwxr-x---  2 priya    priya      4096 Sep 29 09:00 priya
drwxr-x---  2 ravi     ravi       4096 Sep 29 09:00 ravi</pre>
<p>The options of <code>useradd</code> that matter:</p>
<table class="cmp"><tr><th>Option</th><th>Meaning</th></tr>
<tr><td><code>-m</code></td><td>create the home directory (without it the user has none)</td></tr>
<tr><td><code>-s /bin/bash</code></td><td>login shell (the default can be the limited <code>sh</code>)</td></tr>
<tr><td><code>-G noc</code></td><td>supplementary groups; separate several with commas</td></tr>
<tr><td><code>-g group</code></td><td>main group (usually leave this alone)</td></tr>
<tr><td><code>-c "Ravi Kumar"</code></td><td>comment, the full name</td></tr></table>
<p>The output confirms: Ravi has UID 1002, his own private group <code>ravi</code>, and extra membership in <code>noc</code>. His home is created with mode <code>drwxr-x---</code>, so other users cannot browse it.</p>

<h3>2. Set the password</h3>
<pre class="out">netadmin@jump01:~$ sudo passwd ravi
passwd: password updated successfully</pre>
<p>The command asks twice for the new password (nothing is displayed as you type). A new account created with <code>useradd</code> has <b>no usable password</b> and cannot log in until one is set. Use a strong temporary password, give it through a safe channel, and ask the person to change it at first login. In the labs the placeholder passwords are only for practice. Never reuse them anywhere real.</p>

<h3>3. Change membership: usermod -aG</h3>
<pre class="out">netadmin@jump01:~$ sudo usermod -aG sudo priya
netadmin@jump01:~$ id priya
uid=1003(priya) gid=1004(priya) groups=1004(priya),27(sudo),1002(noc)</pre>
<p><code>-G</code> sets the <b>complete</b> list of supplementary groups, so <code>usermod -G sudo priya</code> would <b>remove</b> her from <code>noc</code>. The <code>-a</code> (append) makes it add instead. <b>Always write <code>-aG</code> together.</b> To take a user out of a group:</p>
<pre class="out">netadmin@jump01:~$ sudo gpasswd -d ravi netbackup
Removing user ravi from group netbackup
netadmin@jump01:~$ id ravi
uid=1002(ravi) gid=1003(ravi) groups=1003(ravi)</pre>
<p><b>A new login is needed.</b> Group membership is read when the person logs in. If Ravi already has a session open when you add him to a group, his running shell still shows the old groups. He must log out and in again (or use <code>su - ravi</code>, which starts a fresh login). This explains many "I was added but it still fails" tickets.</p>

<h3>4. Lock, then remove</h3>
<pre class="out">netadmin@jump01:~$ sudo passwd -l priya
passwd: password changed.
netadmin@jump01:~$ sudo userdel priya
netadmin@jump01:~$ getent passwd priya
netadmin@jump01:~$ sudo userdel -r ravi
netadmin@jump01:~$ ls /home
netadmin  priya</pre>
<p><code>passwd -l</code> <b>locks</b> the password: the account stays, but password login stops. This is the safe first step when someone leaves, because it keeps files and history. <code>userdel priya</code> removes the account but <b>keeps</b> the home directory (see <code>/home/priya</code> still there). <code>userdel -r ravi</code> removes the account <b>and</b> the home directory. Back up what the team may need before using <code>-r</code>.</p>
<p>The simulator also protects you from mistakes in the same way a real server does:</p>
<pre class="out">netadmin@jump01:~$ sudo useradd -m ravi
useradd: user 'ravi' already exists</pre>

<p><b>Reference commands (not run in the simulator):</b> the next tools you will meet on real servers.</p>
<pre class="code">sudo adduser ravi                    # Debian/Ubuntu friendly wrapper: asks questions
sudo chage -l ravi                   # show password ageing rules
sudo chage -d 0 ravi                 # force a password change at next login
sudo chsh -s /usr/sbin/nologin ravi  # block interactive login but keep the account
sudo usermod -L ravi                 # lock (same idea as passwd -l)
sudo usermod -U ravi                 # unlock
sudo groupdel noc                    # remove a group
# Red Hat family (RHEL, Rocky, Alma): the admin group is wheel, not sudo
sudo usermod -aG wheel priya
sudo dnf install package             # instead of apt</pre>

<div class="warn"><p><b>Common mistakes.</b> (1) <code>usermod -G</code> without <code>-a</code>: the user silently loses other groups. (2) Forgetting <code>-m</code>, so the user has no home. (3) <code>userdel -r</code> before saving files that the team needs. (4) Deleting an account while keeping a shared password; lock, then delete once ownership is reassigned. (5) Not using a new login after a group change.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>usermod -aG</code> appends; <code>usermod -G</code> replaces. <code>userdel</code> keeps the home; <code>userdel -r</code> removes it. <code>passwd -l</code> locks. Ubuntu admin group: <code>sudo</code>; RHEL: <code>wheel</code>.</p></div>

<div class="scn"><h4>Added, but still denied</h4><p>Ravi was added to group <code>netbackup</code> and still got "Permission denied" on the backup share. His terminal session had been open since morning. After he logged out and in, <code>id</code> showed the group and the job worked. The engineer who added him also checked with <code>su - ravi</code> to prove it.</p><p><b>Lesson:</b> groups are read at login; test in a fresh login.</p></div>

<div class="iv"><p class="q">"A new engineer joins the NOC. How do you onboard them on Linux?"</p><p>I create their named account with <code>useradd -m -s /bin/bash -G noc name</code>, set a temporary password with <code>passwd</code> and force a change at first login, and give only the groups they need with <code>usermod -aG</code>. I verify with <code>id</code> and by logging in as them. When they leave I lock the account first, move their files, then remove it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>groupadd</code> then <code>useradd -m -s /bin/bash -G group name</code> then <code>passwd name</code>.</li>
<li>Always <code>usermod -aG</code>; plain <code>-G</code> replaces the group list.</li>
<li>Group changes need a new login; verify with <code>id</code> and <code>su - name</code>.</li>
<li>Offboard in steps: lock, back up, <code>userdel</code> (use <code>-r</code> only when the home is no longer needed).</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> onboarding aur offboarding routine NOC kaam hai: naya engineer judta hai, koi team badalta hai, koi chhodta hai. Har step <code>sudo</code> ke saath ek chhota command hai. Paanch kriyaayen seekho: <b>group jodo, user jodo, password set karo, membership badlo, hatao</b>.</p>

<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="User life cycle">
<rect x="10" y="30" width="110" height="50" rx="10" fill="#bbf7d0"/><text x="65" y="60" text-anchor="middle" class="svg-ink" font-size="13">groupadd</text>
<rect x="140" y="30" width="110" height="50" rx="10" fill="#bae6fd"/><text x="195" y="60" text-anchor="middle" class="svg-ink" font-size="13">useradd</text>
<rect x="270" y="30" width="110" height="50" rx="10" fill="#fde68a"/><text x="325" y="60" text-anchor="middle" class="svg-ink" font-size="13">passwd</text>
<rect x="400" y="30" width="110" height="50" rx="10" fill="#e9d5ff"/><text x="455" y="60" text-anchor="middle" class="svg-ink" font-size="13">usermod</text>
<rect x="530" y="30" width="100" height="50" rx="10" fill="#fecaca"/><text x="580" y="60" text-anchor="middle" class="svg-ink" font-size="13">userdel</text>
<line x1="120" y1="55" x2="140" y2="55" stroke="#64748b" stroke-width="2"/><line x1="250" y1="55" x2="270" y2="55" stroke="#64748b" stroke-width="2"/><line x1="380" y1="55" x2="400" y2="55" stroke="#64748b" stroke-width="2"/><line x1="510" y1="55" x2="530" y2="55" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Banao, secure karo, badlo, hatao.</p></div>

<h3>1. Pehle group, phir users</h3>
<pre class="out">netadmin@jump01:~$ sudo groupadd noc
netadmin@jump01:~$ getent group noc
noc:x:1002:
netadmin@jump01:~$ sudo useradd -m -s /bin/bash -G noc ravi
netadmin@jump01:~$ sudo useradd -m -s /bin/bash -G noc priya
netadmin@jump01:~$ id ravi
uid=1002(ravi) gid=1003(ravi) groups=1003(ravi),1002(noc)
netadmin@jump01:~$ getent passwd ravi
ravi:x:1002:1003::/home/ravi:/bin/bash
netadmin@jump01:~$ ls -l /home
total 12
drwxr-x---  2 netadmin netadmin   4096 Sep 29 09:00 netadmin
drwxr-x---  2 priya    priya      4096 Sep 29 09:00 priya
drwxr-x---  2 ravi     ravi       4096 Sep 29 09:00 ravi</pre>
<p><code>useradd</code> ke zaroori options:</p>
<table class="cmp"><tr><th>Option</th><th>Matlab</th></tr>
<tr><td><code>-m</code></td><td>home directory banao (iske bina user ki home nahi hoti)</td></tr>
<tr><td><code>-s /bin/bash</code></td><td>login shell (default seemit <code>sh</code> ho sakta hai)</td></tr>
<tr><td><code>-G noc</code></td><td>supplementary groups; kai ho to comma se alag karo</td></tr>
<tr><td><code>-g group</code></td><td>main group (aam taur par chhod do)</td></tr>
<tr><td><code>-c "Ravi Kumar"</code></td><td>comment, poora naam</td></tr></table>
<p>Output confirm karta hai: Ravi ka UID 1002, apna private group <code>ravi</code>, aur <code>noc</code> mein extra membership hai. Uski home <code>drwxr-x---</code> mode se bani, isliye doosre users use browse nahi kar sakte.</p>

<h3>2. Password set karo</h3>
<pre class="out">netadmin@jump01:~$ sudo passwd ravi
passwd: password updated successfully</pre>
<p>Command naya password do baar maangta hai (type karte waqt kuch dikhta nahi). <code>useradd</code> se bane naye account ka <b>koi chalne wala password nahi</b> hota aur woh password set hone tak login nahi kar sakta. Strong temporary password do, safe channel se bhejo, aur pehle login par badalne ko kaho. Labs ke placeholder passwords sirf practice ke liye hain. Unhe kisi asli jagah kabhi reuse mat karo.</p>

<h3>3. Membership badlo: usermod -aG</h3>
<pre class="out">netadmin@jump01:~$ sudo usermod -aG sudo priya
netadmin@jump01:~$ id priya
uid=1003(priya) gid=1004(priya) groups=1004(priya),27(sudo),1002(noc)</pre>
<p><code>-G</code> supplementary groups ki <b>poori</b> list set karta hai, isliye <code>usermod -G sudo priya</code> use <code>noc</code> se <b>hata</b> deta. <code>-a</code> (append) ise jodne wala bana deta hai. <b><code>-aG</code> hamesha saath likho.</b> User ko group se nikalne ke liye:</p>
<pre class="out">netadmin@jump01:~$ sudo gpasswd -d ravi netbackup
Removing user ravi from group netbackup
netadmin@jump01:~$ id ravi
uid=1002(ravi) gid=1003(ravi) groups=1003(ravi)</pre>
<p><b>Naya login chahiye.</b> Group membership login ke time padhi jaati hai. Ravi ka session pehle se khula ho aur aap use group mein jodo, to uska chalta shell abhi purani groups dikhata hai. Use logout karke dobara login karna hoga (ya <code>su - ravi</code>, jo fresh login shuru karta hai). Isi se bahut saare "add kiya par abhi bhi fail" tickets samajh aate hain.</p>

<h3>4. Lock karo, phir hatao</h3>
<pre class="out">netadmin@jump01:~$ sudo passwd -l priya
passwd: password changed.
netadmin@jump01:~$ sudo userdel priya
netadmin@jump01:~$ getent passwd priya
netadmin@jump01:~$ sudo userdel -r ravi
netadmin@jump01:~$ ls /home
netadmin  priya</pre>
<p><code>passwd -l</code> password ko <b>lock</b> karta hai: account rehta hai, par password login band. Jab koi chhodta hai to yeh safe pehla step hai, kyunki files aur history bachi rehti hain. <code>userdel priya</code> account hatata hai par home directory <b>rakhta</b> hai (<code>/home/priya</code> abhi bhi hai). <code>userdel -r ravi</code> account <b>aur</b> home dono hatata hai. <code>-r</code> se pehle woh backup lo jo team ko chahiye.</p>
<p>Simulator galtiyon se waise hi bachata hai jaise real server:</p>
<pre class="out">netadmin@jump01:~$ sudo useradd -m ravi
useradd: user 'ravi' already exists</pre>

<p><b>Reference commands (simulator mein nahi chalte):</b> real servers par milne wale agle tools.</p>
<pre class="code">sudo adduser ravi                    # Debian/Ubuntu ka friendly wrapper: sawal puchhta hai
sudo chage -l ravi                   # password ageing rules dikhao
sudo chage -d 0 ravi                 # agle login par password badalna zaroori karo
sudo chsh -s /usr/sbin/nologin ravi  # interactive login band, account rakho
sudo usermod -L ravi                 # lock (passwd -l jaisa)
sudo usermod -U ravi                 # unlock
sudo groupdel noc                    # group hatao
# Red Hat family (RHEL, Rocky, Alma): admin group wheel hai, sudo nahi
sudo usermod -aG wheel priya
sudo dnf install package             # apt ki jagah</pre>

<div class="warn"><p><b>Aam galtiyan.</b> (1) <code>-a</code> ke bina <code>usermod -G</code>: user chupchap baaki groups kho deta hai. (2) <code>-m</code> bhoolna, to user ki home nahi. (3) Team ko jo files chahiye unhe save kiye bina <code>userdel -r</code>. (4) Shared password rakhkar account delete karna; pehle lock, ownership reassign hone ke baad delete. (5) Group change ke baad naya login use na karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>usermod -aG</code> append karta hai; <code>usermod -G</code> replace. <code>userdel</code> home rakhta hai; <code>userdel -r</code> hatata hai. <code>passwd -l</code> lock karta hai. Ubuntu ka admin group: <code>sudo</code>; RHEL: <code>wheel</code>.</p></div>

<div class="scn"><h4>Jod diya, phir bhi denied</h4><p>Ravi ko group <code>netbackup</code> mein jodha gaya aur backup share par phir bhi "Permission denied" mila. Uska terminal session subah se khula tha. Logout aur login ke baad <code>id</code> ne group dikhaya aur job chal gayi. Jodne wale engineer ne <code>su - ravi</code> se bhi saabit kiya.</p><p><b>Lesson:</b> groups login par padhi jaati hain; fresh login mein test karo.</p></div>

<div class="iv"><p class="q">"NOC mein naya engineer judta hai. Linux par onboard kaise karoge?"</p><p>Main <code>useradd -m -s /bin/bash -G noc name</code> se unka named account banata hoon, <code>passwd</code> se temporary password set karta hoon aur pehle login par badalna zaroori karta hoon, aur <code>usermod -aG</code> se sirf wahi groups deta hoon jo chahiye. <code>id</code> se aur unke roop mein login karke verify karta hoon. Jab woh chhodte hain to pehle account lock karta hoon, files move karta hoon, phir hatata hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>groupadd</code>, phir <code>useradd -m -s /bin/bash -G group name</code>, phir <code>passwd name</code>.</li>
<li>Hamesha <code>usermod -aG</code>; sirf <code>-G</code> group list replace karta hai.</li>
<li>Group changes ko naya login chahiye; <code>id</code> aur <code>su - name</code> se verify karo.</li>
<li>Offboard steps mein: lock, backup, <code>userdel</code> (<code>-r</code> tab jab home ki zaroorat na ho).</li>
</ul></div>
`}};export{e as default};