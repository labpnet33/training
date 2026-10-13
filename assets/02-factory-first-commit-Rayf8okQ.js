var e={id:`factory-first-commit`,h:{en:`Factory default and the first commit`,hi:`Factory default aur pehla commit`},body:{en:`
<p>A new car will not start without a key. A new Junos device will not accept its first commit without a <b>root password</b>. This is a deliberate safety rule: Junos never lets you save a configuration that leaves the device open to anyone who knows the default account.</p>

<h3>What a factory-default device contains</h3>
<p>A new (or zeroized) device boots with a small <b>factory-default configuration</b>: a few logging defaults and, depending on the model, a management port with DHCP or a default security policy. It never has a root password. After <code>request system zeroize</code> the box erases its configuration and logs and restarts as if new.</p>
<pre class="code">root@:RE:0% cli
root&gt; show system alarms
2 alarms currently active
Alarm time               Class  Description
2026-10-01 07:00:12 UTC  Major  Root password is not set
2026-10-01 07:00:12 UTC  Minor  Rescue configuration is not set</pre>
<p>Alarms have a <b>class</b>: <b>Major</b> means service-affecting or security-critical, <b>Minor</b> means attention soon. A missing root password is Major.</p>

<h3>Why the commit fails</h3>
<pre class="code">root&gt; configure
Entering configuration mode

[edit]
root# show | compare
[edit system]
+  syslog {
+      user * { any emergency; }
+      file messages { any notice; authorization info; }
+      file interactive-commands { interactive-commands any; }
+  }
root# commit
[edit]
  'system'
    <span class="hl">Missing mandatory statement: 'root-authentication'</span>
error: commit failed: (missing mandatory statements)</pre>
<p>The error is exact: the mandatory statement <code>root-authentication</code> under <code>system</code> is missing. Nothing was committed (commits are atomic).</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Commit gate">
<rect x="20" y="45" width="140" height="60" rx="8" fill="#fde68a"/><text x="90" y="80" text-anchor="middle" class="svg-ink" font-size="13">commit</text>
<rect x="230" y="45" width="180" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="72" text-anchor="middle" class="svg-ink" font-size="13">Is root password</text><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="13">configured?</text>
<rect x="490" y="10" width="140" height="45" rx="8" fill="#bbf7d0"/><text x="560" y="38" text-anchor="middle" class="svg-ink" font-size="13">yes: commit complete</text>
<rect x="490" y="95" width="140" height="45" rx="8" fill="#fed7aa"/><text x="560" y="123" text-anchor="middle" class="svg-ink" font-size="13">no: commit failed</text>
<g stroke="#64748b" stroke-width="2"><line x1="160" y1="75" x2="230" y2="75"/><line x1="410" y1="65" x2="490" y2="35"/><line x1="410" y1="85" x2="490" y2="118"/></g>
</svg><p class="cap">The root password is a mandatory gate for every commit.</p></div>

<h3>Setting the root password</h3>
<p>Two common forms:</p>
<pre class="code">root# set system root-authentication plain-text-password
New password:
Retype new password:

root# set system root-authentication encrypted-password "$6$nklab$Q0rT7hCq1Zx"</pre>
<ul>
<li><code>plain-text-password</code> prompts twice and stores only a <b>hash</b> (SHA-512, shown as <code>$6$...</code>). It never echoes the password.</li>
<li><code>encrypted-password</code> takes a hash you already created; useful for scripts and templates.</li>
<li><code>ssh-ed25519 "key..."</code> (or <code>ssh-rsa</code>) allows login with a public key.</li>
</ul>

<h3>Lab walkthrough: the Pune edge router</h3>
<p>The Pune edge router R1 came back from repair zeroized. A PC (PC1, 172.16.10.10/24) on <code>ge-0/0/1</code> waits for its gateway. Follow the lab tasks:</p>
<pre class="code">root&gt; show system alarms                         <span class="c">! task 1: the Major alarm</span>
root&gt; configure
root# show | compare                              <span class="c">! task 2: review</span>
root# commit                                      <span class="c">! fails: missing root-authentication</span>
root# set system root-authentication plain-text-password
New password: ********
Retype new password: ********
root# set system host-name NK-PUNE-EDGE
root# set interfaces ge-0/0/1 unit 0 family inet address 172.16.10.1/24
root# commit and-quit
commit complete
root@NK-PUNE-EDGE&gt; </pre>
<p>Check from PC1: <code>ping 172.16.10.1</code> should succeed. On the router, <code>show interfaces terse ge-0/0/1</code> shows <code>ge-0/0/1.0 up up inet 172.16.10.1/24</code>, and <code>show system alarms</code> no longer lists the root-password alarm.</p>

<h3>Other first-day commands</h3>
<ul>
<li><code>load factory-default</code> (configuration mode) loads the factory configuration into the candidate; a root password is still required to commit it.</li>
<li><code>request system zeroize</code> wipes the device. It is irreversible: use it only on devices being repurposed or retired.</li>
<li><code>request system configuration rescue save</code> makes a known-good rescue copy (covered in the Services module).</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Typing the password only once and mis-typing it; using a weak, shared password; committing, then forgetting that <code>root</code> has full access and should be used only in emergencies after named accounts exist.</p></div>
<div class="exam"><p><b>Exam trap.</b> Which statement is mandatory for the first commit? <code>system root-authentication</code>. Does <code>plain-text-password</code> store the clear password? No, only a hash.</p></div>

<div class="scn"><h4>Zeroized and unreachable</h4><p>A technician zeroized a router and tried to push a 200-line configuration file with <code>load override</code>. The commit failed with "missing mandatory statement" because the file contained no <code>root-authentication</code>. He spent an hour checking the OSPF block. The error message had named the actual problem in its second line.</p><p><b>Lesson:</b> read the whole error. Junos tells you the path and the missing statement.</p></div>

<div class="iv"><p class="q">"A new router will not commit. Why might that be?"</p><p>A factory-default Junos device has no root password and Junos requires <code>system root-authentication</code> before any commit. I would run <code>show | compare</code> and <code>commit</code> to see the error, set the root password with <code>plain-text-password</code>, and commit again. Then I would continue with host name, management access and named users.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A factory-default device has no root password and cannot commit without one.</li>
<li>The missing-root-password alarm is class Major.</li>
<li><code>plain-text-password</code> prompts twice and stores only a hash.</li>
<li>Failed commits apply nothing; read the error path.</li>
<li>After the first commit, verify with ping and <code>show interfaces terse</code>.</li>
</ul></div>
`,hi:`
<p>Nayi car chaabi ke bina start nahi hoti. Naya Junos device <b>root password</b> ke bina apna pehla commit accept nahi karta. Yeh jaan-boojh kar banaya safety rule hai: Junos aisi configuration save nahi hone deta jo device ko default account jaanne wale kisi ke liye khula chhod de.</p>

<h3>Factory-default device mein kya hota hai</h3>
<p>Naya (ya zeroize kiya hua) device ek chhoti <b>factory-default configuration</b> ke saath boot hota hai: kuch logging defaults aur model ke hisaab se DHCP wala management port ya default security policy. Usme root password kabhi nahi hota. <code>request system zeroize</code> ke baad box configuration aur logs mita deta hai aur naye jaisa restart hota hai.</p>
<pre class="code">root@:RE:0% cli
root&gt; show system alarms
2 alarms currently active
Alarm time               Class  Description
2026-10-01 07:00:12 UTC  Major  Root password is not set
2026-10-01 07:00:12 UTC  Minor  Rescue configuration is not set</pre>
<p>Alarms ki ek <b>class</b> hoti hai: <b>Major</b> matlab service-affecting ya security-critical, <b>Minor</b> matlab jaldi dhyan do. Root password ka na hona Major hai.</p>

<h3>Commit kyun fail hota hai</h3>
<pre class="code">root&gt; configure
Entering configuration mode

[edit]
root# show | compare
[edit system]
+  syslog {
+      user * { any emergency; }
+      file messages { any notice; authorization info; }
+      file interactive-commands { interactive-commands any; }
+  }
root# commit
[edit]
  'system'
    <span class="hl">Missing mandatory statement: 'root-authentication'</span>
error: commit failed: (missing mandatory statements)</pre>
<p>Error bilkul saaf hai: <code>system</code> ke neeche mandatory statement <code>root-authentication</code> missing hai. Kuch commit nahi hua (commits atomic hote hain).</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Commit gate">
<rect x="20" y="45" width="140" height="60" rx="8" fill="#fde68a"/><text x="90" y="80" text-anchor="middle" class="svg-ink" font-size="13">commit</text>
<rect x="230" y="45" width="180" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="72" text-anchor="middle" class="svg-ink" font-size="13">Root password</text><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="13">configured hai?</text>
<rect x="490" y="10" width="140" height="45" rx="8" fill="#bbf7d0"/><text x="560" y="38" text-anchor="middle" class="svg-ink" font-size="13">haan: commit complete</text>
<rect x="490" y="95" width="140" height="45" rx="8" fill="#fed7aa"/><text x="560" y="123" text-anchor="middle" class="svg-ink" font-size="13">nahi: commit failed</text>
<g stroke="#64748b" stroke-width="2"><line x1="160" y1="75" x2="230" y2="75"/><line x1="410" y1="65" x2="490" y2="35"/><line x1="410" y1="85" x2="490" y2="118"/></g>
</svg><p class="cap">Root password har commit ke liye mandatory gate hai.</p></div>

<h3>Root password set karna</h3>
<p>Do common forms:</p>
<pre class="code">root# set system root-authentication plain-text-password
New password:
Retype new password:

root# set system root-authentication encrypted-password "$6$nklab$Q0rT7hCq1Zx"</pre>
<ul>
<li><code>plain-text-password</code> do baar poochta hai aur sirf <b>hash</b> store karta hai (SHA-512, <code>$6$...</code> ke roop mein). Password kabhi echo nahi hota.</li>
<li><code>encrypted-password</code> pehle se bana hash leta hai; scripts aur templates ke liye useful.</li>
<li><code>ssh-ed25519 "key..."</code> (ya <code>ssh-rsa</code>) public key se login allow karta hai.</li>
</ul>

<h3>Lab walkthrough: Pune edge router</h3>
<p>Pune edge router R1 repair se zeroize hokar wapas aaya. <code>ge-0/0/1</code> par ek PC (PC1, 172.16.10.10/24) apne gateway ka intezaar kar raha hai. Lab tasks follow karo:</p>
<pre class="code">root&gt; show system alarms                         <span class="c">! task 1: Major alarm</span>
root&gt; configure
root# show | compare                              <span class="c">! task 2: review</span>
root# commit                                      <span class="c">! fail: root-authentication missing</span>
root# set system root-authentication plain-text-password
New password: ********
Retype new password: ********
root# set system host-name NK-PUNE-EDGE
root# set interfaces ge-0/0/1 unit 0 family inet address 172.16.10.1/24
root# commit and-quit
commit complete
root@NK-PUNE-EDGE&gt; </pre>
<p>PC1 se check karo: <code>ping 172.16.10.1</code> succeed hona chahiye. Router par <code>show interfaces terse ge-0/0/1</code> dikhata hai <code>ge-0/0/1.0 up up inet 172.16.10.1/24</code>, aur <code>show system alarms</code> mein ab root-password alarm nahi hai.</p>

<h3>Pehle din ke aur commands</h3>
<ul>
<li><code>load factory-default</code> (configuration mode) factory configuration candidate mein load karta hai; commit ke liye root password phir bhi chahiye.</li>
<li><code>request system zeroize</code> device mita deta hai. Yeh irreversible hai: sirf repurpose ya retire hone wale devices par use karo.</li>
<li><code>request system configuration rescue save</code> known-good rescue copy banata hai (Services module mein aayega).</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Password sirf ek baar type karke galat type kar dena; weak, shared password use karna; commit ke baad bhool jaana ki <code>root</code> ke paas full access hai aur named accounts banne ke baad use sirf emergency mein karna chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> Pehle commit ke liye kaunsa statement mandatory hai? <code>system root-authentication</code>. Kya <code>plain-text-password</code> clear password store karta hai? Nahi, sirf hash.</p></div>

<div class="scn"><h4>Zeroize hua aur unreachable</h4><p>Ek technician ne router zeroize kiya aur 200 line ki configuration file <code>load override</code> se push ki. Commit "missing mandatory statement" ke saath fail hua kyunki file mein <code>root-authentication</code> nahi tha. Usne ghanta bhar OSPF block check kiya. Error message ne doosri line mein hi asli problem bata di thi.</p><p><b>Lesson:</b> poora error padho. Junos path aur missing statement batata hai.</p></div>

<div class="iv"><p class="q">"Naya router commit nahi ho raha. Kya wajah ho sakti hai?"</p><p>Factory-default Junos device ke paas root password nahi hota aur Junos kisi bhi commit se pehle <code>system root-authentication</code> maangta hai. Main <code>show | compare</code> aur <code>commit</code> chalakar error dekhta, <code>plain-text-password</code> se root password set karta, aur dobara commit karta. Phir host name, management access aur named users par aage badhta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Factory-default device ke paas root password nahi hota aur uske bina commit nahi hota.</li>
<li>Missing root password alarm class Major hai.</li>
<li><code>plain-text-password</code> do baar poochta hai aur sirf hash store karta hai.</li>
<li>Failed commits kuch apply nahi karte; error path padho.</li>
<li>Pehle commit ke baad ping aur <code>show interfaces terse</code> se verify karo.</li>
</ul></div>
`}};export{e as default};