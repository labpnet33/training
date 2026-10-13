var e={id:`summary-and-exam-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You can now segment a FortiGate with VLAN interfaces, label them with roles, group them in zones, control traffic between members and troubleshoot the common failures. This chapter is your revision sheet. Remember again that graded labs for this module are planned and not yet available; practise the pieces in nse4-setup, ccna-vlans, nse4-policy and sec-fw-deploy.</p>
<h3>Can-do checklist</h3>
<ul>
<li>Create a VLAN interface with parent interface, vlanid, IP, allowaccess, alias and role.</li>
<li>Explain what the switch must provide: a trunk allowing the VLANs and correct access VLANs.</li>
<li>Verify with the connected routes, the FortiGate ARP table and the switch trunk and VLAN tables.</li>
<li>Explain the four roles and that a role never changes forwarding.</li>
<li>Create a zone, add members, and read <code>show</code>, <code>show full-configuration</code> and <code>get system zone</code>.</li>
<li>State the intrazone default and what allow and deny do.</li>
<li>Use a zone in a policy, and explain why a member interface cannot be named directly.</li>
<li>Use sessions and <code>diagnose firewall iprope lookup</code> as evidence.</li>
</ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>VLAN interface</dt><dd>logical sub-interface of a parent port, tagged with a vlanid</dd><dt>Parent interface</dt><dd>the physical port that carries the VLAN interfaces</dd><dt>Trunk</dt><dd>switch link carrying several tagged VLANs</dd><dt>Role</dt><dd>lan, wan, dmz or undefined label</dd><dt>Zone</dt><dd>named group of interfaces used as one in policies</dd><dt>intrazone</dt><dd>zone attribute for traffic between members; default deny</dd><dt>policy id 0</dt><dd>implicit deny result in iprope lookup</dd><dt>iprope lookup</dt><dd>diagnose command that shows which policy a packet would match</dd></dl>
<h3>Most tested facts</h3>
<ul>
<li>A VLAN interface needs a parent interface and a vlanid that matches the switch.</li>
<li>The VLAN ID must be unique per parent interface.</li>
<li>Roles are lan, wan, dmz and undefined; they do not change forwarding.</li>
<li>A zone holds only interfaces; an interface is in one zone only.</li>
<li>The default intrazone is deny; <code>show</code> hides it.</li>
<li>Zone members are referenced through the zone in policies.</li>
<li>No session and policy id 0 means nothing permits the flow.</li>
</ul>
<h3>Command cheat-sheet (verified in the simulator)</h3>
<table class="cmp"><tr><th>Task</th><th>Command</th></tr><tr><td>create VLAN interface</td><td><code>config system interface</code> / <code>edit VLAN10</code> / <code>set interface port2</code> / <code>set vlanid 10</code></td></tr><tr><td>connected routes</td><td><code>get router info routing-table connected</code></td></tr><tr><td>neighbours</td><td><code>get system arp</code>, <code>diagnose ip arp list</code></td></tr><tr><td>create zone</td><td><code>config system zone</code> / <code>edit LAN-ZONE</code> / <code>set interface VLAN10 VLAN20</code></td></tr><tr><td>see zones</td><td><code>show system zone</code>, <code>show full-configuration system zone</code>, <code>get system zone</code></td></tr><tr><td>allow intrazone</td><td><code>set intrazone allow</code></td></tr><tr><td>which policy matches</td><td><code>diagnose firewall iprope lookup SRC 0 DST 0 icmp VLAN10</code></td></tr><tr><td>sessions</td><td><code>diagnose sys session list</code></td></tr></table>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="The four building blocks of this module"><rect x="10" y="25" width="150" height="55" rx="9" fill="#bae6fd"/><text x="85" y="49.5" text-anchor="middle" class="svg-ink" font-size="13">VLAN interface</text><text x="85" y="66.5" text-anchor="middle" class="svg-muted" font-size="11">parent + vlanid</text><rect x="175" y="25" width="150" height="55" rx="9" fill="#bbf7d0"/><text x="250" y="49.5" text-anchor="middle" class="svg-ink" font-size="13">Role</text><text x="250" y="66.5" text-anchor="middle" class="svg-muted" font-size="11">label only</text><rect x="340" y="25" width="150" height="55" rx="9" fill="#fde68a"/><text x="415" y="49.5" text-anchor="middle" class="svg-ink" font-size="13">Zone</text><text x="415" y="66.5" text-anchor="middle" class="svg-muted" font-size="11">groups interfaces</text><rect x="505" y="25" width="125" height="55" rx="9" fill="#ddd6fe"/><text x="567.5" y="49.5" text-anchor="middle" class="svg-ink" font-size="13">intrazone</text><text x="567.5" y="66.5" text-anchor="middle" class="svg-muted" font-size="11">allow / deny</text><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">Build from the left: interface, label, group, rule inside the group</text></svg><p class="cap">The four building blocks of this module</p></div>
<div class="warn"><p><b>Common mistake.</b> Treating the zone as a security level or an address range. It is only a policy group of interfaces with an intrazone rule.</p></div>
<div class="exam"><p><b>Exam trap.</b> When asked why traffic between two VLANs in one zone fails, the answer is intrazone deny, not a routing problem. When asked what a zone changes, the answer is policy grouping only.</p></div>
<div class="scn"><h4>From segmentation to confidence</h4><p>A learner who had only ever used one flat LAN was asked to segment a clinic. She created VLAN interfaces, verified the trunk on the switch, grouped the user VLANs in a zone, left the Medical VLAN as a separate interface with explicit policies, and documented the intrazone decision. The review took ten minutes because every choice had evidence and a reason.</p><p><b>Lesson:</b> segmentation is design plus verification, not just commands.</p></div>
<div class="iv"><p class="q">"Summarise VLAN interfaces and zones on a FortiGate."</p><p>A VLAN interface is a tagged sub-interface of a parent port with its own subnet, matched by vlanid to the switch trunk. Roles label interfaces without changing forwarding. A zone groups interfaces so one policy covers them, members keep their addresses, and intrazone decides traffic between members, default deny. For granular control use separate interfaces and explicit policies.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VLAN interface = parent + vlanid + IP; match the switch.</li>
<li>Roles label; zones group; intrazone governs members.</li>
<li>Evidence: sessions, iprope lookup, ARP and zone settings.</li>
<li>Next: nse4-policy for objects, order and logging.</li>
</ul></div>
`,hi:`
<p>Aap ab FortiGate ko VLAN interfaces se segment kar sakte ho, roles se label kar sakte ho, zones mein group kar sakte ho, members ke beech traffic control kar sakte ho aur aam failures troubleshoot kar sakte ho. Yeh chapter aapki revision sheet hai. Phir yaad rakho ki is module ke graded labs planned hain aur abhi available nahi hain; tukde nse4-setup, ccna-vlans, nse4-policy aur sec-fw-deploy mein practice karo.</p>
<h3>Can-do checklist</h3>
<ul>
<li>Parent interface, vlanid, IP, allowaccess, alias aur role ke saath VLAN interface banao.</li>
<li>Samjhao switch ko kya dena hai: VLANs allow karne wala trunk aur sahi access VLANs.</li>
<li>Connected routes, FortiGate ARP table aur switch trunk aur VLAN tables se verify karo.</li>
<li>Chaar roles samjhao aur yeh ki role kabhi forwarding nahi badalta.</li>
<li>Zone banao, members jodo, aur <code>show</code>, <code>show full-configuration</code> aur <code>get system zone</code> padho.</li>
<li>Intrazone default batao aur allow aur deny kya karte hain.</li>
<li>Policy mein zone use karo, aur samjhao member interface ko seedha naam kyun nahi de sakte.</li>
<li>Sessions aur <code>diagnose firewall iprope lookup</code> ko evidence ki tarah use karo.</li>
</ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>VLAN interface</dt><dd>parent port ka logical sub-interface, vlanid se tagged</dd><dt>Parent interface</dt><dd>physical port jo VLAN interfaces carry karta hai</dd><dt>Trunk</dt><dd>switch link jo kai tagged VLANs carry karta hai</dd><dt>Role</dt><dd>lan, wan, dmz ya undefined label</dd><dt>Zone</dt><dd>interfaces ka naamit group jo policies mein ek ki tarah use hota hai</dd><dt>intrazone</dt><dd>members ke beech ke traffic ka zone attribute; default deny</dd><dt>policy id 0</dt><dd>iprope lookup mein implicit deny result</dd><dt>iprope lookup</dt><dd>diagnose command jo batata hai packet kaunsi policy se match karega</dd></dl>
<h3>Sabse zyada tested facts</h3>
<ul>
<li>VLAN interface ko parent interface aur switch se match karta vlanid chahiye.</li>
<li>VLAN ID har parent interface par unique hona chahiye.</li>
<li>Roles lan, wan, dmz aur undefined hain; woh forwarding nahi badalte.</li>
<li>Zone sirf interfaces rakhta hai; interface sirf ek zone mein.</li>
<li>Default intrazone deny hai; <code>show</code> use chhupata hai.</li>
<li>Zone members ko policies mein zone ke zariye refer karte hain.</li>
<li>Session nahi aur policy id 0 matlab koi cheez flow ko permit nahi karti.</li>
</ul>
<h3>Command cheat-sheet (simulator mein verified)</h3>
<table class="cmp"><tr><th>Kaam</th><th>Command</th></tr><tr><td>VLAN interface banao</td><td><code>config system interface</code> / <code>edit VLAN10</code> / <code>set interface port2</code> / <code>set vlanid 10</code></td></tr><tr><td>connected routes</td><td><code>get router info routing-table connected</code></td></tr><tr><td>neighbours</td><td><code>get system arp</code>, <code>diagnose ip arp list</code></td></tr><tr><td>zone banao</td><td><code>config system zone</code> / <code>edit LAN-ZONE</code> / <code>set interface VLAN10 VLAN20</code></td></tr><tr><td>zones dekho</td><td><code>show system zone</code>, <code>show full-configuration system zone</code>, <code>get system zone</code></td></tr><tr><td>intrazone allow</td><td><code>set intrazone allow</code></td></tr><tr><td>kaunsi policy match karti hai</td><td><code>diagnose firewall iprope lookup SRC 0 DST 0 icmp VLAN10</code></td></tr><tr><td>sessions</td><td><code>diagnose sys session list</code></td></tr></table>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Is module ke chaar building blocks"><rect x="10" y="25" width="150" height="55" rx="9" fill="#bae6fd"/><text x="85" y="49.5" text-anchor="middle" class="svg-ink" font-size="13">VLAN interface</text><text x="85" y="66.5" text-anchor="middle" class="svg-muted" font-size="11">parent + vlanid</text><rect x="175" y="25" width="150" height="55" rx="9" fill="#bbf7d0"/><text x="250" y="49.5" text-anchor="middle" class="svg-ink" font-size="13">Role</text><text x="250" y="66.5" text-anchor="middle" class="svg-muted" font-size="11">label only</text><rect x="340" y="25" width="150" height="55" rx="9" fill="#fde68a"/><text x="415" y="49.5" text-anchor="middle" class="svg-ink" font-size="13">Zone</text><text x="415" y="66.5" text-anchor="middle" class="svg-muted" font-size="11">groups interfaces</text><rect x="505" y="25" width="125" height="55" rx="9" fill="#ddd6fe"/><text x="567.5" y="49.5" text-anchor="middle" class="svg-ink" font-size="13">intrazone</text><text x="567.5" y="66.5" text-anchor="middle" class="svg-muted" font-size="11">allow / deny</text><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">Baayen se banao: interface, label, group, group ke andar ka rule</text></svg><p class="cap">Is module ke chaar building blocks</p></div>
<div class="warn"><p><b>Common mistake.</b> Zone ko security level ya address range samajhna. Yeh sirf interfaces ka policy group hai jisme intrazone rule hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Poocha jaaye ki ek zone ke do VLANs ke beech traffic kyun fail hota hai to jawab intrazone deny hai, routing problem nahi. Poocha jaaye ki zone kya badalta hai to jawab sirf policy grouping hai.</p></div>
<div class="scn"><h4>Segmentation se confidence tak</h4><p>Ek learner jisne sirf ek flat LAN use kiya tha, use clinic segment karne ko kaha gaya. Usne VLAN interfaces banaye, switch par trunk verify kiya, user VLANs ko zone mein group kiya, Medical VLAN ko explicit policies ke saath alag interface rakha, aur intrazone decision document kiya. Review dus minute mein ho gaya kyunki har choice ke paas evidence aur wajah thi.</p><p><b>Lesson:</b> segmentation design plus verification hai, sirf commands nahi.</p></div>
<div class="iv"><p class="q">"FortiGate par VLAN interfaces aur zones ka summary do."</p><p>VLAN interface parent port ka tagged sub-interface hai jiska apna subnet hota hai, vlanid se switch trunk se match hota hai. Roles forwarding badle bina interfaces ko label karte hain. Zone interfaces ko group karta hai taaki ek policy unhe cover kare, members apne addresses rakhte hain, aur intrazone members ke beech ka traffic tay karta hai, default deny. Granular control ke liye alag interfaces aur explicit policies.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VLAN interface = parent + vlanid + IP; switch se match karo.</li>
<li>Roles label karte hain; zones group karte hain; intrazone members ko govern karta hai.</li>
<li>Evidence: sessions, iprope lookup, ARP aur zone settings.</li>
<li>Aage: objects, order aur logging ke liye nse4-policy.</li>
</ul></div>
`}};export{e as default};