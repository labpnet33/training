var e={id:`connection-vars`,h:{en:`Connection variables and keeping the password in a vault`,hi:`Connection variables aur password ko vault mein rakhna`},body:{en:`
<p>Network devices are not Linux servers. Ansible cannot log in over plain SSH and run Python on them. Instead it opens a CLI session, types commands and reads the answers, much like you do in PuTTY. Which method, which operating system and which login to use are all told to Ansible through <b>connection variables</b>. You set them once, in <code>group_vars/all</code>, and every device follows.</p>

<h3>The four variables you always need</h3>
<table class="cmp"><tr><th>Variable</th><th>Value in our lab</th><th>What it tells Ansible</th></tr>
<tr><td><code>ansible_connection</code></td><td><code>ansible.netcommon.network_cli</code></td><td>Use an SSH CLI session, not Python on the device</td></tr>
<tr><td><code>ansible_network_os</code></td><td><code>cisco.ios.ios</code></td><td>Which command language and prompts to expect</td></tr>
<tr><td><code>ansible_user</code></td><td><code>netops</code></td><td>The login name</td></tr>
<tr><td><code>ansible_password</code></td><td>a secret</td><td>The login password</td></tr></table>
<p>Without <code>ansible_network_os</code>, Ansible does not know it is talking to a Cisco IOS box. Without the connection type, it tries ordinary SSH and Python, which routers cannot do. These are the two most common reasons a first network playbook fails.</p>

<h3>Why the password must not sit in plain text</h3>
<p>If you write <code>ansible_password: NK@2026</code> in a group_vars file, anybody who can read the project folder, including your Git history, can read the password. Even the inventory tool prints it:</p>
<pre class="out">AUTO01$ ansible-inventory --host pun-core-r1
{
    "ansible_connection": "ansible.netcommon.network_cli",
    "ansible_host": "10.99.0.1",
    "ansible_network_os": "cisco.ios.ios",
    "ansible_password": "NK@2026",
    "ansible_user": "netops",
    "site": "Pune",
    "snmp_contact": "core-oncall@nk.lab",
    "snmp_location": "Pune core room"
}</pre>
<p><b>NK@2026 is a lab-only value.</b> Real passwords never go in a plain file. The tool for this is <b>ansible-vault</b>, which encrypts a file with a passphrase. The usual pattern has two files in a <code>group_vars/all/</code> folder.</p>

<h3>The vault pattern</h3>
<pre class="code">AUTO01$ cat group_vars/all/vars.yml
ansible_connection: ansible.netcommon.network_cli
ansible_network_os: cisco.ios.ios
ansible_user: netops
ansible_password: "{{ vault_netops_password }}"

AUTO01$ cat group_vars/all/vault.yml
vault_netops_password: NK@2026</pre>
<ul>
<li><code>vars.yml</code> stays readable. Its password line is only a <b>pointer</b>: it says "use the value of <code>vault_netops_password</code>". The quotes are required because the value starts with curly braces.</li>
<li><code>vault.yml</code> holds the real secret, and by convention its variable names start with <code>vault_</code>.</li>
<li>Making <code>group_vars/all</code> a folder is allowed; Ansible reads every file in it.</li>
</ul>
<p>Now encrypt the secret file. The passphrase is kept in a separate file that you never commit to Git:</p>
<pre class="out">AUTO01$ ansible-vault encrypt group_vars/all/vault.yml --vault-password-file .vault_pass
Encryption successful
AUTO01$ cat group_vars/all/vault.yml
$ANSIBLE_VAULT;1.1;AES256
32303261323766313939613863623135373464323966303266663331303238310a35363961656161
396239633863383262356431346366396162393330356539610a6231323939326431393932333535
30326331653163363763363938323332396134626337613436653430643161373531666630633230
6564666366313166</pre>
<p>The file is now unreadable ciphertext and safe to share. Run a command without the passphrase and Ansible refuses:</p>
<pre class="out">AUTO01$ ansible all -m ping
ERROR! Attempting to decrypt but no vault secrets found
AUTO01$ ansible all -m ping --vault-password-file .vault_pass
pun-core-r1 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
pun-acc-sw1 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
blr-edge-r2 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}</pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Vault flow from pointer to secret">
<rect x="20" y="60" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="105" y="88" text-anchor="middle" class="svg-ink" font-size="13">vars.yml</text><text x="105" y="110" text-anchor="middle" class="svg-muted" font-size="11">ansible_password: pointer</text>
<rect x="235" y="60" width="170" height="70" rx="10" fill="#fde68a"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="13">vault.yml (encrypted)</text><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="11">real secret</text>
<rect x="450" y="60" width="170" height="70" rx="10" fill="#bae6fd"/><text x="535" y="88" text-anchor="middle" class="svg-ink" font-size="13">.vault_pass</text><text x="535" y="110" text-anchor="middle" class="svg-muted" font-size="11">passphrase, not in Git</text>
<line x1="190" y1="95" x2="235" y2="95" stroke="#64748b" stroke-width="2"/><line x1="450" y1="95" x2="405" y2="95" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The pointer names the secret; the passphrase file unlocks it at run time.</p></div>

<h3>Stop typing the passphrase option</h3>
<p>Add one line to <code>ansible.cfg</code>, and also list <code>.vault_pass</code> in <code>.gitignore</code>:</p>
<pre class="out">AUTO01$ cat ansible.cfg
[defaults]
inventory = inventory.yml
host_key_checking = False
vault_password_file = .vault_pass</pre>
<p>Ping now works with no option. You can also encrypt just one value inside an otherwise readable file with <code>ansible-vault encrypt_string</code>; the result is a <code>!vault</code> block that you paste into a vars file.</p>

<h3>Other connection variables (reference only)</h3>
<p>Reference configuration (not run in the simulator):</p>
<pre class="code">ansible_port: 22
ansible_become: true
ansible_become_method: enable
ansible_command_timeout: 60
# an API-based device would use a different connection type,
# for example ansible.netcommon.ht&#116;papi</pre>
<p>Those lines set the SSH port, ask for enable mode, raise the command timeout, and show how API-driven platforms choose another connection type. We use none of them in this lab.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Committing the <code>.vault_pass</code> file to Git next to the vault it opens. That defeats the encryption. Keep the passphrase outside the repository or in a secrets manager, and rotate any password that was ever committed.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ansible-vault view</code> and <code>edit</code> need the passphrase too. Encrypting a file does not hide variable <i>names</i> in the pointer file, only the values in the encrypted file.</p></div>

<div class="scn"><h4>The password in the screenshot</h4><p>A junior shared a screenshot of <code>ansible-inventory --host</code> in a chat while asking for help. It showed the device password in clear text. The team rotated the password and moved it to a vault file the same day. The vault keeps the value out of Git and files, but remember that the inventory command can show decrypted values when the passphrase is available, so treat its output as sensitive and never paste it into chats.</p></div>

<div class="iv"><p class="q">"How do you handle device passwords in Ansible?"</p><p>I never store them in plain variable files. I put a pointer variable in group_vars and the real value in an encrypted ansible-vault file, with the passphrase in an ignored file or a secrets manager. Ansible decrypts it only at run time.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Four connection variables: connection type, network OS, user, password.</li>
<li>Set them once in <code>group_vars/all</code>.</li>
<li>Plain-text passwords leak through files, Git and even inventory output.</li>
<li>Pattern: pointer in <code>vars.yml</code>, secret in encrypted <code>vault.yml</code>.</li>
<li>Keep the passphrase file out of Git; <code>vault_password_file</code> in the config removes the option.</li>
</ul></div>
`,hi:`
<p>Network devices Linux servers nahi hote. Ansible un par plain SSH se login karke Python nahi chala sakta. Iske bajay woh CLI session kholta hai, commands type karta hai aur jawab padhta hai, bilkul waise jaise aap PuTTY mein karte ho. Kaun sa method, kaun sa operating system aur kaun sa login use karna hai, yeh sab Ansible ko <b>connection variables</b> se bataya jaata hai. Inhe ek baar <code>group_vars/all</code> mein set karo, aur har device follow karta hai.</p>

<h3>Chaar variables jo hamesha chahiye</h3>
<table class="cmp"><tr><th>Variable</th><th>Hamare lab mein value</th><th>Ansible ko kya batata hai</th></tr>
<tr><td><code>ansible_connection</code></td><td><code>ansible.netcommon.network_cli</code></td><td>SSH CLI session use karo, device par Python nahi</td></tr>
<tr><td><code>ansible_network_os</code></td><td><code>cisco.ios.ios</code></td><td>Kaunsi command language aur prompts expect karni hain</td></tr>
<tr><td><code>ansible_user</code></td><td><code>netops</code></td><td>Login name</td></tr>
<tr><td><code>ansible_password</code></td><td>ek secret</td><td>Login password</td></tr></table>
<p><code>ansible_network_os</code> ke bina Ansible ko pata nahi chalta ki woh Cisco IOS box se baat kar raha hai. Connection type ke bina woh normal SSH aur Python try karta hai, jo routers nahi kar sakte. Pehla network playbook fail hone ki yeh do sabse common wajah hain.</p>

<h3>Password plain text mein kyun nahi</h3>
<p>Agar aap group_vars file mein <code>ansible_password: NK@2026</code> likhoge, to project folder padh sakne wala har koi, aapki Git history bhi, password padh sakta hai. Inventory tool bhi use print kar deta hai:</p>
<pre class="out">AUTO01$ ansible-inventory --host pun-core-r1
{
    "ansible_connection": "ansible.netcommon.network_cli",
    "ansible_host": "10.99.0.1",
    "ansible_network_os": "cisco.ios.ios",
    "ansible_password": "NK@2026",
    "ansible_user": "netops",
    "site": "Pune",
    "snmp_contact": "core-oncall@nk.lab",
    "snmp_location": "Pune core room"
}</pre>
<p><b>NK@2026 sirf lab ki value hai.</b> Asli passwords kabhi plain file mein nahi jaate. Iske liye tool <b>ansible-vault</b> hai, jo file ko passphrase se encrypt karta hai. Aam pattern mein <code>group_vars/all/</code> folder mein do files hoti hain.</p>

<h3>Vault pattern</h3>
<pre class="code">AUTO01$ cat group_vars/all/vars.yml
ansible_connection: ansible.netcommon.network_cli
ansible_network_os: cisco.ios.ios
ansible_user: netops
ansible_password: "{{ vault_netops_password }}"

AUTO01$ cat group_vars/all/vault.yml
vault_netops_password: NK@2026</pre>
<ul>
<li><code>vars.yml</code> readable rehti hai. Uski password line sirf ek <b>pointer</b> hai: "<code>vault_netops_password</code> ki value use karo". Quotes zaroori hain kyunki value curly braces se shuru hoti hai.</li>
<li><code>vault.yml</code> mein asli secret hai, aur convention hai ki uske variable names <code>vault_</code> se shuru hote hain.</li>
<li><code>group_vars/all</code> ko folder banana allowed hai; Ansible uski har file padhta hai.</li>
</ul>
<p>Ab secret file encrypt karo. Passphrase alag file mein rehta hai jise aap Git mein kabhi commit nahi karte:</p>
<pre class="out">AUTO01$ ansible-vault encrypt group_vars/all/vault.yml --vault-password-file .vault_pass
Encryption successful
AUTO01$ cat group_vars/all/vault.yml
$ANSIBLE_VAULT;1.1;AES256
32303261323766313939613863623135373464323966303266663331303238310a35363961656161
396239633863383262356431346366396162393330356539610a6231323939326431393932333535
30326331653163363763363938323332396134626337613436653430643161373531666630633230
6564666366313166</pre>
<p>File ab unreadable ciphertext hai aur share karne ke liye safe. Passphrase ke bina command chalao to Ansible mana kar deta hai:</p>
<pre class="out">AUTO01$ ansible all -m ping
ERROR! Attempting to decrypt but no vault secrets found
AUTO01$ ansible all -m ping --vault-password-file .vault_pass
pun-core-r1 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
pun-acc-sw1 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
blr-edge-r2 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}</pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Pointer se secret tak vault flow">
<rect x="20" y="60" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="105" y="88" text-anchor="middle" class="svg-ink" font-size="13">vars.yml</text><text x="105" y="110" text-anchor="middle" class="svg-muted" font-size="11">ansible_password: pointer</text>
<rect x="235" y="60" width="170" height="70" rx="10" fill="#fde68a"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="13">vault.yml (encrypted)</text><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="11">asli secret</text>
<rect x="450" y="60" width="170" height="70" rx="10" fill="#bae6fd"/><text x="535" y="88" text-anchor="middle" class="svg-ink" font-size="13">.vault_pass</text><text x="535" y="110" text-anchor="middle" class="svg-muted" font-size="11">passphrase, Git mein nahi</text>
<line x1="190" y1="95" x2="235" y2="95" stroke="#64748b" stroke-width="2"/><line x1="450" y1="95" x2="405" y2="95" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Pointer secret ka naam batata hai; passphrase file run time par use kholti hai.</p></div>

<h3>Passphrase option baar baar type mat karo</h3>
<p><code>ansible.cfg</code> mein ek line jodo, aur <code>.vault_pass</code> ko <code>.gitignore</code> mein bhi likho:</p>
<pre class="out">AUTO01$ cat ansible.cfg
[defaults]
inventory = inventory.yml
host_key_checking = False
vault_password_file = .vault_pass</pre>
<p>Ping ab bina option ke chalta hai. Aap <code>ansible-vault encrypt_string</code> se ek readable file ke andar sirf ek value bhi encrypt kar sakte ho; result ek <code>!vault</code> block hota hai jo aap vars file mein paste karte ho.</p>

<h3>Doosre connection variables (sirf reference)</h3>
<p>Reference configuration (not run in the simulator):</p>
<pre class="code">ansible_port: 22
ansible_become: true
ansible_become_method: enable
ansible_command_timeout: 60
# an API-based device would use a different connection type,
# for example ansible.netcommon.ht&#116;papi</pre>
<p>Yeh lines SSH port set karti hain, enable mode maangti hain, command timeout badhati hain, aur dikhati hain ki API-driven platforms doosra connection type chunte hain. Is lab mein inme se koi use nahi hota.</p>

<div class="warn"><p><b>Common beginner mistake.</b> <code>.vault_pass</code> file ko usi vault ke bagal mein Git mein commit kar dena jise woh kholti hai. Isse encryption bekaar ho jaata hai. Passphrase repository ke bahar ya secrets manager mein rakho, aur jo password kabhi commit hua ho use rotate karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ansible-vault view</code> aur <code>edit</code> ko bhi passphrase chahiye. File encrypt karne se pointer file ke variable <i>names</i> nahi chhupte, sirf encrypted file ki values chhupti hain.</p></div>

<div class="scn"><h4>Screenshot mein password</h4><p>Ek junior ne madad maangte waqt chat mein <code>ansible-inventory --host</code> ka screenshot share kiya. Usme device password clear text mein dikh raha tha. Team ne usi din password rotate kiya aur vault file mein daal diya. Vault value ko Git aur files se bahar rakhta hai, par yaad rakho ki passphrase available ho to inventory command decrypted values dikha sakta hai, isliye uske output ko sensitive maano aur chat mein paste mat karo.</p></div>

<div class="iv"><p class="q">"Ansible mein device passwords kaise handle karte ho?"</p><p>Main unhe kabhi plain variable files mein nahi rakhta. group_vars mein pointer variable aur asli value encrypted ansible-vault file mein, passphrase ignored file ya secrets manager mein. Ansible use sirf run time par decrypt karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chaar connection variables: connection type, network OS, user, password.</li>
<li>Inhe <code>group_vars/all</code> mein ek baar set karo.</li>
<li>Plain-text passwords files, Git aur inventory output se leak hote hain.</li>
<li>Pattern: <code>vars.yml</code> mein pointer, encrypted <code>vault.yml</code> mein secret.</li>
<li>Passphrase file Git se bahar; config mein <code>vault_password_file</code> option hata deta hai.</li>
</ul></div>
`}};export{e as default};