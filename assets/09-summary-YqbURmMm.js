var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You now have the base for the whole JNCIA-Junos course. Use this chapter as a checklist: if you can do or explain every line, you are ready for the Fundamentals module.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Explain what a packet, a frame, a switch and a router are, using the post-office analogy.</li>
<li>State which table each device uses (MAC table, routing table) and the command that shows it.</li>
<li>Split 192.0.2.10/24 into a network part and a host part and say whether two addresses are in the same network.</li>
<li>Describe what a default gateway and ARP do.</li>
<li>List the three Junos ideas: two modes, candidate configuration with commit, and the configuration hierarchy.</li>
<li>Match EX, QFX, MX, PTX, ACX, SRX and Mist to a role.</li>
<li>Name the steps JNCIA-Junos, JNCIS-ENT, JNCIP-ENT and the seven JN0-106 domains.</li>
<li>Read <code>show interfaces terse</code> and tell an admin problem from a link problem.</li>
<li>Follow the practice routine: look, configure, show | compare, commit, verify.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Chapter map of the module">
<rect x="10" y="20" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="70" y="50" text-anchor="middle" class="svg-ink" font-size="12">Packets, hosts</text>
<rect x="140" y="20" width="120" height="50" rx="8" fill="#bae6fd"/><text x="200" y="50" text-anchor="middle" class="svg-ink" font-size="12">Switch / router</text>
<rect x="270" y="20" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="330" y="50" text-anchor="middle" class="svg-ink" font-size="12">MAC and IP</text>
<rect x="400" y="20" width="110" height="50" rx="8" fill="#fde68a"/><text x="455" y="50" text-anchor="middle" class="svg-ink" font-size="12">Junos ideas</text>
<rect x="520" y="20" width="110" height="50" rx="8" fill="#fed7aa"/><text x="575" y="50" text-anchor="middle" class="svg-ink" font-size="12">Products</text>
<rect x="75" y="100" width="150" height="50" rx="8" fill="#e2e8f0"/><text x="150" y="130" text-anchor="middle" class="svg-ink" font-size="12">Cert path</text>
<rect x="245" y="100" width="150" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="12">Reading the CLI</text>
<rect x="415" y="100" width="150" height="50" rx="8" fill="#e2e8f0"/><text x="490" y="130" text-anchor="middle" class="svg-ink" font-size="12">Practice routine</text>
</svg><p class="cap">The eight chapters before this one, on a page.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Packet</dt><dd>A layer-3 unit of data with source and destination IP addresses.</dd>
<dt>Frame</dt><dd>A layer-2 unit; carries a packet across one hop with MAC addresses.</dd>
<dt>Switch</dt><dd>Forwards frames inside a network using the MAC table.</dd>
<dt>Router</dt><dd>Forwards packets between networks using the routing table.</dd>
<dt>Next hop</dt><dd>The neighbouring router that gets the packet next.</dd>
<dt>Default gateway</dt><dd>The router a host uses to leave its own network.</dd>
<dt>ARP</dt><dd>Maps an IPv4 address to a MAC address on the local segment.</dd>
<dt>Candidate configuration</dt><dd>The working copy that becomes active only on commit.</dd>
<dt>Commit</dt><dd>Validates the candidate and makes it the active configuration.</dd>
<dt>Rollback</dt><dd>Restores the candidate to a previous committed version (0 to 49).</dd>
<dt>Logical unit</dt><dd>A sub-interface, such as ge-0/0/0.0, which carries the address.</dd>
<dt>Junos OS</dt><dd>The operating system shared by Juniper routers, switches and firewalls.</dd></dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Remember</th></tr>
<tr><td>Prompts</td><td>&gt; operational, # configuration</td></tr>
<tr><td>Make a change live</td><td>commit (nothing happens before it)</td></tr>
<tr><td>Safe remote change</td><td>commit confirmed minutes, auto rollback</td></tr>
<tr><td>Validate only</td><td>commit check</td></tr>
<tr><td>Preview change</td><td>show | compare</td></tr>
<tr><td>Flat view</td><td>show configuration | display set</td></tr>
<tr><td>Rollback versions</td><td>rollback 0 to 49 (50 stored)</td></tr>
<tr><td>Product roles</td><td>EX campus, QFX data center, MX edge router, SRX security, PTX core</td></tr>
<tr><td>Interface names</td><td>ge, xe, et plus fpc/pic/port; unit holds address</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">configure                           <span class="c">enter configuration mode</span>
set / delete / rollback             <span class="c">change the candidate</span>
show | compare                      <span class="c">preview the difference</span>
commit / commit check / commit confirmed 5
run show interfaces terse           <span class="c">operational command from config mode</span>
show route                          <span class="c">routing table</span>
show ethernet-switching table       <span class="c">MAC table on EX</span>
show configuration | display set</pre>

