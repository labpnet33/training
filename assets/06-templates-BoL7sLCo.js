var e={id:`templates`,h:{en:`Templates: vNIC, vHBA and service profile templates`,hi:`Templates: vNIC, vHBA aur service profile templates`},body:{en:`
<p>A builder who puts up a housing society does not draw every flat from scratch. He draws one floor plan and stamps it fifty times. If the plan is linked, a change to the plan (a wider door) reaches every flat; if the plan was only photocopied, each flat keeps what it got. UCS templates work exactly like that, and the difference between "linked" and "photocopied" is the most important design decision in this chapter.</p>

<h3>vNIC templates (LAN ▸ Policies ▸ vNIC Templates)</h3>
<p>A vNIC template describes one virtual NIC: the <b>fabric</b> (A or B), whether <b>fabric failover</b> is enabled, the <b>VLANs</b> it carries and which one (if any) is <b>native</b> (untagged), the <b>MTU</b>, the <b>MAC pool</b>, and optional QoS, network control and pin group policies. In Lab 1 you build two:</p>
<table class="cmp"><tr><th>Template</th><th>Fabric</th><th>Type</th><th>VLANs</th><th>MTU</th><th>MAC pool</th></tr>
<tr><td>vNIC-A</td><td>A</td><td>Updating</td><td>MGMT, VMOTION, VM-DATA (no native)</td><td>9000</td><td>MAC-A</td></tr>
<tr><td>vNIC-B</td><td>B</td><td>Updating</td><td>MGMT, VMOTION, VM-DATA (no native)</td><td>9000</td><td>MAC-B</td></tr>
</table>
<p>No native VLAN is needed because ESXi tags its port groups. A bare-metal server that does not tag would need one VLAN marked native. Newer UCSM releases also let you pair two templates as a <b>redundancy pair</b> (primary and secondary) so a VLAN added to vNIC-A is automatically copied to vNIC-B.</p>

<h3>Fabric failover: when and when not</h3>
<p>With <b>Enable Failover</b> ticked, a vNIC on fabric A moves to fabric B in hardware if its path (IOM, FI or all uplinks) fails; the OS sees no link change. It is ideal for a bare-metal OS with one NIC, or for a simple management vNIC. For hypervisors the usual design is <b>two vNICs, one per fabric, failover off</b>, and let the ESXi teaming handle the failure, so the hypervisor knows which path is actually up. Do not stack both mechanisms without a reason. Fabric failover does not exist for vHBAs: FC redundancy always comes from two vHBAs and host multipathing.</p>

<h3>vHBA templates (SAN ▸ Policies ▸ vHBA Templates)</h3>
<p>A vHBA template holds the fabric, the <b>VSAN</b>, the <b>WWPN pool</b> and QoS/adapter settings. Lab 1: vHBA-A (fabric A, VSAN-A = VSAN 10, WWPN-A) and vHBA-B (fabric B, VSAN-B = VSAN 20, WWPN-B). A vHBA placed in the wrong VSAN logs in to a fabric where the storage target does not exist, which is exactly one of the faults in the ticket lab.</p>

<h3>LAN and SAN connectivity policies</h3>
<p>Instead of listing vNICs inside every profile template, you can group them: a <b>LAN connectivity policy</b> contains the vNICs (eth0 from vNIC-A, eth1 from vNIC-B, and so on), and a <b>SAN connectivity policy</b> contains the WWNN pool and the vHBAs (fc0 from vHBA-A, fc1 from vHBA-B). Several service profile templates (ESXi, Linux, Windows) can then reuse the same connectivity definition.</p>

<h3>Service profile templates</h3>
<p>A <b>service profile template</b> (Servers ▸ Service Profile Templates) is a whole server blueprint: UUID pool, vNICs and vHBAs (directly or via connectivity policies), WWNN pool, boot policy, BIOS policy, maintenance policy, host firmware package, server pool assignment and more. The wizard has six main steps in the lab: Identify, Networking, Storage, Boot Order, Server Assignment, Operational Policies.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Initial versus updating template">
<rect x="20" y="15" width="280" height="200" rx="10" fill="#e2e8f0"/><text x="160" y="40" text-anchor="middle" class="svg-ink" font-size="14">Initial template</text>
<rect x="90" y="55" width="140" height="36" rx="8" fill="#fde68a"/><text x="160" y="78" text-anchor="middle" class="svg-ink" font-size="12">Template v2</text>
<rect x="40" y="150" width="110" height="36" rx="8" fill="#bbf7d0"/><text x="95" y="173" text-anchor="middle" class="svg-ink" font-size="12">Profile (v1)</text>
<rect x="170" y="150" width="110" height="36" rx="8" fill="#bbf7d0"/><text x="225" y="173" text-anchor="middle" class="svg-ink" font-size="12">Profile (v1)</text>
<text x="160" y="125" text-anchor="middle" class="svg-muted" font-size="12">copied once, no link</text>
<rect x="340" y="15" width="280" height="200" rx="10" fill="#e2e8f0"/><text x="480" y="40" text-anchor="middle" class="svg-ink" font-size="14">Updating template</text>
<rect x="410" y="55" width="140" height="36" rx="8" fill="#fde68a"/><text x="480" y="78" text-anchor="middle" class="svg-ink" font-size="12">Template v2</text>
<rect x="360" y="150" width="110" height="36" rx="8" fill="#bbf7d0"/><text x="415" y="173" text-anchor="middle" class="svg-ink" font-size="12">Profile (v2)</text>
<rect x="490" y="150" width="110" height="36" rx="8" fill="#bbf7d0"/><text x="545" y="173" text-anchor="middle" class="svg-ink" font-size="12">Profile (v2)</text>
<line x1="460" y1="91" x2="415" y2="150" stroke="#64748b" stroke-width="2"/><line x1="500" y1="91" x2="545" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="480" y="205" text-anchor="middle" class="svg-accent" font-size="12">every change is pushed</text>
</svg><p class="cap">Initial = photocopy at creation time. Updating = permanent link; the template is the single source of truth.</p></div>

<h3>Initial versus updating, and the risk</h3>
<ul>
<li><b>Initial template.</b> Profiles are created from it and then live independently. Editing the template does nothing to them. Safe, but profiles drift apart over time.</li>
<li><b>Updating template.</b> Profiles stay bound. Every template edit is pushed to every bound profile. You cannot edit a bound profile's settings directly; you edit the template or <b>unbind</b> the profile.</li>
</ul>
<p>The danger is the combination of an updating template, a disruptive change and a maintenance policy of Immediate: one click reboots every bound server at the same time. The same applies to updating vNIC/vHBA templates: changing a VSAN in an updating vHBA template reaches every profile that uses it.</p>

<pre class="code"><span class="c">! vNIC template in the CLI</span>
UCS-A# scope org /
UCS-A /org # create vnic-templ vNIC-A
UCS-A /org/vnic-templ* # set fabric a
UCS-A /org/vnic-templ* # set type updating-template
UCS-A /org/vnic-templ* # set mtu 9000
UCS-A /org/vnic-templ* # set mac-pool MAC-A
UCS-A /org/vnic-templ* # create eth-if MGMT
UCS-A /org/vnic-templ/eth-if* # exit
UCS-A /org/vnic-templ* # create eth-if VMOTION
UCS-A /org/vnic-templ/eth-if* # exit
UCS-A /org/vnic-templ* # create eth-if VM-DATA
UCS-A /org/vnic-templ/eth-if* # commit-buffer</pre>

<div class="eg"><p><b>Worked example: what a template edit costs.</b> Template ESXi-SPT (updating) has 40 bound profiles and the maintenance policy MAINT-USERACK. You add a third vNIC for a backup network. That is disruptive, so 40 entries appear in Pending Activities and nothing reboots. The VMware team places hosts in maintenance mode 4 at a time; you acknowledge 4 reboots every 15 minutes. 40 hosts ÷ 4 = 10 batches × 15 minutes = 2.5 hours, zero VM downtime. With Immediate, the same edit is a 40-host outage.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Enabling fabric failover on vNICs that ESXi already teams. Choosing initial templates "to be safe" and then editing 60 profiles by hand for years. Forgetting that an updating vHBA template change hits every profile. Unbinding a profile to make a quick fix and never re-binding it, so it silently drifts.</p></div>
<div class="exam"><p><b>Exam tip.</b> Initial template = changes do not propagate; updating template = changes propagate to all bound profiles. Fabric failover is a vNIC feature only. LAN/SAN connectivity policies group vNICs/vHBAs for reuse.</p></div>

<div class="scn"><h4>One new vNIC, forty reboots</h4><p>At 11:00 an engineer added vNIC eth2 (backup network) to the updating template ESXi-SPT. The template still used the default maintenance policy with an Immediate reboot policy. Within a minute 40 ESXi hosts rebooted together and the VMware cluster went down. He had tested the change on a lab template that used user-ack and assumed production was the same. The fix after recovery: a MAINT-USERACK policy on every production template, a pre-change check of <b>Template ▸ Properties ▸ Maintenance Policy</b>, and a rule that template edits are done in a change window with Pending Activities acknowledged host by host.</p><p><b>Lesson:</b> updating templates are the right tool; the maintenance policy is what makes them safe.</p></div>

<div class="iv"><p class="q">"Initial or updating service profile template: which would you use in production?"</p><p>Strong answer: updating, because it keeps every server consistent and makes changes a single edit, but only with a user-ack (or scheduled) maintenance policy so disruptive changes queue in Pending Activities and are rolled out host by host. Explain what initial means (no propagation, drift), mention unbinding for exceptions, and give the example of adding a vNIC or changing the boot order across 40 hosts.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>vNIC templates: fabric, failover, VLANs, native VLAN, MTU, MAC pool, QoS and network control.</li>
<li>vHBA templates: fabric, VSAN, WWPN pool; no failover for FC, use two vHBAs and multipathing.</li>
<li>LAN/SAN connectivity policies group vNICs/vHBAs so many templates can share them.</li>
<li>Initial templates copy once; updating templates keep profiles bound and push every change.</li>
<li>Updating templates plus an Immediate maintenance policy can reboot every bound server at once.</li>
</ul></div>
`,hi:`
<p>Housing society banane wala builder har flat shuru se draw nahi karta. Woh ek floor plan banata hai aur use pachaas baar stamp karta hai. Agar plan linked hai, to plan ka change (chauda darwaza) har flat tak pahunchta hai; agar plan sirf photocopy hua tha, to har flat ke paas wahi rehta hai jo use mila. UCS templates bilkul aise hi kaam karte hain, aur "linked" aur "photocopy" ka farak is chapter ka sabse zaroori design decision hai.</p>

<h3>vNIC templates (LAN ▸ Policies ▸ vNIC Templates)</h3>
<p>vNIC template ek virtual NIC describe karta hai: <b>fabric</b> (A ya B), <b>fabric failover</b> enabled hai ya nahi, kaunse <b>VLANs</b> carry karta hai aur unmein se kaunsa (agar koi) <b>native</b> (untagged) hai, <b>MTU</b>, <b>MAC pool</b>, aur optional QoS, network control aur pin group policies. Lab 1 mein aap do banate ho:</p>
<table class="cmp"><tr><th>Template</th><th>Fabric</th><th>Type</th><th>VLANs</th><th>MTU</th><th>MAC pool</th></tr>
<tr><td>vNIC-A</td><td>A</td><td>Updating</td><td>MGMT, VMOTION, VM-DATA (native nahi)</td><td>9000</td><td>MAC-A</td></tr>
<tr><td>vNIC-B</td><td>B</td><td>Updating</td><td>MGMT, VMOTION, VM-DATA (native nahi)</td><td>9000</td><td>MAC-B</td></tr>
</table>
<p>Native VLAN ki zaroorat nahi kyunki ESXi apne port groups tag karta hai. Bare-metal server jo tag nahi karta use ek VLAN native mark karna padega. Naye UCSM releases do templates ko <b>redundancy pair</b> (primary aur secondary) bhi banane dete hain taaki vNIC-A mein joda gaya VLAN automatically vNIC-B mein copy ho jaaye.</p>

<h3>Fabric failover: kab aur kab nahi</h3>
<p><b>Enable Failover</b> tick karne par fabric A ka vNIC hardware mein fabric B par chala jaata hai agar uska path (IOM, FI ya saare uplinks) fail ho; OS ko koi link change nahi dikhta. Yeh ek NIC wale bare-metal OS, ya simple management vNIC ke liye ideal hai. Hypervisors ke liye usual design hai <b>do vNICs, har fabric par ek, failover off</b>, aur failure ESXi teaming ko handle karne do, taaki hypervisor jaane ki kaunsa path sach mein up hai. Bina wajah dono mechanisms ek saath mat lagao. vHBAs ke liye fabric failover exist hi nahi karta: FC redundancy hamesha do vHBAs aur host multipathing se aati hai.</p>

<h3>vHBA templates (SAN ▸ Policies ▸ vHBA Templates)</h3>
<p>vHBA template fabric, <b>VSAN</b>, <b>WWPN pool</b> aur QoS/adapter settings rakhta hai. Lab 1: vHBA-A (fabric A, VSAN-A = VSAN 10, WWPN-A) aur vHBA-B (fabric B, VSAN-B = VSAN 20, WWPN-B). Galat VSAN mein rakha vHBA aise fabric mein login karta hai jahan storage target exist hi nahi karta, aur yahi ticket lab ki ek galti hai.</p>

<h3>LAN aur SAN connectivity policies</h3>
<p>Har profile template ke andar vNICs list karne ki jagah aap unhe group kar sakte ho: <b>LAN connectivity policy</b> mein vNICs hote hain (vNIC-A se eth0, vNIC-B se eth1, aur aage), aur <b>SAN connectivity policy</b> mein WWNN pool aur vHBAs (vHBA-A se fc0, vHBA-B se fc1). Phir kai service profile templates (ESXi, Linux, Windows) same connectivity definition reuse kar sakte hain.</p>

<h3>Service profile templates</h3>
<p><b>Service profile template</b> (Servers ▸ Service Profile Templates) poore server ka blueprint hai: UUID pool, vNICs aur vHBAs (seedhe ya connectivity policies se), WWNN pool, boot policy, BIOS policy, maintenance policy, host firmware package, server pool assignment aur bahut kuch. Lab mein wizard ke chhe main steps hain: Identify, Networking, Storage, Boot Order, Server Assignment, Operational Policies.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Initial vs updating template">
<rect x="20" y="15" width="280" height="200" rx="10" fill="#e2e8f0"/><text x="160" y="40" text-anchor="middle" class="svg-ink" font-size="14">Initial template</text>
<rect x="90" y="55" width="140" height="36" rx="8" fill="#fde68a"/><text x="160" y="78" text-anchor="middle" class="svg-ink" font-size="12">Template v2</text>
<rect x="40" y="150" width="110" height="36" rx="8" fill="#bbf7d0"/><text x="95" y="173" text-anchor="middle" class="svg-ink" font-size="12">Profile (v1)</text>
<rect x="170" y="150" width="110" height="36" rx="8" fill="#bbf7d0"/><text x="225" y="173" text-anchor="middle" class="svg-ink" font-size="12">Profile (v1)</text>
<text x="160" y="125" text-anchor="middle" class="svg-muted" font-size="12">ek baar copy, link nahi</text>
<rect x="340" y="15" width="280" height="200" rx="10" fill="#e2e8f0"/><text x="480" y="40" text-anchor="middle" class="svg-ink" font-size="14">Updating template</text>
<rect x="410" y="55" width="140" height="36" rx="8" fill="#fde68a"/><text x="480" y="78" text-anchor="middle" class="svg-ink" font-size="12">Template v2</text>
<rect x="360" y="150" width="110" height="36" rx="8" fill="#bbf7d0"/><text x="415" y="173" text-anchor="middle" class="svg-ink" font-size="12">Profile (v2)</text>
<rect x="490" y="150" width="110" height="36" rx="8" fill="#bbf7d0"/><text x="545" y="173" text-anchor="middle" class="svg-ink" font-size="12">Profile (v2)</text>
<line x1="460" y1="91" x2="415" y2="150" stroke="#64748b" stroke-width="2"/><line x1="500" y1="91" x2="545" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="480" y="205" text-anchor="middle" class="svg-accent" font-size="12">har change push hota hai</text>
</svg><p class="cap">Initial = banate waqt photocopy. Updating = permanent link; template hi single source of truth hai.</p></div>

<h3>Initial vs updating, aur uska risk</h3>
<ul>
<li><b>Initial template.</b> Profiles isse bante hain aur phir independently jeete hain. Template edit karne se unpar kuch nahi hota. Safe, lekin samay ke saath profiles alag-alag ho jaate hain (drift).</li>
<li><b>Updating template.</b> Profiles bound rehte hain. Har template edit har bound profile par push hota hai. Bound profile ki settings aap seedhe edit nahi kar sakte; template edit karo ya profile ko <b>unbind</b> karo.</li>
</ul>
<p>Khatra hai updating template, disruptive change aur Immediate maintenance policy ka combination: ek click har bound server ko ek saath reboot kar deta hai. Yahi updating vNIC/vHBA templates par bhi lagu hai: updating vHBA template mein VSAN badalna use use karne wale har profile tak pahunchta hai.</p>

<pre class="code"><span class="c">! CLI mein vNIC template</span>
UCS-A# scope org /
UCS-A /org # create vnic-templ vNIC-A
UCS-A /org/vnic-templ* # set fabric a
UCS-A /org/vnic-templ* # set type updating-template
UCS-A /org/vnic-templ* # set mtu 9000
UCS-A /org/vnic-templ* # set mac-pool MAC-A
UCS-A /org/vnic-templ* # create eth-if MGMT
UCS-A /org/vnic-templ/eth-if* # exit
UCS-A /org/vnic-templ* # create eth-if VMOTION
UCS-A /org/vnic-templ/eth-if* # exit
UCS-A /org/vnic-templ* # create eth-if VM-DATA
UCS-A /org/vnic-templ/eth-if* # commit-buffer</pre>

<div class="eg"><p><b>Worked example: template edit ki keemat.</b> Template ESXi-SPT (updating) ke 40 bound profiles hain aur maintenance policy MAINT-USERACK hai. Aap backup network ke liye teesra vNIC jodte ho. Yeh disruptive hai, isliye Pending Activities mein 40 entries aati hain aur kuch reboot nahi hota. VMware team ek baar mein 4 hosts maintenance mode mein daalti hai; aap har 15 minute mein 4 reboots acknowledge karte ho. 40 hosts ÷ 4 = 10 batches × 15 minute = 2.5 ghante, zero VM downtime. Immediate ke saath yahi edit 40-host outage hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Un vNICs par fabric failover enable karna jinhe ESXi pehle se team karta hai. "Safe rehne ke liye" initial templates chunna aur phir saalon tak 60 profiles haath se edit karna. Bhool jaana ki updating vHBA template ka change har profile ko lagta hai. Quick fix ke liye profile unbind karna aur kabhi re-bind na karna, jisse woh chupchaap drift karta rehta hai.</p></div>
<div class="exam"><p><b>Exam tip.</b> Initial template = changes propagate nahi hote; updating template = changes saare bound profiles tak propagate hote hain. Fabric failover sirf vNIC feature hai. LAN/SAN connectivity policies reuse ke liye vNICs/vHBAs ko group karti hain.</p></div>

<div class="scn"><h4>Ek naya vNIC, chaalis reboots</h4><p>11:00 baje ek engineer ne updating template ESXi-SPT mein vNIC eth2 (backup network) joda. Template ab bhi default maintenance policy use kar raha tha jiski reboot policy Immediate thi. Ek minute mein 40 ESXi hosts ek saath reboot hue aur VMware cluster down ho gaya. Usne change ek lab template par test kiya tha jo user-ack use karta tha aur maan liya ki production bhi waisa hi hai. Recovery ke baad fix: har production template par MAINT-USERACK policy, change se pehle <b>Template ▸ Properties ▸ Maintenance Policy</b> ka check, aur rule ki template edits change window mein hon aur Pending Activities host by host acknowledge ho.</p><p><b>Seekh:</b> updating templates sahi tool hain; unhe safe maintenance policy banati hai.</p></div>

<div class="iv"><p class="q">"Initial ya updating service profile template: production mein kaunsa use karoge?"</p><p>Strong answer: updating, kyunki yeh har server ko consistent rakhta hai aur changes ko ek edit bana deta hai, lekin sirf user-ack (ya scheduled) maintenance policy ke saath taaki disruptive changes Pending Activities mein queue hon aur host by host roll out hon. Batao initial ka matlab kya hai (propagation nahi, drift), exceptions ke liye unbinding mention karo, aur 40 hosts par vNIC jodne ya boot order badalne ka example do.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>vNIC templates: fabric, failover, VLANs, native VLAN, MTU, MAC pool, QoS aur network control.</li>
<li>vHBA templates: fabric, VSAN, WWPN pool; FC ke liye failover nahi, do vHBAs aur multipathing use karo.</li>
<li>LAN/SAN connectivity policies vNICs/vHBAs ko group karti hain taaki kai templates unhe share karein.</li>
<li>Initial templates ek baar copy karte hain; updating templates profiles ko bound rakhte hain aur har change push karte hain.</li>
<li>Updating templates plus Immediate maintenance policy har bound server ko ek saath reboot kar sakte hain.</li>
</ul></div>
`}};export{e as default};