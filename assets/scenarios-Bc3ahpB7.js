var e=[{title:{en:`First ping, all red`,hi:`Pehla ping, sab laal`},ticket:{en:`A new engineer set up inventory.ini and ansible.cfg on AUTO01 and ran the first ping. All three devices fail, although he can SSH to them by hand. What does the output say is wrong?`,hi:`Ek naye engineer ne AUTO01 par inventory.ini aur ansible.cfg banaye aur pehla ping chalaya. Teeno devices fail hote hain, jabki wo haath se SSH kar sakta hai. Output ke hisaab se kya galat hai?`},out:`AUTO01$ ansible all -m ping
pun-core-r1 | FAILED! => {
    "changed": false,
    "msg": "Server '10.99.0.1' not found in known_hosts"
}
blr-edge-r2 | FAILED! => {
    "changed": false,
    "msg": "Server '10.99.0.2' not found in known_hosts"
}
pun-acc-sw1 | FAILED! => {
    "changed": false,
    "msg": "Server '10.99.0.10' not found in known_hosts"
}`,q:{en:`What is the correct explanation and lab fix?`,hi:`Sahi explanation aur lab fix kya hai?`},o:[{en:`The routers are down, so reload them`,hi:`Routers down hain, unhe reload karo`},{en:`SSH host key checking is on and the keys were never accepted; set host_key_checking = False in the lab (or add the keys)`,hi:`SSH host key checking on hai aur keys kabhi accept nahi hui; lab mein host_key_checking = False karo (ya keys jodo)`},{en:`The password in the inventory is wrong`,hi:`Inventory ka password galat hai`},{en:`ansible-core must be reinstalled`,hi:`ansible-core dobara install karna hoga`}],a:1,w:{en:`The message is about trust of the device key, not the network or the password. In a lab, host_key_checking = False under [defaults] is normal; in production, verify and add the keys with ssh-keyscan.`,hi:`Message device key ke trust ke baare mein hai, network ya password ke nahi. Lab mein [defaults] ke neeche host_key_checking = False normal hai; production mein keys verify karke ssh-keyscan se jodo.`}},{title:{en:`One router will not answer`,hi:`Ek router jawab nahi deta`},ticket:{en:`The ping works for Pune but not for Bengaluru. The router itself is up and its console shows a healthy interface on 10.99.0.2. What is the most likely cause given the output?`,hi:`Ping Pune ke liye chalta hai par Bengaluru ke liye nahi. Router khud up hai aur uske console par 10.99.0.2 par interface healthy hai. Output ko dekhte hue sabse likely wajah kya hai?`},out:`AUTO01$ ansible all -m ping
pun-core-r1 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
blr-edge-r2 | UNREACHABLE! => {
    "changed": false,
    "msg": "ssh connect failed: Connection timed out",
    "unreachable": true
}
pun-acc-sw1 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}

AUTO01$ ansible-inventory --host blr-edge-r2
{
    "ansible_host": "10.99.0.99",
    ...
}`,q:{en:`What fixes it?`,hi:`Ise kya theek karega?`},o:[{en:`Enable gather_facts`,hi:`gather_facts enable karo`},{en:`Change ansible_network_os to cisco.ios.nxos`,hi:`ansible_network_os ko cisco.ios.nxos karo`},{en:`Correct ansible_host to 10.99.0.2 in the inventory`,hi:`Inventory mein ansible_host ko 10.99.0.2 karo`},{en:`Add become: true to the playbook`,hi:`Playbook mein become: true jodo`}],a:2,w:{en:`UNREACHABLE with a timeout means nothing answered at the address Ansible used. ansible-inventory --host shows ansible_host is 10.99.0.99, a typo. The router is at 10.99.0.2.`,hi:`Timeout ke saath UNREACHABLE matlab Ansible ke use kiye address par kisi ne jawab nahi diya. ansible-inventory --host dikhata hai ki ansible_host 10.99.0.99 hai, jo typo hai. Router 10.99.0.2 par hai.`}},{title:{en:`The playbook that will not load`,hi:`Playbook jo load hi nahi hota`},ticket:{en:`A teammate wrote bad1.yml and the syntax check fails. Below is the error and the part of the file. What is wrong?`,hi:`Ek teammate ne bad1.yml likha aur syntax check fail hota hai. Neeche error aur file ka hissa hai. Kya galat hai?`},out:`AUTO01$ ansible-playbook bad1.yml --syntax-check
ERROR! conflicting action statements: cisco.ios.ios_config, lines

The error appears to be in '/home/netadmin/netauto/bad1.yml': line 6, column 7

    - name: NTP server
      cisco.ios.ios_config:
      lines:
          - ntp server 10.99.0.60`,q:{en:`What is the mistake?`,hi:`Galti kya hai?`},o:[{en:`lines: is not indented under the module, so Ansible sees two actions in one task`,hi:`lines: module ke neeche indent nahi hai, isliye Ansible ko ek task mein do actions dikhte hain`},{en:`The module name must be written without the collection`,hi:`Module name collection ke bina likhna chahiye`},{en:`The list item needs quotes`,hi:`List item ko quotes chahiye`},{en:`hosts: is missing from the play`,hi:`Play mein hosts: missing hai`}],a:0,w:{en:`Module arguments must be indented below the module name. With lines: aligned to cisco.ios.ios_config:, YAML reads two keys in the task and Ansible complains about conflicting action statements.`,hi:`Module arguments module name ke neeche indent hone chahiye. lines: ke cisco.ios.ios_config: ke barabar hone par YAML task mein do keys padhta hai aur Ansible conflicting action statements ki shikayat karta hai.`}},{title:{en:`Configuration gone after the reload`,hi:`Reload ke baad configuration gayab`},ticket:{en:`The NTP playbook ran clean this morning. After a power cut the router has no NTP server. Before the reload the engineer had run the check below. Why did the change disappear?`,hi:`NTP playbook aaj subah saaf chala tha. Power cut ke baad router ke paas NTP server nahi hai. Reload se pehle engineer ne neeche wala check chalaya tha. Change kyun gayab hua?`},out:`AUTO01$ ansible-playbook ntp.yml
...
PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0

AUTO01$ ansible all -m cisco.ios.ios_command -a "commands='show startup-config | include ntp server|logging host'" -o
pun-core-r1 | SUCCESS => { "changed": false, "stdout": [ "" ], "stdout_lines": [ [ "" ] ] }`,q:{en:`What is the explanation and the fix?`,hi:`Explanation aur fix kya hai?`},o:[{en:`check mode was on, so nothing was applied`,hi:`check mode on tha, isliye kuch apply nahi hua`},{en:`The playbook is not idempotent`,hi:`Playbook idempotent nahi hai`},{en:`The inventory group was wrong`,hi:`Inventory group galat tha`},{en:`Only the running-config was changed; add save_when: modified so Ansible saves to startup-config`,hi:`Sirf running-config badli thi; save_when: modified jodo taaki Ansible startup-config mein save kare`}],a:3,w:{en:`The empty startup-config result shows the lines were never saved. A reload loads startup-config, so the change vanished. save_when: modified on an ios_config task saves when running and startup differ.`,hi:`Startup-config ka khaali result dikhata hai ki lines kabhi save nahi hui. Reload startup-config load karta hai, isliye change gayab ho gaya. ios_config task par save_when: modified running aur startup alag hone par save karta hai.`}},{title:{en:`Nothing matched`,hi:`Kuch match nahi hua`},ticket:{en:`An engineer opened a new terminal, typed the ping and got this output. The project has a perfectly good inventory.ini and ansible.cfg. What is the most likely reason?`,hi:`Ek engineer ne naya terminal khola, ping type kiya aur yeh output mila. Project mein bilkul theek inventory.ini aur ansible.cfg hain. Sabse likely wajah kya hai?`},out:`AUTO01$ pwd
/home/netadmin
AUTO01$ ansible all -m ping
[WARNING]: provided hosts list is empty, only localhost is available. Note that the implicit localhost does not match 'all'
[WARNING]: No hosts matched, nothing to do`,q:{en:`Why are no hosts matched?`,hi:`Koi host match kyun nahi hua?`},o:[{en:`The devices are powered off`,hi:`Devices power off hain`},{en:`The password is wrong`,hi:`Password galat hai`},{en:`He is not in the project folder, so the project ansible.cfg (and its inventory path) was not used`,hi:`Wo project folder mein nahi hai, isliye project ki ansible.cfg (aur uska inventory path) use nahi hui`},{en:`ansible-core is too old`,hi:`ansible-core bahut purana hai`}],a:2,w:{en:`Ansible reads ./ansible.cfg only from the current folder. In the home folder it falls back to the system file, which has no inventory, so no hosts match. cd ~/netauto, or check ansible --version for the active config file.`,hi:`Ansible ./ansible.cfg sirf current folder se padhta hai. Home folder mein woh system file par wapas aata hai, jisme inventory nahi hai, isliye koi host match nahi hota. cd ~/netauto karo, ya active config file ke liye ansible --version dekho.`}},{title:{en:`A tiny typo in an option name`,hi:`Option ke naam mein chhota typo`},ticket:{en:`The playbook loads, logs in, and then every device fails on the first task with the message below. What is wrong with the task?`,hi:`Playbook load hota hai, login hota hai, aur phir har device pehle task par neeche wale message ke saath fail hota hai. Task mein kya galat hai?`},out:`TASK [NTP server] *************************************************************
fatal: [pun-core-r1]: FAILED! => {"changed": false, "msg": "Unsupported parameters for (cisco.ios.ios_config) module: line. Supported parameters include: after, backup, backup_options, before, defaults, diff_against, diff_ignore_lines, intended_config, lines, match, multiline_delimiter, parents, replace, running_config, save_when, src."}

NO MORE HOSTS LEFT ************************************************************`,q:{en:`What should the task use?`,hi:`Task ko kya use karna chahiye?`},o:[{en:`A different module, ios_command`,hi:`Doosra module, ios_command`},{en:`The option parents instead of line`,hi:`line ki jagah parents option`},{en:`A longer SSH timeout`,hi:`Lamba SSH timeout`},{en:`The option lines (a list) instead of line`,hi:`line ki jagah lines option (ek list)`}],a:3,w:{en:`The module lists its valid options and line is not one of them; lines is. The error is a spelling mistake in the argument name, found after login because arguments are validated when the module runs.`,hi:`Module apne valid options list karta hai aur line unme nahi hai; lines hai. Error argument ke naam ki spelling ki galti hai, jo login ke baad pakdi gayi kyunki arguments module chalte waqt validate hote hain.`}},{title:{en:`Did the dry run change the router?`,hi:`Kya dry run ne router badal diya?`},ticket:{en:`A trainee ran the playbook with --check on one router and saw changed=2 in the recap. He panics that the router was modified. What is the right reading of the output?`,hi:`Ek trainee ne ek router par playbook --check ke saath chalaya aur recap mein changed=2 dekha. Use ghabrahat hai ki router modify ho gaya. Output ka sahi matlab kya hai?`},out:`AUTO01$ ansible-playbook ntp.yml -l pun-core-r1 --check

PLAY [NTP and syslog baseline] ************************************************

TASK [NTP server] *************************************************************
changed: [pun-core-r1]

TASK [Syslog server] **********************************************************
changed: [pun-core-r1]

PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0`,q:{en:`What does changed=2 mean in this run?`,hi:`Is run mein changed=2 ka kya matlab hai?`},o:[{en:`Two tasks would change the router; in check mode nothing was applied`,hi:`Do tasks router ko badlenge; check mode mein kuch apply nahi hua`},{en:`Two tasks changed the router permanently`,hi:`Do tasks ne router ko permanently badal diya`},{en:`Two hosts failed`,hi:`Do hosts fail hue`},{en:`The playbook is idempotent`,hi:`Playbook idempotent hai`}],a:0,w:{en:`In check mode, changed means would change. Nothing was sent to the device. A real run would show changed=2 the first time and changed=0 the second.`,hi:`Check mode mein changed ka matlab badlega hota hai. Device ko kuch nahi bheja gaya. Asli run pehli baar changed=2 aur doosri baar changed=0 dikhata.`}}];export{e as default};