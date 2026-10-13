var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: the two labs, step by step`,hi:`Troubleshooting workflow: dono labs, step by step`},body:{en:`
<p>When someone says "the uplink is idle" or "VLAN 20 goes the wrong way", do not guess. Use the same five questions every time.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Five question workflow">
<rect x="10" y="40" width="112" height="60" rx="10" fill="#bae6fd"/><text x="66" y="66" text-anchor="middle" class="svg-ink" font-size="12">1 Which</text><text x="66" y="84" text-anchor="middle" class="svg-ink" font-size="12">protocol?</text>
<rect x="136" y="40" width="112" height="60" rx="10" fill="#bbf7d0"/><text x="192" y="66" text-anchor="middle" class="svg-ink" font-size="12">2 Same</text><text x="192" y="84" text-anchor="middle" class="svg-ink" font-size="12">region?</text>
<rect x="262" y="40" width="112" height="60" rx="10" fill="#ddd6fe"/><text x="318" y="66" text-anchor="middle" class="svg-ink" font-size="12">3 Who is</text><text x="318" y="84" text-anchor="middle" class="svg-ink" font-size="12">root?</text>
<rect x="388" y="40" width="112" height="60" rx="10" fill="#fde68a"/><text x="444" y="66" text-anchor="middle" class="svg-ink" font-size="12">4 Which port</text><text x="444" y="84" text-anchor="middle" class="svg-ink" font-size="12">is root?</text>
<rect x="514" y="40" width="112" height="60" rx="10" fill="#fed7aa"/><text x="570" y="66" text-anchor="middle" class="svg-ink" font-size="12">5 Cost and</text><text x="570" y="84" text-anchor="middle" class="svg-ink" font-size="12">edge?</text>
<line x1="122" y1="70" x2="136" y2="70" stroke="#64748b" stroke-width="2"/><line x1="248" y1="70" x2="262" y2="70" stroke="#64748b" stroke-width="2"/><line x1="374" y1="70" x2="388" y2="70" stroke="#64748b" stroke-width="2"/><line x1="500" y1="70" x2="514" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Protocol, region, root, root port, cost: always in this order.</p></div>

<table class="cmp"><tr><th>Question</th><th>Command</th><th>You are looking for</th></tr>
<tr><td>1. Which protocol runs?</td><td><code>show spanning-tree bridge</code></td><td>"Enabled protocol: MSTP" or "VSTP"</td></tr>
<tr><td>2. Same region? (MSTP)</td><td><code>show spanning-tree mstp configuration</code></td><td>name, revision, digest equal on all switches</td></tr>
<tr><td>3. Who is root of the tree in question?</td><td><code>show spanning-tree bridge msti N</code> / <code>vlan X</code></td><td>Root ID with the intended priority</td></tr>
<tr><td>4. Which port is root?</td><td><code>show spanning-tree interface msti N</code> / <code>vlan X</code></td><td>different ROOT port per instance or VLAN</td></tr>
<tr><td>5. Cost, edge, Boundary?</td><td>same, plus <code>show configuration protocols</code></td><td>Port Cost values, (Boundary), edge on access ports</td></tr></table>

<h3>Lab 1: MSTP load sharing that never happened</h3>
<p><b>Ticket.</b> Monitoring shows all traffic on ACC7's uplink to AGG1; the link to AGG2 is idle. AGG1 should root MSTI 1, AGG2 MSTI 2.</p>
<p><b>Step 1-2.</b> Region check on both sides shows revision 4 on ACC7 and revision 3 on AGG1, with an identical digest. The interface output shows <code>MSTR (Boundary)</code> and <code>ALT (Boundary)</code> (chapter 5). <b>Fix:</b> <code>set protocols mstp revision-level 3</code> on ACC7.</p>
<p><b>Step 3.</b> Once the region is healed, the next question is who roots MSTI 2. In the lab AGG2 starts with 16k in MSTI 2 and AGG1 with 8k, so AGG1 would win it. Set <code>msti 2 bridge-priority 4k</code> on AGG2 so it beats AGG1's 8k. After the commit AGG2's own output confirms the root:</p>
<pre class="out">lab@AGG2&gt; show spanning-tree bridge msti 2
STP bridge parameters for MSTI 2
  MSTI regional root                : <span class="hl">4098.52:54:23:34:19:00</span>
  Local parameters
    Bridge ID                       : <span class="hl">4098.52:54:23:34:19:00</span>
    Extended system ID              : 2</pre>
