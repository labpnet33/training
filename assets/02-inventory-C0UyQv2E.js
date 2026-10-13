var e={id:`inventory`,h:{en:`The inventory: telling Ansible WHICH devices to manage`,hi:`Inventory: Ansible ko batana KIN devices ko manage karna hai`},body:{en:`

<p><b>One idea in this chapter:</b> before Ansible can do anything, it must know who to talk to. That list is the <b>inventory</b>, and it is just a small text file.</p>
<div class="dia"><svg viewBox="0 0 640 205" role="img" aria-label="The inventory puts hosts into groups; a playbook names a group, not single devices."><rect x="20" y="20" width="600" height="170" rx="12" fill="#f1f5f9" stroke="#cbd5e1"/><text x="40" y="45" class="svg-ink" font-size="14">all</text><rect x="70" y="60" width="240" height="110" rx="10" fill="#bae6fd"/><text x="190" y="82" text-anchor="middle" class="svg-ink" font-size="13">group: routers</text><rect x="90" y="95" width="90" height="48" rx="8" fill="#ffffff" stroke="#64748b"/><text x="135" y="124" text-anchor="middle" class="svg-ink" font-size="13">R1</text><rect x="200" y="95" width="90" height="48" rx="8" fill="#ffffff" stroke="#64748b"/><text x="245" y="124" text-anchor="middle" class="svg-ink" font-size="13">R2</text><rect x="340" y="60" width="240" height="110" rx="10" fill="#bbf7d0"/><text x="460" y="82" text-anchor="middle" class="svg-ink" font-size="13">group: switches (another lab)</text><rect x="400" y="95" width="90" height="48" rx="8" fill="#ffffff" stroke="#64748b"/><text x="445" y="124" text-anchor="middle" class="svg-ink" font-size="13">SW1</text></svg><p class="cap">The inventory puts hosts into groups; a playbook names a group, not single devices.</p></div>

<h3>Reading an inventory file</h3>
<p>The simplest format is INI style (named for the file type). A word in square brackets starts a <b>group</b>. Each line below it is one <b>host</b>: a name you choose, followed by variables such as the address to connect to. A <b>variable</b> is a name that holds a value, like a label on a box. Here <code>ansible_host</code> is the label and <code>10.99.0.1</code> is what is inside.</p>
<pre class="code"><span class="c"># inventory.ini</span>
[routers]                       <span class="c"># a GROUP name in square brackets</span>
R1 ansible_host=10.99.0.1       <span class="c"># host name, then the address to connect to</span>
R2 ansible_host=10.99.0.2

[routers:vars]                  <span class="c"># variables for EVERY host in the group</span>
ansible_user=netops             <span class="c"># SSH username</span>
ansible_network_os=ios          <span class="c"># what kind of device (Cisco IOS)</span>
ansible_connection=network_cli  <span class="c"># talk over SSH, using the CLI</span></pre>
<p>The block <code>[routers:vars]</code> means "these variables apply to every host in the group routers", so you write the username once instead of twice. The three <code>ansible_network_os</code>, <code>ansible_connection</code> and <code>ansible_user</code> lines tell Ansible the device type, how to talk, and who to log in as. A password is also needed. In the simulator lab the inventory file contains a lab-only password line so the exercise can run. <b>In real life never write a password in a file that goes to Git.</b> Chapter 7 shows how a vault protects it.</p>

<h3>Looking at the inventory with ansible-inventory</h3>
<p>Before running anything, ask Ansible how it understands the file. <code>--graph</code> draws groups and hosts as a tree:</p>
<pre class="code">ansible-inventory -i inventory.ini --graph</pre>
<pre class="out">@all:
  |--@ungrouped:
  |--@routers:
  |  |--R1
  |  |--R2</pre>
<p><code>-i</code> means "which inventory file". <code>@all</code> is a built-in group that contains every host. <code>@ungrouped</code> holds hosts that are in no group. The tree answers the first lab question: two hosts are in the group <code>routers</code>. To see every variable one host receives, use <code>--host</code>:</p>
<pre class="code">ansible-inventory -i inventory.ini --host R1</pre>
<pre class="out">{
    "ansible_user": "netops",
    <span class="hl">...</span>
    "ansible_network_os": "ios",
    "ansible_connection": "network_cli",
    "ansible_host": "10.99.0.1"
}</pre>
<p>(The password line is left out here on purpose.) The curly-brace layout is called JSON, another text format for data. Note that group variables and the host's own <code>ansible_host</code> are merged into one list.</p>

<h3>Testing the login with the ping module</h3>
<p>Ansible's <code>ping</code> module is not an ICMP ping. It logs in to the device over SSH and answers <b>pong</b> if that worked. It is the first test after writing an inventory. The syntax is <code>ansible GROUP -i FILE -m MODULE</code>: <code>-m</code> chooses the module. In Lab 1 the inventory has a typo, R2 is written as <code>10.99.0.21</code> instead of <code>10.99.0.2</code>:</p>
<pre class="code">ansible routers -i inventory.ini -m ping</pre>
<pre class="out">R1 | SUCCESS =&gt; {
    "changed": false,
    "ping": "pong"
}
R2 | <span class="hl">UNREACHABLE!</span> =&gt; {
    "changed": false,
    "msg": "ssh connect failed: Connection timed out",
    "unreachable": true
}</pre>
<p><b>UNREACHABLE</b> means Ansible could not even open the SSH connection: wrong IP address, no route, a firewall, or SSH switched off. Fix the address with one find-and-replace and test again:</p>
<pre class="code">sed -i 's/10.99.0.21/10.99.0.2/' inventory.ini
ansible routers -i inventory.ini -m ping</pre>
<pre class="out">R1 | SUCCESS =&gt; {
    "changed": false,
    "ping": "pong"
}
R2 | <span class="hl">SUCCESS</span> =&gt; {
    "changed": false,
    "ping": "pong"
}</pre>
<p>Both routers answer <b>pong</b>, and "changed": false tells you the module did not alter anything. Two different failure words exist: <b>UNREACHABLE</b> (cannot connect) and <b>FAILED</b> (connected, but login or the task failed, for example a wrong password). Chapter 8 shows a FAILED example.</p>

<h3>Good inventory habits</h3>
<ul><li>Group devices by role or place: <code>[routers]</code>, <code>[switches]</code>, <code>[pune_branch]</code>. A device can be in several groups.</li><li>Use readable host names, and put the IP in <code>ansible_host</code>. Names appear in the output, so make them recognisable.</li><li>Keep variables that apply to everyone in <code>:vars</code> or, in bigger projects, in <code>group_vars</code> files (covered in the Ansible track).</li><li>Store the inventory in Git next to the playbooks.</li><li>Test every new inventory with ping before anything else.</li></ul>

<div class="eg"><p><b>Worked example.</b> Lab 1, tasks 1 and 2. You run ansible-inventory --graph and count two hosts under @routers. Ping shows R1 pong and R2 UNREACHABLE. Comparing R2 with the actual address 10.99.0.2 reveals the typo 10.99.0.21. One sed command later, both answer pong, and the playbooks can run.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Putting a space around the equals sign (ansible_host = 10.99.0.1 is wrong; write ansible_host=10.99.0.1). Misspelling the group name in the playbook so that no host matches. Committing a real password in the inventory.</p></div>
<div class="exam"><p><b>Exam trap.</b> The ping module tests that Ansible can log in, not ICMP reachability. UNREACHABLE means no connection; FAILED means the connection worked but something else did not. The group "all" always exists.</p></div>

<div class="scn"><h4>The one-digit typo</h4><p>A new engineer built an inventory for 30 branch routers and the very first ping run showed 29 pongs and one UNREACHABLE. Instead of rebooting anything, he compared the failing line with the site list, saw 10.20.4.211 instead of 10.20.4.21, fixed the character, and the ping run was clean. He then added that ping test to the pipeline so every inventory change is checked automatically.</p><p><b>Lesson:</b> a failed ping on one host usually points at that host's line in the inventory, not at the network.</p></div>
<div class="iv"><p class="q">"What is an Ansible inventory and how do you check it?"</p><p>The inventory is a file listing the managed hosts, organised in groups, with variables such as ansible_host, ansible_user, ansible_network_os and ansible_connection. I check it with ansible-inventory --graph to see the groups and --host to see one device's variables, then ansible GROUP -m ping to prove SSH login works. UNREACHABLE points to addressing or connectivity, FAILED to credentials.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>The inventory lists devices in groups; a play targets a group.</li><li>ansible_host holds the address; ansible_user, ansible_network_os and ansible_connection describe how to log in.</li><li>ansible-inventory --graph and --host show how Ansible reads the file.</li><li>The ping module tests SSH login and returns pong; UNREACHABLE means no connection, FAILED means a login or task problem.</li><li>Never store a real password in the inventory file in Git; use a vault.</li></ul></div>

`,hi:`

<p><b>Is chapter ki ek idea:</b> Ansible kuch bhi karne se pehle jaanna chahta hai ki kisse baat karni hai. Woh list <b>inventory</b> hai, aur woh bas ek chhoti si text file hai.</p>
<div class="dia"><svg viewBox="0 0 640 205" role="img" aria-label="Inventory hosts ko groups mein rakhti hai; playbook ek group ka naam leta hai, alag-alag devices ka nahi."><rect x="20" y="20" width="600" height="170" rx="12" fill="#f1f5f9" stroke="#cbd5e1"/><text x="40" y="45" class="svg-ink" font-size="14">all</text><rect x="70" y="60" width="240" height="110" rx="10" fill="#bae6fd"/><text x="190" y="82" text-anchor="middle" class="svg-ink" font-size="13">group: routers</text><rect x="90" y="95" width="90" height="48" rx="8" fill="#ffffff" stroke="#64748b"/><text x="135" y="124" text-anchor="middle" class="svg-ink" font-size="13">R1</text><rect x="200" y="95" width="90" height="48" rx="8" fill="#ffffff" stroke="#64748b"/><text x="245" y="124" text-anchor="middle" class="svg-ink" font-size="13">R2</text><rect x="340" y="60" width="240" height="110" rx="10" fill="#bbf7d0"/><text x="460" y="82" text-anchor="middle" class="svg-ink" font-size="13">group: switches (doosra lab)</text><rect x="400" y="95" width="90" height="48" rx="8" fill="#ffffff" stroke="#64748b"/><text x="445" y="124" text-anchor="middle" class="svg-ink" font-size="13">SW1</text></svg><p class="cap">The inventory puts hosts into groups; a playbook names a group, not single devices.</p></div>

<h3>Inventory file padhna</h3>
<p>Sabse simple format INI style hai (file type ke naam par). Square brackets mein ek word <b>group</b> shuru karta hai. Uske neeche har line ek <b>host</b> hai: aapka chuna hua naam, uske baad variables jaise connect karne ka address. <b>Variable</b> ek naam hai jo value rakhta hai, jaise box par label. Yahan <code>ansible_host</code> label hai aur <code>10.99.0.1</code> andar ki cheez.</p>
<pre class="code"><span class="c"># inventory.ini</span>
[routers]                       <span class="c"># GROUP ka naam square brackets mein</span>
R1 ansible_host=10.99.0.1       <span class="c"># host ka naam, phir connect karne ka address</span>
R2 ansible_host=10.99.0.2

[routers:vars]                  <span class="c"># group ke HAR host ke variables</span>
ansible_user=netops             <span class="c"># SSH username</span>
ansible_network_os=ios          <span class="c"># kaisa device (Cisco IOS)</span>
ansible_connection=network_cli  <span class="c"># SSH par, CLI se baat karo</span></pre>
<p><code>[routers:vars]</code> block ka matlab "yeh variables group routers ke har host par lagte hain", isliye username do baar ke bajaye ek baar likhte ho. <code>ansible_network_os</code>, <code>ansible_connection</code> aur <code>ansible_user</code> lines Ansible ko device type, baat karne ka tareeka aur kis user se login karna hai batati hain. Password bhi chahiye. Simulator lab mein exercise chalane ke liye inventory file mein sirf lab ke liye ek password line hai. <b>Asli zindagi mein jo file Git mein jaati hai usme kabhi password mat likho.</b> Chapter 7 dikhata hai ki vault use kaise protect karta hai.</p>

<h3>ansible-inventory se inventory dekhna</h3>
<p>Kuch chalane se pehle Ansible se poochho ki woh file ko kaise samajhta hai. <code>--graph</code> groups aur hosts ko tree ki tarah dikhata hai:</p>
<pre class="code">ansible-inventory -i inventory.ini --graph</pre>
<pre class="out">@all:
  |--@ungrouped:
  |--@routers:
  |  |--R1
  |  |--R2</pre>
<p><code>-i</code> ka matlab "kaun si inventory file". <code>@all</code> built-in group hai jisme har host hai. <code>@ungrouped</code> mein woh hosts hain jo kisi group mein nahi. Tree pehle lab sawaal ka jawab deta hai: group <code>routers</code> mein do hosts hain. Ek host ko milne wale saare variables dekhne ke liye <code>--host</code> use karo:</p>
<pre class="code">ansible-inventory -i inventory.ini --host R1</pre>
<pre class="out">{
    "ansible_user": "netops",
    <span class="hl">...</span>
    "ansible_network_os": "ios",
    "ansible_connection": "network_cli",
    "ansible_host": "10.99.0.1"
}</pre>
<p>(Password line jaan-boojhkar hataayi gayi hai.) Curly-brace layout JSON kehlata hai, data ka ek aur text format. Dhyan do ki group variables aur host ka apna <code>ansible_host</code> ek list mein mil gaye.</p>

<h3>Ping module se login test karna</h3>
<p>Ansible ka <code>ping</code> module ICMP ping nahi hai. Woh device mein SSH se login karta hai aur agar kaam hua to <b>pong</b> kehta hai. Inventory likhne ke baad yeh pehla test hai. Syntax hai <code>ansible GROUP -i FILE -m MODULE</code>: <code>-m</code> module chunta hai. Lab 1 mein inventory mein typo hai, R2 <code>10.99.0.2</code> ke bajaye <code>10.99.0.21</code> likha hai:</p>
<pre class="code">ansible routers -i inventory.ini -m ping</pre>
<pre class="out">R1 | SUCCESS =&gt; {
    "changed": false,
    "ping": "pong"
}
R2 | <span class="hl">UNREACHABLE!</span> =&gt; {
    "changed": false,
    "msg": "ssh connect failed: Connection timed out",
    "unreachable": true
}</pre>
<p><b>UNREACHABLE</b> matlab Ansible SSH connection khol hi nahi saka: galat IP address, route nahi, firewall, ya SSH band. Ek find-and-replace se address theek karo aur dobara test karo:</p>
<pre class="code">sed -i 's/10.99.0.21/10.99.0.2/' inventory.ini
ansible routers -i inventory.ini -m ping</pre>
<pre class="out">R1 | SUCCESS =&gt; {
    "changed": false,
    "ping": "pong"
}
R2 | <span class="hl">SUCCESS</span> =&gt; {
    "changed": false,
    "ping": "pong"
}</pre>
<p>Dono routers <b>pong</b> kehte hain, aur "changed": false batata hai ki module ne kuch nahi badla. Do alag failure words hote hain: <b>UNREACHABLE</b> (connect nahi hua) aur <b>FAILED</b> (connect hua, par login ya task fail hua, jaise galat password). Chapter 8 FAILED ka example dikhata hai.</p>

<h3>Achhi inventory aadatein</h3>
<ul><li>Devices ko role ya jagah se group karo: <code>[routers]</code>, <code>[switches]</code>, <code>[pune_branch]</code>. Ek device kai groups mein ho sakta hai.</li><li>Padhne layak host names rakho, aur IP <code>ansible_host</code> mein. Naam output mein dikhte hain, isliye pehchanne layak rakho.</li><li>Sabke liye lagne wale variables <code>:vars</code> mein rakho ya bade projects mein <code>group_vars</code> files mein (Ansible track mein).</li><li>Inventory ko Git mein playbooks ke saath rakho.</li><li>Har nayi inventory ko sabse pehle ping se test karo.</li></ul>

<div class="eg"><p><b>Worked example.</b> Lab 1, tasks 1 aur 2. Aap ansible-inventory --graph chalate ho aur @routers ke neeche do hosts ginte ho. Ping R1 pong aur R2 UNREACHABLE dikhata hai. R2 ko asli address 10.99.0.2 se compare karne par typo 10.99.0.21 dikhta hai. Ek sed command ke baad dono pong kehte hain, aur playbooks chal sakte hain.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Equals sign ke aas-paas space daalna (ansible_host = 10.99.0.1 galat hai; ansible_host=10.99.0.1 likho). Playbook mein group ka naam galat likhna jisse koi host match na ho. Inventory mein asli password commit karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Ping module test karta hai ki Ansible login kar sakta hai ya nahi, ICMP reachability nahi. UNREACHABLE matlab connection nahi; FAILED matlab connection hua par kuch aur fail hua. Group "all" hamesha maujood hota hai.</p></div>

<div class="scn"><h4>Ek digit ka typo</h4><p>Ek naye engineer ne 30 branch routers ki inventory banayi aur pehle hi ping run mein 29 pong aur ek UNREACHABLE aaya. Kuch reboot karne ke bajaye usne failing line ko site list se compare kiya, 10.20.4.21 ke bajaye 10.20.4.211 dekha, character theek kiya, aur ping run saaf aaya. Phir usne woh ping test pipeline mein jod diya taaki har inventory change apne aap check ho.</p><p><b>Lesson:</b> ek host par failed ping aam taur par us host ki inventory line ki taraf ishaara karta hai, network ki taraf nahi.</p></div>
<div class="iv"><p class="q">"Ansible inventory kya hai aur use kaise check karte ho?"</p><p>Inventory ek file hai jo managed hosts ko groups mein list karti hai, ansible_host, ansible_user, ansible_network_os aur ansible_connection jaise variables ke saath. Main use ansible-inventory --graph se groups dekhne, --host se ek device ke variables dekhne, aur phir ansible GROUP -m ping se SSH login saabit karne ke liye check karta hoon. UNREACHABLE addressing ya connectivity ki taraf, FAILED credentials ki taraf ishaara karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Inventory devices ko groups mein list karti hai; play ek group ko target karta hai.</li><li>ansible_host address rakhta hai; ansible_user, ansible_network_os aur ansible_connection login ka tareeka batate hain.</li><li>ansible-inventory --graph aur --host dikhate hain ki Ansible file ko kaise padhta hai.</li><li>Ping module SSH login test karke pong deta hai; UNREACHABLE matlab connection nahi, FAILED matlab login ya task problem.</li><li>Asli password inventory file mein Git mein mat rakho; vault use karo.</li></ul></div>

`}};export{e as default};