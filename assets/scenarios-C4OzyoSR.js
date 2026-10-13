var e=[{title:{en:`The render that names a missing variable`,hi:`Render jo missing variable ka naam batata hai`},ticket:{en:`A new template line was added: snmp-server location {{ site_code }}. The render for pun-core-r1 fails. What is the right first fix?`,hi:`Template mein nayi line judi: snmp-server location {{ site_code }}. pun-core-r1 ka render fail ho gaya. Sabse pehla sahi fix kya hai?`},out:`netadmin@auto01:~/netauto$ ansible-playbook preview.yml -e tpl=oops.j2 --limit pun-core-r1

PLAY [Render one template for every router] ***********************************

TASK [Folder for the rendered configs] ****************************************
ok: [pun-core-r1 -> localhost]

TASK [Render the template] ****************************************************
fatal: [pun-core-r1 -> localhost]: FAILED! => {"changed": false, "msg": "AnsibleUndefinedVariable: 'site_code' is undefined"}

NO MORE HOSTS LEFT ************************************************************
pun-core-r1                : ok=1    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0`,q:{en:`What should the engineer do?`,hi:`Engineer ko kya karna chahiye?`},o:[{en:`Add ignore_errors: true to the template task`,hi:`Template task mein ignore_errors: true jodo`},{en:`Define site_code for the host or group in host_vars or group_vars`,hi:`host_vars ya group_vars mein host ya group ke liye site_code define karo`},{en:`Delete the line from the router by hand`,hi:`Line ko router se haath se delete karo`},{en:`Run the playbook with --syntax-check to fix it`,hi:`Fix karne ke liye playbook --syntax-check se chalao`}],a:1,w:{en:`The error names the variable. Supplying the data (or a deliberate default) fixes the cause. ignore_errors would hide it, and --syntax-check does not render templates.`,hi:`Error variable ka naam batata hai. Data (ya soch-samajhkar default) dena karan theek karta hai. ignore_errors ise chhupayega, aur --syntax-check templates render nahi karta.`}},{title:{en:`File module aimed at a router`,hi:`Router par nishana lagaya file module`},ticket:{en:`A teammate wrote a render task for the routers group. Both routers fail immediately. Read the output.`,hi:`Teammate ne routers group ke liye render task likha. Dono routers turant fail ho gaye. Output padho.`},out:`netadmin@auto01:~/netauto$ ansible-playbook a.yml

PLAY [Render without delegate_to] *********************************************

TASK [Render the config] ******************************************************
fatal: [pun-core-r1]: FAILED! => {"changed": false, "msg": "Connection type network_cli is not valid for this module"}
fatal: [blr-edge-r2]: FAILED! => {"changed": false, "msg": "Connection type network_cli is not valid for this module"}

NO MORE HOSTS LEFT ************************************************************`,q:{en:`What is missing from the task?`,hi:`Task mein kya missing hai?`},o:[{en:`delegate_to: localhost`,hi:`delegate_to: localhost`},{en:`become: true`,hi:`become: true`},{en:`gather_facts: true`,hi:`gather_facts: true`},{en:`save_when: modified`,hi:`save_when: modified`}],a:0,w:{en:`The template module writes a file, which the network_cli connection cannot do on a router. delegate_to: localhost runs it on the control node with the router's variables.`,hi:`Template module file likhta hai, jo network_cli connection router par nahi kar sakta. delegate_to: localhost use control node par router ke variables se chalata hai.`}},{title:{en:`Works on one server, fails on another`,hi:`Ek server par chalta hai, doosre par fail`},ticket:{en:`The render playbook ran on the engineer's test box but fails on the shared control node. What is the fix that makes the playbook work everywhere?`,hi:`Render playbook engineer ke test box par chala lekin shared control node par fail hai. Woh fix kya hai jo playbook ko har jagah chalayega?`},out:`TASK [Render the config] ******************************************************
fatal: [pun-core-r1 -> localhost]: FAILED! => {"changed": false, "checksum": "4697dbe41d91c41d", "msg": "Destination directory /home/netadmin/netauto/configs does not exist"}
fatal: [blr-edge-r2 -> localhost]: FAILED! => {"changed": false, "checksum": "1280ef2f72bea156", "msg": "Destination directory /home/netadmin/netauto/configs does not exist"}`,q:{en:`Best fix?`,hi:`Sabse achha fix?`},o:[{en:`Run the playbook as root`,hi:`Playbook root se chalao`},{en:`Create the folder once by hand on every server`,hi:`Har server par folder ek baar haath se banao`},{en:`Add an earlier file task with state: directory (delegate_to: localhost, run_once: true)`,hi:`Pehle ek file task jodo jisme state: directory ho (delegate_to: localhost, run_once: true)`},{en:`Change dest to /etc`,hi:`dest ko /etc kar do`}],a:2,w:{en:`The template module does not create parent folders. A file task inside the playbook makes the playbook self-sufficient on a fresh machine.`,hi:`Template module parent folders nahi banata. Playbook ke andar file task use nayi machine par bhi self-sufficient banata hai.`}},{title:{en:`Syntax check passes, the run fails`,hi:`Syntax check pass, run fail`},ticket:{en:`An engineer says the playbook is fine because --syntax-check passed, but the real run fails on the template. Why did the check not catch it?`,hi:`Engineer kehta hai playbook theek hai kyunki --syntax-check pass hua, lekin asli run template par fail hota hai. Check ne ise kyun nahi pakda?`},out:`netadmin@auto01:~/netauto$ ansible-playbook t4.yml --syntax-check

playbook: t4.yml

netadmin@auto01:~/netauto$ ansible-playbook t4.yml

TASK [ansible.builtin.template] ***********************************************
fatal: [pun-core-r1 -> localhost]: FAILED! => {"changed": false, "msg": "AnsibleError: template error while templating string: Unexpected end of template. Jinja was looking for the following tags: 'endfor' or 'else'. The innermost block that needs to be closed is 'for'.. String: {% for s in ntp_servers %}\\nntp server {{ s }}\\n"}`,q:{en:`What explains the difference?`,hi:`Antar ka kya karan hai?`},o:[{en:`Syntax check is only for ini files`,hi:`Syntax check sirf ini files ke liye hai`},{en:`The router rejected the config`,hi:`Router ne config reject kiya`},{en:`The inventory is wrong`,hi:`Inventory galat hai`},{en:`Syntax check parses the playbook YAML but does not render the Jinja2 template; the loop is missing its endfor`,hi:`Syntax check playbook YAML parse karta hai lekin Jinja2 template render nahi karta; loop mein endfor missing hai`}],a:3,w:{en:`Templates are only read when the template task runs. Add the missing endfor and render the file to test it.`,hi:`Templates tabhi padhe jaate hain jab template task chalta hai. Missing endfor jodo aur file render karke test karo.`}},{title:{en:`The spare port that stopped the render`,hi:`Spare port jisne render rok diya`},ticket:{en:`The interfaces loop worked until a spare port without an IP address was added to host_vars. Read the error.`,hi:`Interfaces loop tab tak chala jab tak host_vars mein bina IP wala spare port nahi joda gaya. Error padho.`},out:`# templates/ifs.j2
{% for iface in interfaces %}
interface {{ iface.name }}
 ip address {{ iface.ip }} {{ iface.mask }}
{% endfor %}

# host_vars/pun-core-r1.yml (part)
interfaces:
  - {name: GigabitEthernet0/1, ip: 192.0.2.1, mask: 255.255.255.252}
  - {name: GigabitEthernet0/2}

TASK [ansible.builtin.template] ***********************************************
fatal: [pun-core-r1 -> localhost]: FAILED! => {"changed": false, "msg": "AnsibleUndefinedVariable: 'dict object' has no attribute 'ip'"}`,q:{en:`How should the template handle ports with no IP?`,hi:`Template ko bina IP wale ports kaise sambhalne chahiye?`},o:[{en:`Give every spare port a fake IP address`,hi:`Har spare port ko nakli IP address do`},{en:`Wrap the address line in {% if iface.ip is defined %} ... {% endif %}`,hi:`Address line ko {% if iface.ip is defined %} ... {% endif %} mein lapeto`},{en:`Delete the spare port from the inventory`,hi:`Spare port ko inventory se delete karo`},{en:`Use --check to skip it`,hi:`Ise skip karne ke liye --check use karo`}],a:1,w:{en:`is defined makes the optional field safe. A fake IP would put wrong config on the router.`,hi:`is defined optional field ko surakshit banata hai. Nakli IP router par galat config daal deta.`}},{title:{en:`Which device drifted?`,hi:`Kaunsa device bhatka?`},ticket:{en:`The nightly baseline check ran with --check --diff. Which device differs from the standard, and what would the standard add?`,hi:`Nightly baseline check --check --diff se chala. Kaunsa device standard se alag hai, aur standard kya jodta?`},out:`netadmin@auto01:~/netauto$ ansible-playbook baseline.yml --check --diff

TASK [Standard NTP and syslog] ************************************************
ok: [pun-core-r1]
--- before: running-config
+++ after: running-config
@@ -51,4 +51,5 @@
  login local
  transport input ssh
 !
+ntp server 10.99.0.60
 end
changed: [blr-edge-r2]
ok: [pun-acc-sw1]

PLAY RECAP ********************************************************************
pun-core-r1                : ok=1    changed=0    unreachable=0    failed=0
blr-edge-r2                : ok=1    changed=1    unreachable=0    failed=0
pun-acc-sw1                : ok=1    changed=0    unreachable=0    failed=0`,q:{en:`What does the output say?`,hi:`Output kya kehta hai?`},o:[{en:`pun-core-r1 drifted; it lacks a syslog line`,hi:`pun-core-r1 bhatka; usme syslog line nahi`},{en:`All three devices match the standard`,hi:`Teeno devices standard se match karte hain`},{en:`blr-edge-r2 drifted; the standard would add ntp server 10.99.0.60`,hi:`blr-edge-r2 bhatka; standard ntp server 10.99.0.60 jodta`},{en:`pun-acc-sw1 failed to connect`,hi:`pun-acc-sw1 connect nahi hua`}],a:2,w:{en:`In check mode only blr-edge-r2 reports changed, so only it differs. Nothing was sent to any device.`,hi:`Check mode mein sirf blr-edge-r2 changed batata hai, isliye sirf wahi alag hai. Kisi device ko kuch nahi bheja gaya.`}},{title:{en:`The old NTP server is still there`,hi:`Purana NTP server abhi bhi hai`},ticket:{en:`The team changed ntp_servers in group_vars to only 10.99.0.61 and re-ran the playbook, expecting the old server to be gone. Read the result.`,hi:`Team ne group_vars mein ntp_servers sirf 10.99.0.61 kiya aur playbook dobara chalaya, umeed thi ki purana server hat jaayega. Nateeja padho.`},out:`netadmin@auto01:~/netauto$ grep ntp_servers group_vars/all.yml
ntp_servers: [10.99.0.61]

netadmin@auto01:~/netauto$ ansible-playbook render.yml
TASK [Render the config] ******************************************************
changed: [pun-core-r1 -> localhost]
changed: [blr-edge-r2 -> localhost]

TASK [Push the config] ********************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]

R1# show running-config | include ntp
ntp server 10.99.0.60
ntp server 10.99.0.61`,q:{en:`Why is 10.99.0.60 still on the router?`,hi:`Router par 10.99.0.60 abhi bhi kyun hai?`},o:[{en:`ios_config only adds missing lines; it does not remove lines that left the template`,hi:`ios_config sirf gaayab lines jodta hai; template se gayi lines nahi hatata`},{en:`The router needs a reload`,hi:`Router ko reload chahiye`},{en:`The template module failed silently`,hi:`Template module chupchaap fail hua`},{en:`Check mode was left on`,hi:`Check mode on reh gaya`}],a:0,w:{en:`The rendered file changed, but every line of it was already on the router, so the push reported ok. Removal needs an explicit step: read the device, filter with difference, then remove.`,hi:`Rendered file badli, lekin uski har line router par pehle se thi, isliye push ne ok batayi. Hatane ke liye alag step chahiye: device padho, difference se filter karo, phir hatao.`}}];export{e as default};