var e={id:`day0`,h:{en:`Day-0 provisioning: POAP, PXE, templates and golden configs`,hi:`Day-0 provisioning: POAP, PXE, templates aur golden configs`},body:{en:`
<p>When a new employee joins a well-run company, they do not spend the first day hunting for a laptop and passwords. Their desk, laptop, badge and accounts are prepared in advance, keyed to their employee number, and ready the moment they walk in. <b>Day-0 provisioning</b> does the same for switches and servers: a brand-new device is racked, cabled and powered on, and it fetches its own software and configuration automatically, based on who it is. Engineers talk about <b>Day 0</b> (first boot and base configuration), <b>Day 1</b> (service configuration such as VLANs and VRFs) and <b>Day 2</b> (operations: monitoring, changes, upgrades).</p>

<h3>POAP: Power-On Auto Provisioning</h3>
<p><b>POAP</b> is the NX-OS feature that provisions a Nexus switch at first boot. It starts automatically when the switch boots <b>without a startup configuration</b>. (With <code>boot poap enable</code> it can run on every boot, which some teams use for rebuilds.) On the console you will see a prompt offering to abort POAP; if nobody answers, POAP continues.</p>
<pre class="out">Abort Power On Auto Provisioning and continue with normal setup ?(yes/no)[n]:
<span class="hl">2026 Sep 29 08:02:14 switch %$ VDC-1 %$ %POAP-2-POAP_INFO: - Using DHCP, information received over mgmt0 from 10.99.10.1</span>
2026 Sep 29 08:02:15 switch %$ VDC-1 %$ %POAP-2-POAP_INFO: - Assigned IP address: 10.99.10.107
2026 Sep 29 08:02:15 switch %$ VDC-1 %$ %POAP-2-POAP_INFO: - Script Name: poap_nexus.py</pre>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="POAP steps">
<rect x="10" y="20" width="140" height="44" rx="8" fill="#e2e8f0"/><text x="80" y="40" text-anchor="middle" class="svg-ink" font-size="13">1. Boot, no</text><text x="80" y="56" text-anchor="middle" class="svg-ink" font-size="13">startup-config</text>
<rect x="170" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="240" y="40" text-anchor="middle" class="svg-ink" font-size="13">2. DHCP: IP,</text><text x="240" y="56" text-anchor="middle" class="svg-ink" font-size="13">server, script</text>
<rect x="330" y="20" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="400" y="40" text-anchor="middle" class="svg-ink" font-size="13">3. Download</text><text x="400" y="56" text-anchor="middle" class="svg-ink" font-size="13">and run script</text>
<rect x="490" y="20" width="140" height="44" rx="8" fill="#fde68a"/><text x="560" y="40" text-anchor="middle" class="svg-ink" font-size="13">4. Get image</text><text x="560" y="56" text-anchor="middle" class="svg-ink" font-size="13">and config</text>
<line x1="150" y1="42" x2="170" y2="42" stroke="#64748b" stroke-width="2"/><line x1="310" y1="42" x2="330" y2="42" stroke="#64748b" stroke-width="2"/><line x1="470" y1="42" x2="490" y2="42" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="110" width="300" height="44" rx="8" fill="#bbf7d0"/><text x="480" y="137" text-anchor="middle" class="svg-ink" font-size="13">5. Set boot image, reboot, apply config</text>
<line x1="560" y1="64" x2="560" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="110" width="300" height="80" rx="8" fill="#fed7aa"/><text x="160" y="135" text-anchor="middle" class="svg-ink" font-size="13">Servers needed</text><text x="160" y="157" text-anchor="middle" class="svg-muted" font-size="12">DHCP (options 66/150, 67)</text><text x="160" y="177" text-anchor="middle" class="svg-muted" font-size="12">TFTP/SCP/HTTP file server</text>
</svg><p class="cap">POAP: DHCP tells the switch where the script is; the script fetches the right image and configuration.</p></div>

<h3>The POAP steps in detail</h3>
<ol>
<li><b>Boot</b>: no startup-config, so the switch enters POAP mode.</li>
<li><b>DHCP</b>: the switch sends DHCP requests on mgmt0 and on its front-panel ports (in-band). The DHCP offer must include an IP address and gateway, the <b>file server</b> (option 66, TFTP server name, or option 150, TFTP server address) and the <b>boot file name</b> (option 67), which is the POAP script. The switch identifies itself with its serial number, so the DHCP server can give each switch a reserved address.</li>
<li><b>Script</b>: the switch downloads the script (usually Cisco's Python POAP script, edited for your site) and runs it. The script contains an MD5 checksum line that must be updated whenever you edit it, or the switch refuses to run it.</li>
<li><b>Image and configuration</b>: the script downloads the target NX-OS image if needed and the device's configuration file. It chooses the file by a <b>mode</b>: serial number (for example <code>conf.FDO23460ABC</code>), MAC address, hostname from DHCP, or location from the CDP neighbor.</li>
<li><b>Finish</b>: the script sets the boot variables and schedules the configuration; the switch reboots with the right image and comes up configured. The script writes a log file on bootflash for troubleshooting.</li>
</ol>
<pre class="code"><span class="c"># ISC DHCP server: one reservation per new leaf</span>
subnet 10.99.10.0 netmask 255.255.255.0 {
  option routers 10.99.10.1;
  option tftp-server-name "10.99.0.40";
  option bootfile-name "poap_nexus.py";
  host leaf-07 {
    hardware ethernet 00:3a:9c:12:34:56;
    fixed-address 10.99.10.107;
  }
}</pre>

<h3>POAP with NDFC</h3>
<p>NDFC can act as the POAP server itself. New switches that boot on the management network appear in the fabric's <b>bootstrap</b> list with their serial number and model. You assign a hostname, management IP and role, and NDFC hands out a startup configuration built from the fabric template. The switch then joins the fabric already managed and compliant. This is the usual way to add leaves to an NDFC-managed VXLAN EVPN fabric.</p>

<h3>PXE for servers</h3>
<p><b>PXE</b> (Preboot eXecution Environment) is the server-side equivalent. The server's network card sends a DHCP request at boot; the reply names a <b>next-server</b> and a boot file; the server loads a small boot loader over TFTP (or over HTTP with iPXE), which then loads an installer. An answer file (kickstart for Linux, autounattend for Windows, a kickstart script for ESXi) makes the operating system install run with no human input. In UCS you enable this with a boot policy that puts LAN/PXE boot first; Intersight also offers automated OS installation.</p>

<h3>Templates and golden configurations</h3>
<p>POAP delivers a file, but where does the file come from? Mature teams never hand-write per-switch configs. They keep a <b>template</b> with variables and a data file per device, and render the final configuration with a tool such as Jinja2 (used by Ansible and by many scripts).</p>
<pre class="code">hostname {{ hostname }}
interface loopback0
  ip address {{ loopback0 }}/32
{% for up in uplinks %}
interface {{ up.name }}
  description to {{ up.peer }}
  no switchport
  mtu 9216
  ip address {{ up.ip }}/31
  ip router ospf UNDERLAY area 0.0.0.0
  no shutdown
{% endfor %}</pre>
<p>A <b>golden configuration</b> is the approved baseline every device of a role must contain: AAA, NTP, logging, SNMPv3, banners, CoPP profile, SSH settings. Stored in Git and rendered from templates, it becomes the reference for compliance checks and for <code>configure replace</code> (chapter 9).</p>

<div class="eg"><p><b>Worked example.</b> A new pod has 24 leaves. Manually, unboxing, console cabling, upgrading NX-OS (about 25 minutes each) and pasting configuration take roughly 45 minutes per switch: 24 x 45 = 1,080 minutes, 18 engineer-hours, with a real risk of pasting LEAF-11's config into LEAF-12. With POAP, the serial numbers from the purchase order are pre-loaded into DHCP reservations (or NDFC), configs are rendered from templates, and the remote-hands team only racks, cables and powers on. All 24 switches provision in parallel in about 40 minutes, each with the configuration tied to its own serial number.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Editing the POAP script without updating its MD5 line. A DHCP server that answers other devices with POAP options, or a second DHCP server on the segment. Firewalls blocking TFTP between the management network and the file server. Configuration files named by the wrong serial (the chassis serial, not a line-card serial). Forgetting that POAP only starts when there is no startup configuration.</p></div>
<div class="exam"><p><b>Exam trap.</b> POAP needs DHCP (IP, gateway, option 66 or 150 for the server, option 67 for the script), a file server and a script; it runs when no startup-config exists. PXE is for servers and uses DHCP plus TFTP (or iPXE over HTTP). NDFC can be the POAP server via its bootstrap feature.</p></div>

<div class="scn"><h4>The leaf that provisioned with its neighbour's config</h4><p>During a pod build, LEAF-12 came up with LEAF-11's hostname and IP addresses, and BGP sessions flapped because two leaves claimed the same router ID. The engineer checked the POAP log on bootflash and saw the script was running in hostname mode, and the DHCP server had a typo that gave both switches the hostname leaf-11. The team switched the script to serial-number mode, named every config file after the chassis serial from the purchase order, erased LEAF-12's startup configuration and rebooted it. POAP ran again and provisioned it correctly.</p><p><b>Lesson:</b> tie Day-0 configuration to an identity that cannot be mistyped at the site, such as the serial number.</p></div>

<div class="iv"><p class="q">"Walk me through what happens when a new Nexus switch boots with POAP."</p><p>Strong answer: no startup-config, so POAP starts; DHCP on mgmt0 or in-band gives IP, gateway, server (option 66/150) and script name (option 67); the switch downloads and validates the script (MD5), the script fetches the image and the device-specific config (by serial, MAC, hostname or CDP location), sets boot variables and reboots; the switch comes up configured. Mention NDFC as a POAP server and the log file on bootflash for troubleshooting.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Day 0 is first boot and baseline; Day 1 is services; Day 2 is operations.</li>
<li>POAP runs when there is no startup-config: DHCP, script download, image and config download, reboot.</li>
<li>DHCP options: 66 or 150 for the file server, 67 for the script name.</li>
<li>PXE provisions servers with DHCP, TFTP or iPXE, and an unattended installer.</li>
<li>Render configs from templates and keep a golden baseline in Git for compliance and config replace.</li>
</ul></div>
`,hi:`
<p>Jab koi naya employee ek achhi tarah chalne wali company join karta hai, to woh pehla din laptop aur passwords dhoondhne mein nahi bitaata. Uska desk, laptop, badge aur accounts pehle se tayyar hote hain, uske employee number se jude, aur jis pal woh andar aata hai tayyar hote hain. <b>Day-0 provisioning</b> switches aur servers ke liye yahi karta hai: bilkul naya device rack, cable aur power on hota hai, aur woh apni pehchaan ke hisaab se apna software aur configuration khud automatically le leta hai. Engineers <b>Day 0</b> (first boot aur base configuration), <b>Day 1</b> (VLANs aur VRFs jaisi service configuration) aur <b>Day 2</b> (operations: monitoring, changes, upgrades) ki baat karte hain.</p>

<h3>POAP: Power-On Auto Provisioning</h3>
<p><b>POAP</b> NX-OS ka feature hai jo Nexus switch ko first boot par provision karta hai. Yeh automatically start hota hai jab switch <b>bina startup configuration ke</b> boot hota hai. (<code>boot poap enable</code> ke saath yeh har boot par chal sakta hai, jo kuch teams rebuilds ke liye use karti hain.) Console par aapko POAP abort karne ka prompt dikhega; agar koi jawab na de, to POAP chalta rehta hai.</p>
<pre class="out">Abort Power On Auto Provisioning and continue with normal setup ?(yes/no)[n]:
<span class="hl">2026 Sep 29 08:02:14 switch %$ VDC-1 %$ %POAP-2-POAP_INFO: - Using DHCP, information received over mgmt0 from 10.99.10.1</span>
2026 Sep 29 08:02:15 switch %$ VDC-1 %$ %POAP-2-POAP_INFO: - Assigned IP address: 10.99.10.107
2026 Sep 29 08:02:15 switch %$ VDC-1 %$ %POAP-2-POAP_INFO: - Script Name: poap_nexus.py</pre>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="POAP ke steps">
<rect x="10" y="20" width="140" height="44" rx="8" fill="#e2e8f0"/><text x="80" y="40" text-anchor="middle" class="svg-ink" font-size="13">1. Boot, koi</text><text x="80" y="56" text-anchor="middle" class="svg-ink" font-size="13">startup-config nahi</text>
<rect x="170" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="240" y="40" text-anchor="middle" class="svg-ink" font-size="13">2. DHCP: IP,</text><text x="240" y="56" text-anchor="middle" class="svg-ink" font-size="13">server, script</text>
<rect x="330" y="20" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="400" y="40" text-anchor="middle" class="svg-ink" font-size="13">3. Script download</text><text x="400" y="56" text-anchor="middle" class="svg-ink" font-size="13">aur run</text>
<rect x="490" y="20" width="140" height="44" rx="8" fill="#fde68a"/><text x="560" y="40" text-anchor="middle" class="svg-ink" font-size="13">4. Image aur</text><text x="560" y="56" text-anchor="middle" class="svg-ink" font-size="13">config lao</text>
<line x1="150" y1="42" x2="170" y2="42" stroke="#64748b" stroke-width="2"/><line x1="310" y1="42" x2="330" y2="42" stroke="#64748b" stroke-width="2"/><line x1="470" y1="42" x2="490" y2="42" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="110" width="300" height="44" rx="8" fill="#bbf7d0"/><text x="480" y="137" text-anchor="middle" class="svg-ink" font-size="13">5. Boot image set, reboot, config apply</text>
<line x1="560" y1="64" x2="560" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="110" width="300" height="80" rx="8" fill="#fed7aa"/><text x="160" y="135" text-anchor="middle" class="svg-ink" font-size="13">Zaroori servers</text><text x="160" y="157" text-anchor="middle" class="svg-muted" font-size="12">DHCP (options 66/150, 67)</text><text x="160" y="177" text-anchor="middle" class="svg-muted" font-size="12">TFTP/SCP/HTTP file server</text>
</svg><p class="cap">POAP: DHCP switch ko batata hai ki script kahan hai; script sahi image aur configuration laati hai.</p></div>

<h3>POAP ke steps detail mein</h3>
<ol>
<li><b>Boot</b>: startup-config nahi hai, isliye switch POAP mode mein jaata hai.</li>
<li><b>DHCP</b>: switch mgmt0 aur apne front-panel ports (in-band) par DHCP requests bhejta hai. DHCP offer mein IP address aur gateway, <b>file server</b> (option 66, TFTP server name, ya option 150, TFTP server address) aur <b>boot file name</b> (option 67), jo POAP script hai, hone chahiye. Switch apne serial number se apni pehchaan batata hai, isliye DHCP server har switch ko reserved address de sakta hai.</li>
<li><b>Script</b>: switch script download karta hai (aam taur par Cisco ki Python POAP script, aapki site ke liye edit ki hui) aur chalata hai. Script mein ek MD5 checksum line hoti hai jise har edit ke baad update karna padta hai, warna switch use chalane se mana kar deta hai.</li>
<li><b>Image aur configuration</b>: script zaroorat ho to target NX-OS image aur device ki configuration file download karti hai. File ek <b>mode</b> se chunti hai: serial number (jaise <code>conf.FDO23460ABC</code>), MAC address, DHCP se hostname, ya CDP neighbor se location.</li>
<li><b>Finish</b>: script boot variables set karti hai aur configuration schedule karti hai; switch sahi image ke saath reboot hota hai aur configured ho kar aata hai. Troubleshooting ke liye script bootflash par log file likhti hai.</li>
</ol>
<pre class="code"><span class="c"># ISC DHCP server: har naye leaf ke liye ek reservation</span>
subnet 10.99.10.0 netmask 255.255.255.0 {
  option routers 10.99.10.1;
  option tftp-server-name "10.99.0.40";
  option bootfile-name "poap_nexus.py";
  host leaf-07 {
    hardware ethernet 00:3a:9c:12:34:56;
    fixed-address 10.99.10.107;
  }
}</pre>

<h3>NDFC ke saath POAP</h3>
<p>NDFC khud POAP server ban sakta hai. Management network par boot hone wale naye switches fabric ki <b>bootstrap</b> list mein apne serial number aur model ke saath dikhte hain. Aap hostname, management IP aur role assign karte ho, aur NDFC fabric template se bana startup configuration deta hai. Phir switch pehle se managed aur compliant ho kar fabric join karta hai. NDFC-managed VXLAN EVPN fabric mein leaves jodne ka yahi aam tareeka hai.</p>

<h3>Servers ke liye PXE</h3>
<p><b>PXE</b> (Preboot eXecution Environment) server side ka equivalent hai. Server ka network card boot par DHCP request bhejta hai; reply ek <b>next-server</b> aur boot file batata hai; server TFTP par (ya iPXE ke saath HTTP par) ek chhota boot loader load karta hai, jo phir installer load karta hai. Ek answer file (Linux ke liye kickstart, Windows ke liye autounattend, ESXi ke liye kickstart script) operating system install ko bina insaani input ke chalati hai. UCS mein aap ise boot policy se enable karte ho jo LAN/PXE boot ko pehle rakhti hai; Intersight bhi automated OS installation deta hai.</p>

<h3>Templates aur golden configurations</h3>
<p>POAP ek file deta hai, lekin file aati kahan se hai? Mature teams kabhi per-switch configs haath se nahi likhti. Woh variables wala ek <b>template</b> aur har device ki data file rakhti hain, aur Jinja2 jaise tool se final configuration render karti hain (Ansible aur bahut saari scripts ise use karti hain).</p>
<pre class="code">hostname {{ hostname }}
interface loopback0
  ip address {{ loopback0 }}/32
{% for up in uplinks %}
interface {{ up.name }}
  description to {{ up.peer }}
  no switchport
  mtu 9216
  ip address {{ up.ip }}/31
  ip router ospf UNDERLAY area 0.0.0.0
  no shutdown
{% endfor %}</pre>
<p><b>Golden configuration</b> woh approved baseline hai jo ek role ke har device mein honi chahiye: AAA, NTP, logging, SNMPv3, banners, CoPP profile, SSH settings. Git mein rakhi aur templates se render hui, yeh compliance checks aur <code>configure replace</code> (chapter 9) ke liye reference ban jaati hai.</p>

<div class="eg"><p><b>Worked example.</b> Naye pod mein 24 leaves hain. Manually unboxing, console cabling, NX-OS upgrade (har ek lagbhag 25 minute) aur configuration paste karne mein lagbhag 45 minute per switch lagte hain: 24 x 45 = 1,080 minute, 18 engineer-hours, aur LEAF-11 ka config LEAF-12 mein paste hone ka asli khatra. POAP ke saath purchase order ke serial numbers pehle se DHCP reservations (ya NDFC) mein load hote hain, configs templates se render hote hain, aur remote-hands team sirf rack, cable aur power on karti hai. Saare 24 switches parallel mein lagbhag 40 minute mein provision hote hain, har ek apne serial number se jude configuration ke saath.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> POAP script edit karna lekin uski MD5 line update na karna. DHCP server jo dusre devices ko bhi POAP options de de, ya segment par dusra DHCP server. Management network aur file server ke beech firewalls ka TFTP block karna. Galat serial se named configuration files (chassis serial, line-card serial nahi). Bhool jaana ki POAP sirf tab start hota hai jab startup configuration na ho.</p></div>
<div class="exam"><p><b>Exam trap.</b> POAP ko DHCP (IP, gateway, server ke liye option 66 ya 150, script ke liye option 67), ek file server aur ek script chahiye; yeh tab chalta hai jab startup-config exist na kare. PXE servers ke liye hai aur DHCP plus TFTP (ya HTTP par iPXE) use karta hai. NDFC apne bootstrap feature se POAP server ban sakta hai.</p></div>

<div class="scn"><h4>Woh leaf jo apne padosi ke config ke saath provision hua</h4><p>Pod build ke dauraan LEAF-12 LEAF-11 ke hostname aur IP addresses ke saath aaya, aur BGP sessions flap hone lage kyunki do leaves same router ID claim kar rahe the. Engineer ne bootflash par POAP log check kiya aur dekha ki script hostname mode mein chal rahi thi, aur DHCP server mein typo tha jo dono switches ko hostname leaf-11 de raha tha. Team ne script ko serial-number mode par switch kiya, har config file ka naam purchase order ke chassis serial par rakha, LEAF-12 ka startup configuration erase kiya aur reboot kiya. POAP phir chala aur use sahi provision kiya.</p><p><b>Seekh:</b> Day-0 configuration ko aisi pehchaan se jodo jo site par galat type na ho sake, jaise serial number.</p></div>

<div class="iv"><p class="q">"Mujhe batao jab naya Nexus switch POAP ke saath boot hota hai to kya hota hai."</p><p>Strong answer: startup-config nahi, isliye POAP start hota hai; mgmt0 ya in-band par DHCP IP, gateway, server (option 66/150) aur script name (option 67) deta hai; switch script download aur validate (MD5) karta hai, script image aur device-specific config laati hai (serial, MAC, hostname ya CDP location se), boot variables set karti hai aur reboot karti hai; switch configured ho kar aata hai. NDFC ko POAP server ki tarah aur troubleshooting ke liye bootflash par log file ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Day 0 first boot aur baseline hai; Day 1 services; Day 2 operations.</li>
<li>POAP tab chalta hai jab startup-config na ho: DHCP, script download, image aur config download, reboot.</li>
<li>DHCP options: file server ke liye 66 ya 150, script name ke liye 67.</li>
<li>PXE servers ko DHCP, TFTP ya iPXE, aur unattended installer se provision karta hai.</li>
<li>Configs templates se render karo aur compliance aur config replace ke liye Git mein golden baseline rakho.</li>
</ul></div>
`}};export{e as default};