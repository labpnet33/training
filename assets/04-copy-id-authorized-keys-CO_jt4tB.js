var e={id:`copy-id-authorized-keys`,h:{en:`Installing your public key: ssh-copy-id and authorized_keys`,hi:`Public key install karna: ssh-copy-id aur authorized_keys`},body:{en:`
<p>You now own a key pair, but the jump host does not know your public key yet. To log in without a password, the server needs your public key in one specific file in your home folder: <code>~/.ssh/authorized_keys</code>. This chapter shows the one-command way to put it there, what the file looks like, and the permissions that make the server accept it.</p>

<h3>The easy way: ssh-copy-id</h3>
<p><code>ssh-copy-id USER@HOST</code> logs in with your password one last time, creates <code>~/.ssh</code> on the server if needed, and appends your public key to <code>authorized_keys</code>. Captured from the simulator, from WS01:</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">ssh-copy-id priya@10.99.0.10</span>
/usr/bin/ssh-copy-id: INFO: Source of key(s) to be installed: "/home/priya/.ssh/id_ed25519.pub"
/usr/bin/ssh-copy-id: INFO: attempting to log in with the new key(s), to filter out any that are already installed
/usr/bin/ssh-copy-id: INFO: 1 key(s) remain to be installed -- if you are prompted now it is to install the new keys
priya@10.99.0.10's password: <span class="c">[type the password once]</span>

Number of key(s) added: 1

Now try logging into the machine, with:   "ssh 'priya@10.99.0.10'"
and check to make sure that only the key(s) you wanted were added.</pre>
<p>The line <code>Number of key(s) added: 1</code> is the success signal. Now test, and notice that no password is asked:</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">ssh priya@10.99.0.10 whoami</span>
priya</pre>
<p><code>whoami</code> prints the user name on the remote machine, here priya. A command after the host runs there and returns you to your own prompt, so it is the best test: it proves the login and the remote user in one line.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="ssh-copy-id copies the public key from WS01 into authorized_keys on JUMP01">
<rect x="15" y="40" width="200" height="110" rx="10" fill="#bbf7d0"/><text x="115" y="68" text-anchor="middle" class="svg-ink" font-size="14">WS01 (client)</text><text x="115" y="94" text-anchor="middle" class="svg-muted" font-size="12">id_ed25519      private</text><text x="115" y="114" text-anchor="middle" class="svg-accent" font-size="12">id_ed25519.pub  public</text>
<rect x="425" y="40" width="200" height="110" rx="10" fill="#ddd6fe"/><text x="525" y="68" text-anchor="middle" class="svg-ink" font-size="14">JUMP01 (server)</text><text x="525" y="94" text-anchor="middle" class="svg-muted" font-size="12">/home/priya/.ssh/</text><text x="525" y="114" text-anchor="middle" class="svg-accent" font-size="12">authorized_keys</text>
<line x1="215" y1="100" x2="425" y2="100" stroke="#64748b" stroke-width="2"/><text x="320" y="92" text-anchor="middle" class="svg-accent" font-size="12">ssh-copy-id (password, once)</text>
<text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">afterwards: login with the key, no password</text>
</svg><p class="cap">Only the public key travels. The private key stays on WS01.</p></div>

<h3>Look at authorized_keys on the server</h3>
<p>The file contains exactly your public key line, one line per allowed key:</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">ssh priya@10.99.0.10 cat .ssh/authorized_keys</span>
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA...<span class="c">(key data)</span> priya@priya-ws</pre>
<p>This is the same line as in <code>id_ed25519.pub</code>. To allow a second laptop, append a second line. To revoke someone, delete their line. That is the whole access model: <b>one line, one key, one person or device</b>. Keep the comment at the end meaningful (for example <code>priya@priya-ws</code>), because during an audit it is how you know whose key a line is.</p>

<h3>Permissions: the part that breaks things</h3>
<p>The SSH server is suspicious by design. If other users could edit your <code>authorized_keys</code>, they could add their own key and become you. So <code>sshd</code> checks permissions (a setting called <b>StrictModes</b>) and refuses to use a key file that others can write. Look at what <code>ssh-copy-id</code> created:</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">ssh priya@10.99.0.10 ls -la .ssh</span>
total 4
drwx------  2 priya    priya      4096 Sep 29 09:00 .
drwxr-x---  3 priya    priya      4096 Sep 29 09:00 ..
-rw-------  1 priya    priya        77 Sep 29 09:00 <span class="hl">authorized_keys</span></pre>
<p>Decode the first column. <code>-rw-------</code> is mode <b>600</b>: the owner reads and writes, nobody else has any access. <code>drwx------</code> on the folder is mode <b>700</b>. The home folder is <code>drwxr-x---</code> (750): group may look but not write. The rule of thumb:</p>
<table class="cmp"><tr><th>Path</th><th>Safe mode</th><th>Never</th></tr>
<tr><td>Home folder</td><td>750 or 755</td><td>Writable by group or others</td></tr>
<tr><td><code>~/.ssh</code></td><td>700</td><td>Anything writable by others</td></tr>
<tr><td><code>authorized_keys</code></td><td>600 (644 also accepted)</td><td>666 or 777</td></tr>
<tr><td>Private key</td><td>600</td><td>Readable by others</td></tr>
</table>
<p>Owner matters too: all of these must belong to the user. If an administrator creates the file as root and forgets <code>chown</code>, the login fails.</p>
<p>The fix when permissions are wrong:</p>
<pre class="code">chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
<span class="c"># if the owner is wrong, an administrator runs:</span>
sudo chown priya:priya /home/priya/.ssh/authorized_keys</pre>

<h3>What the server logs</h3>
<p>Every login leaves a line in <code>/var/log/auth.log</code> on the server (readable with <code>sudo</code>). Notice that the key login says <b>publickey</b> where a password login says <b>password</b>:</p>
<pre class="out">netadmin@jump01:~$ <span class="hl">sudo grep priya /var/log/auth.log | tail -5</span>
Sep 29 09:00:30 jump01 sshd[707]: Failed password for priya from 10.99.0.50 port 59139 ssh2
Sep 29 09:00:30 jump01 sshd[708]: <span class="hl">Accepted publickey for priya</span> from 10.99.0.50 port 53376 ssh2: ED25519 SHA256:&lt;fingerprint-placeholder&gt;
Sep 29 09:00:30 jump01 sshd[708]: pam_unix(sshd:session): session opened for user priya(uid=1002) by priya(uid=0)
Sep 29 09:00:30 jump01 sshd[708]: pam_unix(sshd:session): session closed for user priya</pre>
<p>The first line is an earlier wrong-password attempt; the second shows a successful key login with the key's fingerprint. If you ever need proof that a person used a key and not a password, this is where you find it.</p>

<h3>Reference commands (not run in the simulator)</h3>
<pre class="code"><span class="c"># the manual way, when ssh-copy-id is not available</span>
cat ~/.ssh/id_ed25519.pub | ssh priya@10.99.0.10 "mkdir -p ~/.ssh &amp;&amp; chmod 700 ~/.ssh &amp;&amp; cat &gt;&gt; ~/.ssh/authorized_keys &amp;&amp; chmod 600 ~/.ssh/authorized_keys"</pre>

<div class="eg"><p><b>Worked example.</b> Priya runs <code>ssh-copy-id priya@10.99.0.10</code>, types her password once, then <code>ssh priya@10.99.0.10 whoami</code> answers <code>priya</code> instantly. On the jump host the file is mode 600 inside a 700 folder. Her colleague Ravi's login keeps failing because his <code>authorized_keys</code> is mode 666; that story is Chapter 8.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Running <code>chmod 777</code> on anything in <code>.ssh</code> to "make it work". That is exactly what StrictModes rejects. Tighten permissions, do not loosen them.</p></div>
<div class="exam"><p><b>Exam trap.</b> The public key goes to the <b>server's</b> <code>~/.ssh/authorized_keys</code> of the <i>target user</i>. Installing it in the wrong user's home logs in the wrong user, or not at all.</p></div>

<div class="scn"><h4>One audit, forty stale keys</h4><p>During an access review the security team found forty lines in a shared service account's <code>authorized_keys</code> with no comments. Nobody could say whose they were, so all forty were removed and re-issued with named comments. Three engineers lost access for an hour, and the new rule was: one key per person, comment equals owner, and shared accounts are avoided.</p><p><b>Lesson:</b> an authorized_keys file is an access list. Keep it named and reviewed.</p></div>

<div class="iv"><p class="q">"How do you set up passwordless SSH to a server?"</p><p>I generate a key pair with <code>ssh-keygen -t ed25519</code>, run <code>ssh-copy-id user@host</code> to append the public key to the server's <code>~/.ssh/authorized_keys</code>, and test with <code>ssh user@host whoami</code>. I make sure <code>~/.ssh</code> is 700, <code>authorized_keys</code> is 600 and owned by the user, because sshd ignores keys with loose permissions.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ssh-copy-id user@host</code> installs the public key after one password login.</li>
<li><code>~/.ssh/authorized_keys</code> on the server lists the keys allowed in, one per line.</li>
<li>Safe modes: folder 700, authorized_keys 600, owner is the user.</li>
<li>auth.log shows <code>Accepted publickey</code> versus <code>Accepted password</code>.</li>
<li>To revoke access, delete that key's line.</li>
</ul></div>
`,hi:`
<p>Ab aapke paas key pair hai, par jump host abhi aapki public key nahi jaanta. Bina password ke login ke liye server ko aapki public key aapke home folder ki ek khaas file mein chahiye: <code>~/.ssh/authorized_keys</code>. Yeh chapter use wahan rakhne ka ek-command tareeka, file kaisi dikhti hai, aur woh permissions jinse server use accept karta hai, dikhata hai.</p>

<h3>Aasan tareeka: ssh-copy-id</h3>
<p><code>ssh-copy-id USER@HOST</code> aakhri baar aapke password se login karta hai, zaroorat ho to server par <code>~/.ssh</code> banata hai, aur aapki public key <code>authorized_keys</code> mein append karta hai. WS01 se, simulator se capture kiya:</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">ssh-copy-id priya@10.99.0.10</span>
/usr/bin/ssh-copy-id: INFO: Source of key(s) to be installed: "/home/priya/.ssh/id_ed25519.pub"
/usr/bin/ssh-copy-id: INFO: attempting to log in with the new key(s), to filter out any that are already installed
/usr/bin/ssh-copy-id: INFO: 1 key(s) remain to be installed -- if you are prompted now it is to install the new keys
priya@10.99.0.10's password: <span class="c">[password ek baar type karo]</span>

Number of key(s) added: 1

Now try logging into the machine, with:   "ssh 'priya@10.99.0.10'"
and check to make sure that only the key(s) you wanted were added.</pre>
<p><code>Number of key(s) added: 1</code> line success ka signal hai. Ab test karo, aur dekho koi password nahi maanga jaata:</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">ssh priya@10.99.0.10 whoami</span>
priya</pre>
<p><code>whoami</code> remote machine par user name print karta hai, yahan priya. Host ke baad ka command wahan chalta hai aur aapko apne prompt par wapas laata hai, isliye yeh best test hai: ek line mein login aur remote user dono sabit.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="ssh-copy-id public key ko WS01 se JUMP01 ki authorized_keys mein copy karta hai">
<rect x="15" y="40" width="200" height="110" rx="10" fill="#bbf7d0"/><text x="115" y="68" text-anchor="middle" class="svg-ink" font-size="14">WS01 (client)</text><text x="115" y="94" text-anchor="middle" class="svg-muted" font-size="12">id_ed25519      private</text><text x="115" y="114" text-anchor="middle" class="svg-accent" font-size="12">id_ed25519.pub  public</text>
<rect x="425" y="40" width="200" height="110" rx="10" fill="#ddd6fe"/><text x="525" y="68" text-anchor="middle" class="svg-ink" font-size="14">JUMP01 (server)</text><text x="525" y="94" text-anchor="middle" class="svg-muted" font-size="12">/home/priya/.ssh/</text><text x="525" y="114" text-anchor="middle" class="svg-accent" font-size="12">authorized_keys</text>
<line x1="215" y1="100" x2="425" y2="100" stroke="#64748b" stroke-width="2"/><text x="320" y="92" text-anchor="middle" class="svg-accent" font-size="12">ssh-copy-id (password, ek baar)</text>
<text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">uske baad: key se login, password nahi</text>
</svg><p class="cap">Sirf public key travel karti hai. Private key WS01 par rehti hai.</p></div>

<h3>Server par authorized_keys dekho</h3>
<p>File mein bilkul aapki public key ki line hoti hai, har allowed key ki ek line:</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">ssh priya@10.99.0.10 cat .ssh/authorized_keys</span>
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA...<span class="c">(key data)</span> priya@priya-ws</pre>
<p>Yeh wahi line hai jo <code>id_ed25519.pub</code> mein hai. Doosre laptop ko allow karne ke liye doosri line jodo. Kisi ko revoke karne ke liye uski line delete karo. Poora access model yahi hai: <b>ek line, ek key, ek insaan ya device</b>. Aakhir ka comment meaningful rakho (jaise <code>priya@priya-ws</code>), kyunki audit mein isi se pata chalta hai line kiski hai.</p>

<h3>Permissions: jo cheez cheezein todti hai</h3>
<p>SSH server design se shakki hai. Doosre users aapki <code>authorized_keys</code> edit kar sakte to apni key jodkar aap ban sakte the. Isliye <code>sshd</code> permissions check karta hai (setting ka naam <b>StrictModes</b>) aur aisi key file use karne se mana kar deta hai jise doosre likh sakte hon. <code>ssh-copy-id</code> ne jo banaya dekho:</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">ssh priya@10.99.0.10 ls -la .ssh</span>
total 4
drwx------  2 priya    priya      4096 Sep 29 09:00 .
drwxr-x---  3 priya    priya      4096 Sep 29 09:00 ..
-rw-------  1 priya    priya        77 Sep 29 09:00 <span class="hl">authorized_keys</span></pre>
<p>Pehla column decode karo. <code>-rw-------</code> mode <b>600</b> hai: owner padhta aur likhta hai, baaki kisi ko access nahi. Folder par <code>drwx------</code> mode <b>700</b>. Home folder <code>drwxr-x---</code> (750): group dekh sakta hai, likh nahi sakta. Thumb rule:</p>
<table class="cmp"><tr><th>Path</th><th>Safe mode</th><th>Kabhi nahi</th></tr>
<tr><td>Home folder</td><td>750 ya 755</td><td>Group ya others ke liye writable</td></tr>
<tr><td><code>~/.ssh</code></td><td>700</td><td>Others ke liye writable kuch bhi</td></tr>
<tr><td><code>authorized_keys</code></td><td>600 (644 bhi accept)</td><td>666 ya 777</td></tr>
<tr><td>Private key</td><td>600</td><td>Others ke liye readable</td></tr>
</table>
<p>Owner bhi matter karta hai: yeh sab user ke hone chahiye. Administrator file root ke naam se bana de aur <code>chown</code> bhool jaaye to login fail hota hai.</p>
<p>Permissions galat hon to fix:</p>
<pre class="code">chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
<span class="c"># owner galat ho to administrator chalata hai:</span>
sudo chown priya:priya /home/priya/.ssh/authorized_keys</pre>

<h3>Server kya log karta hai</h3>
<p>Har login server ki <code>/var/log/auth.log</code> mein ek line chhodta hai (<code>sudo</code> se padhi jaati hai). Dhyan do key login <b>publickey</b> kehta hai jahan password login <b>password</b>:</p>
<pre class="out">netadmin@jump01:~$ <span class="hl">sudo grep priya /var/log/auth.log | tail -5</span>
Sep 29 09:00:30 jump01 sshd[707]: Failed password for priya from 10.99.0.50 port 59139 ssh2
Sep 29 09:00:30 jump01 sshd[708]: <span class="hl">Accepted publickey for priya</span> from 10.99.0.50 port 53376 ssh2: ED25519 SHA256:&lt;fingerprint-placeholder&gt;
Sep 29 09:00:30 jump01 sshd[708]: pam_unix(sshd:session): session opened for user priya(uid=1002) by priya(uid=0)
Sep 29 09:00:30 jump01 sshd[708]: pam_unix(sshd:session): session closed for user priya</pre>
<p>Pehli line pehle ka galat-password attempt hai; doosri key ke fingerprint ke saath successful key login dikhati hai. Kabhi saboot chahiye ki kisi ne key use ki, password nahi, to yahin milta hai.</p>

<h3>Reference commands (simulator mein nahi chalte)</h3>
<pre class="code"><span class="c"># manual tareeka, jab ssh-copy-id available na ho</span>
cat ~/.ssh/id_ed25519.pub | ssh priya@10.99.0.10 "mkdir -p ~/.ssh &amp;&amp; chmod 700 ~/.ssh &amp;&amp; cat &gt;&gt; ~/.ssh/authorized_keys &amp;&amp; chmod 600 ~/.ssh/authorized_keys"</pre>

<div class="eg"><p><b>Worked example.</b> Priya <code>ssh-copy-id priya@10.99.0.10</code> chalati hai, password ek baar type karti hai, phir <code>ssh priya@10.99.0.10 whoami</code> turant <code>priya</code> jawab deta hai. Jump host par file 700 folder ke andar mode 600 hai. Uske colleague Ravi ka login fail hota rehta hai kyunki uski <code>authorized_keys</code> mode 666 hai; woh kahani Chapter 8 hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> "Chalane" ke liye <code>.ssh</code> ki kisi cheez par <code>chmod 777</code> chalana. StrictModes isi ko reject karta hai. Permissions kasao, dheeli mat karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Public key <i>target user</i> ke <b>server</b> wale <code>~/.ssh/authorized_keys</code> mein jaati hai. Galat user ke home mein install karoge to galat user login hoga, ya bilkul nahi.</p></div>

<div class="scn"><h4>Ek audit, chalis purani keys</h4><p>Access review mein security team ko ek shared service account ki <code>authorized_keys</code> mein chalis lines mili jinpar koi comment nahi tha. Koi nahi bata paya woh kiski hain, isliye chaaliso hata di gayi aur named comments ke saath dobara issue ki gayi. Teen engineers ka access ek ghante ke liye gaya, aur naya rule bana: ek key per insaan, comment barabar owner, aur shared accounts se bacho.</p><p><b>Lesson:</b> authorized_keys ek access list hai. Use named aur reviewed rakho.</p></div>

<div class="iv"><p class="q">"Server par passwordless SSH kaise setup karte ho?"</p><p>Main <code>ssh-keygen -t ed25519</code> se key pair banata hoon, <code>ssh-copy-id user@host</code> se public key server ki <code>~/.ssh/authorized_keys</code> mein append karta hoon, aur <code>ssh user@host whoami</code> se test karta hoon. Dhyan rakhta hoon ki <code>~/.ssh</code> 700 ho, <code>authorized_keys</code> 600 aur user ki owned ho, kyunki sshd dheeli permissions wali keys ignore karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ssh-copy-id user@host</code> ek password login ke baad public key install karta hai.</li>
<li>Server ki <code>~/.ssh/authorized_keys</code> allowed keys ki list hai, ek line per key.</li>
<li>Safe modes: folder 700, authorized_keys 600, owner user.</li>
<li>auth.log <code>Accepted publickey</code> versus <code>Accepted password</code> dikhata hai.</li>
<li>Access revoke karne ke liye us key ki line delete karo.</li>
</ul></div>
`}};export{e as default};