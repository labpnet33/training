var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with a clerk who remembers which corridor each desk is on, and ended with a campus where VLANs are floors, trunks are lift shafts and IRB is the reception desk. This chapter pulls everything into one page you can revise the night before the exam or an interview.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module map">
<rect x="10" y="40" width="115" height="70" rx="8" fill="#bae6fd"/><text x="67" y="70" text-anchor="middle" class="svg-ink" font-size="13">MAC table</text><text x="67" y="90" text-anchor="middle" class="svg-muted" font-size="11">learn, flood</text>
<rect x="140" y="40" width="115" height="70" rx="8" fill="#bbf7d0"/><text x="197" y="70" text-anchor="middle" class="svg-ink" font-size="13">VLANs</text><text x="197" y="90" text-anchor="middle" class="svg-muted" font-size="11">access ports</text>
<rect x="270" y="40" width="115" height="70" rx="8" fill="#ddd6fe"/><text x="327" y="70" text-anchor="middle" class="svg-ink" font-size="13">Trunks</text><text x="327" y="90" text-anchor="middle" class="svg-muted" font-size="11">802.1Q, native</text>
<rect x="400" y="40" width="115" height="70" rx="8" fill="#fde68a"/><text x="457" y="70" text-anchor="middle" class="svg-ink" font-size="13">IRB</text><text x="457" y="90" text-anchor="middle" class="svg-muted" font-size="11">inter-VLAN</text>
<rect x="530" y="40" width="100" height="70" rx="8" fill="#fed7aa"/><text x="580" y="70" text-anchor="middle" class="svg-ink" font-size="13">Verify</text><text x="580" y="90" text-anchor="middle" class="svg-muted" font-size="11">bottom up</text>
<line x1="125" y1="75" x2="140" y2="75" stroke="#64748b" stroke-width="2"/><line x1="255" y1="75" x2="270" y2="75" stroke="#64748b" stroke-width="2"/><line x1="385" y1="75" x2="400" y2="75" stroke="#64748b" stroke-width="2"/><line x1="515" y1="75" x2="530" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">Next: spanning tree keeps this design loop-free</text>
</svg><p class="cap">The five building blocks of Layer 2 switching on EX.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain learn, forward, flood and filter and read <code>show ethernet-switching table</code>.</li>
<li>I can create VLANs with <code>set vlans NAME vlan-id N</code> and attach access ports on ELS.</li>
<li>I can build a trunk with <code>interface-mode trunk vlan members [ ... ]</code> and set the native VLAN on the physical interface.</li>
<li>I can create IRB units, bind them with <code>l3-interface</code> and explain the Direct and Local routes and the TTL drop.</li>
<li>I can use interface ranges and descriptions on a larger switch.</li>
<li>I can find a trunk, native VLAN or port-mode fault bottom up, fix it and prove it.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Broadcast domain</dt><dd>The set of ports that receive a broadcast; one per VLAN.</dd>
<dt>Access port</dt><dd>One VLAN, untagged frames, for an end device.</dd>
<dt>Trunk port</dt><dd>Many VLANs, tagged frames, between switches.</dd>
<dt>802.1Q</dt><dd>The standard that adds a 4-byte tag with a 12-bit VLAN ID.</dd>
<dt>Native VLAN</dt><dd>VLAN for untagged frames on a trunk; none by default on Junos.</dd>
<dt>IRB</dt><dd>Integrated routing and bridging: the Layer 3 interface of a VLAN (irb.N).</dd>
<dt>ELS</dt><dd>Enhanced Layer 2 Software, the current EX configuration style.</dd>
<dt>MAC move</dt><dd>The same source MAC appears on a different port; the entry is updated.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Valid VLAN IDs</td><td>1 to 4094 (12 bits)</td></tr>
<tr><td>Default VLAN</td><td><code>default</code>, ID 1</td></tr>
<tr><td>MAC age-out default</td><td>300 seconds</td></tr>
<tr><td>Tag size</td><td>4 bytes, TPID 0x8100</td></tr>
<tr><td>Default native VLAN on a Junos trunk</td><td>None; untagged frames are dropped</td></tr>
<tr><td>Where <code>native-vlan-id</code> goes</td><td>Physical interface, not unit 0</td></tr>
<tr><td>IRB binding</td><td><code>set vlans NAME l3-interface irb.N</code></td></tr>
<tr><td>Routed TTL</td><td>Decreases by one per Layer 3 hop</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">show interfaces terse
show vlans
show ethernet-switching table
show ethernet-switching interface ge-0/0/0 detail
show interfaces terse irb
show route
show system commit
clear ethernet-switching table</pre>

<div class="eg"><p><b>Worked example: a 60-second self test.</b> A PC in VLAN 20 on ge-0/0/5 cannot reach 10.10.20.1. Which three checks, in which order? Answer: <code>show interfaces terse ge-0/0/5</code> (link), <code>show ethernet-switching interface ge-0/0/5 detail</code> (access, VLAN 20, untagged), then <code>show interfaces terse irb</code> (is irb.20 up).</p></div>

