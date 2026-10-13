var e={id:`troubleshooting`,h:{en:`Troubleshooting templates and groups: failed pushes, out of sync, rollback`,hi:`Templates aur groups troubleshoot karna: failed push, out of sync, rollback`},body:{en:`
<p>When a courier parcel is not delivered, you ask four questions in order: Was it packed correctly? Did it leave the warehouse? Did it reach the address? Did the receiver accept it? A template push fails in the same four places. If you check them in order, most problems are solved in minutes.</p>

<h3>Where a push can fail</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Where a template push fails">
<rect x="10" y="20" width="140" height="70" rx="8" fill="#e2e8f0"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="13">1. Validation</text><text x="80" y="67" text-anchor="middle" class="svg-muted" font-size="11">variables, model, duplicates</text>
<rect x="170" y="20" width="140" height="70" rx="8" fill="#bae6fd"/><text x="240" y="47" text-anchor="middle" class="svg-ink" font-size="13">2. Reachability</text><text x="240" y="67" text-anchor="middle" class="svg-muted" font-size="11">device online? control up?</text>
<rect x="330" y="20" width="140" height="70" rx="8" fill="#ddd6fe"/><text x="400" y="47" text-anchor="middle" class="svg-ink" font-size="13">3. Device commit</text><text x="400" y="67" text-anchor="middle" class="svg-muted" font-size="11">bad line, unsupported</text>
<rect x="490" y="20" width="140" height="70" rx="8" fill="#fde68a"/><text x="560" y="47" text-anchor="middle" class="svg-ink" font-size="13">4. After push</text><text x="560" y="67" text-anchor="middle" class="svg-muted" font-size="11">rollback, out of sync</text>
<rect x="10" y="110" width="620" height="130" rx="8" fill="#f1f5f9"/>
<text x="25" y="135" class="svg-ink" font-size="13">Tools: the task view (status and log of each step), the config preview and diff,</text>
<text x="25" y="157" class="svg-ink" font-size="13">the device list (template status), the Manager audit log (who changed what),</text>
<text x="25" y="179" class="svg-ink" font-size="13">and on the device: show sdwan control connections, show sdwan running-config.</text>
<text x="25" y="209" class="svg-muted" font-size="12">Always read the first red line in the task log. Later lines are usually noise.</text>
</svg><p class="cap">Four places to look, in order.</p></div>

<h3>1. Validation errors</h3>
<p>These stop the push before anything leaves the Manager.</p>
<ul>
<li><b>Missing variable.</b> A Device Specific value is empty. Fill it or upload a corrected CSV.</li>
<li><b>Duplicate values.</b> The same system IP on two devices, or an IP address that overlaps. Make identifiers unique.</li>
<li><b>Wrong model.</b> A feature template or device template for another device model. Templates are model specific; create or select the right one. In the new model, a feature that the chosen platform or software version does not support is flagged.</li>
<li><b>Required section empty</b> in a device template, or a <b>mandatory profile</b> without features in a configuration group.</li>
</ul>

<h3>2. Reachability</h3>
<p>The Manager pushes through the control connection. If the edge shows offline, the push waits or fails, and the real fix belongs in the edge troubleshooting you already know: underlay, control connections, certificates, authorization. Do not edit the template to solve a connectivity problem.</p>

<h3>3. The device rejects the configuration</h3>
<p>Here the task log quotes the device message. Common causes:</p>
<ul>
<li>A typo or an unsupported command in a CLI template or add-on.</li>
<li>A <b>conflict</b> between a feature template and a CLI add-on that configure the same object.</li>
<li>A feature that the software version on the device does not support.</li>
<li>A dependency in the wrong order, such as an interface placed in a VRF that does not exist.</li>
</ul>
<pre class="out">Task: Template attach      Device: E-MUM-1
[11:40:05] Validating template ........ Success
[11:40:06] Device is online
[11:40:08] Pushing configuration to device
[11:40:12] <span class="hl">Failure: Failed to finish task</span>
           % Invalid input detected at '^' marker.
           interface GigabitEthernet3
            vrf forwarding 20      &lt;-- VRF 20 is not defined</pre>
<p>The device keeps its previous configuration. Read the quoted line, correct the template (here, add VPN 20 or use VPN 10), then push again.</p>

<h3>4. After the push: rollback and out of sync</h3>
<p><b>Rollback.</b> If the push changes the WAN so that the device can no longer reach the Manager, the device reverts to its previous configuration when the rollback timer expires. The Manager shows the task as failed or the device as not in sync. Check what you changed on the transport side (address, gateway, color, mask) and test it in the lab or on a pilot with a console.</p>
<p><b>Out of sync.</b> The device status says the running configuration differs from the last pushed one. Open the <b>Config Diff</b> for the device in the Manager. The lines that differ show what someone changed locally.</p>
<pre class="out">Config diff for E-BLR-1 (device vs Manager)
 interface GigabitEthernet3
  vrf forwarding 10
<span class="hl">- ip address 10.3.10.1 255.255.255.0       (Manager)</span>
<span class="hl">+ ip address 10.3.10.254 255.255.255.0     (device)</span></pre>
<p>A local change at 2 a.m. during an incident is a classic cause. Decide which side is right. If the template should win, push again. If the local change should stay, edit the template first. Check <code>show sdwan running-config</code> on the device to see the real state. If the device is in <b>CLI mode</b> (the Manager is not managing its configuration), a template push is not allowed until you switch it to Manager mode.</p>

<h3>Configuration group specific checks</h3>
<ul>
<li>Is the device <b>associated</b> with the group (manually or by a tag rule)? A wrong tag leaves it out or puts it in the wrong group.</li>
<li>Are both <b>mandatory profiles</b> complete?</li>
<li>Was a <b>policy group</b> deployed to a device that is not managed by a configuration group?</li>
<li>Is the device still attached to a legacy <b>device template</b>? One model at a time.</li>
</ul>

<h3>Worked tickets</h3>
<p><b>Ticket 1: "Attach fails immediately."</b> The preview page shows a red message "variable lan_ip is required". One row of the CSV was shorter than the others. Fix the CSV and retry.</p>
<p><b>Ticket 2: "Push to the Pune branch fails with a conflict."</b> A CLI add-on and the VPN interface template both configure GigabitEthernet3. Move the setting into the feature template and keep the add-on only for the DHCP pool.</p>
<p><b>Ticket 3: "Hyderabad shows Out of Sync."</b> Config Diff shows a different LAN IP. A field engineer fixed an IP clash by CLI during an outage. The team keeps the change by updating the Device Specific value and then pushing again.</p>
<p><b>Ticket 4: "After a push, a branch went dark and came back after a few minutes."</b> The template changed the WAN mask. The device lost the Manager, the rollback timer fired and the old configuration returned. The WAN change was corrected and tested on a pilot.</p>

<div class="warn"><p><b>Common mistakes.</b> Editing the template when the real problem is connectivity; ignoring the first error and chasing later lines; fixing an out-of-sync device by pushing without reading the diff (this erases a legitimate emergency fix); and no pilot for WAN changes.</p></div>
<div class="exam"><p><b>Exam trap.</b> A failed push leaves the old configuration. Out of Sync means the device differs from the last push. Rollback is a protection against lost Manager connectivity. Model mismatch and missing variables are validation errors.</p></div>

<div class="scn"><h4>The Friday-night out-of-sync alarm</h4><p>On Friday night the monitoring showed 5 branches Out of Sync. The on-call engineer opened each Config Diff: all five showed the same extra line, an ACL, added by the security team during a scan response. She asked the security team, confirmed the ACL was right, added it to a CLI add-on profile, and pushed. All five went back to In Sync, and the ACL stayed.</p><p><b>Lesson:</b> out of sync is information. Decide, then update the source of truth.</p></div>

<div class="iv"><p class="q">"A template push to a branch router failed. How do you troubleshoot?"</p><p>Strong answer: read the task log for the first failure. Validation (variables, duplicates, model) happens before sending. If the device is offline, fix the control connection. If the device rejected a line, read the quoted message, look for typos, conflicts between add-on and feature templates, VRFs or unsupported features, and fix the template. After a successful push check the status; if Out of Sync read the Config Diff. The old config stays after a failed commit, and a rollback timer protects connectivity.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Check four places in order: validation, reachability, device commit, after-push state.</li>
<li>Read the first failure in the task log; the device quotes the rejected line.</li>
<li>Failed commits leave the old configuration; a rollback timer protects Manager connectivity.</li>
<li>Out of Sync means local changes; read the Config Diff and decide which side wins.</li>
<li>For groups also check association, mandatory profiles, tags and the one-model-per-device rule.</li>
</ul></div>
`,hi:`
<p>Jab courier parcel deliver nahi hota, aap chaar sawal order mein poochte ho: Kya sahi pack hua tha? Kya warehouse se nikla? Kya address par pahuncha? Kya receiver ne accept kiya? Template push bhi inhi chaar jagahon par fail hota hai. Agar aap unhe order mein check karo, to zyada tar problems minutes mein solve ho jaati hain.</p>

<h3>Push kahan fail ho sakta hai</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Template push kahan fail hota hai">
<rect x="10" y="20" width="140" height="70" rx="8" fill="#e2e8f0"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="13">1. Validation</text><text x="80" y="67" text-anchor="middle" class="svg-muted" font-size="11">variables, model, duplicates</text>
<rect x="170" y="20" width="140" height="70" rx="8" fill="#bae6fd"/><text x="240" y="47" text-anchor="middle" class="svg-ink" font-size="13">2. Reachability</text><text x="240" y="67" text-anchor="middle" class="svg-muted" font-size="11">device online? control up?</text>
<rect x="330" y="20" width="140" height="70" rx="8" fill="#ddd6fe"/><text x="400" y="47" text-anchor="middle" class="svg-ink" font-size="13">3. Device commit</text><text x="400" y="67" text-anchor="middle" class="svg-muted" font-size="11">bad line, unsupported</text>
<rect x="490" y="20" width="140" height="70" rx="8" fill="#fde68a"/><text x="560" y="47" text-anchor="middle" class="svg-ink" font-size="13">4. After push</text><text x="560" y="67" text-anchor="middle" class="svg-muted" font-size="11">rollback, out of sync</text>
<rect x="10" y="110" width="620" height="130" rx="8" fill="#f1f5f9"/>
<text x="25" y="135" class="svg-ink" font-size="13">Tools: task view (har step ka status aur log), config preview aur diff,</text>
<text x="25" y="157" class="svg-ink" font-size="13">device list (template status), Manager audit log (kisne kya badla),</text>
<text x="25" y="179" class="svg-ink" font-size="13">aur device par: show sdwan control connections, show sdwan running-config.</text>
<text x="25" y="209" class="svg-muted" font-size="12">Task log ki pehli red line hamesha padho. Baad ki lines aksar noise hoti hain.</text>
</svg><p class="cap">Dekhne ki chaar jagah, order mein.</p></div>

<h3>1. Validation errors</h3>
<p>Yeh push ko Manager se kuch nikalne se pehle rok dete hain.</p>
<ul>
<li><b>Missing variable.</b> Koi Device Specific value khaali hai. Use bharo ya corrected CSV upload karo.</li>
<li><b>Duplicate values.</b> Do devices par same system IP, ya overlap karta IP address. Identifiers unique karo.</li>
<li><b>Galat model.</b> Doosre device model ka feature template ya device template. Templates model specific hote hain; sahi wala banao ya chuno. Naye model mein, jo feature chuna gaya platform ya software version support nahi karta use flag kiya jaata hai.</li>
<li>Device template mein <b>required section khaali</b>, ya configuration group mein bina features ka <b>mandatory profile</b>.</li>
</ul>

<h3>2. Reachability</h3>
<p>Manager control connection ke zariye push karta hai. Agar edge offline dikhe, to push wait karta hai ya fail hota hai, aur asli fix us edge troubleshooting mein hai jo aap pehle se jaante ho: underlay, control connections, certificates, authorization. Connectivity problem solve karne ke liye template edit mat karo.</p>

<h3>3. Device configuration reject karta hai</h3>
<p>Yahan task log device ka message quote karta hai. Common causes:</p>
<ul>
<li>CLI template ya add-on mein typo ya unsupported command.</li>
<li>Feature template aur CLI add-on ke beech <b>conflict</b> jo same object configure karte hain.</li>
<li>Aisa feature jo device ka software version support nahi karta.</li>
<li>Galat order mein dependency, jaise interface aise VRF mein jo exist nahi karta.</li>
</ul>
<pre class="out">Task: Template attach      Device: E-MUM-1
[11:40:05] Validating template ........ Success
[11:40:06] Device is online
[11:40:08] Pushing configuration to device
[11:40:12] <span class="hl">Failure: Failed to finish task</span>
           % Invalid input detected at '^' marker.
           interface GigabitEthernet3
            vrf forwarding 20      &lt;-- VRF 20 define nahi hai</pre>
<p>Device apni pichhli configuration rakhta hai. Quote ki gayi line padho, template theek karo (yahan VPN 20 jodo ya VPN 10 use karo), phir dobara push karo.</p>

<h3>4. Push ke baad: rollback aur out of sync</h3>
<p><b>Rollback.</b> Agar push WAN ko aise badal de ki device Manager tak na pahunch sake, to rollback timer expire hone par device apni pichhli configuration par wapas chala jaata hai. Manager task ko failed ya device ko not in sync dikhata hai. Transport side par jo badla (address, gateway, color, mask) use check karo aur lab mein ya console wale pilot par test karo.</p>
<p><b>Out of sync.</b> Device status kehta hai ki running configuration aakhri pushed configuration se alag hai. Manager mein device ka <b>Config Diff</b> kholo. Jo lines alag hain woh dikhati hain ki kisi ne locally kya badla.</p>
<pre class="out">E-BLR-1 ka config diff (device vs Manager)
 interface GigabitEthernet3
  vrf forwarding 10
<span class="hl">- ip address 10.3.10.1 255.255.255.0       (Manager)</span>
<span class="hl">+ ip address 10.3.10.254 255.255.255.0     (device)</span></pre>
<p>Incident ke dauraan raat 2 baje ka local change classic wajah hai. Tay karo kaunsa side sahi hai. Agar template jeetna chahiye to dobara push karo. Agar local change rehna chahiye to pehle template edit karo. Asli state dekhne ke liye device par <code>show sdwan running-config</code> check karo. Agar device <b>CLI mode</b> mein hai (Manager uski configuration manage nahi kar raha), to jab tak use Manager mode mein na karo template push allowed nahi hai.</p>

<h3>Configuration group ke specific checks</h3>
<ul>
<li>Kya device group se <b>associated</b> hai (manually ya tag rule se)? Galat tag use bahar chhod deta hai ya galat group mein daal deta hai.</li>
<li>Kya dono <b>mandatory profiles</b> poore hain?</li>
<li>Kya <b>policy group</b> aise device par deploy hua jo configuration group se managed nahi hai?</li>
<li>Kya device abhi bhi legacy <b>device template</b> se attached hai? Ek waqt mein ek model.</li>
</ul>

<h3>Worked tickets</h3>
<p><b>Ticket 1: "Attach turant fail hota hai."</b> Preview page red message dikhata hai "variable lan_ip is required". CSV ki ek row baaki se chhoti thi. CSV theek karo aur retry karo.</p>
<p><b>Ticket 2: "Pune branch par push conflict ke saath fail."</b> CLI add-on aur VPN interface template dono GigabitEthernet3 configure karte hain. Setting ko feature template mein le jao aur add-on sirf DHCP pool ke liye rakho.</p>
<p><b>Ticket 3: "Hyderabad Out of Sync dikhata hai."</b> Config Diff alag LAN IP dikhata hai. Field engineer ne outage ke dauraan IP clash CLI se theek kiya. Team Device Specific value update karke aur dobara push karke change rakhti hai.</p>
<p><b>Ticket 4: "Push ke baad branch dark ho gaya aur kuch minute baad wapas aaya."</b> Template ne WAN mask badla. Device ne Manager kho diya, rollback timer fire hua aur purani configuration wapas aayi. WAN change theek karke pilot par test kiya gaya.</p>

<div class="warn"><p><b>Common mistakes.</b> Asli problem connectivity ho tab template edit karna; pehli error ignore karke baad ki lines ke peeche padna; out-of-sync device ko diff padhe bina push karke theek karna (isse legitimate emergency fix mit jaata hai); aur WAN changes ke liye pilot na karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Failed push purani configuration rehne deta hai. Out of Sync ka matlab device aakhri push se alag hai. Rollback Manager connectivity khone se bachata hai. Model mismatch aur missing variables validation errors hain.</p></div>

<div class="scn"><h4>Friday raat ka out-of-sync alarm</h4><p>Friday raat monitoring ne 5 branches Out of Sync dikhaye. On-call engineer ne har Config Diff kholi: paanchon mein wahi extra line thi, ek ACL, jo security team ne scan response ke dauraan jodi thi. Usne security team se poocha, confirm kiya ki ACL sahi hai, use CLI add-on profile mein jodha, aur push kiya. Paanchon In Sync ho gaye, aur ACL bani rahi.</p><p><b>Seekh:</b> out of sync ek information hai. Tay karo, phir source of truth update karo.</p></div>

<div class="iv"><p class="q">"Branch router par template push fail ho gaya. Kaise troubleshoot karoge?"</p><p>Strong answer: task log mein pehli failure padho. Validation (variables, duplicates, model) bhejne se pehle hota hai. Device offline ho to control connection theek karo. Device ne line reject ki ho to quote kiya message padho, typos, add-on aur feature templates ke conflict, VRFs ya unsupported features dhoondho, aur template theek karo. Successful push ke baad status check karo; Out of Sync ho to Config Diff padho. Failed commit ke baad purani config rehti hai, aur rollback timer connectivity bachata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chaar jagah order mein check karo: validation, reachability, device commit, push ke baad ki state.</li>
<li>Task log ki pehli failure padho; device reject ki gayi line quote karta hai.</li>
<li>Failed commits purani configuration rakhte hain; rollback timer Manager connectivity bachata hai.</li>
<li>Out of Sync ka matlab local changes; Config Diff padho aur tay karo kaunsa side jeete.</li>
<li>Groups ke liye association, mandatory profiles, tags aur ek-model-per-device rule bhi check karo.</li>
</ul></div>
`}};export{e as default};