<div class="warn"><p><b>Common mistake to avoid in every module.</b> Changing configuration without checking first, and forgetting to verify after commit.</p></div>

<div class="exam"><p><b>Exam trap.</b> A set command in configuration mode does not change traffic until commit. Also, an IP address belongs under a unit and a family, never straight under the physical interface.</p></div>

<div class="scn"><h4>Ready for the next step</h4><p>A learner finished this module and was asked by his manager to explain to a new colleague why a switch cannot connect two networks. He drew two PCs in different subnets, one switch, then added a router and showed the gateway setting. In three minutes the colleague understood. That drawing is the whole module in one picture.</p><p><b>Lesson:</b> if you can teach it with a simple drawing, you have understood it.</p></div>

<div class="iv"><p class="q">"Tell me about yourself and your Junos preparation."</p><p>Give a short story: you started from basics (packets, switches, routers), learned the Junos candidate and commit model, can read interface and route output, and practise every concept in a simulator with verification. End with the next step: addressing and routing on Junos and the JN0-106 exam.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Packets travel hop by hop; switches use MACs, routers use IPs.</li>
<li>Junos has two modes, a candidate configuration, commit and rollback.</li>
<li>Know the product families and the certification ladder.</li>
<li>Read output first, change one thing, preview, commit, verify.</li>
<li>Next: the Fundamentals module on addressing, subnetting and longest match.</li>
</ul></div>
`,hi:`
<p>Ab aapke paas poore JNCIA-Junos course ka base hai. Is chapter ko checklist ki tarah use karo: agar aap har line kar ya samjha sakte ho, to Fundamentals module ke liye taiyar ho.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Post-office analogy se samjhao ki packet, frame, switch aur router kya hain.</li>
<li>Batao har device kaunsa table use karta hai (MAC table, routing table) aur use dikhane wala command kya hai.</li>
<li>192.0.2.10/24 ko network part aur host part mein baanto aur batao do addresses same network mein hain ya nahi.</li>
<li>Default gateway aur ARP kya karte hain, yeh describe karo.</li>
<li>Teen Junos ideas ginao: do modes, commit ke saath candidate configuration, aur configuration hierarchy.</li>
<li>EX, QFX, MX, PTX, ACX, SRX aur Mist ko role se match karo.</li>
<li>JNCIA-Junos, JNCIS-ENT, JNCIP-ENT ke steps aur JN0-106 ke saat domains batao.</li>
<li><code>show interfaces terse</code> padho aur admin problem ko link problem se alag pehchano.</li>
<li>Practice routine follow karo: dekho, configure, show | compare, commit, verify.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module ke chapters ka map">
<rect x="10" y="20" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="70" y="50" text-anchor="middle" class="svg-ink" font-size="12">Packets, hosts</text>
<rect x="140" y="20" width="120" height="50" rx="8" fill="#bae6fd"/><text x="200" y="50" text-anchor="middle" class="svg-ink" font-size="12">Switch / router</text>
<rect x="270" y="20" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="330" y="50" text-anchor="middle" class="svg-ink" font-size="12">MAC aur IP</text>
<rect x="400" y="20" width="110" height="50" rx="8" fill="#fde68a"/><text x="455" y="50" text-anchor="middle" class="svg-ink" font-size="12">Junos ideas</text>
<rect x="520" y="20" width="110" height="50" rx="8" fill="#fed7aa"/><text x="575" y="50" text-anchor="middle" class="svg-ink" font-size="12">Products</text>
<rect x="75" y="100" width="150" height="50" rx="8" fill="#e2e8f0"/><text x="150" y="130" text-anchor="middle" class="svg-ink" font-size="12">Cert path</text>
<rect x="245" y="100" width="150" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="12">CLI padhna</text>
<rect x="415" y="100" width="150" height="50" rx="8" fill="#e2e8f0"/><text x="490" y="130" text-anchor="middle" class="svg-ink" font-size="12">Practice routine</text>
</svg><p class="cap">Is se pehle ke aath chapters, ek page par.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Packet</dt><dd>Layer-3 data unit jisme source aur destination IP address hote hain.</dd>
<dt>Frame</dt><dd>Layer-2 unit; MAC addresses ke saath packet ko ek hop paar karata hai.</dd>
<dt>Switch</dt><dd>MAC table se network ke andar frames forward karta hai.</dd>
<dt>Router</dt><dd>Routing table se networks ke beech packets forward karta hai.</dd>
<dt>Next hop</dt><dd>Padosi router jise packet agla milta hai.</dd>
<dt>Default gateway</dt><dd>Woh router jise host apne network se bahar jaane ke liye use karta hai.</dd>
<dt>ARP</dt><dd>Local segment par IPv4 address ko MAC address se map karta hai.</dd>
<dt>Candidate configuration</dt><dd>Working copy jo sirf commit par active hoti hai.</dd>
<dt>Commit</dt><dd>Candidate ko validate karke active configuration banata hai.</dd>
<dt>Rollback</dt><dd>Candidate ko pichle committed version (0 se 49) par laata hai.</dd>
<dt>Logical unit</dt><dd>Sub-interface, jaise ge-0/0/0.0, jis par address lagta hai.</dd>
<dt>Junos OS</dt><dd>Juniper routers, switches aur firewalls ka common operating system.</dd></dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Yaad rakho</th></tr>
<tr><td>Prompts</td><td>&gt; operational, # configuration</td></tr>
<tr><td>Change live karna</td><td>commit (usse pehle kuch nahi hota)</td></tr>
<tr><td>Safe remote change</td><td>commit confirmed minutes, auto rollback</td></tr>
<tr><td>Sirf validate</td><td>commit check</td></tr>
<tr><td>Change preview</td><td>show | compare</td></tr>
<tr><td>Flat view</td><td>show configuration | display set</td></tr>
<tr><td>Rollback versions</td><td>rollback 0 se 49 (50 stored)</td></tr>
<tr><td>Product roles</td><td>EX campus, QFX data center, MX edge router, SRX security, PTX core</td></tr>
<tr><td>Interface names</td><td>ge, xe, et plus fpc/pic/port; unit par address</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">configure                           <span class="c">configuration mode mein jao</span>
set / delete / rollback             <span class="c">candidate badlo</span>
show | compare                      <span class="c">difference preview</span>
commit / commit check / commit confirmed 5
run show interfaces terse           <span class="c">config mode se operational command</span>
show route                          <span class="c">routing table</span>
show ethernet-switching table       <span class="c">EX par MAC table</span>
show configuration | display set</pre>

