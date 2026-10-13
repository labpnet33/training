var e={id:`change-discipline`,h:{en:`Documentation, backups and change discipline`,hi:`Documentation, backups aur change discipline`},body:{en:`
<p>A surgeon does not walk into an operating theatre and start cutting. There is a checklist, a consent form, a second pair of eyes, and a plan for what happens if something goes wrong. Network changes are far less dramatic, but they follow the same logic. In every company the most expensive outages are not caused by hardware. They are caused by <b>a person making an unplanned change without a way back</b>. This chapter is the professional wrapper around everything else in the module: how you document, how you back up, and how you change a production device safely.</p>

<h3>What to document, and where it lives</h3>
<p>Good documentation is small, current and findable. Keep five items for every site:</p>
<div class="tbl"><table>
<tr><th>Item</th><th>Contents</th><th>Why it saves time</th></tr>
<tr><td>Topology drawing</td><td>Devices, interface names on both ends, link subnets</td><td>Map for troubleshooting and for the next engineer</td></tr>
<tr><td>IP and VLAN plan</td><td>The tables from the addressing chapter</td><td>Verification compares the device against this</td></tr>
<tr><td>Device inventory</td><td>Hostname, model, IOS version, management IP, location</td><td>Know what you own and what needs patching</td></tr>
<tr><td>Config backups</td><td>Dated copy of each running configuration</td><td>Restore after failure, diff after a bad change</td></tr>
<tr><td>Change log</td><td>Ticket number, who, what, when, result</td><td>Answers "what changed yesterday?" in seconds</td></tr>
</table></div>
<p>Interface descriptions and a login banner are documentation that lives on the device itself. They survive when the wiki is out of date.</p>

<h3>Backups: before, during and after</h3>
<p>Your running configuration lives in RAM. If a device reloads without a save, you lose everything since the last <code>copy running-config startup-config</code>. Take a backup <b>before</b> every change, and a fresh one <b>after</b> a successful change. Keep copies off the device, on a TFTP, SCP or file server, with the date in the name. The CCNA expects you to know both directions of the copy command.</p>
<pre class="code"><span class="c">! save to NVRAM so a reload keeps it</span>
copy running-config startup-config
<span class="c">! copy to a server (name includes the date)</span>
copy running-config tftp:
<span class="c">! restore from a server: merges into the running config</span>
copy tftp: running-config
<span class="c">! compare what is running with what is saved</span>
show running-config
show startup-config</pre>

<h3>The change workflow</h3>
<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Change workflow">
<rect x="10" y="35" width="95" height="50" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="57" y="57" text-anchor="middle" class="svg-ink" font-size="12">1. Ticket</text><text x="57" y="73" text-anchor="middle" class="svg-muted" font-size="10">what and why</text>
<rect x="120" y="35" width="95" height="50" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="167" y="57" text-anchor="middle" class="svg-ink" font-size="12">2. Backup</text><text x="167" y="73" text-anchor="middle" class="svg-muted" font-size="10">config copy</text>
<rect x="230" y="35" width="95" height="50" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="277" y="57" text-anchor="middle" class="svg-ink" font-size="12">3. Plan back</text><text x="277" y="73" text-anchor="middle" class="svg-muted" font-size="10">reload in 10</text>
<rect x="340" y="35" width="95" height="50" rx="8" fill="#fde68a" stroke="#64748b"/><text x="387" y="57" text-anchor="middle" class="svg-ink" font-size="12">4. Change</text><text x="387" y="73" text-anchor="middle" class="svg-muted" font-size="10">small steps</text>
<rect x="450" y="35" width="85" height="50" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="492" y="57" text-anchor="middle" class="svg-ink" font-size="12">5. Verify</text><text x="492" y="73" text-anchor="middle" class="svg-muted" font-size="10">ladder</text>
<rect x="550" y="35" width="85" height="50" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="592" y="57" text-anchor="middle" class="svg-ink" font-size="12">6. Record</text><text x="592" y="73" text-anchor="middle" class="svg-muted" font-size="10">save + log</text>
<line x1="105" y1="60" x2="120" y2="60" stroke="#64748b" stroke-width="2"/><line x1="215" y1="60" x2="230" y2="60" stroke="#64748b" stroke-width="2"/><line x1="325" y1="60" x2="340" y2="60" stroke="#64748b" stroke-width="2"/><line x1="435" y1="60" x2="450" y2="60" stroke="#64748b" stroke-width="2"/><line x1="535" y1="60" x2="550" y2="60" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Six steps. Step 3, the way back, is the one most people skip.</p></div>
<p>A good <b>change ticket</b> has: the number, the reason, the exact commands, the devices affected, the time window, the verification you will run, and the rollback plan. A one-line ticket ("fixed OSPF") is not a ticket.</p>

<h3>The safety net: reload in</h3>
<p>The most dangerous change is one that cuts off your own access: a wrong ACL on the management VLAN, a wrong trunk list on the uplink you are connected through. The safety net is the <code>reload in</code> command. It schedules a reload. Because the reload brings the device back with the <b>saved</b> startup configuration, a bad change that locked you out is undone by the clock. If the change works, you cancel the reload.</p>
<pre class="code"><span class="c">! 1. be sure the CURRENT working config is saved</span>
copy running-config startup-config
<span class="c">! 2. arm the safety net: reload in 10 minutes</span>
reload in 10
<span class="c">! 3. make the risky change (do NOT save it yet)</span>
configure terminal
 interface GigabitEthernet0/1
  switchport trunk allowed vlan 10,20
<span class="c">! 4a. it worked and you can still reach the box: cancel and save</span>
reload cancel
copy running-config startup-config
<span class="c">! 4b. you were cut off: do nothing, the device reloads in 10 minutes</span>
<span class="c">!     with the old startup-config and you are back in</span></pre>

<div class="eg"><p><b>Worked example.</b> Ticket NK-6410: add VLAN 30 for guest Wi-Fi on the Pune access switch and tighten the uplink trunk. Backup: <code>copy running-config tftp:</code> with file name <code>HQ-SW1-20261009-pre.cfg</code>. Safety net: <code>copy running-config startup-config</code>, then <code>reload in 10</code>. Change: create VLAN 30, add it to the allowed list on the uplink, assign four ports. Verify: <code>show vlan brief</code>, <code>show interfaces trunk</code>, a guest laptop gets an address. All good, so <code>reload cancel</code>, save again, take the post backup <code>HQ-SW1-20261009-post.cfg</code>, update the plan and close the ticket with the result. If the trunk list had cut the engineer off, the switch would have reloaded after ten minutes with the old trunk list and the change window would still be safe.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Saving a broken change to startup-config before verifying it, so the reload brings the fault back. Arming <code>reload in</code> and forgetting to cancel it, which reloads a working network. Keeping backups only on the device that failed. Changing production in business hours without a window. Editing the config from memory with no ticket, and nobody can later say what was done.</p></div>

<div class="exam"><p><b>Exam traps.</b> <code>copy running-config startup-config</code> and <code>copy startup-config running-config</code> are not symmetrical: copying into the running config <b>merges</b>, it does not replace. A reload without a save drops unsaved changes. Know which file is in RAM (running) and which is in NVRAM (startup). In a lab, if the task says the configuration must persist after a reload, save it.</p></div>

<div class="scn"><h4>The trunk that locked the engineer out</h4><p>At 7 p.m. an engineer tightened the allowed VLAN list on the uplink of a branch switch, from a console session over that same uplink. The management VLAN was not in the new list, so his session froze and the branch lost its switch. He had armed <code>reload in 15</code> first. Fifteen minutes later the switch reloaded with the old startup configuration and the branch came back. He then added the management VLAN to the list and repeated the change, this time without losing access.</p><p><b>Lesson:</b> the safety net costs one command and turns a site visit into a coffee break.</p></div>

<div class="iv"><p class="q">"How do you make a risky change on a remote device?"</p><p>Strong answer: raise a change ticket with a rollback plan, back up the configuration off the device, save the working configuration, arm <code>reload in</code> as a timed rollback, apply the change in small steps, verify with the ladder, then cancel the reload, save, take a fresh backup and update the documentation and the ticket.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Keep five documents per site: drawing, IP and VLAN plan, inventory, backups, change log.</li>
<li>Back up before and after every change, off the device, with dates in file names.</li>
<li>Every change needs a ticket with the commands, the verification and the rollback.</li>
<li>Use <code>reload in</code> as a timed rollback; cancel it only after verifying.</li>
<li>Do not save a change to startup-config until it is verified.</li>
</ul></div>
`,hi:`
<p>Surgeon operating theatre mein jaakar seedha cutting shuru nahi karta. Checklist hoti hai, consent form hota hai, doosri nazar hoti hai, aur plan hota hai ki kuch galat hua to kya karenge. Network changes utne dramatic nahi hote, lekin logic wahi hai. Har company mein sabse mehnge outages hardware se nahi hote. Woh hote hain <b>kisi insaan ke bina plan ke kiye gaye change se, jisme wapas jaane ka raasta nahi tha</b>. Yeh chapter module ki baaki sab cheezon ke upar professional wrapper hai: documentation kaise karte hain, backup kaise lete hain, aur production device ko safely kaise badalte hain.</p>

<h3>Kya document karna hai, aur kahan rakhna hai</h3>
<p>Achhi documentation chhoti, current aur dhoondhne mein aasaan hoti hai. Har site ke liye paanch cheezein rakho:</p>
<div class="tbl"><table>
<tr><th>Item</th><th>Contents</th><th>Time kyun bachata hai</th></tr>
<tr><td>Topology drawing</td><td>Devices, dono ends ke interface names, link subnets</td><td>Troubleshooting aur agle engineer ke liye map</td></tr>
<tr><td>IP aur VLAN plan</td><td>Addressing chapter ki tables</td><td>Verification device ko isi se compare karta hai</td></tr>
<tr><td>Device inventory</td><td>Hostname, model, IOS version, management IP, location</td><td>Pata rehta hai kya hai aur kisko patch chahiye</td></tr>
<tr><td>Config backups</td><td>Har running configuration ki dated copy</td><td>Failure ke baad restore, bad change ke baad diff</td></tr>
<tr><td>Change log</td><td>Ticket number, kisne, kya, kab, result</td><td>"Kal kya badla?" ka jawab seconds mein</td></tr>
</table></div>
<p>Interface descriptions aur login banner woh documentation hai jo device par hi rehti hai. Wiki purani ho jaye tab bhi yeh bachi rehti hai.</p>

<h3>Backups: pehle, beech mein aur baad mein</h3>
<p>Aapki running configuration RAM mein rehti hai. Device bina save ke reload ho jaye to last <code>copy running-config startup-config</code> ke baad ka sab kuch chala jata hai. Har change se <b>pehle</b> backup lo, aur successful change ke <b>baad</b> fresh backup lo. Copies device ke bahar rakho, TFTP, SCP ya file server par, file name mein date ke saath. CCNA mein copy command ki dono directions aani chahiye.</p>
<pre class="code"><span class="c">! NVRAM mein save, taaki reload mein bachi rahe</span>
copy running-config startup-config
<span class="c">! server par copy (file name mein date)</span>
copy running-config tftp:
<span class="c">! server se restore: running config mein merge hota hai</span>
copy tftp: running-config
<span class="c">! running aur saved ko compare karo</span>
show running-config
show startup-config</pre>

<h3>Change workflow</h3>
<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Change workflow">
<rect x="10" y="35" width="95" height="50" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="57" y="57" text-anchor="middle" class="svg-ink" font-size="12">1. Ticket</text><text x="57" y="73" text-anchor="middle" class="svg-muted" font-size="10">kya aur kyun</text>
<rect x="120" y="35" width="95" height="50" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="167" y="57" text-anchor="middle" class="svg-ink" font-size="12">2. Backup</text><text x="167" y="73" text-anchor="middle" class="svg-muted" font-size="10">config copy</text>
<rect x="230" y="35" width="95" height="50" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="277" y="57" text-anchor="middle" class="svg-ink" font-size="12">3. Wapsi plan</text><text x="277" y="73" text-anchor="middle" class="svg-muted" font-size="10">reload in 10</text>
<rect x="340" y="35" width="95" height="50" rx="8" fill="#fde68a" stroke="#64748b"/><text x="387" y="57" text-anchor="middle" class="svg-ink" font-size="12">4. Change</text><text x="387" y="73" text-anchor="middle" class="svg-muted" font-size="10">chhote steps</text>
<rect x="450" y="35" width="85" height="50" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="492" y="57" text-anchor="middle" class="svg-ink" font-size="12">5. Verify</text><text x="492" y="73" text-anchor="middle" class="svg-muted" font-size="10">ladder</text>
<rect x="550" y="35" width="85" height="50" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="592" y="57" text-anchor="middle" class="svg-ink" font-size="12">6. Record</text><text x="592" y="73" text-anchor="middle" class="svg-muted" font-size="10">save + log</text>
<line x1="105" y1="60" x2="120" y2="60" stroke="#64748b" stroke-width="2"/><line x1="215" y1="60" x2="230" y2="60" stroke="#64748b" stroke-width="2"/><line x1="325" y1="60" x2="340" y2="60" stroke="#64748b" stroke-width="2"/><line x1="435" y1="60" x2="450" y2="60" stroke="#64748b" stroke-width="2"/><line x1="535" y1="60" x2="550" y2="60" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Chhe steps. Step 3, wapsi ka raasta, woh hai jo zyadatar log skip karte hain.</p></div>
<p>Achhe <b>change ticket</b> mein hota hai: number, reason, exact commands, affected devices, time window, jo verification chalayenge, aur rollback plan. Ek line ka ticket ("OSPF fix kiya") ticket nahi hai.</p>

<h3>Safety net: reload in</h3>
<p>Sabse khatarnak change woh hai jo aapki apni access kaat de: management VLAN par galat ACL, ya jis uplink se aap connected ho usi par galat trunk list. Safety net hai <code>reload in</code> command. Yeh ek reload schedule karta hai. Reload device ko <b>saved</b> startup configuration ke saath wapas laata hai, isliye jo bad change aapko lock kar de, use clock undo kar deti hai. Change chal gaya to reload cancel kar do.</p>
<pre class="code"><span class="c">! 1. pakka karo ki ABHI ki working config saved hai</span>
copy running-config startup-config
<span class="c">! 2. safety net lagao: 10 minute mein reload</span>
reload in 10
<span class="c">! 3. risky change karo (abhi SAVE mat karo)</span>
configure terminal
 interface GigabitEthernet0/1
  switchport trunk allowed vlan 10,20
<span class="c">! 4a. chal gaya aur box abhi bhi reachable hai: cancel karo aur save karo</span>
reload cancel
copy running-config startup-config
<span class="c">! 4b. lock ho gaye: kuch mat karo, device 10 minute baad</span>
<span class="c">!     purani startup-config ke saath reload hoga aur aap wapas andar</span></pre>

<div class="eg"><p><b>Worked example.</b> Ticket NK-6410: Pune access switch par guest Wi-Fi ke liye VLAN 30 add karo aur uplink trunk tight karo. Backup: <code>copy running-config tftp:</code> file name <code>HQ-SW1-20261009-pre.cfg</code>. Safety net: <code>copy running-config startup-config</code>, phir <code>reload in 10</code>. Change: VLAN 30 banao, uplink ki allowed list mein add karo, chaar ports assign karo. Verify: <code>show vlan brief</code>, <code>show interfaces trunk</code>, guest laptop ko address milta hai. Sab theek, to <code>reload cancel</code>, dobara save, post backup <code>HQ-SW1-20261009-post.cfg</code>, plan update, ticket result ke saath close. Agar trunk list ne engineer ko cut kar diya hota, to switch das minute baad purani trunk list ke saath reload hota aur change window phir bhi safe rehta.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Verify karne se pehle broken change ko startup-config mein save kar dena, taaki reload fault wapas le aaye. <code>reload in</code> lagakar cancel karna bhool jana, jisse working network reload ho jata hai. Backups sirf usi device par rakhna jo fail hua. Production ko business hours mein bina window ke badalna. Yaad se config edit karna bina ticket ke, aur baad mein koi nahi bata sakta ki kya kiya gaya.</p></div>

<div class="exam"><p><b>Exam traps.</b> <code>copy running-config startup-config</code> aur <code>copy startup-config running-config</code> symmetrical nahi hain: running config mein copy karna <b>merge</b> karta hai, replace nahi. Bina save ke reload unsaved changes hata deta hai. Jaano kaunsi file RAM mein hai (running) aur kaunsi NVRAM mein (startup). Lab mein agar task kahe ki reload ke baad configuration persist honi chahiye, to save karo.</p></div>

<div class="scn"><h4>Trunk jisne engineer ko bahar kar diya</h4><p>Shaam 7 baje ek engineer ne branch switch ke uplink par allowed VLAN list tight ki, usi uplink ke upar chal rahe console session se. Naye list mein management VLAN nahi thi, to uska session freeze ho gaya aur branch ka switch chala gaya. Usne pehle hi <code>reload in 15</code> lagaya tha. Pandrah minute baad switch purani startup configuration ke saath reload hua aur branch wapas aa gaya. Phir usne list mein management VLAN add ki aur change dobara kiya, is baar access khoye bina.</p><p><b>Lesson:</b> safety net ek command ki keemat hai aur site visit ko chai ke break mein badal deta hai.</p></div>

<div class="iv"><p class="q">"Remote device par risky change kaise karte ho?"</p><p>Strong answer: rollback plan ke saath change ticket banata hoon, configuration ka backup device ke bahar leta hoon, working configuration save karta hoon, timed rollback ke liye <code>reload in</code> lagata hoon, chhote steps mein change karta hoon, ladder se verify karta hoon, phir reload cancel, save, fresh backup aur documentation aur ticket update karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har site ke paanch documents: drawing, IP aur VLAN plan, inventory, backups, change log.</li>
<li>Har change se pehle aur baad backup lo, device ke bahar, file name mein date ke saath.</li>
<li>Har change ko ticket chahiye: commands, verification aur rollback ke saath.</li>
<li><code>reload in</code> ko timed rollback ki tarah use karo; verify ke baad hi cancel karo.</li>
<li>Change verify hone tak startup-config mein save mat karo.</li>
</ul></div>
`}};export{e as default};