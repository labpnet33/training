var e={id:`plugins-choice`,h:{en:`Other plugins, NetBox inventory and choosing a tool`,hi:`Dusre plugins, NetBox inventory aur tool chunna`},body:{en:`
<p>Nornir is a frame. What goes inside it is chosen by plugins: the inventory plugin decides where hosts come from, and the connection plugins decide how to talk to them. You have used <code>SimpleInventory</code> and <code>nornir_netmiko</code>. This chapter takes a short first look at three more and ends with the rule of thumb for choosing between tools. It is a tour, not a deep dive: each plugin has its own module.</p>

<h3>An analogy: one toolbox, several drill bits</h3>
<p>The drill stays the same; you change the bit for wood, metal or concrete. Nornir is the drill: inventory, runner and results. Netmiko, NAPALM and scrapli are bits. You can keep the same inventory and change the bit by changing the plugin that your task uses.</p>

<h3>Same inventory, three engines</h3>
<p><code>connection_options</code> in the groups file holds one block per plugin. The platform name differs by library, so each block can set its own. Here the IOS group is ready for NAPALM and scrapli as well as Netmiko.</p>
<pre class="code">    napalm:
<span class="hl">      platform: ios</span>
      extras:
        optional_args:
          secret: NK@2026
    scrapli:
<span class="hl">      platform: cisco_iosxe</span>
      extras:
        auth_strict_key: false
        auth_secondary: NK@2026</pre>
<p>Two tasks, one host. <code>napalm_get</code> returns a dictionary keyed by getter name. The scrapli <code>send_command</code> takes <code>command=</code>, not <code>command_string=</code>; every library names its arguments in its own way.</p>
<pre class="code">nr = InitNornir(config_file="config8.yaml").filter(name="r1")
<span class="hl">print_result(nr.run(task=napalm_get, getters=["facts"]))</span>
<span class="hl">print_result(nr.run(task=send_command, command="show clock"))</span></pre>
<pre class="out">AUTO01$ python3 engines.py
napalm_get**********************************************************************
* r1 ** changed : False ********************************************************
vvvv napalm_get ** changed : False vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv INFO
{'facts': {'fqdn': 'PUN-CORE-R1.nk.lab',
<span class="hl">           'hostname': 'PUN-CORE-R1',</span>
           'interface_list': ['GigabitEthernet0/0',
...
^^^^ END napalm_get ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
<span class="hl">send_command********************************************************************</span>
* r1 ** changed : False ********************************************************
<span class="hl">vvvv send_command ** changed : False vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv INFO</span>
15:24:18.327 UTC Sun Oct 11 2026
<span class="hl">^^^^ END send_command ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^</span></pre>
<p><b>NAPALM</b> is made for vendor-neutral data. The same getter gives the same keys on IOS, Junos and EOS, and its configuration functions give diffs and rollback. In Nornir the plugin is <code>nornir_napalm</code>; its <code>platform</code> must be a NAPALM driver name (<code>ios</code>, <code>junos</code>, <code>eos</code>). It is a preview here: <code>adv-napalm</code> teaches the getters, the merge and replace workflows, <code>compare_config</code> and compliance. <b>scrapli</b> is a faster SSH library with a strict API and an async version; <code>adv-scrapli</code> covers it and <code>nornir_scrapli</code> plugs it into Nornir.</p>

<h3>Inventory from NetBox: a first look</h3>
<p>YAML files are fine for ten devices. For hundreds, the source of truth is a database such as NetBox. The plugin <code>NetBoxInventory2</code> turns each NetBox device into a Nornir host; the site, role and status arrive as data. NetBox holds no passwords, so a transform function adds them (from the environment, as in chapter 2) and maps the platform slug to a Netmiko name.</p>
<pre class="code">nr = InitNornir(
    inventory={
<span class="hl">        "plugin": "NetBoxInventory2",</span>
        "options": {
            "nb_url": "h&#116;tps://10.99.0.80",
            "nb_token": os.environ["NETBOX_TOKEN"],
            "ssl_verify": False,
            "filter_parameters": {"site": "pune"},
            "use_platform_slug": True,
        },
<span class="hl">        "transform_function": credentials,</span></pre>
<p>This needs a NetBox server, which the two labs of this module do not have. The output below comes from a copy of the lab with a NetBox device; it is shown only to give you the shape.</p>
<pre class="out">AUTO01$ python3 netbox_first.py
4 hosts: ['PUN-ACC-SW1', 'PUN-CORE-R1', 'PUN-CORE-R3', 'PUN-DIST-SW1']
<span class="hl">10.99.0.1 cisco_ios pune core-router active</span>
['PUN-CORE-R1', 'PUN-CORE-R3']</pre>
<p>The filter by <code>role</code> works exactly like the filter by <code>site</code> in chapter 6, because the data arrives as ordinary host data. How NetBox is built, filled and queried is the subject of <code>adv-netbox</code>.</p>

<h3>The rule of thumb</h3>
<table class="cmp"><tr><th>Tool</th><th>Choose it when</th></tr>
<tr><td>Netmiko (<code>adv-nkmiko</code>)</td><td>A one-off script or a handful of devices, and you want every step visible.</td></tr>
<tr><td>Nornir</td><td>A Python-heavy fleet: inventory, filters, parallel runs, results as objects, your own logic.</td></tr>
<tr><td>Ansible (<code>auto-ansible</code>)</td><td>The team prefers declarative playbooks, and existing modules and roles do the job.</td></tr>
<tr><td>NAPALM (<code>adv-napalm</code>)</td><td>You need vendor-neutral getters, and configuration diffs, commit and rollback.</td></tr>
<tr><td>scrapli (<code>adv-scrapli</code>)</td><td>Speed or async matters, or you want a strict, typed SSH API.</td></tr></table>
<p>These are not rivals. Nornir can drive Netmiko, NAPALM and scrapli through plugins, and the best fleets use each one where it is strong.</p>

<div class="warn"><p><b>Common mistake.</b> Moving to Nornir for three devices. The inventory, the config file and the task wrapper cost you more than a ten-line Netmiko script. Nornir starts to pay at about a dozen devices, or earlier when you need filters and failure tracking.</p></div>
<div class="exam"><p><b>Exam trap.</b> The <code>platform</code> value is read by the plugin. For Netmiko it is a device type (<code>cisco_ios</code>), for NAPALM a driver (<code>ios</code>), for scrapli a platform (<code>cisco_iosxe</code>). Use the per-plugin <code>connection_options</code> when they differ.</p></div>

<div class="scn"><h4>The inventory that was always stale</h4><p>A team kept a YAML inventory by hand. Every time a router was added to NetBox, someone forgot the YAML, and the nightly backup silently skipped it. After moving the host list to a NetBox inventory plugin, a new router was in the next night's backup without anybody touching a file.</p><p><b>Lesson:</b> keep one source of truth, and make the tools read it.</p></div>

<div class="iv"><p class="q">"When would you choose Nornir over Ansible?"</p><p>When the work needs real Python logic: custom parsing, conditions, calling APIs or databases, tests around the code, and a team that writes Python. Ansible is better when the team wants declarative playbooks and ready-made modules. They can also work together.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inventory plugins decide where hosts come from; connection plugins decide how to talk to them.</li>
<li><code>connection_options</code> can hold a block per plugin, each with its own platform name.</li>
<li><code>nornir_napalm</code> and <code>nornir_scrapli</code> reuse the same inventory; details are in <code>adv-napalm</code> and <code>adv-scrapli</code>.</li>
<li><code>NetBoxInventory2</code> builds hosts from NetBox; a transform function adds credentials.</li>
<li>Pick the tool by the job: Netmiko, Nornir, Ansible, NAPALM, scrapli.</li>
</ul></div>
`,hi:`
<p>Nornir ek frame hai. Uske andar kya jaata hai, yeh plugins tay karte hain: inventory plugin tay karta hai hosts kahan se aayenge, aur connection plugins tay karte hain unse baat kaise hogi. Aap <code>SimpleInventory</code> aur <code>nornir_netmiko</code> use kar chuke ho. Yeh chapter teen aur plugins par chhota first look leta hai aur tools ke beech chunne ke rule of thumb par khatam hota hai. Yeh tour hai, deep dive nahi: har plugin ka apna module hai.</p>

<h3>Ek analogy: ek toolbox, kai drill bits</h3>
<p>Drill wahi rehta hai; aap lakdi, dhaatu ya concrete ke liye bit badalte ho. Nornir drill hai: inventory, runner aur results. Netmiko, NAPALM aur scrapli bits hain. Wahi inventory rakh kar aap bit badal sakte ho, bas jo plugin aapka task use karta hai woh badlo.</p>

<h3>Wahi inventory, teen engines</h3>
<p>Groups file ke <code>connection_options</code> mein har plugin ka ek block hota hai. Platform ka naam library ke hisaab se alag hota hai, isliye har block apna set kar sakta hai. Yahan IOS group Netmiko ke saath NAPALM aur scrapli ke liye bhi taiyaar hai.</p>
<pre class="code">    napalm:
<span class="hl">      platform: ios</span>
      extras:
        optional_args:
          secret: NK@2026
    scrapli:
<span class="hl">      platform: cisco_iosxe</span>
      extras:
        auth_strict_key: false
        auth_secondary: NK@2026</pre>
<p>Do tasks, ek host. <code>napalm_get</code> getter ke naam se keyed dictionary lautata hai. scrapli ka <code>send_command</code> <code>command=</code> leta hai, <code>command_string=</code> nahi; har library apne arguments ko apne tarike se naam deti hai.</p>
<pre class="code">nr = InitNornir(config_file="config8.yaml").filter(name="r1")
<span class="hl">print_result(nr.run(task=napalm_get, getters=["facts"]))</span>
<span class="hl">print_result(nr.run(task=send_command, command="show clock"))</span></pre>
<pre class="out">AUTO01$ python3 engines.py
napalm_get**********************************************************************
* r1 ** changed : False ********************************************************
vvvv napalm_get ** changed : False vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv INFO
{'facts': {'fqdn': 'PUN-CORE-R1.nk.lab',
<span class="hl">           'hostname': 'PUN-CORE-R1',</span>
           'interface_list': ['GigabitEthernet0/0',
...
^^^^ END napalm_get ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
<span class="hl">send_command********************************************************************</span>
* r1 ** changed : False ********************************************************
<span class="hl">vvvv send_command ** changed : False vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv INFO</span>
15:24:18.327 UTC Sun Oct 11 2026
<span class="hl">^^^^ END send_command ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^</span></pre>
<p><b>NAPALM</b> vendor-neutral data ke liye bana hai. Wahi getter IOS, Junos aur EOS par wahi keys deta hai, aur uske configuration functions diff aur rollback dete hain. Nornir mein plugin <code>nornir_napalm</code> hai; uska <code>platform</code> NAPALM driver ka naam hona chahiye (<code>ios</code>, <code>junos</code>, <code>eos</code>). Yahan yeh preview hai: <code>adv-napalm</code> getters, merge aur replace workflows, <code>compare_config</code> aur compliance sikhata hai. <b>scrapli</b> tez SSH library hai jiska API strict hai aur async version bhi hai; <code>adv-scrapli</code> use cover karta hai aur <code>nornir_scrapli</code> use Nornir se jodta hai.</p>

<h3>NetBox se inventory: first look</h3>
<p>Das devices ke liye YAML files theek hain. Sainkdon ke liye source of truth NetBox jaisa database hota hai. <code>NetBoxInventory2</code> plugin NetBox ke har device ko Nornir host bana deta hai; site, role aur status data ki tarah aate hain. NetBox mein passwords nahi hote, isliye transform function unhe jodta hai (environment se, jaise chapter 2 mein) aur platform slug ko Netmiko naam se map karta hai.</p>
<pre class="code">nr = InitNornir(
    inventory={
<span class="hl">        "plugin": "NetBoxInventory2",</span>
        "options": {
            "nb_url": "h&#116;tps://10.99.0.80",
            "nb_token": os.environ["NETBOX_TOKEN"],
            "ssl_verify": False,
            "filter_parameters": {"site": "pune"},
            "use_platform_slug": True,
        },
<span class="hl">        "transform_function": credentials,</span></pre>
<p>Iske liye NetBox server chahiye, jo is module ke do labs mein nahi hai. Neeche ka output lab ki ek copy se hai jisme NetBox device tha; sirf shape dikhane ke liye hai.</p>
<pre class="out">AUTO01$ python3 netbox_first.py
4 hosts: ['PUN-ACC-SW1', 'PUN-CORE-R1', 'PUN-CORE-R3', 'PUN-DIST-SW1']
<span class="hl">10.99.0.1 cisco_ios pune core-router active</span>
['PUN-CORE-R1', 'PUN-CORE-R3']</pre>
<p><code>role</code> se filter bilkul chapter 6 ke <code>site</code> filter jaisa chalta hai, kyunki data normal host data ki tarah aata hai. NetBox kaise banta, bharta aur query hota hai, yeh <code>adv-netbox</code> ka vishay hai.</p>

<h3>Rule of thumb</h3>
<table class="cmp"><tr><th>Tool</th><th>Kab chuno</th></tr>
<tr><td>Netmiko (<code>adv-nkmiko</code>)</td><td>One-off script ya kuch devices, aur har step dikhna chahiye.</td></tr>
<tr><td>Nornir</td><td>Python-heavy fleet: inventory, filters, parallel runs, objects ki tarah results, apna logic.</td></tr>
<tr><td>Ansible (<code>auto-ansible</code>)</td><td>Team declarative playbooks pasand karti hai, aur maujooda modules aur roles kaam kar dete hain.</td></tr>
<tr><td>NAPALM (<code>adv-napalm</code>)</td><td>Vendor-neutral getters, aur configuration diff, commit aur rollback chahiye.</td></tr>
<tr><td>scrapli (<code>adv-scrapli</code>)</td><td>Speed ya async matter karta hai, ya strict, typed SSH API chahiye.</td></tr></table>
<p>Yeh dushman nahi hain. Nornir plugins ke zariye Netmiko, NAPALM aur scrapli ko chala sakta hai, aur sabse achhi fleets har tool ko wahan use karti hain jahan woh mazboot hai.</p>

<div class="warn"><p><b>Common mistake.</b> Teen devices ke liye Nornir par jaana. Inventory, config file aur task wrapper ka kharcha das line ki Netmiko script se zyada hai. Nornir lagbhag darjan devices par kaam aane lagta hai, ya pehle jab filters aur failure tracking chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>platform</code> value plugin padhta hai. Netmiko ke liye device type (<code>cisco_ios</code>), NAPALM ke liye driver (<code>ios</code>), scrapli ke liye platform (<code>cisco_iosxe</code>). Jab alag ho to per-plugin <code>connection_options</code> use karo.</p></div>

<div class="scn"><h4>Hamesha purani inventory</h4><p>Ek team haath se YAML inventory rakhti thi. Jab bhi router NetBox mein jodte, koi YAML bhool jaata, aur nightly backup use chupchaap skip karta. Host list NetBox inventory plugin par le jaane ke baad naya router agli raat ke backup mein aa gaya, bina kisi file ko haath lagaye.</p><p><b>Lesson:</b> source of truth ek rakho, aur tools ko use padhne do.</p></div>

<div class="iv"><p class="q">"Nornir ko Ansible par kab chunoge?"</p><p>Jab kaam mein asli Python logic chahiye: custom parsing, conditions, APIs ya databases ko bulana, code ke aas-paas tests, aur Python likhne wali team. Ansible tab behtar hai jab team declarative playbooks aur ready-made modules chahti hai. Dono saath bhi chal sakte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inventory plugins tay karte hain hosts kahan se aayenge; connection plugins tay karte hain baat kaise hogi.</li>
<li><code>connection_options</code> mein har plugin ka block ho sakta hai, apne platform naam ke saath.</li>
<li><code>nornir_napalm</code> aur <code>nornir_scrapli</code> wahi inventory reuse karte hain; tafseel <code>adv-napalm</code> aur <code>adv-scrapli</code> mein hai.</li>
<li><code>NetBoxInventory2</code> NetBox se hosts banata hai; transform function credentials jodta hai.</li>
<li>Kaam ke hisaab se tool chuno: Netmiko, Nornir, Ansible, NAPALM, scrapli.</li>
</ul></div>
`}};export{e as default};