<div class="warn"><p><b>Last-minute reminders.</b> A VLAN is not a subnet. A trunk that carries the VLAN on one end only does not carry it. Native VLAN differences cause silent faults. Always <code>show | compare</code> before <code>commit</code>.</p></div>
<div class="exam"><p><b>Exam trap summary.</b> ELS versus legacy keywords (<code>interface-mode</code> and <code>l3-interface irb.N</code> are ELS), no default native VLAN, and the fact that IRB is up only when a port in the VLAN is up.</p></div>

<div class="scn"><h4>From ticket to proof in four commands</h4><p>A new branch switch was installed and the first desk could not get an address. The engineer ran <code>show interfaces terse</code> (link up), <code>show ethernet-switching interface</code> (port in default VLAN, not in USERS), fixed the VLAN membership, and confirmed with <code>show ethernet-switching table</code> that the PC's MAC appeared in USERS.</p><p><b>Lesson:</b> a short, repeatable method beats clever guessing.</p></div>

<div class="iv"><p class="q">"Walk me through building a two-VLAN campus access layer on Junos."</p><p>Define the VLANs by name and ID, put user ports in access mode in the right VLAN, build a trunk to the distribution switch carrying both VLANs with an agreed native VLAN, create an IRB per VLAN on the distribution switch bound with <code>l3-interface</code>, point hosts to the IRB addresses and verify bottom up with <code>show vlans</code>, <code>show ethernet-switching interface</code>, the MAC table and a ping across VLANs showing TTL 63.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MAC learning, VLANs, trunks and IRB are the four ideas behind every campus switch design.</li>
<li>On Junos a trunk has no native VLAN unless you configure one on both ends.</li>
<li>IRB gives each VLAN a gateway and routes with TTL decreased by one.</li>
<li>Verify bottom up and fix against the design.</li>
<li>Next module: Spanning Tree, which keeps redundant links from creating loops.</li>
</ul></div>
`,hi:`
<p>Aapne shuruat ki ek clerk se jo yaad rakhta hai ki har desk kis corridor mein hai, aur ab aap us campus tak pahunch gaye jahan VLANs floors hain, trunks lift shafts hain aur IRB reception desk hai. Yeh chapter sab kuch ek page mein samet deta hai jo aap exam ya interview se pehle ki raat revise kar sakte ho.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module map">
<rect x="10" y="40" width="115" height="70" rx="8" fill="#bae6fd"/><text x="67" y="70" text-anchor="middle" class="svg-ink" font-size="13">MAC table</text><text x="67" y="90" text-anchor="middle" class="svg-muted" font-size="11">learn, flood</text>
<rect x="140" y="40" width="115" height="70" rx="8" fill="#bbf7d0"/><text x="197" y="70" text-anchor="middle" class="svg-ink" font-size="13">VLANs</text><text x="197" y="90" text-anchor="middle" class="svg-muted" font-size="11">access ports</text>
<rect x="270" y="40" width="115" height="70" rx="8" fill="#ddd6fe"/><text x="327" y="70" text-anchor="middle" class="svg-ink" font-size="13">Trunks</text><text x="327" y="90" text-anchor="middle" class="svg-muted" font-size="11">802.1Q, native</text>
<rect x="400" y="40" width="115" height="70" rx="8" fill="#fde68a"/><text x="457" y="70" text-anchor="middle" class="svg-ink" font-size="13">IRB</text><text x="457" y="90" text-anchor="middle" class="svg-muted" font-size="11">inter-VLAN</text>
<rect x="530" y="40" width="100" height="70" rx="8" fill="#fed7aa"/><text x="580" y="70" text-anchor="middle" class="svg-ink" font-size="13">Verify</text><text x="580" y="90" text-anchor="middle" class="svg-muted" font-size="11">neeche se upar</text>
<line x1="125" y1="75" x2="140" y2="75" stroke="#64748b" stroke-width="2"/><line x1="255" y1="75" x2="270" y2="75" stroke="#64748b" stroke-width="2"/><line x1="385" y1="75" x2="400" y2="75" stroke="#64748b" stroke-width="2"/><line x1="515" y1="75" x2="530" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">Agla: spanning tree is design ko loop-free rakhta hai</text>
</svg><p class="cap">EX par Layer 2 switching ke paanch building blocks.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main learn, forward, flood aur filter samjha sakta hoon aur <code>show ethernet-switching table</code> padh sakta hoon.</li>
<li>Main ELS par <code>set vlans NAME vlan-id N</code> se VLANs bana sakta hoon aur access ports jod sakta hoon.</li>
<li>Main <code>interface-mode trunk vlan members [ ... ]</code> se trunk bana sakta hoon aur physical interface par native VLAN set kar sakta hoon.</li>
<li>Main IRB units bana sakta hoon, <code>l3-interface</code> se bind kar sakta hoon aur Direct, Local routes tatha TTL drop samjha sakta hoon.</li>
<li>Main bade switch par interface ranges aur descriptions use kar sakta hoon.</li>
<li>Main trunk, native VLAN ya port-mode fault neeche se upar dhoondh, theek aur saabit kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Broadcast domain</dt><dd>Un ports ka set jo broadcast receive karte hain; har VLAN ka ek.</dd>
<dt>Access port</dt><dd>Ek VLAN, untagged frames, end device ke liye.</dd>
<dt>Trunk port</dt><dd>Kai VLANs, tagged frames, switches ke beech.</dd>
<dt>802.1Q</dt><dd>Woh standard jo 12-bit VLAN ID ke saath 4-byte tag jodta hai.</dd>
<dt>Native VLAN</dt><dd>Trunk par untagged frames ka VLAN; Junos par default mein koi nahi.</dd>
<dt>IRB</dt><dd>Integrated routing and bridging: VLAN ka Layer 3 interface (irb.N).</dd>
<dt>ELS</dt><dd>Enhanced Layer 2 Software, EX ki current configuration style.</dd>
<dt>MAC move</dt><dd>Wahi source MAC doosre port par dikhta hai; entry update ho jaati hai.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Valid VLAN IDs</td><td>1 se 4094 (12 bits)</td></tr>
<tr><td>Default VLAN</td><td><code>default</code>, ID 1</td></tr>
<tr><td>MAC age-out default</td><td>300 seconds</td></tr>
<tr><td>Tag size</td><td>4 bytes, TPID 0x8100</td></tr>
<tr><td>Junos trunk par default native VLAN</td><td>Koi nahi; untagged frames drop hote hain</td></tr>
<tr><td><code>native-vlan-id</code> kahan jaata hai</td><td>Physical interface par, unit 0 par nahi</td></tr>
<tr><td>IRB binding</td><td><code>set vlans NAME l3-interface irb.N</code></td></tr>
<tr><td>Routed TTL</td><td>Har Layer 3 hop par ek kam</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">show interfaces terse
show vlans
show ethernet-switching table
show ethernet-switching interface ge-0/0/0 detail
show interfaces terse irb
show route
show system commit
clear ethernet-switching table</pre>

