var e={id:`goals`,h:{en:`What you will learn: the stateless computing idea`,hi:`Aap kya seekhoge: stateless computing ka idea`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these twelve chapters and four labs you will be able to explain how a Cisco UCS domain is built, log in to UCS Manager and find your way around it, create identity pools, policies and templates, build service profiles and associate them with blades, boot an ESXi host from a SAN LUN, move a failed server's identity to a spare blade in minutes, plan a firmware upgrade and a backup, design hypervisor networking on top of UCS, and describe where Intersight and Intersight Managed Mode fit. This is the <b>Compute</b> section (2.0) of the CCNP Data Center core exam (DCCOR 350-601), and it is also everyday work in any enterprise that runs UCS.</p>

<h3>Prerequisites</h3>
<ul>
<li>From the Data Center Foundations module: what a server contains (CPU, RAM, NIC, HBA, VIC, BMC), rack versus blade servers, hypervisors and virtual switches, and the SAN basics (LUN, WWPN, zoning).</li>
<li>Basic switching: VLANs, trunks, port-channels and the idea of a vPC pair.</li>
<li>Helpful but not required: Fibre Channel login steps (FLOGI, PLOGI). Chapter 8 recaps them.</li>
</ul>

<h3>The problem UCS was built to solve</h3>
<p>Think of a mobile phone and its SIM card. The phone is hardware. Your phone number, your contacts and your plan live on the SIM. When the phone breaks, you move the SIM into a new phone and the world still calls you on the same number. Nobody at the bank or at your office needs to update anything.</p>
<p>Traditional servers do not work like that. Their identity is burned into the hardware: the <b>MAC addresses</b> of the NICs (which DHCP reservations, firewall rules and licence servers know), the <b>WWPNs</b> of the HBAs (which SAN zoning and LUN masking allow), the server <b>UUID</b> (which some software licences are tied to), plus the BIOS settings, the boot order and the firmware versions. When a traditional server fails and you replace it, the new box brings new identities. The network team updates reservations, the storage team rezones and remasks, the OS team fixes licences and drivers. A ten-minute hardware swap becomes a day of tickets.</p>

<h3>Stateless computing in one picture</h3>
<p>Cisco UCS separates the <b>hardware</b> from the <b>identity and configuration</b>. The hardware is a stateless blade or rack server: CPUs, memory and a <b>virtual interface card (VIC)</b> that can present whatever NICs and HBAs it is told to. The identity and configuration live in a software object called a <b>service profile</b>, stored in <b>UCS Manager</b> on the fabric interconnects. The service profile is the SIM card. <b>Associating</b> it with a blade programs that blade with the profile's MACs, WWPNs, UUID, BIOS settings, boot order and firmware.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Stateless computing: profile moves between blades">
<rect x="210" y="12" width="220" height="92" rx="10" fill="#fde68a"/>
<text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="14">Service profile ESX-01</text>
<text x="320" y="54" text-anchor="middle" class="svg-muted" font-size="12">UUID ...0001 · eth0 00:25:B5:0A:00:00</text>
<text x="320" y="72" text-anchor="middle" class="svg-muted" font-size="12">fc0 20:00:00:25:B5:0A:00:00</text>
<text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="12">BIOS · boot from SAN · firmware</text>
<rect x="60" y="170" width="180" height="60" rx="10" fill="#e2e8f0"/>
<text x="150" y="196" text-anchor="middle" class="svg-ink" font-size="13">Blade 1/1</text>
<text x="150" y="215" text-anchor="middle" class="svg-muted" font-size="12">failed hardware</text>
<rect x="400" y="170" width="180" height="60" rx="10" fill="#bbf7d0"/>
<text x="490" y="196" text-anchor="middle" class="svg-ink" font-size="13">Blade 1/3 (spare)</text>
<text x="490" y="215" text-anchor="middle" class="svg-muted" font-size="12">same identity now</text>
<line x1="260" y1="104" x2="170" y2="170" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="380" y1="104" x2="470" y2="170" stroke="#64748b" stroke-width="2"/>
<text x="175" y="140" text-anchor="middle" class="svg-muted" font-size="12">1. disassociate</text>
<text x="470" y="140" text-anchor="middle" class="svg-accent" font-size="12">2. associate</text>
</svg><p class="cap">The identity lives in the profile, not in the blade. Move the profile and the server keeps its MACs, WWPNs and UUID.</p></div>

<p>Because the identity moves with the profile, the network, the SAN and the operating system see exactly the same server after a hardware swap. That is what <b>stateless computing</b> means: the hardware holds no state that anyone outside the server depends on.</p>

<h3>The building blocks you will meet</h3>
<dl class="terms">
<dt>Pools</dt><dd>Ranges of identities (UUID, MAC, WWNN, WWPN, IP) that UCS Manager hands out automatically, so no two profiles ever get the same value.</dd>
<dt>Policies</dt><dd>Reusable settings: boot order, BIOS, firmware, maintenance behaviour, QoS, CDP/LLDP and more.</dd>
<dt>Templates</dt><dd>Blueprints for vNICs, vHBAs and whole service profiles, so fifty servers are built identically.</dd>
<dt>Service profile</dt><dd>The complete logical server: identities plus policies plus connectivity. One profile is associated with one physical server at a time.</dd>
</dl>

<div class="eg"><p><b>Worked example: the cost of a blade swap.</b> A bank runs 64 ESXi hosts. Each has 4 NIC MACs and 2 WWPNs. Without stateless computing, a swap means updating 4 DHCP reservations, 2 SAN zones on two MDS switches, 2 LUN masking entries on the array and one licence, typically across three teams and three change windows. With UCS the engineer disassociates the profile, associates it with a spare and waits for the association task (a few minutes). Zero tickets for other teams: the 6 identities never changed.</p></div>

<h3>How this module is organised</h3>
<table class="cmp"><tr><th>Chapters</th><th>What you build</th><th>Lab</th></tr>
<tr><td>2–3</td><td>Mental model of the hardware and of UCS Manager</td><td>—</td></tr>
<tr><td>4–6</td><td>Pools, policies, vNIC/vHBA and service profile templates</td><td>Lab 1: pools and templates</td></tr>
<tr><td>7–8</td><td>Service profiles, association, boot from SAN</td><td>Lab 2: profile and SAN boot; Ticket lab: hosts cannot boot</td></tr>
<tr><td>9</td><td>Blade replacement, firmware, backups</td><td>Lab 4: move a profile to a spare</td></tr>
<tr><td>10–12</td><td>Hypervisor networking, Intersight, troubleshooting, review</td><td>—</td></tr>
</table>

<div class="warn"><p><b>Common beginner mistake.</b> Leaving identities at the "hardware default" (burned-in) values. The profile then takes the blade's own MACs and WWPNs, and stateless computing silently stops working: the day the blade fails, the replacement comes up with different identities.</p></div>
<div class="exam"><p><b>Exam tip.</b> If a question asks what makes a UCS server "stateless", the answer is that identity and configuration are held in the service profile (server profile in Intersight), drawn from pools and policies, and applied at association.</p></div>

<div class="scn"><h4>The 3 a.m. blade that did not need three teams</h4><p>A payment company lost a blade at 03:10: the service profile showed the server as inoperable and the ESXi host dropped out of vCenter. Before UCS, their runbook for a server swap ran to four pages and needed the storage on-call engineer. This time the on-call network engineer checked that spare blade 1/3 was healthy and unassociated, disassociated the profile from 1/1, associated it with 1/3 and watched the FSM reach 100%. The host booted from the same SAN LUN with the same MACs, rejoined the vSphere cluster and HA moved the VMs back. Total outage for that host: 14 minutes, and the storage engineer slept through it.</p><p><b>Lesson:</b> stateless computing turns a multi-team hardware incident into a single, repeatable UCS Manager task, as long as every identity comes from a pool.</p></div>

<div class="iv"><p class="q">"What is stateless computing in Cisco UCS?"</p><p>Strong answer: the server hardware carries no identity. MACs, WWNN/WWPNs, UUID, BIOS, boot order and firmware are defined in a service profile, drawn from pools and policies, and pushed to whichever blade the profile is associated with. Moving the profile to another blade keeps the server identical for the LAN, the SAN and the OS. Mention the practical result: fast blade replacement with no rezoning, and consistent builds from templates.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A traditional server's identity (MAC, WWPN, UUID, BIOS, firmware) is tied to hardware; replacing it touches many teams.</li>
<li>UCS moves that identity into a service profile held by UCS Manager on the fabric interconnects.</li>
<li>Pools supply identities, policies supply settings, templates make many consistent profiles.</li>
<li>Associating a profile with a blade programs the VIC and BIOS; moving it keeps the server's identity.</li>
<li>Never use hardware-default identities if you want stateless behaviour.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In baarah chapters aur chaar labs ke end tak aap samjha paoge ki Cisco UCS domain kaise banta hai, UCS Manager mein login karke usmein raasta dhoondh paoge, identity pools, policies aur templates bana paoge, service profiles bana kar unhe blades se associate kar paoge, ESXi host ko SAN LUN se boot karwa paoge, fail hue server ki identity minutes mein spare blade par le ja paoge, firmware upgrade aur backup plan kar paoge, UCS ke upar hypervisor networking design kar paoge, aur bata paoge ki Intersight aur Intersight Managed Mode kahan fit hote hain. Yeh CCNP Data Center core exam (DCCOR 350-601) ka <b>Compute</b> section (2.0) hai, aur UCS chalane wali har enterprise mein roz ka kaam bhi hai.</p>

<h3>Prerequisites</h3>
<ul>
<li>Data Center Foundations module se: server mein kya hota hai (CPU, RAM, NIC, HBA, VIC, BMC), rack aur blade servers ka farak, hypervisors aur virtual switches, aur SAN basics (LUN, WWPN, zoning).</li>
<li>Basic switching: VLANs, trunks, port-channels aur vPC pair ka idea.</li>
<li>Helpful hai par zaroori nahi: Fibre Channel login steps (FLOGI, PLOGI). Chapter 8 inhe dobara samjhata hai.</li>
</ul>

<h3>Woh problem jiske liye UCS bana</h3>
<p>Mobile phone aur uske SIM card ke baare mein socho. Phone hardware hai. Aapka phone number, contacts aur plan SIM par rehte hain. Phone toot jaaye to aap SIM naye phone mein daal dete ho aur duniya aapko usi number par call karti hai. Bank ya office mein kisi ko kuch update nahi karna padta.</p>
<p>Traditional servers aise kaam nahi karte. Unki identity hardware mein burn hoti hai: NICs ke <b>MAC addresses</b> (jinhe DHCP reservations, firewall rules aur licence servers jaante hain), HBAs ke <b>WWPNs</b> (jinhe SAN zoning aur LUN masking allow karte hain), server ka <b>UUID</b> (jisse kuch software licences bandhe hote hain), plus BIOS settings, boot order aur firmware versions. Jab traditional server fail hota hai aur aap use replace karte ho, naya box nayi identities laata hai. Network team reservations update karti hai, storage team rezone aur remask karti hai, OS team licences aur drivers theek karti hai. Das minute ka hardware swap poore din ke tickets ban jaata hai.</p>

<h3>Stateless computing ek picture mein</h3>
<p>Cisco UCS <b>hardware</b> ko <b>identity aur configuration</b> se alag karta hai. Hardware ek stateless blade ya rack server hai: CPUs, memory aur ek <b>virtual interface card (VIC)</b> jo jo bhi NICs aur HBAs bola jaaye woh present kar sakta hai. Identity aur configuration ek software object mein rehti hai jise <b>service profile</b> kehte hain, jo fabric interconnects par <b>UCS Manager</b> mein store hota hai. Service profile hi SIM card hai. Use kisi blade se <b>associate</b> karne par woh blade profile ke MACs, WWPNs, UUID, BIOS settings, boot order aur firmware se program ho jaata hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Stateless computing: profile blades ke beech move hota hai">
<rect x="210" y="12" width="220" height="92" rx="10" fill="#fde68a"/>
<text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="14">Service profile ESX-01</text>
<text x="320" y="54" text-anchor="middle" class="svg-muted" font-size="12">UUID ...0001 · eth0 00:25:B5:0A:00:00</text>
<text x="320" y="72" text-anchor="middle" class="svg-muted" font-size="12">fc0 20:00:00:25:B5:0A:00:00</text>
<text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="12">BIOS · SAN se boot · firmware</text>
<rect x="60" y="170" width="180" height="60" rx="10" fill="#e2e8f0"/>
<text x="150" y="196" text-anchor="middle" class="svg-ink" font-size="13">Blade 1/1</text>
<text x="150" y="215" text-anchor="middle" class="svg-muted" font-size="12">kharab hardware</text>
<rect x="400" y="170" width="180" height="60" rx="10" fill="#bbf7d0"/>
<text x="490" y="196" text-anchor="middle" class="svg-ink" font-size="13">Blade 1/3 (spare)</text>
<text x="490" y="215" text-anchor="middle" class="svg-muted" font-size="12">ab wahi identity</text>
<line x1="260" y1="104" x2="170" y2="170" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="380" y1="104" x2="470" y2="170" stroke="#64748b" stroke-width="2"/>
<text x="175" y="140" text-anchor="middle" class="svg-muted" font-size="12">1. disassociate</text>
<text x="470" y="140" text-anchor="middle" class="svg-accent" font-size="12">2. associate</text>
</svg><p class="cap">Identity profile mein rehti hai, blade mein nahi. Profile move karo aur server apne MACs, WWPNs aur UUID rakhta hai.</p></div>

<p>Kyunki identity profile ke saath move hoti hai, hardware swap ke baad network, SAN aur operating system ko bilkul wahi server dikhta hai. Yahi <b>stateless computing</b> ka matlab hai: hardware mein aisa koi state nahi jis par server ke bahar koi depend kare.</p>

<h3>Building blocks jo aapko milenge</h3>
<dl class="terms">
<dt>Pools</dt><dd>Identities ki ranges (UUID, MAC, WWNN, WWPN, IP) jo UCS Manager automatically deta hai, taaki do profiles ko kabhi same value na mile.</dd>
<dt>Policies</dt><dd>Reusable settings: boot order, BIOS, firmware, maintenance behaviour, QoS, CDP/LLDP aur bahut kuch.</dd>
<dt>Templates</dt><dd>vNICs, vHBAs aur poore service profiles ke blueprints, taaki pachaas servers ek jaise bane.</dd>
<dt>Service profile</dt><dd>Poora logical server: identities plus policies plus connectivity. Ek profile ek time par ek hi physical server se associated hota hai.</dd>
</dl>

<div class="eg"><p><b>Worked example: blade swap ki keemat.</b> Ek bank 64 ESXi hosts chalata hai. Har ek ke 4 NIC MACs aur 2 WWPNs hain. Stateless computing ke bina swap ka matlab hai 4 DHCP reservations update karna, do MDS switches par 2 SAN zones, array par 2 LUN masking entries aur ek licence, aam taur par teen teams aur teen change windows mein. UCS ke saath engineer profile disassociate karta hai, spare se associate karta hai aur association task (kuch minute) ka wait karta hai. Doosri teams ke liye zero tickets: 6 identities kabhi badli hi nahi.</p></div>

<h3>Yeh module kaise organised hai</h3>
<table class="cmp"><tr><th>Chapters</th><th>Aap kya banaoge</th><th>Lab</th></tr>
<tr><td>2–3</td><td>Hardware aur UCS Manager ka mental model</td><td>—</td></tr>
<tr><td>4–6</td><td>Pools, policies, vNIC/vHBA aur service profile templates</td><td>Lab 1: pools aur templates</td></tr>
<tr><td>7–8</td><td>Service profiles, association, boot from SAN</td><td>Lab 2: profile aur SAN boot; Ticket lab: hosts boot nahi hote</td></tr>
<tr><td>9</td><td>Blade replacement, firmware, backups</td><td>Lab 4: profile ko spare par le jao</td></tr>
<tr><td>10–12</td><td>Hypervisor networking, Intersight, troubleshooting, review</td><td>—</td></tr>
</table>

<div class="warn"><p><b>Beginners ki common galti.</b> Identities ko "hardware default" (burned-in) values par chhod dena. Tab profile blade ke apne MACs aur WWPNs le leta hai, aur stateless computing chupchaap kaam karna band kar deta hai: jis din blade fail hoga, replacement alag identities ke saath aayega.</p></div>
<div class="exam"><p><b>Exam tip.</b> Agar question pooche ki UCS server ko "stateless" kya banata hai, to jawab hai ki identity aur configuration service profile (Intersight mein server profile) mein rehti hai, pools aur policies se aati hai, aur association par apply hoti hai.</p></div>

<div class="scn"><h4>Raat 3 baje ka blade jise teen teams ki zaroorat nahi padi</h4><p>Ek payment company ka blade 03:10 par fail hua: service profile ne server ko inoperable dikhaya aur ESXi host vCenter se gaayab ho gaya. UCS se pehle unka server swap runbook chaar pages ka tha aur storage on-call engineer chahiye hota tha. Is baar on-call network engineer ne check kiya ki spare blade 1/3 healthy aur unassociated hai, profile ko 1/1 se disassociate kiya, 1/3 se associate kiya aur FSM ko 100% tak pahunchte dekha. Host usi SAN LUN se, usi MACs ke saath boot hua, vSphere cluster mein wapas juda aur HA ne VMs wapas move kar diye. Us host ka total outage: 14 minute, aur storage engineer sota raha.</p><p><b>Seekh:</b> stateless computing ek multi-team hardware incident ko ek single, repeatable UCS Manager task bana deta hai, bas har identity pool se aani chahiye.</p></div>

<div class="iv"><p class="q">"Cisco UCS mein stateless computing kya hai?"</p><p>Strong answer: server hardware koi identity nahi rakhta. MACs, WWNN/WWPNs, UUID, BIOS, boot order aur firmware service profile mein define hote hain, pools aur policies se aate hain, aur us blade par push hote hain jisse profile associated hai. Profile ko doosre blade par le jaane se LAN, SAN aur OS ke liye server bilkul same rehta hai. Practical result bhi batao: bina rezoning ke fast blade replacement, aur templates se consistent builds.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Traditional server ki identity (MAC, WWPN, UUID, BIOS, firmware) hardware se bandhi hoti hai; use replace karna kai teams ko chhoota hai.</li>
<li>UCS us identity ko service profile mein le jaata hai jo fabric interconnects par UCS Manager rakhta hai.</li>
<li>Pools identities dete hain, policies settings deti hain, templates kai consistent profiles banate hain.</li>
<li>Profile ko blade se associate karna VIC aur BIOS ko program karta hai; use move karne par server ki identity wahi rehti hai.</li>
<li>Stateless behaviour chahiye to hardware-default identities kabhi use mat karo.</li>
</ul></div>
`}};export{e as default};