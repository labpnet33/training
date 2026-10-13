var e={id:`ucsm`,h:{en:`UCS Manager: object model, organizations, RBAC and port roles`,hi:`UCS Manager: object model, organizations, RBAC aur port roles`},body:{en:`
<p>A library does not keep books in a pile. Every book has a shelf, a section and a catalogue number, and the librarian decides who may borrow what. <b>UCS Manager (UCSM)</b> treats every piece of a UCS domain the same way: each blade, port, pool, policy and profile is an object with an exact address in one tree, and roles decide who may change which part of the tree.</p>

<h3>Where UCS Manager lives</h3>
<p>UCSM is not a separate server or VM. It is <b>embedded software running on the fabric interconnects</b>. The primary FI runs the active instance; the subordinate keeps a synchronised standby copy. You reach it through the <b>cluster virtual IP</b> on the management network, using three interfaces that all drive the same engine:</p>
<ul>
<li><b>GUI</b>: the HTML5 web interface you use in the labs.</li>
<li><b>CLI</b>: SSH to the virtual IP, then navigate the tree with <code>scope</code> commands and apply changes with <code>commit-buffer</code>.</li>
<li><b>XML API</b>: every GUI click becomes an XML API call, which is what PowerTool, Python SDKs, Ansible and Intersight use.</li>
</ul>

<h3>The object model: everything has a DN</h3>
<p>Every managed object (MO) has a <b>distinguished name (DN)</b>, its full path in the tree. You will see DNs in faults and logs, so learn to read them:</p>
<table class="cmp"><tr><th>DN</th><th>What it is</th></tr>
<tr><td><code>sys/chassis-1/blade-3</code></td><td>Physical blade in chassis 1, slot 3 (Equipment)</td></tr>
<tr><td><code>sys/switch-A</code></td><td>Fabric interconnect A</td></tr>
<tr><td><code>org-root/ls-ESX-01</code></td><td>Service profile ESX-01 in the root organization (ls = logical server)</td></tr>
<tr><td><code>org-root/mac-pool-MAC-A</code></td><td>MAC pool MAC-A</td></tr>
<tr><td><code>org-root/org-Finance/ls-DB-01</code></td><td>Profile DB-01 in the sub-organization Finance</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="UCSM object tree: physical versus logical">
<rect x="250" y="10" width="140" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">UCS domain</text>
<rect x="40" y="80" width="200" height="36" rx="8" fill="#fed7aa"/><text x="140" y="103" text-anchor="middle" class="svg-ink" font-size="13">sys/ (physical)</text>
<rect x="400" y="80" width="200" height="36" rx="8" fill="#bbf7d0"/><text x="500" y="103" text-anchor="middle" class="svg-ink" font-size="13">org-root (logical)</text>
<line x1="290" y1="46" x2="160" y2="80" stroke="#64748b" stroke-width="2"/><line x1="350" y1="46" x2="480" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="140" y="140" text-anchor="middle" class="svg-muted" font-size="12">switch-A, switch-B</text>
<text x="140" y="160" text-anchor="middle" class="svg-muted" font-size="12">chassis-1/blade-1..8</text>
<text x="140" y="180" text-anchor="middle" class="svg-muted" font-size="12">rack-unit-1, ports, IOMs</text>
<text x="500" y="140" text-anchor="middle" class="svg-muted" font-size="12">pools, policies, templates</text>
<text x="500" y="160" text-anchor="middle" class="svg-muted" font-size="12">service profiles (ls-...)</text>
<text x="500" y="180" text-anchor="middle" class="svg-muted" font-size="12">org-Finance, org-HR ...</text>
<line x1="240" y1="210" x2="400" y2="210" stroke="#64748b" stroke-width="2"/>
<text x="320" y="202" text-anchor="middle" class="svg-accent" font-size="12">association links them</text>
</svg><p class="cap">Equipment (what exists physically) is kept apart from logical objects (what you want the servers to be). Association binds a profile to a blade.</p></div>

<h3>Equipment, policies and service profiles</h3>
<p>The GUI navigation pane mirrors this split. <b>Equipment</b> shows the hardware: FIs, chassis, blades, rack servers, IOMs, ports, fans and PSUs, with their health. <b>Servers</b> holds service profiles, service profile templates, server policies (boot, BIOS, maintenance, firmware) and server-side pools (UUID, server pools). <b>LAN</b> holds VLANs, uplinks, vNIC templates, LAN policies and MAC/IP pools. <b>SAN</b> holds VSANs, FC uplinks, vHBA templates and WWNN/WWPN pools. <b>Admin</b> holds faults, events, users, backups and firmware. Real UCSM also has VM, Storage and Chassis tabs, which the labs do not need.</p>

<h3>Organizations and policy resolution</h3>
<p>An <b>organization</b> is a folder in the logical tree. Everything starts in <b>root</b>; you may create sub-organizations such as Finance or HR to separate tenants or teams. When a profile in <code>org-root/org-Finance</code> references a policy called BOOT-SAN, UCSM looks for BOOT-SAN in Finance first, then in each parent up to root, and uses the first match. If nothing is found, it falls back to the policy named <b>default</b>. This lets you define shared policies once in root and override only where needed.</p>

<h3>RBAC: roles and locales</h3>
<p>Users are authenticated locally or through LDAP, RADIUS or TACACS+. Their permissions come from <b>roles</b> (what they may do) and <b>locales</b> (where they may do it):</p>
<ul>
<li>Built-in roles include <b>admin</b>, <b>read-only</b>, <b>network</b> (LAN configuration), <b>storage</b> (SAN configuration), <b>server-profile</b>, <b>server-equipment</b>, <b>server-security</b>, <b>operations</b>, <b>AAA</b> and <b>facility-manager</b>.</li>
<li>A <b>locale</b> maps a user to one or more organizations. A server-profile user with the locale "Finance" can manage profiles only in org-Finance.</li>
</ul>
<p>This allows the classic split: the network team owns VLANs and uplinks, the storage team owns VSANs and WWPN pools, and the server team owns profiles.</p>

<h3>Fabric interconnect port roles</h3>
<p>A new FI port does nothing until you give it a role:</p>
<table class="cmp"><tr><th>Role</th><th>Connects to</th></tr>
<tr><td><b>Server port</b></td><td>IOM/IFM of a chassis, FEX, or a directly connected rack server VIC</td></tr>
<tr><td><b>Ethernet uplink port</b></td><td>Upstream LAN switches (usually in a port-channel to a vPC pair)</td></tr>
<tr><td><b>FC uplink port</b></td><td>Upstream MDS SAN switch (NPV in end-host mode)</td></tr>
<tr><td><b>FCoE uplink</b></td><td>An upstream switch that carries FCoE</td></tr>
<tr><td><b>FC storage port / appliance port</b></td><td>Directly attached FC array / NAS (FC storage ports need FC switch mode)</td></tr>
<tr><td><b>Monitor port</b></td><td>Traffic analyser for SPAN sessions</td></tr>
</table>
<p>Unified ports switch between Ethernet and FC in contiguous blocks at the start of the port range, and the change needs a reboot of that FI, so plan it during initial setup.</p>

<pre class="code"><span class="c">! UCSM CLI: navigate, change, commit</span>
UCS-A# scope org /
UCS-A /org # show service-profile status
UCS-A /org # scope service-profile ESX-01
UCS-A /org/service-profile # set descr "Prod ESXi host 01"
UCS-A /org/service-profile* # commit-buffer</pre>
<pre class="out">UCS-A /org # show service-profile status
Service Profile Name  Server  Assoc State  Power State  Op State
--------------------  ------  -----------  -----------  --------
<span class="hl">ESX-01                1/1     Associated   On           Ok</span>
ESX-02                        Unassociated Off          Ok</pre>
<p>The asterisk in the prompt means uncommitted changes are waiting; nothing reaches the system until <code>commit-buffer</code>.</p>

<div class="warn"><p><b>Common mistakes.</b> Leaving CLI changes uncommitted (the asterisk stays and nothing happens). Creating a policy in a sub-org and wondering why a root profile cannot see it (resolution goes upwards only). Editing a policy named "default", which silently changes every profile that relies on the fallback.</p></div>
<div class="exam"><p><b>Exam tip.</b> UCSM runs on the FIs (primary active, subordinate standby) and is reached by the cluster IP. Policy resolution walks from the profile's org up to root, then to "default". Locales restrict users to organizations.</p></div>

<div class="scn"><h4>The "default" policy that rebooted a tenant</h4><p>An administrator wanted every new server to have CDP enabled and edited the network control policy named default in root. Nothing rebooted, but a second change the same day switched the root maintenance policy "default" from user-ack to immediate while testing. Profiles in org-Finance had no maintenance policy of their own, so they resolved to root's default. The next template change rebooted six Finance database hosts at 14:00. The fix: create named policies (MAINT-USERACK) and reference them explicitly in every template, and leave the default objects untouched.</p><p><b>Lesson:</b> know how policy resolution works; a change high in the tree reaches every organization below it.</p></div>

<div class="iv"><p class="q">"Where does UCS Manager run, and what happens if the primary FI fails?"</p><p>Strong answer: UCSM is embedded on the FIs. The primary runs the active instance, the subordinate keeps a synchronised copy over the L1/L2 links. If the primary fails, the subordinate becomes primary and the cluster IP moves with it; data forwarding on the surviving fabric never stopped, because the data plane is active/active and independent of the management role. Mention <code>show cluster state</code> and HA READY.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>UCSM is embedded on the FIs, reached by the cluster IP through GUI, CLI or XML API.</li>
<li>Every object has a DN; physical objects live under sys/, logical ones under org-root.</li>
<li>Policies resolve from the profile's organization up to root, then to "default".</li>
<li>RBAC = roles (what) + locales (which organizations).</li>
<li>FI ports must be given roles: server, uplink, FC uplink, storage/appliance, monitor.</li>
</ul></div>
`,hi:`
<p>Library kitaabon ko dher mein nahi rakhti. Har kitaab ka ek shelf, ek section aur ek catalogue number hota hai, aur librarian decide karta hai ki kaun kya borrow kar sakta hai. <b>UCS Manager (UCSM)</b> UCS domain ke har hisse ko aise hi treat karta hai: har blade, port, pool, policy aur profile ek object hai jiska ek tree mein exact address hai, aur roles decide karte hain ki tree ka kaunsa hissa kaun badal sakta hai.</p>

<h3>UCS Manager kahan rehta hai</h3>
<p>UCSM alag server ya VM nahi hai. Yeh <b>fabric interconnects par chalne wala embedded software</b> hai. Primary FI active instance chalata hai; subordinate ek synchronised standby copy rakhta hai. Aap ise management network par <b>cluster virtual IP</b> se access karte ho, teen interfaces se jo sab same engine chalate hain:</p>
<ul>
<li><b>GUI</b>: HTML5 web interface jo aap labs mein use karte ho.</li>
<li><b>CLI</b>: virtual IP par SSH, phir <code>scope</code> commands se tree mein navigate karo aur <code>commit-buffer</code> se changes apply karo.</li>
<li><b>XML API</b>: har GUI click ek XML API call ban jaata hai, aur yahi PowerTool, Python SDKs, Ansible aur Intersight use karte hain.</li>
</ul>

<h3>Object model: har cheez ka DN hota hai</h3>
<p>Har managed object (MO) ka ek <b>distinguished name (DN)</b> hota hai, tree mein uska poora path. Aapko DNs faults aur logs mein dikhenge, isliye unhe padhna seekho:</p>
<table class="cmp"><tr><th>DN</th><th>Yeh kya hai</th></tr>
<tr><td><code>sys/chassis-1/blade-3</code></td><td>Chassis 1, slot 3 ka physical blade (Equipment)</td></tr>
<tr><td><code>sys/switch-A</code></td><td>Fabric interconnect A</td></tr>
<tr><td><code>org-root/ls-ESX-01</code></td><td>Root organization mein service profile ESX-01 (ls = logical server)</td></tr>
<tr><td><code>org-root/mac-pool-MAC-A</code></td><td>MAC pool MAC-A</td></tr>
<tr><td><code>org-root/org-Finance/ls-DB-01</code></td><td>Sub-organization Finance mein profile DB-01</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="UCSM object tree: physical vs logical">
<rect x="250" y="10" width="140" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">UCS domain</text>
<rect x="40" y="80" width="200" height="36" rx="8" fill="#fed7aa"/><text x="140" y="103" text-anchor="middle" class="svg-ink" font-size="13">sys/ (physical)</text>
<rect x="400" y="80" width="200" height="36" rx="8" fill="#bbf7d0"/><text x="500" y="103" text-anchor="middle" class="svg-ink" font-size="13">org-root (logical)</text>
<line x1="290" y1="46" x2="160" y2="80" stroke="#64748b" stroke-width="2"/><line x1="350" y1="46" x2="480" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="140" y="140" text-anchor="middle" class="svg-muted" font-size="12">switch-A, switch-B</text>
<text x="140" y="160" text-anchor="middle" class="svg-muted" font-size="12">chassis-1/blade-1..8</text>
<text x="140" y="180" text-anchor="middle" class="svg-muted" font-size="12">rack-unit-1, ports, IOMs</text>
<text x="500" y="140" text-anchor="middle" class="svg-muted" font-size="12">pools, policies, templates</text>
<text x="500" y="160" text-anchor="middle" class="svg-muted" font-size="12">service profiles (ls-...)</text>
<text x="500" y="180" text-anchor="middle" class="svg-muted" font-size="12">org-Finance, org-HR ...</text>
<line x1="240" y1="210" x2="400" y2="210" stroke="#64748b" stroke-width="2"/>
<text x="320" y="202" text-anchor="middle" class="svg-accent" font-size="12">association inhe jodta hai</text>
</svg><p class="cap">Equipment (jo physically hai) logical objects (aap servers ko kya banana chahte ho) se alag rakha jaata hai. Association profile ko blade se baandhta hai.</p></div>

<h3>Equipment, policies aur service profiles</h3>
<p>GUI ka navigation pane isi split ko dikhata hai. <b>Equipment</b> hardware dikhata hai: FIs, chassis, blades, rack servers, IOMs, ports, fans aur PSUs, unki health ke saath. <b>Servers</b> mein service profiles, service profile templates, server policies (boot, BIOS, maintenance, firmware) aur server-side pools (UUID, server pools) hain. <b>LAN</b> mein VLANs, uplinks, vNIC templates, LAN policies aur MAC/IP pools hain. <b>SAN</b> mein VSANs, FC uplinks, vHBA templates aur WWNN/WWPN pools hain. <b>Admin</b> mein faults, events, users, backups aur firmware hain. Real UCSM mein VM, Storage aur Chassis tabs bhi hote hain, jo labs mein zaroori nahi.</p>

<h3>Organizations aur policy resolution</h3>
<p><b>Organization</b> logical tree mein ek folder hai. Sab kuch <b>root</b> se shuru hota hai; tenants ya teams ko alag karne ke liye aap Finance ya HR jaise sub-organizations bana sakte ho. Jab <code>org-root/org-Finance</code> ka koi profile BOOT-SAN naam ki policy refer karta hai, to UCSM pehle Finance mein BOOT-SAN dhoondhta hai, phir root tak har parent mein, aur pehla match use karta hai. Kuch na mile to woh <b>default</b> naam ki policy par fall back karta hai. Isse aap shared policies ek baar root mein define karke sirf zaroorat ki jagah override kar sakte ho.</p>

<h3>RBAC: roles aur locales</h3>
<p>Users locally ya LDAP, RADIUS ya TACACS+ se authenticate hote hain. Unki permissions <b>roles</b> (kya kar sakte hain) aur <b>locales</b> (kahan kar sakte hain) se aati hain:</p>
<ul>
<li>Built-in roles mein <b>admin</b>, <b>read-only</b>, <b>network</b> (LAN configuration), <b>storage</b> (SAN configuration), <b>server-profile</b>, <b>server-equipment</b>, <b>server-security</b>, <b>operations</b>, <b>AAA</b> aur <b>facility-manager</b> hain.</li>
<li><b>Locale</b> user ko ek ya zyada organizations se map karta hai. "Finance" locale wala server-profile user sirf org-Finance ke profiles manage kar sakta hai.</li>
</ul>
<p>Isse classic split possible hota hai: network team VLANs aur uplinks ki maalik, storage team VSANs aur WWPN pools ki, aur server team profiles ki.</p>

<h3>Fabric interconnect port roles</h3>
<p>Naya FI port tab tak kuch nahi karta jab tak aap use role na do:</p>
<table class="cmp"><tr><th>Role</th><th>Kisse judta hai</th></tr>
<tr><td><b>Server port</b></td><td>Chassis ka IOM/IFM, FEX, ya seedha juda rack server VIC</td></tr>
<tr><td><b>Ethernet uplink port</b></td><td>Upstream LAN switches (aam taur par vPC pair tak port-channel mein)</td></tr>
<tr><td><b>FC uplink port</b></td><td>Upstream MDS SAN switch (end-host mode mein NPV)</td></tr>
<tr><td><b>FCoE uplink</b></td><td>Upstream switch jo FCoE carry karta hai</td></tr>
<tr><td><b>FC storage port / appliance port</b></td><td>Seedha juda FC array / NAS (FC storage ports ko FC switch mode chahiye)</td></tr>
<tr><td><b>Monitor port</b></td><td>SPAN sessions ke liye traffic analyser</td></tr>
</table>
<p>Unified ports Ethernet aur FC ke beech port range ke shuru mein contiguous blocks mein badalte hain, aur is change ke liye us FI ka reboot chahiye, isliye ise initial setup mein plan karo.</p>

<pre class="code"><span class="c">! UCSM CLI: navigate, change, commit</span>
UCS-A# scope org /
UCS-A /org # show service-profile status
UCS-A /org # scope service-profile ESX-01
UCS-A /org/service-profile # set descr "Prod ESXi host 01"
UCS-A /org/service-profile* # commit-buffer</pre>
<pre class="out">UCS-A /org # show service-profile status
Service Profile Name  Server  Assoc State  Power State  Op State
--------------------  ------  -----------  -----------  --------
<span class="hl">ESX-01                1/1     Associated   On           Ok</span>
ESX-02                        Unassociated Off          Ok</pre>
<p>Prompt mein asterisk ka matlab hai uncommitted changes wait kar rahe hain; <code>commit-buffer</code> tak system tak kuch nahi pahunchta.</p>

<div class="warn"><p><b>Common galtiyan.</b> CLI changes ko uncommitted chhod dena (asterisk reh jaata hai aur kuch nahi hota). Sub-org mein policy banana aur hairaan hona ki root profile use kyun nahi dekh pa raha (resolution sirf upar ki taraf jaata hai). "default" naam ki policy edit karna, jo chupchaap har us profile ko badal deta hai jo fallback par depend karta hai.</p></div>
<div class="exam"><p><b>Exam tip.</b> UCSM FIs par chalta hai (primary active, subordinate standby) aur cluster IP se access hota hai. Policy resolution profile ke org se root tak upar jaata hai, phir "default" tak. Locales users ko organizations tak restrict karte hain.</p></div>

<div class="scn"><h4>"default" policy jisne ek tenant reboot kar diya</h4><p>Ek administrator chahta tha ki har naye server par CDP enabled ho aur usne root mein default naam ki network control policy edit ki. Kuch reboot nahi hua, lekin usi din testing ke dauraan ek doosre change ne root ki maintenance policy "default" ko user-ack se immediate kar diya. org-Finance ke profiles ki apni koi maintenance policy nahi thi, isliye woh root ke default par resolve hue. Agle template change ne 14:00 baje chhe Finance database hosts reboot kar diye. Fix: named policies (MAINT-USERACK) banao aur har template mein explicitly refer karo, aur default objects ko mat chhedo.</p><p><b>Seekh:</b> policy resolution kaise kaam karta hai yeh jaano; tree mein upar kiya gaya change uske neeche ki har organization tak pahunchta hai.</p></div>

<div class="iv"><p class="q">"UCS Manager kahan chalta hai, aur primary FI fail ho to kya hota hai?"</p><p>Strong answer: UCSM FIs par embedded hai. Primary active instance chalata hai, subordinate L1/L2 links par synchronised copy rakhta hai. Primary fail ho to subordinate primary ban jaata hai aur cluster IP uske saath move hota hai; bache hue fabric par data forwarding kabhi ruki hi nahi, kyunki data plane active/active hai aur management role se independent hai. <code>show cluster state</code> aur HA READY mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>UCSM FIs par embedded hai, cluster IP par GUI, CLI ya XML API se access hota hai.</li>
<li>Har object ka DN hota hai; physical objects sys/ ke neeche, logical org-root ke neeche.</li>
<li>Policies profile ki organization se root tak resolve hoti hain, phir "default" tak.</li>
<li>RBAC = roles (kya) + locales (kaunsi organizations).</li>
<li>FI ports ko roles dene padte hain: server, uplink, FC uplink, storage/appliance, monitor.</li>
</ul></div>
`}};export{e as default};