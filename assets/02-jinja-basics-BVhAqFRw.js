var e={id:`jinja-basics`,h:{en:`Jinja2 basics: the three kinds of marker`,hi:`Jinja2 basics: teen tarah ke marker`},body:{en:`
<p><b>One idea in this chapter:</b> a Jinja2 template is ordinary text with three kinds of marker. Learn to recognise them and you can read any template.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Three Jinja2 markers">
<rect x="20" y="25" width="190" height="100" rx="10" fill="#bae6fd"/><text x="115" y="55" text-anchor="middle" class="svg-ink" font-size="15">{{ ... }}</text><text x="115" y="80" text-anchor="middle" class="svg-muted" font-size="12">print a value</text><text x="115" y="100" text-anchor="middle" class="svg-muted" font-size="12">{{ hostname }}</text>
<rect x="225" y="25" width="190" height="100" rx="10" fill="#fde68a"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="15">{% ... %}</text><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="12">do something</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">for, if, set</text>
<rect x="430" y="25" width="190" height="100" rx="10" fill="#e2e8f0"/><text x="525" y="55" text-anchor="middle" class="svg-ink" font-size="15">{# ... #}</text><text x="525" y="80" text-anchor="middle" class="svg-muted" font-size="12">comment, never printed</text><text x="525" y="100" text-anchor="middle" class="svg-muted" font-size="12">for humans only</text>
</svg><p class="cap">Everything outside these markers is copied to the output unchanged.</p></div>

<h3>Marker 1: print a value</h3>
<p>Double curly braces around a name print the value of that variable. A <b>variable</b> is a name that holds a value, like a label on a box. Ansible has already loaded the host's variables from the inventory, group_vars and host_vars before the template is rendered, so the template just uses the names. Names are case sensitive: <code>Hostname</code> and <code>hostname</code> are different boxes.</p>
<p>Variables can hold a word, a number, a <b>list</b> (items in order) or a <b>dictionary</b> (named items, like <code>id</code> and <code>name</code>). You reach inside with a dot or square brackets: <code>vlan.id</code>, <code>vlan['id']</code>, <code>ntp_servers[0]</code> (counting starts at 0).</p>

<h3>Marker 2: statements</h3>
<p>Curly brace and percent sign tags run logic: <code>{% for %}</code>, <code>{% if %}</code>, <code>{% set %}</code>. They print nothing themselves. <code>{% set mgmt_vlan = 99 %}</code> creates a temporary variable that lives only inside the template. Chapters 4 and 5 cover loops and conditions.</p>

<h3>Marker 3: comments</h3>
<p>Text between <code>{#</code> and <code>#}</code> is removed. Use it to explain a tricky line to the next engineer. Unlike a router comment (<code>!</code>), a Jinja comment never reaches the device.</p>

<h3>Seeing it work</h3>
<p>We use a small helper playbook, <code>preview.yml</code>. It renders any template we name with <code>-e tpl=NAME</code> into <code>configs/HOST.cfg</code>. Chapter 3 explains each line; here it only lets us look at results.</p>
<pre class="code"><span class="c"># templates/hello.j2</span>
{# This comment never reaches the router #}
hostname {{ hostname }}
ip domain name {{ domain_name }}
interface Loopback0
 ip address {{ loopback_ip }} 255.255.255.255
{% set mgmt_vlan = 99 %}
! management VLAN is {{ mgmt_vlan }}
! first NTP server is {{ ntp_servers[0] }}
! device name from inventory: {{ inventory_hostname }}</pre>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook preview.yml -e tpl=hello.j2
...
netadmin@auto01:~/netauto$ cat configs/pun-core-r1.cfg
hostname <span class="hl">PUN-CORE-R1</span>
ip domain name nk.lab
interface Loopback0
 ip address 10.255.255.1 255.255.255.255
! management VLAN is <span class="hl">99</span>
! first NTP server is <span class="hl">10.99.0.60</span>
! device name from inventory: <span class="hl">pun-core-r1</span></pre>
<p>Where did each value come from? <code>ansible-inventory --host</code> shows every variable Ansible has for one device, merged from all files. If a name is not in this list, the template cannot use it.</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-inventory --host pun-core-r1
{
    "ansible_connection": "ansible.netcommon.network_cli",
    "ansible_host": "10.99.0.1",
    "ansible_network_os": "cisco.ios.ios",
    "ansible_password": "NK@2026",
    "ansible_user": "netops",
    "domain_name": "nk.lab",
    "hostname": "PUN-CORE-R1",
    "loopback_ip": "10.255.255.1",
    "ntp_servers": [
        "10.99.0.60"
    ],
    "syslog_host": "10.99.0.60"
}</pre>
<p><code>inventory_hostname</code> is not in that list because it is a <b>magic variable</b> that Ansible always provides: the name of the host in the inventory.</p>

<h3>What happens when a name is missing</h3>
<p>Suppose a template prints <code>{{ site_code }}</code> and no file defines it. Ansible refuses to render instead of printing a blank. That is a feature: a blank in a router config is worse than an error.</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook preview.yml -e tpl=oops.j2 --limit pun-core-r1
...
TASK [Render the template] ****************************************************
fatal: [pun-core-r1 -&gt; localhost]: FAILED! =&gt; {"changed": false, "msg": <span class="hl">"AnsibleUndefinedVariable: 'site_code' is undefined"</span>}</pre>
<p>The message names the missing variable. Fix it by defining it in group_vars or host_vars, or (chapter 6) by giving it a safe default.</p>

<div class="warn"><p><b>Common mistakes.</b> Typing <code>{ hostname }</code> with one brace (it prints literally); putting a router comment <code>!</code> where you wanted a Jinja comment; misspelling a variable name; forgetting that list positions start at 0.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>{{ }}</code> prints, <code>{% %}</code> acts, <code>{# #}</code> is silent. Expect a question that gives a template line and asks what it prints.</p></div>

<div class="scn"><h4>The blank hostname that never was</h4><p>An older tool silently printed blanks for missing data, and one router once received <code>hostname</code> with nothing after it. With Ansible the same typo stops the run with <i>'hostname' is undefined</i> on that host before any file is written, and the engineer fixes the host file in a minute.</p><p><b>Lesson:</b> a loud error at render time is cheaper than a silent bad config on a device.</p></div>

<div class="iv"><p class="q">"What do the Jinja2 delimiters mean?"</p><p>Double braces output an expression, brace-percent tags run statements such as for and if, and brace-hash is a comment. Everything else is literal text. Add that undefined variables raise an error in Ansible by default.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three markers: print, statement, comment.</li>
<li>Variables come from inventory, group_vars and host_vars; check them with ansible-inventory --host.</li>
<li>Reach into lists with [0] and into dictionaries with a dot.</li>
<li>An undefined variable stops the render with a clear error.</li>
<li>Jinja comments never reach the device.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka ek idea:</b> Jinja2 template aam text hota hai jisme teen tarah ke marker hote hain. Unhe pehchanna seekh lo to aap koi bhi template padh sakte ho.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Teen Jinja2 markers">
<rect x="20" y="25" width="190" height="100" rx="10" fill="#bae6fd"/><text x="115" y="55" text-anchor="middle" class="svg-ink" font-size="15">{{ ... }}</text><text x="115" y="80" text-anchor="middle" class="svg-muted" font-size="12">value print karo</text><text x="115" y="100" text-anchor="middle" class="svg-muted" font-size="12">{{ hostname }}</text>
<rect x="225" y="25" width="190" height="100" rx="10" fill="#fde68a"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="15">{% ... %}</text><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="12">kuch karo</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">for, if, set</text>
<rect x="430" y="25" width="190" height="100" rx="10" fill="#e2e8f0"/><text x="525" y="55" text-anchor="middle" class="svg-ink" font-size="15">{# ... #}</text><text x="525" y="80" text-anchor="middle" class="svg-muted" font-size="12">comment, print nahi hota</text><text x="525" y="100" text-anchor="middle" class="svg-muted" font-size="12">sirf insaanon ke liye</text>
</svg><p class="cap">In markers ke bahar ka sab kuch output mein jaisa hai waisa copy hota hai.</p></div>

<h3>Marker 1: value print karo</h3>
<p>Naam ke around double curly braces us variable ki value print karte hain. <b>Variable</b> ek naam hai jo value rakhta hai, jaise dibbe par label. Template render hone se pehle Ansible inventory, group_vars aur host_vars se host ke variables load kar chuka hota hai, isliye template bas naam use karta hai. Naam case sensitive hain: <code>Hostname</code> aur <code>hostname</code> alag dibbe hain.</p>
<p>Variable mein ek word, number, <b>list</b> (items order mein) ya <b>dictionary</b> (naam wale items, jaise <code>id</code> aur <code>name</code>) ho sakta hai. Andar dot ya square brackets se pahunchte ho: <code>vlan.id</code>, <code>vlan['id']</code>, <code>ntp_servers[0]</code> (ginti 0 se shuru hoti hai).</p>

<h3>Marker 2: statements</h3>
<p>Curly brace aur percent wale tags logic chalate hain: <code>{% for %}</code>, <code>{% if %}</code>, <code>{% set %}</code>. Yeh khud kuch print nahi karte. <code>{% set mgmt_vlan = 99 %}</code> ek temporary variable banata hai jo sirf template ke andar rehta hai. Loops aur conditions chapter 4 aur 5 mein hain.</p>

<h3>Marker 3: comments</h3>
<p><code>{#</code> aur <code>#}</code> ke beech ka text hata diya jaata hai. Agle engineer ko mushkil line samjhane ke liye use karo. Router comment (<code>!</code>) ke ulat, Jinja comment device tak kabhi nahi pahunchta.</p>

<h3>Kaam karte dekhna</h3>
<p>Hum ek chhota helper playbook <code>preview.yml</code> use karte hain. Yeh <code>-e tpl=NAME</code> se bataye gaye kisi bhi template ko <code>configs/HOST.cfg</code> mein render karta hai. Har line chapter 3 mein samjhayenge; yahan yeh sirf nateeje dekhne deta hai.</p>
<pre class="code"><span class="c"># templates/hello.j2</span>
{# This comment never reaches the router #}
hostname {{ hostname }}
ip domain name {{ domain_name }}
interface Loopback0
 ip address {{ loopback_ip }} 255.255.255.255
{% set mgmt_vlan = 99 %}
! management VLAN is {{ mgmt_vlan }}
! first NTP server is {{ ntp_servers[0] }}
! device name from inventory: {{ inventory_hostname }}</pre>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook preview.yml -e tpl=hello.j2
...
netadmin@auto01:~/netauto$ cat configs/pun-core-r1.cfg
hostname <span class="hl">PUN-CORE-R1</span>
ip domain name nk.lab
interface Loopback0
 ip address 10.255.255.1 255.255.255.255
! management VLAN is <span class="hl">99</span>
! first NTP server is <span class="hl">10.99.0.60</span>
! device name from inventory: <span class="hl">pun-core-r1</span></pre>
<p>Har value kahan se aayi? <code>ansible-inventory --host</code> ek device ke liye Ansible ke paas jo bhi variables hain, saari files se merge karke dikhata hai. Agar naam is list mein nahi hai, to template use nahi kar sakta.</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-inventory --host pun-core-r1
{
    "ansible_connection": "ansible.netcommon.network_cli",
    "ansible_host": "10.99.0.1",
    "ansible_network_os": "cisco.ios.ios",
    "ansible_password": "NK@2026",
    "ansible_user": "netops",
    "domain_name": "nk.lab",
    "hostname": "PUN-CORE-R1",
    "loopback_ip": "10.255.255.1",
    "ntp_servers": [
        "10.99.0.60"
    ],
    "syslog_host": "10.99.0.60"
}</pre>
<p><code>inventory_hostname</code> is list mein nahi hai kyunki yeh <b>magic variable</b> hai jo Ansible hamesha deta hai: inventory mein host ka naam.</p>

<h3>Naam missing ho to kya hota hai</h3>
<p>Maano template <code>{{ site_code }}</code> print karta hai aur kisi file mein woh define nahi. Ansible blank print karne ke bajaye render karne se mana kar deta hai. Yeh feature hai: router config mein blank, error se zyada kharab hai.</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook preview.yml -e tpl=oops.j2 --limit pun-core-r1
...
TASK [Render the template] ****************************************************
fatal: [pun-core-r1 -&gt; localhost]: FAILED! =&gt; {"changed": false, "msg": <span class="hl">"AnsibleUndefinedVariable: 'site_code' is undefined"</span>}</pre>
<p>Message missing variable ka naam batata hai. Ise group_vars ya host_vars mein define karke, ya (chapter 6) safe default dekar theek karo.</p>

<div class="warn"><p><b>Common mistakes.</b> <code>{ hostname }</code> ek brace ke saath likhna (yeh literally print hota hai); jahan Jinja comment chahiye wahan router comment <code>!</code> likhna; variable ka naam galat likhna; yeh bhoolna ki list ki position 0 se shuru hoti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>{{ }}</code> print karta hai, <code>{% %}</code> kaam karta hai, <code>{# #}</code> chup hai. Aisa sawaal aayega jisme template ki line di jaati hai aur poocha jaata hai ki kya print hoga.</p></div>

<div class="scn"><h4>Woh blank hostname jo kabhi gaya hi nahi</h4><p>Ek purana tool missing data par chupchaap blank print karta tha, aur ek router ko kabhi <code>hostname</code> bina kisi naam ke mila. Ansible ke saath wahi typo run ko us host par <i>'hostname' is undefined</i> se rok deta hai, koi file likhne se pehle, aur engineer ek minute mein host file theek kar deta hai.</p><p><b>Lesson:</b> render time par zor ka error, device par chupchaap kharab config se sasta hai.</p></div>

<div class="iv"><p class="q">"Jinja2 delimiters ka kya matlab hai?"</p><p>Double braces expression output karte hain, brace-percent tags for aur if jaise statements chalate hain, aur brace-hash comment hai. Baaki sab literal text hai. Yeh bhi jodo ki Ansible mein undefined variable by default error deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen markers: print, statement, comment.</li>
<li>Variables inventory, group_vars aur host_vars se aate hain; ansible-inventory --host se check karo.</li>
<li>List mein [0] se aur dictionary mein dot se andar jao.</li>
<li>Undefined variable render ko saaf error se rok deta hai.</li>
<li>Jinja comments device tak nahi pahunchte.</li>
</ul></div>
`}};export{e as default};