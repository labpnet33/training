var e={id:`orchestration-tools`,h:{en:`Orchestration tools: agent vs agentless, Ansible, Puppet, Chef, SaltStack`,hi:`Orchestration tools: agent vs agentless, Ansible, Puppet, Chef, SaltStack`},body:{en:`
<p>A housing society can be maintained in two ways. In the first, every building has a <b>resident caretaker</b> who phones the head office every half hour and asks "anything new for my building?", then does it. In the second, there is no caretaker; a <b>visiting technician</b> arrives with a checklist whenever head office sends him, does the work, and leaves. The first is an <b>agent-based, pull</b> model. The second is <b>agentless, push</b>. Blueprint item 6.7 asks you to compare exactly this across four tools: Ansible, Puppet, Chef and SaltStack.</p>

<h3>The ideas behind all four tools</h3>
<dl class="terms">
<dt>Configuration management</dt><dd>Keeping many systems in a defined, consistent state, and correcting <b>drift</b> when someone changes one by hand.</dd>
<dt>Desired state (declarative)</dt><dd>You describe <b>what</b> the end result should be ("Loopback100 exists with this description"), and the tool works out <b>how</b>. The opposite, procedural or imperative, lists the steps.</dd>
<dt>Idempotency</dt><dd>Running the same job twice gives the same result, and the second run changes nothing because the state is already correct. This makes it safe to run the tool again and again.</dd>
<dt>Agent</dt><dd>A piece of software installed and running on every managed node.</dd>
<dt>Push vs pull</dt><dd><b>Push</b>: a central machine connects out and applies changes when you run it. <b>Pull</b>: each node's agent contacts a central server on a schedule and fetches its configuration.</dd>
</dl>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Agentless push versus agent-based pull">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="14">Agentless, push (Ansible)</text>
<rect x="95" y="34" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="160" y="59" text-anchor="middle" class="svg-ink" font-size="13">control node</text>
<rect x="20" y="160" width="80" height="36" rx="6" fill="#bae6fd"/><text x="60" y="183" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<rect x="120" y="160" width="80" height="36" rx="6" fill="#bae6fd"/><text x="160" y="183" text-anchor="middle" class="svg-ink" font-size="12">R2</text>
<rect x="220" y="160" width="80" height="36" rx="6" fill="#bae6fd"/><text x="260" y="183" text-anchor="middle" class="svg-ink" font-size="12">SW1</text>
<line x1="140" y1="74" x2="60" y2="160" stroke="#64748b" stroke-width="2"/><line x1="160" y1="74" x2="160" y2="160" stroke="#64748b" stroke-width="2"/><line x1="180" y1="74" x2="260" y2="160" stroke="#64748b" stroke-width="2"/>
<text x="245" y="118" class="svg-accent" font-size="12">SSH 22</text>
<text x="160" y="220" text-anchor="middle" class="svg-muted" font-size="12">nothing installed on devices</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="14">Agent-based, pull (Puppet, Chef)</text>
<rect x="415" y="34" width="130" height="40" rx="8" fill="#ddd6fe"/><text x="480" y="59" text-anchor="middle" class="svg-ink" font-size="13">server</text>
<rect x="340" y="160" width="80" height="36" rx="6" fill="#fde68a"/><text x="380" y="183" text-anchor="middle" class="svg-ink" font-size="12">agent</text>
<rect x="440" y="160" width="80" height="36" rx="6" fill="#fde68a"/><text x="480" y="183" text-anchor="middle" class="svg-ink" font-size="12">agent</text>
<rect x="540" y="160" width="80" height="36" rx="6" fill="#fde68a"/><text x="580" y="183" text-anchor="middle" class="svg-ink" font-size="12">agent</text>
<line x1="380" y1="160" x2="460" y2="74" stroke="#64748b" stroke-width="2"/><line x1="480" y1="160" x2="480" y2="74" stroke="#64748b" stroke-width="2"/><line x1="580" y1="160" x2="500" y2="74" stroke="#64748b" stroke-width="2"/>
<text x="560" y="118" class="svg-accent" font-size="12">poll</text>
<text x="480" y="220" text-anchor="middle" class="svg-muted" font-size="12">agents fetch config on a schedule</text>
</svg><p class="cap">Who starts the conversation is the difference between push and pull.</p></div>

<h3>The comparison table</h3>
<table class="cmp"><tr><th></th><th>Ansible</th><th>Puppet</th><th>Chef</th><th>SaltStack (Salt)</th></tr>
<tr><td><b>Agent</b></td><td>Agentless</td><td>Agent (puppet agent)</td><td>Agent (chef-client)</td><td>Agent (salt-minion); agentless option salt-ssh</td></tr>
<tr><td><b>Model</b></td><td>Push</td><td>Pull (every 30 min by default)</td><td>Pull (scheduled chef-client runs)</td><td>Push over an event bus (master publishes)</td></tr>
<tr><td><b>Central part</b></td><td>Control node (any Linux host)</td><td>Puppet server (formerly master)</td><td>Chef Infra Server plus a workstation</td><td>Salt master</td></tr>
<tr><td><b>Written as</b></td><td>YAML playbooks, Jinja2 templates</td><td>Manifests in Puppet DSL (Ruby-based)</td><td>Recipes and cookbooks in Ruby</td><td>YAML state files (SLS) with Jinja</td></tr>
<tr><td><b>Style</b></td><td>Declarative tasks, run in order</td><td>Declarative</td><td>Procedural (imperative)</td><td>Declarative states, plus remote execution</td></tr>
<tr><td><b>Transport / port</b></td><td>SSH TCP 22 (also NETCONF 830, HTTPS APIs)</td><td>HTTPS TCP 8140</td><td>HTTPS TCP 443</td><td>ZeroMQ TCP 4505 and 4506</td></tr>
<tr><td><b>Key terms</b></td><td>Inventory, playbook, play, task, module, role</td><td>Manifest, module, catalog, facts (Facter)</td><td>Cookbook, recipe, resource, run-list, node</td><td>Master, minion, state, grains, pillar</td></tr>
<tr><td><b>Written in</b></td><td>Python</td><td>Ruby</td><td>Ruby</td><td>Python</td></tr>
</table>
<p>Why is Ansible so popular for networks? Routers and switches generally cannot run a Puppet or Chef agent. Ansible needs nothing on the device: it logs in over SSH (or NETCONF, or the controller's API) from the control node, exactly like your Netmiko script. Puppet and Salt reach network devices through a <b>proxy</b> (Puppet's device mode, Salt proxy minions), where the agent runs on a server and talks to the device on its behalf.</p>

<h3>What Ansible looks like</h3>
<p>An <b>inventory</b> lists devices and groups; a <b>playbook</b> is a YAML file of <b>plays</b>, each a list of <b>tasks</b> that call <b>modules</b>. This playbook creates the same loopback your Python script does:</p>
<pre class="code"><span class="c"># inventory.ini</span>
[routers]
R1 ansible_host=10.99.0.1
R2 ansible_host=10.99.0.2
R3 ansible_host=10.99.0.3
[routers:vars]
ansible_network_os=cisco.ios.ios
ansible_connection=ansible.netcommon.network_cli
ansible_user=netops

<span class="c"># loopback.yml</span>
- name: Managed loopback on every router
  hosts: routers
  gather_facts: false
  tasks:
    - name: Loopback100 description
      cisco.ios.ios_config:
        parents: interface Loopback100
        lines:
          - description Managed by Ansible</pre>
<pre class="out">AUTO&gt; ansible-playbook -i inventory.ini loopback.yml
...
PLAY RECAP *********************************************************
<span class="hl">R1   : ok=1    changed=1    unreachable=0    failed=0    skipped=0</span>
R2   : ok=1    changed=1    unreachable=0    failed=0    skipped=0
R3   : ok=1    changed=1    unreachable=0    failed=0    skipped=0</pre>

<div class="eg"><p><b>Worked example: idempotency.</b> The first run reports <code>changed=1</code> on each of the three routers: three changes. Run it again without touching anything and every router reports <code>ok=1 changed=0</code>, because the module compared the running configuration with the desired lines and found nothing to do. If someone deletes the description on R2 by hand, the next run shows <code>changed=1</code> only for R2. Your earlier Python script, in contrast, sends the lines every time; you would have to add the "check first" logic yourself.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Saying Ansible needs an agent (it does not; it needs SSH or an API and, on servers, Python); mixing up which tools pull (Puppet, Chef) and which push (Ansible, Salt); and thinking agentless means "no credentials": the control node still logs in to every device.</p></div>

<div class="exam"><p><b>Exam trap.</b> Memorise the grid: <b>Ansible = agentless, push, YAML, SSH</b>; <b>Puppet = agent, pull, Puppet DSL, TCP 8140</b>; <b>Chef = agent, pull, Ruby recipes and cookbooks</b>; <b>Salt = agent (minion), push via ZeroMQ, YAML states, with salt-ssh as an agentless option</b>. A question may describe a tool without naming it ("uses a master and minions", "cookbooks", "manifests", "playbooks").</p></div>

<div class="scn"><h4>Two teams, two tools</h4><p>A bank's server team had managed 3,000 Linux servers with Puppet for years, and management asked the network team to "just use Puppet too". The network team tested it and found that their Catalyst switches could not run the agent; the proxy approach worked but added servers to maintain. They chose Ansible for the network, running playbooks from a control node over SSH and, for newer switches, over RESTCONF. Both tools pulled their variables from the same inventory database, so each team kept the model that fit its devices.</p><p><b>Lesson:</b> agent-based pull suits large fleets of servers that can run software; agentless push suits network devices. The right tool depends on what can run on the managed node.</p></div>

<div class="iv"><p class="q">"Compare Ansible and Puppet. Which would you choose for network automation and why?"</p><p>Strong answer: Ansible is agentless and push-based: a control node connects over SSH, NETCONF or APIs and runs YAML playbooks on demand. Puppet is agent-based and pull-based: each node's agent contacts the Puppet server (TCP 8140) on a schedule and applies a declarative manifest written in Puppet's Ruby-based DSL. For network gear Ansible usually wins because devices cannot run agents and changes are often run on demand in a change window. Mention idempotency, Chef (agent, pull, Ruby cookbooks) and Salt (minions, push over ZeroMQ) for completeness.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Agent = software on every node; push = central node starts the change; pull = agents fetch on a schedule.</li>
<li>Ansible: agentless, push, YAML playbooks, SSH; the usual choice for network devices.</li>
<li>Puppet: agent, pull, manifests in a Ruby-based DSL, TCP 8140. Chef: agent, pull, Ruby recipes and cookbooks.</li>
<li>SaltStack: master and minions, push over ZeroMQ (4505/4506), YAML states; salt-ssh for agentless.</li>
<li>Idempotent, declarative tools make a second run change nothing when the state is already correct.</li>
</ul></div>
`,hi:`
<p>Ek housing society do tarike se maintain ho sakti hai. Pehle mein, har building mein ek <b>resident caretaker</b> hota hai jo har aadhe ghante head office ko phone karke poochta hai "meri building ke liye kuch naya?", phir woh kaam karta hai. Doosre mein koi caretaker nahi; jab bhi head office bheje, ek <b>visiting technician</b> checklist ke saath aata hai, kaam karta hai, aur chala jaata hai. Pehla <b>agent-based, pull</b> model hai. Doosra <b>agentless, push</b> hai. Blueprint item 6.7 aapse chaar tools mein bilkul yahi compare karne ko kehta hai: Ansible, Puppet, Chef aur SaltStack.</p>

<h3>Chaaron tools ke peeche ke ideas</h3>
<dl class="terms">
<dt>Configuration management</dt><dd>Bahut saare systems ko ek defined, consistent state mein rakhna, aur jab koi haath se kuch badle to us <b>drift</b> ko theek karna.</dd>
<dt>Desired state (declarative)</dt><dd>Aap describe karte ho ki end result <b>kya</b> hona chahiye ("Loopback100 is description ke saath exist kare"), aur tool khud nikaalta hai <b>kaise</b>. Iska ulta, procedural ya imperative, steps ki list deta hai.</dd>
<dt>Idempotency</dt><dd>Same job do baar chalane par same result aata hai, aur doosra run kuch nahi badalta kyunki state pehle se sahi hai. Isse tool ko baar baar chalana safe ho jaata hai.</dd>
<dt>Agent</dt><dd>Har managed node par install aur chalta hua software.</dd>
<dt>Push vs pull</dt><dd><b>Push</b>: ek central machine bahar connect karti hai aur jab aap chalao tab changes lagati hai. <b>Pull</b>: har node ka agent schedule par central server se contact karke apni configuration laata hai.</dd>
</dl>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Agentless push vs agent-based pull">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="14">Agentless, push (Ansible)</text>
<rect x="95" y="34" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="160" y="59" text-anchor="middle" class="svg-ink" font-size="13">control node</text>
<rect x="20" y="160" width="80" height="36" rx="6" fill="#bae6fd"/><text x="60" y="183" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<rect x="120" y="160" width="80" height="36" rx="6" fill="#bae6fd"/><text x="160" y="183" text-anchor="middle" class="svg-ink" font-size="12">R2</text>
<rect x="220" y="160" width="80" height="36" rx="6" fill="#bae6fd"/><text x="260" y="183" text-anchor="middle" class="svg-ink" font-size="12">SW1</text>
<line x1="140" y1="74" x2="60" y2="160" stroke="#64748b" stroke-width="2"/><line x1="160" y1="74" x2="160" y2="160" stroke="#64748b" stroke-width="2"/><line x1="180" y1="74" x2="260" y2="160" stroke="#64748b" stroke-width="2"/>
<text x="245" y="118" class="svg-accent" font-size="12">SSH 22</text>
<text x="160" y="220" text-anchor="middle" class="svg-muted" font-size="12">devices par kuch install nahi</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="14">Agent-based, pull (Puppet, Chef)</text>
<rect x="415" y="34" width="130" height="40" rx="8" fill="#ddd6fe"/><text x="480" y="59" text-anchor="middle" class="svg-ink" font-size="13">server</text>
<rect x="340" y="160" width="80" height="36" rx="6" fill="#fde68a"/><text x="380" y="183" text-anchor="middle" class="svg-ink" font-size="12">agent</text>
<rect x="440" y="160" width="80" height="36" rx="6" fill="#fde68a"/><text x="480" y="183" text-anchor="middle" class="svg-ink" font-size="12">agent</text>
<rect x="540" y="160" width="80" height="36" rx="6" fill="#fde68a"/><text x="580" y="183" text-anchor="middle" class="svg-ink" font-size="12">agent</text>
<line x1="380" y1="160" x2="460" y2="74" stroke="#64748b" stroke-width="2"/><line x1="480" y1="160" x2="480" y2="74" stroke="#64748b" stroke-width="2"/><line x1="580" y1="160" x2="500" y2="74" stroke="#64748b" stroke-width="2"/>
<text x="560" y="118" class="svg-accent" font-size="12">poll</text>
<text x="480" y="220" text-anchor="middle" class="svg-muted" font-size="12">agents schedule par config laate hain</text>
</svg><p class="cap">Baatcheet kaun shuru karta hai, yahi push aur pull ka fark hai.</p></div>

<h3>Comparison table</h3>
<table class="cmp"><tr><th></th><th>Ansible</th><th>Puppet</th><th>Chef</th><th>SaltStack (Salt)</th></tr>
<tr><td><b>Agent</b></td><td>Agentless</td><td>Agent (puppet agent)</td><td>Agent (chef-client)</td><td>Agent (salt-minion); agentless option salt-ssh</td></tr>
<tr><td><b>Model</b></td><td>Push</td><td>Pull (default har 30 min)</td><td>Pull (scheduled chef-client runs)</td><td>Event bus par push (master publish karta hai)</td></tr>
<tr><td><b>Central hissa</b></td><td>Control node (koi bhi Linux host)</td><td>Puppet server (pehle master)</td><td>Chef Infra Server plus workstation</td><td>Salt master</td></tr>
<tr><td><b>Kaise likha jaata hai</b></td><td>YAML playbooks, Jinja2 templates</td><td>Puppet DSL (Ruby-based) mein manifests</td><td>Ruby mein recipes aur cookbooks</td><td>Jinja ke saath YAML state files (SLS)</td></tr>
<tr><td><b>Style</b></td><td>Declarative tasks, order mein chalte hain</td><td>Declarative</td><td>Procedural (imperative)</td><td>Declarative states, plus remote execution</td></tr>
<tr><td><b>Transport / port</b></td><td>SSH TCP 22 (NETCONF 830, HTTPS APIs bhi)</td><td>HTTPS TCP 8140</td><td>HTTPS TCP 443</td><td>ZeroMQ TCP 4505 aur 4506</td></tr>
<tr><td><b>Key terms</b></td><td>Inventory, playbook, play, task, module, role</td><td>Manifest, module, catalog, facts (Facter)</td><td>Cookbook, recipe, resource, run-list, node</td><td>Master, minion, state, grains, pillar</td></tr>
<tr><td><b>Kisme likha</b></td><td>Python</td><td>Ruby</td><td>Ruby</td><td>Python</td></tr>
</table>
<p>Networks ke liye Ansible itna popular kyun hai? Routers aur switches aam taur par Puppet ya Chef agent nahi chala sakte. Ansible ko device par kuch nahi chahiye: woh control node se SSH (ya NETCONF, ya controller ki API) par login karta hai, bilkul aapke Netmiko script ki tarah. Puppet aur Salt network devices tak ek <b>proxy</b> se pahunchte hain (Puppet ka device mode, Salt proxy minions), jahan agent ek server par chalta hai aur device ki taraf se usse baat karta hai.</p>

<h3>Ansible kaisa dikhta hai</h3>
<p><b>Inventory</b> devices aur groups ki list deti hai; <b>playbook</b> <b>plays</b> ki YAML file hai, har play <b>tasks</b> ki list jo <b>modules</b> call karti hain. Yeh playbook wahi loopback banata hai jo aapka Python script banata hai:</p>
<pre class="code"><span class="c"># inventory.ini</span>
[routers]
R1 ansible_host=10.99.0.1
R2 ansible_host=10.99.0.2
R3 ansible_host=10.99.0.3
[routers:vars]
ansible_network_os=cisco.ios.ios
ansible_connection=ansible.netcommon.network_cli
ansible_user=netops

<span class="c"># loopback.yml</span>
- name: Managed loopback on every router
  hosts: routers
  gather_facts: false
  tasks:
    - name: Loopback100 description
      cisco.ios.ios_config:
        parents: interface Loopback100
        lines:
          - description Managed by Ansible</pre>
<pre class="out">AUTO&gt; ansible-playbook -i inventory.ini loopback.yml
...
PLAY RECAP *********************************************************
<span class="hl">R1   : ok=1    changed=1    unreachable=0    failed=0    skipped=0</span>
R2   : ok=1    changed=1    unreachable=0    failed=0    skipped=0
R3   : ok=1    changed=1    unreachable=0    failed=0    skipped=0</pre>

<div class="eg"><p><b>Worked example: idempotency.</b> Pehla run teeno routers par <code>changed=1</code> report karta hai: teen changes. Kuch chhue bina dobara chalao aur har router <code>ok=1 changed=0</code> report karta hai, kyunki module ne running configuration ko desired lines se compare kiya aur karne ko kuch nahi mila. Agar koi R2 par description haath se delete kar de, to agla run sirf R2 ke liye <code>changed=1</code> dikhata hai. Iske ulat aapka pichhla Python script har baar lines bhejta hai; "pehle check karo" wala logic aapko khud jodna padta.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Kehna ki Ansible ko agent chahiye (nahi chahiye; use SSH ya API aur servers par Python chahiye); kaun se tools pull karte hain (Puppet, Chef) aur kaun push (Ansible, Salt) mein confuse hona; aur sochna ki agentless matlab "credentials nahi": control node phir bhi har device par login karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Grid yaad karo: <b>Ansible = agentless, push, YAML, SSH</b>; <b>Puppet = agent, pull, Puppet DSL, TCP 8140</b>; <b>Chef = agent, pull, Ruby recipes aur cookbooks</b>; <b>Salt = agent (minion), ZeroMQ par push, YAML states, salt-ssh agentless option ke saath</b>. Question tool ka naam liye bina use describe kar sakta hai ("master aur minions use karta hai", "cookbooks", "manifests", "playbooks").</p></div>

<div class="scn"><h4>Do teams, do tools</h4><p>Ek bank ki server team saalon se 3,000 Linux servers Puppet se manage kar rahi thi, aur management ne network team se kaha "tum bhi Puppet use kar lo". Network team ne test kiya aur paaya ki unke Catalyst switches agent nahi chala sakte; proxy approach chali par maintain karne ke liye aur servers jud gaye. Unhone network ke liye Ansible chuna, control node se SSH par aur naye switches ke liye RESTCONF par playbooks chalate hue. Dono tools apne variables same inventory database se lete the, isliye har team ne woh model rakha jo uske devices par fit tha.</p><p><b>Seekh:</b> agent-based pull software chala sakne wale servers ke bade fleets ke liye theek hai; agentless push network devices ke liye. Sahi tool is par depend karta hai ki managed node par kya chal sakta hai.</p></div>

<div class="iv"><p class="q">"Ansible aur Puppet compare karo. Network automation ke liye aap kaunsa chunoge aur kyun?"</p><p>Strong answer: Ansible agentless aur push-based hai: control node SSH, NETCONF ya APIs par connect karke on demand YAML playbooks chalata hai. Puppet agent-based aur pull-based hai: har node ka agent schedule par Puppet server (TCP 8140) se contact karta hai aur Puppet ki Ruby-based DSL mein likha declarative manifest apply karta hai. Network gear ke liye aam taur par Ansible jeetta hai kyunki devices agents nahi chala sakte aur changes aksar change window mein on demand chalte hain. Poorna answer ke liye idempotency, Chef (agent, pull, Ruby cookbooks) aur Salt (minions, ZeroMQ par push) bhi batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Agent = har node par software; push = central node change shuru karta hai; pull = agents schedule par laate hain.</li>
<li>Ansible: agentless, push, YAML playbooks, SSH; network devices ke liye aam choice.</li>
<li>Puppet: agent, pull, Ruby-based DSL mein manifests, TCP 8140. Chef: agent, pull, Ruby recipes aur cookbooks.</li>
<li>SaltStack: master aur minions, ZeroMQ par push (4505/4506), YAML states; agentless ke liye salt-ssh.</li>
<li>Idempotent, declarative tools state pehle se sahi ho to doosre run mein kuch nahi badalte.</li>
</ul></div>
`}};export{e as default};