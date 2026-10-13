var e={id:`summary`,h:{en:`Summary and exam checklist: SSH on one page`,hi:`Summary aur exam checklist: SSH ek page par`},body:{en:`
<p>You began by typing a password into a prompt and ended by hardening a jump host and fixing a lockout. This chapter puts SSH on one page: what you can do, the words to know, the facts that interviews repeat, and a cheat sheet for your first weeks.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Explain the client (<code>ssh</code>) and server (<code>sshd</code>) roles and the port 22 default.</li>
<li>Accept a first host key, find it in <code>~/.ssh/known_hosts</code>, and remove an old entry with <code>ssh-keygen -R</code>.</li>
<li>Create a key pair with <code>ssh-keygen -t ed25519</code> and say which half is secret.</li>
<li>Install a public key with <code>ssh-copy-id</code> and verify with a login that asks for no password.</li>
<li>Set modes 700 on <code>.ssh</code> and 600 on <code>authorized_keys</code> and private keys.</li>
<li>Write a <code>~/.ssh/config</code> entry and reach a router through a jump host.</li>
<li>Run a remote command with <code>ssh host cmd</code> and copy files with <code>scp</code> (capital <code>-P</code> for the port).</li>
<li>Harden sshd: keys only, no root login, <code>AllowGroups</code>; validate with <code>sshd -t</code>; reload; test from a second window.</li>
<li>Diagnose timed out, refused and denied, and read <code>/var/log/auth.log</code>.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>sshd</dt><dd>The SSH server daemon that listens on port 22.</dd>
<dt>Host key</dt><dd>The server's identity; the client remembers it in known_hosts.</dd>
<dt>Key pair</dt><dd>A private key (secret) and a public key (shareable).</dd>
<dt>authorized_keys</dt><dd>The file of public keys allowed to log in as that user.</dd>
<dt>Jump host</dt><dd>A hardened server you pass through to reach inside networks.</dd>
<dt>Drop-in file</dt><dd>A small config file in sshd_config.d that overrides the main file.</dd>
</dl>

<h3>Facts interviews and exams repeat</h3>
<table class="cmp"><thead><tr><th>Question</th><th>Answer</th></tr></thead><tbody>
<tr><td>Which key file is secret?</td><td>The one without .pub, for example id_ed25519</td></tr>
<tr><td>Where are trusted servers stored?</td><td>~/.ssh/known_hosts on the client</td></tr>
<tr><td>Where are allowed keys stored?</td><td>~/.ssh/authorized_keys on the server</td></tr>
<tr><td>Port flag for ssh and scp?</td><td>ssh uses -p, scp uses -P</td></tr>
<tr><td>Check config syntax?</td><td>sudo sshd -t (silent = valid)</td></tr>
<tr><td>Show effective settings?</td><td>sudo sshd -T</td></tr>
<tr><td>Timed out vs refused?</td><td>No answer vs port closed</td></tr>
</tbody></table>

<h3>Cheat sheet</h3>
<pre class="code">ssh-keygen -t ed25519          <span class="c"># make a key pair</span>
ssh-copy-id user@host          <span class="c"># install the public key</span>
ssh-keygen -R host             <span class="c"># forget an old host key</span>
ssh host hostname              <span class="c"># run one command remotely</span>
scp file host:/tmp/            <span class="c"># copy up</span>
sudo sshd -t                   <span class="c"># validate server config</span>
sudo systemctl reload ssh      <span class="c"># apply without dropping sessions</span>
sudo grep -i refused /var/log/auth.log   <span class="c"># why the server said no</span></pre>

<div class="warn"><p><b>Defensive reminder.</b> Everything here is for systems you own or are authorised to manage. Never share a private key, and never leave password login open on an internet-facing host.</p></div>
<div class="exam"><p><b>Exam trap.</b> Public key goes to the server; private key never leaves the client. Mixing these up is the most common wrong answer.</p></div>

<div class="scn"><h4>New joiner, day one</h4><p>A new engineer must reach R1 through JUMP01 without passwords. You generate her key, install it with ssh-copy-id, add a config entry with the jump setting, and she runs one command. Nothing was shared except a public key.</p></div>

<div class="iv"><p class="q">"Explain how SSH key authentication works in two sentences."</p><p>The client holds a private key and the server holds the matching public key in authorized_keys. The server challenges the client to prove it owns the private key, so no password and no secret crosses the network.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Keys beat passwords; protect the private key.</li>
<li>Modes matter: 700 and 600.</li>
<li>Validate, reload, test in a second window.</li>
<li>Read the server log before changing anything.</li>
</ul></div>
`,hi:`
<p>Aapne shuruaat prompt mein password type karke ki thi aur ant jump host ko harden karke aur lockout fix karke kiya. Yeh chapter SSH ko ek page par rakhta hai: aap kya kar sakte ho, jaanne wale shabd, woh facts jo interviews doharate hain, aur pehle hafton ke liye cheat sheet.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Client (<code>ssh</code>) aur server (<code>sshd</code>) ke roles aur port 22 default samjhao.</li>
<li>Pehli host key accept karo, use <code>~/.ssh/known_hosts</code> mein dhundo, aur purani entry <code>ssh-keygen -R</code> se hatao.</li>
<li><code>ssh-keygen -t ed25519</code> se key pair banao aur batao kaunsa half secret hai.</li>
<li><code>ssh-copy-id</code> se public key install karo aur bina password wale login se verify karo.</li>
<li><code>.ssh</code> par mode 700 aur <code>authorized_keys</code> tatha private keys par 600 set karo.</li>
<li><code>~/.ssh/config</code> entry likho aur jump host ke through router tak pahucho.</li>
<li><code>ssh host cmd</code> se remote command chalao aur <code>scp</code> se files copy karo (port ke liye capital <code>-P</code>).</li>
<li>sshd harden karo: sirf keys, root login nahi, <code>AllowGroups</code>; <code>sshd -t</code> se validate; reload; doosri window se test.</li>
<li>Timed out, refused aur denied diagnose karo, aur <code>/var/log/auth.log</code> padho.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>sshd</dt><dd>SSH server daemon jo port 22 par sunta hai.</dd>
<dt>Host key</dt><dd>Server ki pehchaan; client use known_hosts mein yaad rakhta hai.</dd>
<dt>Key pair</dt><dd>Private key (secret) aur public key (share ho sakti hai).</dd>
<dt>authorized_keys</dt><dd>Us user ke roop mein login ki ijazat wali public keys ki file.</dd>
<dt>Jump host</dt><dd>Hardened server jisse guzarkar andar ke networks tak pahunchte hain.</dd>
<dt>Drop-in file</dt><dd>sshd_config.d ki chhoti config file jo main file ko override karti hai.</dd>
</dl>

<h3>Interviews aur exams ke repeat facts</h3>
<table class="cmp"><thead><tr><th>Sawal</th><th>Jawab</th></tr></thead><tbody>
<tr><td>Kaunsi key file secret hai?</td><td>Jis par .pub nahi, jaise id_ed25519</td></tr>
<tr><td>Trusted servers kahan store hote hain?</td><td>Client par ~/.ssh/known_hosts</td></tr>
<tr><td>Allowed keys kahan store hoti hain?</td><td>Server par ~/.ssh/authorized_keys</td></tr>
<tr><td>ssh aur scp ka port flag?</td><td>ssh mein -p, scp mein -P</td></tr>
<tr><td>Config syntax check?</td><td>sudo sshd -t (silent = valid)</td></tr>
<tr><td>Effective settings dikhao?</td><td>sudo sshd -T</td></tr>
<tr><td>Timed out vs refused?</td><td>Jawab nahi vs port band</td></tr>
</tbody></table>

<h3>Cheat sheet</h3>
<pre class="code">ssh-keygen -t ed25519          <span class="c"># key pair banao</span>
ssh-copy-id user@host          <span class="c"># public key install karo</span>
ssh-keygen -R host             <span class="c"># purani host key bhulao</span>
ssh host hostname              <span class="c"># ek command remotely chalao</span>
scp file host:/tmp/            <span class="c"># upar copy</span>
sudo sshd -t                   <span class="c"># server config validate</span>
sudo systemctl reload ssh      <span class="c"># sessions kaate bina apply</span>
sudo grep -i refused /var/log/auth.log   <span class="c"># server ne mana kyun kiya</span></pre>

<div class="warn"><p><b>Defensive reminder.</b> Yeh sab un systems ke liye hai jo aapke hain ya jinhe manage karne ki aapko ijazat hai. Private key kabhi share mat karo, aur internet-facing host par password login khula mat chhodo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Public key server par jaati hai; private key client se kabhi bahar nahi jaati. Inhe ulta karna sabse common galat jawab hai.</p></div>

<div class="scn"><h4>Naya joiner, pehla din</h4><p>Ek nayi engineer ko bina passwords ke JUMP01 ke through R1 tak pahunchna hai. Aap uski key generate karte ho, ssh-copy-id se install karte ho, jump setting wali config entry jodte ho, aur woh ek command chalati hai. Sirf ek public key share hui.</p></div>

<div class="iv"><p class="q">"SSH key authentication do sentences mein samjhao."</p><p>Client ke paas private key hoti hai aur server ke paas authorized_keys mein matching public key. Server client ko challenge karta hai ki woh private key ka malik hai, isliye na password na koi secret network par jaata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Keys passwords se behtar; private key ki hifazat karo.</li>
<li>Modes matter: 700 aur 600.</li>
<li>Validate, reload, doosri window mein test.</li>
<li>Kuch badalne se pehle server log padho.</li>
</ul></div>
`}};export{e as default};