<div class="eg"><p><b>Worked example: 60 second ka self test.</b> ge-0/0/5 par VLAN 20 ka PC 10.10.20.1 tak nahi pahunch raha. Kaunse teen checks, kis order mein? Jawab: <code>show interfaces terse ge-0/0/5</code> (link), <code>show ethernet-switching interface ge-0/0/5 detail</code> (access, VLAN 20, untagged), phir <code>show interfaces terse irb</code> (irb.20 up hai ya nahi).</p></div>

<div class="warn"><p><b>Aakhri minute ke reminders.</b> VLAN subnet nahi hai. Jo trunk VLAN ko sirf ek end par carry kare, woh use carry nahi karta. Native VLAN ke differences silent faults banate hain. <code>commit</code> se pehle hamesha <code>show | compare</code>.</p></div>
<div class="exam"><p><b>Exam trap summary.</b> ELS versus legacy keywords (<code>interface-mode</code> aur <code>l3-interface irb.N</code> ELS hain), koi default native VLAN nahi, aur IRB tabhi up hota hai jab VLAN ka koi port up ho.</p></div>

<div class="scn"><h4>Ticket se saboot tak chaar commands mein</h4><p>Naya branch switch lagaya gaya aur pehla desk address nahi le pa raha tha. Engineer ne <code>show interfaces terse</code> (link up), <code>show ethernet-switching interface</code> (port default VLAN mein, USERS mein nahi) chalaya, VLAN membership theek ki, aur <code>show ethernet-switching table</code> se confirm kiya ki PC ka MAC USERS mein dikha.</p><p><b>Lesson:</b> chhota, dohraya ja sakne wala method hoshiyari bhare andaaze se behtar hai.</p></div>

<div class="iv"><p class="q">"Junos par do-VLAN campus access layer banane ka tareeka samjhao."</p><p>VLANs naam aur ID se define karo, user ports ko sahi VLAN mein access mode mein daalo, distribution switch tak dono VLANs wala trunk banao agreed native VLAN ke saath, distribution switch par har VLAN ke liye IRB banao aur <code>l3-interface</code> se bind karo, hosts ko IRB addresses par point karo, aur <code>show vlans</code>, <code>show ethernet-switching interface</code>, MAC table aur VLANs ke paar TTL 63 dikhane wale ping se neeche se upar verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MAC learning, VLANs, trunks aur IRB har campus switch design ke peeche ke chaar ideas hain.</li>
<li>Junos par trunk ka native VLAN tabhi hota hai jab aap dono ends par configure karo.</li>
<li>IRB har VLAN ko gateway deta hai aur TTL ek kam karke route karta hai.</li>
<li>Neeche se upar verify karo aur design ke hisaab se fix karo.</li>
<li>Agla module: Spanning Tree, jo redundant links ko loops banane se rokta hai.</li>
</ul></div>
`}};export{e as default};