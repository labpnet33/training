var e={id:`yaml-inventory`,h:{en:`The YAML inventory: groups for sites and for roles`,hi:`YAML inventory: sites aur roles ke liye groups`},body:{en:`
<p>In Ansible 1 you wrote an INI inventory. It is quick, but as soon as hosts need several variables or groups need to nest, the <b>YAML inventory</b> reads better, because it uses the same indentation rules as your playbooks. In this chapter you convert one to the other, learn the structure line by line, and design groups that answer two questions: <b>where is the device</b> (a site group) and <b>what is the device</b> (a role group).</p>

<h3>The same inventory in two formats</h3>
<p>First the INI version, with site and role groups. A host that belongs to two groups is simply listed twice.</p>
<pre class="code">[pune]
pun-core-r1 ansible_host=10.99.0.1
pun-acc-sw1 ansible_host=10.99.0.10

[bengaluru]
blr-edge-r2 ansible_host=10.99.0.2

[routers]
pun-core-r1
blr-edge-r2

[switches]
pun-acc-sw1

[all:vars]
ansible_connection=ansible.netcommon.network_cli
ansible_network_os=cisco.ios.ios</pre>
<p>Ansible can print any inventory as YAML. This is the easiest way to learn the format: write what you know, then look at the translation.</p>
<pre class="out">AUTO01$ ansible-inventory -i inventory.ini --list --yaml
all:
  children:
    bengaluru:
      hosts:
        blr-edge-r2:
          ansible_connection: ansible.netcommon.network_cli
          ansible_host: 10.99.0.2
          ansible_network_os: cisco.ios.ios
    pune:
      hosts:
        pun-acc-sw1:
          ansible_connection: ansible.netcommon.network_cli
          ansible_host: 10.99.0.10
          ansible_network_os: cisco.ios.ios
        pun-core-r1:
          ansible_connection: ansible.netcommon.network_cli
          ansible_host: 10.99.0.1
          ansible_network_os: cisco.ios.ios
    routers:
      hosts:
        blr-edge-r2:
          ansible_connection: ansible.netcommon.network_cli
          ansible_host: 10.99.0.2
          ansible_network_os: cisco.ios.ios
        pun-core-r1:
          ansible_connection: ansible.netcommon.network_cli
          ansible_host: 10.99.0.1
          ansible_network_os: cisco.ios.ios
    switches:
      hosts:
        pun-acc-sw1:
          ansible_connection: ansible.netcommon.network_cli
          ansible_host: 10.99.0.10
          ansible_network_os: cisco.ios.ios
    ungrouped: {}</pre>
<p>(The <code>[all:vars]</code> values are pushed down onto every host in this listing.) Notice that Ansible repeats each host's variables under every group it belongs to, because the output is fully expanded. In your own file you write each variable once.</p>

<h3>Write the YAML inventory yourself</h3>
<p>This is the form you keep in the project, as <code>inventory.yml</code>. The host variables are written once, under the first group; the second group simply names the host.</p>
<pre class="code">AUTO01$ cat &gt; inventory.yml &lt;&lt;'EOF'
all:
  children:
    pune:
      hosts:
        pun-core-r1:
          ansible_host: 10.99.0.1
        pun-acc-sw1:
          ansible_host: 10.99.0.10
    bengaluru:
      hosts:
        blr-edge-r2:
          ansible_host: 10.99.0.2
    routers:
      hosts:
        pun-core-r1:
        blr-edge-r2:
    switches:
      hosts:
        pun-acc-sw1:
EOF</pre>

<h3>Reading it line by line</h3>
<ul>
<li><code>all:</code> is the top-level group that contains every host. Nothing else sits at the left margin.</li>
<li><code>children:</code> introduces the groups inside it. Each name below, such as <code>pune:</code>, is a group.</li>
<li><code>hosts:</code> introduces the hosts that belong to that group. Each host is a <b>key</b>, so it ends with a colon.</li>
<li>Under a host you write its variables, one per line: <code>ansible_host: 10.99.0.1</code>.</li>
<li><code>pun-core-r1:</code> with nothing after it, in the <code>routers</code> group, means "the same host, no extra variables here". It still needs its colon; without it YAML sees a list item where a key is expected.</li>
<li>Indentation is two spaces per level and never a tab.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Site groups and role groups overlapping on the same hosts">
<text x="115" y="22" text-anchor="middle" class="svg-ink" font-size="13">Site groups: where</text><text x="525" y="22" text-anchor="middle" class="svg-ink" font-size="13">Role groups: what</text>
<rect x="20" y="35" width="190" height="95" rx="10" fill="#fde68a"/><text x="115" y="55" text-anchor="middle" class="svg-ink" font-size="13">pune</text><text x="115" y="85" text-anchor="middle" class="svg-muted" font-size="12">pun-core-r1</text><text x="115" y="108" text-anchor="middle" class="svg-muted" font-size="12">pun-acc-sw1</text>
<rect x="20" y="145" width="190" height="95" rx="10" fill="#fde68a"/><text x="115" y="165" text-anchor="middle" class="svg-ink" font-size="13">bengaluru</text><text x="115" y="200" text-anchor="middle" class="svg-muted" font-size="12">blr-edge-r2</text>
<rect x="430" y="35" width="190" height="95" rx="10" fill="#bbf7d0"/><text x="525" y="55" text-anchor="middle" class="svg-ink" font-size="13">routers</text><text x="525" y="85" text-anchor="middle" class="svg-muted" font-size="12">pun-core-r1</text><text x="525" y="108" text-anchor="middle" class="svg-muted" font-size="12">blr-edge-r2</text>
<rect x="430" y="145" width="190" height="95" rx="10" fill="#bae6fd"/><text x="525" y="165" text-anchor="middle" class="svg-ink" font-size="13">switches</text><text x="525" y="200" text-anchor="middle" class="svg-muted" font-size="12">pun-acc-sw1</text>
<line x1="210" y1="85" x2="430" y2="75" stroke="#64748b" stroke-width="1.5"/><line x1="210" y1="105" x2="430" y2="195" stroke="#64748b" stroke-width="1.5"/><line x1="210" y1="195" x2="430" y2="95" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">One host sits in one site group and one role group; lines connect the same host.</p></div>

<h3>Check what Ansible built</h3>
<pre class="out">AUTO01$ ansible-inventory --graph
@all:
  |--@pune:
  |  |--pun-core-r1
  |  |--pun-acc-sw1
  |--@bengaluru:
  |  |--blr-edge-r2
  |--@routers:
  |  |--pun-core-r1
  |  |--blr-edge-r2
  |--@switches:
  |  |--pun-acc-sw1</pre>
<p>No <code>-i</code> was needed because the project <code>ansible.cfg</code> contains <code>inventory = inventory.yml</code>. Ansible recognises the format from the content and the extension; a file that ends in <code>.yml</code> is parsed as YAML.</p>

<h3>Why two kinds of groups?</h3>
<p>Site and role are different questions. A site group carries things true for a place: the time zone, the SNMP location, the local NTP server. A role group carries things true for a type of device: VLAN lists on switches, routing settings on routers. Because a host can sit in many groups, you never have to choose. When a new Pune router arrives you add it to <code>pune</code> and <code>routers</code>, and it inherits both sets of values on the next run.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Forgetting the colon after a host with no variables (<code>pun-core-r1</code> instead of <code>pun-core-r1:</code>), or mixing tab characters into the indentation. Another trap: repeating <code>ansible_host</code> under a second group with a different value. Define connection details once, in one place.</p></div>
<div class="exam"><p><b>Exam trap.</b> In YAML inventories, groups sit under <code>children:</code> and hosts under <code>hosts:</code>. Writing hosts directly under a group name without <code>hosts:</code> is a structure error. Also remember that <code>all</code> and <code>ungrouped</code> always exist.</p></div>

<div class="scn"><h4>The router that was in no group</h4><p>A new router was added to the inventory file, but a playbook with <code>hosts: routers</code> skipped it. <code>ansible-inventory --graph</code> showed the host only under <code>ungrouped</code>: the engineer had listed it in the <code>pune</code> group but forgot the <code>routers</code> entry. Adding one line under <code>routers: hosts:</code> fixed it, and the next run configured the router with everything else.</p><p><b>Lesson:</b> when a host is missing from a run, look at the graph before the playbook.</p></div>

<div class="iv"><p class="q">"How do you structure an inventory for many sites and device types?"</p><p>I create site groups for location-based values and role groups for device-type values, and put each host in one of each. Shared connection details go in <code>group_vars/all</code>. I check the structure with <code>ansible-inventory --graph</code>. For very large estates I would add a dynamic inventory or a source of truth, but the group design stays the same.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A YAML inventory nests <code>all</code>, <code>children</code>, groups, <code>hosts</code> and host variables.</li>
<li>A host listed in several groups appears once per group; define its variables once.</li>
<li>Hosts without variables still need a trailing colon.</li>
<li>Use site groups for "where" and role groups for "what".</li>
<li><code>ansible-inventory --graph</code> and <code>--list --yaml</code> show what Ansible understood.</li>
</ul></div>
`,hi:`
<p>Ansible 1 mein aapne INI inventory likhi thi. Yeh tez hai, par jaise hi hosts ko kai variables chahiye ya groups ko nest karna ho, <b>YAML inventory</b> behtar padhi jaati hai, kyunki yeh aapke playbooks jaise hi indentation rules use karti hai. Is chapter mein aap ek ko doosre mein convert karoge, structure line by line seekhoge, aur aise groups design karoge jo do sawaalon ka jawab dein: <b>device kahan hai</b> (site group) aur <b>device kya hai</b> (role group).</p>

<h3>Wahi inventory do formats mein</h3>
<p>Pehle INI version, site aur role groups ke saath. Jo host do groups mein hai use bas do baar list karte hain.</p>
<pre class="code">[pune]
pun-core-r1 ansible_host=10.99.0.1
pun-acc-sw1 ansible_host=10.99.0.10

[bengaluru]
blr-edge-r2 ansible_host=10.99.0.2

[routers]
pun-core-r1
blr-edge-r2

[switches]
pun-acc-sw1

[all:vars]
ansible_connection=ansible.netcommon.network_cli
ansible_network_os=cisco.ios.ios</pre>
<p>Ansible kisi bhi inventory ko YAML ke roop mein print kar sakta hai. Format seekhne ka sabse aasaan tareeka: jo aap jaante ho woh likho, phir translation dekho.</p>
<pre class="out">AUTO01$ ansible-inventory -i inventory.ini --list --yaml
all:
  children:
    bengaluru:
      hosts:
        blr-edge-r2:
          ansible_connection: ansible.netcommon.network_cli
          ansible_host: 10.99.0.2
          ansible_network_os: cisco.ios.ios
    pune:
      hosts:
        pun-acc-sw1:
          ansible_connection: ansible.netcommon.network_cli
          ansible_host: 10.99.0.10
          ansible_network_os: cisco.ios.ios
        pun-core-r1:
          ansible_connection: ansible.netcommon.network_cli
          ansible_host: 10.99.0.1
          ansible_network_os: cisco.ios.ios
    routers:
      hosts:
        blr-edge-r2:
          ansible_connection: ansible.netcommon.network_cli
          ansible_host: 10.99.0.2
          ansible_network_os: cisco.ios.ios
        pun-core-r1:
          ansible_connection: ansible.netcommon.network_cli
          ansible_host: 10.99.0.1
          ansible_network_os: cisco.ios.ios
    switches:
      hosts:
        pun-acc-sw1:
          ansible_connection: ansible.netcommon.network_cli
          ansible_host: 10.99.0.10
          ansible_network_os: cisco.ios.ios
    ungrouped: {}</pre>
<p>(<code>[all:vars]</code> ki values is listing mein har host par neeche push ho jaati hain.) Dhyan do ki Ansible har host ke variables us host ke har group ke neeche repeat karta hai, kyunki output poora expand hota hai. Apni file mein har variable ek baar likhte ho.</p>

<h3>YAML inventory khud likho</h3>
<p>Yeh woh form hai jo aap project mein <code>inventory.yml</code> ke roop mein rakhte ho. Host variables pehle group ke neeche ek baar likhe hain; doosra group bas host ka naam leta hai.</p>
<pre class="code">AUTO01$ cat &gt; inventory.yml &lt;&lt;'EOF'
all:
  children:
    pune:
      hosts:
        pun-core-r1:
          ansible_host: 10.99.0.1
        pun-acc-sw1:
          ansible_host: 10.99.0.10
    bengaluru:
      hosts:
        blr-edge-r2:
          ansible_host: 10.99.0.2
    routers:
      hosts:
        pun-core-r1:
        blr-edge-r2:
    switches:
      hosts:
        pun-acc-sw1:
EOF</pre>

<h3>Line by line padhna</h3>
<ul>
<li><code>all:</code> top-level group hai jisme har host hai. Left margin par aur kuch nahi baithta.</li>
<li><code>children:</code> uske andar ke groups introduce karta hai. Neeche har naam, jaise <code>pune:</code>, ek group hai.</li>
<li><code>hosts:</code> us group ke hosts introduce karta hai. Har host ek <b>key</b> hai, isliye colon par khatam hota hai.</li>
<li>Host ke neeche uske variables, ek line mein ek: <code>ansible_host: 10.99.0.1</code>.</li>
<li><code>routers</code> group mein <code>pun-core-r1:</code> ke baad kuch nahi ka matlab "wahi host, yahan koi extra variable nahi". Phir bhi colon chahiye; uske bina YAML ko key ki jagah list item dikhta hai.</li>
<li>Indentation har level par do spaces, tab kabhi nahi.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Site groups aur role groups wahi hosts par overlap karte hain">
<text x="115" y="22" text-anchor="middle" class="svg-ink" font-size="13">Site groups: kahan</text><text x="525" y="22" text-anchor="middle" class="svg-ink" font-size="13">Role groups: kya</text>
<rect x="20" y="35" width="190" height="95" rx="10" fill="#fde68a"/><text x="115" y="55" text-anchor="middle" class="svg-ink" font-size="13">pune</text><text x="115" y="85" text-anchor="middle" class="svg-muted" font-size="12">pun-core-r1</text><text x="115" y="108" text-anchor="middle" class="svg-muted" font-size="12">pun-acc-sw1</text>
<rect x="20" y="145" width="190" height="95" rx="10" fill="#fde68a"/><text x="115" y="165" text-anchor="middle" class="svg-ink" font-size="13">bengaluru</text><text x="115" y="200" text-anchor="middle" class="svg-muted" font-size="12">blr-edge-r2</text>
<rect x="430" y="35" width="190" height="95" rx="10" fill="#bbf7d0"/><text x="525" y="55" text-anchor="middle" class="svg-ink" font-size="13">routers</text><text x="525" y="85" text-anchor="middle" class="svg-muted" font-size="12">pun-core-r1</text><text x="525" y="108" text-anchor="middle" class="svg-muted" font-size="12">blr-edge-r2</text>
<rect x="430" y="145" width="190" height="95" rx="10" fill="#bae6fd"/><text x="525" y="165" text-anchor="middle" class="svg-ink" font-size="13">switches</text><text x="525" y="200" text-anchor="middle" class="svg-muted" font-size="12">pun-acc-sw1</text>
<line x1="210" y1="85" x2="430" y2="75" stroke="#64748b" stroke-width="1.5"/><line x1="210" y1="105" x2="430" y2="195" stroke="#64748b" stroke-width="1.5"/><line x1="210" y1="195" x2="430" y2="95" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">Ek host ek site group aur ek role group mein hota hai; lines wahi host jodti hain.</p></div>

<h3>Check karo Ansible ne kya banaya</h3>
<pre class="out">AUTO01$ ansible-inventory --graph
@all:
  |--@pune:
  |  |--pun-core-r1
  |  |--pun-acc-sw1
  |--@bengaluru:
  |  |--blr-edge-r2
  |--@routers:
  |  |--pun-core-r1
  |  |--blr-edge-r2
  |--@switches:
  |  |--pun-acc-sw1</pre>
<p><code>-i</code> ki zaroorat nahi padi kyunki project <code>ansible.cfg</code> mein <code>inventory = inventory.yml</code> hai. Ansible format content aur extension se pehchanta hai; <code>.yml</code> par khatam hone wali file YAML ki tarah parse hoti hai.</p>

<h3>Do tarah ke groups kyun?</h3>
<p>Site aur role alag sawaal hain. Site group wahi cheezein rakhta hai jo jagah ke liye sach hain: time zone, SNMP location, local NTP server. Role group device type ke liye sach cheezein: switches par VLAN lists, routers par routing settings. Kyunki ek host kai groups mein ho sakta hai, aapko chunna nahi padta. Naya Pune router aaye to use <code>pune</code> aur <code>routers</code> mein jodo, aur agle run par woh dono sets ki values inherit kar leta hai.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Bina variable wale host ke baad colon bhoolna (<code>pun-core-r1:</code> ki jagah <code>pun-core-r1</code>), ya indentation mein tab characters mila dena. Ek aur trap: doosre group ke neeche <code>ansible_host</code> alag value ke saath repeat karna. Connection details ek hi jagah, ek baar define karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> YAML inventories mein groups <code>children:</code> ke neeche aur hosts <code>hosts:</code> ke neeche baithte hain. Group naam ke neeche seedha <code>hosts:</code> ke bina hosts likhna structure error hai. Yeh bhi yaad rakho ki <code>all</code> aur <code>ungrouped</code> hamesha hote hain.</p></div>

<div class="scn"><h4>Jo router kisi group mein nahi tha</h4><p>Inventory file mein naya router joda gaya, par <code>hosts: routers</code> wala playbook use chhod gaya. <code>ansible-inventory --graph</code> ne host ko sirf <code>ungrouped</code> ke neeche dikhaya: engineer ne use <code>pune</code> group mein likha tha par <code>routers</code> entry bhool gaya tha. <code>routers: hosts:</code> ke neeche ek line jodne se theek hua, aur agle run ne router ko baaki sab ke saath configure kiya.</p><p><b>Lesson:</b> run mein host missing ho to playbook se pehle graph dekho.</p></div>

<div class="iv"><p class="q">"Bahut sites aur device types ke liye inventory kaise structure karoge?"</p><p>Main location wali values ke liye site groups aur device-type ki values ke liye role groups banata hoon, aur har host ko ek-ek mein rakhta hoon. Shared connection details <code>group_vars/all</code> mein jaate hain. Structure <code>ansible-inventory --graph</code> se check karta hoon. Bahut bade estates ke liye dynamic inventory ya source of truth jodunga, par group design wahi rehta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>YAML inventory <code>all</code>, <code>children</code>, groups, <code>hosts</code> aur host variables ko nest karti hai.</li>
<li>Kai groups mein listed host har group mein ek baar dikhta hai; uske variables ek baar define karo.</li>
<li>Bina variables wale hosts ko bhi trailing colon chahiye.</li>
<li>"Kahan" ke liye site groups aur "kya" ke liye role groups use karo.</li>
<li><code>ansible-inventory --graph</code> aur <code>--list --yaml</code> dikhate hain Ansible ne kya samjha.</li>
</ul></div>
`}};export{e as default};