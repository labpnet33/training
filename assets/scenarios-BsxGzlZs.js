var e=[{title:{en:`One router will not answer`,hi:`Ek router jawab nahi deta`},ticket:{en:`Before a change window an engineer pings the routers with Ansible. Read the output. What is the most likely issue?`,hi:`Change window se pehle engineer Ansible se routers ko ping karta hai. Output padho. Sabse likely problem kya hai?`},out:`ANS$ ansible routers -i inventory.ini -m ping
R1 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
R2 | UNREACHABLE! => {
    "changed": false,
    "msg": "ssh connect failed: Connection timed out",
    "unreachable": true
}

ANS$ ansible-inventory -i inventory.ini --host R2
    "ansible_host": "10.99.0.21"`,q:{en:`What should he check first?`,hi:`Use pehle kya check karna chahiye?`},o:[{en:`The R2 address in the inventory: the router is actually 10.99.0.2`,hi:`The R2 address in the inventory: the router is actually 10.99.0.2`},{en:`The YAML indentation of ntp.yml`,hi:`The YAML indentation of ntp.yml`},{en:`The vault password`,hi:`The vault password`},{en:`The ios_config module spelling`,hi:`The ios_config module spelling`}],a:0,w:{en:`R1 works with the same credentials, so the fault is on the R2 line. The address has a stray digit.`,hi:`R1 same credentials se chalta hai, isliye fault R2 ki line mein hai. Address mein faltu digit hai.`}},{title:{en:`Authentication failed on every router`,hi:`Har router par authentication failed`},ticket:{en:`After the vault password was changed, the ping test fails on both routers. Read the output. What does it point to?`,hi:`Vault password badalne ke baad ping test dono routers par fail hota hai. Output padho. Yeh kis ki taraf ishaara karta hai?`},out:`ANS$ ansible routers -i inventory.ini -m ping
R1 | FAILED! => {
    "changed": false,
    "msg": "ssh connection failed: Authentication failed for user netops"
}
R2 | FAILED! => {
    "changed": false,
    "msg": "ssh connection failed: Authentication failed for user netops"
}`,q:{en:`What is the right next step?`,hi:`Sahi agla step kya hai?`},o:[{en:`Change the group name to switches`,hi:`Change the group name to switches`},{en:`Rewrite the playbook in Python`,hi:`Rewrite the playbook in Python`},{en:`Check the username and the password source (vault or variable); do not keep retrying`,hi:`Check the username and the password source (vault or variable); do not keep retrying`},{en:`Reboot both routers`,hi:`Reboot both routers`}],a:2,w:{en:`FAILED with Authentication failed means the connection opened but the credentials were rejected. Repeated tries can lock the account.`,hi:`Authentication failed ke saath FAILED matlab connection khula par credentials reject hue. Baar-baar try account lock kar sakta hai.`}},{title:{en:`The playbook did nothing`,hi:`Playbook ne kuch nahi kiya`},ticket:{en:`A colleague says the NTP playbook ran but the routers are unchanged. The output is below. What went wrong?`,hi:`Colleague kehta hai NTP playbook chala par routers nahi badle. Output neeche hai. Kya galat hua?`},out:`ANS$ ansible-playbook -i inventory.ini t1.yml

[WARNING]: Could not match supplied host pattern, ignoring: router
PLAY [Standard time and logging] **********************************************
skipping: no hosts matched

PLAY RECAP ********************************************************************`,q:{en:`What is the cause?`,hi:`Wajah kya hai?`},o:[{en:`The routers are idempotent`,hi:`The routers are idempotent`},{en:`SSH is disabled on all routers`,hi:`SSH is disabled on all routers`},{en:`Check mode was enabled`,hi:`Check mode was enabled`},{en:`The hosts: line says router but the inventory group is routers`,hi:`The hosts: line says router but the inventory group is routers`}],a:3,w:{en:`No host matched the pattern, so nothing ran and the recap is empty. Fix the group name.`,hi:`Koi host pattern se match nahi hua, isliye kuch nahi chala aur recap khaali hai. Group naam theek karo.`}},{title:{en:`Which run proves the network matches the file?`,hi:`Kaun sa run saabit karta hai ki network file se match karta hai?`},ticket:{en:`A team ran ntp.yml three times and kept the three recaps. Which one proves the routers already match the file?`,hi:`Team ne ntp.yml teen baar chalaya aur teenon recaps rakhe. Kaun sa saabit karta hai ki routers file se pehle hi match karte hain?`},out:`Run A (--check):
R1 : ok=1  changed=1  unreachable=0  failed=0
Run B (real):
R1 : ok=1  changed=1  unreachable=0  failed=0
Run C (real, again):
R1 : ok=1  changed=0  unreachable=0  failed=0`,q:{en:`Which run is the proof?`,hi:`Kaun sa run saboot hai?`},o:[{en:`Run A, because it is a dry run`,hi:`Run A, because it is a dry run`},{en:`Run C, where nothing needed to change`,hi:`Run C, where nothing needed to change`},{en:`Run B, because it changed the router`,hi:`Run B, because it changed the router`},{en:`None of them`,hi:`None of them`}],a:1,w:{en:`changed=0 on a real run shows the device already matched; Run A only predicted a change and Run B made it.`,hi:`Asli run mein changed=0 dikhata hai device pehle se match karta tha; Run A ne sirf change predict kiya aur Run B ne kiya.`}},{title:{en:`YAML error before anything runs`,hi:`Kuch chalne se pehle YAML error`},ticket:{en:`A playbook will not start. The message is below. What is wrong?`,hi:`Ek playbook start nahi hota. Message neeche hai. Kya galat hai?`},out:`ANS$ ansible-playbook -i inventory.ini t3.yml --syntax-check
ERROR! YAML syntax error while loading '/home/netops/t3.yml'
  bad indentation of a sequence entry (this line is indented more than the list item above it)

Error location: line 10, column 6

The offending line:

    - name: Point NTP and syslog at the NOC server
     ios_config:
     ^ here`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Add the vault password`,hi:`Add the vault password`},{en:`Correct the indentation of ios_config under the task name and run yaml validate`,hi:`Correct the indentation of ios_config under the task name and run yaml validate`},{en:`Change ansible_host`,hi:`Change ansible_host`},{en:`Remove the inventory`,hi:`Remove the inventory`}],a:1,w:{en:`The line is one space off compared with the line above it. A YAML error appears before any device is contacted.`,hi:`Line upar wali line se ek space off hai. YAML error kisi device se contact hone se pehle aata hai.`}},{title:{en:`Misspelled module`,hi:`Module ka naam galat`},ticket:{en:`The syntax check fails with the message below. What do you correct?`,hi:`Syntax check neeche wale message ke saath fail hota hai. Aap kya theek karoge?`},out:`ANS$ ansible-playbook -i inventory.ini t2.yml --syntax-check
ERROR! couldn't resolve module/action 'ios_confg'. This usually means the module name is misspelled or the collection is not installed

The error appears in '/home/netops/t2.yml' (line 9).`,q:{en:`What do you do?`,hi:`Aap kya karte ho?`},o:[{en:`Fix the module name to ios_config on line 9`,hi:`Fix the module name to ios_config on line 9`},{en:`Move the device to another group`,hi:`Move the device to another group`},{en:`Change the SSH port`,hi:`Change the SSH port`},{en:`Run the playbook with -v`,hi:`Run the playbook with -v`}],a:0,w:{en:`The module name has a typo; the message names the word and the line.`,hi:`Module ke naam mein typo hai; message word aur line batata hai.`}},{title:{en:`Adding a VLAN the right way`,hi:`VLAN sahi tareeke se jodna`},ticket:{en:`Management wants VLAN 30 VOICE on both switches. A junior plans to add a new task for it. Look at the data file. What is the better change?`,hi:`Management ko dono switches par VLAN 30 VOICE chahiye. Junior iske liye naya task jodna chahta hai. Data file dekho. Behtar change kya hai?`},out:`ANS$ cat -n vlans.yml
     7    vars:
     9      vlans:
    10        - vlan_id: 10
    11          name: SALES
    12        - vlan_id: 20
    13          name: ACCOUNTS
    14      ports:
    19    tasks:
    21      ios_vlans:
    22        config: "{{ vlans }}"`,q:{en:`What should he change?`,hi:`Use kya badalna chahiye?`},o:[{en:`Add a second ios_vlans task with vlan 30 typed inside it`,hi:`Add a second ios_vlans task with vlan 30 typed inside it`},{en:`Edit the router by hand over SSH`,hi:`Edit the router by hand over SSH`},{en:`Add one more item to the vlans list in the data and leave the tasks alone`,hi:`Add one more item to the vlans list in the data and leave the tasks alone`},{en:`Delete the ports list`,hi:`Delete the ports list`}],a:2,w:{en:`The tasks apply whatever is in the data list, so a new VLAN is two data lines. Then run --check, the real run and a second run.`,hi:`Tasks data list ka sab kuch apply karte hain, isliye naya VLAN do data lines hai. Phir --check, asli run aur doosra run.`}}];export{e as default};