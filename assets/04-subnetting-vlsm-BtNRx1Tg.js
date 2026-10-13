var e={id:`subnetting-vlsm`,h:{en:`Subnetting and VLSM: planning the Nashik office`,hi:`Subnetting aur VLSM: Nashik office ki planning`},body:{en:`
<p><b>Subnetting</b> means cutting one address block into smaller networks. <b>VLSM</b> (variable-length subnet masks) means the pieces can be different sizes, so you do not waste addresses. In the first lab you receive one block, 10.50.0.0/24, and plan the new Nashik office. This chapter shows the method.</p>

<h3>Why not one big network?</h3>
<p>Think of a land plot that you divide among a school, a shop and a gatehouse. You do not give each the same size: the school needs more, the gatehouse almost nothing. A router link between two devices needs only two addresses, but a Sales VLAN may need a hundred. VLSM lets you give each network just enough.</p>

<h3>The four-step method</h3>
<ol><li><b>List the requirements</b> and add a small growth margin.</li>
<li><b>Find the host bits:</b> the smallest n where 2<sup>n</sup> minus 2 is at least the hosts needed.</li>
<li><b>Allocate the largest subnet first,</b> starting at the beginning of the block, then the next largest, and so on. Each subnet must start on a multiple of its block size.</li>
<li><b>Write down</b> network, usable range and broadcast for each.</li></ol>

<h3>Worked plan for the Nashik office</h3>
<p>Requirements: Sales (VLAN SALES) needs 100 hosts, Engineering (VLAN ENG) needs 50 hosts, and the uplink between the EX switch SW1 and the edge router R1 needs 2 addresses.</p>
<table class="cmp"><tr><th>Need</th><th>Host bits</th><th>Prefix</th><th>Network</th><th>Usable range</th><th>Broadcast</th></tr>
<tr><td>Sales: 100 hosts</td><td>7 (126)</td><td>/25</td><td>10.50.0.0</td><td>.1 to .126</td><td>10.50.0.127</td></tr>
<tr><td>Engineering: 50 hosts</td><td>6 (62)</td><td>/26</td><td>10.50.0.128</td><td>.129 to .190</td><td>10.50.0.191</td></tr>
<tr><td>Uplink: 2 hosts</td><td>2 (2)</td><td>/30</td><td>10.50.0.192</td><td>.193 to .194</td><td>10.50.0.195</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="10.50.0.0/24 carved into three subnets">
<rect x="10" y="30" width="320" height="50" rx="6" fill="#bae6fd"/><text x="170" y="52" text-anchor="middle" class="svg-ink" font-size="13">Sales 10.50.0.0/25</text><text x="170" y="70" text-anchor="middle" class="svg-muted" font-size="12">.0 to .127</text>
<rect x="335" y="30" width="160" height="50" rx="6" fill="#bbf7d0"/><text x="415" y="52" text-anchor="middle" class="svg-ink" font-size="13">Eng 10.50.0.128/26</text><text x="415" y="70" text-anchor="middle" class="svg-muted" font-size="12">.128 to .191</text>
<rect x="500" y="30" width="40" height="50" rx="6" fill="#fde68a"/><text x="520" y="103" text-anchor="middle" class="svg-ink" font-size="12">/30</text>
<rect x="545" y="30" width="85" height="50" rx="6" fill="#e2e8f0"/><text x="587" y="60" text-anchor="middle" class="svg-muted" font-size="12">free .196+</text>
<text x="10" y="125" class="svg-muted" font-size="12">.0</text><text x="330" y="125" class="svg-muted" font-size="12">.128</text><text x="495" y="125" class="svg-muted" font-size="12">.192</text><text x="620" y="125" class="svg-muted" font-size="12">.255</text>
</svg><p class="cap">The whole /24 as a bar: /25 + /26 + /30, with room left for growth.</p></div>

<h3>The block-size shortcut</h3>
<p>Block size = 256 minus the mask octet. For /26 the mask octet is 192, so the block size is 64 and subnets start at .0, .64, .128 and .192. The <b>broadcast</b> is the next subnet start minus 1. The <b>first usable</b> is network plus 1 and the <b>last usable</b> is broadcast minus 1. Both the gateway and the hosts must come from the usable range. By convention the gateway takes the first usable address: 10.50.0.1/25 for Sales and 10.50.0.129/26 for Engineering.</p>

<h3>Configuration on the EX switch</h3>
<p>In the lab the VLANs already exist: SALES (id 10) and ENG (id 20), with access ports. You create one IRB (routed VLAN interface) unit per VLAN and bind each VLAN to its unit:</p>
<pre class="code">set interfaces irb unit 10 family inet address 10.50.0.1/25
set interfaces irb unit 20 family inet address 10.50.0.129/26
set vlans SALES l3-interface irb.10
set vlans ENG l3-interface irb.20
commit</pre>
<pre class="out">lab@SW1&gt; show interfaces terse irb
Interface               Admin Link Proto    Local                 Remote
irb                     up    up
<span class="hl">irb.10                  up    up   inet     10.50.0.1/25</span>
<span class="hl">irb.20                  up    up   inet     10.50.0.129/26</span></pre>
<p>The PCs were already addressed from the plan: PC1 is 10.50.0.20/25 with gateway 10.50.0.1 and PC2 is 10.50.0.140/26 with gateway 10.50.0.129. After the commit, both PCs can ping their gateway.</p>

<div class="eg"><p><b>Another example.</b> You need 25 hosts. 2^5 = 32 minus 2 = 30 is enough, so /27 (block size 32). If your block starts at 192.0.2.0, the subnets are .0, .32, .64 and so on; the first subnet runs .1 to .30 with broadcast .31.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Counting the network and broadcast addresses as usable. Allocating the small subnets first and then finding that the big one cannot start on a valid boundary. Forgetting growth: a /26 for exactly 62 hosts leaves no spare address.</p></div>

<div class="exam"><p><b>Exam trap.</b> "How many usable hosts?" always subtracts 2 on ordinary subnets. And "which subnet does 10.50.0.140 belong to?" needs the block size, not guessing.</p></div>

<div class="scn"><h4>The plan that ran out</h4><p>A branch received 192.0.2.0/24 and was split into four equal /26 subnets because it was easy. Later the guest Wi-Fi needed 100 hosts, but no /26 was big enough and the router links were wasting 62 addresses each. A redesign with VLSM used one /25, one /26 and /30 links, and freed room for two more networks.</p><p><b>Lesson:</b> size each subnet to its need, largest first.</p></div>

<div class="iv"><p class="q">"You are given 10.50.0.0/24. Split it for 100, 50 and 2 hosts."</p><p>Sales /25 (10.50.0.0, 126 usable), Engineering /26 (10.50.0.128, 62 usable), link /30 (10.50.0.192). Explain host-bit maths, largest first, boundaries on block-size multiples, and the leftover space 10.50.0.196 onward for growth.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VLSM gives each network just the size it needs; allocate the largest subnet first.</li>
<li>Hosts needed N: find smallest n with 2^n minus 2 at least N.</li>
<li>Block size = 256 minus mask octet; broadcast = next network minus 1.</li>
<li>Nashik plan: 10.50.0.0/25, 10.50.0.128/26 and 10.50.0.192/30.</li>
<li>On EX, give each VLAN an irb unit and bind it with l3-interface.</li>
</ul></div>
`,hi:`
<p><b>Subnetting</b> ka matlab ek address block ko chhote networks mein kaatna. <b>VLSM</b> (variable-length subnet masks) ka matlab tukde alag-alag size ke ho sakte hain, taaki addresses waste na hon. Pehle lab mein aapko ek block, 10.50.0.0/24, milta hai aur aap naye Nashik office ki planning karte ho. Yeh chapter method dikhata hai.</p>

<h3>Ek bada network kyun nahi?</h3>
<p>Ek zameen ka plot socho jo school, dukaan aur gatehouse mein baantna hai. Sabko barabar size nahi dete: school ko zyada chahiye, gatehouse ko bahut kam. Do devices ke beech router link ko sirf do addresses chahiye, lekin Sales VLAN ko sau chahiye ho sakte hain. VLSM har network ko bas utna deta hai jitna chahiye.</p>

<h3>Chaar step ka method</h3>
<ol><li><b>Requirements likho</b> aur thoda growth margin jodo.</li>
<li><b>Host bits nikalo:</b> sabse chhota n jahan 2<sup>n</sup> minus 2, zaroorat se kam na ho.</li>
<li><b>Sabse bada subnet pehle allocate karo,</b> block ki shuruaat se, phir agla bada, aur aise hi. Har subnet apne block size ke multiple par shuru hona chahiye.</li>
<li>Har ek ka <b>network, usable range aur broadcast likho</b>.</li></ol>

<h3>Nashik office ka worked plan</h3>
<p>Requirements: Sales (VLAN SALES) ko 100 hosts, Engineering (VLAN ENG) ko 50 hosts, aur EX switch SW1 aur edge router R1 ke beech uplink ko 2 addresses.</p>
<table class="cmp"><tr><th>Zaroorat</th><th>Host bits</th><th>Prefix</th><th>Network</th><th>Usable range</th><th>Broadcast</th></tr>
<tr><td>Sales: 100 hosts</td><td>7 (126)</td><td>/25</td><td>10.50.0.0</td><td>.1 se .126</td><td>10.50.0.127</td></tr>
<tr><td>Engineering: 50 hosts</td><td>6 (62)</td><td>/26</td><td>10.50.0.128</td><td>.129 se .190</td><td>10.50.0.191</td></tr>
<tr><td>Uplink: 2 hosts</td><td>2 (2)</td><td>/30</td><td>10.50.0.192</td><td>.193 se .194</td><td>10.50.0.195</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="10.50.0.0/24 teen subnets mein">
<rect x="10" y="30" width="320" height="50" rx="6" fill="#bae6fd"/><text x="170" y="52" text-anchor="middle" class="svg-ink" font-size="13">Sales 10.50.0.0/25</text><text x="170" y="70" text-anchor="middle" class="svg-muted" font-size="12">.0 se .127</text>
<rect x="335" y="30" width="160" height="50" rx="6" fill="#bbf7d0"/><text x="415" y="52" text-anchor="middle" class="svg-ink" font-size="13">Eng 10.50.0.128/26</text><text x="415" y="70" text-anchor="middle" class="svg-muted" font-size="12">.128 se .191</text>
<rect x="500" y="30" width="40" height="50" rx="6" fill="#fde68a"/><text x="520" y="103" text-anchor="middle" class="svg-ink" font-size="12">/30</text>
<rect x="545" y="30" width="85" height="50" rx="6" fill="#e2e8f0"/><text x="587" y="60" text-anchor="middle" class="svg-muted" font-size="12">free .196+</text>
<text x="10" y="125" class="svg-muted" font-size="12">.0</text><text x="330" y="125" class="svg-muted" font-size="12">.128</text><text x="495" y="125" class="svg-muted" font-size="12">.192</text><text x="620" y="125" class="svg-muted" font-size="12">.255</text>
</svg><p class="cap">Poora /24 ek bar ki tarah: /25 + /26 + /30, growth ke liye jagah bachi hui.</p></div>

<h3>Block-size shortcut</h3>
<p>Block size = 256 minus mask octet. /26 ke liye mask octet 192 hai, to block size 64 hai aur subnets .0, .64, .128 aur .192 se shuru hote hain. <b>Broadcast</b> agle subnet ki shuruaat minus 1 hai. <b>Pehla usable</b> network plus 1 aur <b>aakhri usable</b> broadcast minus 1. Gateway aur hosts dono usable range se aane chahiye. Convention hai ki gateway pehla usable address leta hai: Sales ke liye 10.50.0.1/25 aur Engineering ke liye 10.50.0.129/26.</p>

<h3>EX switch par configuration</h3>
<p>Lab mein VLANs pehle se hain: SALES (id 10) aur ENG (id 20), access ports ke saath. Aap har VLAN ke liye ek IRB (routed VLAN interface) unit banate ho aur har VLAN ko uske unit se bind karte ho:</p>
<pre class="code">set interfaces irb unit 10 family inet address 10.50.0.1/25
set interfaces irb unit 20 family inet address 10.50.0.129/26
set vlans SALES l3-interface irb.10
set vlans ENG l3-interface irb.20
commit</pre>
<pre class="out">lab@SW1&gt; show interfaces terse irb
Interface               Admin Link Proto    Local                 Remote
irb                     up    up
<span class="hl">irb.10                  up    up   inet     10.50.0.1/25</span>
<span class="hl">irb.20                  up    up   inet     10.50.0.129/26</span></pre>
<p>PCs pehle se plan ke hisaab se address ho chuke hain: PC1 10.50.0.20/25 gateway 10.50.0.1 ke saath aur PC2 10.50.0.140/26 gateway 10.50.0.129 ke saath. Commit ke baad dono PCs apne gateway ko ping kar sakte hain.</p>

<div class="eg"><p><b>Ek aur example.</b> Aapko 25 hosts chahiye. 2^5 = 32 minus 2 = 30 kaafi hai, to /27 (block size 32). Block 192.0.2.0 se shuru ho to subnets .0, .32, .64 aur aise; pehla subnet .1 se .30 tak, broadcast .31.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Network aur broadcast addresses ko usable ginna. Chhote subnets pehle allocate karna aur phir bade subnet ke liye valid boundary na milna. Growth bhoolna: ek /26 exactly 62 hosts ke liye ek bhi spare address nahi chhodta.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kitne usable hosts?" mein aam subnets par hamesha 2 ghatao. Aur "10.50.0.140 kis subnet mein hai?" ke liye block size chahiye, andaaza nahi.</p></div>

<div class="scn"><h4>Jo plan khatam ho gaya</h4><p>Ek branch ko 192.0.2.0/24 mila aur aasaani ke liye chaar barabar /26 subnets mein baant diya gaya. Baad mein guest Wi-Fi ko 100 hosts chahiye the, lekin koi /26 bada nahi tha, aur router links har ek 62 addresses waste kar rahe the. VLSM redesign mein ek /25, ek /26 aur /30 links use hue, aur do aur networks ke liye jagah nikal aayi.</p><p><b>Lesson:</b> har subnet ko uski zaroorat ke hisaab se size karo, sabse bada pehle.</p></div>

<div class="iv"><p class="q">"Aapko 10.50.0.0/24 diya gaya hai. Ise 100, 50 aur 2 hosts ke liye baanto."</p><p>Sales /25 (10.50.0.0, 126 usable), Engineering /26 (10.50.0.128, 62 usable), link /30 (10.50.0.192). Host-bit maths, sabse bada pehle, block-size multiples par boundaries, aur growth ke liye bachi jagah 10.50.0.196 se aage, samjhao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VLSM har network ko bas zaroori size deta hai; sabse bada subnet pehle allocate karo.</li>
<li>N hosts chahiye: sabse chhota n jahan 2^n minus 2, N se kam na ho.</li>
<li>Block size = 256 minus mask octet; broadcast = agla network minus 1.</li>
<li>Nashik plan: 10.50.0.0/25, 10.50.0.128/26 aur 10.50.0.192/30.</li>
<li>EX par har VLAN ko irb unit do aur l3-interface se bind karo.</li>
</ul></div>
`}};export{e as default};