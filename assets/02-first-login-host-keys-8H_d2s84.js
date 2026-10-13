var e={id:`first-login-host-keys`,h:{en:`The first login: host keys and known_hosts`,hi:`Pehla login: host keys aur known_hosts`},body:{en:`
<p>The first time you connect to a server, SSH asks a question that many people answer without reading: "do you trust this server?" This question protects you from <b>someone pretending to be the server</b>. Understanding it takes five minutes and prevents a whole class of security mistakes.</p>

<h3>What is a host key?</h3>
<p>When SSH is installed, the server creates a <b>host key</b>: a pair of files that identify that one machine. The public half is shown to every client that connects. A <b>fingerprint</b> is a short summary (a hash) of that public key, easy to compare by eye, for example <code>SHA256:...</code> followed by a string of letters. The first time you connect, your client has never seen this key, so it asks you to verify it.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="First connection: client sees an unknown host key, asks the user, then stores it in known_hosts">
<rect x="15" y="55" width="140" height="70" rx="10" fill="#bbf7d0"/><text x="85" y="85" text-anchor="middle" class="svg-ink" font-size="14">Client WS01</text><text x="85" y="105" text-anchor="middle" class="svg-muted" font-size="12">~/.ssh/known_hosts</text>
<rect x="485" y="55" width="140" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="85" text-anchor="middle" class="svg-ink" font-size="14">Server JUMP01</text><text x="555" y="105" text-anchor="middle" class="svg-muted" font-size="12">host key</text>
<line x1="155" y1="75" x2="485" y2="75" stroke="#64748b" stroke-width="2"/><text x="320" y="68" text-anchor="middle" class="svg-accent" font-size="12">1. connect to port 22</text>
<line x1="485" y1="105" x2="155" y2="105" stroke="#64748b" stroke-width="2"/><text x="320" y="122" text-anchor="middle" class="svg-accent" font-size="12">2. server shows its host key</text>
<text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="13">3. you answer yes, the client saves the key and checks it silently next time</text>
</svg><p class="cap">The client remembers who the server is. A different key later raises an alarm.</p></div>

<h3>The first connection, step by step</h3>
<p>This is the simulator's session when Priya connects for the first time. The comments in brackets are explanations, not output:</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">ssh priya@10.99.0.10</span>
<span class="c">[the client asks: are you sure you want to continue connecting? you type: yes]</span>
Warning: Permanently added '10.99.0.10' (ED25519) to the list of known hosts.
<span class="c">[you type the password; nothing is shown while you type]</span>
Welcome to Ubuntu 24.04.1 LTS (GNU/Linux 6.8.0-45-generic x86_64)
<span class="c">[two documentation lines omitted]</span>
Last login: Tue Sep 29 08:00:30 2026 from 10.99.0.50

priya@jump01:~$ <span class="hl">hostname</span>
jump01
priya@jump01:~$ <span class="hl">exit</span>
logout
Connection to 10.99.0.10 closed.</pre>
<p>Note two things. The prompt changed from <code>priya@priya-ws</code> to <code>priya@jump01</code> while you were inside. And <code>exit</code> returned you to your own machine. The trust question itself looks like this in the simulator (the fingerprint is replaced by a placeholder):</p>
<pre class="out">The authenticity of host '10.99.0.10 (10.99.0.10)' can't be established.
ED25519 key fingerprint is SHA256:&lt;fingerprint-placeholder&gt;.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])?</pre>
<p>In a high-security network you do not just type yes. You compare the fingerprint with one the server administrator gave you through another channel (for example the console). In a small lab it is accepted, and the decision is stored.</p>

<h3>Where the answer is stored: known_hosts</h3>
<p>The answer goes into a file on your client: <code>~/.ssh/known_hosts</code>. One line per server: the address, the key type, and the public key.</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">cat ~/.ssh/known_hosts</span>
10.99.0.10 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA...<span class="c">(rest of the public key)</span></pre>
<p>The next time, SSH compares the key the server shows with this line, silently. If they match, you go straight to the password prompt. If they differ, SSH stops and warns you loudly, because either the server was rebuilt or somebody is in the middle of your connection.</p>

<h3>When the host key changes</h3>
<p>The warning says <code>WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!</code> (reference text, not produced by the simulator). Do not just delete the line. First ask: did we rebuild or replace that machine? A router that you <code>write erase</code> and reload makes a new key; a server reinstalled from a template does too. If yes, the change is expected and you remove the old line:</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">ssh-keygen -R 10.99.0.10</span>
# Host 10.99.0.10 found: line 1
/home/priya/.ssh/known_hosts updated.
Original contents retained as /home/priya/.ssh/known_hosts.old</pre>
<p>The next connection asks the trust question again and stores the new key. If you cannot explain why the key changed, stop and ask the owner of the server. An unexplained change is exactly what an attacker in the middle looks like.</p>

<h3>Reading connection failures</h3>
<p>Not every failure is about keys. Three messages to recognise, captured from the simulator:</p>
<pre class="out">priya@priya-ws:~$ ssh priya@10.99.0.99
<span class="hl">ssh: connect to host 10.99.0.99 port 22: Connection timed out</span>

priya@priya-ws:~$ ssh -p 2222 priya@10.99.0.10
<span class="hl">ssh: connect to host 10.99.0.10 port 2222: Connection refused</span>

priya@priya-ws:~$ ssh priya@10.99.0.10
priya@10.99.0.10's password:
Permission denied, please try again.
Permission denied, please try again.
<span class="hl">priya@10.99.0.10: Permission denied (publickey,password).</span></pre>
<p>Timed out: the address does not answer (wrong IP, routing, or firewall). Refused: the host answered but nothing listens on that port (sshd stopped or another port). Permission denied: you reached sshd, but the login was rejected. The words in brackets, <code>publickey,password</code>, list the methods the server offers.</p>

<div class="eg"><p><b>Worked example.</b> After the NOC rebuilds jump01, Priya sees the changed-key warning. She checks the change ticket: jump01 was rebuilt on Saturday. She runs <code>ssh-keygen -R 10.99.0.10</code>, connects, accepts the new key, and her work continues. Had there been no ticket, she would have called the platform team first.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Turning off host-key checking everywhere (<code>StrictHostKeyChecking no</code>) because the warning is annoying. That removes the very protection SSH offers against impersonation. Fix the cause, do not mute the alarm.</p></div>
<div class="exam"><p><b>Exam trap.</b> known_hosts is on the <b>client</b> (servers I trust); authorized_keys is on the <b>server</b> (users allowed in). Mixing these two is a favourite exam question.</p></div>

<div class="scn"><h4>The warning that was a real problem</h4><p>An engineer saw the changed-host-key warning for a firewall management address and removed the old line without thinking, as he had done many times for rebuilt servers. A colleague later noticed that no rebuild had been scheduled. The cause turned out to be a misconfigured test device answering on the same address, not an attack, but it had been receiving real logins for a day.</p><p><b>Lesson:</b> a changed key is a question to answer, not an obstacle to delete.</p></div>

<div class="iv"><p class="q">"What is known_hosts and what does 'host key has changed' mean?"</p><p>known_hosts is the client's list of trusted server keys, saved after the first connection. A changed-key warning means the server presents a different key than before: either it was legitimately rebuilt, in which case I remove the entry with <code>ssh-keygen -R</code>, or someone is impersonating it, so I verify with the server owner before reconnecting.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The host key proves the server's identity; the fingerprint is its short summary.</li>
<li>Answering yes saves the key in the client's <code>~/.ssh/known_hosts</code>.</li>
<li>A changed key means rebuild or impersonation; verify, then use <code>ssh-keygen -R</code>.</li>
<li>Timed out, refused and permission denied point to network, service and login respectively.</li>
<li><code>exit</code> returns you to the previous machine; watch the prompt.</li>
</ul></div>
`,hi:`
<p>Server se pehli baar connect karte waqt SSH ek sawaal poochta hai jiska jawab bahut log padhe bina de dete hain: "kya aap is server par bharosa karte ho?" Yeh sawaal aapko <b>server hone ka naatak karne wale kisi</b> se bachata hai. Ise samajhne mein paanch minute lagte hain aur security galtiyon ki poori category rok deta hai.</p>

<h3>Host key kya hai?</h3>
<p>SSH install hote hi server ek <b>host key</b> banata hai: files ka ek pair jo us ek machine ko pehchanta hai. Public half har connect hone wale client ko dikhaya jaata hai. <b>Fingerprint</b> us public key ka chhota summary (hash) hai, aankh se compare karna aasan, jaise <code>SHA256:...</code> ke baad akshron ka string. Pehli baar connect karne par aapke client ne yeh key kabhi dekhi nahi hoti, isliye woh aapse verify karne ko kehta hai.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Pehla connection: client ko unknown host key dikhti hai, user se poochta hai, phir known_hosts mein save karta hai">
<rect x="15" y="55" width="140" height="70" rx="10" fill="#bbf7d0"/><text x="85" y="85" text-anchor="middle" class="svg-ink" font-size="14">Client WS01</text><text x="85" y="105" text-anchor="middle" class="svg-muted" font-size="12">~/.ssh/known_hosts</text>
<rect x="485" y="55" width="140" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="85" text-anchor="middle" class="svg-ink" font-size="14">Server JUMP01</text><text x="555" y="105" text-anchor="middle" class="svg-muted" font-size="12">host key</text>
<line x1="155" y1="75" x2="485" y2="75" stroke="#64748b" stroke-width="2"/><text x="320" y="68" text-anchor="middle" class="svg-accent" font-size="12">1. port 22 par connect</text>
<line x1="485" y1="105" x2="155" y2="105" stroke="#64748b" stroke-width="2"/><text x="320" y="122" text-anchor="middle" class="svg-accent" font-size="12">2. server apni host key dikhata hai</text>
<text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="13">3. aap yes kehte ho, client key save karta hai aur agli baar chupchaap check</text>
</svg><p class="cap">Client yaad rakhta hai server kaun hai. Baad mein alag key alarm bajati hai.</p></div>

<h3>Pehla connection, step by step</h3>
<p>Yeh simulator ka session hai jab Priya pehli baar connect karti hai. Brackets ke comments explanation hain, output nahi:</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">ssh priya@10.99.0.10</span>
<span class="c">[client poochta hai: are you sure you want to continue connecting? aap type karte ho: yes]</span>
Warning: Permanently added '10.99.0.10' (ED25519) to the list of known hosts.
<span class="c">[aap password type karte ho; type karte waqt kuch dikhta nahi]</span>
Welcome to Ubuntu 24.04.1 LTS (GNU/Linux 6.8.0-45-generic x86_64)
<span class="c">[do documentation lines omit ki gayi]</span>
Last login: Tue Sep 29 08:00:30 2026 from 10.99.0.50

priya@jump01:~$ <span class="hl">hostname</span>
jump01
priya@jump01:~$ <span class="hl">exit</span>
logout
Connection to 10.99.0.10 closed.</pre>
<p>Do cheezein note karo. Andar rehte hue prompt <code>priya@priya-ws</code> se <code>priya@jump01</code> ho gaya. Aur <code>exit</code> ne aapko apni machine par wapas bheja. Trust sawaal khud simulator mein aisa dikhta hai (fingerprint ki jagah placeholder):</p>
<pre class="out">The authenticity of host '10.99.0.10 (10.99.0.10)' can't be established.
ED25519 key fingerprint is SHA256:&lt;fingerprint-placeholder&gt;.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])?</pre>
<p>High-security network mein aap sirf yes type nahi karte. Aap fingerprint ko us fingerprint se compare karte ho jo server administrator ne kisi aur channel se diya (jaise console). Chhote lab mein accept kar liya jaata hai, aur faisla save ho jaata hai.</p>

<h3>Jawab kahan save hota hai: known_hosts</h3>
<p>Jawab aapke client ki file <code>~/.ssh/known_hosts</code> mein jaata hai. Har server ki ek line: address, key type aur public key.</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">cat ~/.ssh/known_hosts</span>
10.99.0.10 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA...<span class="c">(public key ka baaki hissa)</span></pre>
<p>Agli baar SSH server ki dikhayi key ko is line se chupchaap compare karta hai. Match ho to seedha password prompt par jaate ho. Alag ho to SSH ruk jaata hai aur zor se warn karta hai, kyunki ya to server rebuild hua hai ya koi aapke connection ke beech mein hai.</p>

<h3>Jab host key badal jaaye</h3>
<p>Warning kehti hai <code>WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!</code> (reference text, simulator nahi banata). Line seedha delete mat karo. Pehle poochho: kya hamne woh machine rebuild ya replace ki? Jis router ko aap <code>write erase</code> karke reload karte ho woh nayi key banata hai; template se reinstall hua server bhi. Haan ho to change expected hai aur purani line hatao:</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">ssh-keygen -R 10.99.0.10</span>
# Host 10.99.0.10 found: line 1
/home/priya/.ssh/known_hosts updated.
Original contents retained as /home/priya/.ssh/known_hosts.old</pre>
<p>Agla connection phir trust sawaal poochta hai aur nayi key save karta hai. Key kyun badli yeh samjha na sako to ruko aur server ke owner se poochho. Bina wajah ka change bilkul waisa dikhta hai jaisa beech mein baitha attacker.</p>

<h3>Connection failures padhna</h3>
<p>Har failure keys ke baare mein nahi hota. Pehchanne ke liye teen messages, simulator se capture kiye:</p>
<pre class="out">priya@priya-ws:~$ ssh priya@10.99.0.99
<span class="hl">ssh: connect to host 10.99.0.99 port 22: Connection timed out</span>

priya@priya-ws:~$ ssh -p 2222 priya@10.99.0.10
<span class="hl">ssh: connect to host 10.99.0.10 port 2222: Connection refused</span>

priya@priya-ws:~$ ssh priya@10.99.0.10
priya@10.99.0.10's password:
Permission denied, please try again.
Permission denied, please try again.
<span class="hl">priya@10.99.0.10: Permission denied (publickey,password).</span></pre>
<p>Timed out: address jawab nahi deta (galat IP, routing, ya firewall). Refused: host ne jawab diya par us port par koi nahi sun raha (sshd band ya doosra port). Permission denied: aap sshd tak pahunche, par login reject hua. Brackets ke words, <code>publickey,password</code>, un methods ki list hain jo server offer karta hai.</p>

<div class="eg"><p><b>Worked example.</b> NOC jump01 rebuild karti hai to Priya ko changed-key warning dikhti hai. Woh change ticket dekhti hai: jump01 Saturday ko rebuild hua tha. Woh <code>ssh-keygen -R 10.99.0.10</code> chalati hai, connect karti hai, nayi key accept karti hai, aur kaam chalta hai. Ticket na hota to woh pehle platform team ko call karti.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Warning annoying lagti hai isliye har jagah host-key checking band kar dena (<code>StrictHostKeyChecking no</code>). Isse wahi protection hat jaati hai jo SSH impersonation ke khilaaf deta hai. Wajah theek karo, alarm ko mute mat karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> known_hosts <b>client</b> par hai (servers jin par main bharosa karta hoon); authorized_keys <b>server</b> par hai (jin users ko andar aane ki ijazat). In dono ko mila dena exam ka favourite sawaal hai.</p></div>

<div class="scn"><h4>Jo warning asal problem thi</h4><p>Ek engineer ne firewall management address ke liye changed-host-key warning dekhi aur bina soche purani line hata di, jaise woh rebuilt servers ke liye kai baar kar chuka tha. Baad mein ek colleague ne dekha ki koi rebuild schedule hi nahi tha. Wajah ek misconfigured test device nikla jo usi address par jawab de raha tha, attack nahi, par woh ek din se asli logins le raha tha.</p><p><b>Lesson:</b> changed key ek sawaal hai jiska jawab dena hai, rukawat nahi jise delete karna hai.</p></div>

<div class="iv"><p class="q">"known_hosts kya hai aur 'host key has changed' ka kya matlab hai?"</p><p>known_hosts client ki trusted server keys ki list hai, pehle connection ke baad save hoti hai. Changed-key warning matlab server pehle se alag key dikha raha hai: ya to woh legitimately rebuild hua, tab main <code>ssh-keygen -R</code> se entry hataata hoon, ya koi impersonate kar raha hai, isliye dobara connect karne se pehle server owner se verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Host key server ki pehchaan sabit karti hai; fingerprint uska chhota summary hai.</li>
<li>Yes kehne par key client ki <code>~/.ssh/known_hosts</code> mein save hoti hai.</li>
<li>Changed key matlab rebuild ya impersonation; verify karo, phir <code>ssh-keygen -R</code>.</li>
<li>Timed out, refused aur permission denied kramash network, service aur login ki taraf ishara karte hain.</li>
<li><code>exit</code> pichhli machine par wapas le jaata hai; prompt dekhte raho.</li>
</ul></div>
`}};export{e as default};