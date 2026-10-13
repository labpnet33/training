var e={id:`troubleshooting-no-connect`,h:{en:`Troubleshooting a firewall that will not connect`,hi:`Na jurne wale firewall ka troubleshooting`},body:{en:`
<p>When a phone call does not connect, you do not randomly redial. You ask three questions in order. Did I dial the right number? Is the person on the other end willing to take my call? Is there a working line between us? A Panorama connection fails for the same three families of reasons, and each one lives on a different device. Learn the questions and the right device to check, and most tickets solve themselves.</p>

<h3>The three families of causes</h3>
<table class="tbl"><tr><th>Question</th><th>Cause family</th><th>Where to look and fix</th></tr>
<tr><td>Did I dial the right number?</td><td>Server address wrong or missing on the firewall</td><td>Firewall: <code>show panorama-status</code>, then fix panorama-server</td></tr>
<tr><td>Is Panorama willing to take my call?</td><td>Serial number not in the managed devices list</td><td>Panorama: ms.log and managed devices</td></tr>
<tr><td>Is there a line between us?</td><td>Management network cannot reach: wrong IP, netmask or missing gateway</td><td>Firewall: <code>show config running</code>, management IP settings</td></tr>
</table>
<p>The point of the table is the third column: the fault and the fix are often on different devices than you first suspect, so read evidence before changing anything.</p>

<h3>Step 1: ask the firewall</h3>
<p>On the firewall run <code>show panorama-status</code>. It shows which Panorama it is trying to reach and whether it is connected. If the server line shows an address that is not your Panorama's management IP, you have found a dial-the-wrong-number problem. If it shows the right address and Connected: no, move on.</p>
<pre class="out">&gt; show panorama-status
Panorama Server 1 : 192.0.2.77
    Connected     : <span class="hl">no</span>
    HA state      : disconnected</pre>

<h3>Step 2: read the management log</h3>
<p>The management log is called <b>ms.log</b>. Read it on the firewall and on Panorama with <code>less mp-log ms.log</code>. The messages are short and tell you which family you are in. In the simulator the wording looks like these examples (generic ones, not from a specific lab):</p>
<pre class="out">firewall&gt; less mp-log ms.log
Error: connection to Panorama server 192.0.2.77 failed: connection timed out (no Panorama answers on this address)

panorama&gt; less mp-log ms.log
Error: rejected management connection from unknown device serial 0079000000000: not in managed devices

firewall&gt; less mp-log ms.log
Error: connection to Panorama server 192.0.2.50 failed: no route to host on the management network</pre>
<p>Read them as: nobody answers at that address (address problem); Panorama answered and refused (registration problem); the call cannot get there (network problem). Real log wording differs between versions, but the three-family thinking holds.</p>

<h3>Step 3: fix on the right device, then verify</h3>
<ul>
<li>Wrong address: fix <code>panorama-server</code> on the <b>firewall</b> and commit.</li>
<li>Unknown serial: add the serial under <code>mgt-config devices</code> on <b>Panorama</b> and commit there.</li>
<li>No route: correct the firewall's management IP, netmask and default gateway and commit on the firewall.</li>
<li>Verify with show panorama-status on the firewall and show devices connected on Panorama.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Decision path">
<rect x="20" y="20" width="170" height="50" rx="8" fill="#bae6fd"/><text x="105" y="50" text-anchor="middle" class="svg-ink" font-size="13">show panorama-status</text>
<rect x="235" y="20" width="170" height="50" rx="8" fill="#fde68a"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">less mp-log ms.log</text>
<rect x="450" y="20" width="170" height="50" rx="8" fill="#ddd6fe"/><text x="535" y="50" text-anchor="middle" class="svg-ink" font-size="13">Pick the family</text>
<rect x="20" y="130" width="170" height="50" rx="8" fill="#fed7aa"/><text x="105" y="160" text-anchor="middle" class="svg-ink" font-size="12">Address: fix firewall</text>
<rect x="235" y="130" width="170" height="50" rx="8" fill="#fed7aa"/><text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="12">Serial: fix Panorama</text>
<rect x="450" y="130" width="170" height="50" rx="8" fill="#fed7aa"/><text x="535" y="160" text-anchor="middle" class="svg-ink" font-size="12">Network: fix mgmt IP</text>
<line x1="190" y1="45" x2="235" y2="45" stroke="#64748b" stroke-width="2"/><line x1="405" y1="45" x2="450" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="535" y1="70" x2="105" y2="130" stroke="#64748b" stroke-width="1.5"/><line x1="535" y1="70" x2="320" y2="130" stroke="#64748b" stroke-width="1.5"/><line x1="535" y1="70" x2="535" y2="130" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">Evidence first, then one fix on the device the evidence points to.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Changing three things at once and not knowing which one worked; fixing the firewall when the log points at Panorama; forgetting to commit; testing user traffic instead of the management path; assuming that if two firewalls are connected the third must be too. If real behaviour differs on your PAN-OS version, check its documentation.</p></div>

<div class="scn"><h4>Three sites, three different reasons</h4><p>After a rollout, three branches showed disconnected. The engineer did not make one change for all. For the first, the log said nobody answered at the address, and the typed address had a digit wrong. For the second, Panorama's log named an unknown serial because a registration had been missed. For the third, the firewall had been given a management IP in a different subnet and no gateway.</p><p><b>Lesson:</b> same symptom, different causes. Evidence per device beats a one-size fix.</p></div>

<div class="iv"><p class="q">"A firewall will not connect to Panorama. Walk me through it."</p><p>Check show panorama-status on the firewall for the server and state. Read ms.log on both sides. Classify: wrong address, unknown serial, or no route on the management network. Fix on the device the evidence points to, commit, and verify with show devices connected.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three families: wrong server address, serial not registered, management network cannot reach.</li>
<li>show panorama-status on the firewall; less mp-log ms.log on both sides.</li>
<li>The fault may live on a different device than the symptom.</li>
<li>Fix one thing, commit on that device, verify.</li>
<li>Do not troubleshoot with user traffic; this is the management plane.</li>
</ul></div>
`,hi:`
<p>Phone call na lage to aap random redial nahi karte. Teen sawal order mein poochte ho. Kya maine sahi number dial kiya? Kya doosri taraf wala insaan meri call lene ko tayyar hai? Kya hum dono ke beech working line hai? Panorama connection bhi isi tarah teen families ki wajah se fail hota hai, aur har ek alag device par rehti hai. Sawal aur sahi device seekh lo to zyadatar tickets khud solve ho jate hain.</p>

<h3>Causes ki teen families</h3>
<table class="tbl"><tr><th>Sawal</th><th>Cause family</th><th>Kahan dekhein aur fix karein</th></tr>
<tr><td>Kya maine sahi number dial kiya?</td><td>Firewall par server address galat ya missing</td><td>Firewall: <code>show panorama-status</code>, phir panorama-server fix</td></tr>
<tr><td>Kya Panorama meri call lene ko tayyar hai?</td><td>Serial number managed devices list mein nahi</td><td>Panorama: ms.log aur managed devices</td></tr>
<tr><td>Kya hum dono ke beech line hai?</td><td>Management network reach nahi karta: galat IP, netmask ya gateway missing</td><td>Firewall: <code>show config running</code>, management IP settings</td></tr>
</table>
<p>Table ka point teesra column hai: fault aur fix aksar us device par nahi hote jis par aap pehle shak karte ho, isliye kuch badalne se pehle evidence padho.</p>

<h3>Step 1: firewall se pucho</h3>
<p>Firewall par <code>show panorama-status</code> chalao. Ye batata hai wo kaun se Panorama tak pahunchne ki koshish kar raha hai aur connected hai ya nahi. Server line mein aisa address ho jo aapke Panorama ka management IP nahi hai, to aapne galat-number-dial-karne ki problem pakad li. Sahi address aur Connected: no ho to aage badho.</p>
<pre class="out">&gt; show panorama-status
Panorama Server 1 : 192.0.2.77
    Connected     : <span class="hl">no</span>
    HA state      : disconnected</pre>

<h3>Step 2: management log padho</h3>
<p>Management log ka naam <b>ms.log</b> hai. Use firewall aur Panorama dono par <code>less mp-log ms.log</code> se padho. Messages chhote hote hain aur batate hain aap kaun si family mein ho. Simulator mein wording in examples jaisi dikhti hai (generic examples, kisi specific lab ke nahi):</p>
<pre class="out">firewall&gt; less mp-log ms.log
Error: connection to Panorama server 192.0.2.77 failed: connection timed out (no Panorama answers on this address)

panorama&gt; less mp-log ms.log
Error: rejected management connection from unknown device serial 0079000000000: not in managed devices

firewall&gt; less mp-log ms.log
Error: connection to Panorama server 192.0.2.50 failed: no route to host on the management network</pre>
<p>Inhe aise padho: us address par koi jawab nahi deta (address problem); Panorama ne jawab diya aur mana kar diya (registration problem); call wahan tak pahunch hi nahi sakti (network problem). Real log wording versions ke beech alag hoti hai, par teen-family wali soch sahi rehti hai.</p>

<h3>Step 3: sahi device par fix karo, phir verify</h3>
<ul>
<li>Galat address: <b>firewall</b> par <code>panorama-server</code> fix karo aur commit.</li>
<li>Unknown serial: <b>Panorama</b> par <code>mgt-config devices</code> ke under serial jodo aur wahin commit.</li>
<li>No route: firewall ka management IP, netmask aur default gateway sahi karo aur firewall par commit.</li>
<li>Firewall par show panorama-status aur Panorama par show devices connected se verify karo.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Decision path">
<rect x="20" y="20" width="170" height="50" rx="8" fill="#bae6fd"/><text x="105" y="50" text-anchor="middle" class="svg-ink" font-size="13">show panorama-status</text>
<rect x="235" y="20" width="170" height="50" rx="8" fill="#fde68a"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">less mp-log ms.log</text>
<rect x="450" y="20" width="170" height="50" rx="8" fill="#ddd6fe"/><text x="535" y="50" text-anchor="middle" class="svg-ink" font-size="13">Family chuno</text>
<rect x="20" y="130" width="170" height="50" rx="8" fill="#fed7aa"/><text x="105" y="160" text-anchor="middle" class="svg-ink" font-size="12">Address: firewall fix</text>
<rect x="235" y="130" width="170" height="50" rx="8" fill="#fed7aa"/><text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="12">Serial: Panorama fix</text>
<rect x="450" y="130" width="170" height="50" rx="8" fill="#fed7aa"/><text x="535" y="160" text-anchor="middle" class="svg-ink" font-size="12">Network: mgmt IP fix</text>
<line x1="190" y1="45" x2="235" y2="45" stroke="#64748b" stroke-width="2"/><line x1="405" y1="45" x2="450" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="535" y1="70" x2="105" y2="130" stroke="#64748b" stroke-width="1.5"/><line x1="535" y1="70" x2="320" y2="130" stroke="#64748b" stroke-width="1.5"/><line x1="535" y1="70" x2="535" y2="130" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">Pehle evidence, phir jis device ki taraf evidence ishara kare wahan ek fix.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Ek saath teen cheezein badalna aur pata na chalna kaunsi kaam aayi; log Panorama ki taraf ishara kare aur firewall fix karna; commit bhool jana; management path ke bajay user traffic test karna; ye maan lena ki do firewalls connected hain to teesra bhi hoga. Aapke PAN-OS version par real behaviour alag ho to uski documentation check karo.</p></div>

<div class="scn"><h4>Teen sites, teen alag wajah</h4><p>Rollout ke baad teen branches disconnected dikhe. Engineer ne sab ke liye ek change nahi kiya. Pehle ke liye log ne kaha us address par koi jawab nahi deta, aur type kiye address mein ek digit galat tha. Doosre ke liye Panorama ke log ne unknown serial bataya kyunki ek registration chhoot gaya tha. Teesre firewall ko doosre subnet ka management IP aur gateway ke bina diya gaya tha.</p><p><b>Lesson:</b> symptom same, causes alag. Har device ki evidence one-size fix se behtar hai.</p></div>

<div class="iv"><p class="q">"Firewall Panorama se connect nahi ho raha. Mujhe walk through karao."</p><p>Firewall par show panorama-status se server aur state dekho. Dono taraf ms.log padho. Classify karo: galat address, unknown serial, ya management network par no route. Jis device ki taraf evidence ishara kare wahan fix, commit, aur show devices connected se verify.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen families: galat server address, serial registered nahi, management network reach nahi karta.</li>
<li>Firewall par show panorama-status; dono taraf less mp-log ms.log.</li>
<li>Fault symptom wale device se alag device par ho sakta hai.</li>
<li>Ek cheez fix karo, us device par commit, verify.</li>
<li>User traffic se troubleshoot mat karo; ye management plane hai.</li>
</ul></div>
`}};export{e as default};