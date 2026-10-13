var e={id:`control-node`,h:{en:`Your control node: Linux, ansible-core, collections and module names`,hi:`Aapka control node: Linux, ansible-core, collections aur module names`},body:{en:`
<p>Every Ansible journey starts on one machine: the <b>control node</b>. Think of it as your workshop. The tools (Ansible), the instructions (playbooks) and the address book (inventory) all live here, and from here you reach out to the devices. In our lab the control node is a Linux server called <b>AUTO01</b>. You log in as <code>netadmin</code>, and the server already has Ansible installed.</p>

<h3>What is installed, and what is not</h3>
<p>The name "Ansible" covers two layers. <b>ansible-core</b> is the engine: the <code>ansible</code> and <code>ansible-playbook</code> commands, the YAML parser, the connection plugins and a small set of built-in modules such as <code>debug</code> and <code>assert</code>. The modules for specific vendors live in <b>collections</b>, which are downloadable bundles. For a network engineer the two that matter first are <code>ansible.netcommon</code> (generic network pieces such as the <code>network_cli</code> connection) and <code>cisco.ios</code> (modules for IOS devices).</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Layers of Ansible and the anatomy of a module name">
<rect x="20" y="15" width="300" height="55" rx="10" fill="#fde68a"/><text x="170" y="40" text-anchor="middle" class="svg-ink" font-size="14">ansible-core</text><text x="170" y="58" text-anchor="middle" class="svg-muted" font-size="12">engine, CLI tools, built-in modules</text>
<rect x="20" y="85" width="300" height="55" rx="10" fill="#bbf7d0"/><text x="170" y="110" text-anchor="middle" class="svg-ink" font-size="14">Collections</text><text x="170" y="128" text-anchor="middle" class="svg-muted" font-size="12">ansible.netcommon, cisco.ios</text>
<rect x="20" y="155" width="300" height="55" rx="10" fill="#bae6fd"/><text x="170" y="180" text-anchor="middle" class="svg-ink" font-size="14">Modules</text><text x="170" y="198" text-anchor="middle" class="svg-muted" font-size="12">ios_config, ios_command, ios_facts</text>
<text x="170" y="236" text-anchor="middle" class="svg-muted" font-size="12">each layer builds on the one above</text>
<text x="480" y="40" text-anchor="middle" class="svg-ink" font-size="14">cisco.ios.ios_config</text>
<rect x="360" y="55" width="55" height="30" rx="6" fill="#ddd6fe"/><text x="387" y="75" text-anchor="middle" class="svg-ink" font-size="12">cisco</text>
<rect x="420" y="55" width="40" height="30" rx="6" fill="#ddd6fe"/><text x="440" y="75" text-anchor="middle" class="svg-ink" font-size="12">ios</text>
<rect x="465" y="55" width="150" height="30" rx="6" fill="#fed7aa"/><text x="540" y="75" text-anchor="middle" class="svg-ink" font-size="12">ios_config</text>
<text x="387" y="108" text-anchor="middle" class="svg-muted" font-size="12">namespace</text><text x="440" y="124" text-anchor="middle" class="svg-muted" font-size="12">collection</text><text x="540" y="108" text-anchor="middle" class="svg-muted" font-size="12">module</text>
<text x="480" y="170" text-anchor="middle" class="svg-accent" font-size="12">FQCN = namespace.collection.module</text>
</svg><p class="cap">The full module name (FQCN) tells Ansible exactly which collection a module comes from.</p></div>

<h3>Check what you have</h3>
<p>Two commands tell you everything. <code>ansible --version</code> shows the engine version, the Python it runs on and, importantly, which configuration file is active. <code>ansible-galaxy collection list</code> shows installed collections.</p>
<pre class="out">AUTO01$ ansible --version
ansible [core 2.16.3]
  <span class="hl">config file = /etc/ansible/ansible.cfg</span>
  configured module search path = ['/home/netadmin/.ansible/plugins/modules', '/usr/share/ansible/plugins/modules']
  ansible python module location = /usr/lib/python3/dist-packages/ansible
  ansible collection location = /home/netadmin/.ansible/collections:/usr/share/ansible/collections
  executable location = /usr/bin/ansible
  python version = 3.12.3 (main, Sep 11 2026, 14:09:07) [GCC 13.3.0] (/usr/bin/python3)
  jinja version = 3.1.2
  libyaml = True

AUTO01$ ansible-galaxy collection list

# /usr/lib/python3/dist-packages/ansible_collections
Collection                    Version
----------------------------- -------
<span class="hl">ansible.netcommon             5.3.0</span>
ansible.utils                 2.12.0
<span class="hl">cisco.ios                     5.3.0</span>
community.general             8.3.0</pre>
<p>Notice <code>config file = /etc/ansible/ansible.cfg</code>. This is the system-wide file. In the next chapters you will create one inside your own project folder, and the same command will show the new path.</p>

<h3>Fully qualified collection names (FQCN)</h3>
<p>Older tutorials write <code>ios_config:</code>. Current Ansible expects the <b>fully qualified collection name</b>: <code>cisco.ios.ios_config</code>. The three parts are the namespace (<code>cisco</code>), the collection (<code>ios</code>) and the module (<code>ios_config</code>). Using the full name avoids confusion when two collections ship a module with the same name, and it is what linters and the documentation use. Built-in modules use <code>ansible.builtin</code>, for example <code>ansible.builtin.debug</code>.</p>
<p>You can read the built-in help for any module without internet access:</p>
<pre class="out">AUTO01$ ansible-doc cisco.ios.ios_command | head -20
&gt; CISCO.IOS.IOS_COMMAND    (/usr/lib/python3/dist-packages/ansible_collections/cisco/ios/plugins/modules/ios_command.py)

  Run commands on remote devices running Cisco IOS

OPTIONS (= is mandatory):

- commands: list of show/exec commands; results in stdout (list) and stdout_lines (list of lists)

All parameters: commands, wait_for, match, retries, interval</pre>

<h3>Installing on your own machine</h3>
<p>You will not need this in the simulator, but on a real control node (a Linux VM or WSL on Windows) the usual steps are below.</p>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator)</span>
python3 -m venv ~/ansible-venv
. ~/ansible-venv/bin/activate
pip install ansible-core
ansible-galaxy collection install cisco.ios ansible.netcommon</pre>
<p>A virtual environment keeps Ansible and its Python libraries separate from the operating system, which makes upgrades safe. Always pin versions in a real project so that your playbooks behave the same next month.</p>

<h3>Your project folder habit</h3>
<p>Keep each automation project in its own folder, for example <code>~/netauto</code>. It will hold the inventory, <code>ansible.cfg</code> and playbooks together. Put the folder under version control (Git) as soon as it has a file worth keeping; the <b>auto-git</b> module shows how.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Writing short module names such as <code>ios_config</code> copied from old blog posts. They may still work through redirects, but they hide which collection you depend on. Another trap is installing Ansible with the operating-system package and a separate <code>pip</code> copy; then two versions exist and <code>ansible --version</code> tells you which one wins.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Where does Ansible look for its configuration file?" The first one found in this order: the <code>ANSIBLE_CONFIG</code> variable, <code>./ansible.cfg</code> in the current folder, <code>~/.ansible.cfg</code>, then <code>/etc/ansible/ansible.cfg</code>. It never merges them; only one is used.</p></div>

<div class="scn"><h4>Two Ansibles on one server</h4><p>A new engineer ran a playbook that worked on a colleague's laptop but failed on the shared control node with "couldn't resolve module/action cisco.ios.ios_config". <code>ansible --version</code> showed an old distribution package, while the colleague had a newer one in a virtual environment. Running <code>ansible-galaxy collection list</code> showed that the <code>cisco.ios</code> collection was missing on the server.</p><p><b>Lesson:</b> when behaviour differs between machines, compare <code>ansible --version</code> and the collection list first. Pin versions in a requirements file.</p></div>

<div class="iv"><p class="q">"What is the difference between ansible-core and a collection?"</p><p>ansible-core is the engine and the built-in modules. Collections are separately versioned bundles of modules, plugins and roles, for example <code>cisco.ios</code> for IOS devices. You call a module with its full name, namespace.collection.module, so Ansible knows where it comes from. Mentioning that collections can be updated without upgrading the engine shows real-world awareness.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The control node is a Linux machine with <code>ansible-core</code> and the collections you need.</li>
<li><code>ansible --version</code> shows the version, Python and the active config file.</li>
<li><code>ansible-galaxy collection list</code> shows which collections are installed.</li>
<li>Use fully qualified names such as <code>cisco.ios.ios_config</code> and <code>ansible.builtin.debug</code>.</li>
<li><code>ansible-doc MODULE</code> gives offline help with the options.</li>
</ul></div>
`,hi:`
<p>Har Ansible safar ek machine se shuru hota hai: <b>control node</b>. Ise apni workshop samjho. Tools (Ansible), instructions (playbooks) aur address book (inventory) sab yahin rehte hain, aur yahin se aap devices tak pahunchte ho. Hamari lab mein control node ek Linux server hai jiska naam <b>AUTO01</b> hai. Aap <code>netadmin</code> ke roop mein login karte ho, aur server par Ansible pehle se installed hai.</p>

<h3>Kya installed hai aur kya nahi</h3>
<p>"Ansible" naam do layers cover karta hai. <b>ansible-core</b> engine hai: <code>ansible</code> aur <code>ansible-playbook</code> commands, YAML parser, connection plugins aur kuch built-in modules jaise <code>debug</code> aur <code>assert</code>. Vendor-specific modules <b>collections</b> mein rehte hain, jo download hone wale bundles hain. Network engineer ke liye pehle do zaroori hain: <code>ansible.netcommon</code> (generic network pieces jaise <code>network_cli</code> connection) aur <code>cisco.ios</code> (IOS devices ke modules).</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Ansible ki layers aur module name ki banawat">
<rect x="20" y="15" width="300" height="55" rx="10" fill="#fde68a"/><text x="170" y="40" text-anchor="middle" class="svg-ink" font-size="14">ansible-core</text><text x="170" y="58" text-anchor="middle" class="svg-muted" font-size="12">engine, CLI tools, built-in modules</text>
<rect x="20" y="85" width="300" height="55" rx="10" fill="#bbf7d0"/><text x="170" y="110" text-anchor="middle" class="svg-ink" font-size="14">Collections</text><text x="170" y="128" text-anchor="middle" class="svg-muted" font-size="12">ansible.netcommon, cisco.ios</text>
<rect x="20" y="155" width="300" height="55" rx="10" fill="#bae6fd"/><text x="170" y="180" text-anchor="middle" class="svg-ink" font-size="14">Modules</text><text x="170" y="198" text-anchor="middle" class="svg-muted" font-size="12">ios_config, ios_command, ios_facts</text>
<text x="170" y="236" text-anchor="middle" class="svg-muted" font-size="12">har layer upar wali layer par banti hai</text>
<text x="480" y="40" text-anchor="middle" class="svg-ink" font-size="14">cisco.ios.ios_config</text>
<rect x="360" y="55" width="55" height="30" rx="6" fill="#ddd6fe"/><text x="387" y="75" text-anchor="middle" class="svg-ink" font-size="12">cisco</text>
<rect x="420" y="55" width="40" height="30" rx="6" fill="#ddd6fe"/><text x="440" y="75" text-anchor="middle" class="svg-ink" font-size="12">ios</text>
<rect x="465" y="55" width="150" height="30" rx="6" fill="#fed7aa"/><text x="540" y="75" text-anchor="middle" class="svg-ink" font-size="12">ios_config</text>
<text x="387" y="108" text-anchor="middle" class="svg-muted" font-size="12">namespace</text><text x="440" y="124" text-anchor="middle" class="svg-muted" font-size="12">collection</text><text x="540" y="108" text-anchor="middle" class="svg-muted" font-size="12">module</text>
<text x="480" y="170" text-anchor="middle" class="svg-accent" font-size="12">FQCN = namespace.collection.module</text>
</svg><p class="cap">Poora module name (FQCN) Ansible ko batata hai ki module kis collection se aaya hai.</p></div>

<h3>Check karo kya hai</h3>
<p>Do commands sab bata dete hain. <code>ansible --version</code> engine version, Python aur sabse zaroori, kaunsi configuration file active hai woh dikhata hai. <code>ansible-galaxy collection list</code> installed collections dikhata hai.</p>
<pre class="out">AUTO01$ ansible --version
ansible [core 2.16.3]
  <span class="hl">config file = /etc/ansible/ansible.cfg</span>
  configured module search path = ['/home/netadmin/.ansible/plugins/modules', '/usr/share/ansible/plugins/modules']
  ansible python module location = /usr/lib/python3/dist-packages/ansible
  ansible collection location = /home/netadmin/.ansible/collections:/usr/share/ansible/collections
  executable location = /usr/bin/ansible
  python version = 3.12.3 (main, Sep 11 2026, 14:09:07) [GCC 13.3.0] (/usr/bin/python3)
  jinja version = 3.1.2
  libyaml = True

AUTO01$ ansible-galaxy collection list

# /usr/lib/python3/dist-packages/ansible_collections
Collection                    Version
----------------------------- -------
<span class="hl">ansible.netcommon             5.3.0</span>
ansible.utils                 2.12.0
<span class="hl">cisco.ios                     5.3.0</span>
community.general             8.3.0</pre>
<p><code>config file = /etc/ansible/ansible.cfg</code> dhyan se dekho. Yeh system-wide file hai. Agle chapters mein aap apne project folder ke andar ek file banaoge, aur wahi command naya path dikhayega.</p>

<h3>Fully qualified collection names (FQCN)</h3>
<p>Purane tutorials <code>ios_config:</code> likhte hain. Current Ansible <b>fully qualified collection name</b> maangta hai: <code>cisco.ios.ios_config</code>. Teen hisse hain: namespace (<code>cisco</code>), collection (<code>ios</code>) aur module (<code>ios_config</code>). Poora naam use karne se confusion nahi hota jab do collections mein same naam ka module ho, aur linters aur documentation yahi use karte hain. Built-in modules <code>ansible.builtin</code> use karte hain, jaise <code>ansible.builtin.debug</code>.</p>
<p>Kisi bhi module ki built-in help internet ke bina padh sakte ho:</p>
<pre class="out">AUTO01$ ansible-doc cisco.ios.ios_command | head -20
&gt; CISCO.IOS.IOS_COMMAND    (/usr/lib/python3/dist-packages/ansible_collections/cisco/ios/plugins/modules/ios_command.py)

  Run commands on remote devices running Cisco IOS

OPTIONS (= is mandatory):

- commands: list of show/exec commands; results in stdout (list) and stdout_lines (list of lists)

All parameters: commands, wait_for, match, retries, interval</pre>

<h3>Apni machine par install karna</h3>
<p>Simulator mein iski zaroorat nahi, par asli control node (Linux VM ya Windows par WSL) par aam steps neeche hain.</p>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator)</span>
python3 -m venv ~/ansible-venv
. ~/ansible-venv/bin/activate
pip install ansible-core
ansible-galaxy collection install cisco.ios ansible.netcommon</pre>
<p>Virtual environment Ansible aur uski Python libraries ko operating system se alag rakhta hai, jisse upgrades safe rehte hain. Asli project mein versions pin karo taaki aapke playbooks agle mahine bhi waise hi chalein.</p>

<h3>Project folder ki aadat</h3>
<p>Har automation project ko apne folder mein rakho, jaise <code>~/netauto</code>. Isme inventory, <code>ansible.cfg</code> aur playbooks saath rahenge. Jaise hi folder mein rakhne layak file ho, use version control (Git) mein daalo; <b>auto-git</b> module dikhata hai kaise.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Purane blog posts se copy karke <code>ios_config</code> jaise short module names likhna. Redirects se chal sakte hain, par yeh chhupa dete hain ki aap kis collection par depend ho. Doosri galti: operating-system package aur alag <code>pip</code> copy dono se Ansible install karna; tab do versions hote hain aur <code>ansible --version</code> batata hai kaunsa jeet raha hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Ansible apni configuration file kahan dhoondhta hai?" Is order mein pehli mili hui: <code>ANSIBLE_CONFIG</code> variable, current folder ki <code>./ansible.cfg</code>, <code>~/.ansible.cfg</code>, phir <code>/etc/ansible/ansible.cfg</code>. Woh kabhi merge nahi karta; sirf ek use hoti hai.</p></div>

<div class="scn"><h4>Ek server par do Ansible</h4><p>Ek naye engineer ka playbook colleague ke laptop par chala par shared control node par "couldn't resolve module/action cisco.ios.ios_config" se fail hua. <code>ansible --version</code> ne server par purana distribution package dikhaya, jabki colleague ke paas virtual environment mein naya tha. <code>ansible-galaxy collection list</code> ne dikhaya ki server par <code>cisco.ios</code> collection missing thi.</p><p><b>Lesson:</b> jab machines ke beech behaviour alag ho to pehle <code>ansible --version</code> aur collection list compare karo. Requirements file mein versions pin karo.</p></div>

<div class="iv"><p class="q">"ansible-core aur collection mein kya difference hai?"</p><p>ansible-core engine aur built-in modules hai. Collections alag versioned bundles hain jinme modules, plugins aur roles hote hain, jaise IOS devices ke liye <code>cisco.ios</code>. Aap module ko poore naam, namespace.collection.module, se bulate ho taaki Ansible ko pata ho woh kahan se aaya. Yeh batana ki collections engine upgrade kiye bina update ho sakti hain, real-world awareness dikhata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Control node Linux machine hai jisme <code>ansible-core</code> aur zaroori collections hote hain.</li>
<li><code>ansible --version</code> version, Python aur active config file dikhata hai.</li>
<li><code>ansible-galaxy collection list</code> installed collections dikhata hai.</li>
<li><code>cisco.ios.ios_config</code> aur <code>ansible.builtin.debug</code> jaise fully qualified names use karo.</li>
<li><code>ansible-doc MODULE</code> options ke saath offline help deta hai.</li>
</ul></div>
`}};export{e as default};