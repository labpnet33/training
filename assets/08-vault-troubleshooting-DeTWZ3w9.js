var e={id:`vault-troubleshooting`,h:{en:`Secrets with Ansible Vault and a troubleshooting workflow`,hi:`Ansible Vault se secrets aur troubleshooting workflow`},body:{en:`
<p><b>One idea in this chapter:</b> roles and variables are safe to share only when the secrets in them are encrypted. <code>ansible-vault</code> encrypts a file (or one value) with a password, and Ansible decrypts it in memory when a playbook runs.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Vault flow">
<rect x="15" y="60" width="150" height="70" rx="10" fill="#fde68a"/><text x="90" y="90" text-anchor="middle" class="svg-ink" font-size="12">vault.yml</text><text x="90" y="110" text-anchor="middle" class="svg-ink" font-size="11">plain secret (never commit)</text>
<rect x="215" y="60" width="150" height="70" rx="10" fill="#bae6fd"/><text x="290" y="90" text-anchor="middle" class="svg-ink" font-size="12">ansible-vault encrypt</text><text x="290" y="110" text-anchor="middle" class="svg-ink" font-size="11">AES256 + password</text>
<rect x="415" y="60" width="210" height="70" rx="10" fill="#bbf7d0"/><text x="520" y="90" text-anchor="middle" class="svg-ink" font-size="12">ciphertext in Git</text><text x="520" y="110" text-anchor="middle" class="svg-ink" font-size="11">decrypted only in memory</text>
<line x1="165" y1="95" x2="215" y2="95" stroke="#64748b" stroke-width="2"/><line x1="365" y1="95" x2="415" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">password: prompt, or a git-ignored file with mode 600</text>
</svg><p class="cap">The file in Git is ciphertext; the password stays outside Git.</p></div>

<h3>Encrypt a file</h3>
<p>The lab keeps the shared secret in <code>group_vars/all/vault.yml</code>. We encrypt it with the team password and then store that password in a file only we can read:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-vault encrypt group_vars/all/vault.yml
New Vault password:
Confirm New Vault password:
Encryption successful</pre>
<pre class="code">echo 'Ganga@2026' > ~/.vault_pass     <span class="c"># lab placeholder password</span>
chmod 600 ~/.vault_pass               <span class="c"># only the owner can read it</span>
<span class="c"># ansible.cfg</span>
[defaults]
vault_password_file = ~/.vault_pass</pre>
<p>With <code>vault_password_file</code> set, every playbook run decrypts silently. The password file is a secret too: never commit it, and in production prefer a secrets manager over a file on disk.</p>

<h3>Use the secret without exposing it</h3>
<p>A common habit: the vaulted file holds variables that start with <code>vault_</code>, and the normal variable simply points to it. Readers see the name of the secret in <code>main.yml</code>, but never the value.</p>
<pre class="code"><span class="c"># group_vars/all/vault.yml  (encrypted)</span>
vault_netops_password: "NK@2026"          <span class="c"># placeholder</span>

<span class="c"># group_vars/all/main.yml  (plain, safe to review)</span>
ansible_password: "{{ vault_netops_password }}"</pre>
<p>To encrypt a single value inside an otherwise plain file:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-vault encrypt_string 'NK@2026' --name vault_netops_password
New Vault password:
Confirm New Vault password:
Encryption successful
vault_netops_password: !vault |
          $ANSIBLE_VAULT;1.1;AES256
          (encrypted lines follow)</pre>
<p>The simulator prints real ciphertext lines after the header; they are different every time and are left out here on purpose.</p>

<h3>The two vault errors and what they mean</h3>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook site.yml
ERROR! Attempting to decrypt but no vault secrets found</pre>
<p><b>No vault secrets found</b> means Ansible met an encrypted file and you gave it no password at all. Add <code>--ask-vault-pass</code>, or set <code>vault_password_file</code>.</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-vault view --ask-vault-pass group_vars/all/vault.yml
Vault password:
ERROR! Decryption failed (no vault secrets were found that could decrypt) on /home/netadmin/netauto/group_vars/all/vault.yml for /home/netadmin/netauto/group_vars/all/vault.yml</pre>
<p><b>Decryption failed</b> means a password was supplied but it is the wrong one for that file. Different files can have been encrypted with different passwords, which is exactly what happened in lab 2: the file for blr-edge-r2 still used an old password. The run got through the first files and failed midway on <code>host_vars/blr-edge-r2.yml</code>.</p>
<p>The fix is <b>rekey</b>: decrypt with the old password, encrypt with the new one.</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-vault rekey --ask-vault-pass host_vars/blr-edge-r2.yml
Vault password:
New Vault password:
Confirm New Vault password:
Rekey successful

netadmin@auto01:~/netauto$ ansible-vault view host_vars/blr-edge-r2.yml
login_banner: "BLR edge - authorised access only. All sessions are logged."</pre>
<p>In the lab, the old password is a placeholder (<code>Kaveri@2025</code>) and the new one is the team placeholder. After the rekey, <code>site.yml</code> runs on all hosts and the handler fires where the config changed.</p>

<h3>Vault commands to know</h3>
<ul>
<li><code>ansible-vault create</code>, <code>edit</code>, <code>view</code>: work on an encrypted file without leaving plain text on disk.</li>
<li><code>encrypt</code>, <code>decrypt</code>: change an existing file in place. Decrypting leaves plain text; do it only briefly.</li>
<li><code>rekey</code>: change the password.</li>
<li><code>encrypt_string</code>: encrypt one value.</li>
</ul>

<h3>A troubleshooting workflow for roles</h3>
<p>Read the first error line, find what it names (a role, a handler, a variable, a password) and fix that, not the symptoms around it.</p>
<table class="tbl"><tr><th>What you see</th><th>Cause</th><th>Fix</th></tr>
<tr><td><code>ERROR! the role 'nk_basee' was not found in ...</code></td><td>Typo in the role name, or the role is outside roles_path</td><td>Correct the name, check <code>ansible-galaxy role list</code> and roles_path</td></tr>
<tr><td><code>The requested handler 'Save Config' was not found ...</code></td><td>notify text does not match the handler name exactly</td><td>Make both strings identical, including case</td></tr>
<tr><td><code>'loopback_ip' is undefined</code></td><td>Variable never defined for that host</td><td>Add it to host_vars, or give the role a default</td></tr>
<tr><td><code>Attempting to decrypt but no vault secrets found</code></td><td>No vault password supplied</td><td>--ask-vault-pass or vault_password_file</td></tr>
<tr><td><code>Decryption failed</code></td><td>Wrong password for that file</td><td>Use the right password, or rekey the file</td></tr>
<tr><td>Task did not run with --tags</td><td>Task has no matching tag</td><td><code>--list-tags</code> and <code>--list-tasks</code></td></tr>
<tr><td>Value is not what you expect</td><td>A higher-precedence variable wins</td><td><code>ansible-inventory --host</code> and a debug task</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> Committing a decrypted vault file or the password file; using the same password for lab and production; printing secrets with debug or leaving them in rendered configs; forgetting that every file can have its own password.</p></div>
<div class="exam"><p><b>Exam trap.</b> "No vault secrets found" and "Decryption failed" are different: the first is no password supplied, the second is a wrong password. Rekey needs the old password and sets a new one.</p></div>

<div class="scn"><h4>The run that stopped halfway</h4><p>A playbook ran fine on the switch and the first router, then stopped on the second router with a decryption error although the password was correct. One host file had been encrypted months earlier with a previous password. Rekeying that single file fixed the whole run.</p><p><b>Lesson:</b> a decryption error can be about one file, not the password you just typed.</p></div>

<div class="iv"><p class="q">"How do you handle secrets in Ansible?"</p><p>I keep them in ansible-vault encrypted files, with plain variables pointing to vault_ names so the code stays reviewable. The password comes from a prompt or a git-ignored file with mode 600, and for production from a secrets manager. I rekey when people leave.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ansible-vault encrypt keeps secrets as ciphertext in Git.</li>
<li>vault_password_file avoids typing the password, but must be git-ignored with mode 600.</li>
<li>No vault secrets found means no password; Decryption failed means the wrong one.</li>
<li>rekey changes a file password; view reads without leaving plain text.</li>
<li>Troubleshoot by reading the first error line and fixing what it names.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka ek idea:</b> roles aur variables tabhi share karna surakshit hai jab unke secrets encrypted hon. <code>ansible-vault</code> file (ya ek value) ko password se encrypt karta hai, aur Ansible playbook chalte waqt use memory mein decrypt karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Vault flow">
<rect x="15" y="60" width="150" height="70" rx="10" fill="#fde68a"/><text x="90" y="90" text-anchor="middle" class="svg-ink" font-size="12">vault.yml</text><text x="90" y="110" text-anchor="middle" class="svg-ink" font-size="11">plain secret (commit mat karo)</text>
<rect x="215" y="60" width="150" height="70" rx="10" fill="#bae6fd"/><text x="290" y="90" text-anchor="middle" class="svg-ink" font-size="12">ansible-vault encrypt</text><text x="290" y="110" text-anchor="middle" class="svg-ink" font-size="11">AES256 + password</text>
<rect x="415" y="60" width="210" height="70" rx="10" fill="#bbf7d0"/><text x="520" y="90" text-anchor="middle" class="svg-ink" font-size="12">Git mein ciphertext</text><text x="520" y="110" text-anchor="middle" class="svg-ink" font-size="11">sirf memory mein decrypt</text>
<line x1="165" y1="95" x2="215" y2="95" stroke="#64748b" stroke-width="2"/><line x1="365" y1="95" x2="415" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">password: prompt, ya git-ignored file mode 600 ke saath</text>
</svg><p class="cap">Git mein file ciphertext hai; password Git ke bahar rehta hai.</p></div>

<h3>File encrypt karo</h3>
<p>Lab mein shared secret <code>group_vars/all/vault.yml</code> mein hai. Hum use team password se encrypt karte hain aur phir woh password aisi file mein rakhte hain jo sirf humein padhni aati hai:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-vault encrypt group_vars/all/vault.yml
New Vault password:
Confirm New Vault password:
Encryption successful</pre>
<pre class="code">echo 'Ganga@2026' > ~/.vault_pass     <span class="c"># lab placeholder password</span>
chmod 600 ~/.vault_pass               <span class="c"># sirf owner padh sakta hai</span>
<span class="c"># ansible.cfg</span>
[defaults]
vault_password_file = ~/.vault_pass</pre>
<p><code>vault_password_file</code> set hone par har playbook run chupchap decrypt karta hai. Password file bhi secret hai: use kabhi commit mat karo, aur production mein disk par file ke bajaye secrets manager behtar hai.</p>

<h3>Secret ko expose kiye bina use karo</h3>
<p>Aam aadat: vaulted file mein <code>vault_</code> se shuru hone wale variables hote hain, aur normal variable bas uski taraf point karta hai. Reader ko <code>main.yml</code> mein secret ka naam dikhta hai, value kabhi nahi.</p>
<pre class="code"><span class="c"># group_vars/all/vault.yml  (encrypted)</span>
vault_netops_password: "NK@2026"          <span class="c"># placeholder</span>

<span class="c"># group_vars/all/main.yml  (plain, review ke liye safe)</span>
ansible_password: "{{ vault_netops_password }}"</pre>
<p>Baaki plain file ke andar sirf ek value encrypt karne ke liye:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-vault encrypt_string 'NK@2026' --name vault_netops_password
New Vault password:
Confirm New Vault password:
Encryption successful
vault_netops_password: !vault |
          $ANSIBLE_VAULT;1.1;AES256
          (encrypted lines follow)</pre>
<p>Simulator header ke baad asli ciphertext lines print karta hai; woh har baar alag hoti hain aur yahan jaan-boojhkar chhodi gayi hain.</p>

<h3>Do vault errors aur unka matlab</h3>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook site.yml
ERROR! Attempting to decrypt but no vault secrets found</pre>
<p><b>No vault secrets found</b> ka matlab: Ansible ko encrypted file mili aur aapne koi password diya hi nahi. <code>--ask-vault-pass</code> jodo, ya <code>vault_password_file</code> set karo.</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-vault view --ask-vault-pass group_vars/all/vault.yml
Vault password:
ERROR! Decryption failed (no vault secrets were found that could decrypt) on /home/netadmin/netauto/group_vars/all/vault.yml for /home/netadmin/netauto/group_vars/all/vault.yml</pre>
<p><b>Decryption failed</b> ka matlab: password diya gaya par us file ke liye galat hai. Alag files alag passwords se encrypt ho sakti hain, aur lab 2 mein yahi hua: blr-edge-r2 ki file purane password par thi. Run pehli files se nikal gaya aur <code>host_vars/blr-edge-r2.yml</code> par beech mein fail hua.</p>
<p>Fix hai <b>rekey</b>: purane password se decrypt, naye se encrypt.</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-vault rekey --ask-vault-pass host_vars/blr-edge-r2.yml
Vault password:
New Vault password:
Confirm New Vault password:
Rekey successful

netadmin@auto01:~/netauto$ ansible-vault view host_vars/blr-edge-r2.yml
login_banner: "BLR edge - authorised access only. All sessions are logged."</pre>
<p>Lab mein purana password placeholder hai (<code>Kaveri@2025</code>) aur naya team placeholder. Rekey ke baad <code>site.yml</code> saare hosts par chalta hai aur jahan config badla wahan handler fire hota hai.</p>

<h3>Jaanne layak vault commands</h3>
<ul>
<li><code>ansible-vault create</code>, <code>edit</code>, <code>view</code>: encrypted file par kaam karte hain, disk par plain text chhode bina.</li>
<li><code>encrypt</code>, <code>decrypt</code>: maujooda file ko wahin badalte hain. Decrypt plain text chhodta hai; sirf thodi der ke liye karo.</li>
<li><code>rekey</code>: password badalta hai.</li>
<li><code>encrypt_string</code>: ek value encrypt karta hai.</li>
</ul>

<h3>Roles ke liye troubleshooting workflow</h3>
<p>Pehli error line padho, dekho woh kya naam batati hai (role, handler, variable, password) aur wahi fix karo, aas-paas ke symptoms nahi.</p>
<table class="tbl"><tr><th>Kya dikhta hai</th><th>Karan</th><th>Fix</th></tr>
<tr><td><code>ERROR! the role 'nk_basee' was not found in ...</code></td><td>Role naam mein typo, ya role roles_path ke bahar hai</td><td>Naam sahi karo, <code>ansible-galaxy role list</code> aur roles_path dekho</td></tr>
<tr><td><code>The requested handler 'Save Config' was not found ...</code></td><td>notify ka text handler ke naam se bilkul match nahi karta</td><td>Dono strings same karo, case bhi same</td></tr>
<tr><td><code>'loopback_ip' is undefined</code></td><td>Us host ke liye variable kabhi define nahi hua</td><td>host_vars mein jodo, ya role ko default do</td></tr>
<tr><td><code>Attempting to decrypt but no vault secrets found</code></td><td>Vault password diya hi nahi</td><td>--ask-vault-pass ya vault_password_file</td></tr>
<tr><td><code>Decryption failed</code></td><td>Us file ke liye galat password</td><td>Sahi password do, ya file rekey karo</td></tr>
<tr><td>--tags ke saath task nahi chala</td><td>Task par matching tag nahi</td><td><code>--list-tags</code> aur <code>--list-tasks</code></td></tr>
<tr><td>Value expected se alag hai</td><td>Ooncha precedence wala variable jeet raha hai</td><td><code>ansible-inventory --host</code> aur debug task</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> Decrypted vault file ya password file commit karna; lab aur production ke liye same password; debug se secrets print karna ya rendered configs mein chhod dena; yeh bhoolna ki har file ka apna password ho sakta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "No vault secrets found" aur "Decryption failed" alag hain: pehla password diya hi nahi, doosra galat password. Rekey ko purana password chahiye aur woh naya set karta hai.</p></div>

<div class="scn"><h4>Beech mein ruk gaya run</h4><p>Ek playbook switch aur pehle router par theek chala, phir doosre router par decryption error ke saath ruk gaya, jabki password sahi tha. Ek host file mahinon pehle purane password se encrypt hui thi. Sirf us ek file ko rekey karne se poora run theek ho gaya.</p><p><b>Lesson:</b> decryption error ek file ke baare mein ho sakta hai, us password ke baare mein nahi jo abhi type kiya.</p></div>

<div class="iv"><p class="q">"Ansible mein secrets kaise handle karte ho?"</p><p>Main unhe ansible-vault encrypted files mein rakhta hoon, plain variables vault_ naamon ki taraf point karte hain taaki code reviewable rahe. Password prompt se ya git-ignored mode 600 file se aata hai, aur production mein secrets manager se. Log jaane par rekey karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ansible-vault encrypt secrets ko Git mein ciphertext rakhta hai.</li>
<li>vault_password_file password type karne se bachata hai, par git-ignored aur mode 600 hona chahiye.</li>
<li>No vault secrets found matlab password nahi; Decryption failed matlab galat password.</li>
<li>rekey file ka password badalta hai; view plain text chhode bina padhta hai.</li>
<li>Troubleshoot ke liye pehli error line padho aur jo woh naam batati hai wahi fix karo.</li>
</ul></div>
`}};export{e as default};