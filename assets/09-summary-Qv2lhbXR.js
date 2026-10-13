var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You now know how a Juniper campus runs several spanning trees: MSTP with regions and instances, and VSTP with one tree per VLAN. Use this page as your last review before the JN0-650 exam or an interview.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Explain why a single RSTP tree blocks one uplink for every VLAN and how multiple trees fix it.</li>
<li>Define region, MSTI, IST, CIST and digest, and state the three values that must match.</li>
<li>Configure name, revision, VLAN-to-instance mapping, bridge priorities and edge ports.</li>
<li>Place a different root per instance next to its gateway, with a backup at the next priority.</li>
<li>Recognise a boundary port: (Boundary), MSTR, priorities without the instance number.</li>
<li>Configure VSTP per VLAN, read bridge IDs with the VLAN added, steer one VLAN with port cost.</li>
<li>Apply edge, bpdu-block-on-edge, no-root-port and bpdu-timeout-action in the right places.</li>
<li>Troubleshoot in order: protocol, region, root, root port, cost/edge.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>MSTI</dt><dd>one MSTP instance, a tree for a group of VLANs (1 to 64).</dd>
<dt>IST / CIST</dt><dd>instance 0 inside a region / the tree spanning all regions and RSTP switches.</dd>
<dt>Region</dt><dd>switches with identical name, revision and VLAN-to-instance mapping.</dd>
<dt>Digest</dt><dd>16-byte hash of the mapping, carried in every BPDU.</dd>
<dt>MSTR</dt><dd>master port: the boundary port that is CIST root port, standing for all MSTIs.</dd>
<dt>Extended system ID</dt><dd>instance or VLAN number added to the priority.</dd>
<dt>VSTP</dt><dd>rapid spanning tree per VLAN.</dd>
<dt>Edge port</dt><dd>port to an end host; forwards immediately.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Region match</td><td>name + revision + VLAN mapping (digest)</td></tr>
<tr><td>Unmapped VLANs</td><td>instance 0 (CIST/IST)</td></tr>
<tr><td>Priority steps</td><td>multiples of 4096; lower wins</td></tr>
<tr><td>Port costs</td><td>10M 2000000, 100M 200000, 1G 20000, 10G 2000</td></tr>
<tr><td>Bridge ID displays</td><td>MSTI 2 at 4k = 4098; VLAN 30 at 4k = 4126</td></tr>
<tr><td>Timers</td><td>hello 2 s, max age 20 s, forward delay 15 s, max-hops 20</td></tr>
<tr><td>At a boundary</td><td>only the CIST; every MSTI follows it</td></tr></table>

<h3>Command cheat sheet</h3>
<pre class="code">set protocols mstp configuration-name NK-SURAT
set protocols mstp revision-level 3
set protocols mstp msti 1 vlan 10
set protocols mstp bridge-priority 4k
set protocols mstp msti 1 bridge-priority 4k
set protocols mstp msti 2 interface ge-0/0/1 cost 40000
set protocols mstp interface ge-0/0/2 edge
set protocols vstp vlan V10 bridge-priority 4k
set protocols vstp vlan V20 interface ge-0/0/0 cost 50000
show spanning-tree bridge
show spanning-tree bridge msti 2
show spanning-tree interface msti 2
show spanning-tree interface vlan V20
show spanning-tree mstp configuration</pre>

<div class="warn"><p><b>Last mistakes to avoid.</b> Different revision on one switch; unmapped VLANs on a bad IST root; forgetting a VLAN under VSTP; edge on an uplink; both roots on the same switch.</p></div>
<div class="exam"><p><b>Last exam trap.</b> The questions describe a symptom ("one uplink idle") and ask for the cause. Think region mismatch first for MSTP, and root placement or cost for VSTP.</p></div>

<div class="scn"><h4>A day-two audit</h4><p>A new engineer inherited a campus and wrote one script that ran <code>show spanning-tree mstp configuration</code> on every switch and compared name, revision and digest. It found two switches on revision 0 left from a replacement, which had quietly broken load sharing for months.</p><p><b>Lesson:</b> a small recurring check beats a big outage investigation.</p></div>

