var e={id:`troubleshooting`,h:{en:`Troubleshooting SSH: timeout, refused, permission denied`,hi:`SSH troubleshooting: timeout, refused, permission denied`},body:{en:`
<p>"I cannot SSH" is the most common ticket a network team gets. The trick is to read the <b>exact wording</b> of the failure, because each message points at a different layer. This chapter gives a fixed workflow so you never guess.</p>

<h3>Three failures, three layers</h3>
<table class="cmp"><thead><tr><th>Message</th><th>Meaning</th><th>Look at</th></tr></thead><tbody>
<tr><td>Connection timed out</td><td>No answer at all</td><td>Network: route, firewall, wrong IP</td></tr>
<tr><td>Connection refused</td><td>Host answered, nothing listens on the port</td><td>Service: is sshd running, which port</td></tr>
<tr><td>Permission denied (publickey)</td><td>Server reached, login method failed</td><td>Keys, file modes, sshd settings</td></tr>
</tbody></table>
<p>Chapter 2 showed the first two captured in the simulator. Here we focus on the third, because it hides the most surprises.</p>

<h3>The workflow</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Workflow: ping, port test with nc, ssh -v, server log">
<rect x="10" y="40" width="140" height="70" rx="8" fill="#bae6fd"/><text x="80" y="68" text-anchor="middle" class="svg-ink" font-size="12">1 ping</text><text x="80" y="86" text-anchor="middle" class="svg-ink" font-size="12">is the host up?</text>
<rect x="170" y="40" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="240" y="68" text-anchor="middle" class="svg-ink" font-size="12">2 nc -vz host 22</text><text x="240" y="86" text-anchor="middle" class="svg-ink" font-size="12">is the port open?</text>
<rect x="330" y="40" width="140" height="70" rx="8" fill="#fde68a"/><text x="400" y="68" text-anchor="middle" class="svg-ink" font-size="12">3 ssh -v</text><text x="400" y="86" text-anchor="middle" class="svg-ink" font-size="12">client detail</text>
<rect x="490" y="40" width="140" height="70" rx="8" fill="#fed7aa"/><text x="560" y="68" text-anchor="middle" class="svg-ink" font-size="12">4 server log</text><text x="560" y="86" text-anchor="middle" class="svg-ink" font-size="12">auth.log</text>
</svg><p class="cap">Work from the network up to the account. Stop at the first step that fails.</p></div>
<ol>
<li><b>ping</b> the host. No reply may still be fine (ICMP can be blocked), so treat it as a hint only.</li>
<li><b>Test the port</b> with <code>nc -vz host 22</code>. "Connection refused" proves the host is up and sshd is down or on another port.</li>
<li><b>Ask the client</b> with <code>ssh -v</code>, which prints which keys it tries and which methods the server offers.</li>
<li><b>Ask the server</b> by reading <code>/var/log/auth.log</code> with sudo. The server always says why it refused.</li>
</ol>

<h3>Case study: Ravi cannot log in</h3>
<p>Ravi's key was installed correctly, yet login fails after hardening. From WS01:</p>
<pre class="out">netadmin@ws01:~$ <span class="hl">ssh netadmin@10.99.0.10</span>
netadmin@10.99.0.10: Permission denied (publickey).</pre>
<p>The client message is vague on purpose. The server log is not. On JUMP01:</p>
<pre class="out">netadmin@jump01:~$ <span class="hl">sudo grep -i "authentication refused" /var/log/auth.log</span>
Authentication refused: bad ownership or modes for file /home/ravi/.ssh/authorized_keys</pre>
<p>sshd refuses to trust an <code>authorized_keys</code> file that other people can write to, because they could add their own key. The fix is to set the mode to 600 (owner read and write only):</p>
<pre class="code"><span class="c"># owner can read and write; nobody else can do anything</span>
sudo chmod 600 /home/ravi/.ssh/authorized_keys</pre>
<p>After this, Ravi's key login works again. Chapter 4 listed the correct modes: 700 for <code>.ssh</code>, 600 for <code>authorized_keys</code> and private keys.</p>

<h3>Other common causes of Permission denied (publickey)</h3>
<ul>
<li>The public key is not in the right user's <code>authorized_keys</code> (wrong account name).</li>
<li>The home directory or <code>.ssh</code> is writable by others (same "bad ownership or modes").</li>
<li>The user is not in the group listed by <code>AllowGroups</code>.</li>
<li>The client offers a different key than the one installed; use <code>-i</code> to choose.</li>
<li>Passwords were disabled before keys were installed (Chapter 7).</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ticket: "Ravi locked out of JUMP01." You skip guessing. Port test works, so network and sshd are fine. The client says <code>(publickey)</code>, so authentication is the problem. You read auth.log with sudo, find the bad modes line, run <code>chmod 600</code>, and ask Ravi to retry. Total: four commands, one cause.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Re-enabling password login "just to get in" when the real fault is a file mode. That reopens the exact hole the audit closed. Read the log first; fix the cause, not the control.</p></div>
<div class="exam"><p><b>Exam trap.</b> Timed out means no response (network or firewall); refused means a response saying no (service or port). They are not interchangeable.</p></div>

<div class="scn"><h4>Friday 5 pm lockout</h4><p>The on-call engineer sees "Permission denied" for the vendor account and starts editing sshd_config. A colleague stops her and reads auth.log first: the vendor's home folder was set world-writable by a cleanup script. One chmod fixes it. The sshd_config edit would have needed a reload and risked more breakage.</p><p><b>Lesson:</b> read the server log before changing server settings.</p></div>

<div class="iv"><p class="q">"A user says SSH gives Permission denied (publickey). What do you check?"</p><p>I confirm the port is reachable, run <code>ssh -v</code> to see which key is offered, then read <code>/var/log/auth.log</code> on the server. Usual causes are wrong modes on <code>~/.ssh</code> or <code>authorized_keys</code>, the key in the wrong account, or an <code>AllowGroups</code> restriction. I fix the cause rather than re-enabling passwords.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Timeout = network; refused = service; denied = authentication.</li>
<li>Workflow: ping, <code>nc -vz</code>, <code>ssh -v</code>, auth.log.</li>
<li>Bad modes on <code>authorized_keys</code> make sshd ignore the key; use 600.</li>
<li>The server log explains what the client message hides.</li>
</ul></div>
`,hi:`
<p>"Mujhse SSH nahi ho raha" network team ko milne wala sabse common ticket hai. Trick yeh hai ki failure ke <b>exact shabd</b> padho, kyunki har message alag layer ki taraf ishara karta hai. Yeh chapter ek fixed workflow deta hai taaki aap kabhi andaza na lagao.</p>

<h3>Teen failures, teen layers</h3>
<table class="cmp"><thead><tr><th>Message</th><th>Matlab</th><th>Kahan dekho</th></tr></thead><tbody>
<tr><td>Connection timed out</td><td>Koi jawab hi nahi</td><td>Network: route, firewall, galat IP</td></tr>
<tr><td>Connection refused</td><td>Host ne jawab diya, port par kuch sun nahi raha</td><td>Service: sshd chal raha hai? kaunsa port</td></tr>
<tr><td>Permission denied (publickey)</td><td>Server mila, login method fail</td><td>Keys, file modes, sshd settings</td></tr>
</tbody></table>
<p>Chapter 2 mein pehle do simulator se capture karke dikhaye the. Yahan teesre par focus hai, kyunki usmein sabse zyada surprises chhupe hote hain.</p>

<h3>Workflow</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Workflow: ping, nc se port test, ssh -v, server log">
<rect x="10" y="40" width="140" height="70" rx="8" fill="#bae6fd"/><text x="80" y="68" text-anchor="middle" class="svg-ink" font-size="12">1 ping</text><text x="80" y="86" text-anchor="middle" class="svg-ink" font-size="12">host up hai?</text>
<rect x="170" y="40" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="240" y="68" text-anchor="middle" class="svg-ink" font-size="12">2 nc -vz host 22</text><text x="240" y="86" text-anchor="middle" class="svg-ink" font-size="12">port open hai?</text>
<rect x="330" y="40" width="140" height="70" rx="8" fill="#fde68a"/><text x="400" y="68" text-anchor="middle" class="svg-ink" font-size="12">3 ssh -v</text><text x="400" y="86" text-anchor="middle" class="svg-ink" font-size="12">client ki detail</text>
<rect x="490" y="40" width="140" height="70" rx="8" fill="#fed7aa"/><text x="560" y="68" text-anchor="middle" class="svg-ink" font-size="12">4 server log</text><text x="560" y="86" text-anchor="middle" class="svg-ink" font-size="12">auth.log</text>
</svg><p class="cap">Network se account ki taraf badho. Jo pehla step fail ho wahin ruko.</p></div>
<ol>
<li>Host ko <b>ping</b> karo. Reply na aaye tab bhi theek ho sakta hai (ICMP block ho sakta hai), isliye ise sirf hint maano.</li>
<li><code>nc -vz host 22</code> se <b>port test karo</b>. "Connection refused" saabit karta hai ki host up hai aur sshd band hai ya doosre port par hai.</li>
<li><code>ssh -v</code> se <b>client se pucho</b>; woh batata hai kaunsi keys try hui aur server kaunse methods offer karta hai.</li>
<li>sudo se <code>/var/log/auth.log</code> padhkar <b>server se pucho</b>. Server hamesha batata hai ki usne refuse kyun kiya.</li>
</ol>

<h3>Case study: Ravi login nahi kar pa raha</h3>
<p>Ravi ki key sahi install hai, phir bhi hardening ke baad login fail hota hai. WS01 se:</p>
<pre class="out">netadmin@ws01:~$ <span class="hl">ssh netadmin@10.99.0.10</span>
netadmin@10.99.0.10: Permission denied (publickey).</pre>
<p>Client ka message jaanbujhkar vague hai. Server ka log nahi. JUMP01 par:</p>
<pre class="out">netadmin@jump01:~$ <span class="hl">sudo grep -i "authentication refused" /var/log/auth.log</span>
Authentication refused: bad ownership or modes for file /home/ravi/.ssh/authorized_keys</pre>
<p>sshd aisi <code>authorized_keys</code> file par bharosa nahi karta jise doosre log likh sakte hain, kyunki woh apni key jod sakte hain. Fix: mode 600 karo (sirf owner read aur write):</p>
<pre class="code"><span class="c"># owner padh aur likh sakta hai; baaki koi kuch nahi</span>
sudo chmod 600 /home/ravi/.ssh/authorized_keys</pre>
<p>Iske baad Ravi ka key login phir chal jaata hai. Chapter 4 mein sahi modes the: <code>.ssh</code> ke liye 700, <code>authorized_keys</code> aur private keys ke liye 600.</p>

<h3>Permission denied (publickey) ke doosre common kaaran</h3>
<ul>
<li>Public key galat user ki <code>authorized_keys</code> mein hai (account name galat).</li>
<li>Home directory ya <code>.ssh</code> doosron ke liye writable hai (wahi "bad ownership or modes").</li>
<li>User us group mein nahi jo <code>AllowGroups</code> mein listed hai.</li>
<li>Client woh key offer karta hai jo install wali nahi; <code>-i</code> se chuno.</li>
<li>Keys install karne se pehle passwords band kar diye (Chapter 7).</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ticket: "Ravi JUMP01 se locked out." Aap andaza nahi lagate. Port test chalta hai, yaani network aur sshd theek. Client <code>(publickey)</code> kehta hai, yaani authentication ki dikkat. Aap sudo se auth.log padhte ho, bad modes wali line milti hai, <code>chmod 600</code> chalate ho, aur Ravi se retry karne ko kehte ho. Kul: chaar commands, ek kaaran.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> "Bas andar jaane ke liye" password login wapas chalu kar dena jabki asli fault file mode hai. Yeh wahi hole phir khol deta hai jo audit ne band kiya tha. Pehle log padho; control nahi, kaaran fix karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Timed out matlab response nahi (network ya firewall); refused matlab "nahi" kehta response (service ya port). Dono ek jaise nahi hain.</p></div>

<div class="scn"><h4>Friday 5 baje ka lockout</h4><p>On-call engineer vendor account ke liye "Permission denied" dekhkar sshd_config edit karne lagti hai. Ek colleague use rokta hai aur pehle auth.log padhta hai: ek cleanup script ne vendor ka home folder world-writable kar diya tha. Ek chmod se fix. sshd_config edit ke liye reload chahiye hota aur aur bigad sakta tha.</p><p><b>Lesson:</b> server settings badalne se pehle server log padho.</p></div>

<div class="iv"><p class="q">"User kehta hai SSH Permission denied (publickey) de raha hai. Aap kya check karoge?"</p><p>Pehle confirm karta hoon ki port reachable hai, phir <code>ssh -v</code> se dekhta hoon kaunsi key offer ho rahi hai, phir server par <code>/var/log/auth.log</code> padhta hoon. Aam kaaran: <code>~/.ssh</code> ya <code>authorized_keys</code> ke galat modes, key galat account mein, ya <code>AllowGroups</code> restriction. Passwords wapas chalu karne ke bajaye kaaran fix karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Timeout = network; refused = service; denied = authentication.</li>
<li>Workflow: ping, <code>nc -vz</code>, <code>ssh -v</code>, auth.log.</li>
<li><code>authorized_keys</code> par bad modes ho to sshd key ignore karta hai; 600 use karo.</li>
<li>Server log woh batata hai jo client message chhupa deta hai.</li>
</ul></div>
`}};export{e as default};