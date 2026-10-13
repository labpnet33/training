var e={id:`hardening-sshd`,h:{en:`Hardening the SSH server safely: sshd_config, sshd -t, reload`,hi:`SSH server ko safely hard karna: sshd_config, sshd -t, reload`},body:{en:`
<p>So far you were the client. Now you are the owner of the jump host, and an audit says: "JUMP01 accepts passwords over SSH and anyone with an account can log in." Hardening means shrinking who can get in and how. This chapter is defensive: key logins only, no direct root login, and only the right group. The most important lesson is not the settings but the <b>safe order of operations</b>, because a mistake can lock you out of a remote server.</p>

<h3>Where the server settings live</h3>
<p>The server reads <code>/etc/ssh/sshd_config</code>. On Ubuntu that file starts with a line <code>Include /etc/ssh/sshd_config.d/*.conf</code>, which pulls in small extra files from a folder. You put your own changes in a new file there, so package updates never overwrite them. Simulator output:</p>
<pre class="out">netadmin@jump01:~$ <span class="hl">cat /etc/ssh/sshd_config</span>
# This is the sshd server system-wide configuration file.  See
# sshd_config(5) for more information.

<span class="hl">Include /etc/ssh/sshd_config.d/*.conf</span>

#Port 22
#PermitRootLogin prohibit-password
#PasswordAuthentication yes
...
KbdInteractiveAuthentication no
UsePAM yes
X11Forwarding yes
Subsystem	sftp	/usr/lib/openssh/sftp-server</pre>
<p>Lines starting with <code>#</code> are comments that show the default value. A setting listed in more than one place uses the <b>first value sshd reads</b>, and because the <code>Include</code> line is near the top, files in <code>sshd_config.d/</code> win over the main file. That is why a drop-in file is both safe and effective.</p>

<h3>See the effective settings before changing</h3>
<p><code>sshd -T</code> (capital T) prints the settings sshd is actually using. It needs <code>sudo</code>. Filter with <code>grep</code>:</p>
<pre class="out">netadmin@jump01:~$ <span class="hl">sudo sshd -T | grep -i -E "passwordauth|permitroot"</span>
permitrootlogin prohibit-password
<span class="hl">passwordauthentication yes</span></pre>
<p>That confirms the audit finding: passwords are accepted. <code>prohibit-password</code> for root means root may use keys but not a password.</p>

<h3>The safe order of operations</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Five safe steps: prove key login, write config, test with sshd -t, reload, test from a second window">
<rect x="10" y="40" width="112" height="70" rx="8" fill="#bbf7d0"/><text x="66" y="68" text-anchor="middle" class="svg-ink" font-size="12">1 Prove key</text><text x="66" y="86" text-anchor="middle" class="svg-ink" font-size="12">login works</text>
<rect x="136" y="40" width="112" height="70" rx="8" fill="#bae6fd"/><text x="192" y="68" text-anchor="middle" class="svg-ink" font-size="12">2 Write the</text><text x="192" y="86" text-anchor="middle" class="svg-ink" font-size="12">drop-in file</text>
<rect x="262" y="40" width="112" height="70" rx="8" fill="#fde68a"/><text x="318" y="68" text-anchor="middle" class="svg-ink" font-size="12">3 sshd -t</text><text x="318" y="86" text-anchor="middle" class="svg-ink" font-size="12">no output = OK</text>
<rect x="388" y="40" width="112" height="70" rx="8" fill="#ddd6fe"/><text x="444" y="68" text-anchor="middle" class="svg-ink" font-size="12">4 reload ssh</text><text x="444" y="86" text-anchor="middle" class="svg-ink" font-size="12">keep session</text>
<rect x="514" y="40" width="116" height="70" rx="8" fill="#fed7aa"/><text x="572" y="68" text-anchor="middle" class="svg-ink" font-size="12">5 test from a</text><text x="572" y="86" text-anchor="middle" class="svg-ink" font-size="12">second window</text>
</svg><p class="cap">Never close the working session until a new login has succeeded.</p></div>
<ol>
<li><b>Prove your key login works first.</b> If you turn passwords off before keys work, nobody can get in. From WS01 run <code>ssh jump hostname</code> and see <code>jump01</code>.</li>
<li><b>Write a drop-in file.</b> Three lines: no passwords, no direct root login, only the <code>noc</code> group.</li>
<li><b>Test the syntax</b> with <code>sudo sshd -t</code>. Silence means the file is valid. An error names the file and line.</li>
<li><b>Reload</b> the service, which re-reads the config without cutting existing sessions.</li>
<li><b>Test from a second window</b> while the first stays open. Only close the first after the second works.</li>
</ol>
<pre class="code"><span class="c"># step 2: tee writes the file as root; printf supplies three lines</span>
printf "PasswordAuthentication no\\nPermitRootLogin no\\nAllowGroups noc\\n" | sudo tee /etc/ssh/sshd_config.d/10-hardening.conf
<span class="c"># step 3: syntax check (no output = good)</span>
sudo sshd -t
<span class="c"># step 4: apply without dropping sessions</span>
sudo systemctl reload ssh</pre>
<pre class="out">netadmin@jump01:~$ printf "PasswordAuthentication no..." | sudo tee /etc/ssh/sshd_config.d/10-hardening.conf
PasswordAuthentication no
PermitRootLogin no
AllowGroups noc
netadmin@jump01:~$ <span class="hl">sudo sshd -t</span>
netadmin@jump01:~$ sudo systemctl reload ssh
netadmin@jump01:~$ <span class="hl">sudo sshd -T | grep -i -E "passwordauth|permitroot"</span>
permitrootlogin no
passwordauthentication no</pre>
<p>What each setting does. <code>PasswordAuthentication no</code>: only keys are accepted, so password guessing is pointless. <code>PermitRootLogin no</code>: nobody logs in as root directly; administrators log in as themselves and use <code>sudo</code>, so every action has a name. <code>AllowGroups noc</code>: only members of the group <code>noc</code> may log in at all (the simulator's <code>sshd -T</code> filter does not list this line, but the setting is enforced; on a real server <code>sshd -T</code> shows <code>allowgroups noc</code>).</p>

<h3>Test it from the second window</h3>
<pre class="out">priya@priya-ws:~$ <span class="hl">ssh jump hostname</span>
jump01
priya@priya-ws:~$ <span class="hl">ssh netadmin@10.99.0.10</span>
netadmin@10.99.0.10: Permission denied (publickey).</pre>
<p>Priya's key login still works. The password attempt as netadmin is refused, and the bracket now says only <code>(publickey)</code>: the server no longer offers the password method. Compare with Chapter 2, where it said <code>(publickey,password)</code>.</p>

<h3>What a typo does</h3>
<p>A broken file does not just fail to apply; it can stop the service from starting at the next restart. That is why <code>sshd -t</code> is step 3. Simulator example with an invalid option name:</p>
<pre class="out">netadmin@jump01:~$ <span class="hl">sudo sshd -t</span>
/etc/ssh/sshd_config.d/30-bad.conf line 1: Bad configuration option: Bogus
netadmin@jump01:~$ sudo systemctl restart ssh
Job for ssh.service failed because the control process exited with error code.
See "systemctl status ssh.service" and "journalctl -xeu ssh.service" for details.</pre>
<p>This is why we <b>reload</b> only after <code>sshd -t</code> passes, and why you keep a session open: an already-running sshd keeps its old settings until the new ones are valid. The services module shows how to read that failure from the journal.</p>

<h3>Reference settings (not run in the simulator)</h3>
<pre class="code"><span class="c"># more defensive options in the same drop-in file</span>
MaxAuthTries 3          <span class="c"># fewer wrong tries per connection</span>
LoginGraceTime 30       <span class="c"># seconds to finish logging in</span>
X11Forwarding no        <span class="c"># not needed on a jump host</span>
AllowTcpForwarding no   <span class="c"># only if you do not need tunnels</span>
ClientAliveInterval 300 <span class="c"># drop dead idle sessions</span></pre>

<div class="eg"><p><b>Worked example.</b> Audit item NK-AUD-12. You verify key login from WS01, write <code>10-hardening.conf</code>, run <code>sshd -t</code> (silent), <code>sudo systemctl reload ssh</code>, and check <code>sshd -T</code>: passwordauthentication no. From the second window Priya's key works and a netadmin password attempt gives <code>Permission denied (publickey)</code>. Only then do you close the first session and report the finding closed.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Disabling passwords on a remote server before confirming key login, then closing the only session. The server is now reachable only through a console or out-of-band access. Also note that <code>reload</code> is not available to a normal user: without <code>sudo</code> you get "Interactive authentication required".</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>sshd -t</code> checks syntax; <code>sshd -T</code> prints effective settings. Case matters. Also, changing sshd_config does nothing until the service reloads or restarts.</p></div>

<div class="scn"><h4>The audit that locked out the audit team</h4><p>A new engineer set <code>AllowGroups noc</code> on a shared host. Nobody had checked that the monitoring account belonged to <code>noc</code>, and dashboards went blank at the next scan. Because the old session was still open, she added the account to the group and monitoring recovered in five minutes. Without the open session it would have been a console trip.</p><p><b>Lesson:</b> list who needs access before you restrict it, and keep a session open.</p></div>

<div class="iv"><p class="q">"How do you disable password login for SSH on a production server without locking yourself out?"</p><p>I first prove key login works. I put <code>PasswordAuthentication no</code> in a drop-in file under <code>sshd_config.d</code>, run <code>sshd -t</code> to validate, reload (not restart) the service so existing sessions survive, and test a new login from a second window before closing the first. I also keep console or out-of-band access as a fallback.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Server settings: <code>/etc/ssh/sshd_config</code> plus drop-ins in <code>sshd_config.d/</code> (first value wins).</li>
<li>Core hardening: keys only, no direct root login, restrict by group.</li>
<li>Safe order: prove keys, write config, <code>sshd -t</code>, reload, test in a second window.</li>
<li><code>sshd -T</code> shows the effective settings; it needs sudo.</li>
<li>Refusal text <code>(publickey)</code> shows passwords are no longer offered.</li>
</ul></div>
`,hi:`
<p>Ab tak aap client the. Ab aap jump host ke owner ho, aur ek audit kehta hai: "JUMP01 SSH par passwords leta hai aur jiska bhi account hai woh login kar sakta hai." Hardening ka matlab hai kaun andar aa sakta hai aur kaise, use chhota karna. Yeh chapter defensive hai: sirf key logins, seedha root login nahi, aur sirf sahi group. Sabse zaroori sabak settings nahi balki <b>kaam ka safe order</b> hai, kyunki ek galti remote server se aapko bahar kar sakti hai.</p>

<h3>Server settings kahan rehti hain</h3>
<p>Server <code>/etc/ssh/sshd_config</code> padhta hai. Ubuntu par us file ki shuruaat <code>Include /etc/ssh/sshd_config.d/*.conf</code> line se hoti hai, jo ek folder se chhoti extra files kheench leti hai. Aap apne changes wahan nayi file mein rakhte ho, taaki package updates unhe overwrite na karein. Simulator output:</p>
<pre class="out">netadmin@jump01:~$ <span class="hl">cat /etc/ssh/sshd_config</span>
# This is the sshd server system-wide configuration file.  See
# sshd_config(5) for more information.

<span class="hl">Include /etc/ssh/sshd_config.d/*.conf</span>

#Port 22
#PermitRootLogin prohibit-password
#PasswordAuthentication yes
...
KbdInteractiveAuthentication no
UsePAM yes
X11Forwarding yes
Subsystem	sftp	/usr/lib/openssh/sftp-server</pre>
<p><code>#</code> se shuru lines comments hain jo default value dikhati hain. Ek setting kai jagah ho to <b>sshd jo pehli value padhta hai</b> wahi lagti hai, aur <code>Include</code> line upar hone ki wajah se <code>sshd_config.d/</code> ki files main file par jeet jaati hain. Isi liye drop-in file safe bhi hai aur effective bhi.</p>

<h3>Badalne se pehle effective settings dekho</h3>
<p><code>sshd -T</code> (capital T) woh settings print karta hai jo sshd asal mein use kar raha hai. <code>sudo</code> chahiye. <code>grep</code> se filter karo:</p>
<pre class="out">netadmin@jump01:~$ <span class="hl">sudo sshd -T | grep -i -E "passwordauth|permitroot"</span>
permitrootlogin prohibit-password
<span class="hl">passwordauthentication yes</span></pre>
<p>Yeh audit finding confirm karta hai: passwords accept ho rahe hain. Root ke liye <code>prohibit-password</code> matlab root keys use kar sakta hai par password nahi.</p>

<h3>Kaam ka safe order</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Paanch safe steps: key login prove karo, config likho, sshd -t se test, reload, doosri window se test">
<rect x="10" y="40" width="112" height="70" rx="8" fill="#bbf7d0"/><text x="66" y="68" text-anchor="middle" class="svg-ink" font-size="12">1 Key login</text><text x="66" y="86" text-anchor="middle" class="svg-ink" font-size="12">chalta hai?</text>
<rect x="136" y="40" width="112" height="70" rx="8" fill="#bae6fd"/><text x="192" y="68" text-anchor="middle" class="svg-ink" font-size="12">2 Drop-in</text><text x="192" y="86" text-anchor="middle" class="svg-ink" font-size="12">file likho</text>
<rect x="262" y="40" width="112" height="70" rx="8" fill="#fde68a"/><text x="318" y="68" text-anchor="middle" class="svg-ink" font-size="12">3 sshd -t</text><text x="318" y="86" text-anchor="middle" class="svg-ink" font-size="12">no output = OK</text>
<rect x="388" y="40" width="112" height="70" rx="8" fill="#ddd6fe"/><text x="444" y="68" text-anchor="middle" class="svg-ink" font-size="12">4 reload ssh</text><text x="444" y="86" text-anchor="middle" class="svg-ink" font-size="12">session rakho</text>
<rect x="514" y="40" width="116" height="70" rx="8" fill="#fed7aa"/><text x="572" y="68" text-anchor="middle" class="svg-ink" font-size="12">5 doosri window</text><text x="572" y="86" text-anchor="middle" class="svg-ink" font-size="12">se test</text>
</svg><p class="cap">Jab tak naya login succeed na ho, chalta hua session band mat karo.</p></div>
<ol>
<li><b>Pehle apna key login prove karo.</b> Keys chalne se pehle passwords band karoge to koi andar nahi aa sakta. WS01 se <code>ssh jump hostname</code> chalao aur <code>jump01</code> dekho.</li>
<li><b>Drop-in file likho.</b> Teen lines: passwords nahi, seedha root login nahi, sirf <code>noc</code> group.</li>
<li><code>sudo sshd -t</code> se <b>syntax test karo</b>. Khamoshi matlab file valid. Error file aur line batata hai.</li>
<li>Service ko <b>reload</b> karo, jo config dobara padhti hai bina maujooda sessions kaate.</li>
<li>Pehli window khuli rakhkar <b>doosri window se test karo</b>. Doosri chal jaaye tabhi pehli band karo.</li>
</ol>
<pre class="code"><span class="c"># step 2: tee file root ki tarah likhta hai; printf teen lines deta hai</span>
printf "PasswordAuthentication no\\nPermitRootLogin no\\nAllowGroups noc\\n" | sudo tee /etc/ssh/sshd_config.d/10-hardening.conf
<span class="c"># step 3: syntax check (no output = theek)</span>
sudo sshd -t
<span class="c"># step 4: sessions kaate bina apply</span>
sudo systemctl reload ssh</pre>
<pre class="out">netadmin@jump01:~$ printf "PasswordAuthentication no..." | sudo tee /etc/ssh/sshd_config.d/10-hardening.conf
PasswordAuthentication no
PermitRootLogin no
AllowGroups noc
netadmin@jump01:~$ <span class="hl">sudo sshd -t</span>
netadmin@jump01:~$ sudo systemctl reload ssh
netadmin@jump01:~$ <span class="hl">sudo sshd -T | grep -i -E "passwordauth|permitroot"</span>
permitrootlogin no
passwordauthentication no</pre>
<p>Har setting kya karti hai. <code>PasswordAuthentication no</code>: sirf keys accept, isliye password guess karna bekaar. <code>PermitRootLogin no</code>: koi seedha root se login nahi karta; administrators apne naam se login karke <code>sudo</code> use karte hain, isliye har action ka naam hota hai. <code>AllowGroups noc</code>: sirf group <code>noc</code> ke members hi login kar sakte hain (simulator ka <code>sshd -T</code> filter yeh line list nahi karta, par setting enforce hoti hai; asli server par <code>sshd -T</code> <code>allowgroups noc</code> dikhata hai).</p>

<h3>Doosri window se test karo</h3>
<pre class="out">priya@priya-ws:~$ <span class="hl">ssh jump hostname</span>
jump01
priya@priya-ws:~$ <span class="hl">ssh netadmin@10.99.0.10</span>
netadmin@10.99.0.10: Permission denied (publickey).</pre>
<p>Priya ka key login ab bhi chalta hai. netadmin ke naam se password attempt refuse hota hai, aur bracket ab sirf <code>(publickey)</code> kehta hai: server ab password method offer nahi karta. Chapter 2 se compare karo, jahan <code>(publickey,password)</code> tha.</p>

<h3>Typo kya karta hai</h3>
<p>Tooti file sirf apply nahi hoti, aisa nahi; woh agle restart par service ko start hone se bhi rok sakti hai. Isi liye <code>sshd -t</code> step 3 hai. Invalid option name ke saath simulator example:</p>
<pre class="out">netadmin@jump01:~$ <span class="hl">sudo sshd -t</span>
/etc/ssh/sshd_config.d/30-bad.conf line 1: Bad configuration option: Bogus
netadmin@jump01:~$ sudo systemctl restart ssh
Job for ssh.service failed because the control process exited with error code.
See "systemctl status ssh.service" and "journalctl -xeu ssh.service" for details.</pre>
<p>Isi liye <code>sshd -t</code> pass hone ke baad hi <b>reload</b> karte hain, aur isi liye ek session khula rakhte hain: chal raha sshd tab tak purani settings rakhta hai jab tak nayi valid na ho. Services module dikhata hai us failure ko journal se kaise padhna hai.</p>

<h3>Reference settings (simulator mein nahi chalte)</h3>
<pre class="code"><span class="c"># usi drop-in file mein aur defensive options</span>
MaxAuthTries 3          <span class="c"># ek connection par kam galat koshishein</span>
LoginGraceTime 30       <span class="c"># login poora karne ke seconds</span>
X11Forwarding no        <span class="c"># jump host par zaroorat nahi</span>
AllowTcpForwarding no   <span class="c"># sirf tab jab tunnels na chahiye</span>
ClientAliveInterval 300 <span class="c"># dead idle sessions gira do</span></pre>

<div class="eg"><p><b>Worked example.</b> Audit item NK-AUD-12. Aap WS01 se key login verify karte ho, <code>10-hardening.conf</code> likhte ho, <code>sshd -t</code> (silent), <code>sudo systemctl reload ssh</code> chalate ho, aur <code>sshd -T</code> check karte ho: passwordauthentication no. Doosri window se Priya ki key chalti hai aur netadmin ka password attempt <code>Permission denied (publickey)</code> deta hai. Tabhi aap pehli session band karte ho aur finding closed report karte ho.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Remote server par key login confirm kiye bina passwords band karna, phir akeli session band kar dena. Server ab sirf console ya out-of-band access se milta hai. Yeh bhi dhyan do ki <code>reload</code> normal user ke liye available nahi: <code>sudo</code> ke bina "Interactive authentication required" milta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>sshd -t</code> syntax check karta hai; <code>sshd -T</code> effective settings print karta hai. Case matter karta hai. Aur sshd_config badalne se tab tak kuch nahi hota jab tak service reload ya restart na ho.</p></div>

<div class="scn"><h4>Audit jisne audit team ko lock out kar diya</h4><p>Ek nayi engineer ne shared host par <code>AllowGroups noc</code> set kiya. Kisi ne check nahi kiya tha ki monitoring account <code>noc</code> mein hai, aur agle scan par dashboards khaali ho gaye. Purani session khuli thi, isliye usne account ko group mein jodkar paanch minute mein monitoring recover kar li. Session na hoti to console ka safar hota.</p><p><b>Lesson:</b> restrict karne se pehle list banao kise access chahiye, aur ek session khuli rakho.</p></div>

<div class="iv"><p class="q">"Production server par khud ko lock out kiye bina SSH password login kaise band karoge?"</p><p>Pehle prove karta hoon ki key login chalta hai. <code>sshd_config.d</code> ke drop-in file mein <code>PasswordAuthentication no</code> rakhta hoon, validate karne ke liye <code>sshd -t</code> chalata hoon, service ko restart nahi balki reload karta hoon taaki maujooda sessions bachein, aur pehli band karne se pehle doosri window se naya login test karta hoon. Fallback ke liye console ya out-of-band access bhi rakhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Server settings: <code>/etc/ssh/sshd_config</code> plus <code>sshd_config.d/</code> ke drop-ins (pehli value jeetti hai).</li>
<li>Core hardening: sirf keys, seedha root login nahi, group se restrict.</li>
<li>Safe order: keys prove, config likho, <code>sshd -t</code>, reload, doosri window mein test.</li>
<li><code>sshd -T</code> effective settings dikhata hai; sudo chahiye.</li>
<li>Refusal text <code>(publickey)</code> dikhata hai ki passwords ab offer nahi hote.</li>
</ul></div>
`}};export{e as default};