<div class="iv"><p class="q">"Summarise how you would design spanning tree for a campus with two distribution switches."</p><p>MSTP with one region, two or three instances grouped by traffic, the root of each instance on the switch hosting its gateways, backups at the next priority, worst priority on access switches, edge and BPDU protection on access ports, root protection on downlinks, loop protection on root and alternate ports, and a documented, identical VLAN mapping on every switch.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Multiple trees reclaim blocked uplinks without losing loop protection.</li>
<li>MSTP is about regions: name, revision, mapping must match everywhere.</li>
<li>VSTP is simple and per VLAN, but costs CPU.</li>
<li>Root placement load shares; cost steers; protections keep it safe.</li>
<li>Troubleshoot in the same five steps every time.</li>
</ul></div>
`,hi:`
<p>Ab aap jaante ho ki Juniper campus kai spanning trees kaise chalata hai: regions aur instances ke saath MSTP, aur har VLAN ke ek tree ke saath VSTP. JN0-650 exam ya interview se pehle yeh aakhri review page hai.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Samjhao ki single RSTP tree har VLAN ke liye ek uplink kyun block karta hai aur multiple trees kaise theek karte hain.</li>
<li>Region, MSTI, IST, CIST aur digest define karo, aur woh teen values batao jo match honi chahiye.</li>
<li>Name, revision, VLAN-to-instance mapping, bridge priorities aur edge ports configure karo.</li>
<li>Har instance ka alag root uske gateway ke paas rakho, next priority par backup ke saath.</li>
<li>Boundary port pehchano: (Boundary), MSTR, instance number ke bina priorities.</li>
<li>VSTP per VLAN configure karo, VLAN juda bridge ID padho, port cost se ek VLAN steer karo.</li>
<li>Edge, bpdu-block-on-edge, no-root-port aur bpdu-timeout-action sahi jagah lagao.</li>
<li>Order mein troubleshoot karo: protocol, region, root, root port, cost/edge.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>MSTI</dt><dd>ek MSTP instance, VLANs ke group ka tree (1 se 64).</dd>
<dt>IST / CIST</dt><dd>region ke andar instance 0 / woh tree jo saare regions aur RSTP switches mein phaila hai.</dd>
<dt>Region</dt><dd>identical name, revision aur VLAN-to-instance mapping wale switches.</dd>
<dt>Digest</dt><dd>mapping ka 16-byte hash, har BPDU mein jaata hai.</dd>
<dt>MSTR</dt><dd>master port: woh boundary port jo CIST root port hai, saare MSTIs ki taraf se.</dd>
<dt>Extended system ID</dt><dd>priority mein juda instance ya VLAN number.</dd>
<dt>VSTP</dt><dd>har VLAN ka rapid spanning tree.</dd>
<dt>Edge port</dt><dd>end host ka port; turant forward karta hai.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Region match</td><td>name + revision + VLAN mapping (digest)</td></tr>
<tr><td>Unmapped VLANs</td><td>instance 0 (CIST/IST)</td></tr>
<tr><td>Priority steps</td><td>4096 ke multiples; chhota jeetta hai</td></tr>
<tr><td>Port costs</td><td>10M 2000000, 100M 200000, 1G 20000, 10G 2000</td></tr>
<tr><td>Bridge ID display</td><td>MSTI 2 mein 4k = 4098; VLAN 30 mein 4k = 4126</td></tr>
<tr><td>Timers</td><td>hello 2 s, max age 20 s, forward delay 15 s, max-hops 20</td></tr>
<tr><td>Boundary par</td><td>sirf CIST; har MSTI use follow karta hai</td></tr></table>

<h3>Command cheat sheet</h3>
<pre class="code">set protocols mstp configuration-name NK-SURAT
set protocols mstp revision-level 3
set protocols mstp msti 1 vlan 10
set protocols mstp bridge-priority 4k
set protocols mstp msti 1 bridge-priority 4k
set protocols mstp msti 2 interface ge-0/0/1 cost 40000
set protocols mstp interface ge-0/0/2 edge
set protocols vstp vlan V10 bridge-priority 4k
set protocols vstp vlan V20 interface ge-0/0/0 cost 50000
show spanning-tree bridge
show spanning-tree bridge msti 2
show spanning-tree interface msti 2
show spanning-tree interface vlan V20
show spanning-tree mstp configuration</pre>

<div class="warn"><p><b>Aakhri galtiyan jinse bachna hai.</b> Ek switch par alag revision; kharab IST root par unmapped VLANs; VSTP mein VLAN list karna bhoolna; uplink par edge; dono roots ek hi switch par.</p></div>
<div class="exam"><p><b>Aakhri exam trap.</b> Sawaal symptom batate hain ("ek uplink idle") aur kaaran poochte hain. MSTP mein pehle region mismatch socho, VSTP mein root placement ya cost.</p></div>

<div class="scn"><h4>Day-two audit</h4><p>Ek naye engineer ko ek campus mila aur usne ek script likhi jo har switch par <code>show spanning-tree mstp configuration</code> chalakar name, revision aur digest compare karti thi. Usne do switches revision 0 par paaye jo replacement se bache the, aur unhone mahino se load sharing chupchaap tod rakhi thi.</p><p><b>Lesson:</b> chhota recurring check bade outage investigation se behtar hai.</p></div>

<div class="iv"><p class="q">"Do distribution switches wale campus ke liye spanning tree design ka summary do."</p><p>Ek region wala MSTP, traffic ke hisaab se group kiye hue do-teen instances, har instance ka root us switch par jahan uske gateways hain, next priority par backups, access switches par worst priority, access ports par edge aur BPDU protection, downlinks par root protection, root aur alternate ports par loop protection, aur har switch par documented, identical VLAN mapping.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Multiple trees loop protection khoye bina blocked uplinks wapas dilate hain.</li>
<li>MSTP regions ke baare mein hai: name, revision, mapping har jagah match.</li>
<li>VSTP simple aur per VLAN hai, par CPU leta hai.</li>
<li>Root placement load share karta hai; cost steer karta hai; protections safe rakhte hain.</li>
<li>Har baar wahi paanch steps se troubleshoot karo.</li>
</ul></div>
`}};export{e as default};