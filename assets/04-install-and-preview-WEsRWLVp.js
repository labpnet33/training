var e={id:`install-and-preview`,h:{en:`Install and install preview: what is replaced, what is checked, why it fails`,hi:`Install aur install preview: kya replace hota hai, kya check hota hai, fail kyun hota hai`},body:{en:`
<p>Writing a package in FortiManager is like writing a letter. Nothing happens to the branch until you post it. The posting step is called <b>install</b>: FortiManager converts the package into FortiGate CLI commands and sends them through the FGFM tunnel. Before posting, you can read the letter once more. That is the <b>install preview</b>.</p>

<h3>The two commands</h3>
<p>In the real product install and preview are GUI wizards (or API calls). The simulator offers them as <code>execute fmgui ...</code> commands on FMG-1, which is a simulator convenience and not real FortiManager CLI.</p>
<ul>
<li><code>execute fmgui install-preview &lt;adom&gt; &lt;package&gt; &lt;device&gt;</code>: builds the CLI lines and prints them. Nothing is sent.</li>
<li><code>execute fmgui install-package &lt;adom&gt; &lt;package&gt; &lt;device&gt;</code>: sends them. You install per device.</li>
</ul>
<p>There is also <code>install-device</code>, which installs only the device settings (templates, module fmg-templates) without a package.</p>

<h3>What an install does to the device</h3>
<p>An install is <b>not</b> "add these rules to what is there". It <b>replaces the firewall policy table</b> of the device with the policies of the package. The generated commands first delete the policies that exist on the FortiGate, then create the address objects the package uses, then create the package policies. Whatever was on the device and not in the package is gone after the install. This is the single most tested fact of this module, and we meet it again in the labs and in module fmg-revisions.</p>

<h3>Order of operations</h3>
<ol>
<li>Checks (below). If any fails, nothing is sent.</li>
<li>Device settings: system template, IPsec template, CLI template (module fmg-templates).</li>
<li>The package: delete the existing policies, install the address objects that the policies use, install the policies with real interface names from the mapping.</li>
<li>On success FortiManager stores the result as a new revision and the device list shows <code>dm: installed</code> and <code>pkg:[installed]&lt;package&gt;</code>.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Install flow: checks, then device settings, then package">
<rect x="14" y="50" width="130" height="64" rx="8" fill="#fde68a"/><text x="79" y="78" text-anchor="middle" class="svg-ink" font-size="13">1 Checks</text><text x="79" y="98" text-anchor="middle" class="svg-muted" font-size="12">any fail: stop</text>
<rect x="174" y="50" width="130" height="64" rx="8" fill="#bae6fd"/><text x="239" y="78" text-anchor="middle" class="svg-ink" font-size="13">2 Device settings</text><text x="239" y="98" text-anchor="middle" class="svg-muted" font-size="12">templates</text>
<rect x="334" y="50" width="130" height="64" rx="8" fill="#ddd6fe"/><text x="399" y="78" text-anchor="middle" class="svg-ink" font-size="13">3 Package</text><text x="399" y="98" text-anchor="middle" class="svg-muted" font-size="12">delete, addr, policy</text>
<rect x="494" y="50" width="130" height="64" rx="8" fill="#bbf7d0"/><text x="559" y="78" text-anchor="middle" class="svg-ink" font-size="13">4 Revision</text><text x="559" y="98" text-anchor="middle" class="svg-muted" font-size="12">dm: installed</text>
<line x1="144" y1="82" x2="174" y2="82" stroke="#64748b" stroke-width="2"/><line x1="304" y1="82" x2="334" y2="82" stroke="#64748b" stroke-width="2"/><line x1="464" y1="82" x2="494" y2="82" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Checks come first. A failed check sends nothing and changes nothing.</p></div>

<h3>What is checked first</h3>
<p>The simulator checks in this order, and the order explains which message you meet first:</p>
<ol>
<li>The ADOM exists, and the device is managed in that ADOM.</li>
<li>The package exists in that ADOM, and the device is one of its installation targets.</li>
<li>The FGFM tunnel to the device is up.</li>
<li>The device allows pushes: <code>allow-push-configuration</code> is enable in its central-management settings.</li>
<li>Every address object used by the policies exists in the ADOM, and every normalized interface has a mapping for this device.</li>
</ol>
<p>The real product has more checks and its own order; treat this list as the simulator's model.</p>

<h3>Real failure messages</h3>
<pre class="out">FMG-1 # execute fmgui install-package Kaveri Branch-PP TRY-FGT
Install failed: <span class="hl">device 'TRY-FGT' is not an installation target of package 'Branch-PP'</span>.

FMG-1 # execute fmgui install-package Kaveri Branch-PP TRY-FGT
Install failed: <span class="hl">normalized interface 'LAN' has no mapping for device TRY-FGT</span>.</pre>
<p>Other messages from the same function: <code>the FGFM tunnel to MDU-FGT is down (device status: connection down)</code>; <code>MDU-FGT does not accept configuration changes from FortiManager (allow-push-configuration is disabled)</code>; <code>address object 'SRV-WEB' not found in the ADOM</code>; <code>device 'X' is not managed in ADOM 'Kaveri'</code>; <code>policy package 'X' does not exist in ADOM 'Kaveri'</code>. Several problems in the package lines are joined with a semicolon in one message. If the FortiGate itself rejects a command, you read "Install failed on MDU-FGT: ... the install was rolled back by FortiManager and the revision history is unchanged." After any failure the device and the revision list stay as they were.</p>

<div class="eg"><p><b>Worked example.</b> Preview for MDU-FGT of Branch-PP shows 18 lines. You read: create address SRV-WEB 192.0.2.80/32; create policy 1 with <code>srcintf "port2"</code> and <code>dstintf "port1"</code>, destination SRV-WEB, accept, NAT. You confirm that LAN became port2. On a device that already had policies, you would also see <code>config firewall policy</code> followed by <code>delete</code> lines before the new ones. That is the moment to ask "do I want to lose these?".</p></div>
<pre class="out">FMG-1 # execute fmgui install-package Kaveri Branch-PP MDU-FGT
Starting installation to MDU-FGT (ADOM Kaveri)...
  device settings: nothing to copy
  policy package: Branch-PP installed (1 policies)
<span class="hl">Task 1: install finished with status success. Revision 2 created.</span></pre>

<div class="warn"><p><b>Common mistakes.</b> (1) Skipping the preview on a device that already has rules. (2) Treating "installed" as proof that traffic works: test with a ping or a real connection. (3) Retrying an install without reading the message. (4) Assuming a failed install changed part of the device; in the simulator it changes nothing.</p></div>

<div class="exam"><p><b>Exam traps.</b> Install replaces, it does not merge. Preview sends nothing. Objects are installed before the policies that use them. Device settings come before the package. A refused install leaves the revision history unchanged.</p></div>

<div class="scn"><h4>The rules that vanished at midnight</h4><p>An engineer installed a new package to a branch during a night window. The branch had five local policies added over the years by the local admin, none of them in the package. The preview was skipped. In the morning the branch reported that its printer server and a partner link no longer worked. The engineer had to rebuild the five rules from memory.</p><p><b>Lesson:</b> read the preview for delete lines, and import existing rules into the package before the first install (chapter 5).</p></div>

<div class="iv"><p class="q">"What does installing a policy package do to the policies already on the FortiGate?"</p><p>It replaces the policy table: existing policies are deleted and the package policies are created, after the objects they use. So preview first, look for delete lines, and import local rules into the package beforehand if they must survive. A failed check changes nothing.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Install turns the package into CLI and sends it; preview shows the CLI and sends nothing.</li>
<li>Install replaces the device policy table; it does not add to it.</li>
<li>Order: checks, device settings, then address objects and policies.</li>
<li>Checks cover ADOM, device, package, installation target, FGFM up, push permission, objects and mappings.</li>
<li>Read the message after Install failed: it names the exact cause, and nothing is changed.</li>
</ul></div>
`,hi:`
<p>FortiManager mein package likhna ek chitthi likhne jaisa hai. Jab tak aap use post nahi karte branch par kuch nahi hota. Post karne wale step ko <b>install</b> kehte hain: FortiManager package ko FortiGate CLI commands mein badalta hai aur FGFM tunnel se bhejta hai. Post karne se pehle aap chitthi ek baar aur padh sakte ho. Wahi <b>install preview</b> hai.</p>

<h3>Do commands</h3>
<p>Real product mein install aur preview GUI wizards (ya API calls) hain. Simulator unhe FMG-1 par <code>execute fmgui ...</code> commands ki tarah deta hai, jo simulator ki suvidha hai, real FortiManager CLI nahi.</p>
<ul>
<li><code>execute fmgui install-preview &lt;adom&gt; &lt;package&gt; &lt;device&gt;</code>: CLI lines banata hai aur print karta hai. Kuch bheja nahi jata.</li>
<li><code>execute fmgui install-package &lt;adom&gt; &lt;package&gt; &lt;device&gt;</code>: unhe bhejta hai. Install per device hota hai.</li>
</ul>
<p><code>install-device</code> bhi hai, jo bina package ke sirf device settings (templates, module fmg-templates) install karta hai.</p>

<h3>Install device ke saath kya karta hai</h3>
<p>Install ka matlab "jo hai usme ye rules jodo" <b>nahi</b> hai. Wo device ki <b>firewall policy table ko package ki policies se replace karta hai</b>. Generated commands pehle FortiGate par maujood policies delete karte hain, phir package ke address objects banate hain, phir package ki policies. Jo device par tha aur package mein nahi, install ke baad gayab. Ye is module ka sabse zyada tested fact hai, aur labs mein aur module fmg-revisions mein dobara milega.</p>

<h3>Order of operations</h3>
<ol>
<li>Checks (neeche). Koi fail ho to kuch nahi bheja jata.</li>
<li>Device settings: system template, IPsec template, CLI template (module fmg-templates).</li>
<li>Package: maujooda policies delete, policies jo objects use karti hain unhe install, phir policies mapping ke real interface names ke saath.</li>
<li>Success par FortiManager result ko naye revision ki tarah store karta hai aur device list mein <code>dm: installed</code> aur <code>pkg:[installed]&lt;package&gt;</code> dikhta hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Install flow: checks, phir device settings, phir package">
<rect x="14" y="50" width="130" height="64" rx="8" fill="#fde68a"/><text x="79" y="78" text-anchor="middle" class="svg-ink" font-size="13">1 Checks</text><text x="79" y="98" text-anchor="middle" class="svg-muted" font-size="12">fail: ruk jao</text>
<rect x="174" y="50" width="130" height="64" rx="8" fill="#bae6fd"/><text x="239" y="78" text-anchor="middle" class="svg-ink" font-size="13">2 Device settings</text><text x="239" y="98" text-anchor="middle" class="svg-muted" font-size="12">templates</text>
<rect x="334" y="50" width="130" height="64" rx="8" fill="#ddd6fe"/><text x="399" y="78" text-anchor="middle" class="svg-ink" font-size="13">3 Package</text><text x="399" y="98" text-anchor="middle" class="svg-muted" font-size="12">delete, addr, policy</text>
<rect x="494" y="50" width="130" height="64" rx="8" fill="#bbf7d0"/><text x="559" y="78" text-anchor="middle" class="svg-ink" font-size="13">4 Revision</text><text x="559" y="98" text-anchor="middle" class="svg-muted" font-size="12">dm: installed</text>
<line x1="144" y1="82" x2="174" y2="82" stroke="#64748b" stroke-width="2"/><line x1="304" y1="82" x2="334" y2="82" stroke="#64748b" stroke-width="2"/><line x1="464" y1="82" x2="494" y2="82" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Checks pehle aate hain. Fail hui check kuch nahi bhejti aur kuch nahi badalti.</p></div>

<h3>Pehle kya check hota hai</h3>
<p>Simulator is order mein check karta hai, aur order se samajh aata hai ki pehle kaun sa message milega:</p>
<ol>
<li>ADOM exist karta hai, aur device usi ADOM mein managed hai.</li>
<li>Package us ADOM mein exist karta hai, aur device uske installation targets mein hai.</li>
<li>Device tak FGFM tunnel up hai.</li>
<li>Device push allow karta hai: central-management settings mein <code>allow-push-configuration</code> enable hai.</li>
<li>Policies ke saare address objects ADOM mein hain, aur har normalized interface ki is device ke liye mapping hai.</li>
</ol>
<p>Real product mein aur checks aur apna order hai; is list ko simulator ka model samjho.</p>

<h3>Real failure messages</h3>
<pre class="out">FMG-1 # execute fmgui install-package Kaveri Branch-PP TRY-FGT
Install failed: <span class="hl">device 'TRY-FGT' is not an installation target of package 'Branch-PP'</span>.

FMG-1 # execute fmgui install-package Kaveri Branch-PP TRY-FGT
Install failed: <span class="hl">normalized interface 'LAN' has no mapping for device TRY-FGT</span>.</pre>
<p>Usi function ke aur messages: <code>the FGFM tunnel to MDU-FGT is down (device status: connection down)</code>; <code>MDU-FGT does not accept configuration changes from FortiManager (allow-push-configuration is disabled)</code>; <code>address object 'SRV-WEB' not found in the ADOM</code>; <code>device 'X' is not managed in ADOM 'Kaveri'</code>; <code>policy package 'X' does not exist in ADOM 'Kaveri'</code>. Package lines ki kai problems ek message mein semicolon se judti hain. FortiGate khud koi command reject kare to "Install failed on MDU-FGT: ... the install was rolled back by FortiManager and the revision history is unchanged." milta hai. Kisi bhi failure ke baad device aur revision list jaise the waise rehte hain.</p>

<div class="eg"><p><b>Worked example.</b> MDU-FGT ke liye Branch-PP ka preview 18 lines dikhata hai. Aap padhte ho: address SRV-WEB 192.0.2.80/32 banao; policy 1 banao <code>srcintf "port2"</code> aur <code>dstintf "port1"</code> ke saath, destination SRV-WEB, accept, NAT. Aap confirm karte ho ki LAN port2 bana. Jis device par pehle se policies hoti, wahan new lines se pehle <code>config firewall policy</code> aur <code>delete</code> lines bhi dikhti. Wahi moment hai poochne ka "kya main inhe khona chahta hoon?".</p></div>
<pre class="out">FMG-1 # execute fmgui install-package Kaveri Branch-PP MDU-FGT
Starting installation to MDU-FGT (ADOM Kaveri)...
  device settings: nothing to copy
  policy package: Branch-PP installed (1 policies)
<span class="hl">Task 1: install finished with status success. Revision 2 created.</span></pre>

<div class="warn"><p><b>Common mistakes.</b> (1) Jis device par rules hain wahan preview skip karna. (2) "installed" ko traffic chalne ka saboot maanna: ping ya real connection se test karo. (3) Message padhe bina install dobara try karna. (4) Sochna ki failed install ne device ka kuch hissa badal diya; simulator mein kuch nahi badalta.</p></div>

<div class="exam"><p><b>Exam traps.</b> Install replace karta hai, merge nahi. Preview kuch nahi bhejta. Objects unki policies se pehle install hote hain. Device settings package se pehle aati hain. Refused install revision history ko unchanged chhodta hai.</p></div>

<div class="scn"><h4>Raat ke baarah baje gayab hue rules</h4><p>Ek engineer ne night window mein branch par naya package install kiya. Branch par local admin ne saalon mein paanch local policies jodi thi, koi package mein nahi. Preview skip hua. Subah branch ne bataya ki printer server aur partner link kaam nahi kar rahe. Engineer ko paanch rules yaad se dobara banane pade.</p><p><b>Lesson:</b> preview mein delete lines dekho, aur pehle install se pehle maujooda rules package mein import karo (chapter 5).</p></div>

<div class="iv"><p class="q">"Policy package install karne par FortiGate ki maujooda policies ka kya hota hai?"</p><p>Policy table replace hoti hai: maujooda policies delete hoti hain aur package ki policies unke objects ke baad banti hain. Isliye pehle preview, delete lines dekho, aur jo rules bachne chahiye unhe pehle package mein import karo. Fail hui check kuch nahi badalti.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Install package ko CLI banakar bhejta hai; preview CLI dikhata hai aur kuch nahi bhejta.</li>
<li>Install device ki policy table replace karta hai; usme jodta nahi.</li>
<li>Order: checks, device settings, phir address objects aur policies.</li>
<li>Checks: ADOM, device, package, installation target, FGFM up, push permission, objects aur mappings.</li>
<li>Install failed ke baad ka message exact cause batata hai, aur kuch nahi badalta.</li>
</ul></div>
`}};export{e as default};