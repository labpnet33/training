var e={id:`yaml-from-zero`,h:{en:`YAML from zero: the file format behind every playbook`,hi:`YAML from zero: har playbook ke peeche ka file format`},body:{en:`
<p>Ansible inventories, variables and playbooks are all written in <b>YAML</b>. It looks like plain text, but it has strict rules about spaces. Learn the six rules below once and you can read every Ansible file, plus Kubernetes, Netplan and CI files later.</p>

<h3>Analogy: a form with indented fields</h3>
<p>YAML is a form. Each line is a field with a label and a value, and <b>indentation shows which fields belong together</b>, like sub-commands under <code>interface Gi0/1</code> on a router. If the indentation is wrong, the meaning changes or the file is rejected.</p>

<h3>Rule 1: key and value</h3>
<pre class="code">hostname: R1
site: Pune
ntp_server: 192.0.2.10</pre>
<p>A label, a colon, a <b>space</b>, then the value. The space after the colon is required.</p>

<h3>Rule 2: lists use a dash</h3>
<pre class="code">vlans:
  - 10
  - 20
  - 30</pre>
<p>A <b>list</b> is an ordered set of items. Each item starts with <code>- </code> (dash and space) and all items line up.</p>

<h3>Rule 3: nesting by indentation</h3>
<pre class="code">snmp:
  community: nk-lab
  location: Pune DC</pre>
<p><code>community</code> and <code>location</code> belong to <code>snmp</code> because they are indented under it. This is called a <b>mapping</b> (a dictionary: labels with values).</p>

<h3>Rule 4: a list of mappings</h3>
<pre class="code">interfaces:
  - name: Gi0/1
    description: Uplink
  - name: Gi0/2
    description: Access</pre>
<p>This is the shape you meet most often. Two items; each has a <code>name</code> and a <code>description</code>. The dash starts a new item, and the keys of that item line up with each other.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="YAML structure">
<rect x="15" y="15" width="290" height="140" rx="10" fill="#e2e8f0"/>
<text x="30" y="40" class="svg-ink" font-size="13">interfaces:</text>
<text x="50" y="62" class="svg-ink" font-size="13">- name: Gi0/1</text>
<text x="66" y="82" class="svg-ink" font-size="13">description: Uplink</text>
<text x="50" y="104" class="svg-ink" font-size="13">- name: Gi0/2</text>
<text x="66" y="124" class="svg-ink" font-size="13">description: Access</text>
<rect x="345" y="20" width="280" height="40" rx="8" fill="#bae6fd"/><text x="485" y="45" text-anchor="middle" class="svg-ink" font-size="12">interfaces = a list of 2 items</text>
<rect x="345" y="70" width="280" height="40" rx="8" fill="#bbf7d0"/><text x="485" y="95" text-anchor="middle" class="svg-ink" font-size="12">each dash starts one item</text>
<rect x="345" y="120" width="280" height="40" rx="8" fill="#fde68a"/><text x="485" y="145" text-anchor="middle" class="svg-ink" font-size="12">name and description line up</text>
</svg><p class="cap">Indentation shows which lines belong together.</p></div>

<h3>Rule 5: comments, quotes and booleans</h3>
<pre class="code"># this line is a comment
motd: "Authorised use only: all access is logged"
backup_enabled: true
snmp_version: "2c"</pre>
<p><code>#</code> starts a comment. Put text in quotes when it contains a colon, or when it must stay text: <code>"2c"</code>. YAML turns words such as <code>true</code>, <code>false</code>, <code>yes</code> and <code>no</code> into booleans, so a country code <code>NO</code> or a value <code>yes</code> may not stay text unless quoted. If a value <b>starts</b> with <code>{{</code> (an Ansible variable), always quote it: <code>"{{ ntp_server }}"</code>.</p>

<h3>Rule 6: spaces, never tabs</h3>
<p>Use two spaces per level. A tab character makes the file invalid. Configure your editor to insert spaces, and remember that nano and vim will happily insert a tab if you press the Tab key in some setups.</p>

<h3>Checking a file before you run it</h3>
<pre class="code">$ ansible-playbook --syntax-check site.yml
playbook: site.yml</pre>
<p>If the file is valid, Ansible prints just the playbook name. If not, it tells you the line and column of the problem. Read the line shown, then the line above it: the mistake is often one indentation level off.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Missing space after the colon. (2) Mixing one-space and two-space indentation. (3) A tab character. (4) An unquoted value that starts with <code>{{</code>. (5) Items of a list not lined up.</p></div>
<div class="exam"><p><b>Interview trap.</b> YAML is a data format, not a programming language. It has no loops or conditions of its own; Ansible adds <code>loop:</code> and <code>when:</code> on top of it.</p></div>

<div class="scn"><h4>The VLAN that never arrived</h4><p>An engineer added <code>- 40</code> to a list of VLANs but indented it one space less than the others. The file was still valid YAML, but the new item was read as part of a different key, so VLAN 40 was not created on any switch. The playbook ran green because nothing was wrong from its point of view.</p><p><b>Lesson:</b> a valid file is not always a correct file. Print the variable with a debug task and look at it before you push.</p></div>

<div class="iv"><p class="q">"What is YAML and why does Ansible use it?"</p><p>It is a human-readable data format built from key and value pairs, lists and nesting by indentation. Ansible uses it because playbooks and inventories are meant to be read and reviewed by people. Mention the two classic errors: tabs and wrong indentation.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>key: value, with a space after the colon.</li>
<li>A list uses a dash and a space for each item.</li>
<li>Indentation (two spaces) shows what belongs to what.</li>
<li>Quote values that start with a brace or contain a colon.</li>
<li>Never use tabs; check files with --syntax-check.</li>
</ul></div>
`,hi:`
<p>Ansible inventories, variables aur playbooks sab <b>YAML</b> mein likhe jaate hain. Yeh plain text jaisa dikhta hai, lekin spaces ke bare mein iske strict rules hain. Neeche ke chhe rules ek baar seekh lo aur aap har Ansible file padh sakte ho, aur aage Kubernetes, Netplan aur CI files bhi.</p>

<h3>Analogy: indent wale fields ka form</h3>
<p>YAML ek form hai. Har line ek field hai jisme label aur value hai, aur <b>indentation batata hai ki kaunse fields saath hain</b>, jaise router par <code>interface Gi0/1</code> ke neeche sub-commands. Indentation galat ho to matlab badal jaata hai ya file reject ho jaati hai.</p>

<h3>Rule 1: key aur value</h3>
<pre class="code">hostname: R1
site: Pune
ntp_server: 192.0.2.10</pre>
<p>Label, colon, ek <b>space</b>, phir value. Colon ke baad ka space zaroori hai.</p>

<h3>Rule 2: list mein dash lagta hai</h3>
<pre class="code">vlans:
  - 10
  - 20
  - 30</pre>
<p><b>List</b> items ka ordered set hai. Har item <code>- </code> (dash aur space) se shuru hota hai aur sab items seedhe line mein hote hain.</p>

<h3>Rule 3: indentation se nesting</h3>
<pre class="code">snmp:
  community: nk-lab
  location: Pune DC</pre>
<p><code>community</code> aur <code>location</code>, <code>snmp</code> ke hain kyunki woh uske neeche indent hain. Ise <b>mapping</b> kehte hain (dictionary: labels aur values).</p>

<h3>Rule 4: mappings ki list</h3>
<pre class="code">interfaces:
  - name: Gi0/1
    description: Uplink
  - name: Gi0/2
    description: Access</pre>
<p>Yeh shape aap sabse zyada dekhoge. Do items; har ek mein <code>name</code> aur <code>description</code>. Dash naya item shuru karta hai, aur us item ki keys ek line mein hoti hain.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="YAML structure">
<rect x="15" y="15" width="290" height="140" rx="10" fill="#e2e8f0"/>
<text x="30" y="40" class="svg-ink" font-size="13">interfaces:</text>
<text x="50" y="62" class="svg-ink" font-size="13">- name: Gi0/1</text>
<text x="66" y="82" class="svg-ink" font-size="13">description: Uplink</text>
<text x="50" y="104" class="svg-ink" font-size="13">- name: Gi0/2</text>
<text x="66" y="124" class="svg-ink" font-size="13">description: Access</text>
<rect x="345" y="20" width="280" height="40" rx="8" fill="#bae6fd"/><text x="485" y="45" text-anchor="middle" class="svg-ink" font-size="12">interfaces = 2 items ki list</text>
<rect x="345" y="70" width="280" height="40" rx="8" fill="#bbf7d0"/><text x="485" y="95" text-anchor="middle" class="svg-ink" font-size="12">har dash ek item shuru karta hai</text>
<rect x="345" y="120" width="280" height="40" rx="8" fill="#fde68a"/><text x="485" y="145" text-anchor="middle" class="svg-ink" font-size="12">name aur description line mein</text>
</svg><p class="cap">Indentation batata hai kaunsi lines saath hain.</p></div>

<h3>Rule 5: comments, quotes aur booleans</h3>
<pre class="code"># this line is a comment
motd: "Authorised use only: all access is logged"
backup_enabled: true
snmp_version: "2c"</pre>
<p><code>#</code> comment shuru karta hai. Text ko quotes mein rakho jab usme colon ho, ya jab woh text hi rehna chahiye: <code>"2c"</code>. YAML <code>true</code>, <code>false</code>, <code>yes</code> aur <code>no</code> jaise words ko booleans bana deta hai, isliye country code <code>NO</code> ya value <code>yes</code> quote ke bina text nahi rehti. Agar value <code>{{</code> (Ansible variable) se <b>shuru</b> ho, to hamesha quote karo: <code>"{{ ntp_server }}"</code>.</p>

<h3>Rule 6: spaces, kabhi tabs nahi</h3>
<p>Har level par do spaces. Tab character file ko invalid bana deta hai. Apne editor ko spaces insert karne ke liye set karo, aur yaad rakho ki kuch setups mein Tab key dabane par nano aur vim tab daal dete hain.</p>

<h3>Chalane se pehle file check karna</h3>
<pre class="code">$ ansible-playbook --syntax-check site.yml
playbook: site.yml</pre>
<p>File valid ho to Ansible sirf playbook ka naam print karta hai. Nahi to woh problem ki line aur column batata hai. Dikhayi gayi line padho, phir uske upar wali: galti aksar ek indentation level ki hoti hai.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Colon ke baad space nahi. (2) Ek-space aur do-space indentation mix karna. (3) Tab character. (4) <code>{{</code> se shuru hone wali value bina quote ke. (5) List ke items ek line mein nahi.</p></div>
<div class="exam"><p><b>Interview trap.</b> YAML data format hai, programming language nahi. Isme apne loops ya conditions nahi hote; Ansible uske upar <code>loop:</code> aur <code>when:</code> jodta hai.</p></div>

<div class="scn"><h4>Woh VLAN jo kabhi aaya hi nahi</h4><p>Ek engineer ne VLANs ki list mein <code>- 40</code> jodha lekin use baaki se ek space kam indent kiya. File phir bhi valid YAML thi, par naya item kisi aur key ka hissa padha gaya, isliye VLAN 40 kisi switch par nahi bana. Playbook green chala kyunki uske hisaab se kuch galat nahi tha.</p><p><b>Lesson:</b> valid file hamesha sahi file nahi hoti. Push se pehle debug task se variable print karo aur dekho.</p></div>

<div class="iv"><p class="q">"YAML kya hai aur Ansible use kyun karta hai?"</p><p>Yeh human-readable data format hai jo key aur value pairs, lists aur indentation se nesting se bana hai. Ansible isliye use karta hai kyunki playbooks aur inventories logon ke padhne aur review karne ke liye hote hain. Do classic errors batao: tabs aur galat indentation.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>key: value, colon ke baad space ke saath.</li>
<li>List mein har item ke liye dash aur space.</li>
<li>Indentation (do spaces) batata hai kya kiska hai.</li>
<li>Brace se shuru hone wali ya colon wali values quote karo.</li>
<li>Tabs kabhi nahi; files ko --syntax-check se check karo.</li>
</ul></div>
`}};export{e as default};