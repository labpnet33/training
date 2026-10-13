var e={id:`config-and-jump-host`,h:{en:`Short names with ~/.ssh/config and the jump host pattern`,hi:`~/.ssh/config se chhote naam aur jump host pattern`},body:{en:`
<p>Typing <code>ssh netops@10.99.0.1</code> is fine once. Typing it fifty times a day, with different users and ports for different devices, is a recipe for mistakes. The <b>client config file</b> lets you give each device a short name and store its user, address and options once. Then the <b>jump host</b> pattern shows you how real networks keep routers safe while you still reach them.</p>

<h3>The client config file</h3>
<p>The file is <code>~/.ssh/config</code> on <b>your</b> workstation. It is a plain text file made of blocks. Each block starts with <code>Host NAME</code> (the short name you will type) and is followed by indented settings:</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">cat ~/.ssh/config</span>
Host jump
    HostName 10.99.0.10
    User priya
Host pun-core
    HostName 10.99.0.1
    User netops</pre>
<p>Line by line. <code>Host jump</code>: when I type <code>ssh jump</code>, apply the settings below. <code>HostName</code>: the real address or DNS name to connect to. <code>User</code>: the login name, so I never type <code>priya@</code>. Other useful settings are <code>Port</code> (if sshd is not on 22) and <code>IdentityFile</code> (which key to use). Indentation is only for readability.</p>
<p>To create the file from the command line, the simulator accepts <code>printf</code> with an append redirect (<code>\\n</code> inside the quotes means a new line):</p>
<pre class="code">printf "Host jump\\n    HostName 10.99.0.10\\n    User priya\\n" &gt;&gt; ~/.ssh/config
cat ~/.ssh/config</pre>
<p>Now every command can use the short name instead of user and address:</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">ssh jump hostname</span>
jump01
priya@priya-ws:~$ <span class="hl">ssh jump</span>
Welcome to Ubuntu 24.04.1 LTS (GNU/Linux 6.8.0-45-generic x86_64)
<span class="c">[two documentation lines omitted]</span>
Last login: Tue Sep 29 08:00:30 2026 from 10.99.0.50

priya@jump01:~$</pre>
<p>The same alias also works for <code>scp jump:file .</code> and <code>ssh-copy-id jump</code>, because they all read this file. A command-line option beats the config file, and the config file beats the defaults, so you can always override a setting for one session.</p>

<h3>The jump host pattern</h3>
<p>Routers and switches should not accept SSH from everywhere. A common design allows SSH to the management network only from <b>one hardened server</b>: the <b>jump host</b> (also called a bastion host). Engineers log in to the jump host, and from there to devices. One door to defend and audit, instead of hundreds.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Laptop reaches jump host, then router; firewall allows SSH to the router only from the jump host">
<rect x="15" y="65" width="120" height="70" rx="10" fill="#bbf7d0"/><text x="75" y="95" text-anchor="middle" class="svg-ink" font-size="14">WS01</text><text x="75" y="115" text-anchor="middle" class="svg-muted" font-size="12">priya</text>
<rect x="225" y="65" width="140" height="70" rx="10" fill="#fde68a"/><text x="295" y="95" text-anchor="middle" class="svg-ink" font-size="14">JUMP01</text><text x="295" y="115" text-anchor="middle" class="svg-muted" font-size="12">the one door</text>
<rect x="470" y="30" width="150" height="60" rx="10" fill="#bae6fd"/><text x="545" y="57" text-anchor="middle" class="svg-ink" font-size="14">PUN-CORE-R1</text><text x="545" y="75" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.1</text>
<rect x="470" y="115" width="150" height="60" rx="10" fill="#bae6fd"/><text x="545" y="142" text-anchor="middle" class="svg-ink" font-size="14">other devices</text><text x="545" y="160" text-anchor="middle" class="svg-muted" font-size="12">SSH only from JUMP01</text>
<line x1="135" y1="100" x2="225" y2="100" stroke="#64748b" stroke-width="2"/><text x="180" y="92" text-anchor="middle" class="svg-accent" font-size="12">ssh jump</text>
<line x1="365" y1="90" x2="470" y2="60" stroke="#64748b" stroke-width="2"/><line x1="365" y1="110" x2="470" y2="145" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Hop 1: workstation to jump host. Hop 2: jump host to the device.</p></div>
<p>Now the second hop. You are on the jump host, so you type the next ssh command there. This is the simulator session; the router asks for its own password and the prompt changes to the router's hostname:</p>
<pre class="out">priya@jump01:~$ <span class="hl">ssh netops@10.99.0.1</span>
<span class="c">[host-key question for the router: yes]</span>
Warning: Permanently added '10.99.0.1' (RSA) to the list of known hosts.
<span class="c">[type the router password]</span>
PUN-CORE-R1# <span class="hl">show ip interface brief</span>
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.99.0.1       YES manual up                    up
GigabitEthernet0/1     10.10.0.1       YES manual down                  down
GigabitEthernet0/2     unassigned      YES unset  administratively down down
GigabitEthernet0/3     unassigned      YES unset  administratively down down
Loopback0              10.255.0.1      YES manual up                    up
PUN-CORE-R1# <span class="hl">exit</span>

[Connection to 10.99.0.1 closed by foreign host]
priya@jump01:~$ <span class="hl">exit</span>
logout
Connection to 10.99.0.10 closed.
priya@priya-ws:~$</pre>
<p>Notice how the prompt tells the story. <code>priya@priya-ws</code> became <code>priya@jump01</code>, then <code>PUN-CORE-R1#</code>. Each <code>exit</code> peels back one layer. Loopback0 holds 10.255.0.1, the answer to the lab question. The router's host-key line went into the <b>jump host's</b> <code>known_hosts</code>, not your workstation's, because the jump host is the client of that second connection.</p>

<h3>Reference commands (not run in the simulator)</h3>
<p>OpenSSH can do both hops in one command, without a shell on the jump host. The simulator does not support these options, but a real client does:</p>
<pre class="code"><span class="c"># one command, two hops (-J = ProxyJump)</span>
ssh -J jump netops@10.99.0.1
<span class="c"># the same thing, stored in ~/.ssh/config</span>
Host pun-core
    HostName 10.99.0.1
    User netops
    ProxyJump jump</pre>
<p>With <code>ProxyJump</code> your private key stays on your workstation and is used for both hops, which is safer than copying keys onto the jump host.</p>

<div class="eg"><p><b>Worked example.</b> Priya types <code>ssh jump</code>, lands on <code>priya@jump01</code>, types <code>ssh netops@10.99.0.1</code>, runs <code>show ip interface brief</code> on PUN-CORE-R1, and types <code>exit</code> twice to come back. In real life the firewall in front of the router accepts SSH only from 10.99.0.10, so this is the only route in.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Typing a router command in the wrong window. <code>show ip route</code> typed on the jump host gives "command not found" at best; <code>shutdown</code> typed on the wrong router at worst. Read the prompt before pressing Enter, especially when several windows are open.</p></div>
<div class="exam"><p><b>Exam trap.</b> A jump host is a security control, not a convenience: it concentrates logging and access control. Never copy your private key to it; use agent forwarding or ProxyJump instead.</p></div>

<div class="scn"><h4>One door, one log</h4><p>After a router was reconfigured by an unknown person, the team had no idea who had logged in, because routers accepted SSH from every office network. They moved to a jump host: SSH to routers allowed only from its address, every login logged with the engineer's own account. The next incident was solved in ten minutes from the jump host's auth.log.</p><p><b>Lesson:</b> a jump host gives you a single place for access control and audit.</p></div>

<div class="iv"><p class="q">"What is a jump host and how do you configure SSH to use one?"</p><p>A jump host (bastion) is a hardened server that is the only machine allowed to SSH into the management network. I either SSH to it and then to the device, or set <code>ProxyJump jump</code> in <code>~/.ssh/config</code> so <code>ssh pun-core</code> does both hops while my private key stays on my workstation.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>~/.ssh/config</code> stores Host, HostName, User (and Port, IdentityFile) per short name.</li>
<li>The config file is read by ssh, scp and ssh-copy-id.</li>
<li>A jump host is the single hardened entry to the management network.</li>
<li>The prompt changes at every hop; <code>exit</code> goes back one level.</li>
<li>ProxyJump (<code>-J</code>) does the hops in one command; not simulated here.</li>
</ul></div>
`,hi:`
<p><code>ssh netops@10.99.0.1</code> ek baar type karna theek hai. Din mein pachaas baar, alag devices ke liye alag users aur ports ke saath, type karna galtiyon ka nuskha hai. <b>Client config file</b> har device ko ek chhota naam dene aur uska user, address aur options ek baar store karne deti hai. Phir <b>jump host</b> pattern dikhata hai ki asli networks routers ko kaise safe rakhte hain jabki aap phir bhi unhe reach karte ho.</p>

<h3>Client config file</h3>
<p>File <b>aapke</b> workstation par <code>~/.ssh/config</code> hai. Yeh plain text file blocks ki bani hoti hai. Har block <code>Host NAME</code> se shuru hota hai (woh chhota naam jo aap type karoge) aur uske baad indented settings aati hain:</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">cat ~/.ssh/config</span>
Host jump
    HostName 10.99.0.10
    User priya
Host pun-core
    HostName 10.99.0.1
    User netops</pre>
<p>Line by line. <code>Host jump</code>: jab main <code>ssh jump</code> type karun, neeche ki settings lagao. <code>HostName</code>: jis asli address ya DNS name se connect karna hai. <code>User</code>: login name, taaki main kabhi <code>priya@</code> type na karun. Aur useful settings <code>Port</code> (sshd 22 par na ho to) aur <code>IdentityFile</code> (kaunsi key use karni) hain. Indentation sirf padhne ke liye hai.</p>
<p>File command line se banane ke liye simulator append redirect ke saath <code>printf</code> accept karta hai (quotes ke andar <code>\\n</code> ka matlab nayi line):</p>
<pre class="code">printf "Host jump\\n    HostName 10.99.0.10\\n    User priya\\n" &gt;&gt; ~/.ssh/config
cat ~/.ssh/config</pre>
<p>Ab har command user aur address ki jagah chhota naam use kar sakta hai:</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">ssh jump hostname</span>
jump01
priya@priya-ws:~$ <span class="hl">ssh jump</span>
Welcome to Ubuntu 24.04.1 LTS (GNU/Linux 6.8.0-45-generic x86_64)
<span class="c">[do documentation lines omit ki gayi]</span>
Last login: Tue Sep 29 08:00:30 2026 from 10.99.0.50

priya@jump01:~$</pre>
<p>Wahi alias <code>scp jump:file .</code> aur <code>ssh-copy-id jump</code> ke liye bhi chalta hai, kyunki sab yahi file padhte hain. Command-line option config file se upar hai, aur config file defaults se upar, isliye ek session ke liye aap kabhi bhi setting override kar sakte ho.</p>

<h3>Jump host pattern</h3>
<p>Routers aur switches ko har jagah se SSH accept nahi karna chahiye. Ek common design management network mein SSH sirf <b>ek hardened server</b> se allow karta hai: <b>jump host</b> (bastion host bhi kehte hain). Engineers jump host par login karte hain, aur wahan se devices par. Hazaron ki jagah ek hi darwaza defend aur audit karna.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Laptop jump host tak, phir router tak; firewall router par SSH sirf jump host se allow karta hai">
<rect x="15" y="65" width="120" height="70" rx="10" fill="#bbf7d0"/><text x="75" y="95" text-anchor="middle" class="svg-ink" font-size="14">WS01</text><text x="75" y="115" text-anchor="middle" class="svg-muted" font-size="12">priya</text>
<rect x="225" y="65" width="140" height="70" rx="10" fill="#fde68a"/><text x="295" y="95" text-anchor="middle" class="svg-ink" font-size="14">JUMP01</text><text x="295" y="115" text-anchor="middle" class="svg-muted" font-size="12">ek hi darwaza</text>
<rect x="470" y="30" width="150" height="60" rx="10" fill="#bae6fd"/><text x="545" y="57" text-anchor="middle" class="svg-ink" font-size="14">PUN-CORE-R1</text><text x="545" y="75" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.1</text>
<rect x="470" y="115" width="150" height="60" rx="10" fill="#bae6fd"/><text x="545" y="142" text-anchor="middle" class="svg-ink" font-size="14">baaki devices</text><text x="545" y="160" text-anchor="middle" class="svg-muted" font-size="12">SSH sirf JUMP01 se</text>
<line x1="135" y1="100" x2="225" y2="100" stroke="#64748b" stroke-width="2"/><text x="180" y="92" text-anchor="middle" class="svg-accent" font-size="12">ssh jump</text>
<line x1="365" y1="90" x2="470" y2="60" stroke="#64748b" stroke-width="2"/><line x1="365" y1="110" x2="470" y2="145" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Hop 1: workstation se jump host. Hop 2: jump host se device.</p></div>
<p>Ab doosra hop. Aap jump host par ho, isliye agla ssh command wahin type karte ho. Yeh simulator session hai; router apna password maangta hai aur prompt router ke hostname mein badal jaata hai:</p>
<pre class="out">priya@jump01:~$ <span class="hl">ssh netops@10.99.0.1</span>
<span class="c">[router ke liye host-key sawaal: yes]</span>
Warning: Permanently added '10.99.0.1' (RSA) to the list of known hosts.
<span class="c">[router password type karo]</span>
PUN-CORE-R1# <span class="hl">show ip interface brief</span>
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.99.0.1       YES manual up                    up
GigabitEthernet0/1     10.10.0.1       YES manual down                  down
GigabitEthernet0/2     unassigned      YES unset  administratively down down
GigabitEthernet0/3     unassigned      YES unset  administratively down down
Loopback0              10.255.0.1      YES manual up                    up
PUN-CORE-R1# <span class="hl">exit</span>

[Connection to 10.99.0.1 closed by foreign host]
priya@jump01:~$ <span class="hl">exit</span>
logout
Connection to 10.99.0.10 closed.
priya@priya-ws:~$</pre>
<p>Dekho prompt kaise kahani batata hai. <code>priya@priya-ws</code> se <code>priya@jump01</code>, phir <code>PUN-CORE-R1#</code>. Har <code>exit</code> ek layer hataata hai. Loopback0 par 10.255.0.1 hai, jo lab ka jawab hai. Router ki host-key line <b>jump host ki</b> <code>known_hosts</code> mein gayi, aapke workstation ki nahi, kyunki us doosre connection ka client jump host hai.</p>

<h3>Reference commands (simulator mein nahi chalte)</h3>
<p>OpenSSH dono hops ek command mein kar sakta hai, jump host par shell liye bina. Simulator yeh options support nahi karta, par asli client karta hai:</p>
<pre class="code"><span class="c"># ek command, do hops (-J = ProxyJump)</span>
ssh -J jump netops@10.99.0.1
<span class="c"># wahi cheez, ~/.ssh/config mein store</span>
Host pun-core
    HostName 10.99.0.1
    User netops
    ProxyJump jump</pre>
<p><code>ProxyJump</code> ke saath aapki private key aapke workstation par hi rehti hai aur dono hops ke liye use hoti hai, jo jump host par keys copy karne se zyada safe hai.</p>

<div class="eg"><p><b>Worked example.</b> Priya <code>ssh jump</code> type karti hai, <code>priya@jump01</code> par pahunchti hai, <code>ssh netops@10.99.0.1</code> type karti hai, PUN-CORE-R1 par <code>show ip interface brief</code> chalati hai, aur wapas aane ke liye do baar <code>exit</code>. Asli zindagi mein router ke aage ka firewall SSH sirf 10.99.0.10 se accept karta hai, isliye yahi ek raasta hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Router command galat window mein type karna. Jump host par type kiya <code>show ip route</code> bahut se bahut "command not found" deta hai; galat router par type kiya <code>shutdown</code> sabse bura. Enter dabane se pehle prompt padho, khaaskar jab kai windows khuli hon.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jump host ek security control hai, suvidha nahi: woh logging aur access control ko ek jagah laata hai. Apni private key kabhi use par copy mat karo; agent forwarding ya ProxyJump use karo.</p></div>

<div class="scn"><h4>Ek darwaza, ek log</h4><p>Ek router ko kisi anjaan insaan ne reconfigure kiya, aur team ko pata nahi tha kisne login kiya, kyunki routers har office network se SSH lete the. Unhone jump host par shift kiya: routers par SSH sirf uske address se, har login engineer ke apne account se logged. Agla incident jump host ke auth.log se das minute mein solve hua.</p><p><b>Lesson:</b> jump host access control aur audit ke liye ek hi jagah deta hai.</p></div>

<div class="iv"><p class="q">"Jump host kya hai aur SSH ko use karne ke liye kaise configure karte ho?"</p><p>Jump host (bastion) ek hardened server hai jo management network mein SSH karne wali akeli machine hai. Main ya to usse SSH karke phir device par jaata hoon, ya <code>~/.ssh/config</code> mein <code>ProxyJump jump</code> set karta hoon taaki <code>ssh pun-core</code> dono hops kare aur meri private key mere workstation par rahe.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>~/.ssh/config</code> har short name ke liye Host, HostName, User (aur Port, IdentityFile) store karta hai.</li>
<li>Config file ssh, scp aur ssh-copy-id sab padhte hain.</li>
<li>Jump host management network ka single hardened entry hai.</li>
<li>Har hop par prompt badalta hai; <code>exit</code> ek level wapas jaata hai.</li>
<li>ProxyJump (<code>-J</code>) hops ek command mein karta hai; yahan simulated nahi.</li>
</ul></div>
`}};export{e as default};