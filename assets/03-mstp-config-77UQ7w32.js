var e={id:`mstp-config`,h:{en:`Configuring MSTP on EX switches`,hi:`EX switches par MSTP configure karna`},body:{en:`
<p>MSTP configuration has four jobs: define the region, map VLANs to instances, choose roots with priorities, and mark the edge. We use the Surat lab: AGG1 and AGG2 are distribution switches, ACC7 is the access switch, VLAN 10 is SALES and VLAN 20 is STORES.</p>

<h3>Step 1 and 2: region and mapping (identical on every switch)</h3>
<pre class="code"><span class="c">! on AGG1, AGG2 and ACC7 - these three lines define the region</span>
set protocols mstp configuration-name NK-SURAT
set protocols mstp revision-level 3
set protocols mstp msti 1 vlan 10
set protocols mstp msti 2 vlan 20
<span class="c">! trunks carry the VLANs; MSTP needs the VLANs to exist</span>
set vlans SALES vlan-id 10
set vlans STORES vlan-id 20
set interfaces ge-0/0/0 unit 0 family ethernet-switching interface-mode trunk vlan members all</pre>
<p><code>msti N vlan</code> accepts VLAN names or IDs, and several VLANs or ranges in one statement. Any VLAN you do not list stays in instance 0. Every switch needs the <b>same</b> statements: the configuration name is case sensitive.</p>

<h3>Step 3: choose the roots</h3>
<pre class="code"><span class="c">! AGG1: root of the CIST/IST and of MSTI 1, backup for MSTI 2</span>
set protocols mstp bridge-priority 4k
set protocols mstp msti 1 bridge-priority 4k
set protocols mstp msti 2 bridge-priority 8k
<span class="c">! AGG2: mirror image</span>
set protocols mstp bridge-priority 8k
set protocols mstp msti 1 bridge-priority 8k
set protocols mstp msti 2 bridge-priority 4k</pre>
<p><code>protocols mstp bridge-priority</code> sets the priority for instance 0 (the CIST/IST). <code>msti N bridge-priority</code> sets it per instance. Values are multiples of 4096: 0, 4k, 8k ... 60k. Lower is better. Always give a <b>second best</b> (8k) to the backup root so a failure moves the root predictably.</p>

<h3>Step 4: edge ports and costs</h3>
<pre class="code">set protocols mstp interface ge-0/0/2 edge
set protocols mstp interface ge-0/0/3 edge
set protocols mstp msti 2 interface ge-0/0/1 cost 40000     <span class="c">! per-instance cost, covered next chapter</span></pre>

<h3>Verification with real output</h3>
<p>This is ACC7 after the lab is fixed. The first command proves the region parameters; the digest is the part to compare between switches.</p>
<pre class="out">lab@ACC7&gt; show spanning-tree mstp configuration

MSTP configuration information
Context identifier       : 0
Region name              : NK-SURAT
Revision                 : 3
Configuration digest     : <span class="hl">0x9357ebb7a8d74dd5fef4f2bab50531aa</span>

MSTI    Member VLANs
   0    1-9,11-19,21-4094
   1    10
   2    20</pre>
<p>Notice how instance 0 shows "everything else". Now the port roles in MSTI 2:</p>
<pre class="out">lab@ACC7&gt; show spanning-tree interface msti 2

Spanning tree interface parameters for MSTI 2

Interface     Port ID  Designated  Designated        Port   State  Role
                       port ID     bridge ID         Cost
ge-0/0/0      128:1    128:2       8194.525426341d00 20000  BLK    <span class="hl">ALT</span>
ge-0/0/1      128:2    128:2       4098.525423341900 20000  FWD    <span class="hl">ROOT</span>
ge-0/0/2      128:3    128:3       32770.52546d020600 20000 FWD    DESG
ge-0/0/3      128:4    128:4       32770.52546d020600 20000 FWD    DESG</pre>
<p>Read it: the designated bridge ID of ge-0/0/1 starts with <b>4098</b> = priority 4096 plus instance 2, so AGG2 is the MSTI 2 root. ge-0/0/0 points at 8194 (AGG1, the 8k backup) and is alternate, blocking. The two edge ports are designated.</p>

<h3>Useful related commands</h3>
<ul>
<li><code>show spanning-tree bridge</code> lists the CIST root, the regional root and each MSTI.</li>
<li><code>show spanning-tree bridge msti 2</code> gives one instance: regional root, root cost, root port.</li>
<li><code>show configuration protocols mstp</code> to check the three region parameters side by side on each switch.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> (1) Typing the VLAN mapping on two of the three switches. (2) Mapping a VLAN to an MSTI but not creating it as a VLAN on the trunk path, so the instance carries nothing. (3) Using a priority that is not a multiple of 4096: the commit is refused. (4) Forgetting that <code>protocols mstp bridge-priority</code> controls only the IST.</p></div>
<div class="exam"><p><b>Exam trap.</b> The command to set the priority of one instance is <code>msti N bridge-priority</code>, not <code>msti N priority</code>. The <i>region name</i> is <code>configuration-name</code>, and revision-level is a number from 0 to 65535 that you bump by hand when you change the mapping everywhere.</p></div>

<div class="scn"><h4>Revision bump during a maintenance window</h4><p>A team moved VLAN 30 from MSTI 1 to MSTI 2 across twelve switches. They changed six, then the window ended. The six changed switches formed a new region by digest (the mapping differed), even though name and revision were unchanged. Traffic still passed, but load sharing vanished at the boundary. The team finished the other six next night and the region re-formed.</p><p><b>Lesson:</b> a mapping change must be applied everywhere in one window; compare digests afterwards, not just names.</p></div>

<div class="iv"><p class="q">"Walk me through configuring MSTP load sharing between two distribution switches."</p><p>Same region name, revision and VLAN mapping on all switches. Give AGG1 the best priority for MSTI 1 and the second best for MSTI 2, mirror it on AGG2, set both to lowest values on the IST too, mark access ports as edge, then verify with <code>show spanning-tree mstp configuration</code> and per-instance interface output that the access switch has a different root port per instance.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Region = <code>configuration-name</code>, <code>revision-level</code>, <code>msti N vlan</code>; identical everywhere.</li>
<li>Priorities in multiples of 4096: <code>bridge-priority</code> for the IST, <code>msti N bridge-priority</code> per instance.</li>
<li>Always configure a backup root with the next-best priority.</li>
<li>Use the digest in <code>show spanning-tree mstp configuration</code> to compare switches.</li>
<li>Designated bridge ID 4098 means priority 4k in instance 2.</li>
</ul></div>
`,hi:`
<p>MSTP configuration ke chaar kaam hain: region define karna, VLANs ko instances mein map karna, priorities se roots chunna, aur edge mark karna. Hum Surat lab use karte hain: AGG1 aur AGG2 distribution switches hain, ACC7 access switch hai, VLAN 10 SALES aur VLAN 20 STORES hai.</p>

<h3>Step 1 aur 2: region aur mapping (har switch par ek jaisi)</h3>
<pre class="code"><span class="c">! AGG1, AGG2 aur ACC7 par - yeh teen lines region define karti hain</span>
set protocols mstp configuration-name NK-SURAT
set protocols mstp revision-level 3
set protocols mstp msti 1 vlan 10
set protocols mstp msti 2 vlan 20
<span class="c">! trunks VLANs carry karte hain; MSTP ke liye VLANs ka exist karna zaroori hai</span>
set vlans SALES vlan-id 10
set vlans STORES vlan-id 20
set interfaces ge-0/0/0 unit 0 family ethernet-switching interface-mode trunk vlan members all</pre>
<p><code>msti N vlan</code> VLAN names ya IDs, aur ek statement mein kai VLANs ya ranges leta hai. Jo VLAN list nahi karte woh instance 0 mein rehta hai. Har switch par <b>wahi</b> statements chahiye: configuration name case sensitive hai.</p>

<h3>Step 3: roots chuno</h3>
<pre class="code"><span class="c">! AGG1: CIST/IST aur MSTI 1 ka root, MSTI 2 ka backup</span>
set protocols mstp bridge-priority 4k
set protocols mstp msti 1 bridge-priority 4k
set protocols mstp msti 2 bridge-priority 8k
<span class="c">! AGG2: ulta</span>
set protocols mstp bridge-priority 8k
set protocols mstp msti 1 bridge-priority 8k
set protocols mstp msti 2 bridge-priority 4k</pre>
<p><code>protocols mstp bridge-priority</code> instance 0 (CIST/IST) ki priority set karta hai. <code>msti N bridge-priority</code> har instance ki. Values 4096 ke multiples: 0, 4k, 8k ... 60k. Chhota behtar. Backup root ko hamesha <b>doosri best</b> (8k) do taaki failure par root predictably shift ho.</p>

<h3>Step 4: edge ports aur costs</h3>
<pre class="code">set protocols mstp interface ge-0/0/2 edge
set protocols mstp interface ge-0/0/3 edge
set protocols mstp msti 2 interface ge-0/0/1 cost 40000     <span class="c">! per-instance cost, agle chapter mein</span></pre>

<h3>Asli output se verification</h3>
<p>Yeh lab theek hone ke baad ACC7 hai. Pehla command region parameters sabit karta hai; switches ke beech digest milana hota hai.</p>
<pre class="out">lab@ACC7&gt; show spanning-tree mstp configuration

MSTP configuration information
Context identifier       : 0
Region name              : NK-SURAT
Revision                 : 3
Configuration digest     : <span class="hl">0x9357ebb7a8d74dd5fef4f2bab50531aa</span>

MSTI    Member VLANs
   0    1-9,11-19,21-4094
   1    10
   2    20</pre>
<p>Dekho instance 0 "baaki sab" dikhata hai. Ab MSTI 2 ke port roles:</p>
<pre class="out">lab@ACC7&gt; show spanning-tree interface msti 2

Spanning tree interface parameters for MSTI 2

Interface     Port ID  Designated  Designated        Port   State  Role
                       port ID     bridge ID         Cost
ge-0/0/0      128:1    128:2       8194.525426341d00 20000  BLK    <span class="hl">ALT</span>
ge-0/0/1      128:2    128:2       4098.525423341900 20000  FWD    <span class="hl">ROOT</span>
ge-0/0/2      128:3    128:3       32770.52546d020600 20000 FWD    DESG
ge-0/0/3      128:4    128:4       32770.52546d020600 20000 FWD    DESG</pre>
<p>Padho: ge-0/0/1 ke designated bridge ID ki shuruaat <b>4098</b> hai = priority 4096 + instance 2, matlab AGG2 MSTI 2 ka root hai. ge-0/0/0 8194 (AGG1, 8k backup) ki taraf hai aur alternate hai, blocking. Do edge ports designated hain.</p>

<h3>Kaam ke related commands</h3>
<ul>
<li><code>show spanning-tree bridge</code> CIST root, regional root aur har MSTI dikhata hai.</li>
<li><code>show spanning-tree bridge msti 2</code> ek instance deta hai: regional root, root cost, root port.</li>
<li><code>show configuration protocols mstp</code> har switch par teeno region parameters side by side check karne ke liye.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> (1) VLAN mapping teen mein se sirf do switches par type karna. (2) VLAN ko MSTI mein map karna par trunk path par VLAN create na karna, to instance kuch carry nahi karta. (3) 4096 ka multiple na hone wali priority: commit refuse hota hai. (4) Yeh bhoolna ki <code>protocols mstp bridge-priority</code> sirf IST ko control karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Ek instance ki priority set karne ka command <code>msti N bridge-priority</code> hai, <code>msti N priority</code> nahi. <i>Region name</i> <code>configuration-name</code> hai, aur revision-level 0 se 65535 ka number hai jo mapping badalne par aap haath se sab jagah badhate ho.</p></div>

<div class="scn"><h4>Maintenance window ke beech revision bump</h4><p>Ek team ne VLAN 30 ko MSTI 1 se MSTI 2 mein baarah switches par move karna tha. Chhe badle, phir window khatam. Badle hue chhe switches ne digest se naya region bana liya (mapping alag thi) jabki name aur revision wahi the. Traffic pass hota raha, par boundary par load sharing gaayab. Team ne agli raat baaki chhe badle aur region phir ban gaya.</p><p><b>Lesson:</b> mapping change ek hi window mein sab jagah lagao; baad mein sirf names nahi, digests compare karo.</p></div>

<div class="iv"><p class="q">"Do distribution switches ke beech MSTP load sharing configure karna samjhao."</p><p>Saare switches par same region name, revision aur VLAN mapping. AGG1 ko MSTI 1 ke liye best priority aur MSTI 2 ke liye second best do, AGG2 par ulta, IST par bhi dono ko sabse chhoti values do, access ports edge mark karo, phir <code>show spanning-tree mstp configuration</code> aur per-instance interface output se verify karo ki access switch ka har instance mein root port alag hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Region = <code>configuration-name</code>, <code>revision-level</code>, <code>msti N vlan</code>; har jagah identical.</li>
<li>Priorities 4096 ke multiples: IST ke liye <code>bridge-priority</code>, har instance ke liye <code>msti N bridge-priority</code>.</li>
<li>Backup root ko hamesha next-best priority do.</li>
<li>Switches compare karne ke liye <code>show spanning-tree mstp configuration</code> ka digest use karo.</li>
<li>Designated bridge ID 4098 matlab instance 2 mein 4k priority.</li>
</ul></div>
`}};export{e as default};