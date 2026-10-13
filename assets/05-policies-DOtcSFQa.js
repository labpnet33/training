var e={id:`policies`,h:{en:`Policies: boot, BIOS, maintenance, firmware, QoS and network control`,hi:`Policies: boot, BIOS, maintenance, firmware, QoS aur network control`},body:{en:`
<p>A restaurant chain does not let every cook decide the recipe. The head office writes one recipe card per dish, and every branch follows it. Pools give a UCS server its identity; <b>policies</b> are the recipe cards that decide how it behaves: what it boots from, how its BIOS is tuned, which firmware it runs, when it is allowed to reboot and how its traffic is treated. Write a policy once, reference it from templates, and every server behaves the same.</p>

<h3>Server policies (Servers ▸ Policies)</h3>
<dl class="terms">
<dt>Boot policy</dt><dd>The ordered list of boot devices: CD/DVD (virtual media), local disk, LAN (PXE on a named vNIC), SAN (a named vHBA plus target WWPN and LUN), iSCSI. It also sets the <b>boot mode</b> (Legacy or UEFI, with optional UEFI secure boot) and <b>Reboot on Boot Order Change</b>. Chapter 8 covers SAN boot in depth.</dd>
<dt>BIOS policy</dt><dd>Hundreds of BIOS tokens in one object: Intel VT and VT-d for hypervisors, Hyper-Threading, Turbo Boost, CPU C-states and power profiles, memory settings. The labs use BIOS-ESX (VT enabled, Hyper-Threading enabled). A mismatched BIOS policy is a common cause of "VMs are slow on the new cluster".</dd>
<dt>Maintenance policy</dt><dd>Decides <b>when</b> a disruptive change is applied. Reboot policy <b>Immediate</b> (reboot now), <b>User Ack</b> (wait until an administrator acknowledges in Pending Activities) or <b>Timer Automatic</b> (wait for a schedule). The <b>On Next Boot</b> option also applies the change when the OS itself reboots. This is the single most important safety net in UCS.</dd>
<dt>Host firmware package</dt><dd>The firmware versions for the server's BIOS, CIMC, adapter (VIC), board controller and storage controller. Associating a profile flashes the server to those versions, so a spare blade from the warehouse comes up on the same firmware as its peers.</dd>
<dt>Local disk configuration policy</dt><dd>What to do with local drives: Any Configuration, No Local Storage, RAID 0, RAID 1 Mirrored and others. SAN-boot hosts often use No Local Storage or Any Configuration.</dd>
<dt>Scrub policy</dt><dd>What to erase when a profile is <b>disassociated</b>: local disks, BIOS settings, FlexFlash. Useful for multi-tenant reuse, dangerous if applied by mistake.</dd>
<dt>Power control policy</dt><dd>The priority of a blade when the chassis must cap power.</dd>
</dl>

<h3>Network and adapter policies (LAN and SAN tabs)</h3>
<dl class="terms">
<dt>QoS system classes</dt><dd>Domain-wide classes under LAN ▸ LAN Cloud ▸ QoS System Class: <b>Platinum</b> (CoS 5), <b>Gold</b> (CoS 4), <b>Silver</b> (CoS 2), <b>Bronze</b> (CoS 1), <b>Best Effort</b> and <b>Fibre Channel</b> (CoS 3, no-drop, for FCoE traffic inside UCS). Best Effort and Fibre Channel are always enabled; the others are disabled until you enable them. Each class has a weight and an <b>MTU</b>.</dd>
<dt>QoS policy</dt><dd>Attached to a vNIC template to put that vNIC's traffic into a class (for example vMotion in Silver, storage in Platinum), with an optional rate limit.</dd>
<dt>Network control policy</dt><dd>Per-vNIC behaviour: <b>CDP</b> on or off, <b>LLDP</b> transmit/receive, <b>MAC register mode</b> (only native VLAN or all host VLANs), <b>action on uplink fail</b> (Link Down, the default, or Warning) and <b>MAC security forged</b> (allow or deny).</dd>
<dt>Adapter policy</dt><dd>Queue, interrupt and RSS tuning for a vNIC or vHBA, with ready-made versions per OS (VMWare, Windows, Linux).</dd>
<dt>vNIC/vHBA placement policy</dt><dd>Maps vNICs and vHBAs to <b>vCons</b> (virtual network interface connections) on the adapter and fixes their PCIe order, so eth0 is always vmnic0 in ESXi.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Policies referenced by a service profile template">
<rect x="230" y="80" width="180" height="50" rx="10" fill="#fde68a"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">Service profile template</text>
<rect x="20" y="15" width="140" height="36" rx="8" fill="#bae6fd"/><text x="90" y="38" text-anchor="middle" class="svg-ink" font-size="12">Boot BOOT-SAN</text>
<rect x="250" y="12" width="140" height="36" rx="8" fill="#bae6fd"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="12">BIOS BIOS-ESX</text>
<rect x="480" y="15" width="140" height="36" rx="8" fill="#bae6fd"/><text x="550" y="38" text-anchor="middle" class="svg-ink" font-size="12">Maint USER-ACK</text>
<rect x="20" y="160" width="140" height="36" rx="8" fill="#bbf7d0"/><text x="90" y="183" text-anchor="middle" class="svg-ink" font-size="12">Firmware HFP</text>
<rect x="250" y="165" width="140" height="36" rx="8" fill="#bbf7d0"/><text x="320" y="188" text-anchor="middle" class="svg-ink" font-size="12">Local disk</text>
<rect x="480" y="160" width="140" height="36" rx="8" fill="#bbf7d0"/><text x="550" y="183" text-anchor="middle" class="svg-ink" font-size="12">vNIC placement</text>
<line x1="160" y1="40" x2="240" y2="85" stroke="#64748b" stroke-width="2"/><line x1="320" y1="48" x2="320" y2="80" stroke="#64748b" stroke-width="2"/><line x1="480" y1="40" x2="400" y2="85" stroke="#64748b" stroke-width="2"/>
<line x1="160" y1="175" x2="240" y2="125" stroke="#64748b" stroke-width="2"/><line x1="320" y1="165" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><line x1="480" y1="175" x2="400" y2="125" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">A template does not copy policies; it references them by name. Change the policy and every profile that uses it is affected.</p></div>

<h3>Disruptive and non-disruptive changes</h3>
<p>Some changes need the server to reboot because the BIOS or the adapter must be re-programmed; others apply live. Know the difference before you click Save:</p>
<table class="cmp"><tr><th>Usually live (no reboot)</th><th>Needs a reboot (goes through the maintenance policy)</th></tr>
<tr><td>Adding or removing VLANs on a vNIC, QoS policy, network control policy, description</td><td>Boot order changes, BIOS policy, host firmware package, adding or removing vNICs/vHBAs, changing a vHBA's VSAN, placement and adapter policy changes</td></tr>
</table>
<p>When a change needs a reboot and the maintenance policy is User Ack, UCSM flags it in <b>Pending Activities</b> (the bell icon in the top bar, and a warning fault on the profile) and does nothing else until someone acknowledges.</p>

<div class="eg"><p><b>Worked example: turning jumbo frames on.</b> An ESXi team needs MTU 9000 for vMotion. Setting 9000 on the vNIC template is not enough: the <b>Best Effort</b> system class (or whichever class the vNIC's QoS policy uses) must also have MTU 9216, otherwise the FI drops frames larger than 1500 bytes. Changing the class MTU is domain-wide and does not reboot servers; changing the vNIC MTU is applied to the adapter. Chapter 10 walks through the full end-to-end check.</p></div>

<pre class="code"><span class="c">! Create a user-ack maintenance policy in the CLI</span>
UCS-A# scope org /
UCS-A /org # create maint-policy MAINT-USERACK
UCS-A /org/maint-policy* # set reboot-policy user-ack
UCS-A /org/maint-policy* # commit-buffer</pre>
<pre class="out">UCS-A /org # show maint-policy MAINT-USERACK
Maintenance Policy:
    Name            Reboot Policy
    --------------- -------------
<span class="hl">    MAINT-USERACK   User Ack</span></pre>

<div class="warn"><p><b>Common mistakes.</b> Leaving templates on the "default" maintenance policy, whose reboot policy is Immediate. Enabling disk scrub on a scrub policy used by production templates (disassociate once and the local data is gone). Setting MTU 9000 on vNICs without touching the system class. Enabling CDP in the network control policy but not LLDP when the upstream team uses LLDP-only tools.</p></div>
<div class="exam"><p><b>Exam tip.</b> Maintenance policy options: Immediate, User Ack, Timer Automatic. Fibre Channel system class = CoS 3, no-drop; Best Effort and FC classes cannot be disabled. The host firmware package upgrades servers; infrastructure firmware (FIs, IOMs) is handled separately.</p></div>

<div class="scn"><h4>Friday 17:05: the BIOS tweak</h4><p>A performance engineer changed the C-states token in BIOS-ESX to reduce latency for a trading application. The policy was referenced by an updating template whose maintenance policy was "default". UCSM applied the change immediately and rebooted 22 ESXi hosts in parallel; vSphere HA could not restart all VMs because every host was rebooting at once. The post-incident fix: every template now references MAINT-USERACK, the ops team reboots hosts one by one from Pending Activities after placing each in ESXi maintenance mode, and BIOS changes need a change ticket.</p><p><b>Lesson:</b> a policy is shared by every profile that references it; the maintenance policy decides whether a shared change becomes a controlled rollout or an outage.</p></div>

<div class="iv"><p class="q">"What is a maintenance policy and why is it critical?"</p><p>Strong answer: it controls when disruptive changes (boot order, BIOS, firmware, adapter changes) reach the server. Immediate reboots now, User Ack queues the change in Pending Activities until an admin acknowledges, Timer Automatic waits for a schedule, and On Next Boot applies it when the OS reboots. With updating templates it is the difference between a rolling, controlled change and many hosts rebooting at once. Say you always attach a user-ack policy to production templates.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policies are reusable settings referenced by name; changing one affects every profile using it.</li>
<li>Key server policies: boot, BIOS, maintenance, host firmware package, local disk, scrub, power.</li>
<li>Key LAN policies: QoS system classes and QoS policies, network control (CDP/LLDP, uplink-fail action), adapter and placement policies.</li>
<li>Maintenance policy: Immediate, User Ack, Timer Automatic; use User Ack in production.</li>
<li>Jumbo frames need both the vNIC MTU and the system class MTU.</li>
</ul></div>
`,hi:`
<p>Restaurant chain har cook ko recipe decide nahi karne deti. Head office har dish ka ek recipe card likhta hai, aur har branch use follow karti hai. Pools UCS server ko uski identity dete hain; <b>policies</b> woh recipe cards hain jo decide karti hain ki server kaise behave kare: kahan se boot ho, uska BIOS kaise tune ho, kaunsa firmware chale, use kab reboot hone ki ijaazat hai aur uske traffic ke saath kaisa vyavhaar ho. Policy ek baar likho, templates se refer karo, aur har server ek jaisa behave karega.</p>

<h3>Server policies (Servers ▸ Policies)</h3>
<dl class="terms">
<dt>Boot policy</dt><dd>Boot devices ki ordered list: CD/DVD (virtual media), local disk, LAN (named vNIC par PXE), SAN (named vHBA plus target WWPN aur LUN), iSCSI. Yeh <b>boot mode</b> (Legacy ya UEFI, optional UEFI secure boot ke saath) aur <b>Reboot on Boot Order Change</b> bhi set karti hai. Chapter 8 SAN boot ko detail mein cover karta hai.</dd>
<dt>BIOS policy</dt><dd>Ek object mein sainkdon BIOS tokens: hypervisors ke liye Intel VT aur VT-d, Hyper-Threading, Turbo Boost, CPU C-states aur power profiles, memory settings. Labs BIOS-ESX use karte hain (VT enabled, Hyper-Threading enabled). Mismatched BIOS policy "naye cluster par VMs slow hain" ki common wajah hai.</dd>
<dt>Maintenance policy</dt><dd>Decide karti hai ki disruptive change <b>kab</b> apply ho. Reboot policy <b>Immediate</b> (abhi reboot), <b>User Ack</b> (tab tak ruko jab tak administrator Pending Activities mein acknowledge na kare) ya <b>Timer Automatic</b> (schedule ka wait). <b>On Next Boot</b> option change ko tab bhi apply karta hai jab OS khud reboot ho. UCS mein yeh sabse zaroori safety net hai.</dd>
<dt>Host firmware package</dt><dd>Server ke BIOS, CIMC, adapter (VIC), board controller aur storage controller ke firmware versions. Profile associate karne par server un versions par flash hota hai, isliye warehouse se aaya spare blade apne peers ke same firmware par aata hai.</dd>
<dt>Local disk configuration policy</dt><dd>Local drives ke saath kya karna hai: Any Configuration, No Local Storage, RAID 0, RAID 1 Mirrored aur doosre. SAN-boot hosts aksar No Local Storage ya Any Configuration use karte hain.</dd>
<dt>Scrub policy</dt><dd>Profile <b>disassociate</b> hone par kya erase karna hai: local disks, BIOS settings, FlexFlash. Multi-tenant reuse ke liye useful, galti se lag jaaye to khatarnak.</dd>
<dt>Power control policy</dt><dd>Jab chassis ko power cap karna pade tab blade ki priority.</dd>
</dl>

<h3>Network aur adapter policies (LAN aur SAN tabs)</h3>
<dl class="terms">
<dt>QoS system classes</dt><dd>LAN ▸ LAN Cloud ▸ QoS System Class ke neeche domain-wide classes: <b>Platinum</b> (CoS 5), <b>Gold</b> (CoS 4), <b>Silver</b> (CoS 2), <b>Bronze</b> (CoS 1), <b>Best Effort</b> aur <b>Fibre Channel</b> (CoS 3, no-drop, UCS ke andar FCoE traffic ke liye). Best Effort aur Fibre Channel hamesha enabled rehte hain; baaki tab tak disabled jab tak aap enable na karo. Har class ka ek weight aur ek <b>MTU</b> hota hai.</dd>
<dt>QoS policy</dt><dd>vNIC template se attach hoti hai taaki us vNIC ka traffic ek class mein jaaye (jaise vMotion Silver mein, storage Platinum mein), optional rate limit ke saath.</dd>
<dt>Network control policy</dt><dd>Per-vNIC behaviour: <b>CDP</b> on ya off, <b>LLDP</b> transmit/receive, <b>MAC register mode</b> (sirf native VLAN ya saare host VLANs), <b>action on uplink fail</b> (Link Down, jo default hai, ya Warning) aur <b>MAC security forged</b> (allow ya deny).</dd>
<dt>Adapter policy</dt><dd>vNIC ya vHBA ke liye queue, interrupt aur RSS tuning, har OS ke liye ready-made versions (VMWare, Windows, Linux) ke saath.</dd>
<dt>vNIC/vHBA placement policy</dt><dd>vNICs aur vHBAs ko adapter ke <b>vCons</b> (virtual network interface connections) par map karti hai aur unka PCIe order fix karti hai, taaki ESXi mein eth0 hamesha vmnic0 ho.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Service profile template dwara refer ki gayi policies">
<rect x="230" y="80" width="180" height="50" rx="10" fill="#fde68a"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">Service profile template</text>
<rect x="20" y="15" width="140" height="36" rx="8" fill="#bae6fd"/><text x="90" y="38" text-anchor="middle" class="svg-ink" font-size="12">Boot BOOT-SAN</text>
<rect x="250" y="12" width="140" height="36" rx="8" fill="#bae6fd"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="12">BIOS BIOS-ESX</text>
<rect x="480" y="15" width="140" height="36" rx="8" fill="#bae6fd"/><text x="550" y="38" text-anchor="middle" class="svg-ink" font-size="12">Maint USER-ACK</text>
<rect x="20" y="160" width="140" height="36" rx="8" fill="#bbf7d0"/><text x="90" y="183" text-anchor="middle" class="svg-ink" font-size="12">Firmware HFP</text>
<rect x="250" y="165" width="140" height="36" rx="8" fill="#bbf7d0"/><text x="320" y="188" text-anchor="middle" class="svg-ink" font-size="12">Local disk</text>
<rect x="480" y="160" width="140" height="36" rx="8" fill="#bbf7d0"/><text x="550" y="183" text-anchor="middle" class="svg-ink" font-size="12">vNIC placement</text>
<line x1="160" y1="40" x2="240" y2="85" stroke="#64748b" stroke-width="2"/><line x1="320" y1="48" x2="320" y2="80" stroke="#64748b" stroke-width="2"/><line x1="480" y1="40" x2="400" y2="85" stroke="#64748b" stroke-width="2"/>
<line x1="160" y1="175" x2="240" y2="125" stroke="#64748b" stroke-width="2"/><line x1="320" y1="165" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><line x1="480" y1="175" x2="400" y2="125" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Template policies copy nahi karta; unhe naam se refer karta hai. Policy badlo aur use use karne wala har profile affect hota hai.</p></div>

<h3>Disruptive aur non-disruptive changes</h3>
<p>Kuch changes ke liye server ko reboot chahiye kyunki BIOS ya adapter ko dobara program karna padta hai; doosre live apply hote hain. Save dabane se pehle farak jaano:</p>
<table class="cmp"><tr><th>Aam taur par live (reboot nahi)</th><th>Reboot chahiye (maintenance policy se hokar jaata hai)</th></tr>
<tr><td>vNIC par VLANs jodna ya hatana, QoS policy, network control policy, description</td><td>Boot order changes, BIOS policy, host firmware package, vNICs/vHBAs jodna ya hatana, vHBA ka VSAN badalna, placement aur adapter policy changes</td></tr>
</table>
<p>Jab kisi change ko reboot chahiye aur maintenance policy User Ack hai, UCSM use <b>Pending Activities</b> mein flag karta hai (top bar ka bell icon, aur profile par ek warning fault) aur jab tak koi acknowledge na kare kuch aur nahi karta.</p>

<div class="eg"><p><b>Worked example: jumbo frames on karna.</b> ESXi team ko vMotion ke liye MTU 9000 chahiye. vNIC template par 9000 set karna kaafi nahi hai: <b>Best Effort</b> system class (ya jo bhi class vNIC ki QoS policy use karti hai) ka MTU bhi 9216 hona chahiye, warna FI 1500 bytes se bade frames drop karta hai. Class MTU badalna domain-wide hai aur servers reboot nahi karta; vNIC MTU badalna adapter par apply hota hai. Chapter 10 poora end-to-end check dikhata hai.</p></div>

<pre class="code"><span class="c">! CLI mein user-ack maintenance policy banao</span>
UCS-A# scope org /
UCS-A /org # create maint-policy MAINT-USERACK
UCS-A /org/maint-policy* # set reboot-policy user-ack
UCS-A /org/maint-policy* # commit-buffer</pre>
<pre class="out">UCS-A /org # show maint-policy MAINT-USERACK
Maintenance Policy:
    Name            Reboot Policy
    --------------- -------------
<span class="hl">    MAINT-USERACK   User Ack</span></pre>

<div class="warn"><p><b>Common galtiyan.</b> Templates ko "default" maintenance policy par chhod dena, jiski reboot policy Immediate hai. Production templates wali scrub policy par disk scrub enable karna (ek baar disassociate karo aur local data gaya). System class ko chhue bina vNICs par MTU 9000 set karna. Network control policy mein CDP enable karna lekin LLDP nahi, jab upstream team sirf LLDP wale tools use karti ho.</p></div>
<div class="exam"><p><b>Exam tip.</b> Maintenance policy options: Immediate, User Ack, Timer Automatic. Fibre Channel system class = CoS 3, no-drop; Best Effort aur FC classes disable nahi ho sakti. Host firmware package servers ko upgrade karta hai; infrastructure firmware (FIs, IOMs) alag se handle hota hai.</p></div>

<div class="scn"><h4>Friday 17:05: BIOS ka chhota sa tweak</h4><p>Ek performance engineer ne trading application ki latency kam karne ke liye BIOS-ESX mein C-states token badla. Yeh policy ek updating template se refer hoti thi jiski maintenance policy "default" thi. UCSM ne change turant apply kiya aur 22 ESXi hosts ek saath reboot kar diye; vSphere HA saare VMs restart nahi kar paaya kyunki har host ek saath reboot ho raha tha. Post-incident fix: ab har template MAINT-USERACK refer karta hai, ops team har host ko ESXi maintenance mode mein daal kar Pending Activities se ek-ek karke reboot karti hai, aur BIOS changes ke liye change ticket chahiye.</p><p><b>Seekh:</b> policy har us profile mein shared hoti hai jo use refer karta hai; maintenance policy decide karti hai ki shared change controlled rollout banega ya outage.</p></div>

<div class="iv"><p class="q">"Maintenance policy kya hai aur yeh critical kyun hai?"</p><p>Strong answer: yeh control karti hai ki disruptive changes (boot order, BIOS, firmware, adapter changes) server tak kab pahunchein. Immediate abhi reboot karta hai, User Ack change ko Pending Activities mein tab tak rokta hai jab tak admin acknowledge na kare, Timer Automatic schedule ka wait karta hai, aur On Next Boot use tab apply karta hai jab OS reboot ho. Updating templates ke saath yahi farak hai rolling, controlled change aur kai hosts ke ek saath reboot hone mein. Batao ki aap production templates par hamesha user-ack policy lagate ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policies naam se refer hone wali reusable settings hain; ek badalne se use use karne wala har profile affect hota hai.</li>
<li>Main server policies: boot, BIOS, maintenance, host firmware package, local disk, scrub, power.</li>
<li>Main LAN policies: QoS system classes aur QoS policies, network control (CDP/LLDP, uplink-fail action), adapter aur placement policies.</li>
<li>Maintenance policy: Immediate, User Ack, Timer Automatic; production mein User Ack use karo.</li>
<li>Jumbo frames ke liye vNIC MTU aur system class MTU dono chahiye.</li>
</ul></div>
`}};export{e as default};