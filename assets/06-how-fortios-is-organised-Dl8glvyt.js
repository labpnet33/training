var e={id:`how-fortios-is-organised`,h:{en:`How FortiOS is organised: GUI and CLI`,hi:`FortiOS kaise organised hai: GUI aur CLI`},body:{en:`
<p>FortiOS is the operating system of every FortiGate. It can be managed through a web <b>GUI</b>, a text <b>CLI</b> (console, SSH or the GUI's CLI console), and an API. Both interfaces edit the same configuration, so learn the GUI menu names for the exam and the CLI for troubleshooting and automation.</p>
<h3>The GUI map</h3>
<table class="cmp"><tr><th>GUI menu</th><th>What lives there</th></tr>
<tr><td>Dashboard</td><td>widgets: system status, sessions, interfaces, top users</td></tr>
<tr><td>Network</td><td>interfaces, DNS, static routes, SD-WAN, routing protocols</td></tr>
<tr><td>Policy &amp; Objects</td><td>firewall policy, addresses, services, schedules, virtual IPs, IP pools</td></tr>
<tr><td>Security Profiles</td><td>antivirus, web filter, application control, IPS, SSL inspection</td></tr>
<tr><td>VPN</td><td>IPsec tunnels, SSL VPN</td></tr>
<tr><td>User &amp; Authentication</td><td>users, groups, LDAP, RADIUS, FSSO</td></tr>
<tr><td>System</td><td>administrators, HA, firmware, settings, certificates</td></tr>
<tr><td>Log &amp; Report</td><td>forward traffic logs, events, reports</td></tr></table>
<h3>The CLI map</h3>
<p>The CLI is a tree. Configuration tables live under a few top-level branches: <code>config system</code> (interfaces, zones, global settings, HA, admins), <code>config router</code> (static routes, OSPF, BGP), <code>config firewall</code> (policy, address, VIP, service), <code>config vpn</code>, <code>config user</code>, <code>config log</code> and the profile branches such as <code>config webfilter</code>. Outside configuration you have three verbs: <code>get</code> (status and runtime), <code>show</code> (configuration) and <code>execute</code> (actions such as ping and reboot), plus <code>diagnose</code> for deep troubleshooting.</p>
<p>You edit a table with <code>config</code>, pick an entry with <code>edit</code>, change values with <code>set</code>, and save with <code>next</code> or <code>end</code>. <b>There is no commit</b>: a change is active when the entry is saved. Real output from the simulator:</p>
<pre class="code">NK-PUNE-FGT # config system zone
NK-PUNE-FGT (zone) # edit LAN-ZONE
new entry 'LAN-ZONE' added
NK-PUNE-FGT (LAN-ZONE) # set interface VLAN10 VLAN20
NK-PUNE-FGT (LAN-ZONE) # next
NK-PUNE-FGT (zone) # end</pre>
<p><code>show</code> prints only values that differ from the default. <code>show full-configuration</code> prints defaults too. Notice that the default <code>intrazone deny</code> is hidden in the first output:</p>
<pre class="out">NK-PUNE-FGT # show system zone
config system zone
    edit "LAN-ZONE"
        set interface "VLAN10" "VLAN20"
    next
end

NK-PUNE-FGT # show full-configuration system zone
config system zone
    edit "LAN-ZONE"
        set description ""
        <span class="hl">set intrazone deny</span>
        set interface "VLAN10" "VLAN20"
    next
end</pre>
<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="GUI and CLI edit the same configuration"><rect x="10" y="55" width="120" height="55" rx="9" fill="#e2e8f0"/><text x="70" y="87.5" text-anchor="middle" class="svg-ink" font-size="13">Administrator</text><line x1="130" y1="70" x2="215" y2="45" stroke="#64748b" stroke-width="2"/><text x="172" y="50" text-anchor="middle" class="svg-accent" font-size="11">GUI</text><line x1="130" y1="95" x2="215" y2="115" stroke="#64748b" stroke-width="2"/><text x="172" y="112" text-anchor="middle" class="svg-accent" font-size="11">CLI</text><rect x="215" y="25" width="190" height="60" rx="9" fill="#bae6fd"/><text x="310" y="52" text-anchor="middle" class="svg-ink" font-size="13">GUI</text><text x="310" y="69" text-anchor="middle" class="svg-muted" font-size="11">port2 / HTTPS</text><rect x="215" y="100" width="190" height="50" rx="9" fill="#fde68a"/><text x="310" y="122" text-anchor="middle" class="svg-ink" font-size="13">CLI</text><text x="310" y="139" text-anchor="middle" class="svg-muted" font-size="11">console / SSH</text><line x1="405" y1="55" x2="470" y2="85" stroke="#64748b" stroke-width="2"/><line x1="405" y1="125" x2="470" y2="95" stroke="#64748b" stroke-width="2"/><rect x="470" y="60" width="150" height="55" rx="9" fill="#bbf7d0"/><text x="545" y="84.5" text-anchor="middle" class="svg-ink" font-size="13">One configuration</text><text x="545" y="101.5" text-anchor="middle" class="svg-muted" font-size="11">no commit</text></svg><p class="cap">GUI and CLI edit the same configuration</p></div>
<ul>
<li>Words can be abbreviated while unique: <code>conf sys glo</code> works. <code>?</code> lists options and <b>Tab</b> completes.</li>
<li><code>set</code> on a list replaces the whole list; <code>append</code> adds one value.</li>
<li>Most hardware has <b>VDOMs</b> (virtual firewalls) off by default; the labs use the single <code>root</code> VDOM.</li>
</ul>
<div class="warn"><p><b>Common mistake.</b> Expecting a commit or save step. FortiOS applies changes immediately. Back up the configuration before big changes and keep a second admin session open so you can undo a mistake.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>show</code> versus <code>get</code>: show prints configuration (non-default only), get prints runtime status or all attributes. For listing state, such as the routing table or system status, use <code>get</code>.</p></div>
<div class="scn"><h4>The missing default</h4><p>An engineer searched the output of <code>show system zone</code> for the word intrazone to check a zone setting, found nothing and wrote "not configured" in his notes. The zone was in fact blocking traffic between its members, because the default value deny is hidden by show. Running <code>show full-configuration</code> revealed the line.</p><p><b>Lesson:</b> know what show hides before concluding that a setting is absent.</p></div>
<div class="iv"><p class="q">"Does FortiOS have a commit like Junos?"</p><p>No. A FortiOS change takes effect when you save the entry with next or end, and nothing is staged. That is why you back up first and why the GUI warns before risky changes. On a clustered FortiGate the change is also synchronised to the peer.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>GUI and CLI edit one configuration; there is no commit.</li>
<li>config / edit / set / next / end is the editing pattern.</li>
<li>show hides defaults; show full-configuration reveals them.</li>
<li>get, show, execute and diagnose are the main non-config verbs.</li>
</ul></div>
`,hi:`
<p>FortiOS har FortiGate ka operating system hai. Ise web <b>GUI</b>, text <b>CLI</b> (console, SSH ya GUI ka CLI console) aur API se manage kar sakte hain. Dono interfaces ek hi configuration edit karte hain, isliye exam ke liye GUI menu names aur troubleshooting aur automation ke liye CLI seekho.</p>
<h3>GUI ka map</h3>
<table class="cmp"><tr><th>GUI menu</th><th>Yahan kya milta hai</th></tr>
<tr><td>Dashboard</td><td>widgets: system status, sessions, interfaces, top users</td></tr>
<tr><td>Network</td><td>interfaces, DNS, static routes, SD-WAN, routing protocols</td></tr>
<tr><td>Policy &amp; Objects</td><td>firewall policy, addresses, services, schedules, virtual IPs, IP pools</td></tr>
<tr><td>Security Profiles</td><td>antivirus, web filter, application control, IPS, SSL inspection</td></tr>
<tr><td>VPN</td><td>IPsec tunnels, SSL VPN</td></tr>
<tr><td>User &amp; Authentication</td><td>users, groups, LDAP, RADIUS, FSSO</td></tr>
<tr><td>System</td><td>administrators, HA, firmware, settings, certificates</td></tr>
<tr><td>Log &amp; Report</td><td>forward traffic logs, events, reports</td></tr></table>
<h3>CLI ka map</h3>
<p>CLI ek tree hai. Configuration tables kuch top-level branches ke neeche rehti hain: <code>config system</code> (interfaces, zones, global settings, HA, admins), <code>config router</code> (static routes, OSPF, BGP), <code>config firewall</code> (policy, address, VIP, service), <code>config vpn</code>, <code>config user</code>, <code>config log</code> aur profile branches jaise <code>config webfilter</code>. Configuration ke bahar teen verbs hain: <code>get</code> (status aur runtime), <code>show</code> (configuration) aur <code>execute</code> (ping aur reboot jaise actions), aur gehre troubleshooting ke liye <code>diagnose</code>.</p>
<p>Aap <code>config</code> se table kholte ho, <code>edit</code> se entry chunte ho, <code>set</code> se values badalte ho, aur <code>next</code> ya <code>end</code> se save karte ho. <b>Commit nahi hota</b>: entry save hote hi change active hota hai. Simulator ka asli output:</p>
<pre class="code">NK-PUNE-FGT # config system zone
NK-PUNE-FGT (zone) # edit LAN-ZONE
new entry 'LAN-ZONE' added
NK-PUNE-FGT (LAN-ZONE) # set interface VLAN10 VLAN20
NK-PUNE-FGT (LAN-ZONE) # next
NK-PUNE-FGT (zone) # end</pre>
<p><code>show</code> sirf woh values dikhata hai jo default se alag hain. <code>show full-configuration</code> defaults bhi dikhata hai. Dhyan do ki default <code>intrazone deny</code> pehle output mein chhupa hua hai:</p>
<pre class="out">NK-PUNE-FGT # show system zone
config system zone
    edit "LAN-ZONE"
        set interface "VLAN10" "VLAN20"
    next
end

NK-PUNE-FGT # show full-configuration system zone
config system zone
    edit "LAN-ZONE"
        set description ""
        <span class="hl">set intrazone deny</span>
        set interface "VLAN10" "VLAN20"
    next
end</pre>
<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="GUI aur CLI ek hi configuration edit karte hain"><rect x="10" y="55" width="120" height="55" rx="9" fill="#e2e8f0"/><text x="70" y="87.5" text-anchor="middle" class="svg-ink" font-size="13">Administrator</text><line x1="130" y1="70" x2="215" y2="45" stroke="#64748b" stroke-width="2"/><text x="172" y="50" text-anchor="middle" class="svg-accent" font-size="11">GUI</text><line x1="130" y1="95" x2="215" y2="115" stroke="#64748b" stroke-width="2"/><text x="172" y="112" text-anchor="middle" class="svg-accent" font-size="11">CLI</text><rect x="215" y="25" width="190" height="60" rx="9" fill="#bae6fd"/><text x="310" y="52" text-anchor="middle" class="svg-ink" font-size="13">GUI</text><text x="310" y="69" text-anchor="middle" class="svg-muted" font-size="11">port2 / HTTPS</text><rect x="215" y="100" width="190" height="50" rx="9" fill="#fde68a"/><text x="310" y="122" text-anchor="middle" class="svg-ink" font-size="13">CLI</text><text x="310" y="139" text-anchor="middle" class="svg-muted" font-size="11">console / SSH</text><line x1="405" y1="55" x2="470" y2="85" stroke="#64748b" stroke-width="2"/><line x1="405" y1="125" x2="470" y2="95" stroke="#64748b" stroke-width="2"/><rect x="470" y="60" width="150" height="55" rx="9" fill="#bbf7d0"/><text x="545" y="84.5" text-anchor="middle" class="svg-ink" font-size="13">Ek configuration</text><text x="545" y="101.5" text-anchor="middle" class="svg-muted" font-size="11">no commit</text></svg><p class="cap">GUI aur CLI ek hi configuration edit karte hain</p></div>
<ul>
<li>Words unique rehne tak abbreviate ho sakte hain: <code>conf sys glo</code> chalta hai. <code>?</code> options dikhata hai aur <b>Tab</b> complete karta hai.</li>
<li>List par <code>set</code> poori list replace karta hai; <code>append</code> ek value jodta hai.</li>
<li>Zyadatar hardware par <b>VDOMs</b> (virtual firewalls) default se off hote hain; labs single <code>root</code> VDOM use karte hain.</li>
</ul>
<div class="warn"><p><b>Common mistake.</b> Commit ya save step ki ummeed rakhna. FortiOS changes turant lagu karta hai. Bade changes se pehle configuration backup lo aur doosra admin session khula rakho taaki galti undo kar sako.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>show</code> versus <code>get</code>: show configuration dikhata hai (sirf non-default), get runtime status ya saare attributes dikhata hai. State ke liye, jaise routing table ya system status, <code>get</code> use karo.</p></div>
<div class="scn"><h4>Chhupa hua default</h4><p>Ek engineer ne zone setting check karne ke liye <code>show system zone</code> ke output mein intrazone word dhoondha, kuch nahi mila aur notes mein "not configured" likh diya. Zone asal mein apne members ke beech traffic block kar raha tha, kyunki default value deny ko show chhupa deta hai. <code>show full-configuration</code> chalane par woh line dikhi.</p><p><b>Lesson:</b> setting absent hai yeh maanne se pehle jaano ki show kya chhupata hai.</p></div>
<div class="iv"><p class="q">"Kya FortiOS mein Junos jaisa commit hota hai?"</p><p>Nahi. FortiOS change tab lagu hota hai jab aap entry ko next ya end se save karte ho, kuch staged nahi hota. Isiliye pehle backup lete hain aur GUI risky changes se pehle warning deta hai. Cluster wale FortiGate par change peer ko bhi synchronise ho jaata hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>GUI aur CLI ek configuration edit karte hain; commit nahi hota.</li>
<li>config / edit / set / next / end editing pattern hai.</li>
<li>show defaults chhupata hai; show full-configuration dikhata hai.</li>
<li>get, show, execute aur diagnose mukhya non-config verbs hain.</li>
</ul></div>
`}};export{e as default};