<p>Regional root equals Bridge ID, so AGG2 is root of MSTI 2. <b>Step 4-5.</b> On ACC7, MSTI 1 shows ge-0/0/0 as ROOT and MSTI 2 shows ge-0/0/1 as ROOT, with root cost 20000 (one 1G hop). Both PCs ping their gateways.</p>

<h3>Lab 2: VSTP root for every VLAN</h3>
<p><b>Ticket.</b> Nobody set priorities. Put each VLAN's root next to its gateway, then steer only V20 through DIST-B.</p>
<ol>
<li><b>Who is root of V30?</b> <code>show spanning-tree bridge vlan V30</code> shows Root ID equals Bridge ID: ACC-3 (32798).</li>
<li><b>Set roots.</b> DIST-A 4k in V10 and V20, 8k in V30; DIST-B the opposite for V30.</li>
<li><b>Check ACC-3.</b> V10 root port ge-0/0/0, V30 root port ge-0/0/1.</li>
<li><b>Steer V20.</b> <code>set protocols vstp vlan V20 interface ge-0/0/0 cost 50000</code> on ACC-3. V20 root port becomes ge-0/0/1, V10 stays on ge-0/0/0, DIST-A remains V20 root.</li>
<li><b>Confirm.</b> The port-cost column of <code>show spanning-tree interface vlan V20</code> shows 50000 for ge-0/0/0 (ALT, BLK); root cost is 40000.</li>
</ol>

<h3>Other symptoms and where to look</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th></tr>
<tr><td>Frequent MAC flushing, brief outages</td><td>flapping link or edge port not set as edge; check topology change time</td></tr>
<tr><td>Wrong switch is root</td><td>default priority on a new switch; missing priority on one instance</td></tr>
<tr><td>VLAN has no connectivity on one trunk</td><td>VLAN not on the trunk or not listed in VSTP/MSTI mapping; port forwarding state per VLAN: <code>show ethernet-switching interface</code></td></tr>
<tr><td>Port is blocking but should forward</td><td>root-port election by cost, or protection feature triggered</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> Reading only the CIST output and missing MSTI behaviour. Fixing the symptom with cost when the cause is a region mismatch. Changing two things at once and not knowing which one worked; use <code>commit confirmed</code> for risky spanning-tree changes on remote switches.</p></div>
<div class="exam"><p><b>Exam trap.</b> In output, designated bridge IDs with the instance or VLAN number added identify the tree: 4098 is instance 2, 4116 is VLAN 20. Priorities without that addition mean you are looking at the CIST.</p></div>

<div class="scn"><h4>Maintenance window rescued by commit confirmed</h4><p>An engineer raised a port cost on a remote access switch to move a VLAN. The wrong port was chosen and the management VLAN lost its only path. Because the change was made with <code>commit confirmed 5</code>, the switch rolled back automatically and the site stayed reachable.</p><p><b>Lesson:</b> use confirmed commits for spanning-tree changes on remote devices.</p></div>