<div class="warn"><p><b>Har module mein bachne wali galti.</b> Pehle check kiye bina configuration badalna, aur commit ke baad verify karna bhool jaana.</p></div>

<div class="exam"><p><b>Exam trap.</b> Configuration mode mein set command commit se pehle traffic ko nahi badalta. Aur IP address hamesha unit aur family ke neeche aata hai, seedha physical interface ke neeche nahi.</p></div>

<div class="scn"><h4>Agle step ke liye taiyar</h4><p>Ek learner ne yeh module khatam kiya aur manager ne usse kaha ki naye colleague ko samjhao ki switch do networks kyun nahi jod sakta. Usne alag subnets ke do PCs, ek switch banaya, phir router jodkar gateway setting dikhayi. Teen minute mein colleague samajh gaya. Woh drawing poora module ek tasveer mein hai.</p><p><b>Lesson:</b> agar aap simple drawing se sikha sakte ho, to aapne samjha hai.</p></div>

<div class="iv"><p class="q">"Apne bare mein aur Junos ki taiyari ke bare mein batao."</p><p>Chhoti kahani do: aapne basics (packets, switches, routers) se shuru kiya, Junos ka candidate aur commit model seekha, interface aur route output padh sakte ho, aur har concept simulator mein verification ke saath practise karte ho. Aakhir mein agla step: Junos par addressing aur routing aur JN0-106 exam.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Packets hop by hop chalte hain; switches MAC, routers IP use karte hain.</li>
<li>Junos mein do modes, candidate configuration, commit aur rollback hain.</li>
<li>Product families aur certification ladder jaano.</li>
<li>Pehle output padho, ek cheez badlo, preview, commit, verify.</li>
<li>Aage: addressing, subnetting aur longest match ka Fundamentals module.</li>
</ul></div>
`}};export{e as default};