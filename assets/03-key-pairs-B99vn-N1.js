var e={id:`key-pairs`,h:{en:`Key pairs: a badge that cannot be copied`,hi:`Key pairs: aisa badge jo copy nahi ho sakta`},body:{en:`
<p>Passwords have three weaknesses: people choose weak ones, people reuse them, and every login sends the password to the server. A <b>key pair</b> fixes all three. It is the single most useful habit you can build as a network engineer, because it lets you log in to hundreds of devices without typing or storing a password, and the same method is used by automation tools later in your career.</p>

<h3>What is a key pair?</h3>
<p>A key pair is two files created together by a mathematical process:</p>
<ul>
<li>The <b>private key</b> stays on your machine and must never be shared, emailed or copied to a server. It is your badge.</li>
<li>The <b>public key</b> can be given to anyone. It is a lock that only your private key can open.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Private key stays on the laptop; public key is placed on the server in authorized_keys; the server challenges the client to prove it holds the private key">
<rect x="15" y="50" width="190" height="100" rx="10" fill="#bbf7d0"/><text x="110" y="78" text-anchor="middle" class="svg-ink" font-size="14">Your workstation</text><text x="110" y="102" text-anchor="middle" class="svg-muted" font-size="12">id_ed25519 (PRIVATE)</text><text x="110" y="122" text-anchor="middle" class="svg-muted" font-size="12">never leaves this machine</text>
<rect x="435" y="50" width="190" height="100" rx="10" fill="#ddd6fe"/><text x="530" y="78" text-anchor="middle" class="svg-ink" font-size="14">Server</text><text x="530" y="102" text-anchor="middle" class="svg-muted" font-size="12">authorized_keys</text><text x="530" y="122" text-anchor="middle" class="svg-muted" font-size="12">holds your PUBLIC key</text>
<line x1="205" y1="85" x2="435" y2="85" stroke="#64748b" stroke-width="2"/><text x="320" y="78" text-anchor="middle" class="svg-accent" font-size="12">1. I want to log in as priya</text>
<line x1="435" y1="115" x2="205" y2="115" stroke="#64748b" stroke-width="2"/><text x="320" y="132" text-anchor="middle" class="svg-accent" font-size="12">2. prove you hold the matching key</text>
<text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="13">3. client proves it; no password crosses the network</text>
</svg><p class="cap">The server never sees your private key; it only checks a proof that you hold it.</p></div>

<h3>Creating a key pair with ssh-keygen</h3>
<p><code>ssh-keygen</code> makes the pair. <code>-t ed25519</code> chooses the key type: ed25519 is modern, small and the recommended default. (RSA with at least 3072 bits is the fallback for old devices that do not support ed25519.) The tool asks for a file name (press Enter for the default) and a <b>passphrase</b>, a password that encrypts the private key file so a stolen laptop does not mean stolen access. Captured from the simulator:</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">ssh-keygen -t ed25519</span>
Generating public/private ed25519 key pair.
Enter file in which to save the key (/home/priya/.ssh/id_ed25519): <span class="c">[Enter]</span>
Created directory '/home/priya/.ssh'.
Enter passphrase for "/home/priya/.ssh/id_ed25519" (empty for no passphrase): <span class="c">[type a passphrase]</span>
Enter same passphrase again:
Your identification has been saved in /home/priya/.ssh/id_ed25519
Your public key has been saved in /home/priya/.ssh/id_ed25519.pub
The key fingerprint is:
SHA256:&lt;fingerprint-placeholder&gt; priya@priya-ws
<span class="c">[a small randomart picture follows; omitted here]</span></pre>
<p>For a real person, use a passphrase. For an unattended automation account, a key without a passphrase is sometimes used, but then the file must be protected very carefully (mode 600, restricted account).</p>

<h3>The two files</h3>
<pre class="out">priya@priya-ws:~$ <span class="hl">ls -l ~/.ssh</span>
total 8
-rw-------  1 priya    priya       178 Sep 29 09:00 <span class="hl">id_ed25519</span>
-rw-r--r--  1 priya    priya        77 Sep 29 09:00 <span class="hl">id_ed25519.pub</span></pre>
<p>Read the permissions. <code>-rw-------</code> (mode 600) on the private key means only priya can read or write it. <code>-rw-r--r--</code> (mode 644) on the public key is fine, because it is public. The <code>.pub</code> file is one line:</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">cat ~/.ssh/id_ed25519.pub</span>
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA...<span class="c">(key data)</span> priya@priya-ws</pre>
<p>Three parts: the key type, the key data, and a comment (here user@machine) that only helps humans recognise it. To compare a key without printing it, ask for its fingerprint:</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">ssh-keygen -lf ~/.ssh/id_ed25519.pub</span>
256 SHA256:&lt;fingerprint-placeholder&gt; priya@priya-ws (ED25519)</pre>
<p>If you run <code>ssh-keygen</code> again with the same name, it asks <code>Overwrite (y/n)?</code>. Answer <b>n</b>: overwriting destroys the old private key, and every server that trusted it would reject you.</p>

<h3>Directory permissions</h3>
<p>The <code>~/.ssh</code> folder itself should be mode 700 (<code>drwx------</code>): only you can enter it. The simulator creates it correctly:</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">ls -ld ~/.ssh</span>
drwx------  2 priya    priya      4096 Sep 29 09:00 /home/priya/.ssh</pre>
<p>If someone loosens these permissions, ssh refuses to use the private key. We use this fact in the troubleshooting chapter.</p>

<h3>Reference commands (not run in the simulator)</h3>
<pre class="code"><span class="c"># change or add a passphrase on an existing key</span>
ssh-keygen -p -f ~/.ssh/id_ed25519
<span class="c"># print the public key again from the private key</span>
ssh-keygen -y -f ~/.ssh/id_ed25519
<span class="c"># load the key into an agent so you type the passphrase once per session</span>
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519</pre>
<p>The agent is a small background helper that holds your decrypted key in memory. It is covered in Chapter 6.</p>

<div class="eg"><p><b>Worked example.</b> Priya creates her ed25519 key with a passphrase. She now has <code>id_ed25519</code> (mode 600, stays on WS01) and <code>id_ed25519.pub</code> (one line she can paste into a ticket or hand to the platform team). Her colleague Ravi has his own pair; their keys are different, so the server can tell them apart and remove one without touching the other.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Sending the wrong file. People email <code>id_ed25519</code> (the private key) by mistake. If you ever shared a private key, treat it as compromised: create a new pair and remove the old public key from every server.</p></div>
<div class="exam"><p><b>Exam trap.</b> Public key = share, private key = secret. The server stores your <i>public</i> key. The client stores your <i>private</i> key. A passphrase protects the private key file, and it is not the same as the account password.</p></div>

<div class="scn"><h4>The laptop in the taxi</h4><p>An engineer left a laptop in a taxi. His SSH private key had a strong passphrase, so the finder could not use it. The security team still removed his public key from the jump host, which took one line to delete, and issued a new pair after he got a replacement laptop. No password had to change on 200 devices.</p><p><b>Lesson:</b> keys can be revoked one person at a time, and a passphrase buys you time.</p></div>

<div class="iv"><p class="q">"Why are SSH keys better than passwords, and what is the passphrase for?"</p><p>With a key pair the private key never leaves my machine and no secret travels over the network; the server just verifies a proof. Keys are long random values, so they cannot be guessed or reused like passwords, and the server can revoke one person by deleting one public key. The passphrase encrypts the private key file, so a stolen laptop or backup does not give access.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A key pair has a private key (secret, mode 600) and a public key (shareable).</li>
<li><code>ssh-keygen -t ed25519</code> creates it; add a passphrase for human accounts.</li>
<li>The server keeps the public key; the client keeps the private key.</li>
<li><code>ssh-keygen -lf file.pub</code> prints a fingerprint to compare keys.</li>
<li>Never overwrite or share the private key; if exposed, replace the pair.</li>
</ul></div>
`,hi:`
<p>Passwords ki teen kamzoriyan hain: log kamzor chunte hain, dohrate hain, aur har login password ko server tak bhejta hai. <b>Key pair</b> teeno theek karta hai. Network engineer ke roop mein yeh sabse kaam ki aadat hai, kyunki isse aap sainkdon devices mein bina password type ya store kiye login kar sakte ho, aur wahi tareeka baad mein automation tools bhi use karte hain.</p>

<h3>Key pair kya hai?</h3>
<p>Key pair do files hain jo ek mathematical process se saath mein banti hain:</p>
<ul>
<li><b>Private key</b> aapki machine par rehti hai aur kabhi share, email ya server par copy nahi karni. Yeh aapka badge hai.</li>
<li><b>Public key</b> kisi ko bhi di ja sakti hai. Yeh ek taala hai jo sirf aapki private key khol sakti hai.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Private key laptop par rehti hai; public key server ke authorized_keys mein rakhi jaati hai; server client se saboot maangta hai ki private key uske paas hai">
<rect x="15" y="50" width="190" height="100" rx="10" fill="#bbf7d0"/><text x="110" y="78" text-anchor="middle" class="svg-ink" font-size="14">Aapka workstation</text><text x="110" y="102" text-anchor="middle" class="svg-muted" font-size="12">id_ed25519 (PRIVATE)</text><text x="110" y="122" text-anchor="middle" class="svg-muted" font-size="12">is machine se bahar nahi jaati</text>
<rect x="435" y="50" width="190" height="100" rx="10" fill="#ddd6fe"/><text x="530" y="78" text-anchor="middle" class="svg-ink" font-size="14">Server</text><text x="530" y="102" text-anchor="middle" class="svg-muted" font-size="12">authorized_keys</text><text x="530" y="122" text-anchor="middle" class="svg-muted" font-size="12">aapki PUBLIC key rakhta hai</text>
<line x1="205" y1="85" x2="435" y2="85" stroke="#64748b" stroke-width="2"/><text x="320" y="78" text-anchor="middle" class="svg-accent" font-size="12">1. main priya ki tarah login karna chahta hoon</text>
<line x1="435" y1="115" x2="205" y2="115" stroke="#64748b" stroke-width="2"/><text x="320" y="132" text-anchor="middle" class="svg-accent" font-size="12">2. sabit karo matching key tumhare paas hai</text>
<text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="13">3. client sabit karta hai; network par koi password nahi jaata</text>
</svg><p class="cap">Server aapki private key kabhi nahi dekhta; woh sirf saboot check karta hai.</p></div>

<h3>ssh-keygen se key pair banana</h3>
<p><code>ssh-keygen</code> pair banata hai. <code>-t ed25519</code> key type chunta hai: ed25519 modern, chhota aur recommended default hai. (Kam se kam 3072 bit RSA un purane devices ke liye fallback hai jo ed25519 support nahi karte.) Tool file name poochta hai (default ke liye Enter) aur ek <b>passphrase</b>, ek password jo private key file ko encrypt karta hai taaki chori hua laptop chori hui access na bane. Simulator se capture kiya:</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">ssh-keygen -t ed25519</span>
Generating public/private ed25519 key pair.
Enter file in which to save the key (/home/priya/.ssh/id_ed25519): <span class="c">[Enter]</span>
Created directory '/home/priya/.ssh'.
Enter passphrase for "/home/priya/.ssh/id_ed25519" (empty for no passphrase): <span class="c">[passphrase type karo]</span>
Enter same passphrase again:
Your identification has been saved in /home/priya/.ssh/id_ed25519
Your public key has been saved in /home/priya/.ssh/id_ed25519.pub
The key fingerprint is:
SHA256:&lt;fingerprint-placeholder&gt; priya@priya-ws
<span class="c">[ek chhoti randomart picture aati hai; yahan omit]</span></pre>
<p>Insaan ke liye passphrase use karo. Unattended automation account ke liye kabhi-kabhi bina passphrase ki key chalti hai, par tab file ko bahut dhyaan se protect karna padta hai (mode 600, restricted account).</p>

<h3>Do files</h3>
<pre class="out">priya@priya-ws:~$ <span class="hl">ls -l ~/.ssh</span>
total 8
-rw-------  1 priya    priya       178 Sep 29 09:00 <span class="hl">id_ed25519</span>
-rw-r--r--  1 priya    priya        77 Sep 29 09:00 <span class="hl">id_ed25519.pub</span></pre>
<p>Permissions padho. Private key par <code>-rw-------</code> (mode 600) matlab sirf priya padh ya likh sakti hai. Public key par <code>-rw-r--r--</code> (mode 644) theek hai, kyunki woh public hai. <code>.pub</code> file ek line ki hai:</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">cat ~/.ssh/id_ed25519.pub</span>
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA...<span class="c">(key data)</span> priya@priya-ws</pre>
<p>Teen hisse: key type, key data, aur ek comment (yahan user@machine) jo sirf insaano ko pehchanne mein madad karta hai. Key print kiye bina compare karne ke liye uska fingerprint maango:</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">ssh-keygen -lf ~/.ssh/id_ed25519.pub</span>
256 SHA256:&lt;fingerprint-placeholder&gt; priya@priya-ws (ED25519)</pre>
<p>Wahi naam dekar <code>ssh-keygen</code> dobara chalao to woh <code>Overwrite (y/n)?</code> poochta hai. <b>n</b> kaho: overwrite karne se purani private key khatam ho jaati hai, aur jis server ne use trust kiya tha woh aapko reject karega.</p>

<h3>Directory permissions</h3>
<p><code>~/.ssh</code> folder khud mode 700 (<code>drwx------</code>) hona chahiye: sirf aap andar aa sakte ho. Simulator ise sahi banata hai:</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">ls -ld ~/.ssh</span>
drwx------  2 priya    priya      4096 Sep 29 09:00 /home/priya/.ssh</pre>
<p>Koi in permissions ko dheela kar de to ssh private key use karne se mana kar deta hai. Yeh baat hum troubleshooting chapter mein use karte hain.</p>

<h3>Reference commands (simulator mein nahi chalte)</h3>
<pre class="code"><span class="c"># maujooda key par passphrase badlo ya jodo</span>
ssh-keygen -p -f ~/.ssh/id_ed25519
<span class="c"># private key se public key dobara print karo</span>
ssh-keygen -y -f ~/.ssh/id_ed25519
<span class="c"># key ko agent mein load karo taaki passphrase session mein ek baar type karni pade</span>
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519</pre>
<p>Agent ek chhota background helper hai jo aapki decrypt ki hui key memory mein rakhta hai. Chapter 6 mein aata hai.</p>

<div class="eg"><p><b>Worked example.</b> Priya passphrase ke saath apni ed25519 key banati hai. Ab uske paas <code>id_ed25519</code> (mode 600, WS01 par rehti hai) aur <code>id_ed25519.pub</code> (ek line jo woh ticket mein paste ya platform team ko de sakti hai) hai. Uske colleague Ravi ka apna pair hai; dono keys alag hain, isliye server unhe alag pehchanta hai aur ek ko doosre ko chhue bina hata sakta hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Galat file bhejna. Log galti se <code>id_ed25519</code> (private key) email kar dete hain. Kabhi private key share ho gayi ho to use compromised maano: naya pair banao aur har server se purani public key hatao.</p></div>
<div class="exam"><p><b>Exam trap.</b> Public key = share, private key = secret. Server aapki <i>public</i> key rakhta hai. Client aapki <i>private</i> key rakhta hai. Passphrase private key file ko protect karta hai, aur account password se alag hai.</p></div>

<div class="scn"><h4>Taxi mein rah gaya laptop</h4><p>Ek engineer apna laptop taxi mein bhool gaya. Uski SSH private key par strong passphrase tha, isliye paane wala use nahi kar paya. Security team ne phir bhi jump host se uski public key hata di, jisme ek line delete karni padi, aur naya laptop milne par naya pair issue kiya. 200 devices par koi password nahi badalna pada.</p><p><b>Lesson:</b> keys ek-ek insaan ke hisaab se revoke ho sakti hain, aur passphrase waqt kharidta hai.</p></div>

<div class="iv"><p class="q">"SSH keys passwords se behtar kyun hain, aur passphrase kis liye hai?"</p><p>Key pair mein private key meri machine se bahar nahi jaati aur network par koi secret nahi chalta; server sirf saboot verify karta hai. Keys lambi random values hain, isliye passwords ki tarah guess ya reuse nahi ho sakti, aur server ek public key delete karke ek insaan ko revoke kar sakta hai. Passphrase private key file ko encrypt karta hai, isliye chori hua laptop ya backup access nahi deta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Key pair mein private key (secret, mode 600) aur public key (shareable) hoti hai.</li>
<li><code>ssh-keygen -t ed25519</code> banata hai; insaani accounts ke liye passphrase lagao.</li>
<li>Server public key rakhta hai; client private key.</li>
<li><code>ssh-keygen -lf file.pub</code> keys compare karne ke liye fingerprint print karta hai.</li>
<li>Private key kabhi overwrite ya share mat karo; expose ho to pair badlo.</li>
</ul></div>
`}};export{e as default};