<div class="iv"><p class="q">"You are told the access switch only uses one uplink. How do you troubleshoot?"</p><p>First I check the protocol and, for MSTP, whether the switch is in the same region as the distribution switches: name, revision and digest, and I look for Boundary on the ports. Then I check the root of each instance or VLAN and whether the access switch has a different root port per tree. Only then do I look at port costs and protection features.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use five questions in order: protocol, region, root, root port, cost/edge.</li>
<li>Boundary in the output means a region mismatch; compare name, revision and digest.</li>
<li>Instance or VLAN numbers in the bridge ID identify the tree you are reading.</li>
<li>Steer a VLAN with a cost on the access switch before moving a root.</li>
<li>Use <code>commit confirmed</code> on remote spanning-tree changes.</li>
</ul></div>
`,hi:`
<p>Koi kahe "uplink idle hai" ya "VLAN 20 galat raaste jaa raha hai", to andaza mat lagao. Har baar yahi paanch sawaal use karo.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Paanch sawaal workflow">
<rect x="10" y="40" width="112" height="60" rx="10" fill="#bae6fd"/><text x="66" y="66" text-anchor="middle" class="svg-ink" font-size="12">1 Kaunsa</text><text x="66" y="84" text-anchor="middle" class="svg-ink" font-size="12">protocol?</text>
<rect x="136" y="40" width="112" height="60" rx="10" fill="#bbf7d0"/><text x="192" y="66" text-anchor="middle" class="svg-ink" font-size="12">2 Same</text><text x="192" y="84" text-anchor="middle" class="svg-ink" font-size="12">region?</text>
<rect x="262" y="40" width="112" height="60" rx="10" fill="#ddd6fe"/><text x="318" y="66" text-anchor="middle" class="svg-ink" font-size="12">3 Root</text><text x="318" y="84" text-anchor="middle" class="svg-ink" font-size="12">kaun?</text>
<rect x="388" y="40" width="112" height="60" rx="10" fill="#fde68a"/><text x="444" y="66" text-anchor="middle" class="svg-ink" font-size="12">4 Root port</text><text x="444" y="84" text-anchor="middle" class="svg-ink" font-size="12">kaunsa?</text>
<rect x="514" y="40" width="112" height="60" rx="10" fill="#fed7aa"/><text x="570" y="66" text-anchor="middle" class="svg-ink" font-size="12">5 Cost aur</text><text x="570" y="84" text-anchor="middle" class="svg-ink" font-size="12">edge?</text>
<line x1="122" y1="70" x2="136" y2="70" stroke="#64748b" stroke-width="2"/><line x1="248" y1="70" x2="262" y2="70" stroke="#64748b" stroke-width="2"/><line x1="374" y1="70" x2="388" y2="70" stroke="#64748b" stroke-width="2"/><line x1="500" y1="70" x2="514" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Protocol, region, root, root port, cost: hamesha isi order mein.</p></div>

<table class="cmp"><tr><th>Sawaal</th><th>Command</th><th>Kya dhoondna hai</th></tr>
<tr><td>1. Kaunsa protocol chal raha hai?</td><td><code>show spanning-tree bridge</code></td><td>"Enabled protocol: MSTP" ya "VSTP"</td></tr>
<tr><td>2. Same region? (MSTP)</td><td><code>show spanning-tree mstp configuration</code></td><td>name, revision, digest saare switches par barabar</td></tr>
<tr><td>3. Is tree ka root kaun?</td><td><code>show spanning-tree bridge msti N</code> / <code>vlan X</code></td><td>Root ID intended priority ke saath</td></tr>
<tr><td>4. Kaunsa port root hai?</td><td><code>show spanning-tree interface msti N</code> / <code>vlan X</code></td><td>har instance ya VLAN mein alag ROOT port</td></tr>
<tr><td>5. Cost, edge, Boundary?</td><td>wahi, plus <code>show configuration protocols</code></td><td>Port Cost values, (Boundary), access ports par edge</td></tr></table>

<h3>Lab 1: MSTP load sharing jo kabhi hua hi nahi</h3>
<p><b>Ticket.</b> Monitoring mein saara traffic ACC7 ke AGG1 wale uplink par hai; AGG2 wala link khaali. AGG1 ko MSTI 1 ka aur AGG2 ko MSTI 2 ka root hona chahiye.</p>
<p><b>Step 1-2.</b> Dono taraf region check karne par ACC7 par revision 4 aur AGG1 par revision 3 dikhta hai, digest identical. Interface output mein <code>MSTR (Boundary)</code> aur <code>ALT (Boundary)</code> hai (chapter 5). <b>Fix:</b> ACC7 par <code>set protocols mstp revision-level 3</code>.</p>
<p><b>Step 3.</b> Region theek hone ke baad agla sawaal: MSTI 2 ka root kaun? Lab mein AGG2 MSTI 2 mein 16k se aur AGG1 8k se shuru hota hai, to AGG1 jeet jaata. AGG2 par <code>msti 2 bridge-priority 4k</code> set karo taaki woh AGG1 ke 8k ko harae. Commit ke baad AGG2 ka apna output root confirm karta hai:</p>
<pre class="out">lab@AGG2&gt; show spanning-tree bridge msti 2
STP bridge parameters for MSTI 2
  MSTI regional root                : <span class="hl">4098.52:54:23:34:19:00</span>
  Local parameters
    Bridge ID                       : <span class="hl">4098.52:54:23:34:19:00</span>
    Extended system ID              : 2</pre>
