var e={id:`defaults-vars-precedence`,h:{en:`Defaults, vars and who wins when values collide`,hi:`Defaults, vars aur takrao mein kaun jeetta hai`},body:{en:`
<p><b>One idea in this chapter:</b> the same variable name can be set in many places. Ansible has a fixed ranking, called <b>variable precedence</b>, and the highest rank wins. Know the ranking and you can predict any value, and design roles that sites can tune without editing them.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Precedence ladder, weakest at bottom">
<rect x="180" y="15" width="280" height="30" rx="6" fill="#fed7aa"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="12">-e on the command line (wins always)</text>
<rect x="180" y="49" width="280" height="30" rx="6" fill="#ddd6fe"/><text x="320" y="69" text-anchor="middle" class="svg-ink" font-size="12">role vars/main.yml</text>
<rect x="180" y="83" width="280" height="30" rx="6" fill="#bae6fd"/><text x="320" y="103" text-anchor="middle" class="svg-ink" font-size="12">host_vars/HOST</text>
<rect x="180" y="117" width="280" height="30" rx="6" fill="#bae6fd"/><text x="320" y="137" text-anchor="middle" class="svg-ink" font-size="12">group_vars/GROUP</text>
<rect x="180" y="151" width="280" height="30" rx="6" fill="#bae6fd"/><text x="320" y="171" text-anchor="middle" class="svg-ink" font-size="12">group_vars/all</text>
<rect x="180" y="185" width="280" height="30" rx="6" fill="#bbf7d0"/><text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="12">role defaults/main.yml (weakest)</text>
<text x="475" y="35" class="svg-accent" font-size="12">strongest</text><text x="475" y="205" class="svg-muted" font-size="12">weakest</text>
</svg><p class="cap">A higher box overrides every box below it. (Play vars and set_fact sit between host_vars and role vars.)</p></div>

<h3>The ranking, from weakest to strongest</h3>
<ol>
<li>role <code>defaults/main.yml</code></li>
<li>inventory and <code>group_vars/all</code></li>
<li><code>group_vars/GROUP</code> (a more specific group beats a more general one)</li>
<li><code>host_vars/HOST</code></li>
<li>play <code>vars:</code></li>
<li>role <code>vars/main.yml</code></li>
<li><code>set_fact</code> and <code>register</code> during the run</li>
<li><code>-e</code> extra variables on the command line</li>
</ol>
<p>There are more levels in the official list, but these cover nearly everything a network engineer meets.</p>

<h3>Watch it happen</h3>
<p>We make a tiny role, <code>nk_demo</code>, whose only task prints a variable called <code>level</code>:</p>
<pre class="code"><span class="c"># roles/nk_demo/tasks/main.yml</span>
---
- name: Show where the value comes from
  ansible.builtin.debug:
    msg: "level is: {{ level }}"</pre>
<p><code>debug</code> prints a message and changes nothing, so it is perfect for experiments. We set <code>level</code> in one more place before each run and watch the answer change. The role default is <code>level: from role defaults</code>.</p>
<pre class="out">1) only the role default exists
    "msg": "level is: from role defaults"

2) add group_vars/all.yml with level: from group_vars all
    "msg": "level is: from group_vars all"

3) add group_vars/routers.yml with level: from group_vars routers
    "msg": "level is: from group_vars routers"

4) add host_vars/pun-core-r1.yml with level: from host_vars
    "msg": "level is: from host_vars"

5) add roles/nk_demo/vars/main.yml with level: from role vars
    "msg": "level is: <span class="hl">from role vars</span>"

6) run with  ansible-playbook demo.yml -e level=cli
    "msg": "level is: <span class="hl">cli</span>"</pre>
<p>Each step moved up the ladder, and the newest, stronger source won every time. Note step 5: a file inside the role beat the host file. That is why we keep tunable values in <code>defaults/</code> and not in <code>vars/</code>: a user cannot override <code>vars/</code> from inventory.</p>

<h3>Seeing the inventory side</h3>
<p><code>ansible-inventory --host NAME</code> shows the variables from inventory, group_vars and host_vars. It does <b>not</b> show role defaults or role vars, because those belong to the role, not to the host. After step 4 above it printed:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-inventory --host pun-core-r1
{
    "ansible_connection": "ansible.netcommon.network_cli",
    "ansible_host": "10.99.0.1",
    "ansible_network_os": "cisco.ios.ios",
    "ansible_password": "NK@2026",
    "ansible_user": "netops",
    "level": "from host_vars"
}</pre>

<h3>Overriding a role default for one group</h3>
<p>Back to <code>nk_base</code>. Its default <code>syslog_host</code> is <code>10.99.0.60</code>, but the switches must log to a different collector, <code>10.99.0.61</code>. We do not edit the role. We add one file for the group <code>switches</code>:</p>
<pre class="code"><span class="c"># group_vars/switches.yml</span>
---
syslog_host: 10.99.0.61</pre>
<p>Then we apply only the logging part and compare what Ansible knows about a switch and a router:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook site.yml --tags logging

TASK [nk_base : Syslog host] **************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
<span class="hl">changed: [pun-acc-sw1]</span>

netadmin@auto01:~/netauto$ ansible-inventory --host pun-acc-sw1
{
    ...
    "ansible_user": "netops",
    "syslog_host": "10.99.0.61"
}
netadmin@auto01:~/netauto$ ansible-inventory --host pun-core-r1
{
    ...
    "ansible_user": "netops"
}</pre>
<p>The routers still use the role default (they report ok: nothing to do), and only the switch changed. The router has no <code>syslog_host</code> in its inventory list because its value comes from <code>roles/nk_base/defaults/main.yml</code>. Remember one more thing: <code>ios_config</code> adds the new <code>logging host</code> line but does not delete the old one. If the switch must stop logging to the old collector, plan a removal step (module 4, chapter 8).</p>

<h3>A naming habit that prevents collisions</h3>
<p>Variables from every role share one flat namespace in a play. Two roles that both use a variable called <code>servers</code> will trample each other. Prefix role variables with the role name: <code>nk_base_ntp_servers</code>, <code>nk_loopback_mask</code>. This lab keeps short names to stay readable, but real shared roles should prefix.</p>

<div class="warn"><p><b>Common mistakes.</b> Putting a tunable value in <code>vars/</code> and then wondering why group_vars is ignored; expecting <code>ansible-inventory --host</code> to show role defaults; using <code>-e</code> in scheduled jobs and forgetting that it silently beats everything; unprefixed variable names that collide between roles.</p></div>
<div class="exam"><p><b>Exam trap.</b> Extra variables (<code>-e</code>) always win. Role defaults always lose. Role vars beat inventory variables.</p></div>

<div class="scn"><h4>The syslog host that would not change</h4><p>A site engineer set <code>syslog_host</code> in group_vars, ran the playbook, and still saw the old collector on the devices. The role author had also set the variable in the role's <code>vars/main.yml</code>, which outranks group_vars. A debug task showed the winning value in seconds. The author moved the setting to defaults and the site file took effect.</p><p><b>Lesson:</b> when a value will not change, ask which source outranks yours, and print it with debug.</p></div>

<div class="iv"><p class="q">"Explain Ansible variable precedence with an example."</p><p>Many sources can set one variable and the highest wins: role defaults are lowest, then group_vars, host_vars, play vars, role vars, set_fact and finally extra vars on the command line. For example, a role default for the syslog host can be overridden for one group with a group_vars file, while -e beats everything. I verify with ansible-inventory --host and a debug task.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Precedence order is fixed: defaults weakest, -e strongest.</li>
<li>Put tunable settings in defaults; they can be overridden from inventory.</li>
<li>Role vars outrank host_vars, so use them only for constants.</li>
<li>ansible-inventory --host shows inventory data only, not role defaults.</li>
<li>Prefix role variables to avoid collisions; debug shows the winning value.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka ek idea:</b> ek hi variable ka naam kai jagah set ho sakta hai. Ansible ki tay ranking hai, jise <b>variable precedence</b> kehte hain, aur sabse oonchi rank jeetti hai. Ranking jaan lo to aap koi bhi value predict kar sakte ho, aur aise roles design kar sakte ho jinhe sites role edit kiye bina tune kar saken.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Precedence seedhi, sabse kamzor neeche">
<rect x="180" y="15" width="280" height="30" rx="6" fill="#fed7aa"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="12">command line par -e (hamesha jeetta hai)</text>
<rect x="180" y="49" width="280" height="30" rx="6" fill="#ddd6fe"/><text x="320" y="69" text-anchor="middle" class="svg-ink" font-size="12">role vars/main.yml</text>
<rect x="180" y="83" width="280" height="30" rx="6" fill="#bae6fd"/><text x="320" y="103" text-anchor="middle" class="svg-ink" font-size="12">host_vars/HOST</text>
<rect x="180" y="117" width="280" height="30" rx="6" fill="#bae6fd"/><text x="320" y="137" text-anchor="middle" class="svg-ink" font-size="12">group_vars/GROUP</text>
<rect x="180" y="151" width="280" height="30" rx="6" fill="#bae6fd"/><text x="320" y="171" text-anchor="middle" class="svg-ink" font-size="12">group_vars/all</text>
<rect x="180" y="185" width="280" height="30" rx="6" fill="#bbf7d0"/><text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="12">role defaults/main.yml (sabse kamzor)</text>
<text x="475" y="35" class="svg-accent" font-size="12">sabse mazboot</text><text x="475" y="205" class="svg-muted" font-size="12">sabse kamzor</text>
</svg><p class="cap">Oopar ka box neeche ke har box ko override karta hai. (Play vars aur set_fact host_vars aur role vars ke beech mein aate hain.)</p></div>

<h3>Ranking, kamzor se mazboot</h3>
<ol>
<li>role <code>defaults/main.yml</code></li>
<li>inventory aur <code>group_vars/all</code></li>
<li><code>group_vars/GROUP</code> (zyada specific group, general group ko haraata hai)</li>
<li><code>host_vars/HOST</code></li>
<li>play <code>vars:</code></li>
<li>role <code>vars/main.yml</code></li>
<li>run ke dauran <code>set_fact</code> aur <code>register</code></li>
<li>command line par <code>-e</code> extra variables</li>
</ol>
<p>Official list mein aur levels hain, lekin yeh network engineer ko milne wali lagbhag har cheez cover karte hain.</p>

<h3>Hote hue dekho</h3>
<p>Hum ek chhota role <code>nk_demo</code> banate hain jiska ek hi task <code>level</code> naam ka variable print karta hai:</p>
<pre class="code"><span class="c"># roles/nk_demo/tasks/main.yml</span>
---
- name: Show where the value comes from
  ansible.builtin.debug:
    msg: "level is: {{ level }}"</pre>
<p><code>debug</code> message print karta hai aur kuch badalta nahi, isliye experiments ke liye perfect hai. Har run se pehle <code>level</code> ek aur jagah set karte hain aur jawab badalta dekhte hain. Role default hai <code>level: from role defaults</code>.</p>
<pre class="out">1) sirf role default maujood hai
    "msg": "level is: from role defaults"

2) group_vars/all.yml mein level: from group_vars all jodo
    "msg": "level is: from group_vars all"

3) group_vars/routers.yml mein level: from group_vars routers jodo
    "msg": "level is: from group_vars routers"

4) host_vars/pun-core-r1.yml mein level: from host_vars jodo
    "msg": "level is: from host_vars"

5) roles/nk_demo/vars/main.yml mein level: from role vars jodo
    "msg": "level is: <span class="hl">from role vars</span>"

6) chalao  ansible-playbook demo.yml -e level=cli
    "msg": "level is: <span class="hl">cli</span>"</pre>
<p>Har step seedhi par oopar gaya, aur naya, mazboot source har baar jeeta. Step 5 dekho: role ke andar ki file ne host file ko haraya. Isi liye hum tunable values <code>defaults/</code> mein rakhte hain, <code>vars/</code> mein nahi: user <code>vars/</code> ko inventory se override nahi kar sakta.</p>

<h3>Inventory ki taraf se dekhna</h3>
<p><code>ansible-inventory --host NAME</code> inventory, group_vars aur host_vars ke variables dikhata hai. Yeh role defaults ya role vars <b>nahi</b> dikhata, kyunki woh role ke hain, host ke nahi. Upar ke step 4 ke baad isne yeh print kiya:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-inventory --host pun-core-r1
{
    "ansible_connection": "ansible.netcommon.network_cli",
    "ansible_host": "10.99.0.1",
    "ansible_network_os": "cisco.ios.ios",
    "ansible_password": "NK@2026",
    "ansible_user": "netops",
    "level": "from host_vars"
}</pre>

<h3>Ek group ke liye role default override karna</h3>
<p>Wapas <code>nk_base</code> par. Uska default <code>syslog_host</code> <code>10.99.0.60</code> hai, lekin switches ko alag collector <code>10.99.0.61</code> par log karna hai. Hum role edit nahi karte. Group <code>switches</code> ke liye ek file jodte hain:</p>
<pre class="code"><span class="c"># group_vars/switches.yml</span>
---
syslog_host: 10.99.0.61</pre>
<p>Phir sirf logging wala hissa lagate hain aur compare karte hain ki Ansible switch aur router ke baare mein kya jaanta hai:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook site.yml --tags logging

TASK [nk_base : Syslog host] **************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
<span class="hl">changed: [pun-acc-sw1]</span>

netadmin@auto01:~/netauto$ ansible-inventory --host pun-acc-sw1
{
    ...
    "ansible_user": "netops",
    "syslog_host": "10.99.0.61"
}
netadmin@auto01:~/netauto$ ansible-inventory --host pun-core-r1
{
    ...
    "ansible_user": "netops"
}</pre>
<p>Routers abhi bhi role default use karte hain (ok batate hain: karne ko kuch nahi), aur sirf switch badla. Router ki inventory list mein <code>syslog_host</code> nahi hai kyunki uski value <code>roles/nk_base/defaults/main.yml</code> se aati hai. Ek aur baat yaad rakho: <code>ios_config</code> naya <code>logging host</code> jodta hai lekin purana delete nahi karta. Switch ko purane collector par log karna band karna ho to removal step plan karo (module 4, chapter 8).</p>

<h3>Naming ki aadat jo takrao rokti hai</h3>
<p>Play mein har role ke variables ek hi flat namespace share karte hain. Do roles jo dono <code>servers</code> naam ka variable use karte hain ek doosre ko kuchal denge. Role ke variables ko role ke naam ka prefix do: <code>nk_base_ntp_servers</code>, <code>nk_loopback_mask</code>. Yeh lab padhne mein aasaani ke liye chhote naam rakhta hai, lekin asli shared roles mein prefix lagana chahiye.</p>

<div class="warn"><p><b>Common mistakes.</b> Tunable value <code>vars/</code> mein rakhkar sochna ki group_vars kyun ignore ho raha hai; <code>ansible-inventory --host</code> se role defaults dikhne ki umeed; scheduled jobs mein <code>-e</code> use karna aur bhoolna ki woh chupchaap sab par bhaari hai; roles ke beech takrane wale bina prefix ke variable names.</p></div>
<div class="exam"><p><b>Exam trap.</b> Extra variables (<code>-e</code>) hamesha jeette hain. Role defaults hamesha haarte hain. Role vars inventory variables ko haraate hain.</p></div>

<div class="scn"><h4>Syslog host jo badla hi nahi</h4><p>Ek site engineer ne group_vars mein <code>syslog_host</code> set kiya, playbook chalaya, aur devices par abhi bhi purana collector dikha. Role author ne variable role ke <code>vars/main.yml</code> mein bhi set kiya tha, jo group_vars se upar hai. Debug task ne seconds mein jeetne wali value dikha di. Author ne setting defaults mein le gaya aur site file kaam karne lagi.</p><p><b>Lesson:</b> value na badle to poochho kaunsa source aapse upar hai, aur debug se print karo.</p></div>

<div class="iv"><p class="q">"Ansible variable precedence example ke saath samjhao."</p><p>Kai sources ek variable set kar sakte hain aur sabse oonchi jeetta hai: role defaults sabse kam, phir group_vars, host_vars, play vars, role vars, set_fact aur aakhir mein command line ke extra vars. Jaise syslog host ka role default ek group ke liye group_vars file se override ho sakta hai, jabki -e sab par bhaari hai. Main ansible-inventory --host aur debug task se verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Precedence order tay hai: defaults sabse kamzor, -e sabse mazboot.</li>
<li>Tunable settings defaults mein rakho; unhe inventory se override kar sakte hain.</li>
<li>Role vars host_vars ko haraate hain, isliye sirf constants ke liye use karo.</li>
<li>ansible-inventory --host sirf inventory data dikhata hai, role defaults nahi.</li>
<li>Collision se bachne ke liye role variables ko prefix do; debug jeetne wali value dikhata hai.</li>
</ul></div>
`}};export{e as default};