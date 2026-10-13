var e={id:`overview`,h:{en:`SSH: what you will learn and the big picture`,hi:`SSH: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> SSH (Secure Shell) is how almost every engineer reaches a Linux server or a router today. You will learn to log in the first time and understand the host-key question, replace passwords with a key pair, give servers short names in a config file, hop through a jump host to reach routers, copy files, lock down the SSH server itself without locking yourself out, and read the log that tells you why a login failed.</p>
<p><b>Prerequisites.</b> You should be comfortable with the previous module (Linux networking): addresses, routes and ping. You do not need any earlier SSH experience. We explain every file and command as it appears.</p>

<h3>Analogy: a locked office with a guest book and an ID badge</h3>
<p>Imagine the server room is a locked office. When you arrive, the guard checks <b>two things</b>. First, you check the guard: is this really the right office, and not a fake one? That is the <b>host key</b>. Second, the guard checks you: either you know a secret word (a <b>password</b>), or you hold a badge that cannot be copied (a <b>key pair</b>). SSH does both checks automatically, and everything you say after that is encrypted so nobody on the corridor can listen.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Lab topology: workstation WS01 reaches the jump host JUMP01 and from there the router R1 over the management network 10.99.0.0/24">
<rect x="15" y="75" width="120" height="60" rx="10" fill="#bbf7d0"/><text x="75" y="102" text-anchor="middle" class="svg-ink" font-size="14">WS01</text><text x="75" y="120" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.50</text>
<rect x="190" y="75" width="110" height="60" rx="10" fill="#e2e8f0"/><text x="245" y="102" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="245" y="120" text-anchor="middle" class="svg-muted" font-size="12">MGMT-SW</text>
<rect x="355" y="20" width="130" height="60" rx="10" fill="#fde68a"/><text x="420" y="47" text-anchor="middle" class="svg-ink" font-size="14">JUMP01</text><text x="420" y="65" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.10</text>
<rect x="355" y="130" width="130" height="60" rx="10" fill="#bae6fd"/><text x="420" y="157" text-anchor="middle" class="svg-ink" font-size="14">R1 PUN-CORE-R1</text><text x="420" y="175" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.1</text>
<line x1="135" y1="105" x2="190" y2="105" stroke="#64748b" stroke-width="2"/><line x1="300" y1="95" x2="355" y2="55" stroke="#64748b" stroke-width="2"/><line x1="300" y1="115" x2="355" y2="155" stroke="#64748b" stroke-width="2"/>
<text x="560" y="105" text-anchor="middle" class="svg-accent" font-size="12">management</text><text x="560" y="121" text-anchor="middle" class="svg-accent" font-size="12">10.99.0.0/24</text>
</svg><p class="cap">You are Priya on WS01. The jump host is the door to the management network.</p></div>

<h3>The two roles: client and server</h3>
<p>Every SSH session has a <b>client</b> (the machine you type on, here WS01) and a <b>server</b> (the machine you reach, here JUMP01). Two small programs do the work. The client program is <code>ssh</code>. The server program is <code>sshd</code> (the final d stands for daemon, a background service) and it listens on <b>TCP port 22</b>. Files for each side live in different places, and mixing them up is the number one source of confusion:</p>
<table class="cmp"><tr><th>Where</th><th>File</th><th>Meaning</th></tr>
<tr><td>Client</td><td><code>~/.ssh/known_hosts</code></td><td>Servers I trust (their host keys)</td></tr>
<tr><td>Client</td><td><code>~/.ssh/id_ed25519</code> and <code>.pub</code></td><td>My private and public key</td></tr>
<tr><td>Client</td><td><code>~/.ssh/config</code></td><td>My shortcuts and options</td></tr>
<tr><td>Server</td><td><code>~/.ssh/authorized_keys</code></td><td>Public keys allowed to log in as this user</td></tr>
<tr><td>Server</td><td><code>/etc/ssh/sshd_config</code></td><td>The server's own settings</td></tr>
<tr><td>Server</td><td><code>/var/log/auth.log</code></td><td>Who logged in, who failed, and why</td></tr>
</table>
<p>The tilde <code>~</code> means "my home folder", for example <code>/home/priya</code>.</p>

<h3>Your first connection</h3>
<p>The basic form is <code>ssh USER@HOST</code>. Everything after the host is a command to run there, after which you come back to your own prompt. Captured from the simulator, with a command at the end:</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">ssh priya@10.99.0.10 hostname</span>
jump01
priya@priya-ws:~$</pre>
<p>The output <code>jump01</code> proves where the command ran. Always read the prompt: it shows the user and the machine, and wrong-window mistakes cause real outages.</p>

<div class="eg"><p><b>Worked example.</b> Priya joins the NOC. Her daily path is WS01, then the jump host 10.99.0.10, then the core router 10.99.0.1. In this module she replaces passwords with a key, defines <code>ssh jump</code> as a shortcut, and finally helps audit the jump host. Each chapter adds one step.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Confusing the two machines. A command typed at a router prompt or a jump host prompt does not run on your laptop. Before any change, read the prompt.</p></div>
<div class="exam"><p><b>Exam trap.</b> SSH is TCP port 22 and replaces telnet (TCP 23, clear text). SSH version 2 is the secure one; version 1 is obsolete. The same protocol also carries file copy (scp, sftp).</p></div>

<div class="scn"><h4>The telnet days</h4><p>A branch router was administered with telnet for years. During a routine capture the network team found the enable password in clear text in a trace. The fix was a one-day project: enable SSH on every router, allow it only from the management network, and move engineers to key logins on a jump host.</p><p><b>Lesson:</b> anything typed in clear text can be read by anyone who can capture the traffic. SSH encrypts it.</p></div>

<div class="iv"><p class="q">"What is SSH and why do we use it instead of telnet?"</p><p>SSH is an encrypted remote-login protocol on TCP port 22. It authenticates the server with a host key and the user with a password or, better, a key pair, and it encrypts the whole session. Telnet sends everything, including passwords, in clear text. SSH also carries file transfer (scp, sftp) and tunnels.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SSH has a client (<code>ssh</code>) and a server (<code>sshd</code>, TCP port 22).</li>
<li>The client proves the server is real (host key) and the server proves who you are (password or key).</li>
<li>Client files: known_hosts, private and public keys, config. Server files: authorized_keys, sshd_config.</li>
<li><code>ssh user@host command</code> runs one command and returns.</li>
<li>Read the prompt to know which machine you are on.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> SSH (Secure Shell) se aaj lagbhag har engineer Linux server ya router tak pahunchta hai. Aap pehli baar login karna aur host-key sawaal samajhna, passwords ki jagah key pair lagana, config file mein servers ko chhote naam dena, jump host ke through routers tak jana, files copy karna, SSH server ko khud lock down karna bina khud ko bahar kiye, aur woh log padhna jo batata hai login kyun fail hua, seekhoge.</p>
<p><b>Prerequisites.</b> Pichhla module (Linux networking) aapko aana chahiye: addresses, routes aur ping. Pehle ka SSH experience zaroori nahi. Har file aur command jab aata hai hum samjhate hain.</p>

<h3>Analogy: ek locked office, guest book aur ID badge</h3>
<p>Socho server room ek locked office hai. Aap pahunchte ho to guard <b>do cheezein</b> check karta hai. Pehle aap guard ko check karte ho: kya yeh sach mein sahi office hai, nakli to nahi? Yeh <b>host key</b> hai. Doosra, guard aapko check karta hai: ya to aap koi secret word jaante ho (<b>password</b>), ya aapke paas aisa badge hai jo copy nahi ho sakta (<b>key pair</b>). SSH dono checks apne aap karta hai, aur uske baad jo bhi aap kehte ho woh encrypted hota hai taaki corridor mein koi sun na sake.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Lab topology: workstation WS01 jump host JUMP01 tak pahunchta hai aur wahan se router R1 tak management network 10.99.0.0/24 par">
<rect x="15" y="75" width="120" height="60" rx="10" fill="#bbf7d0"/><text x="75" y="102" text-anchor="middle" class="svg-ink" font-size="14">WS01</text><text x="75" y="120" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.50</text>
<rect x="190" y="75" width="110" height="60" rx="10" fill="#e2e8f0"/><text x="245" y="102" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="245" y="120" text-anchor="middle" class="svg-muted" font-size="12">MGMT-SW</text>
<rect x="355" y="20" width="130" height="60" rx="10" fill="#fde68a"/><text x="420" y="47" text-anchor="middle" class="svg-ink" font-size="14">JUMP01</text><text x="420" y="65" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.10</text>
<rect x="355" y="130" width="130" height="60" rx="10" fill="#bae6fd"/><text x="420" y="157" text-anchor="middle" class="svg-ink" font-size="14">R1 PUN-CORE-R1</text><text x="420" y="175" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.1</text>
<line x1="135" y1="105" x2="190" y2="105" stroke="#64748b" stroke-width="2"/><line x1="300" y1="95" x2="355" y2="55" stroke="#64748b" stroke-width="2"/><line x1="300" y1="115" x2="355" y2="155" stroke="#64748b" stroke-width="2"/>
<text x="560" y="105" text-anchor="middle" class="svg-accent" font-size="12">management</text><text x="560" y="121" text-anchor="middle" class="svg-accent" font-size="12">10.99.0.0/24</text>
</svg><p class="cap">Aap WS01 par Priya ho. Jump host management network ka darwaza hai.</p></div>

<h3>Do roles: client aur server</h3>
<p>Har SSH session mein ek <b>client</b> hota hai (jis machine par aap type karte ho, yahan WS01) aur ek <b>server</b> (jis tak pahunchte ho, yahan JUMP01). Do chhote programs kaam karte hain. Client program <code>ssh</code> hai. Server program <code>sshd</code> hai (aakhri d matlab daemon, background service) aur woh <b>TCP port 22</b> par sunta hai. Har side ki files alag jagah rehti hain, aur inhe mila dena sabse bada confusion hai:</p>
<table class="cmp"><tr><th>Kahan</th><th>File</th><th>Matlab</th></tr>
<tr><td>Client</td><td><code>~/.ssh/known_hosts</code></td><td>Servers jin par main bharosa karta hoon (unki host keys)</td></tr>
<tr><td>Client</td><td><code>~/.ssh/id_ed25519</code> aur <code>.pub</code></td><td>Meri private aur public key</td></tr>
<tr><td>Client</td><td><code>~/.ssh/config</code></td><td>Mere shortcuts aur options</td></tr>
<tr><td>Server</td><td><code>~/.ssh/authorized_keys</code></td><td>Is user ke naam se login ki ijazat wali public keys</td></tr>
<tr><td>Server</td><td><code>/etc/ssh/sshd_config</code></td><td>Server ki apni settings</td></tr>
<tr><td>Server</td><td><code>/var/log/auth.log</code></td><td>Kisne login kiya, kisne fail kiya, aur kyun</td></tr>
</table>
<p>Tilde <code>~</code> ka matlab "mera home folder", jaise <code>/home/priya</code>.</p>

<h3>Aapka pehla connection</h3>
<p>Basic form <code>ssh USER@HOST</code> hai. Host ke baad jo kuch likho woh wahan chalne wala command hota hai, uske baad aap apne prompt par wapas aate ho. Simulator se capture kiya, aakhir mein command ke saath:</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">ssh priya@10.99.0.10 hostname</span>
jump01
priya@priya-ws:~$</pre>
<p>Output <code>jump01</code> sabit karta hai command kahan chala. Hamesha prompt padho: woh user aur machine dikhata hai, aur galat-window ki galtiyan asli outages banati hain.</p>

<div class="eg"><p><b>Worked example.</b> Priya NOC join karti hai. Uska daily raasta WS01, phir jump host 10.99.0.10, phir core router 10.99.0.1 hai. Is module mein woh passwords ko key se badalti hai, <code>ssh jump</code> ko shortcut banati hai, aur aakhir mein jump host ke audit mein madad karti hai. Har chapter ek step jodta hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Do machines ko confuse karna. Router prompt ya jump host prompt par type kiya command aapke laptop par nahi chalta. Kisi bhi change se pehle prompt padho.</p></div>
<div class="exam"><p><b>Exam trap.</b> SSH TCP port 22 hai aur telnet (TCP 23, clear text) ki jagah leta hai. SSH version 2 secure hai; version 1 obsolete. Wahi protocol file copy (scp, sftp) bhi le jaata hai.</p></div>

<div class="scn"><h4>Telnet ke din</h4><p>Ek branch router saalon tak telnet se administer hota raha. Routine capture mein network team ko trace mein enable password clear text mein mila. Fix ek din ka project tha: har router par SSH enable karo, sirf management network se allow karo, aur engineers ko jump host par key logins par le aao.</p><p><b>Lesson:</b> clear text mein type kuch bhi traffic capture karne wala padh sakta hai. SSH use encrypt karta hai.</p></div>

<div class="iv"><p class="q">"SSH kya hai aur telnet ki jagah hum use kyun karte hain?"</p><p>SSH TCP port 22 par encrypted remote-login protocol hai. Woh server ko host key se aur user ko password ya, behtar, key pair se authenticate karta hai, aur poora session encrypt karta hai. Telnet sab kuch, passwords bhi, clear text mein bhejta hai. SSH file transfer (scp, sftp) aur tunnels bhi le jaata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SSH mein client (<code>ssh</code>) aur server (<code>sshd</code>, TCP port 22) hote hain.</li>
<li>Client sabit karta hai server asli hai (host key) aur server sabit karta hai aap kaun ho (password ya key).</li>
<li>Client files: known_hosts, private aur public keys, config. Server files: authorized_keys, sshd_config.</li>
<li><code>ssh user@host command</code> ek command chalakar wapas aata hai.</li>
<li>Kis machine par ho yeh jaanne ke liye prompt padho.</li>
</ul></div>
`}};export{e as default};