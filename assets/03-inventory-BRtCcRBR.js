var e={id:`inventory`,h:{en:`One inventory, one group per platform (Lab 1, step 1)`,hi:`Ek inventory, har platform ka ek group (Lab 1, step 1)`},body:{en:`
<p>In <code>ans-inventory</code> you built an inventory for IOS routers. A multivendor inventory has the same parts, but the groups now mean something extra: <b>a group is a platform</b>. Everything a platform shares (the network OS, the connection plugin) lives in the group's variables, so a new Junos router needs only its name and address.</p>

<h3>The project layout</h3>
<p>Log in to AUTO01 and move to the project. It already holds <code>ansible.cfg</code>, which points at <code>inventory.yml</code> and switches host key checking off for the lab (real networks keep it on or pre-load the keys).</p>
<pre class="code"><span class="c"># ~/mvauto/ansible.cfg (given)</span>
[defaults]
inventory = inventory.yml
host_key_checking = False</pre>
<p>Write the inventory with a heredoc, as in the earlier modules:</p>
<pre class="code">AUTO01$ cd ~/mvauto
AUTO01$ mkdir -p group_vars
AUTO01$ cat &gt; inventory.yml &lt;&lt;'EOF'
all:
  children:
    ios:
      hosts:
        R1:
          ansible_host: 10.99.0.1
    junos:
      hosts:
        J1:
          ansible_host: 10.99.0.11
    eos:
      hosts:
        E1:
          ansible_host: 10.99.0.21
    network:
      children:
        ios:
        junos:
        eos:
EOF</pre>
<p>Four groups: three platform groups with one host each, and <code>network</code>, a parent that lists the other three as <code>children</code>. A play with <code>hosts: network</code> reaches all three vendors.</p>

<h3>group_vars: shared values and platform values</h3>
<p>Now the variables. <code>group_vars/network.yml</code> holds what all devices share; one file per platform holds the language and the phone line.</p>
<pre class="code"><span class="c"># group_vars/network.yml</span>
ansible_user: netops
ansible_password: NK@2026
ntp_server: 192.0.2.123
syslog_server: 192.0.2.50

<span class="c"># group_vars/ios.yml</span>
ansible_network_os: cisco.ios.ios
ansible_connection: ansible.netcommon.network_cli

<span class="c"># group_vars/junos.yml</span>
ansible_network_os: junipernetworks.junos.junos
ansible_connection: ansible.netcommon.network_cli

<span class="c"># group_vars/eos.yml</span>
ansible_network_os: arista.eos.eos
ansible_connection: ansible.netcommon.network_cli</pre>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Where a host gets its variables">
<rect x="8" y="14" width="190" height="54" rx="10" fill="#bae6fd"/><text x="103" y="38" text-anchor="middle" class="svg-ink" font-size="12">group_vars/network.yml</text><text x="103" y="56" text-anchor="middle" class="svg-muted" font-size="11">user, password, ntp, syslog</text>
<rect x="225" y="14" width="190" height="54" rx="10" fill="#ddd6fe"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="12">group_vars/junos.yml</text><text x="320" y="56" text-anchor="middle" class="svg-muted" font-size="11">network_os, connection</text>
<rect x="442" y="14" width="190" height="54" rx="10" fill="#fde68a"/><text x="537" y="38" text-anchor="middle" class="svg-ink" font-size="12">host_vars/J1.yml (optional)</text><text x="537" y="56" text-anchor="middle" class="svg-muted" font-size="11">one-device exception</text>
<rect x="225" y="92" width="190" height="46" rx="10" fill="#bbf7d0"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">Variables of J1</text>
<line x1="103" y1="68" x2="260" y2="92" stroke="#64748b" stroke-width="2"/><line x1="320" y1="68" x2="320" y2="92" stroke="#64748b" stroke-width="2"/><line x1="537" y1="68" x2="380" y2="92" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The closer the file is to the host, the stronger it is. A host_vars file beats the platform group, which beats the shared group.</p></div>

<h3>See what Ansible sees</h3>
<p>Never guess. Ask Ansible for the merged variables of one host:</p>
<pre class="out">AUTO01$ ansible-inventory --host J1
{
    "ansible_connection": "ansible.netcommon.network_cli",
    "ansible_host": "10.99.0.11",
    <span class="hl">"ansible_network_os": "junipernetworks.junos.junos",</span>
    "ansible_password": "NK@2026",
    "ansible_user": "netops",
    "ntp_server": "192.0.2.123",
    "syslog_server": "192.0.2.50"
}</pre>
<p>The last two lines come from <code>network.yml</code>, the network OS from <code>junos.yml</code>, the address from the inventory. Add a one-line <code>host_vars/J1.yml</code> with <code>ntp_server: 192.0.2.124</code> and the same command shows the exception winning for J1 only.</p>

<h3>First contact: ping</h3>
<pre class="out">AUTO01$ ansible network -m ansible.builtin.ping
R1 | SUCCESS =&gt; {
    "changed": false,
    "ping": "pong"
}
J1 | SUCCESS =&gt; {
    "changed": false,
    "ping": "pong"
}
E1 | SUCCESS =&gt; {
    "changed": false,
    "ping": "pong"
}</pre>
<div class="note"><p><b>In the lab vs on real gear.</b> In this lab the <code>ping</code> module logs in to the device through the connection plugin and answers <i>pong</i>, so it proves that user, password, network OS and transport are right. I am not sure it behaves the same way on every real collection version, because a router has no Python for the classic ping. On real equipment, a safe first-contact test is a harmless command such as <code>ansible.netcommon.cli_command</code> with <code>show version</code>, or the platform's own <code>*_facts</code> module (Chapter 4).</p></div>

<div class="eg"><p><b>Worked example: one play or one play per platform?</b> You can write one play on <code>network</code> and guard each task with <code>when: ansible_network_os == 'cisco.ios.ios'</code> (Lab 1 does this and the recap shows <i>skipping</i> lines), or write one play per group with <code>hosts: ios</code>, <code>hosts: junos</code>, <code>hosts: eos</code> (Lab 2 does this and the output is quieter). Both are valid. The single-play style keeps the whole intent in one place; the per-group style avoids <code>when</code> noise but repeats the play header.</p></div>
<div class="warn"><p><b>Common mistake.</b> Putting <code>ansible_password</code> in group_vars as plain text and committing it. The lab does it with the lab value only. Real projects keep the password in an Ansible Vault file (<code>ans-roles</code>) or fetch it at run time; Python teams do the same with environment variables or a vault server (<code>py-secrets</code>, and <code>adv-vault</code> later).</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ansible-inventory --graph</code> shows group structure, <code>--host NAME</code> shows the merged variables of one host. To debug a missing variable use <code>--host</code>, not <code>--graph</code>.</p></div>

<div class="scn"><h4>One router with a different NTP server</h4><p>After a change, 40 devices showed the new NTP server and one Junos router did not. <code>--check --diff</code> against it reported nothing to do. The engineer ran <code>ansible-inventory --host</code> on that router and saw <code>ntp_server</code> with an old address: a forgotten <code>host_vars</code> file from a test two years ago was overriding the group value.</p><p><b>Lesson:</b> when one host disagrees with its group, inspect the merged variables first, then delete the stale override or document it.</p></div>
<div class="iv"><p class="q">"How do you structure a multivendor inventory?"</p><p>One group per platform with <code>ansible_network_os</code> and <code>ansible_connection</code> in group_vars, a parent group for the whole fleet that holds shared values and credentials, host_vars only for real exceptions, and secrets in Vault. I verify with <code>ansible-inventory --host</code>.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A group is a platform: the network OS and the connection plugin belong in its group_vars.</li>
<li>A parent group (<code>network</code>) carries shared values such as credentials and the NTP server.</li>
<li>Precedence: host_vars beat the platform group, which beats the parent group.</li>
<li><code>ansible-inventory --graph</code> and <code>--host</code> show structure and merged variables.</li>
<li>Prove first contact with a harmless login test, and keep real passwords in Vault.</li></ul></div>
`,hi:`
<p><code>ans-inventory</code> mein aapne IOS routers ki inventory banayi thi. Multivendor inventory ke hisse wahi hain, par groups ka ab ek extra matlab hai: <b>group ek platform hai</b>. Jo kuch ek platform share karta hai (network OS, connection plugin) woh group ke variables mein rehta hai, isliye naye Junos router ko sirf naam aur address chahiye.</p>

<h3>Project ka layout</h3>
<p>AUTO01 par login karo aur project mein jao. Usme <code>ansible.cfg</code> pehle se hai, jo <code>inventory.yml</code> ki taraf ishara karti hai aur lab ke liye host key checking band karti hai (real networks mein yeh on rehti hai ya keys pehle se load hoti hain).</p>
<pre class="code"><span class="c"># ~/mvauto/ansible.cfg (given)</span>
[defaults]
inventory = inventory.yml
host_key_checking = False</pre>
<p>Pehle ke modules ki tarah heredoc se inventory likho:</p>
<pre class="code">AUTO01$ cd ~/mvauto
AUTO01$ mkdir -p group_vars
AUTO01$ cat &gt; inventory.yml &lt;&lt;'EOF'
all:
  children:
    ios:
      hosts:
        R1:
          ansible_host: 10.99.0.1
    junos:
      hosts:
        J1:
          ansible_host: 10.99.0.11
    eos:
      hosts:
        E1:
          ansible_host: 10.99.0.21
    network:
      children:
        ios:
        junos:
        eos:
EOF</pre>
<p>Chaar groups: teen platform groups jinme ek ek host hai, aur <code>network</code>, ek parent jo baaki teen ko <code>children</code> ki tarah list karta hai. <code>hosts: network</code> wali play teeno vendors tak pahunchti hai.</p>

<h3>group_vars: shared values aur platform values</h3>
<p>Ab variables. <code>group_vars/network.yml</code> mein woh hai jo sabhi devices share karte hain; har platform ki ek file mein bhasha aur phone line hai.</p>
<pre class="code"><span class="c"># group_vars/network.yml</span>
ansible_user: netops
ansible_password: NK@2026
ntp_server: 192.0.2.123
syslog_server: 192.0.2.50

<span class="c"># group_vars/ios.yml</span>
ansible_network_os: cisco.ios.ios
ansible_connection: ansible.netcommon.network_cli

<span class="c"># group_vars/junos.yml</span>
ansible_network_os: junipernetworks.junos.junos
ansible_connection: ansible.netcommon.network_cli

<span class="c"># group_vars/eos.yml</span>
ansible_network_os: arista.eos.eos
ansible_connection: ansible.netcommon.network_cli</pre>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Host ko variables kahan se milte hain">
<rect x="8" y="14" width="190" height="54" rx="10" fill="#bae6fd"/><text x="103" y="38" text-anchor="middle" class="svg-ink" font-size="12">group_vars/network.yml</text><text x="103" y="56" text-anchor="middle" class="svg-muted" font-size="11">user, password, ntp, syslog</text>
<rect x="225" y="14" width="190" height="54" rx="10" fill="#ddd6fe"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="12">group_vars/junos.yml</text><text x="320" y="56" text-anchor="middle" class="svg-muted" font-size="11">network_os, connection</text>
<rect x="442" y="14" width="190" height="54" rx="10" fill="#fde68a"/><text x="537" y="38" text-anchor="middle" class="svg-ink" font-size="12">host_vars/J1.yml (optional)</text><text x="537" y="56" text-anchor="middle" class="svg-muted" font-size="11">ek device ka exception</text>
<rect x="225" y="92" width="190" height="46" rx="10" fill="#bbf7d0"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">J1 ke variables</text>
<line x1="103" y1="68" x2="260" y2="92" stroke="#64748b" stroke-width="2"/><line x1="320" y1="68" x2="320" y2="92" stroke="#64748b" stroke-width="2"/><line x1="537" y1="68" x2="380" y2="92" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">File host ke jitni paas, utni taakatwar. host_vars file platform group ko haraati hai, aur platform group shared group ko.</p></div>

<h3>Dekho Ansible kya dekhta hai</h3>
<p>Andaza mat lagao. Ansible se ek host ke merged variables maango:</p>
<pre class="out">AUTO01$ ansible-inventory --host J1
{
    "ansible_connection": "ansible.netcommon.network_cli",
    "ansible_host": "10.99.0.11",
    <span class="hl">"ansible_network_os": "junipernetworks.junos.junos",</span>
    "ansible_password": "NK@2026",
    "ansible_user": "netops",
    "ntp_server": "192.0.2.123",
    "syslog_server": "192.0.2.50"
}</pre>
<p>Aakhri do lines <code>network.yml</code> se aati hain, network OS <code>junos.yml</code> se, address inventory se. <code>host_vars/J1.yml</code> mein ek line <code>ntp_server: 192.0.2.124</code> jodo aur wahi command dikhata hai ki exception sirf J1 ke liye jeet gaya.</p>

<h3>First contact: ping</h3>
<pre class="out">AUTO01$ ansible network -m ansible.builtin.ping
R1 | SUCCESS =&gt; {
    "changed": false,
    "ping": "pong"
}
J1 | SUCCESS =&gt; {
    "changed": false,
    "ping": "pong"
}
E1 | SUCCESS =&gt; {
    "changed": false,
    "ping": "pong"
}</pre>
<div class="note"><p><b>In the lab vs on real gear.</b> Is lab mein <code>ping</code> module connection plugin se device mein login karta hai aur <i>pong</i> lautata hai, isliye yeh saabit karta hai ki user, password, network OS aur transport sahi hain. Mujhe pakka nahi ki yeh har real collection version par aise hi chalta hai, kyunki router mein classic ping ke liye Python nahi hota. Real equipment par first-contact test ke liye safe tareeka koi harmless command hai jaise <code>ansible.netcommon.cli_command</code> ke saath <code>show version</code>, ya platform ka apna <code>*_facts</code> module (Chapter 4).</p></div>

<div class="eg"><p><b>Worked example: ek play ya har platform ki ek play?</b> Aap <code>network</code> par ek play likh sakte ho aur har task ko <code>when: ansible_network_os == 'cisco.ios.ios'</code> se guard kar sakte ho (Lab 1 yeh karta hai aur recap mein <i>skipping</i> lines dikhti hain), ya har group ke liye ek play <code>hosts: ios</code>, <code>hosts: junos</code>, <code>hosts: eos</code> (Lab 2 yeh karta hai aur output shaant rehta hai). Dono valid hain. Single-play style poora intent ek jagah rakhti hai; per-group style <code>when</code> ka shor hata deti hai par play header dohrati hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> <code>ansible_password</code> ko group_vars mein plain text mein rakhna aur commit kar dena. Lab sirf lab value ke saath aisa karta hai. Real projects password ko Ansible Vault file mein (<code>ans-roles</code>) rakhte hain ya run time par laate hain; Python teams environment variables ya vault server se yahi karti hain (<code>py-secrets</code>, aur baad mein <code>adv-vault</code>).</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ansible-inventory --graph</code> group structure dikhata hai, <code>--host NAME</code> ek host ke merged variables. Gayab variable debug karne ke liye <code>--host</code> use karo, <code>--graph</code> nahi.</p></div>

<div class="scn"><h4>Ek router, alag NTP server</h4><p>Ek change ke baad 40 devices par naya NTP server dikha aur ek Junos router par nahi. Us par <code>--check --diff</code> ne kuch karne ko nahi bataya. Engineer ne us router par <code>ansible-inventory --host</code> chalaya aur <code>ntp_server</code> ka purana address dekha: do saal pehle test ki bhooli hui <code>host_vars</code> file group value ko override kar rahi thi.</p><p><b>Lesson:</b> jab ek host apne group se asehmat ho, pehle merged variables dekho, phir purana override hatao ya document karo.</p></div>
<div class="iv"><p class="q">"Multivendor inventory ko kaise structure karoge?"</p><p>Har platform ka ek group jisme group_vars mein <code>ansible_network_os</code> aur <code>ansible_connection</code> ho, poore fleet ka ek parent group jo shared values aur credentials rakhe, host_vars sirf asli exceptions ke liye, aur secrets Vault mein. Main <code>ansible-inventory --host</code> se verify karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Group ek platform hai: network OS aur connection plugin uske group_vars mein jaate hain.</li>
<li>Parent group (<code>network</code>) shared values rakhta hai jaise credentials aur NTP server.</li>
<li>Precedence: host_vars platform group se jeette hain, platform group parent group se.</li>
<li><code>ansible-inventory --graph</code> aur <code>--host</code> structure aur merged variables dikhate hain.</li>
<li>First contact harmless login test se saabit karo, aur real passwords Vault mein rakho.</li></ul></div>
`}};export{e as default};