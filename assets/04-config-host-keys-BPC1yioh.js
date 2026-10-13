var e={id:`config-host-keys`,h:{en:`ansible.cfg and the host key question every beginner meets`,hi:`ansible.cfg aur host key ka sawaal jo har beginner ke saamne aata hai`},body:{en:`
<p>You have an inventory. Typing <code>-i inventory.ini</code> in every command would be tiring, and you also want a few project settings kept in one place. That place is <b>ansible.cfg</b>, a small text file. In this chapter you create it, then you meet the first real error of almost every network automation learner: the <b>host key</b> failure. Understanding it once saves hours later.</p>

<h3>Which configuration file does Ansible use?</h3>
<p>Ansible looks for a configuration file in a fixed order and uses the <b>first one it finds</b>; it does not merge files.</p>
<ol>
<li>The path in the <code>ANSIBLE_CONFIG</code> environment variable.</li>
<li><code>ansible.cfg</code> in the <b>current folder</b> (the folder you run the command from).</li>
<li><code>~/.ansible.cfg</code> in your home folder.</li>
<li><code>/etc/ansible/ansible.cfg</code>, the system default (this is what we saw in chapter 2).</li>
</ol>
<p>The habit that works best is one <code>ansible.cfg</code> per project folder. Then the project carries its own settings and you always run commands from inside that folder.</p>
<pre class="code">AUTO01$ cd ~/netauto
AUTO01$ cat &gt; ansible.cfg &lt;&lt;'EOF'
[defaults]
inventory = inventory.ini
EOF
AUTO01$ ansible --version</pre>
<pre class="out">ansible [core 2.16.3]
  <span class="hl">config file = /home/netadmin/netauto/ansible.cfg</span>
  configured module search path = ['/home/netadmin/.ansible/plugins/modules', '/usr/share/ansible/plugins/modules']</pre>
<p>The path changed from <code>/etc/ansible/ansible.cfg</code> to your project file, which proves Ansible now uses it. The line <code>inventory = inventory.ini</code> under <code>[defaults]</code> means you can drop <code>-i</code>: a plain <code>ansible-inventory --graph</code> now reads the file for you. If you run a command from a different folder, Ansible will not find this file and you will see a warning such as the one below, which is a very common source of confusion.</p>
<pre class="out">AUTO01$ ansible all -m ping
[WARNING]: provided hosts list is empty, only localhost is available. Note that the implicit localhost does not match 'all'
[WARNING]: No hosts matched, nothing to do</pre>
<p>"No hosts matched" almost always means one of three things: you are in the wrong folder, the inventory path is wrong, or the pattern names a group that does not exist.</p>

<h3>The first ping fails: known_hosts</h3>
<p>Now try the first real connection. <code>ping</code> here is not an ICMP ping; it logs in over SSH and checks that Ansible can talk to the device (more in the next chapter).</p>
<pre class="out">AUTO01$ ansible all -m ping
pun-core-r1 | FAILED! =&gt; {
    "changed": false,
    <span class="hl">"msg": "Server '10.99.0.1' not found in known_hosts"</span>
}
blr-edge-r2 | FAILED! =&gt; {
    "changed": false,
    "msg": "Server '10.99.0.2' not found in known_hosts"
}
pun-acc-sw1 | FAILED! =&gt; {
    "changed": false,
    "msg": "Server '10.99.0.10' not found in known_hosts"
}</pre>
<p>Nothing is wrong with the network, the user or the password. The message is about <b>trust</b>.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="SSH host key check against known_hosts">
<rect x="20" y="70" width="140" height="70" rx="10" fill="#fde68a"/><text x="90" y="100" text-anchor="middle" class="svg-ink" font-size="14">AUTO01</text><text x="90" y="120" text-anchor="middle" class="svg-muted" font-size="12">~/.ssh/known_hosts</text>
<rect x="480" y="70" width="140" height="70" rx="10" fill="#bbf7d0"/><text x="550" y="100" text-anchor="middle" class="svg-ink" font-size="14">Router</text><text x="550" y="120" text-anchor="middle" class="svg-muted" font-size="12">presents its host key</text>
<line x1="160" y1="95" x2="480" y2="95" stroke="#64748b" stroke-width="2"/><text x="320" y="86" text-anchor="middle" class="svg-accent" font-size="12">1. SSH connect: who are you?</text>
<line x1="480" y1="120" x2="160" y2="120" stroke="#64748b" stroke-width="2"/><text x="320" y="138" text-anchor="middle" class="svg-accent" font-size="12">2. here is my key</text>
<text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">3. key not in known_hosts: Ansible stops (no one is there to answer yes/no)</text>
<text x="320" y="196" text-anchor="middle" class="svg-muted" font-size="12">a human at a terminal would be asked "Are you sure you want to continue?"</text>
</svg><p class="cap">The first connection to a device must be trusted by someone. Ansible cannot answer that question interactively.</p></div>

<h3>Why it happens</h3>
<p>The first time you SSH to any device, your SSH client asks "The authenticity of host cannot be established. Continue?" and, if you say yes, stores the device's <b>host key</b> in <code>~/.ssh/known_hosts</code>. This protects you from someone impersonating the router. Ansible runs without a person to answer, so with <b>host key checking</b> turned on (the default) it simply refuses to continue.</p>

<h3>Two fixes: lab and production</h3>
<p><b>In a lab</b> it is normal to turn checking off in the project file:</p>
<pre class="code">AUTO01$ echo 'host_key_checking = False' &gt;&gt; ansible.cfg
AUTO01$ cat ansible.cfg
[defaults]
inventory = inventory.ini
host_key_checking = False</pre>
<pre class="out">AUTO01$ ansible all -m ping
pun-core-r1 | SUCCESS =&gt; {
    "changed": false,
    <span class="hl">"ping": "pong"</span>
}
blr-edge-r2 | SUCCESS =&gt; {
    "changed": false,
    "ping": "pong"
}
pun-acc-sw1 | SUCCESS =&gt; {
    "changed": false,
    "ping": "pong"
}</pre>
<p>Three <b>SUCCESS</b> lines with <code>pong</code>: Ansible can log in to every device and talk to its CLI. Your control node is ready.</p>
<p><b>In production</b> keep checking on and collect the keys once, after verifying the device fingerprint through a trusted channel:</p>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator)</span>
ssh-keyscan 10.99.0.1 &gt;&gt; ~/.ssh/known_hosts
ssh-keyscan 10.99.0.2 &gt;&gt; ~/.ssh/known_hosts
ssh-keyscan 10.99.0.10 &gt;&gt; ~/.ssh/known_hosts</pre>
<p>Better still, a team can maintain one <code>known_hosts</code> file in its repository and review changes to it.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Copying <code>host_key_checking = False</code> into a production project because "it fixed the error". It also removes protection against a man-in-the-middle device. Keep it for labs only. Another trap: forgetting that the setting must be under the <code>[defaults]</code> heading; a line placed above it is ignored.</p></div>
<div class="exam"><p><b>Exam trap.</b> Remember what <code>ansible --version</code> reports: the <b>active</b> configuration file. If your changes seem to have no effect, you are probably editing a file that is not the active one, for example the project file while running from your home folder.</p></div>

<div class="scn"><h4>It worked yesterday on the other server</h4><p>A trainee copied a playbook project to a new control node. Every task failed with "not found in known_hosts" even though the same project worked on the old server. The old server had the device keys in its <code>~/.ssh/known_hosts</code> from months of manual logins; the new one had never connected. The senior engineer verified the fingerprints, ran <code>ssh-keyscan</code> for each address and the next run was clean, with host key checking still on.</p><p><b>Lesson:</b> the error is about trust, not connectivity. Fix it by establishing trust, not by switching security off.</p></div>

<div class="iv"><p class="q">"Ansible fails with 'not found in known_hosts'. What do you do?"</p><p>I explain that this is SSH host key verification, not a network fault. In a lab I may set <code>host_key_checking = False</code>. In production I verify the device fingerprint, add the key with <code>ssh-keyscan</code> or a managed known_hosts file, and keep checking enabled. That answer shows security awareness.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ansible uses the first configuration file it finds; <code>ansible --version</code> shows which.</li>
<li>Keep one <code>ansible.cfg</code> per project and run commands from that folder.</li>
<li><code>inventory = inventory.ini</code> under <code>[defaults]</code> removes the need for <code>-i</code>.</li>
<li>"not found in known_hosts" is a trust problem; labs may disable checking, production should add the keys.</li>
<li>Three SUCCESS lines with <code>pong</code> prove login and CLI access to every device.</li>
</ul></div>
`,hi:`
<p>Aapke paas inventory hai. Har command mein <code>-i inventory.ini</code> type karna thakane wala hoga, aur aap kuch project settings ek hi jagah rakhna chahte ho. Woh jagah hai <b>ansible.cfg</b>, ek chhoti text file. Is chapter mein aap ise banaoge, phir woh pehla asli error milega jo lagbhag har network automation learner ko milta hai: <b>host key</b> failure. Ek baar samajh liya to baad mein ghante bachte hain.</p>

<h3>Ansible kaunsi configuration file use karta hai?</h3>
<p>Ansible configuration file ko ek fixed order mein dhoondhta hai aur <b>pehli mili hui</b> use karta hai; files ko merge nahi karta.</p>
<ol>
<li><code>ANSIBLE_CONFIG</code> environment variable ka path.</li>
<li><b>Current folder</b> (jis folder se command chalate ho) ki <code>ansible.cfg</code>.</li>
<li>Home folder ki <code>~/.ansible.cfg</code>.</li>
<li><code>/etc/ansible/ansible.cfg</code>, system default (chapter 2 mein yahi dekha tha).</li>
</ol>
<p>Sabse achhi aadat: har project folder mein ek <code>ansible.cfg</code>. Tab project apni settings saath rakhta hai aur aap hamesha usi folder ke andar se commands chalate ho.</p>
<pre class="code">AUTO01$ cd ~/netauto
AUTO01$ cat &gt; ansible.cfg &lt;&lt;'EOF'
[defaults]
inventory = inventory.ini
EOF
AUTO01$ ansible --version</pre>
<pre class="out">ansible [core 2.16.3]
  <span class="hl">config file = /home/netadmin/netauto/ansible.cfg</span>
  configured module search path = ['/home/netadmin/.ansible/plugins/modules', '/usr/share/ansible/plugins/modules']</pre>
<p>Path <code>/etc/ansible/ansible.cfg</code> se badal kar aapki project file ho gaya, jo sabit karta hai ki Ansible ab ise use karta hai. <code>[defaults]</code> ke neeche <code>inventory = inventory.ini</code> ka matlab aap <code>-i</code> chhod sakte ho: seedha <code>ansible-inventory --graph</code> ab file khud padh leta hai. Kisi doosre folder se command chalao to Ansible yeh file nahi dhoondhega aur aisi warning dikhegi, jo confusion ka bahut common source hai.</p>
<pre class="out">AUTO01$ ansible all -m ping
[WARNING]: provided hosts list is empty, only localhost is available. Note that the implicit localhost does not match 'all'
[WARNING]: No hosts matched, nothing to do</pre>
<p>"No hosts matched" ka matlab lagbhag hamesha teen mein se ek: aap galat folder mein ho, inventory ka path galat hai, ya pattern aise group ka naam leta hai jo exist nahi karta.</p>

<h3>Pehla ping fail hota hai: known_hosts</h3>
<p>Ab pehla asli connection try karo. Yahan <code>ping</code> ICMP ping nahi hai; yeh SSH se login karke check karta hai ki Ansible device se baat kar sakta hai (agle chapter mein aur detail).</p>
<pre class="out">AUTO01$ ansible all -m ping
pun-core-r1 | FAILED! =&gt; {
    "changed": false,
    <span class="hl">"msg": "Server '10.99.0.1' not found in known_hosts"</span>
}
blr-edge-r2 | FAILED! =&gt; {
    "changed": false,
    "msg": "Server '10.99.0.2' not found in known_hosts"
}
pun-acc-sw1 | FAILED! =&gt; {
    "changed": false,
    "msg": "Server '10.99.0.10' not found in known_hosts"
}</pre>
<p>Network, user ya password mein kuch galat nahi hai. Message <b>trust</b> ke baare mein hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="SSH host key ki known_hosts se jaanch">
<rect x="20" y="70" width="140" height="70" rx="10" fill="#fde68a"/><text x="90" y="100" text-anchor="middle" class="svg-ink" font-size="14">AUTO01</text><text x="90" y="120" text-anchor="middle" class="svg-muted" font-size="12">~/.ssh/known_hosts</text>
<rect x="480" y="70" width="140" height="70" rx="10" fill="#bbf7d0"/><text x="550" y="100" text-anchor="middle" class="svg-ink" font-size="14">Router</text><text x="550" y="120" text-anchor="middle" class="svg-muted" font-size="12">apni host key dikhata hai</text>
<line x1="160" y1="95" x2="480" y2="95" stroke="#64748b" stroke-width="2"/><text x="320" y="86" text-anchor="middle" class="svg-accent" font-size="12">1. SSH connect: tum kaun ho?</text>
<line x1="480" y1="120" x2="160" y2="120" stroke="#64748b" stroke-width="2"/><text x="320" y="138" text-anchor="middle" class="svg-accent" font-size="12">2. yeh meri key hai</text>
<text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">3. key known_hosts mein nahi: Ansible ruk jaata hai (yes/no dene wala koi nahi)</text>
<text x="320" y="196" text-anchor="middle" class="svg-muted" font-size="12">terminal par insaan se poocha jaata "Are you sure you want to continue?"</text>
</svg><p class="cap">Device se pehle connection par kisi ko trust dena padta hai. Ansible yeh sawaal interactively answer nahi kar sakta.</p></div>

<h3>Aisa kyun hota hai</h3>
<p>Kisi bhi device mein pehli baar SSH karte ho to aapka SSH client poochta hai "The authenticity of host cannot be established. Continue?" aur yes kehne par device ki <b>host key</b> <code>~/.ssh/known_hosts</code> mein save karta hai. Yeh aapko router ki nakal karne walon se bachata hai. Ansible bina insaan ke chalta hai, isliye <b>host key checking</b> on ho (default) to woh seedha aage badhne se mana kar deta hai.</p>

<h3>Do fix: lab aur production</h3>
<p><b>Lab mein</b> project file mein checking band karna normal hai:</p>
<pre class="code">AUTO01$ echo 'host_key_checking = False' &gt;&gt; ansible.cfg
AUTO01$ cat ansible.cfg
[defaults]
inventory = inventory.ini
host_key_checking = False</pre>
<pre class="out">AUTO01$ ansible all -m ping
pun-core-r1 | SUCCESS =&gt; {
    "changed": false,
    <span class="hl">"ping": "pong"</span>
}
blr-edge-r2 | SUCCESS =&gt; {
    "changed": false,
    "ping": "pong"
}
pun-acc-sw1 | SUCCESS =&gt; {
    "changed": false,
    "ping": "pong"
}</pre>
<p><code>pong</code> ke saath teen <b>SUCCESS</b> lines: Ansible har device mein login karke uski CLI se baat kar sakta hai. Aapka control node taiyaar hai.</p>
<p><b>Production mein</b> checking on rakho aur trusted channel se device fingerprint verify karne ke baad keys ek baar collect karo:</p>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator)</span>
ssh-keyscan 10.99.0.1 &gt;&gt; ~/.ssh/known_hosts
ssh-keyscan 10.99.0.2 &gt;&gt; ~/.ssh/known_hosts
ssh-keyscan 10.99.0.10 &gt;&gt; ~/.ssh/known_hosts</pre>
<p>Aur behtar: team apne repository mein ek <code>known_hosts</code> file maintain kar sakti hai aur uske changes review kar sakti hai.</p>

<div class="warn"><p><b>Common beginner mistake.</b> <code>host_key_checking = False</code> ko production project mein copy karna kyunki "usne error theek kar diya". Yeh man-in-the-middle device ke khilaf protection bhi hata deta hai. Ise sirf labs ke liye rakho. Ek aur trap: setting <code>[defaults]</code> heading ke neeche honi chahiye; usse upar likhi line ignore ho jaati hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Yaad rakho <code>ansible --version</code> kya batata hai: <b>active</b> configuration file. Agar aapke changes ka asar nahi dikh raha, to shayad aap aisi file edit kar rahe ho jo active nahi hai, jaise home folder se chalate hue project file.</p></div>

<div class="scn"><h4>Doosre server par kal chala tha</h4><p>Ek trainee ne playbook project naye control node par copy kiya. Har task "not found in known_hosts" se fail hua, jabki wahi project purane server par chalta tha. Purane server ke <code>~/.ssh/known_hosts</code> mein mahino ke manual logins se device keys thi; naye ne kabhi connect hi nahi kiya tha. Senior engineer ne fingerprints verify kiye, har address ke liye <code>ssh-keyscan</code> chalaya aur agla run clean tha, host key checking on rehte hue.</p><p><b>Lesson:</b> error trust ke baare mein hai, connectivity ke nahi. Trust establish karke fix karo, security band karke nahi.</p></div>

<div class="iv"><p class="q">"Ansible 'not found in known_hosts' se fail ho raha hai. Aap kya karoge?"</p><p>Main batata hoon ki yeh SSH host key verification hai, network fault nahi. Lab mein <code>host_key_checking = False</code> set kar sakta hoon. Production mein device fingerprint verify karta hoon, key <code>ssh-keyscan</code> ya managed known_hosts file se jodta hoon, aur checking enabled rakhta hoon. Yeh jawab security awareness dikhata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ansible pehli mili hui configuration file use karta hai; <code>ansible --version</code> batata hai kaunsi.</li>
<li>Har project mein ek <code>ansible.cfg</code> rakho aur commands usi folder se chalao.</li>
<li><code>[defaults]</code> ke neeche <code>inventory = inventory.ini</code> se <code>-i</code> ki zaroorat nahi padti.</li>
<li>"not found in known_hosts" trust problem hai; labs checking band kar sakte hain, production keys jode.</li>
<li><code>pong</code> ke saath teen SUCCESS lines har device mein login aur CLI access sabit karti hain.</li>
</ul></div>
`}};export{e as default};