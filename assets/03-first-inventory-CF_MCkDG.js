var e={id:`first-inventory`,h:{en:`The inventory: telling Ansible which devices exist and how to log in`,hi:`Inventory: Ansible ko batana ki kaunse devices hain aur login kaise karna hai`},body:{en:`
<p>Before Ansible can touch a router it must know three things: <b>what the device is called</b>, <b>where it is</b> (its IP address) and <b>how to log in</b>. All three go into the <b>inventory</b>. If you have ever kept a spreadsheet of devices with columns for name, management IP and username, you already understand an inventory. Ansible simply reads it as a text file.</p>

<h3>Create the project folder and the file</h3>
<p>Inside the lab terminal we create files with <code>cat</code> and a <b>here-document</b>: everything between <code>&lt;&lt;'EOF'</code> and the closing <code>EOF</code> line is written into the file. On a real server you would use <code>nano</code> or <code>vim</code>; the file content is the same. The quotes around <code>'EOF'</code> stop the shell from changing characters such as <code>$</code> or <code>@</code>.</p>
<pre class="code">AUTO01$ mkdir ~/netauto &amp;&amp; cd ~/netauto
AUTO01$ cat &gt; inventory.ini &lt;&lt;'EOF'
[core]
pun-core-r1 ansible_host=10.99.0.1

[edge]
blr-edge-r2 ansible_host=10.99.0.2

[switches]
pun-acc-sw1 ansible_host=10.99.0.10

[routers:children]
core
edge

[all:vars]
ansible_connection=ansible.netcommon.network_cli
ansible_network_os=cisco.ios.ios
ansible_user=netops
ansible_password=NK@2026
EOF</pre>

<h3>Reading it line by line</h3>
<ul>
<li><code>[core]</code> starts a <b>group</b> named core. Lines below it are the members, until the next bracket line or a blank line.</li>
<li><code>pun-core-r1 ansible_host=10.99.0.1</code> is one host. The first word, <code>pun-core-r1</code>, is the <b>inventory name</b>: the label Ansible prints in its output and that you type in commands. It does not have to match the device hostname. <code>ansible_host=10.99.0.1</code> is the real address Ansible connects to. If you leave it out, Ansible tries to resolve the inventory name through DNS.</li>
<li><code>[routers:children]</code> means "this group is made of other groups". The lines below are group names, not hosts. So <code>routers</code> contains everything in <code>core</code> and <code>edge</code>.</li>
<li><code>[all:vars]</code> holds <b>variables</b> that apply to every host. <code>all</code> is a built-in group that always contains every host.</li>
</ul>
<p>The four variables in <code>[all:vars]</code> are the heart of network automation:</p>
<table class="cmp"><tr><th>Variable</th><th>Meaning</th></tr>
<tr><td><code>ansible_connection</code></td><td>How to talk to the device. <code>ansible.netcommon.network_cli</code> means "log in with SSH and type CLI commands".</td></tr>
<tr><td><code>ansible_network_os</code></td><td>Which CLI dialect: prompts, paging and config mode. <code>cisco.ios.ios</code> is IOS.</td></tr>
<tr><td><code>ansible_user</code></td><td>The SSH username on the device.</td></tr>
<tr><td><code>ansible_password</code></td><td>The SSH password. In this lab the password is the lab-only value from the lab brief.</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Group tree of the inventory">
<rect x="250" y="10" width="140" height="36" rx="8" fill="#fde68a"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">all</text>
<rect x="60" y="80" width="130" height="36" rx="8" fill="#bbf7d0"/><text x="125" y="103" text-anchor="middle" class="svg-ink" font-size="13">routers</text>
<rect x="450" y="80" width="130" height="36" rx="8" fill="#bae6fd"/><text x="515" y="103" text-anchor="middle" class="svg-ink" font-size="13">switches</text>
<rect x="20" y="150" width="100" height="36" rx="8" fill="#ddd6fe"/><text x="70" y="173" text-anchor="middle" class="svg-ink" font-size="13">core</text>
<rect x="140" y="150" width="100" height="36" rx="8" fill="#ddd6fe"/><text x="190" y="173" text-anchor="middle" class="svg-ink" font-size="13">edge</text>
<text x="70" y="205" text-anchor="middle" class="svg-muted" font-size="12">pun-core-r1</text><text x="190" y="205" text-anchor="middle" class="svg-muted" font-size="12">blr-edge-r2</text><text x="515" y="140" text-anchor="middle" class="svg-muted" font-size="12">pun-acc-sw1</text>
<line x1="290" y1="46" x2="140" y2="80" stroke="#64748b" stroke-width="2"/><line x1="350" y1="46" x2="500" y2="80" stroke="#64748b" stroke-width="2"/><line x1="110" y1="116" x2="75" y2="150" stroke="#64748b" stroke-width="2"/><line x1="140" y1="116" x2="185" y2="150" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Groups can contain hosts or other groups. Everything is inside the built-in group all.</p></div>

<h3>Ask Ansible what it understood</h3>
<p>Never assume the file says what you meant. <code>ansible-inventory --graph</code> draws the tree Ansible built:</p>
<pre class="out">AUTO01$ ansible-inventory -i inventory.ini --graph
@all:
  |--@switches:
  |  |--pun-acc-sw1
  |--@routers:
  |  |--@core:
  |  |  |--pun-core-r1
  |  |--@edge:
  |  |  |--blr-edge-r2</pre>
<p><code>-i inventory.ini</code> names the inventory file. In the next chapter a configuration file will remember it so that you can leave <code>-i</code> out. <code>ansible-inventory --list</code> prints every host with its variables as JSON:</p>
<pre class="out">AUTO01$ ansible-inventory --list
{
    "_meta": {
        "hostvars": {
            "blr-edge-r2": {
                "ansible_connection": "ansible.netcommon.network_cli",
                <span class="hl">"ansible_host": "10.99.0.2",</span>
                "ansible_network_os": "cisco.ios.ios",
                "ansible_password": "NK@2026",
                "ansible_user": "netops"
            },
...</pre>
<p>Every host received all four variables from <code>[all:vars]</code>, plus its own <code>ansible_host</code>. That is variable inheritance at work, and a whole module of this course is devoted to it.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Putting a real production password in a plain file. Here it is acceptable only because the lab password is a throw-away value. In real projects you keep secrets in an encrypted <b>Ansible Vault</b> file or fetch them from a secrets manager; the later modules show how. Also never commit such a file to a shared Git repository.</p></div>
<div class="exam"><p><b>Exam trap.</b> The inventory name and the device hostname are different things. <code>pun-core-r1</code> is only a label. Another classic: <code>[routers:children]</code> lists groups, while <code>[routers]</code> lists hosts. Mixing them up makes Ansible report an unknown host.</p></div>

<div class="scn"><h4>The router that had two names</h4><p>An engineer saw "pun-core-r1" in Ansible output but the device prompt said "PUN-CORE-R1". He feared Ansible was talking to a different box. A quick <code>ansible-inventory --list</code> showed <code>ansible_host: 10.99.0.1</code> for that label, which is the address of the core router. The label in the inventory is chosen by humans; the device hostname comes from the router's own configuration.</p><p><b>Lesson:</b> Ansible connects to <code>ansible_host</code>, not to the name. Pick short, consistent inventory names and document them.</p></div>

<div class="iv"><p class="q">"What is an Ansible inventory and which variables does a network device need?"</p><p>An inventory lists hosts and groups and carries their variables. A network device over SSH needs <code>ansible_host</code>, <code>ansible_connection</code> (network_cli), <code>ansible_network_os</code> (for example cisco.ios.ios), <code>ansible_user</code> and a password or key. Add that you check the result with <code>ansible-inventory --graph</code> and that secrets belong in Vault.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The inventory names the hosts, groups them, and holds the login variables.</li>
<li><code>ansible_host</code> is the address; the first word on the line is only a label.</li>
<li><code>[group:children]</code> builds a group from other groups; <code>[all:vars]</code> applies to everyone.</li>
<li>Network devices need <code>ansible_connection</code>, <code>ansible_network_os</code>, user and password.</li>
<li>Verify with <code>ansible-inventory --graph</code> and <code>--list</code>.</li>
</ul></div>
`,hi:`
<p>Ansible kisi router ko chhoone se pehle teen cheezein jaanta hona chahiye: <b>device ka naam kya hai</b>, <b>woh kahan hai</b> (uska IP address) aur <b>login kaise karna hai</b>. Teeno <b>inventory</b> mein jaati hain. Agar aapne kabhi devices ki spreadsheet rakhi hai jisme naam, management IP aur username ke columns hain, to aap inventory pehle se samajhte ho. Ansible use bas text file ki tarah padhta hai.</p>

<h3>Project folder aur file banao</h3>
<p>Lab terminal mein hum <code>cat</code> aur <b>here-document</b> se files banate hain: <code>&lt;&lt;'EOF'</code> aur closing <code>EOF</code> line ke beech ka sab kuch file mein likh diya jaata hai. Asli server par aap <code>nano</code> ya <code>vim</code> use karoge; file ka content wahi rehta hai. <code>'EOF'</code> ke quotes shell ko <code>$</code> ya <code>@</code> jaise characters badalne se rokte hain.</p>
<pre class="code">AUTO01$ mkdir ~/netauto &amp;&amp; cd ~/netauto
AUTO01$ cat &gt; inventory.ini &lt;&lt;'EOF'
[core]
pun-core-r1 ansible_host=10.99.0.1

[edge]
blr-edge-r2 ansible_host=10.99.0.2

[switches]
pun-acc-sw1 ansible_host=10.99.0.10

[routers:children]
core
edge

[all:vars]
ansible_connection=ansible.netcommon.network_cli
ansible_network_os=cisco.ios.ios
ansible_user=netops
ansible_password=NK@2026
EOF</pre>

<h3>Line by line padhna</h3>
<ul>
<li><code>[core]</code> core naam ka <b>group</b> shuru karta hai. Uske neeche ki lines members hain, agli bracket line ya blank line tak.</li>
<li><code>pun-core-r1 ansible_host=10.99.0.1</code> ek host hai. Pehla shabd, <code>pun-core-r1</code>, <b>inventory name</b> hai: woh label jo Ansible output mein print karta hai aur jo aap commands mein type karte ho. Yeh device ke hostname se match hona zaroori nahi. <code>ansible_host=10.99.0.1</code> woh asli address hai jahan Ansible connect karta hai. Ise chhodo to Ansible inventory name ko DNS se resolve karne ki koshish karta hai.</li>
<li><code>[routers:children]</code> ka matlab "yeh group doosre groups se bana hai". Neeche ki lines group names hain, hosts nahi. To <code>routers</code> mein <code>core</code> aur <code>edge</code> ka sab kuch hai.</li>
<li><code>[all:vars]</code> mein woh <b>variables</b> hain jo har host par lagte hain. <code>all</code> built-in group hai jisme hamesha har host hota hai.</li>
</ul>
<p><code>[all:vars]</code> ke chaar variables network automation ka dil hain:</p>
<table class="cmp"><tr><th>Variable</th><th>Matlab</th></tr>
<tr><td><code>ansible_connection</code></td><td>Device se baat kaise karni hai. <code>ansible.netcommon.network_cli</code> matlab "SSH se login karo aur CLI commands type karo".</td></tr>
<tr><td><code>ansible_network_os</code></td><td>Kaunsa CLI dialect: prompts, paging aur config mode. <code>cisco.ios.ios</code> IOS hai.</td></tr>
<tr><td><code>ansible_user</code></td><td>Device par SSH username.</td></tr>
<tr><td><code>ansible_password</code></td><td>SSH password. Is lab mein password lab brief wali sirf lab ke liye value hai.</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Inventory ka group tree">
<rect x="250" y="10" width="140" height="36" rx="8" fill="#fde68a"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">all</text>
<rect x="60" y="80" width="130" height="36" rx="8" fill="#bbf7d0"/><text x="125" y="103" text-anchor="middle" class="svg-ink" font-size="13">routers</text>
<rect x="450" y="80" width="130" height="36" rx="8" fill="#bae6fd"/><text x="515" y="103" text-anchor="middle" class="svg-ink" font-size="13">switches</text>
<rect x="20" y="150" width="100" height="36" rx="8" fill="#ddd6fe"/><text x="70" y="173" text-anchor="middle" class="svg-ink" font-size="13">core</text>
<rect x="140" y="150" width="100" height="36" rx="8" fill="#ddd6fe"/><text x="190" y="173" text-anchor="middle" class="svg-ink" font-size="13">edge</text>
<text x="70" y="205" text-anchor="middle" class="svg-muted" font-size="12">pun-core-r1</text><text x="190" y="205" text-anchor="middle" class="svg-muted" font-size="12">blr-edge-r2</text><text x="515" y="140" text-anchor="middle" class="svg-muted" font-size="12">pun-acc-sw1</text>
<line x1="290" y1="46" x2="140" y2="80" stroke="#64748b" stroke-width="2"/><line x1="350" y1="46" x2="500" y2="80" stroke="#64748b" stroke-width="2"/><line x1="110" y1="116" x2="75" y2="150" stroke="#64748b" stroke-width="2"/><line x1="140" y1="116" x2="185" y2="150" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Groups mein hosts ya doosre groups ho sakte hain. Sab kuch built-in group all ke andar hai.</p></div>

<h3>Ansible se poocho usne kya samjha</h3>
<p>Maan mat lo ki file wahi kehti hai jo aapne socha. <code>ansible-inventory --graph</code> woh tree dikhata hai jo Ansible ne banaya:</p>
<pre class="out">AUTO01$ ansible-inventory -i inventory.ini --graph
@all:
  |--@switches:
  |  |--pun-acc-sw1
  |--@routers:
  |  |--@core:
  |  |  |--pun-core-r1
  |  |--@edge:
  |  |  |--blr-edge-r2</pre>
<p><code>-i inventory.ini</code> inventory file ka naam deta hai. Agle chapter mein configuration file ise yaad rakhegi taaki <code>-i</code> chhod sako. <code>ansible-inventory --list</code> har host ko uske variables ke saath JSON mein print karta hai:</p>
<pre class="out">AUTO01$ ansible-inventory --list
{
    "_meta": {
        "hostvars": {
            "blr-edge-r2": {
                "ansible_connection": "ansible.netcommon.network_cli",
                <span class="hl">"ansible_host": "10.99.0.2",</span>
                "ansible_network_os": "cisco.ios.ios",
                "ansible_password": "NK@2026",
                "ansible_user": "netops"
            },
...</pre>
<p>Har host ko <code>[all:vars]</code> se chaaron variables mile, saath mein apna <code>ansible_host</code>. Yeh variable inheritance hai, aur is course ka poora ek module ispar hai.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Plain file mein asli production password daalna. Yahan yeh isliye theek hai kyunki lab password throw-away value hai. Asli projects mein secrets encrypted <b>Ansible Vault</b> file mein rakhte hain ya secrets manager se lete hain; aage ke modules dikhate hain kaise. Aisi file ko shared Git repository mein kabhi commit mat karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Inventory name aur device hostname alag cheezein hain. <code>pun-core-r1</code> sirf label hai. Ek aur classic: <code>[routers:children]</code> groups list karta hai, jabki <code>[routers]</code> hosts. Inhe mix karne par Ansible unknown host report karta hai.</p></div>

<div class="scn"><h4>Do naam wala router</h4><p>Ek engineer ne Ansible output mein "pun-core-r1" dekha par device prompt "PUN-CORE-R1" tha. Use dar laga ki Ansible kisi aur box se baat kar raha hai. Ek <code>ansible-inventory --list</code> ne us label ke liye <code>ansible_host: 10.99.0.1</code> dikhaya, jo core router ka address hai. Inventory ka label insaan chunte hain; device ka hostname router ki apni configuration se aata hai.</p><p><b>Lesson:</b> Ansible <code>ansible_host</code> par connect karta hai, naam par nahi. Chhote, consistent inventory names chuno aur document karo.</p></div>

<div class="iv"><p class="q">"Ansible inventory kya hai aur network device ko kaunse variables chahiye?"</p><p>Inventory hosts aur groups list karti hai aur unke variables rakhti hai. SSH par network device ko <code>ansible_host</code>, <code>ansible_connection</code> (network_cli), <code>ansible_network_os</code> (jaise cisco.ios.ios), <code>ansible_user</code> aur password ya key chahiye. Batao ki aap result <code>ansible-inventory --graph</code> se check karte ho aur secrets Vault mein rakhte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inventory hosts ke naam deti hai, unhe group karti hai, aur login variables rakhti hai.</li>
<li><code>ansible_host</code> address hai; line ka pehla shabd sirf label hai.</li>
<li><code>[group:children]</code> doosre groups se group banata hai; <code>[all:vars]</code> sab par lagta hai.</li>
<li>Network devices ko <code>ansible_connection</code>, <code>ansible_network_os</code>, user aur password chahiye.</li>
<li><code>ansible-inventory --graph</code> aur <code>--list</code> se verify karo.</li>
</ul></div>
`}};export{e as default};