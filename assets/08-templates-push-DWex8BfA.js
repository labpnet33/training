var e={id:`templates-push`,h:{en:`Templates and a safe push: nornir_jinja2 and dry run`,hi:`Templates aur safe push: nornir_jinja2 aur dry run`},body:{en:`
<p>So far Nornir has read from devices. Now it writes. The rule from <code>py-templates</code> still holds: configuration is generated from a template and data, never typed into a script as strings. In Nornir the template engine is a plugin, <code>nornir_jinja2</code>, and the data is the inventory. Lab 1, step 7 renders an NTP baseline for four vendors. This chapter adds the part that sends it, with the safety checks that a push needs.</p>

<h3>An analogy: a mail-merge letter</h3>
<p>A bank sends one letter to thousands of customers: the text is the same, the name and the amount come from a list, and the letter for a customer who speaks Hindi is in Hindi. The template is the letter, the inventory is the list, and the platform picks the language. One letter file per language, not one per customer.</p>

<h3>One template per platform</h3>
<p>The NTP servers are a list in <code>defaults.yaml</code>. Each platform has its own template file in the folder <code>templates/</code>, named after the platform. Compare IOS and Junos.</p>
<pre class="code">{% for server in host["ntp_servers"] %}
ntp server {{ server }}
{% endfor %}</pre>
<pre class="code">{% for server in host["ntp_servers"] %}
set system ntp server {{ server }}
{% endfor %}</pre>
<p>Only the line inside the loop differs: <code>ntp server X</code> on Cisco, Arista and NX-OS, and <code>set system ntp server X</code> on Junos. Inside the template the variable <code>host</code> is the current host, so <code>host["ntp_servers"]</code> reads the inherited data. The task below chooses the file by the host's platform, so a single task serves all four vendors.</p>
<pre class="code">def render(task):
<span class="hl">    return task.run(task=template_file, template=task.host.platform + ".j2", path="templates").result</span>


result = nr.run(task=render)
for name, multi in result.items():
    lines = [line for line in multi[0].result.splitlines() if line.strip()]
    print("%-3s %s" % (name, " | ".join(lines)))</pre>
<pre class="out">AUTO01$ python3 render.py
r1  ntp server 10.99.0.60 | ntp server 10.99.0.62
j1  set system ntp server 10.99.0.60 | set system ntp server 10.99.0.62
e1  ntp server 10.99.0.60 | ntp server 10.99.0.62
n1  ntp server 10.99.0.60 | ntp server 10.99.0.62
r3  ntp server 10.99.0.60 | ntp server 10.99.0.62</pre>
<p>The task returns the rendered text. The lines of the <code>{% for %}</code> tags leave blank lines behind, so the script drops empty lines before it prints or sends. <code>r3</code> renders too, because rendering never touches the network. Nothing was sent yet.</p>
<p>A mistake in the template does not crash the run. If a template uses a name that does not exist, <code>nornir_jinja2</code> raises an undefined error for that host.</p>
<pre class="out">AUTO01$ python3 undef.py
<span class="hl">failed: True | UndefinedError - 'ntp_srv' is undefined</span></pre>
<p>Rendering fails loudly instead of producing a blank where the value should be. That is what you want before a push: better a failed host now than an empty line in a router.</p>

<h3>Sending it: dry run first</h3>
<p>This push script is an extra example, not a lab step. It renders, and then either reports or sends. The key is <code>task.is_dry_run()</code>.</p>
<pre class="code">def push(task):
    text = task.run(task=template_file, template=task.host.platform + ".j2", path="templates").result
    lines = [line for line in text.splitlines() if line.strip()]
<span class="hl">    if task.is_dry_run():</span>
        return Result(host=task.host, result="dry run: would send %d lines" % len(lines))
<span class="hl">    task.run(task=netmiko_send_config, config_commands=lines)</span>
    if task.host.platform == "juniper_junos":
<span class="hl">        task.run(task=netmiko_commit)</span>
    return Result(host=task.host, result="sent %d lines" % len(lines), changed=True)</pre>
<p>Why the check? <code>netmiko_send_config</code> does <b>not</b> look at the dry-run flag, and it always reports <code>changed=True</code>. If you only set <code>dry_run=True</code> on Nornir and call it, the lines would be sent. So the task asks <code>is_dry_run()</code> itself and returns before sending. On Junos the lines go into the candidate configuration, so <code>netmiko_commit</code> makes them live. The returned <code>changed=True</code> is the task's own statement. Run it first without options.</p>
<pre class="out">AUTO01$ python3 push.py
<span class="hl">r1  dry run: would send 2 lines</span>
<span class="hl">j1  dry run: would send 2 lines</span>
<span class="hl">e1  dry run: would send 2 lines</span>
<span class="hl">n1  dry run: would send 2 lines</span>
failed hosts: []</pre>
<p>Nothing changed. Check the devices to see this (the next script reads back NTP servers), then apply.</p>
<pre class="out">AUTO01$ python3 ntpcheck.py
r1  ['10.99.0.60']
j1  ['10.99.0.60']
e1  ['10.99.0.60']
n1  ['10.99.0.60']
<span class="hl">AUTO01$ python3 push.py --apply</span>
r1  sent 2 lines (changed)
j1  sent 2 lines (changed)
e1  sent 2 lines (changed)
n1  sent 2 lines (changed)
failed hosts: []
AUTO01$ python3 ntpcheck.py
<span class="hl">r1  ['10.99.0.60', '10.99.0.62']</span>
<span class="hl">j1  ['10.99.0.60', '10.99.0.62']</span>
<span class="hl">e1  ['10.99.0.60', '10.99.0.62']</span>
<span class="hl">n1  ['10.99.0.60', '10.99.0.62']</span></pre>
<p>Before: one server on each device. After: two. The read-back came from the device, not from the script's own idea of what it sent. That is the habit from <code>py-tools</code>, and the next modules, <code>adv-napalm</code> (config merge with a real diff) and <code>adv-verify</code>, build on it.</p>

<div class="eg"><p><b>Worked example: a platform without a template.</b> A new Arista switch is added with <code>platform: arista_eos</code>, but nobody made <code>arista_eos.j2</code>. The task fails for that host with a "template not found" error and the other hosts are unaffected. The failed-host list tells you exactly which platform to add.</p></div>

<div class="warn"><p><b>Common mistake.</b> Setting <code>dry_run=True</code> and trusting every task to honour it. Tasks that only read are safe, <code>write_file</code> honours it, and <code>netmiko_send_config</code> does not. Always put the <code>is_dry_run()</code> check in any task that sends configuration.</p></div>
<div class="exam"><p><b>Exam trap.</b> In a template the host data is reached through <code>host["key"]</code>. A key that does not exist is an error, not an empty string, because the plugin uses strict undefined variables.</p></div>

<div class="scn"><h4>The blank NTP server</h4><p>A team generated configs with a template that silently printed nothing for a missing variable. Three switches received <code>ntp server</code> with no address, and the lines were rejected quietly. When they moved to a strict template engine, the same typo failed at render time on the first host, and nothing was sent.</p><p><b>Lesson:</b> make missing data an error before the push, not a surprise after it.</p></div>

<div class="iv"><p class="q">"How do you generate per-vendor configuration with Nornir safely?"</p><p>One Jinja2 template per platform, rendered with <code>template_file</code> from the host's inventory data. A dry run that renders and reports but sends nothing, using <code>task.is_dry_run()</code> because <code>netmiko_send_config</code> ignores the flag. Then the real push, a commit on Junos, and a read-back from the devices.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>template_file(template=..., path=...)</code> renders with the host as <code>host</code>.</li>
<li>Name templates after the platform and pick them with <code>task.host.platform</code>.</li>
<li>Missing variables fail the host at render time.</li>
<li><code>netmiko_send_config</code> ignores <code>dry_run</code>: check <code>task.is_dry_run()</code> yourself.</li>
<li>Junos needs <code>netmiko_commit</code>; always read back from the device.</li>
</ul></div>
`,hi:`
<p>Ab tak Nornir ne devices se padha. Ab woh likhta hai. <code>py-templates</code> ka niyam abhi bhi lagta hai: configuration template aur data se banti hai, script mein strings ki tarah type nahi hoti. Nornir mein template engine ek plugin hai, <code>nornir_jinja2</code>, aur data inventory hai. Lab 1 ka step 7 chaar vendors ke liye NTP baseline render karta hai. Yeh chapter woh hissa jodta hai jo use bhejta hai, un safety checks ke saath jo push ko chahiye.</p>

<h3>Ek analogy: mail-merge letter</h3>
<p>Bank hazaron customers ko ek letter bhejta hai: text wahi hai, naam aur amount list se aate hain, aur Hindi bolne wale customer ka letter Hindi mein hota hai. Template letter hai, inventory list hai, aur platform bhasha chunta hai. Har bhasha ki ek letter file, har customer ki nahi.</p>

<h3>Har platform ke liye ek template</h3>
<p>NTP servers <code>defaults.yaml</code> mein ek list hain. Har platform ki apni template file <code>templates/</code> folder mein hai, platform ke naam par. IOS aur Junos ko compare karo.</p>
<pre class="code">{% for server in host["ntp_servers"] %}
ntp server {{ server }}
{% endfor %}</pre>
<pre class="code">{% for server in host["ntp_servers"] %}
set system ntp server {{ server }}
{% endfor %}</pre>
<p>Sirf loop ke andar ki line alag hai: Cisco, Arista aur NX-OS par <code>ntp server X</code>, Junos par <code>set system ntp server X</code>. Template ke andar variable <code>host</code> current host hai, isliye <code>host["ntp_servers"]</code> inherited data padhta hai. Neeche ka task host ke platform se file chunta hai, isliye ek hi task chaaron vendors ko sambhalta hai.</p>
<pre class="code">def render(task):
<span class="hl">    return task.run(task=template_file, template=task.host.platform + ".j2", path="templates").result</span>


result = nr.run(task=render)
for name, multi in result.items():
    lines = [line for line in multi[0].result.splitlines() if line.strip()]
    print("%-3s %s" % (name, " | ".join(lines)))</pre>
<pre class="out">AUTO01$ python3 render.py
r1  ntp server 10.99.0.60 | ntp server 10.99.0.62
j1  set system ntp server 10.99.0.60 | set system ntp server 10.99.0.62
e1  ntp server 10.99.0.60 | ntp server 10.99.0.62
n1  ntp server 10.99.0.60 | ntp server 10.99.0.62
r3  ntp server 10.99.0.60 | ntp server 10.99.0.62</pre>
<p>Task rendered text lautata hai. <code>{% for %}</code> tags ki lines peeche khaali lines chhod deti hain, isliye script print ya send karne se pehle khaali lines hata deti hai. <code>r3</code> bhi render hota hai, kyunki rendering network ko nahi chhoota. Abhi kuch bheja nahi gaya.</p>
<p>Template mein galti run ko crash nahi karti. Agar template aisa naam use kare jo maujood nahi, to <code>nornir_jinja2</code> us host ke liye undefined error uthata hai.</p>
<pre class="out">AUTO01$ python3 undef.py
<span class="hl">failed: True | UndefinedError - 'ntp_srv' is undefined</span></pre>
<p>Rendering value ki jagah khaali chhodne ke bajay zor se fail hoti hai. Push se pehle yahi chahiye: router mein khaali line se behtar abhi failed host hai.</p>

<h3>Bhejna: pehle dry run</h3>
<p>Yeh push script extra example hai, lab step nahi. Yeh render karti hai, phir ya to report karti hai ya bhejti hai. Chaabi <code>task.is_dry_run()</code> hai.</p>
<pre class="code">def push(task):
    text = task.run(task=template_file, template=task.host.platform + ".j2", path="templates").result
    lines = [line for line in text.splitlines() if line.strip()]
<span class="hl">    if task.is_dry_run():</span>
        return Result(host=task.host, result="dry run: would send %d lines" % len(lines))
<span class="hl">    task.run(task=netmiko_send_config, config_commands=lines)</span>
    if task.host.platform == "juniper_junos":
<span class="hl">        task.run(task=netmiko_commit)</span>
    return Result(host=task.host, result="sent %d lines" % len(lines), changed=True)</pre>
<p>Yeh check kyon? <code>netmiko_send_config</code> dry-run flag <b>nahi</b> dekhta, aur hamesha <code>changed=True</code> report karta hai. Sirf Nornir par <code>dry_run=True</code> set karke use bulao to lines bhej di jaayengi. Isliye task khud <code>is_dry_run()</code> poochta hai aur bhejne se pehle return ho jaata hai. Junos par lines candidate configuration mein jaati hain, isliye <code>netmiko_commit</code> unhe live karta hai. Lautaya hua <code>changed=True</code> task ka apna bayaan hai. Pehle bina option ke chalao.</p>
<pre class="out">AUTO01$ python3 push.py
<span class="hl">r1  dry run: would send 2 lines</span>
<span class="hl">j1  dry run: would send 2 lines</span>
<span class="hl">e1  dry run: would send 2 lines</span>
<span class="hl">n1  dry run: would send 2 lines</span>
failed hosts: []</pre>
<p>Kuch nahi badla. Devices dekh kar yeh confirm karo (agli script NTP servers wapas padhti hai), phir apply karo.</p>
<pre class="out">AUTO01$ python3 ntpcheck.py
r1  ['10.99.0.60']
j1  ['10.99.0.60']
e1  ['10.99.0.60']
n1  ['10.99.0.60']
<span class="hl">AUTO01$ python3 push.py --apply</span>
r1  sent 2 lines (changed)
j1  sent 2 lines (changed)
e1  sent 2 lines (changed)
n1  sent 2 lines (changed)
failed hosts: []
AUTO01$ python3 ntpcheck.py
<span class="hl">r1  ['10.99.0.60', '10.99.0.62']</span>
<span class="hl">j1  ['10.99.0.60', '10.99.0.62']</span>
<span class="hl">e1  ['10.99.0.60', '10.99.0.62']</span>
<span class="hl">n1  ['10.99.0.60', '10.99.0.62']</span></pre>
<p>Pehle: har device par ek server. Baad mein: do. Read-back device se aaya, script ke apne andaaze se nahi. Yeh <code>py-tools</code> wali aadat hai, aur agle modules, <code>adv-napalm</code> (asli diff ke saath config merge) aur <code>adv-verify</code>, isi par bante hain.</p>

<div class="eg"><p><b>Worked example: bina template wala platform.</b> Naya Arista switch <code>platform: arista_eos</code> ke saath jodta hai, par kisi ne <code>arista_eos.j2</code> nahi banayi. Task us host ke liye "template not found" error se fail hota hai aur baaki hosts par asar nahi hota. Failed-host list batati hai ki kaunsa platform jodna hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> <code>dry_run=True</code> set karke maan lena ki har task use maanega. Sirf padhne wale tasks safe hain, <code>write_file</code> use maanta hai, aur <code>netmiko_send_config</code> nahi maanta. Configuration bhejne wale har task mein <code>is_dry_run()</code> check zaroor rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Template mein host data <code>host["key"]</code> se milta hai. Jo key maujood nahi woh error hai, khaali string nahi, kyunki plugin strict undefined variables use karta hai.</p></div>

<div class="scn"><h4>Khaali NTP server</h4><p>Ek team ne aise template se configs banayi jo missing variable par chupchaap kuch print nahi karta tha. Teen switches ko bina address ke <code>ntp server</code> mila, aur lines chupchaap reject ho gayi. Strict template engine par jaane ke baad wahi typo pehle host par render time par fail hua, aur kuch bheja nahi gaya.</p><p><b>Lesson:</b> missing data ko push se pehle error banao, baad ka surprise nahi.</p></div>

<div class="iv"><p class="q">"Nornir se per-vendor configuration safely kaise generate karte ho?"</p><p>Har platform ka ek Jinja2 template, host ke inventory data se <code>template_file</code> ke saath render. Dry run jo render aur report kare par kuch na bheje, <code>task.is_dry_run()</code> se, kyunki <code>netmiko_send_config</code> flag ignore karta hai. Phir asli push, Junos par commit, aur devices se read-back.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>template_file(template=..., path=...)</code> host ko <code>host</code> naam se render karta hai.</li>
<li>Templates ko platform ka naam do aur <code>task.host.platform</code> se chuno.</li>
<li>Missing variables render time par host ko fail karte hain.</li>
<li><code>netmiko_send_config</code> <code>dry_run</code> ignore karta hai: <code>task.is_dry_run()</code> khud check karo.</li>
<li>Junos ko <code>netmiko_commit</code> chahiye; hamesha device se read-back karo.</li>
</ul></div>
`}};export{e as default};