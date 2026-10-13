var e={id:`software-power`,h:{en:`Software install, snapshot and safe shutdown`,hi:`Software install, snapshot aur safe shutdown`},body:{en:`
<p>Upgrading Junos is routine, but it is also the moment when a router is most likely to be lost. The answer is a repeatable procedure with a safety net. This chapter gives you that procedure and explains the three ways to stop a device.</p>

<h3>Why a snapshot comes first</h3>
<p>A Junos device stores its software on internal media. A <b>snapshot</b> copies the currently running software and configuration onto the alternate media, so that if the new software fails to boot you can start from the known-good copy. Think of it as saving the game before a hard level.</p>
<pre class="code">lab@R1-IDR&gt; request system snapshot
lab@R1-IDR&gt; show system snapshot media internal</pre>
<p>Do not confuse a snapshot with a configuration rollback. Rollback (<code>rollback 1</code>) changes only the configuration. A snapshot protects the whole system: software plus configuration.</p>

<h3>The upgrade procedure</h3>
<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Upgrade steps">
<rect x="8" y="30" width="112" height="56" rx="8" fill="#bae6fd"/><text x="64" y="52" text-anchor="middle" class="svg-ink" font-size="12">1. Copy</text><text x="64" y="70" text-anchor="middle" class="svg-muted" font-size="11">to /var/tmp</text>
<rect x="136" y="30" width="112" height="56" rx="8" fill="#fde68a"/><text x="192" y="52" text-anchor="middle" class="svg-ink" font-size="12">2. Snapshot</text><text x="192" y="70" text-anchor="middle" class="svg-muted" font-size="11">safety net</text>
<rect x="264" y="30" width="112" height="56" rx="8" fill="#ddd6fe"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="12">3. Install</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="11">software add</text>
<rect x="392" y="30" width="112" height="56" rx="8" fill="#fed7aa"/><text x="448" y="52" text-anchor="middle" class="svg-ink" font-size="12">4. Reboot</text><text x="448" y="70" text-anchor="middle" class="svg-muted" font-size="11">activate</text>
<rect x="520" y="30" width="112" height="56" rx="8" fill="#bbf7d0"/><text x="576" y="52" text-anchor="middle" class="svg-ink" font-size="12">5. Verify</text><text x="576" y="70" text-anchor="middle" class="svg-muted" font-size="11">show version</text>
<line x1="120" y1="58" x2="136" y2="58" stroke="#64748b" stroke-width="2"/><line x1="248" y1="58" x2="264" y2="58" stroke="#64748b" stroke-width="2"/><line x1="376" y1="58" x2="392" y2="58" stroke="#64748b" stroke-width="2"/><line x1="504" y1="58" x2="520" y2="58" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Five steps. If step 5 shows a problem, request system software rollback returns to the previous release.</p></div>
<ol>
<li><b>Copy and check space.</b> Put the package in <code>/var/tmp/</code> with <code>file copy</code>. Confirm free space with <code>show system storage</code>.</li>
<li><b>Snapshot.</b> <code>request system snapshot</code>.</li>
<li><b>Install.</b> <code>request system software add /var/tmp/junos-install-example.tgz</code>. The package is validated against the current configuration. Options: <code>no-validate</code> skips that check, <code>reboot</code> restarts automatically when done.</li>
<li><b>Reboot.</b> <code>request system reboot</code> to boot the new software.</li>
<li><b>Verify.</b> <code>show version</code>, then check interfaces, neighbours and routes are back.</li>
</ol>
<pre class="out">lab@R1-IDR&gt; request system software add /var/tmp/junos-install-example.tgz
Verified junos-install-example signed by PackageProduction_example
Validating against /config/juniper.conf.gz
mgd: commit complete
Validation succeeded
Installing package '/var/tmp/junos-install-example.tgz' ...
<span class="hl">WARNING: A reboot is required to load this software correctly</span>
WARNING:     Use the 'request system reboot' command when software installation is complete
</pre>
<p>Remember: installing does not activate. The new software runs only after the reboot. Until then <code>show version</code> still shows the old release. If something is wrong afterwards, <code>request system software rollback</code> returns to the previous software set (reboot again to use it).</p>

<h3>Three ways to stop a device</h3>
<table class="cmp"><tr><th>Command</th><th>What happens</th><th>When</th></tr>
<tr><td><code>request system reboot</code></td><td>Orderly shutdown of all processes, then restart</td><td>Activate new software, clear a stuck process</td></tr>
<tr><td><code>request system halt</code></td><td>Orderly stop; power stays on; press a key on the console to boot again</td><td>Before a console-side maintenance step</td></tr>
<tr><td><code>request system power-off</code></td><td>Orderly stop and power down the Routing Engine</td><td>Before removing power or moving the box; someone must power it on again</td></tr></table>
<p>All three accept <code>in</code> (after minutes) and <code>at</code> (at a time) to schedule the action, and <code>message "text"</code> to warn logged-in users. Always use one of them before pulling a power cable. The Routing Engine writes to its storage, and a sudden power cut can corrupt the file system. In the simulator these commands are recorded but the device does not really stop; a staged software package becomes "installed" after the reboot.</p>
<div class="warn"><p><b>Common mistake.</b> Running <code>power-off</code> on a remote router. Nobody on site means nobody can power it back on. Use <code>reboot</code> remotely.</p></div>
<div class="exam"><p><b>Exam trap.</b> Software add does not reboot by itself unless you add the <code>reboot</code> option. A question that says "after installation the version is unchanged" is testing this. Also, snapshot is not rollback, and zeroize erases everything and is not a shutdown command.</p></div>

<div class="scn"><h4>The upgrade that saved itself</h4><p>An engineer upgraded a branch router late at night. She copied the package, took a snapshot, installed and rebooted. After the reboot an interface module failed to initialise on the new release. Because the snapshot existed, she used the console, booted the previous software and had the branch online in fifteen minutes, with the old configuration intact. Without the snapshot she would have needed a site visit.</p><p><b>Lesson:</b> the snapshot costs two minutes and is the cheapest insurance in the procedure.</p></div>

<div class="iv"><p class="q">"Walk me through upgrading Junos on a production router."</p><p>Copy the image to /var/tmp and check storage; take a snapshot; request system software add with validation; schedule a maintenance window and request system reboot; verify with show version, interfaces, protocols and routes; and know the fallback: software rollback or boot from the snapshot media. Mention telling users before reboot and checking redundancy first.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Snapshot protects software plus configuration; rollback protects only configuration.</li>
<li>Procedure: copy, snapshot, software add, reboot, verify.</li>
<li>Installing does not activate; the reboot does.</li>
<li>reboot restarts, halt stops but keeps power, power-off removes power.</li>
<li>Never pull power without an orderly stop.</li>
</ul></div>
`,hi:`
<p>Junos upgrade routine kaam hai, lekin yahi woh moment bhi hai jab router kho jaane ka sabse zyada khatra hota hai. Jawab hai ek repeatable procedure jisme safety net ho. Yeh chapter woh procedure aur device ko rokne ke teen tarike batata hai.</p>

<h3>Snapshot pehle kyun</h3>
<p>Junos device apna software internal media par rakhta hai. <b>Snapshot</b> abhi chal rahe software aur configuration ko alternate media par copy kar deta hai, taaki naya software boot na ho to aap known-good copy se start kar sako. Isse aise samjho jaise mushkil level se pehle game save karna.</p>
<pre class="code">lab@R1-IDR&gt; request system snapshot
lab@R1-IDR&gt; show system snapshot media internal</pre>
<p>Snapshot ko configuration rollback se mat milao. Rollback (<code>rollback 1</code>) sirf configuration badalta hai. Snapshot poore system ko protect karta hai: software aur configuration dono.</p>

<h3>Upgrade procedure</h3>
<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Upgrade steps">
<rect x="8" y="30" width="112" height="56" rx="8" fill="#bae6fd"/><text x="64" y="52" text-anchor="middle" class="svg-ink" font-size="12">1. Copy</text><text x="64" y="70" text-anchor="middle" class="svg-muted" font-size="11">/var/tmp mein</text>
<rect x="136" y="30" width="112" height="56" rx="8" fill="#fde68a"/><text x="192" y="52" text-anchor="middle" class="svg-ink" font-size="12">2. Snapshot</text><text x="192" y="70" text-anchor="middle" class="svg-muted" font-size="11">safety net</text>
<rect x="264" y="30" width="112" height="56" rx="8" fill="#ddd6fe"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="12">3. Install</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="11">software add</text>
<rect x="392" y="30" width="112" height="56" rx="8" fill="#fed7aa"/><text x="448" y="52" text-anchor="middle" class="svg-ink" font-size="12">4. Reboot</text><text x="448" y="70" text-anchor="middle" class="svg-muted" font-size="11">activate</text>
<rect x="520" y="30" width="112" height="56" rx="8" fill="#bbf7d0"/><text x="576" y="52" text-anchor="middle" class="svg-ink" font-size="12">5. Verify</text><text x="576" y="70" text-anchor="middle" class="svg-muted" font-size="11">show version</text>
<line x1="120" y1="58" x2="136" y2="58" stroke="#64748b" stroke-width="2"/><line x1="248" y1="58" x2="264" y2="58" stroke="#64748b" stroke-width="2"/><line x1="376" y1="58" x2="392" y2="58" stroke="#64748b" stroke-width="2"/><line x1="504" y1="58" x2="520" y2="58" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Paanch steps. Step 5 mein problem dikhe to request system software rollback pichle release par le jaata hai.</p></div>
<ol>
<li><b>Copy aur space check.</b> Package ko <code>file copy</code> se <code>/var/tmp/</code> mein rakho. <code>show system storage</code> se free space confirm karo.</li>
<li><b>Snapshot.</b> <code>request system snapshot</code>.</li>
<li><b>Install.</b> <code>request system software add /var/tmp/junos-install-example.tgz</code>. Package current configuration ke against validate hota hai. Options: <code>no-validate</code> woh check skip karta hai, <code>reboot</code> kaam khatam hote hi automatically restart karta hai.</li>
<li><b>Reboot.</b> Naya software boot karne ke liye <code>request system reboot</code>.</li>
<li><b>Verify.</b> <code>show version</code>, phir check karo interfaces, neighbours aur routes wapas aa gaye.</li>
</ol>
<pre class="out">lab@R1-IDR&gt; request system software add /var/tmp/junos-install-example.tgz
Verified junos-install-example signed by PackageProduction_example
Validating against /config/juniper.conf.gz
mgd: commit complete
Validation succeeded
Installing package '/var/tmp/junos-install-example.tgz' ...
<span class="hl">WARNING: A reboot is required to load this software correctly</span>
WARNING:     Use the 'request system reboot' command when software installation is complete
</pre>
<p>Yaad rakho: install karna activate karna nahi hai. Naya software reboot ke baad hi chalta hai. Tab tak <code>show version</code> purana release dikhata hai. Baad mein kuch galat ho to <code>request system software rollback</code> pichle software set par le jaata hai (use karne ke liye dobara reboot).</p>

<h3>Device rokne ke teen tarike</h3>
<table class="cmp"><tr><th>Command</th><th>Kya hota hai</th><th>Kab</th></tr>
<tr><td><code>request system reboot</code></td><td>Saare processes ka orderly shutdown, phir restart</td><td>Naya software activate karna, atka process saaf karna</td></tr>
<tr><td><code>request system halt</code></td><td>Orderly stop; power on rehta hai; dobara boot ke liye console par key dabao</td><td>Console-side maintenance step se pehle</td></tr>
<tr><td><code>request system power-off</code></td><td>Orderly stop aur Routing Engine ki power band</td><td>Power hatane ya box ko hilane se pehle; koi aakar power on kare</td></tr></table>
<p>Teeno <code>in</code> (kuch minute baad) aur <code>at</code> (kisi time par) schedule karne ke liye, aur <code>message "text"</code> logged-in users ko warn karne ke liye leti hain. Power cable kheenchne se pehle in mein se ek hamesha use karo. Routing Engine apni storage par likhta hai, aur achanak power cut file system kharab kar sakta hai. Simulator mein yeh commands record hote hain lekin device sach mein nahi rukta; staged software package reboot ke baad "installed" ho jaata hai.</p>
<div class="warn"><p><b>Common mistake.</b> Remote router par <code>power-off</code> chalana. Site par koi nahi to power wapas on karne wala koi nahi. Remotely <code>reboot</code> use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Software add khud reboot nahi karta jab tak <code>reboot</code> option na lagao. Jis sawaal mein "installation ke baad version same hai" likha ho woh yahi test karta hai. Aur snapshot rollback nahi hai, aur zeroize sab mita deta hai aur shutdown command nahi hai.</p></div>

<div class="scn"><h4>Jo upgrade khud ko bacha gaya</h4><p>Ek engineer ne raat ko branch router upgrade kiya. Usne package copy kiya, snapshot liya, install aur reboot kiya. Reboot ke baad naye release par ek interface module initialise nahi hua. Snapshot hone ki wajah se usne console se purana software boot kiya aur branch pandrah minute mein purani configuration ke saath online thi. Snapshot na hota to site visit karni padti.</p><p><b>Lesson:</b> snapshot do minute leta hai aur procedure ka sabse sasta insurance hai.</p></div>

<div class="iv"><p class="q">"Production router par Junos upgrade kaise karoge?"</p><p>Image /var/tmp mein copy karo aur storage check karo; snapshot lo; validation ke saath request system software add; maintenance window rakho aur request system reboot; show version, interfaces, protocols aur routes se verify; aur fallback pata ho: software rollback ya snapshot media se boot. Batao ki reboot se pehle users ko batate ho aur redundancy check karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Snapshot software aur configuration dono protect karta hai; rollback sirf configuration.</li>
<li>Procedure: copy, snapshot, software add, reboot, verify.</li>
<li>Install activate nahi karta; reboot karta hai.</li>
<li>reboot restart karta hai, halt rokta hai par power rakhta hai, power-off power hata deta hai.</li>
<li>Orderly stop ke bina power kabhi mat kheencho.</li>
</ul></div>
`}};export{e as default};