var e={id:`daemon-config`,h:{en:`Reading a daemon config file: directives, comments and reload`,hi:`Daemon config file padhna: directives, comments aur reload`},body:{en:`
<p>Services on Linux, called <b>daemons</b>, are configured with plain text files, mostly under <code>/etc</code>. A router has one running-config. A Linux server has one small file per service. Once you can read one, you can read them all: sshd, rsyslog, chrony, nginx and more.</p>

<h3>Analogy: a settings page written as text</h3>
<p>Think of the settings page of your Wi-Fi router, but saved as a text file. Each line is one setting. The service reads the file when it starts, so <b>editing the file changes nothing until the service re-reads it</b>.</p>

<h3>What a config file looks like</h3>
<pre class="out"># /etc/ssh/sshd_config  (shortened)
Port 22
PermitRootLogin no
PasswordAuthentication yes
Include /etc/ssh/sshd_config.d/*.conf</pre>
<ul>
<li>A line starting with <code>#</code> is a <b>comment</b>, ignored by the service. Admins also comment a line out to disable it.</li>
<li>Most lines are a <b>directive</b>: a name and a value, such as <code>Port 22</code>.</li>
<li><code>Include</code> pulls in more files, usually from a folder ending in <code>.d</code>. Small files in that folder override or extend the main one.</li>
<li>Blank lines are ignored. Spelling and capital letters matter.</li>
</ul>
<p>Different daemons have different styles, but the idea is the same. The rsyslog file uses a more structured form:</p>
<pre class="out"># /etc/rsyslog.d/10-receiver.conf
module(load="imudp")
input(type="imudp" port="514")</pre>
<p>Read it like a sentence: "load the UDP input module, and listen on port 514". That is how a Linux box becomes a syslog server for your routers.</p>

<h3>Show only the active lines</h3>
<pre class="code">$ grep -v '^#' /etc/ssh/sshd_config | grep -v '^$'</pre>
<p>The first <code>grep -v</code> hides comment lines, the second hides blank lines. You see only the settings that really apply.</p>

<h3>The safe edit routine</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Safe config edit routine">
<rect x="10" y="25" width="110" height="46" rx="8" fill="#e2e8f0"/><text x="65" y="53" text-anchor="middle" class="svg-ink" font-size="12">1. Copy .orig</text>
<rect x="135" y="25" width="110" height="46" rx="8" fill="#bae6fd"/><text x="190" y="53" text-anchor="middle" class="svg-ink" font-size="12">2. Edit file</text>
<rect x="260" y="25" width="110" height="46" rx="8" fill="#fde68a"/><text x="315" y="53" text-anchor="middle" class="svg-ink" font-size="12">3. Test syntax</text>
<rect x="385" y="25" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="440" y="53" text-anchor="middle" class="svg-ink" font-size="12">4. Reload</text>
<rect x="510" y="25" width="115" height="46" rx="8" fill="#e2e8f0"/><text x="567" y="53" text-anchor="middle" class="svg-ink" font-size="12">5. Verify</text>
<path class="svg-muted" d="M120 48h15M245 48h15M370 48h15M495 48h15" stroke="currentColor" fill="none"/>
<text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">Keep the old copy, test before you reload, and keep a second session open.</text>
</svg><p class="cap">Five steps that prevent most self-inflicted outages.</p></div>
<pre class="code">$ sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.orig
$ sudo sshd -t                      # test the config: silence means OK
$ sudo systemctl reload ssh         # re-read the file without dropping sessions
$ systemctl status ssh              # confirm it is still active</pre>
<p><b>reload</b> asks the service to re-read its config while keeping current connections. <b>restart</b> stops and starts it. Prefer reload when the service supports it, and always keep one working SSH session open while you change SSH settings.</p>

<h3>When the service will not start</h3>
<p>A typo in a config file is the most common reason. Read the reason instead of guessing:</p>
<pre class="code">$ systemctl status rsyslog
$ journalctl -u rsyslog -n 20</pre>
<p>The log usually names the file and line number of the bad directive.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Editing without a backup copy. (2) Editing the file and forgetting to reload, then wondering why nothing changed. (3) Changing the SSH port or firewall rules while you have only one session open. (4) A directive typed in the wrong file when an <code>Include</code> folder overrides it.</p></div>
<div class="exam"><p><b>Interview trap.</b> "What is the difference between reload and restart?" Reload re-reads the config and keeps the process and connections running; restart stops and starts the service, which drops active connections.</p></div>

<div class="scn"><h4>The syslog server that listened on nothing</h4><p>A new rsyslog server was set up, but the routers' logs never arrived. The engineer had added the receiver lines to the config but never reloaded the service, so it still ran with the old settings. After <code>systemctl reload rsyslog</code> and a check that port 514 was listening, the logs flowed.</p><p><b>Lesson:</b> a config file is a plan; the running service is the reality.</p></div>

<div class="iv"><p class="q">"You changed a service config. What do you do before and after?"</p><p>Before: back up the file and test the syntax. After: reload or restart, check the status and the logs, and confirm with a real test such as a connection or a received message.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Each daemon reads a text config, mostly under /etc.</li>
<li>Lines starting with # are comments; others are directives.</li>
<li>Include folders ending in .d add or override settings.</li>
<li>Back up, test syntax, reload, then verify.</li>
<li>Config changes do nothing until the service re-reads them.</li>
</ul></div>
`,hi:`
<p>Linux ki services, jinhe <b>daemons</b> kehte hain, plain text files se configure hoti hain, zyadatar <code>/etc</code> ke neeche. Router ki ek running-config hoti hai. Linux server par har service ki ek chhoti file hoti hai. Ek padhna aa gaya to sab padh sakte ho: sshd, rsyslog, chrony, nginx aur bhi.</p>

<h3>Analogy: text mein likha settings page</h3>
<p>Apne Wi-Fi router ka settings page socho, lekin text file ki tarah save kiya hua. Har line ek setting hai. Service file ko start hote waqt padhti hai, isliye <b>file edit karne se kuch nahi badalta jab tak service use dobara na padhe</b>.</p>

<h3>Config file kaisi dikhti hai</h3>
<pre class="out"># /etc/ssh/sshd_config  (shortened)
Port 22
PermitRootLogin no
PasswordAuthentication yes
Include /etc/ssh/sshd_config.d/*.conf</pre>
<ul>
<li><code>#</code> se shuru hone wali line <b>comment</b> hai, service use ignore karti hai. Admins kisi line ko disable karne ke liye bhi comment kar dete hain.</li>
<li>Zyadatar lines <b>directive</b> hoti hain: ek naam aur ek value, jaise <code>Port 22</code>.</li>
<li><code>Include</code> aur files khinch leta hai, aksar <code>.d</code> par khatam hone wale folder se. Us folder ki chhoti files main file ko override ya extend karti hain.</li>
<li>Khaali lines ignore hoti hain. Spelling aur capital letters matter karte hain.</li>
</ul>
<p>Alag daemons ka style alag hota hai, par idea wahi hai. rsyslog file thoda structured form use karti hai:</p>
<pre class="out"># /etc/rsyslog.d/10-receiver.conf
module(load="imudp")
input(type="imudp" port="514")</pre>
<p>Ise sentence ki tarah padho: "UDP input module load karo, aur port 514 par suno". Isi tarah Linux box tumhare routers ke liye syslog server banta hai.</p>

<h3>Sirf active lines dikhao</h3>
<pre class="code">$ grep -v '^#' /etc/ssh/sshd_config | grep -v '^$'</pre>
<p>Pehla <code>grep -v</code> comment lines chhupata hai, doosra khaali lines. Sirf woh settings dikhti hain jo sach mein lagu hain.</p>

<h3>Safe edit routine</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Safe config edit routine">
<rect x="10" y="25" width="110" height="46" rx="8" fill="#e2e8f0"/><text x="65" y="53" text-anchor="middle" class="svg-ink" font-size="12">1. .orig copy</text>
<rect x="135" y="25" width="110" height="46" rx="8" fill="#bae6fd"/><text x="190" y="53" text-anchor="middle" class="svg-ink" font-size="12">2. File edit</text>
<rect x="260" y="25" width="110" height="46" rx="8" fill="#fde68a"/><text x="315" y="53" text-anchor="middle" class="svg-ink" font-size="12">3. Syntax test</text>
<rect x="385" y="25" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="440" y="53" text-anchor="middle" class="svg-ink" font-size="12">4. Reload</text>
<rect x="510" y="25" width="115" height="46" rx="8" fill="#e2e8f0"/><text x="567" y="53" text-anchor="middle" class="svg-ink" font-size="12">5. Verify</text>
<path class="svg-muted" d="M120 48h15M245 48h15M370 48h15M495 48h15" stroke="currentColor" fill="none"/>
<text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">Purani copy rakho, reload se pehle test karo, aur doosra session khula rakho.</text>
</svg><p class="cap">Paanch steps jo zyadatar khud ki banayi outages rokte hain.</p></div>
<pre class="code">$ sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.orig
$ sudo sshd -t                      # test the config: silence means OK
$ sudo systemctl reload ssh         # re-read the file without dropping sessions
$ systemctl status ssh              # confirm it is still active</pre>
<p><b>reload</b> service se kehta hai ki config dobara padho aur maujooda connections rakho. <b>restart</b> use stop aur start karta hai. Jahan service support kare wahan reload prefer karo, aur SSH settings badalte waqt ek chalta hua SSH session hamesha khula rakho.</p>

<h3>Jab service start na ho</h3>
<p>Config file mein typo sabse aam wajah hai. Andaza lagane ki jagah wajah padho:</p>
<pre class="code">$ systemctl status rsyslog
$ journalctl -u rsyslog -n 20</pre>
<p>Log aksar kharab directive ki file aur line number batata hai.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Backup copy ke bina edit karna. (2) File edit karke reload bhool jaana, phir sochna ki kuch kyun nahi badla. (3) Sirf ek session khula ho aur SSH port ya firewall rules badalna. (4) Directive galat file mein likhna jabki <code>Include</code> folder use override kar deta hai.</p></div>
<div class="exam"><p><b>Interview trap.</b> "reload aur restart mein kya farak hai?" Reload config dobara padhta hai aur process aur connections chalte rehte hain; restart service ko stop aur start karta hai, jisse active connections gir jaate hain.</p></div>

<div class="scn"><h4>Syslog server jo kisi par nahi sun raha tha</h4><p>Naya rsyslog server banaya, par routers ke logs kabhi nahi aaye. Engineer ne config mein receiver lines jod di thi lekin service reload nahi ki, isliye woh purani settings par chal rahi thi. <code>systemctl reload rsyslog</code> aur port 514 listening check karne ke baad logs aane lage.</p><p><b>Lesson:</b> config file ek plan hai; chalti service haqiqat hai.</p></div>

<div class="iv"><p class="q">"Service config badli. Pehle aur baad mein kya karte ho?"</p><p>Pehle: file ka backup aur syntax test. Baad mein: reload ya restart, status aur logs dekho, aur asli test se confirm karo jaise connection ya aaya hua message.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har daemon ek text config padhta hai, zyadatar /etc ke neeche.</li>
<li># wali lines comments hain; baaki directives.</li>
<li>.d par khatam hone wale Include folders settings jodte ya override karte hain.</li>
<li>Backup, syntax test, reload, phir verify.</li>
<li>Config badlav tab tak kuch nahi karta jab tak service use dobara na padhe.</li>
</ul></div>
`}};export{e as default};