<p>Regional root = Bridge ID, yaani AGG2 MSTI 2 ka root hai. <b>Step 4-5.</b> ACC7 par MSTI 1 mein ge-0/0/0 ROOT aur MSTI 2 mein ge-0/0/1 ROOT dikhta hai, root cost 20000 (ek 1G hop). Dono PCs apne gateways ko ping karte hain.</p>

<h3>Lab 2: har VLAN ke liye VSTP root</h3>
<p><b>Ticket.</b> Kisi ne priorities set nahi kin. Har VLAN ka root uske gateway ke paas rakho, phir sirf V20 ko DIST-B se guzaro.</p>
<ol>
<li><b>V30 ka root kaun?</b> <code>show spanning-tree bridge vlan V30</code> mein Root ID = Bridge ID: ACC-3 (32798).</li>
<li><b>Roots set karo.</b> DIST-A V10 aur V20 mein 4k, V30 mein 8k; DIST-B V30 ke liye ulta.</li>
<li><b>ACC-3 check karo.</b> V10 ka root port ge-0/0/0, V30 ka root port ge-0/0/1.</li>
<li><b>V20 steer karo.</b> ACC-3 par <code>set protocols vstp vlan V20 interface ge-0/0/0 cost 50000</code>. V20 ka root port ge-0/0/1 ban jaata hai, V10 ge-0/0/0 par rehta hai, DIST-A V20 ka root bana rehta hai.</li>
<li><b>Confirm karo.</b> <code>show spanning-tree interface vlan V20</code> ke port-cost column mein ge-0/0/0 ke liye 50000 (ALT, BLK); root cost 40000.</li>
</ol>

<h3>Doosre symptoms aur kahan dekhna hai</h3>
<table class="cmp"><tr><th>Symptom</th><th>Sambhav kaaran</th></tr>
<tr><td>Baar-baar MAC flush, chhote outages</td><td>flapping link ya edge port edge mark nahi; topology change time dekho</td></tr>
<tr><td>Galat switch root hai</td><td>naye switch par default priority; ek instance par priority missing</td></tr>
<tr><td>Ek trunk par VLAN ka connectivity nahi</td><td>VLAN trunk par nahi ya VSTP/MSTI mapping mein nahi; per-VLAN state: <code>show ethernet-switching interface</code></td></tr>
<tr><td>Port blocking hai par forward karna chahiye</td><td>cost se root-port election, ya protection feature trigger hua</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> Sirf CIST output padhna aur MSTI behaviour miss karna. Region mismatch asal kaaran ho aur cost se symptom theek karna. Do cheezein ek saath badalna aur pata na chalna kaunsi chali; remote switches par risky spanning-tree changes ke liye <code>commit confirmed</code> use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Output mein instance ya VLAN number juda hua designated bridge ID tree ko pehchanta hai: 4098 instance 2 hai, 4116 VLAN 20. Bina us addition ke priorities matlab aap CIST dekh rahe ho.</p></div>

<div class="scn"><h4>Maintenance window jo commit confirmed ne bachayi</h4><p>Ek engineer ne remote access switch par VLAN move karne ke liye port cost badhaya. Galat port chuna gaya aur management VLAN ka akela path chala gaya. Change <code>commit confirmed 5</code> se kiya tha, isliye switch automatic rollback ho gaya aur site reachable raha.</p><p><b>Lesson:</b> remote devices par spanning-tree changes ke liye confirmed commits use karo.</p></div>

<div class="iv"><p class="q">"Bataya gaya ki access switch sirf ek uplink use kar raha hai. Troubleshoot kaise karoge?"</p><p>Pehle protocol check karta hoon aur MSTP mein yeh ki switch distribution switches ke same region mein hai ya nahi: name, revision aur digest, aur ports par Boundary dekhta hoon. Phir har instance ya VLAN ka root aur access switch ka har tree mein alag root port dekhta hoon. Uske baad hi port costs aur protection features dekhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch sawaal order mein: protocol, region, root, root port, cost/edge.</li>
<li>Output mein Boundary matlab region mismatch; name, revision aur digest compare karo.</li>
<li>Bridge ID mein instance ya VLAN number batata hai kaunsa tree padh rahe ho.</li>
<li>Root hilane se pehle access switch par cost se VLAN steer karo.</li>
<li>Remote spanning-tree changes par <code>commit confirmed</code> use karo.</li>
</ul></div>
`}};export{e as default};