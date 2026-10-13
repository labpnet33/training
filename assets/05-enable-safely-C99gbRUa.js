var e=e=>`<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Safe enabling sequence">
<rect x="10" y="30" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="55" text-anchor="middle" class="svg-ink" font-size="12">1 Read rules</text><text x="65" y="73" text-anchor="middle" class="svg-muted" font-size="10">show added</text>
<rect x="135" y="30" width="110" height="60" rx="8" fill="#fed7aa"/><text x="190" y="55" text-anchor="middle" class="svg-ink" font-size="12">2 Allow SSH</text><text x="190" y="73" text-anchor="middle" class="svg-muted" font-size="10">before enable</text>
<rect x="260" y="30" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="315" y="55" text-anchor="middle" class="svg-ink" font-size="12">3 Enable</text><text x="315" y="73" text-anchor="middle" class="svg-muted" font-size="10">answer y</text>
<rect x="385" y="30" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="440" y="55" text-anchor="middle" class="svg-ink" font-size="12">4 Test</text><text x="440" y="73" text-anchor="middle" class="svg-muted" font-size="10">nc from clients</text>
<rect x="510" y="30" width="120" height="60" rx="8" fill="#fecaca"/><text x="570" y="55" text-anchor="middle" class="svg-ink" font-size="12">5 Rollback ready</text><text x="570" y="73" text-anchor="middle" class="svg-muted" font-size="10">ufw disable</text>
</svg><p class="cap">`+e+`</p></div>`,t=`<pre class="code">netadmin@nms03:~$ sudo ufw enable
<span class="c">(ufw asks for confirmation: answer y)</span></pre>
<pre class="out">Firewall is active and enabled on system startup</pre>`,n=`<pre class="code">priya@priya-ws:~$ nc -zv 10.99.0.20 22
priya@priya-ws:~$ nc -zv 10.99.0.20 23</pre>
<pre class="out">Connection to 10.99.0.20 22 port [tcp/ssh] <span class="hl">succeeded!</span>
nc: connect to 10.99.0.20 port 23 (tcp) <span class="hl">timed out</span>: Operation now in progress</pre>`,r=`<pre class="code">amit@sales-pc07:~$ nc -zv 10.99.0.20 22
amit@sales-pc07:~$ ssh amit@10.99.0.20
amit@sales-pc07:~$ curl 10.99.0.20 | head -n 4</pre>
<pre class="out">nc: connect to 10.99.0.20 port 22 (tcp) <span class="hl">timed out</span>: Operation now in progress
ssh: connect to host 10.99.0.20 port 22: Connection timed out
&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
&lt;title&gt;<span class="hl">Welcome to nginx!</span>&lt;/title&gt;</pre>`,i=`<pre class="code">netadmin@nms03:~$ sudo ufw disable
netadmin@nms03:~$ sudo ufw status</pre>
<pre class="out">Firewall stopped and disabled on system startup
Status: inactive</pre>`,a={id:`enable-safely`,h:{en:`Enabling the firewall without locking yourself out`,hi:`Firewall on karna bina khud ko lock out kiye`},body:{en:`
<p>The most famous firewall accident is not an attack. It is an engineer who enables a deny-by-default firewall on a remote server over SSH, without an SSH rule, and loses the session. The server is fine, the firewall is fine, and the engineer cannot get in. If the server is in another city, the fix is a drive, or a call to someone with console access. Chapter 5 gives you a routine that makes this impossible.</p>
`+e(`Five steps. The SSH rule comes before enable.`)+`
<h3>The routine</h3>
<ol>
<li><b>Read before you switch.</b> <code>ufw status verbose</code> and <code>ufw show added</code> (chapter 1) show what is stored. Remove rules you do not want, such as the stray Telnet rule.</li>
<li><b>Allow SSH first.</b> Your own session uses TCP 22. Add the SSH rule, from the management network if you can, before anything else.</li>
<li><b>Enable.</b> The command asks a question because it can interrupt connections. After your SSH rule exists, the answer is <code>y</code>.</li>
<li><b>Test from the client side.</b> Open a second session, or test from other machines, before you close the first one.</li>
<li><b>Know your way back.</b> Keep the first session open, and know the console or out-of-band access for the server.</li>
</ol>
`+t+`
<p>The message says two things: the firewall is <b>active now</b>, and it is <b>enabled on system startup</b>. The second part matters: the rules survive a reboot, so you do not have to type anything again.</p>

<h3>Testing from outside: nc</h3>
<p>Never trust "the rule looks right". Test it from the point of view of a client. The tool is <code>nc</code> (netcat) with the flags <code>-z</code> (just check whether the port opens, send no data) and <code>-v</code> (verbose). From WS01, an admin workstation inside the management network 10.99.0.0/24:</p>
`+n+`
<p>Port 22 <b>succeeded</b>: the rule allows this source and sshd is listening. Port 23 <b>timed out</b>: nothing came back. Telnet is no longer allowed, which is what we wanted. Now the same checks from USER01, a sales PC in a different network (10.20.0.0/24):</p>
`+r+`
<p>USER01 cannot reach SSH, by design: the SSH rule allows only 10.99.0.0/24. But it reaches the web dashboard on port 80. Four different results from three rules, and they all match the plan.</p>

<h3>Timed out or refused? A key clue</h3>
<p>These two words mean different things, and a firewall engineer must tell them apart:</p>
<table class="cmp"><tr><th>Client sees</th><th>Meaning</th></tr>
<tr><td><b>succeeded</b> or a login prompt</td><td>The packet was allowed and a service is listening.</td></tr>
<tr><td><b>timed out</b></td><td>Packets vanished. Typical of a firewall deny or a missing route.</td></tr>
<tr><td><b>refused</b></td><td>The server answered "no": it is reachable, but nothing listens on that port, or a reject rule sent the answer.</td></tr></table>
<p>Because ufw's <code>deny</code> drops silently, a blocked port looks like <b>timed out</b>. When you see a timeout, suspect the firewall or the path. When you see refused, suspect the service.</p>

<h3>The way back</h3>
<p>If the tests show you made a mistake, the quick rollback is to switch the firewall off while you think:</p>
`+i+`
<p>Switching off is an emergency measure for a few minutes, never a fix. After you correct the rules, enable again and repeat the tests. The firewall also has a <code>ufw reset</code> command that removes <b>all</b> rules and returns to the defaults; use it only when you want to start over, because it deletes your whole rule set.</p>

<div class="eg"><p><b>Worked example.</b> A runbook for a remote server. 1) <code>ufw status verbose</code>: inactive. 2) <code>ufw show added</code>: one stray rule, delete it. 3) Add the three rules for SSH, syslog and web. 4) <code>ufw enable</code>, answer y. 5) Keep session A open. From a second terminal, run <code>nc -zv</code> to ports 22 and 80. 6) From an outside host, confirm port 22 times out. 7) Only then close session A. Seven steps, no surprises.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Enabling over SSH without an SSH rule; closing your only session before testing; allowing SSH from the wrong network, for example your own laptop address that changes; running <code>ufw reset</code> on a production server by habit.</p></div>
<div class="exam"><p><b>Exam trap.</b> A timeout does not prove a firewall; it only suggests one. A refused connection proves that the host is reachable but nothing listens. Combine nc with the server log.</p></div>
<div class="scn"><h4>The 3 a.m. console trip</h4><p>An engineer enabled ufw on a branch server at night, forgetting SSH. The server kept running, but remote management died. The only fix was a drive to the branch and a keyboard on the console: forty minutes. The next change used a runbook, and a scheduled <code>ufw disable</code> as a safety net that the engineer cancelled after testing.</p><p><b>Lesson:</b> always plan the way back before the change.</p></div>
<div class="iv"><p class="q">"How do you enable a firewall on a remote server safely?"</p><p>Allow SSH from management first, review stored rules, enable and confirm, test from inside and outside using nc and a second session, keep the first session open, and have console access or a timed rollback ready. Then save the commands in the change record.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Allow SSH before <code>ufw enable</code>.</li>
<li>Enabling also makes the rules survive reboots.</li>
<li>Test with <code>nc -zv</code> from allowed and disallowed clients; read succeeded, timed out and refused correctly.</li>
<li><code>ufw disable</code> is a short emergency rollback, not a solution.</li>
</ul></div>
`,hi:`
<p>Sabse mashhoor firewall haadsa hamla nahi hota. Yeh woh engineer hota hai jo SSH par remote server par SSH rule ke bina deny-by-default firewall enable karta hai aur session kho deta hai. Server theek hai, firewall theek hai, aur engineer andar nahi ja sakta. Server doosre sheher mein ho to fix ek drive hai, ya console access wale kisi ko call. Chapter 5 ek aisa routine deta hai jo ise namumkin banata hai.</p>
`+e(`Paanch steps. SSH rule enable se pehle aata hai.`)+`
<h3>Routine</h3>
<ol>
<li><b>Switch karne se pehle padho.</b> <code>ufw status verbose</code> aur <code>ufw show added</code> (chapter 1) dikhate hain kya store hai. Jo rules nahi chahiye, jaise stray Telnet rule, hata do.</li>
<li><b>Pehle SSH allow karo.</b> Aapka apna session TCP 22 use karta hai. SSH rule sabse pehle jodo, ho sake to management network se.</li>
<li><b>Enable.</b> Command ek sawaal poochhta hai kyunki woh connections rok sakta hai. SSH rule maujood hone ke baad jawab <code>y</code> hai.</li>
<li><b>Client side se test karo.</b> Doosra session kholo, ya doosri machines se test karo, pehla session band karne se pehle.</li>
<li><b>Wapas ka raasta jaano.</b> Pehla session khula rakho, aur server ka console ya out-of-band access jaano.</li>
</ol>
`+t+`
<p>Message do baatein kehta hai: firewall <b>abhi active</b> hai, aur <b>system startup par enabled</b> hai. Doosra hissa zaroori hai: rules reboot ke baad bhi rehte hain, dobara type nahi karna padta.</p>

<h3>Bahar se test: nc</h3>
<p>"Rule sahi dikhta hai" par kabhi bharosa mat karo. Client ke nazariye se test karo. Tool <code>nc</code> (netcat) hai flags <code>-z</code> (sirf check karo port khulta hai ya nahi, data mat bhejo) aur <code>-v</code> (verbose) ke saath. WS01 se, jo management network 10.99.0.0/24 ke andar admin workstation hai:</p>
`+n+`
<p>Port 22 <b>succeeded</b>: rule is source ko allow karta hai aur sshd sun raha hai. Port 23 <b>timed out</b>: kuch wapas nahi aaya. Telnet ab allowed nahi, jo humein chahiye tha. Ab wahi checks USER01 se, jo doosre network (10.20.0.0/24) mein sales PC hai:</p>
`+r+`
<p>USER01 SSH tak nahi pahunch sakta, design ke mutabiq: SSH rule sirf 10.99.0.0/24 ko allow karta hai. Par woh port 80 par web dashboard tak pahunchta hai. Teen rules se chaar alag nateeje, aur sab plan se milte hain.</p>

<h3>Timed out ya refused? Ek ahem suraag</h3>
<p>Yeh do shabd alag matlab rakhte hain, aur firewall engineer ko farak pata hona chahiye:</p>
<table class="cmp"><tr><th>Client ko dikhta hai</th><th>Matlab</th></tr>
<tr><td><b>succeeded</b> ya login prompt</td><td>Packet allowed tha aur service sun rahi hai.</td></tr>
<tr><td><b>timed out</b></td><td>Packets gayab. Firewall deny ya missing route ki pehchaan.</td></tr>
<tr><td><b>refused</b></td><td>Server ne "nahi" kaha: woh reachable hai, par us port par kuch nahi sun raha, ya reject rule ne jawab bheja.</td></tr></table>
<p>ufw ka <code>deny</code> chupchaap drop karta hai, isliye blocked port <b>timed out</b> dikhta hai. Timeout dikhe to firewall ya raaste par shak karo. Refused dikhe to service par shak karo.</p>

<h3>Wapas ka raasta</h3>
<p>Agar tests dikhayein ki galti hui, to tez rollback hai ki sochte waqt firewall band kar do:</p>
`+i+`
<p>Band karna kuch minute ka emergency upay hai, fix kabhi nahi. Rules sudharne ke baad dobara enable karo aur tests dohrao. Firewall ka ek <code>ufw reset</code> command bhi hai jo <b>saare</b> rules hata kar defaults par wapas aata hai; ise tabhi use karo jab shuru se banana ho, kyunki yeh poora rule set delete kar deta hai.</p>

<div class="eg"><p><b>Worked example.</b> Remote server ka runbook. 1) <code>ufw status verbose</code>: inactive. 2) <code>ufw show added</code>: ek stray rule, delete karo. 3) SSH, syslog aur web ke teen rules jodo. 4) <code>ufw enable</code>, y jawab. 5) Session A khula rakho. Doosre terminal se port 22 aur 80 par <code>nc -zv</code> chalao. 6) Bahar ke host se confirm karo ki port 22 timeout hota hai. 7) Tabhi session A band karo. Saat steps, koi surprise nahi.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> SSH rule ke bina SSH par enable karna; test se pehle apna akela session band karna; SSH galat network se allow karna, jaise apne laptop ka address jo badalta hai; aadat se production server par <code>ufw reset</code> chalana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Timeout firewall sabit nahi karta; sirf sujhata hai. Refused sabit karta hai ki host reachable hai par kuch sun nahi raha. nc ko server log ke saath milao.</p></div>
<div class="scn"><h4>Raat 3 baje ka console safar</h4><p>Ek engineer ne raat ko branch server par ufw enable kiya, SSH bhool gaya. Server chalta raha, par remote management mar gaya. Ek hi fix tha: branch tak drive aur console par keyboard: chaalis minute. Agle badlav mein runbook use hua, aur ek scheduled <code>ufw disable</code> safety net ki tarah laga jise engineer ne test ke baad cancel kiya.</p><p><b>Lesson:</b> badlav se pehle wapas ka raasta plan karo.</p></div>
<div class="iv"><p class="q">"Remote server par firewall safely kaise enable karoge?"</p><p>Pehle management se SSH allow, stored rules review, enable aur confirm, nc aur doosre session se andar aur bahar se test, pehla session khula rakho, aur console access ya timed rollback taiyar. Phir commands change record mein likho.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ufw enable</code> se pehle SSH allow karo.</li>
<li>Enable karne se rules reboot ke baad bhi rehte hain.</li>
<li>Allowed aur disallowed clients se <code>nc -zv</code> test karo; succeeded, timed out aur refused sahi padho.</li>
<li><code>ufw disable</code> chhota emergency rollback hai, solution nahi.</li>
</ul></div>
`}};export{a as default};