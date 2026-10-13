var e={id:`scp-and-remote-commands`,h:{en:`Beyond login: remote commands, scp file copy, and the key agent`,hi:`Login se aage: remote commands, scp file copy aur key agent`},body:{en:`
<p>SSH is more than a way to get a prompt. The same encrypted connection can run a single command, copy files, and remember your passphrase for you. These three tricks cover most of what an engineer does besides interactive work: grab a config backup, push a file, run one check on many hosts.</p>

<h3>Running one command remotely</h3>
<p>Anything you type after the host name is executed on the remote machine, then the connection closes and you are back on your own prompt. Simulator output:</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">ssh jump 'id; hostname; pwd'</span>
uid=1002(priya) gid=1002(priya) groups=1002(priya),1003(noc)
jump01
/home/priya

priya@priya-ws:~$ <span class="hl">ssh jump uptime</span>
 09:01:06 up 3:13,  1 user,  load average: 0.08, 0.03, 0.01</pre>
<p>Use quotes when the command contains a semicolon, a pipe or a wildcard, otherwise <b>your own shell</b> would interpret it before ssh even runs. <code>id</code> shows the remote user and groups (priya belongs to the <code>noc</code> group), <code>pwd</code> prints the current folder, <code>uptime</code> shows how long the host has been up. This is the building block of simple automation: a loop that runs <code>ssh host command</code> over a list of hosts.</p>

<h3>Copying files with scp</h3>
<p><code>scp</code> (secure copy) uses the same login and keys as ssh. The form is <code>scp SOURCE DESTINATION</code>, and a remote side is written <code>user@host:path</code> (a colon after the host). With the alias from Chapter 5 you can write <code>jump:path</code>. Upload a file and download one, captured from the simulator:</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">echo hello &gt; note.txt</span>
priya@priya-ws:~$ <span class="hl">scp note.txt priya@10.99.0.10:/tmp/note.txt</span>
note.txt                                      100%     6   0.0KB/s   00:00

priya@priya-ws:~$ <span class="hl">scp priya@10.99.0.10:/etc/hostname ./h.txt</span>
hostname                                      100%     7   0.0KB/s   00:00
priya@priya-ws:~$ cat h.txt
jump01</pre>
<p>The progress line shows the file name, percent done, bytes and time. Check that it arrived by running a remote <code>ls</code>:</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">ssh priya@10.99.0.10 'ls -l /tmp'</span>
total 4
-rw-rw-r--  1 priya    priya         6 Sep 29 09:00 note.txt</pre>
<p>Rules to remember. The <b>direction</b> is simply source first, destination second. A trailing colon with no path (<code>priya@10.99.0.10:</code>) means "the remote home folder". If sshd listens on a different port, scp uses a capital <code>-P</code> (ssh uses lowercase <code>-p</code>): this difference catches people every time. For a whole folder add <code>-r</code> (reference, not run in the simulator).</p>
<p>A network use case: before a change, pull a device or server backup to your workstation with <code>scp jump:/path/backup.cfg .</code>, and keep the copy next to the change ticket.</p>

<h3>Which key did I use? The -i option</h3>
<p>If you have several keys, name the one to use: <code>ssh -i ~/.ssh/id_ed25519 priya@10.99.0.10 hostname</code> prints <code>jump01</code>. Putting an <code>IdentityFile</code> line in the config file does the same without typing it.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Same SSH connection used for login, remote command and file copy">
<rect x="15" y="50" width="140" height="70" rx="10" fill="#bbf7d0"/><text x="85" y="80" text-anchor="middle" class="svg-ink" font-size="14">WS01</text><text x="85" y="100" text-anchor="middle" class="svg-muted" font-size="12">client</text>
<rect x="485" y="50" width="140" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="80" text-anchor="middle" class="svg-ink" font-size="14">JUMP01</text><text x="555" y="100" text-anchor="middle" class="svg-muted" font-size="12">sshd on port 22</text>
<line x1="155" y1="70" x2="485" y2="70" stroke="#64748b" stroke-width="2"/><text x="320" y="62" text-anchor="middle" class="svg-accent" font-size="12">ssh   (shell or one command)</text>
<line x1="155" y1="100" x2="485" y2="100" stroke="#64748b" stroke-width="2"/><text x="320" y="118" text-anchor="middle" class="svg-accent" font-size="12">scp   (file copy over the same channel)</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">one protocol, one port, one set of keys</text>
</svg><p class="cap">ssh, scp and sftp share TCP port 22 and the same authentication.</p></div>

<h3>Reference commands (not run in the simulator)</h3>
<p>The simulator does not provide an agent, sftp or tunnels, but you will meet them on real systems:</p>
<pre class="code"><span class="c"># the agent holds your decrypted key so you type the passphrase once per login session</span>
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
ssh-add -l                      <span class="c"># list loaded keys</span>
<span class="c"># interactive file transfer on the same port</span>
sftp priya@10.99.0.10
<span class="c"># copy a whole folder</span>
scp -r ./configs jump:/tmp/
<span class="c"># local port forward: reach 10.99.0.1 port 22 via a local port, through the jump host</span>
ssh -L 2222:10.99.0.1:22 jump</pre>
<p>The <b>agent</b> is a small helper that lives in memory for your session. Without it, a passphrase-protected key asks for the passphrase on every connection; with it, you unlock once. Agent forwarding (<code>-A</code>) lets a jump host use your agent for the next hop without a key file ever being copied there, but a compromised jump host could then use your agent while you are connected, so prefer <code>ProxyJump</code> and enable forwarding only for hosts you fully trust.</p>

<div class="eg"><p><b>Worked example.</b> Before an OSPF change, Priya copies the router's saved config text to the jump host and pulls it to her workstation: <code>scp jump:/tmp/pun-core.cfg .</code>. She checks the size line, attaches the file to the ticket, and runs <code>ssh jump 'ls -l /tmp'</code> to confirm what is left on the jump host so she can clean up afterwards.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Mixing up the port flags: <code>ssh -p 2222</code> but <code>scp -P 2222</code>. Another is forgetting the colon: <code>scp note.txt priya@10.99.0.10</code> (no colon) copies to a <b>local file named</b> <code>priya@10.99.0.10</code>, it does not copy to the server.</p></div>
<div class="exam"><p><b>Exam trap.</b> scp and sftp are not separate services; they ride on SSH and need no extra port or daemon. If SSH is blocked, so is scp. Plain FTP and TFTP are clear text and are different protocols.</p></div>

<div class="scn"><h4>The backup that missed one router</h4><p>A nightly script copied configs with scp from 40 devices. One device had changed its SSH port during hardening, and the script, which used <code>-p</code> where scp needs <code>-P</code>, silently reported success for the other 39 and an error nobody read for the 40th. Months later that device failed and no backup existed. The script was changed to check exit codes and to alert on any failure.</p><p><b>Lesson:</b> check the result of every remote command, and remember that scp uses a capital P.</p></div>

<div class="iv"><p class="q">"How would you copy a file securely to a server and run a command there without logging in interactively?"</p><p><code>scp file user@host:/path</code> copies it over SSH, and <code>ssh user@host 'command'</code> runs one command and returns. Both use the same authentication, so with key-based login they run unattended. I quote commands containing semicolons or pipes, check the exit status, and use <code>-P</code> for scp when the port is not 22.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ssh host command</code> runs one command remotely; quote complex commands.</li>
<li><code>scp source destination</code> copies over SSH; remote paths look like <code>user@host:path</code>.</li>
<li>scp uses <code>-P</code> for the port, ssh uses <code>-p</code>.</li>
<li><code>-i</code> picks a key; the config file can store it as IdentityFile.</li>
<li>An agent lets you unlock a passphrase-protected key once; use agent forwarding sparingly.</li>
</ul></div>
`,hi:`
<p>SSH sirf prompt paane ka tareeka nahi hai. Wahi encrypted connection ek command chala sakta hai, files copy kar sakta hai, aur aapka passphrase yaad rakh sakta hai. Yeh teen tricks interactive kaam ke alawa engineer ke zyadatar kaam cover karte hain: config backup uthana, file push karna, kai hosts par ek check chalana.</p>

<h3>Ek command remotely chalana</h3>
<p>Host name ke baad jo bhi type karo woh remote machine par execute hota hai, phir connection band hota hai aur aap apne prompt par wapas aate ho. Simulator output:</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">ssh jump 'id; hostname; pwd'</span>
uid=1002(priya) gid=1002(priya) groups=1002(priya),1003(noc)
jump01
/home/priya

priya@priya-ws:~$ <span class="hl">ssh jump uptime</span>
 09:01:06 up 3:13,  1 user,  load average: 0.08, 0.03, 0.01</pre>
<p>Command mein semicolon, pipe ya wildcard ho to quotes lagao, warna ssh chalne se pehle <b>aapka apna shell</b> use interpret kar leta hai. <code>id</code> remote user aur groups dikhata hai (priya <code>noc</code> group mein hai), <code>pwd</code> current folder print karta hai, <code>uptime</code> dikhata hai host kitni der se up hai. Yeh simple automation ka building block hai: hosts ki list par <code>ssh host command</code> chalane wala loop.</p>

<h3>scp se files copy karna</h3>
<p><code>scp</code> (secure copy) ssh jaisa hi login aur keys use karta hai. Form <code>scp SOURCE DESTINATION</code> hai, aur remote side <code>user@host:path</code> likhi jaati hai (host ke baad colon). Chapter 5 ke alias ke saath aap <code>jump:path</code> likh sakte ho. Ek file upload aur ek download, simulator se capture:</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">echo hello &gt; note.txt</span>
priya@priya-ws:~$ <span class="hl">scp note.txt priya@10.99.0.10:/tmp/note.txt</span>
note.txt                                      100%     6   0.0KB/s   00:00

priya@priya-ws:~$ <span class="hl">scp priya@10.99.0.10:/etc/hostname ./h.txt</span>
hostname                                      100%     7   0.0KB/s   00:00
priya@priya-ws:~$ cat h.txt
jump01</pre>
<p>Progress line file name, percent done, bytes aur time dikhati hai. Pahunchi ya nahi yeh remote <code>ls</code> se check karo:</p>
<pre class="out">priya@priya-ws:~$ <span class="hl">ssh priya@10.99.0.10 'ls -l /tmp'</span>
total 4
-rw-rw-r--  1 priya    priya         6 Sep 29 09:00 note.txt</pre>
<p>Yaad rakhne wale rules. <b>Direction</b> simple hai: pehle source, phir destination. Bina path ka trailing colon (<code>priya@10.99.0.10:</code>) matlab "remote home folder". sshd alag port par ho to scp capital <code>-P</code> use karta hai (ssh lowercase <code>-p</code>): yeh fark har baar logon ko pakadta hai. Poore folder ke liye <code>-r</code> jodo (reference, simulator mein nahi chalta).</p>
<p>Network use case: change se pehle device ya server backup apne workstation par <code>scp jump:/path/backup.cfg .</code> se kheencho, aur copy change ticket ke saath rakho.</p>

<h3>Maine kaunsi key use ki? -i option</h3>
<p>Kai keys ho to use karne wali ka naam do: <code>ssh -i ~/.ssh/id_ed25519 priya@10.99.0.10 hostname</code> <code>jump01</code> print karta hai. Config file mein <code>IdentityFile</code> line wahi kaam bina type kiye karti hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Ek hi SSH connection login, remote command aur file copy ke liye">
<rect x="15" y="50" width="140" height="70" rx="10" fill="#bbf7d0"/><text x="85" y="80" text-anchor="middle" class="svg-ink" font-size="14">WS01</text><text x="85" y="100" text-anchor="middle" class="svg-muted" font-size="12">client</text>
<rect x="485" y="50" width="140" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="80" text-anchor="middle" class="svg-ink" font-size="14">JUMP01</text><text x="555" y="100" text-anchor="middle" class="svg-muted" font-size="12">port 22 par sshd</text>
<line x1="155" y1="70" x2="485" y2="70" stroke="#64748b" stroke-width="2"/><text x="320" y="62" text-anchor="middle" class="svg-accent" font-size="12">ssh   (shell ya ek command)</text>
<line x1="155" y1="100" x2="485" y2="100" stroke="#64748b" stroke-width="2"/><text x="320" y="118" text-anchor="middle" class="svg-accent" font-size="12">scp   (usi channel par file copy)</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">ek protocol, ek port, keys ka ek set</text>
</svg><p class="cap">ssh, scp aur sftp TCP port 22 aur wahi authentication share karte hain.</p></div>

<h3>Reference commands (simulator mein nahi chalte)</h3>
<p>Simulator agent, sftp ya tunnels nahi deta, par asli systems par milenge:</p>
<pre class="code"><span class="c"># agent aapki decrypt ki hui key rakhta hai taaki passphrase login session mein ek baar type karni pade</span>
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
ssh-add -l                      <span class="c"># loaded keys ki list</span>
<span class="c"># usi port par interactive file transfer</span>
sftp priya@10.99.0.10
<span class="c"># poora folder copy karo</span>
scp -r ./configs jump:/tmp/
<span class="c"># local port forward: jump host ke through local port se 10.99.0.1 ke port 22 tak pahuncho</span>
ssh -L 2222:10.99.0.1:22 jump</pre>
<p><b>Agent</b> ek chhota helper hai jo aapke session ke liye memory mein rehta hai. Uske bina passphrase-protected key har connection par passphrase maangti hai; uske saath aap ek baar unlock karte ho. Agent forwarding (<code>-A</code>) jump host ko agle hop ke liye aapka agent use karne deta hai bina key file wahan copy kiye, par compromised jump host aapke connected rehte hue aapka agent use kar sakta hai, isliye <code>ProxyJump</code> ko prefer karo aur forwarding sirf poori tarah trusted hosts ke liye enable karo.</p>

<div class="eg"><p><b>Worked example.</b> OSPF change se pehle Priya router ka saved config text jump host par copy karti hai aur apne workstation par kheenchti hai: <code>scp jump:/tmp/pun-core.cfg .</code>. Woh size line dekhti hai, file ticket mein attach karti hai, aur <code>ssh jump 'ls -l /tmp'</code> se confirm karti hai jump host par kya bacha hai taaki baad mein safai kar sake.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Port flags mila dena: <code>ssh -p 2222</code> par <code>scp -P 2222</code>. Doosri galti colon bhoolna: <code>scp note.txt priya@10.99.0.10</code> (bina colon) <b>local file</b> <code>priya@10.99.0.10</code> naam se copy karta hai, server par nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> scp aur sftp alag services nahi hain; woh SSH par chalti hain aur koi extra port ya daemon nahi chahiye. SSH block ho to scp bhi block. Plain FTP aur TFTP clear text hain aur alag protocols.</p></div>

<div class="scn"><h4>Backup jisme ek router chhoot gaya</h4><p>Ek nightly script 40 devices se scp se configs copy karti thi. Ek device ne hardening mein SSH port badal diya, aur script ne, jo scp ke <code>-P</code> ki jagah <code>-p</code> use karti thi, baaki 39 ke liye chupchaap success report kiya aur 40ve ke liye ek error jo kisi ne padha nahi. Mahino baad woh device fail hua aur koi backup nahi tha. Script badli gayi ki exit codes check kare aur har failure par alert de.</p><p><b>Lesson:</b> har remote command ka result check karo, aur yaad rakho scp capital P use karta hai.</p></div>

<div class="iv"><p class="q">"Bina interactive login ke server par file securely kaise copy karoge aur command kaise chalaoge?"</p><p><code>scp file user@host:/path</code> use SSH se copy karta hai, aur <code>ssh user@host 'command'</code> ek command chalakar wapas aata hai. Dono same authentication use karte hain, isliye key-based login ke saath unattended chalte hain. Semicolon ya pipe wale commands ko quote karta hoon, exit status check karta hoon, aur port 22 na ho to scp ke liye <code>-P</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ssh host command</code> ek command remotely chalata hai; complex commands quote karo.</li>
<li><code>scp source destination</code> SSH se copy karta hai; remote paths <code>user@host:path</code> jaise.</li>
<li>scp port ke liye <code>-P</code>, ssh ke liye <code>-p</code>.</li>
<li><code>-i</code> key chunta hai; config file use IdentityFile ke roop mein store kar sakti hai.</li>
<li>Agent passphrase-protected key ek baar unlock karne deta hai; agent forwarding kam use karo.</li>
</ul></div>
`}};export{e as default};