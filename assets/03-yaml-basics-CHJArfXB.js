var e={id:`yaml-basics`,h:{en:`YAML from zero: the text format of playbooks`,hi:`YAML zero se: playbooks ka text format`},body:{en:`

<p><b>One idea in this chapter:</b> YAML is just a way to write lists and labelled values using plain text and spaces. If you can write a shopping list, you can write YAML. Playbooks, variable files and CI/CD pipelines in the next module all use it, so a little time here pays off three times.</p>

<h3>Rule 1: key and value</h3>
<p>A <b>key: value</b> pair is a label followed by a colon, a <i>space</i>, then the value. The space after the colon is required.</p>
<pre class="code">hostname: R1
ntp_server: 10.99.0.100
gather_facts: no</pre>
<p>Each line pairs a name with a value. A group of such pairs is called a <b>mapping</b> (some people say dictionary). Words like <code>yes</code> and <code>no</code> are read as true and false.</p>

<h3>Rule 2: a list uses a dash</h3>
<p>A line that starts with <code>- </code> (dash, space) is one item of a <b>list</b>. Items are written one under another, in the same column.</p>
<pre class="code">routers:
  - R1
  - R2
  - R3</pre>
<p>The key <code>routers</code> holds a list of three names.</p>

<h3>Rule 3: indentation shows structure</h3>
<p>Spaces at the start of a line show what belongs to what. A line indented more than the line above is <i>inside</i> it. Lines at the same level start in exactly the same column. Use <b>spaces, never the Tab key</b>, and use the same number of spaces each time (two is the habit).</p>
<pre class="code">vlans:                 <span class="c"># key "vlans" holds a list</span>
  - id: 10             <span class="c"># list item 1 starts with a dash...</span>
    name: SALES        <span class="c"># ...and continues on the next line, lined up under "id"</span>
  - id: 20             <span class="c"># list item 2</span>
    name: ACCOUNTS</pre>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Indentation shows the structure: vlans holds a list, and each list item holds id and name."><rect x="20" y="15" width="290" height="170" rx="10" fill="#1e293b"/><text x="35" y="42" fill="#e2e8f0" font-size="13" font-family="monospace">vlans:</text><text x="35" y="66" fill="#e2e8f0" font-size="13" font-family="monospace">  - id: 10</text><text x="35" y="90" fill="#e2e8f0" font-size="13" font-family="monospace">    name: SALES</text><text x="35" y="114" fill="#e2e8f0" font-size="13" font-family="monospace">  - id: 20</text><text x="35" y="138" fill="#e2e8f0" font-size="13" font-family="monospace">    name: ACCOUNTS</text><rect x="360" y="20" width="110" height="36" rx="8" fill="#fde68a"/><text x="415" y="43" text-anchor="middle" class="svg-ink" font-size="13">vlans</text><rect x="330" y="80" width="80" height="36" rx="8" fill="#bae6fd"/><text x="370" y="103" text-anchor="middle" class="svg-ink" font-size="12">item 1</text><rect x="430" y="80" width="80" height="36" rx="8" fill="#bae6fd"/><text x="470" y="103" text-anchor="middle" class="svg-ink" font-size="12">item 2</text><text x="370" y="150" text-anchor="middle" class="svg-muted" font-size="11">id: 10, name: SALES</text><text x="470" y="170" text-anchor="middle" class="svg-muted" font-size="11">id: 20, name: ACCOUNTS</text><line x1="415" y1="56" x2="370" y2="80" stroke="#64748b" stroke-width="2"/><line x1="415" y1="56" x2="470" y2="80" stroke="#64748b" stroke-width="2"/></svg><p class="cap">Indentation shows the structure: vlans holds a list, and each list item holds id and name.</p></div>
<p>This is the exact shape used in the Kaveri Foods VLAN file. Notice that <code>name</code> sits in the same column as <code>id</code>, not under the dash: both belong to the same list item.</p>

<h3>Rule 4: comments, quotes and the document marker</h3>
<ul><li><code>#</code> starts a comment. Everything to the end of the line is ignored by Ansible, and is for humans.</li><li>Put quotes around a value that contains a colon followed by a space, or one that starts with a special character such as <code>{</code>. In Ansible, a value that starts with <code>{{</code> must be quoted: <code>config: "{{ vlans }}"</code>.</li><li>Three dashes <code>---</code> on the first line mark the start of a YAML document. Playbooks usually begin with them.</li></ul>

<h3>Checking YAML before you use it</h3>
<p>The lab host has a checker, <code>yaml validate FILE</code>. On a correct file it describes what it found:</p>
<pre class="code">yaml validate ntp.yml</pre>
<pre class="out">ntp.yml: valid YAML (list with 1 item(s))</pre>
<p>"List with 1 item" is accurate: a playbook is a list of plays, and this file has one. Now an example of a mistake. Suppose someone slipped and indented the line <code>ios_config:</code> one space less than it should be. The checker tells you where:</p>
<pre class="out">t3.yml:10:6: error: bad indentation of a sequence entry (this line is indented more than the list item above it)</pre>
<p>Read it as <i>file:line:column</i>. Line 10, column 6. When Ansible loads the same broken file it explains it with a picture of the offending line:</p>
<pre class="out">ERROR! YAML syntax error while loading '/home/netops/t3.yml'
  bad indentation of a sequence entry (this line is indented more than the list item above it)

Error location: line 10, column 6 (the real mistake may be on this line or just above it)

The offending line:

    - name: Point NTP and syslog at the NOC server
     ios_config:
     ^ here</pre>
<p>Notice the hint in brackets: the real mistake may be on that line <i>or just above it</i>. Compare the number of leading spaces on the line with the line before it. Most YAML errors are one missing or one extra space.</p>

<h3>YAML versus the other text formats you will meet</h3>
<table class="cmp"><tr><th>Format</th><th>Looks like</th><th>Where you see it</th></tr><tr><td>YAML</td><td>key: value, dashes, spaces</td><td>playbooks, variable files, CI/CD pipelines</td></tr><tr><td>JSON</td><td>curly braces and quotes</td><td>API replies, ansible-inventory output</td></tr><tr><td>INI</td><td>[group] and name=value</td><td>Ansible inventory files</td></tr></table>

<div class="eg"><p><b>Worked example.</b> You need two more VLANs in vlans.yml. You copy the last block of two lines, paste it below, and change id and name. The dashes line up with the other dashes, and each "name" lines up under its "id". yamllint or yaml validate says valid. You never touched the tasks: only the data changed.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Using the Tab key. Forgetting the space after the colon (name:SALES). Mixing two and four spaces in the same list. Writing a list item without its dash, or indenting the continuation line under the dash instead of under the first key.</p></div>
<div class="exam"><p><b>Exam trap.</b> YAML is whitespace-sensitive; the structure comes from indentation, and Tabs are not allowed. A dash starts a list item; key: value needs a space after the colon.</p></div>

<div class="scn"><h4>Three spaces that stopped a pipeline</h4><p>A colleague added a guest-WiFi VLAN to the VLAN file by hand and pushed it. The very first check in the pipeline failed with a message pointing at line 8, column 4. His new name line had three spaces of indentation while every other name line had four. He added one space, ran the YAML checker locally, and the pipeline went green. The same file would have broken the playbook run too, but the pipeline caught it before any switch was touched.</p><p><b>Lesson:</b> YAML errors are almost always one space off; read the line and the line above it.</p></div>
<div class="iv"><p class="q">"Why does indentation matter in YAML, and how do you catch errors early?"</p><p>Indentation defines which items belong to which key, so one wrong space changes the meaning or makes the file invalid. Only spaces are allowed, not tabs. I catch errors early with a YAML checker such as yamllint or ansible-playbook --syntax-check, ideally in a CI pipeline, and I read the file:line:column message plus the line above it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>key: value needs a space after the colon; a dash and a space start a list item.</li><li>Indentation with spaces (never Tab) shows structure; lines at the same level share a column.</li><li>Quote values that start with {{ or contain a colon and space.</li><li>Check files with a validator; errors read file:line:column and are usually one space off.</li><li>Playbooks, variable files and CI/CD pipelines all use YAML.</li></ul></div>

`,hi:`

<p><b>Is chapter ki ek idea:</b> YAML plain text aur spaces se lists aur label wali values likhne ka tareeka hai. Agar aap shopping list likh sakte ho, to YAML likh sakte ho. Playbooks, variable files aur agle module ki CI/CD pipelines sab ise use karte hain, isliye yahan lagaya thoda sa time teen baar kaam aata hai.</p>

<h3>Rule 1: key aur value</h3>
<p><b>key: value</b> pair ek label hai, uske baad colon, ek <i>space</i>, phir value. Colon ke baad ka space zaroori hai.</p>
<pre class="code">hostname: R1
ntp_server: 10.99.0.100
gather_facts: no</pre>
<p>Har line ek naam ko ek value se jodti hai. Aise pairs ke group ko <b>mapping</b> kehte hain (kuch log dictionary bolte hain). <code>yes</code> aur <code>no</code> jaise words true aur false padhe jaate hain.</p>

<h3>Rule 2: list mein dash lagta hai</h3>
<p><code>- </code> (dash, space) se shuru hone wali line <b>list</b> ka ek item hai. Items ek ke neeche ek, same column mein likhe jaate hain.</p>
<pre class="code">routers:
  - R1
  - R2
  - R3</pre>
<p>Key <code>routers</code> teen naamon ki list rakhta hai.</p>

<h3>Rule 3: indentation structure dikhata hai</h3>
<p>Line ke shuru ke spaces batate hain ki kaun kiska hissa hai. Upar wali line se zyada indent wali line uske <i>andar</i> hai. Same level ki lines bilkul same column se shuru hoti hain. <b>Spaces use karo, Tab key kabhi nahi</b>, aur har baar spaces ki sankhya same rakho (do ki aadat hai).</p>
<pre class="code">vlans:                 <span class="c"># key "vlans" ek list rakhta hai</span>
  - id: 10             <span class="c"># list item 1 dash se shuru...</span>
    name: SALES        <span class="c"># ...aur agli line mein "id" ke neeche line se chalta hai</span>
  - id: 20             <span class="c"># list item 2</span>
    name: ACCOUNTS</pre>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Indentation structure dikhati hai: vlans ek list rakhta hai, aur har list item mein id aur name hota hai."><rect x="20" y="15" width="290" height="170" rx="10" fill="#1e293b"/><text x="35" y="42" fill="#e2e8f0" font-size="13" font-family="monospace">vlans:</text><text x="35" y="66" fill="#e2e8f0" font-size="13" font-family="monospace">  - id: 10</text><text x="35" y="90" fill="#e2e8f0" font-size="13" font-family="monospace">    name: SALES</text><text x="35" y="114" fill="#e2e8f0" font-size="13" font-family="monospace">  - id: 20</text><text x="35" y="138" fill="#e2e8f0" font-size="13" font-family="monospace">    name: ACCOUNTS</text><rect x="360" y="20" width="110" height="36" rx="8" fill="#fde68a"/><text x="415" y="43" text-anchor="middle" class="svg-ink" font-size="13">vlans</text><rect x="330" y="80" width="80" height="36" rx="8" fill="#bae6fd"/><text x="370" y="103" text-anchor="middle" class="svg-ink" font-size="12">item 1</text><rect x="430" y="80" width="80" height="36" rx="8" fill="#bae6fd"/><text x="470" y="103" text-anchor="middle" class="svg-ink" font-size="12">item 2</text><text x="370" y="150" text-anchor="middle" class="svg-muted" font-size="11">id: 10, name: SALES</text><text x="470" y="170" text-anchor="middle" class="svg-muted" font-size="11">id: 20, name: ACCOUNTS</text><line x1="415" y1="56" x2="370" y2="80" stroke="#64748b" stroke-width="2"/><line x1="415" y1="56" x2="470" y2="80" stroke="#64748b" stroke-width="2"/></svg><p class="cap">Indentation shows the structure: vlans holds a list, and each list item holds id and name.</p></div>
<p>Kaveri Foods ki VLAN file ka yahi exact shape hai. Dhyan do ki <code>name</code> <code>id</code> ke same column mein hai, dash ke neeche nahi: dono ek hi list item ke hain.</p>

<h3>Rule 4: comments, quotes aur document marker</h3>
<ul><li><code>#</code> comment shuru karta hai. Line ke end tak sab kuch Ansible ignore karta hai, yeh insaanon ke liye hai.</li><li>Jis value mein colon ke baad space ho ya jo <code>{</code> jaise special character se shuru ho, use quotes mein rakho. Ansible mein jo value <code>{{</code> se shuru ho use quote karna padta hai: <code>config: "{{ vlans }}"</code>.</li><li>Pehli line par teen dashes <code>---</code> YAML document ki shuruaat mark karte hain. Playbooks aam taur par inse shuru hote hain.</li></ul>

<h3>YAML ko use karne se pehle check karna</h3>
<p>Lab host mein checker hai, <code>yaml validate FILE</code>. Sahi file par yeh batata hai ki usne kya paaya:</p>
<pre class="code">yaml validate ntp.yml</pre>
<pre class="out">ntp.yml: valid YAML (list with 1 item(s))</pre>
<p>"List with 1 item" sahi hai: playbook plays ki list hai, aur is file mein ek hai. Ab galti ka example. Maan lo kisi ne <code>ios_config:</code> wali line ko ek space kam indent kar diya. Checker batata hai kahan:</p>
<pre class="out">t3.yml:10:6: error: bad indentation of a sequence entry (this line is indented more than the list item above it)</pre>
<p>Ise <i>file:line:column</i> ki tarah padho. Line 10, column 6. Jab Ansible wahi tooti file load karta hai to woh galat line ki tasveer ke saath samjhata hai:</p>
<pre class="out">ERROR! YAML syntax error while loading '/home/netops/t3.yml'
  bad indentation of a sequence entry (this line is indented more than the list item above it)

Error location: line 10, column 6 (the real mistake may be on this line or just above it)

The offending line:

    - name: Point NTP and syslog at the NOC server
     ios_config:
     ^ here</pre>
<p>Bracket ka hint dekho: asli galti us line par <i>ya uske theek upar</i> ho sakti hai. Line ke shuru ke spaces ginkar pichhli line se compare karo. Zyadatar YAML errors ek space kam ya zyada hote hain.</p>

<h3>YAML aur doosre text formats jo aap milenge</h3>
<table class="cmp"><tr><th>Format</th><th>Kaisa dikhta hai</th><th>Kahan milta hai</th></tr><tr><td>YAML</td><td>key: value, dashes, spaces</td><td>playbooks, variable files, CI/CD pipelines</td></tr><tr><td>JSON</td><td>curly braces aur quotes</td><td>API replies, ansible-inventory output</td></tr><tr><td>INI</td><td>[group] aur name=value</td><td>Ansible inventory files</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Aapko vlans.yml mein do VLANs aur chahiye. Aap aakhri do lines ka block copy karke neeche paste karte ho aur id aur name badalte ho. Dashes baaki dashes ke saath line mein hain, aur har "name" apne "id" ke neeche. yamllint ya yaml validate kehta hai valid. Tasks ko aapne haath nahi lagaya: sirf data badla.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Tab key use karna. Colon ke baad space bhool jaana (name:SALES). Ek hi list mein do aur chaar spaces mila dena. List item bina dash ke likhna, ya continuation line ko dash ke neeche indent karna, pehli key ke neeche nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> YAML whitespace-sensitive hai; structure indentation se aata hai, aur Tabs allowed nahi. Dash list item shuru karta hai; key: value mein colon ke baad space chahiye.</p></div>

<div class="scn"><h4>Teen spaces jinhone pipeline roki</h4><p>Ek colleague ne guest-WiFi VLAN ko VLAN file mein haath se jodha aur push kar diya. Pipeline ke pehle hi check ne line 8, column 4 par failure bataya. Uski nayi name line mein teen spaces ki indentation thi jabki baaki sab name lines mein chaar the. Usne ek space joda, local YAML checker chalaya, aur pipeline green ho gayi. Wahi file playbook run bhi tod deti, par pipeline ne kisi switch ko chhoone se pehle pakad liya.</p><p><b>Lesson:</b> YAML errors lagbhag hamesha ek space ke hote hain; line aur uske upar wali line padho.</p></div>
<div class="iv"><p class="q">"YAML mein indentation kyun matter karti hai, aur errors jaldi kaise pakadte ho?"</p><p>Indentation tay karti hai ki kaun se items kis key ke hain, isliye ek galat space matlab badal deta hai ya file invalid kar deta hai. Sirf spaces allowed hain, tabs nahi. Main errors jaldi yamllint ya ansible-playbook --syntax-check jaise YAML checker se pakadta hoon, behtar hai CI pipeline mein, aur file:line:column message aur uske upar wali line padhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>key: value mein colon ke baad space chahiye; dash aur space list item shuru karte hain.</li><li>Spaces se indentation (Tab kabhi nahi) structure dikhati hai; same level ki lines same column mein.</li><li>Jo values {{ se shuru ho ya colon aur space rakhein unhe quote karo.</li><li>Files ko validator se check karo; errors file:line:column padhe jaate hain aur aam taur par ek space ke hote hain.</li><li>Playbooks, variable files aur CI/CD pipelines sab YAML use karte hain.</li></ul></div>

`}};export{e as default};