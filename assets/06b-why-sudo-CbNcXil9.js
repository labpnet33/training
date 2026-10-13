var e={id:`why-sudo`,h:{en:`Why sudo? Root, normal users and the Permission denied message`,hi:`sudo kyun? Root, normal users aur Permission denied message`},body:{en:`
<p>Every beginner meets the same wall: a command ends with <b>Permission denied</b> and someone says "just use sudo". Before you type it, understand what it does, because on a production server <code>sudo</code> is a power tool.</p>

<h3>Analogy: the master key and the guest card</h3>
<p>A hotel gives you a guest card that opens your room. The manager has a master key that opens every door. Staff do not carry the master key all day, they borrow it for one job and the front desk logs who took it. <b>root</b> is the master key, your user is the guest card, and <b>sudo</b> is the front desk.</p>

<h3>Who is who</h3>
<pre class="out">netadmin@nms01:~$ whoami
netadmin
netadmin@nms01:~$ sudo whoami
root</pre>
<p>The prompt ends with <code>$</code> for a normal user and <code>#</code> for root, just like <code>&gt;</code> and <code>#</code> on a Cisco router. Root can read, change and delete anything, including the files that make the server boot. A typing mistake as root can wipe a server, so we avoid logging in as root. We borrow its power one command at a time.</p>

<h3>What sudo really does</h3>
<pre class="out">netadmin@nms01:~$ cat /var/log/auth.log
cat: /var/log/auth.log: Permission denied
netadmin@nms01:~$ sudo cat /var/log/auth.log
[sudo] password for netadmin:</pre>
<ul>
<li><code>sudo command</code> runs <b>only that command</b> as root, then you are back to being a normal user.</li>
<li>It asks for <b>your own</b> password, not root's, and remembers it for a few minutes.</li>
<li>Only users in the <code>sudo</code> group (or named in the sudoers rules) may use it.</li>
<li>Every use is written to the log with your real user name, so there is an audit trail.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="sudo flow">
<rect x="15" y="30" width="130" height="50" rx="8" fill="#e2e8f0"/><text x="80" y="60" text-anchor="middle" class="svg-ink" font-size="13">netadmin ($)</text>
<rect x="200" y="30" width="130" height="50" rx="8" fill="#bae6fd"/><text x="265" y="60" text-anchor="middle" class="svg-ink" font-size="13">sudo checks</text>
<rect x="385" y="30" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="440" y="60" text-anchor="middle" class="svg-ink" font-size="13">one command</text>
<rect x="520" y="30" width="105" height="50" rx="8" fill="#fde68a"/><text x="572" y="60" text-anchor="middle" class="svg-ink" font-size="13">as root</text>
<path class="svg-muted" d="M145 55h55M330 55h55M495 55h25" stroke="currentColor" fill="none"/>
<text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">Your password is asked, the use is logged, and you return to a normal user afterwards.</text>
</svg><p class="cap">sudo lends root power for exactly one command.</p></div>

<h3>Permission denied: do you need sudo at all?</h3>
<p>The message does not always mean "use sudo". Ask first:</p>
<table class="cmp">
<tr><th>Situation</th><th>Right move</th></tr>
<tr><td>A system file such as <code>/var/log/auth.log</code> or <code>/etc/...</code></td><td>sudo is normal</td></tr>
<tr><td>Your own script that is not executable</td><td><code>chmod +x</code>, no sudo needed</td></tr>
<tr><td>A shared file in another team's folder</td><td>fix the group or permissions, or ask the owner</td></tr>
<tr><td>You are unsure what the command does</td><td>do not run it with sudo until you know</td></tr>
</table>

<h3>One classic trap: sudo and redirection</h3>
<pre class="code">$ sudo echo "10.99.0.60 nms01" &gt;&gt; /etc/hosts      # FAILS: the redirection runs as you
$ echo "10.99.0.60 nms01" | sudo tee -a /etc/hosts   # works: tee runs as root</pre>
<p>The shell opens the file <b>before</b> sudo starts, as you. Pipe the text into <code>sudo tee</code> so the writing itself is done by root. <code>-a</code> means append.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Running every command with sudo "to be safe". (2) Pasting a command from the internet with sudo in front without reading it. (3) <code>sudo rm -r</code> with a path you have not checked. (4) Using sudo to hide a permission problem you should fix properly.</p></div>
<div class="exam"><p><b>Interview trap.</b> "Why do we use sudo instead of logging in as root?" Least privilege and accountability: only the needed command gets root power, and the log shows who ran it.</p></div>

<div class="scn"><h4>The backup that ran as root</h4><p>A backup script failed with Permission denied, so a colleague ran it with sudo and moved on. The new backup files were owned by root. Next night the normal cron job could not overwrite them and failed again, silently.</p><p><b>Lesson:</b> sudo made one run pass and created a second problem. The real fix was a correct owner and permissions on the backup folder.</p></div>

<div class="iv"><p class="q">"What is the difference between su and sudo?"</p><p><code>su</code> switches to another user and needs that user's password. <code>sudo</code> runs one command with extra rights and needs your own password. Say that sudo is preferred because it is logged and limited.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>$ is a normal user, # is root.</li>
<li>sudo runs one command as root and logs who did it.</li>
<li>It asks for your own password, and only sudo-group users may use it.</li>
<li>Permission denied does not always mean sudo: check ownership and chmod first.</li>
<li>Redirection happens as you; use sudo tee to write to protected files.</li>
</ul></div>
`,hi:`
<p>Har beginner ek hi deewar se takraata hai: command <b>Permission denied</b> par khatam hota hai aur koi kehta hai "bas sudo laga do". Type karne se pehle samjho ki woh kya karta hai, kyunki production server par <code>sudo</code> ek power tool hai.</p>

<h3>Analogy: master key aur guest card</h3>
<p>Hotel aapko guest card deta hai jo sirf aapka room kholta hai. Manager ke paas master key hoti hai jo har darwaza kholti hai. Staff master key poore din nahi rakhta, ek kaam ke liye udhaar leta hai aur front desk likh leta hai ki kisne li. <b>root</b> master key hai, aapka user guest card hai, aur <b>sudo</b> front desk hai.</p>

<h3>Kaun kaun hai</h3>
<pre class="out">netadmin@nms01:~$ whoami
netadmin
netadmin@nms01:~$ sudo whoami
root</pre>
<p>Prompt normal user ke liye <code>$</code> aur root ke liye <code>#</code> par khatam hota hai, bilkul Cisco router ke <code>&gt;</code> aur <code>#</code> jaisa. Root kuch bhi padh, badal aur delete kar sakta hai, un files ko bhi jinse server boot hota hai. Root ke roop mein ek typing galti poora server saaf kar sakti hai, isliye hum root se login nahi karte. Hum uski power ek command ke liye udhaar lete hain.</p>

<h3>sudo asal mein kya karta hai</h3>
<pre class="out">netadmin@nms01:~$ cat /var/log/auth.log
cat: /var/log/auth.log: Permission denied
netadmin@nms01:~$ sudo cat /var/log/auth.log
[sudo] password for netadmin:</pre>
<ul>
<li><code>sudo command</code> <b>sirf wahi command</b> root ke roop mein chalata hai, phir aap wapas normal user ho.</li>
<li>Yeh <b>aapka apna</b> password poochta hai, root ka nahi, aur kuch minute yaad rakhta hai.</li>
<li>Sirf <code>sudo</code> group ke users (ya sudoers rules mein naam wale) ise use kar sakte hain.</li>
<li>Har use aapke asli user name ke saath log mein likha jaata hai, isliye audit trail milta hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="sudo flow">
<rect x="15" y="30" width="130" height="50" rx="8" fill="#e2e8f0"/><text x="80" y="60" text-anchor="middle" class="svg-ink" font-size="13">netadmin ($)</text>
<rect x="200" y="30" width="130" height="50" rx="8" fill="#bae6fd"/><text x="265" y="60" text-anchor="middle" class="svg-ink" font-size="13">sudo check karta hai</text>
<rect x="385" y="30" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="440" y="60" text-anchor="middle" class="svg-ink" font-size="13">ek command</text>
<rect x="520" y="30" width="105" height="50" rx="8" fill="#fde68a"/><text x="572" y="60" text-anchor="middle" class="svg-ink" font-size="13">root ke roop mein</text>
<path class="svg-muted" d="M145 55h55M330 55h55M495 55h25" stroke="currentColor" fill="none"/>
<text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">Password poocha jaata hai, use log hota hai, aur baad mein aap normal user ban jaate ho.</text>
</svg><p class="cap">sudo bilkul ek command ke liye root power udhaar deta hai.</p></div>

<h3>Permission denied: kya sudo ki zaroorat hai bhi?</h3>
<p>Yeh message hamesha "sudo lagao" nahi hota. Pehle poochho:</p>
<table class="cmp">
<tr><th>Situation</th><th>Sahi kadam</th></tr>
<tr><td>System file jaise <code>/var/log/auth.log</code> ya <code>/etc/...</code></td><td>sudo normal hai</td></tr>
<tr><td>Aapki apni script jo executable nahi hai</td><td><code>chmod +x</code>, sudo nahi chahiye</td></tr>
<tr><td>Doosri team ke folder ki shared file</td><td>group ya permissions theek karo, ya owner se poochho</td></tr>
<tr><td>Pata nahi command kya karti hai</td><td>jab tak pata na ho sudo ke saath mat chalao</td></tr>
</table>

<h3>Ek classic jaal: sudo aur redirection</h3>
<pre class="code">$ sudo echo "10.99.0.60 nms01" &gt;&gt; /etc/hosts      # FAILS: the redirection runs as you
$ echo "10.99.0.60 nms01" | sudo tee -a /etc/hosts   # works: tee runs as root</pre>
<p>Shell file ko sudo shuru hone se <b>pehle</b> khol deta hai, aapke roop mein. Text ko <code>sudo tee</code> mein pipe karo taaki likhne ka kaam khud root kare. <code>-a</code> ka matlab append.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) "Safe rehne ke liye" har command sudo se chalana. (2) Internet se paste ki command ko bina padhe sudo ke saath chalana. (3) Jis path ko check nahi kiya uske saath <code>sudo rm -r</code>. (4) Sudo se aisi permission problem chhupana jise sahi tarah theek karna chahiye.</p></div>
<div class="exam"><p><b>Interview trap.</b> "Root se login karne ki jagah sudo kyun?" Least privilege aur accountability: sirf zaroori command ko root power milti hai, aur log batata hai kisne chalayi.</p></div>

<div class="scn"><h4>Woh backup jo root ne chalayi</h4><p>Ek backup script Permission denied se fail hui, to ek colleague ne use sudo se chalaya aur aage badh gaya. Nayi backup files root ki ho gayi. Agli raat normal cron job unhe overwrite nahi kar paya aur chupchaap dobara fail hua.</p><p><b>Lesson:</b> sudo ne ek run pass karayi aur doosri problem bana di. Asli fix backup folder par sahi owner aur permissions the.</p></div>

<div class="iv"><p class="q">"su aur sudo mein kya farak hai?"</p><p><code>su</code> doosre user par switch karta hai aur us user ka password chahiye. <code>sudo</code> ek command ko extra rights se chalata hai aur aapka apna password chahiye. Batao ki sudo preferred hai kyunki woh logged aur limited hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>$ normal user hai, # root hai.</li>
<li>sudo ek command root ke roop mein chalata hai aur log karta hai kisne chalayi.</li>
<li>Yeh aapka apna password poochta hai, aur sirf sudo-group users use kar sakte hain.</li>
<li>Permission denied ka matlab hamesha sudo nahi: pehle ownership aur chmod dekho.</li>
<li>Redirection aapke roop mein hota hai; protected files ke liye sudo tee use karo.</li>
</ul></div>
`}};export{e as default};