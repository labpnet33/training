var e={id:`lab-fm-map-ts`,h:{en:`Lab fm-map-ts: the package that installs on one branch and not on the other`,hi:`Lab fm-map-ts: wo package jo ek branch par install hota hai, doosri par nahi`},body:{en:`
<p>This is the troubleshooting lab <b>fm-map-ts</b> (about 35 minutes). Troubleshooting means finding a cause from evidence instead of guessing. Here the evidence is the text after <code>Install failed</code>. You will meet two different causes, one after the other, and the lesson is to read each message, change exactly one thing, and try again.</p>

<div class="note"><p><b>Ticket.</b> The package Branch-PP was built for Madurai and works there. Trichy should get the same package, but the install fails. Devices: FMG-1, MDU-FGT, TRY-FGT, PC-MDU, PC-TRY, SRV-WEB. As always, <code>execute fmgui</code> is the simulator's form of GUI actions.</p></div>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Two failures one after the other">
<rect x="14" y="50" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="79" y="76" text-anchor="middle" class="svg-ink" font-size="13">1 MDU-FGT</text><text x="79" y="96" text-anchor="middle" class="svg-muted" font-size="12">installs OK</text>
<rect x="174" y="50" width="140" height="60" rx="8" fill="#fed7aa"/><text x="244" y="76" text-anchor="middle" class="svg-ink" font-size="13">2 TRY-FGT</text><text x="244" y="96" text-anchor="middle" class="svg-muted" font-size="12">not a target</text>
<rect x="344" y="50" width="140" height="60" rx="8" fill="#fed7aa"/><text x="414" y="76" text-anchor="middle" class="svg-ink" font-size="13">3 TRY-FGT</text><text x="414" y="96" text-anchor="middle" class="svg-muted" font-size="12">LAN not mapped</text>
<rect x="514" y="50" width="112" height="60" rx="8" fill="#bbf7d0"/><text x="570" y="76" text-anchor="middle" class="svg-ink" font-size="13">TRY-FGT</text><text x="570" y="96" text-anchor="middle" class="svg-muted" font-size="12">installed</text>
<line x1="144" y1="80" x2="174" y2="80" stroke="#64748b" stroke-width="2"/><line x1="314" y1="80" x2="344" y2="80" stroke="#64748b" stroke-width="2"/><line x1="484" y1="80" x2="514" y2="80" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Each fix reveals the next problem. This is normal: the checks run in a fixed order.</p></div>

<h3>Task 1: confirm the baseline</h3>
<p><b>Goal:</b> install Branch-PP on MDU-FGT after a preview and ping SRV-WEB from PC-MDU.</p>
<p><b>Why:</b> before you blame the new device, prove that the package itself works on the old one. If Madurai fails too, the problem is in the package or objects, not in Trichy. Here it works: the preview shows 18 lines, the install ends with <code>install finished with status success</code>, and the ping answers.</p>

<h3>Task 2: the first failure</h3>
<p><b>Goal:</b> install the same package on TRY-FGT, read the message and name the package setting that lists devices.</p>
<pre class="out">FMG-1 # execute fmgui install-package Kaveri Branch-PP TRY-FGT
Install failed: <span class="hl">device 'TRY-FGT' is not an installation target of package 'Branch-PP'</span>.</pre>
<p><b>Read it:</b> the device exists and is managed (otherwise the message would be "is not managed in ADOM"), the package exists (otherwise "does not exist in ADOM"), but the device is not in the package's list. The setting is <b>install-target</b> (chapter 3). The device list confirms the other half of the picture: MDU-FGT shows <code>pkg:[installed]Branch-PP</code> and TRY-FGT shows <code>pkg:[unknown]null</code>.</p>
<p><b>Fix approach:</b> open the package with <code>config pm pkg</code>, <code>edit "Branch-PP"</code> and set the list so that it contains <b>both</b> names. Remember that <code>set install-target</code> replaces the whole list. If you write only TRY-FGT, Madurai falls out of the list. Finish with <code>next</code> and <code>end</code>, then check with <code>show pm pkg</code>.</p>

<h3>Task 3: the second failure</h3>
<p><b>Goal:</b> install again, read the new message, find which normalized interface lacks a mapping for TRY-FGT, add it (port2), install and ping from PC-TRY.</p>
<pre class="out">FMG-1 # execute fmgui install-package Kaveri Branch-PP TRY-FGT
Install failed: <span class="hl">normalized interface 'LAN' has no mapping for device TRY-FGT</span>.</pre>
<p><b>Read it:</b> the install-target check now passes, the FGFM tunnel is up and pushes are allowed (those checks come before), and the failure is in the package lines. The message gives the interface (LAN) and the device (TRY-FGT). Check the table to see the evidence:</p>
<pre class="out">FMG-1 # show pm interface
config pm interface
    edit "LAN"
        config dynamic-mapping
            edit "MDU-FGT"
                set intf "port2"
            next
        end
    next
    edit "WAN"
        config dynamic-mapping
            edit "MDU-FGT"
                set intf "port1"
            next
            edit "TRY-FGT"
                <span class="hl">set intf "port1"</span>
            next
        end
    next
end</pre>
<p>WAN has a TRY-FGT row; LAN does not. That is why only LAN is named. <b>Fix approach:</b> inside <code>edit "LAN"</code> and <code>config dynamic-mapping</code> add a row for TRY-FGT with <code>set intf "port2"</code>. Then repeat the install. It should now end with "install finished with status success" and a new revision number.</p>

<h3>Verify the final state</h3>
<pre class="out">FMG-1 # execute fmgui revision list TRY-FGT
ID  CREATED BY   NAME
1   retrieve     Retrieved
<span class="hl">2   install      Installed Branch-PP</span></pre>
<p>Also check: <code>diagnose dvm device list</code> shows <code>pkg:[installed]Branch-PP</code> for both devices, <code>show firewall policy</code> on TRY-FGT lists policy 1 LAN-TO-SRV with port2 and port1, and PC-TRY can ping 192.0.2.80. Failed installs left no revision, which is why TRY-FGT has only revisions 1 and 2.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Fixing both causes at once from memory; then you cannot tell which one the message was about. (2) Adding the mapping on the wrong device name, for example MDU-FGT again. (3) Writing the new installation target as a separate <code>set</code> line; the second line replaces the first. (4) Looking at the FortiGate for the problem: nothing on TRY-FGT was wrong. Both causes were inside FortiManager.</p></div>

<div class="exam"><p><b>Exam traps.</b> Order of checks: ADOM, device, package, installation target, tunnel, push permission, objects and mappings. "Not an installation target" is a package attribute problem; "no mapping" is an interface mapping problem. A failed install changes nothing on the device and creates no revision.</p></div>

<div class="scn"><h4>The package that worked everywhere except the new store</h4><p>A retailer's new Salem branch would not accept the shared package. First message: not an installation target. The engineer added the device name, but wrote only the new name and removed the other branches; two installs later the old branches failed with the same message. The second failure was a missing mapping for WAN. After the engineer restored the complete list and added the mapping, all targets installed.</p><p><b>Lesson:</b> change the list, do not shorten it, and read each new message instead of repeating the old fix.</p></div>

<div class="iv"><p class="q">"An install fails on one device but works on another with the same package. How do you troubleshoot?"</p><p>Read the exact text after Install failed. It tells which check failed: device not an installation target (fix install-target), no mapping for an interface (add a dynamic mapping row), tunnel down or push disabled (device side), or an address object not found (create it in the ADOM). Fix one cause, retry, and read the next message.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Prove the package on a working device first, then troubleshoot the failing one.</li>
<li>"not an installation target" means the install-target list of the package lacks the device.</li>
<li>"has no mapping for device" means the normalized interface needs a row for that device.</li>
<li>set install-target replaces the full list; keep all names.</li>
<li>Failed installs change nothing and create no revision.</li>
</ul></div>
`,hi:`
<p>Ye troubleshooting lab <b>fm-map-ts</b> hai (lagbhag 35 minute). Troubleshooting ka matlab guess karne ke bajay evidence se cause dhoondhna. Yahan evidence <code>Install failed</code> ke baad ka text hai. Aapko do alag causes ek ke baad ek milenge, aur lesson hai: har message padho, theek ek cheez badlo, aur dobara try karo.</p>

<div class="note"><p><b>Ticket.</b> Package Branch-PP Madurai ke liye bana tha aur wahan chalta hai. Trichy ko wahi package milna chahiye, par install fail ho raha hai. Devices: FMG-1, MDU-FGT, TRY-FGT, PC-MDU, PC-TRY, SRV-WEB. Hamesha ki tarah <code>execute fmgui</code> GUI actions ka simulator form hai.</p></div>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Do failures ek ke baad ek">
<rect x="14" y="50" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="79" y="76" text-anchor="middle" class="svg-ink" font-size="13">1 MDU-FGT</text><text x="79" y="96" text-anchor="middle" class="svg-muted" font-size="12">install OK</text>
<rect x="174" y="50" width="140" height="60" rx="8" fill="#fed7aa"/><text x="244" y="76" text-anchor="middle" class="svg-ink" font-size="13">2 TRY-FGT</text><text x="244" y="96" text-anchor="middle" class="svg-muted" font-size="12">target nahi</text>
<rect x="344" y="50" width="140" height="60" rx="8" fill="#fed7aa"/><text x="414" y="76" text-anchor="middle" class="svg-ink" font-size="13">3 TRY-FGT</text><text x="414" y="96" text-anchor="middle" class="svg-muted" font-size="12">LAN mapped nahi</text>
<rect x="514" y="50" width="112" height="60" rx="8" fill="#bbf7d0"/><text x="570" y="76" text-anchor="middle" class="svg-ink" font-size="13">TRY-FGT</text><text x="570" y="96" text-anchor="middle" class="svg-muted" font-size="12">installed</text>
<line x1="144" y1="80" x2="174" y2="80" stroke="#64748b" stroke-width="2"/><line x1="314" y1="80" x2="344" y2="80" stroke="#64748b" stroke-width="2"/><line x1="484" y1="80" x2="514" y2="80" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Har fix agli problem dikhata hai. Ye normal hai: checks fixed order mein chalte hain.</p></div>

<h3>Task 1: baseline confirm karo</h3>
<p><b>Goal:</b> preview ke baad MDU-FGT par Branch-PP install karo aur PC-MDU se SRV-WEB ping karo.</p>
<p><b>Kyun:</b> naye device ko blame karne se pehle saabit karo ki package purane device par chalta hai. Madurai bhi fail ho to problem package ya objects mein hai, Trichy mein nahi. Yahan ye chalta hai: preview 18 lines dikhata hai, install <code>install finished with status success</code> par khatam hota hai, aur ping jawab deta hai.</p>

<h3>Task 2: pehli failure</h3>
<p><b>Goal:</b> wahi package TRY-FGT par install karo, message padho aur wo package setting batao jo devices list karti hai.</p>
<pre class="out">FMG-1 # execute fmgui install-package Kaveri Branch-PP TRY-FGT
Install failed: <span class="hl">device 'TRY-FGT' is not an installation target of package 'Branch-PP'</span>.</pre>
<p><b>Padho:</b> device exist karta hai aur managed hai (warna message "is not managed in ADOM" hota), package exist karta hai (warna "does not exist in ADOM"), par device package ki list mein nahi hai. Setting <b>install-target</b> hai (chapter 3). Device list tasveer ka doosra hissa confirm karti hai: MDU-FGT <code>pkg:[installed]Branch-PP</code> dikhata hai aur TRY-FGT <code>pkg:[unknown]null</code>.</p>
<p><b>Fix approach:</b> <code>config pm pkg</code>, <code>edit "Branch-PP"</code> se package kholo aur list aise set karo ki usme <b>dono</b> naam hon. Yaad rakho <code>set install-target</code> poori list replace karta hai. Sirf TRY-FGT likhoge to Madurai list se bahar ho jayega. <code>next</code> aur <code>end</code> se khatam karo, phir <code>show pm pkg</code> se check.</p>

<h3>Task 3: doosri failure</h3>
<p><b>Goal:</b> dobara install karo, naya message padho, dhoondho kis normalized interface ki TRY-FGT ke liye mapping nahi hai, use jodo (port2), install karo aur PC-TRY se ping karo.</p>
<pre class="out">FMG-1 # execute fmgui install-package Kaveri Branch-PP TRY-FGT
Install failed: <span class="hl">normalized interface 'LAN' has no mapping for device TRY-FGT</span>.</pre>
<p><b>Padho:</b> install-target check ab pass hota hai, FGFM tunnel up hai aur push allowed hai (ye checks pehle aate hain), aur failure package lines mein hai. Message interface (LAN) aur device (TRY-FGT) deta hai. Evidence ke liye table dekho:</p>
<pre class="out">FMG-1 # show pm interface
config pm interface
    edit "LAN"
        config dynamic-mapping
            edit "MDU-FGT"
                set intf "port2"
            next
        end
    next
    edit "WAN"
        config dynamic-mapping
            edit "MDU-FGT"
                set intf "port1"
            next
            edit "TRY-FGT"
                <span class="hl">set intf "port1"</span>
            next
        end
    next
end</pre>
<p>WAN mein TRY-FGT ki row hai; LAN mein nahi. Isliye sirf LAN ka naam aaya. <b>Fix approach:</b> <code>edit "LAN"</code> aur <code>config dynamic-mapping</code> ke andar TRY-FGT ki row <code>set intf "port2"</code> ke saath jodo. Phir install dobara karo. Ab "install finished with status success" aur naya revision number aana chahiye.</p>

<h3>Final state verify karo</h3>
<pre class="out">FMG-1 # execute fmgui revision list TRY-FGT
ID  CREATED BY   NAME
1   retrieve     Retrieved
<span class="hl">2   install      Installed Branch-PP</span></pre>
<p>Ye bhi check karo: <code>diagnose dvm device list</code> dono devices ke liye <code>pkg:[installed]Branch-PP</code> dikhati hai, TRY-FGT par <code>show firewall policy</code> mein policy 1 LAN-TO-SRV port2 aur port1 ke saath hai, aur PC-TRY 192.0.2.80 ko ping kar sakta hai. Failed installs ne koi revision nahi chhoda, isliye TRY-FGT ke sirf revisions 1 aur 2 hain.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Yaad se dono causes ek saath fix karna; tab pata nahi chalta message kis ke baare mein tha. (2) Mapping galat device name par jodna, jaise phir se MDU-FGT. (3) Naya installation target alag <code>set</code> line mein likhna; doosri line pehli ko replace karti hai. (4) Problem FortiGate mein dhoondhna: TRY-FGT par kuch galat nahi tha. Dono causes FortiManager ke andar the.</p></div>

<div class="exam"><p><b>Exam traps.</b> Checks ka order: ADOM, device, package, installation target, tunnel, push permission, objects aur mappings. "Not an installation target" package attribute ki problem hai; "no mapping" interface mapping ki problem hai. Failed install device par kuch nahi badalta aur revision nahi banata.</p></div>

<div class="scn"><h4>Wo package jo naye store ke alawa har jagah chala</h4><p>Ek retailer ki nayi Salem branch shared package accept nahi kar rahi thi. Pehla message: not an installation target. Engineer ne device ka naam jodha, par sirf naya naam likha aur baaki branches hata di; do installs baad purani branches wahi message ke saath fail hone lagi. Doosri failure WAN ki missing mapping thi. Engineer ne poori list wapas rakhi aur mapping jodi to saare targets install ho gaye.</p><p><b>Lesson:</b> list badlo, chhoti mat karo, aur har naya message padho, purana fix dohrao mat.</p></div>

<div class="iv"><p class="q">"Install ek device par fail hota hai, doosre par same package ke saath chalta hai. Troubleshoot kaise karoge?"</p><p>Install failed ke baad ka exact text padho. Wo batata hai kaun si check fail hui: device not an installation target (install-target fix karo), interface ki no mapping (dynamic mapping row jodo), tunnel down ya push disabled (device side), ya address object not found (ADOM mein banao). Ek cause fix karo, retry karo, aur agla message padho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle package ko working device par saabit karo, phir failing device troubleshoot karo.</li>
<li>"not an installation target" ka matlab package ki install-target list mein device nahi hai.</li>
<li>"has no mapping for device" ka matlab normalized interface ko us device ki row chahiye.</li>
<li>set install-target poori list replace karta hai; saare naam rakho.</li>
<li>Failed install kuch nahi badalta aur revision nahi banata.</li>
</ul></div>
`}};export{e as default};