var e={id:`region-boundaries`,h:{en:`Region boundaries, mismatches and interoperability`,hi:`Region boundaries, mismatches aur interoperability`},body:{en:`
<p>This is the most tested MSTP topic and the most common real failure. A switch whose region name, revision level or VLAN mapping differs forms <b>its own region</b>. The links between the regions are <b>boundary ports</b>. Nothing breaks visibly: the network stays loop-free and pings succeed. What disappears is the load sharing.</p>

<h3>What happens at a boundary</h3>
<p>Across a boundary the two sides cannot trust each other's MSTI information, so only the <b>CIST</b> is exchanged. Every MSTI on the boundary port simply copies the CIST role of that port. A port that is CIST root port becomes <b>master port</b> (shown as MSTR) for all MSTIs: all instances therefore forward over the same uplink, and the other uplink is alternate for all instances.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Boundary collapses MSTIs">
<rect x="30" y="20" width="400" height="80" rx="12" fill="#e2e8f0"/><text x="230" y="40" text-anchor="middle" class="svg-ink" font-size="13">Region NK-SURAT revision 3</text>
<rect x="60" y="52" width="80" height="34" rx="8" fill="#bae6fd"/><text x="100" y="74" text-anchor="middle" class="svg-ink" font-size="12">AGG1</text>
<rect x="320" y="52" width="80" height="34" rx="8" fill="#bae6fd"/><text x="360" y="74" text-anchor="middle" class="svg-ink" font-size="12">AGG2</text>
<line x1="140" y1="69" x2="320" y2="69" stroke="#64748b" stroke-width="2"/>
<rect x="470" y="110" width="150" height="80" rx="12" fill="#fde68a"/><text x="545" y="130" text-anchor="middle" class="svg-ink" font-size="12">Region NK-SURAT rev 4</text>
<rect x="500" y="148" width="90" height="34" rx="8" fill="#bbf7d0"/><text x="545" y="170" text-anchor="middle" class="svg-ink" font-size="12">ACC7</text>
<line x1="100" y1="86" x2="500" y2="155" stroke="#16a34a" stroke-width="3"/><text x="250" y="150" class="svg-accent" font-size="12">MSTR (Boundary): all MSTIs</text>
<line x1="360" y1="86" x2="510" y2="150" stroke="#ef4444" stroke-width="2" stroke-dasharray="5 4"/><text x="400" y="125" class="svg-muted" font-size="11">ALT for all MSTIs</text>
</svg><p class="cap">One revision number different: every instance now uses the same single uplink.</p></div>

<h3>Real output: the broken Surat lab</h3>
<p>ACC7 has revision 4, AGG1 and AGG2 have revision 3. The digest is identical because the VLAN mapping is the same, but the revision differs, so the region is different.</p>
<pre class="out">lab@ACC7&gt; show spanning-tree mstp configuration
Region name              : NK-SURAT
Revision                 : <span class="hl">4</span>
Configuration digest     : 0x9357ebb7a8d74dd5fef4f2bab50531aa

lab@AGG1&gt; show spanning-tree mstp configuration
Region name              : NK-SURAT
Revision                 : <span class="hl">3</span>
Configuration digest     : 0x9357ebb7a8d74dd5fef4f2bab50531aa

lab@ACC7&gt; show spanning-tree interface msti 2
Interface     Port ID  Designated  Designated         Port   State  Role
                       port ID     bridge ID          Cost
ge-0/0/0      128:1    128:2       4096.525426341d00  20000  FWD    <span class="hl">MSTR (Boundary)</span>
ge-0/0/1      128:2    128:2       8192.525423341900  20000  BLK    <span class="hl">ALT (Boundary)</span>
ge-0/0/2      128:3    128:3       32770.52546d020600 20000  FWD    DESG</pre>
<p>Three clues: <b>(Boundary)</b> next to the role, the <b>MSTR</b> role, and designated bridge IDs of <b>4096 and 8192</b>, which are the CIST priorities (no instance number added). MSTI 2's traffic is using AGG1, the CIST side, not AGG2. Because the digest is the same, only the revision gives it away: compare the lines, not just the hash.</p>

<h3>Interoperability with RSTP, STP and per-VLAN trees</h3>
<ul>
<li><b>RSTP/STP neighbour:</b> a region treats an RSTP switch as a different region. The connecting port is a boundary port and carries only the CIST. RSTP convergence is kept; STP (802.1D) neighbours cause the port to fall back to slow STP timers.</li>
<li><b>Cisco PVST+ / Rapid-PVST+ neighbour:</b> MSTP does not speak per-VLAN BPDUs. Standard practice is to keep the MSTP region as one virtual bridge toward the PVST+ side, with the CIST root <i>inside</i> the MST region, and to avoid VLAN-specific roots outside. Mixed designs often use VSTP on the Juniper side instead.</li>
<li><b>Other vendor MSTP:</b> works if name, revision and mapping are equal. Vendors have default names, so always set them explicitly.</li>
</ul>

<h3>Troubleshooting routine</h3>
<ol>
<li>On every switch: <code>show spanning-tree mstp configuration</code>. Compare name, revision, digest.</li>
<li>Look for <b>(Boundary)</b> in <code>show spanning-tree interface</code> on links that must be inside a region.</li>
<li>Fix the odd switch (here: <code>set protocols mstp revision-level 3</code> on ACC7).</li>
<li>Check every instance has the intended regional root and that the access switch has different root ports per instance.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Comparing only the digest and concluding "all fine" when the revision or name differs. Changing a region parameter on one switch "just to test". Assuming a boundary port is an error: on purpose, boundaries separate regions between buildings.</p></div>
<div class="exam"><p><b>Exam trap.</b> The digest covers the VLAN-to-instance mapping only; <b>name and revision are separate fields</b> and must be compared separately. An MSTI-specific root election never crosses a boundary; across it everything follows the CIST.</p></div>

<div class="scn"><h4>Revision 4: a test that stayed in production</h4><p>An engineer raised the revision on one access switch to test a lab script and forgot it. Traffic worked, and nobody noticed for weeks. A capacity review showed the uplink to AGG2 at zero percent for both VLAN groups. The first clue was <code>(Boundary)</code> in the interface output; the fix was one line.</p><p><b>Lesson:</b> "spanning tree works" and "spanning tree does what I designed" are different statements.</p></div>

<div class="iv"><p class="q">"Two switches have the same MSTP name and VLAN mapping but different revision levels. What happens?"</p><p>They are in different regions, because name, revision and the mapping digest must all match. The link between them is a boundary port; only the CIST crosses it and every MSTI follows the CIST role, so load sharing disappears while connectivity continues. Verify with <code>show spanning-tree mstp configuration</code> and look for Boundary in the interface output.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Different name, revision or mapping means a different region and a boundary port.</li>
<li>At a boundary only the CIST exists; all MSTIs follow it (MSTR = master port).</li>
<li>Symptom: network works but all instances use one uplink.</li>
<li>Look for (Boundary) and priorities without the instance number added.</li>
<li>Interoperate with RSTP/STP as a region; with PVST+ keep the CIST root inside the region or use VSTP.</li>
</ul></div>
`,hi:`
<p>Yeh MSTP ka sabse zyada poochha jaane wala topic hai aur sabse common real failure bhi. Jis switch ka region name, revision level ya VLAN mapping alag ho woh <b>apna region</b> bana leta hai. Regions ke beech ke links <b>boundary ports</b> hain. Dikhne mein kuch nahi tootta: network loop-free rehta hai aur ping chalta hai. Jo gaayab hota hai woh load sharing hai.</p>

<h3>Boundary par kya hota hai</h3>
<p>Boundary ke paar dono taraf ek doosre ki MSTI information par bharosa nahi kar sakti, isliye sirf <b>CIST</b> exchange hota hai. Boundary port par har MSTI bas us port ka CIST role copy kar leta hai. Jo port CIST root port hai woh saare MSTIs ke liye <b>master port</b> (MSTR) ban jaata hai: isliye saare instances ek hi uplink par forward karte hain aur doosra uplink saare instances ke liye alternate hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Boundary MSTIs ko collapse karta hai">
<rect x="30" y="20" width="400" height="80" rx="12" fill="#e2e8f0"/><text x="230" y="40" text-anchor="middle" class="svg-ink" font-size="13">Region NK-SURAT revision 3</text>
<rect x="60" y="52" width="80" height="34" rx="8" fill="#bae6fd"/><text x="100" y="74" text-anchor="middle" class="svg-ink" font-size="12">AGG1</text>
<rect x="320" y="52" width="80" height="34" rx="8" fill="#bae6fd"/><text x="360" y="74" text-anchor="middle" class="svg-ink" font-size="12">AGG2</text>
<line x1="140" y1="69" x2="320" y2="69" stroke="#64748b" stroke-width="2"/>
<rect x="470" y="110" width="150" height="80" rx="12" fill="#fde68a"/><text x="545" y="130" text-anchor="middle" class="svg-ink" font-size="12">Region NK-SURAT rev 4</text>
<rect x="500" y="148" width="90" height="34" rx="8" fill="#bbf7d0"/><text x="545" y="170" text-anchor="middle" class="svg-ink" font-size="12">ACC7</text>
<line x1="100" y1="86" x2="500" y2="155" stroke="#16a34a" stroke-width="3"/><text x="250" y="150" class="svg-accent" font-size="12">MSTR (Boundary): saare MSTIs</text>
<line x1="360" y1="86" x2="510" y2="150" stroke="#ef4444" stroke-width="2" stroke-dasharray="5 4"/><text x="400" y="125" class="svg-muted" font-size="11">saare MSTIs ke liye ALT</text>
</svg><p class="cap">Sirf ek revision number alag: ab har instance wahi ek uplink use karta hai.</p></div>

<h3>Asli output: toota hua Surat lab</h3>
<p>ACC7 ka revision 4 hai, AGG1 aur AGG2 ka revision 3. Digest identical hai kyunki VLAN mapping same hai, par revision alag hai, isliye region alag hai.</p>
<pre class="out">lab@ACC7&gt; show spanning-tree mstp configuration
Region name              : NK-SURAT
Revision                 : <span class="hl">4</span>
Configuration digest     : 0x9357ebb7a8d74dd5fef4f2bab50531aa

lab@AGG1&gt; show spanning-tree mstp configuration
Region name              : NK-SURAT
Revision                 : <span class="hl">3</span>
Configuration digest     : 0x9357ebb7a8d74dd5fef4f2bab50531aa

lab@ACC7&gt; show spanning-tree interface msti 2
Interface     Port ID  Designated  Designated         Port   State  Role
                       port ID     bridge ID          Cost
ge-0/0/0      128:1    128:2       4096.525426341d00  20000  FWD    <span class="hl">MSTR (Boundary)</span>
ge-0/0/1      128:2    128:2       8192.525423341900  20000  BLK    <span class="hl">ALT (Boundary)</span>
ge-0/0/2      128:3    128:3       32770.52546d020600 20000  FWD    DESG</pre>
<p>Teen clues: role ke saath <b>(Boundary)</b>, <b>MSTR</b> role, aur designated bridge IDs <b>4096 aur 8192</b>, jo CIST priorities hain (instance number juda nahi). MSTI 2 ka traffic AGG1 use kar raha hai, CIST wali taraf, AGG2 nahi. Digest same hai, isliye sirf revision pakadwata hai: sirf hash nahi, lines milao.</p>

<h3>RSTP, STP aur per-VLAN trees ke saath interoperability</h3>
<ul>
<li><b>RSTP/STP neighbour:</b> region RSTP switch ko alag region maanta hai. Jodne wala port boundary port hai aur sirf CIST carry karta hai. RSTP convergence bani rehti hai; STP (802.1D) neighbour par port dheere STP timers par aa jaata hai.</li>
<li><b>Cisco PVST+ / Rapid-PVST+ neighbour:</b> MSTP per-VLAN BPDUs nahi bolta. Standard practice: MSTP region ko PVST+ ki taraf ek virtual bridge rakho, CIST root MST region <i>ke andar</i> rakho, aur bahar VLAN-specific roots se bacho. Mixed designs mein aksar Juniper side par VSTP use hota hai.</li>
<li><b>Doosre vendor ka MSTP:</b> tab chalta hai jab name, revision aur mapping equal hon. Vendors ke default names hote hain, isliye hamesha explicitly set karo.</li>
</ul>

<h3>Troubleshooting ka tareeka</h3>
<ol>
<li>Har switch par: <code>show spanning-tree mstp configuration</code>. Name, revision, digest milao.</li>
<li>Jo links region ke andar hone chahiye unke <code>show spanning-tree interface</code> mein <b>(Boundary)</b> dhoondo.</li>
<li>Alag switch theek karo (yahan: ACC7 par <code>set protocols mstp revision-level 3</code>).</li>
<li>Check karo har instance ka intended regional root hai aur access switch ke root ports har instance mein alag hain.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Sirf digest compare karke "sab theek" maan lena jabki revision ya name alag hai. "Bas test ke liye" ek switch par region parameter badalna. Boundary port ko hamesha error maan lena: jaanboojh kar buildings ke beech regions alag rakhe jaate hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Digest sirf VLAN-to-instance mapping cover karta hai; <b>name aur revision alag fields</b> hain aur alag se compare karne hote hain. MSTI-specific root election boundary paar nahi jaata; paar sab kuch CIST follow karta hai.</p></div>

<div class="scn"><h4>Revision 4: test jo production mein reh gaya</h4><p>Ek engineer ne lab script test karne ke liye ek access switch ka revision badha diya aur bhool gaya. Traffic chalta raha aur hafton kisi ko pata nahi chala. Capacity review mein AGG2 wala uplink dono VLAN groups ke liye zero percent dikha. Pehla clue interface output mein <code>(Boundary)</code> tha; fix ek line thi.</p><p><b>Lesson:</b> "spanning tree chal raha hai" aur "spanning tree meri design ke hisaab se chal raha hai" alag baatein hain.</p></div>

<div class="iv"><p class="q">"Do switches ka MSTP name aur VLAN mapping same hai par revision level alag. Kya hoga?"</p><p>Woh alag regions mein hain, kyunki name, revision aur mapping digest teeno match hone chahiye. Beech ka link boundary port hai; sirf CIST paar jaata hai aur har MSTI CIST role follow karta hai, isliye load sharing gaayab ho jaati hai jabki connectivity chalti rehti hai. <code>show spanning-tree mstp configuration</code> se verify karo aur interface output mein Boundary dekho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Alag name, revision ya mapping matlab alag region aur boundary port.</li>
<li>Boundary par sirf CIST hota hai; saare MSTIs use follow karte hain (MSTR = master port).</li>
<li>Symptom: network chalta hai par saare instances ek uplink use karte hain.</li>
<li>(Boundary) dhoondo aur woh priorities jinme instance number juda nahi.</li>
<li>RSTP/STP ke saath region ki tarah interoperate; PVST+ ke saath CIST root region ke andar rakho ya VSTP use karo.</li>
</ul></div>
`}};export{e as default};