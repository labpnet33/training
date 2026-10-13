var e={id:`nac-portsec`,h:{en:`Network access control and Lab 2: port security, 802.1X and MAC filtering`,hi:`Network access control aur Lab 2: port security, 802.1X aur MAC filtering`},body:{en:`
<p>At a housing society gate there are three ways to control cars. A sticker list of approved number plates is easy but anyone can copy a sticker (MAC filtering). Each parking slot remembers the first car that parks there and raises an alarm if a different car tries (port security with sticky learning). Or the guard checks every driver's ID against the society's central register before opening the barrier (802.1X). All three are <b>network access control (NAC)</b>: deciding which devices may use the network at all.</p>

<h3>Port security</h3>
<p><b>Port security</b> limits which MAC addresses may send traffic into a switch access port. You choose:</p>
<ul>
<li><b>Maximum</b>: how many MACs are allowed (default 1). An IP phone with a PC behind it needs 2 or 3.</li>
<li><b>Learning</b>: static (typed by hand), dynamic (learned, lost on reload) or <b>sticky</b> (learned and written into the running configuration, so it survives a reload once you save).</li>
<li><b>Violation mode</b>: what happens when an extra or unknown MAC appears.</li>
</ul>
<table class="cmp"><tr><th>Mode</th><th>Unknown frames</th><th>Counter and log</th><th>Port</th></tr>
<tr><td><b>protect</b></td><td>Dropped</td><td>No counter, no log</td><td>Stays up</td></tr>
<tr><td><b>restrict</b></td><td>Dropped</td><td>Counter increases, syslog/SNMP</td><td>Stays up</td></tr>
<tr><td><b>shutdown</b> (default)</td><td>Whole port stops</td><td>Counter increases, syslog/SNMP</td><td>err-disabled</td></tr>
</table>
<p>Port security also defeats <b>MAC flooding</b>, because one port can no longer inject thousands of fake addresses.</p>

<h3>Lab 2 walkthrough: stop rogue devices</h3>
<p>A visitor plugged a personal laptop into a reception port. Lock SW1 Gi0/1 to the reception PC (PC1, MAC 0050.7966.0a01): one sticky MAC, shutdown on violation. PC2 on Gi0/2 and the gateway R1 (192.168.10.1 on Gi0/0 side) share VLAN 1 subnet 192.168.10.0/24.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Lab 2 topology">
<rect x="10" y="20" width="150" height="50" rx="10" fill="#bbf7d0"/><text x="85" y="42" text-anchor="middle" class="svg-ink" font-size="13">PC1 .11</text><text x="85" y="60" text-anchor="middle" class="svg-muted" font-size="12">0050.7966.0a01</text>
<rect x="10" y="130" width="150" height="50" rx="10" fill="#bae6fd"/><text x="85" y="152" text-anchor="middle" class="svg-ink" font-size="13">PC2 .12</text><text x="85" y="170" text-anchor="middle" class="svg-muted" font-size="12">0050.7966.0a02</text>
<rect x="270" y="75" width="120" height="50" rx="10" fill="#e2e8f0"/><text x="330" y="105" text-anchor="middle" class="svg-ink" font-size="14">SW1</text>
<rect x="490" y="75" width="140" height="50" rx="10" fill="#ddd6fe"/><text x="560" y="97" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="560" y="114" text-anchor="middle" class="svg-muted" font-size="12">192.168.10.1</text>
<line x1="160" y1="45" x2="270" y2="95" stroke="#64748b" stroke-width="2"/><line x1="160" y1="155" x2="270" y2="105" stroke="#64748b" stroke-width="2"/><line x1="390" y1="100" x2="490" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="215" y="55" text-anchor="middle" class="svg-accent" font-size="12">Gi0/1 secured</text><text x="215" y="160" text-anchor="middle" class="svg-muted" font-size="12">Gi0/2</text><text x="440" y="92" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0</text>
</svg><p class="cap">Only Gi0/1 is locked in this lab; PC1 is the reception PC.</p></div>

<p><b>Step 1: configure.</b> The port is already an access port, which port security requires.</p>
<pre class="code">SW1# configure terminal
SW1(config)# interface GigabitEthernet0/1
SW1(config-if)# switchport port-security
SW1(config-if)# switchport port-security maximum 1
SW1(config-if)# switchport port-security mac-address sticky
SW1(config-if)# switchport port-security violation shutdown
SW1(config-if)# end</pre>
<p><b>Step 2: learn PC1.</b> Ping 192.168.10.1 from PC1 so the switch sees its MAC, then check:</p>
<pre class="out">SW1# show port-security address
               Secure Mac Address Table
-----------------------------------------------------------------------------
Vlan    Mac Address       Type                          Ports   Remaining Age
                                                                   (mins)
----    -----------       ----                          -----   -------------
<span class="hl">   1    0050.7966.0a01    SecureSticky                  Gi0/1        -</span>
-----------------------------------------------------------------------------</pre>
<p>The running config now contains <code>switchport port-security mac-address sticky 0050.7966.0a01</code>.</p>
<p><b>Step 3: play the rogue device.</b> On PC1 run <code>set mac 0bad.beef.0001</code> and ping the gateway again. This imitates a visitor's laptop, and it also shows how easily a MAC can be spoofed.</p>
<pre class="out">%PORT_SECURITY-2-PSECURE_VIOLATION: Security violation occurred, caused by MAC address 0bad.beef.0001 on port GigabitEthernet0/1.
%PM-4-ERR_DISABLE: psecure-violation error detected on Gi0/1, putting Gi0/1 in err-disable state

SW1# show port-security interface GigabitEthernet0/1
Port Security              : Enabled
<span class="hl">Port Status                : Secure-shutdown</span>
Violation Mode             : Shutdown
Maximum MAC Addresses      : 1
Total MAC Addresses        : 1
Sticky MAC Addresses       : 1
Last Source Address:Vlan   : 0bad.beef.0001:1
<span class="hl">Security Violation Count   : 1</span>

SW1# show interfaces status err-disabled
Port      Name               Status       Reason               Err-disabled Vlans
<span class="hl">Gi0/1                        err-disabled psecure-violation</span></pre>
<p>The answer to the lab question is <b>err-disabled</b>.</p>
<p><b>Step 4: recover.</b> First remove the cause, then bounce the port. Order matters: if you bounce first, the rogue MAC triggers a new violation immediately.</p>
<pre class="code">PC1&gt; set mac 0050.7966.0a01
SW1(config)# interface GigabitEthernet0/1
SW1(config-if)# shutdown
SW1(config-if)# no shutdown
SW1(config-if)# end</pre>
<p>PC1 pings 192.168.10.1 successfully again, and the violation count stays at 1 as evidence. In production you can also let the switch recover automatically with <code>errdisable recovery cause psecure-violation</code> and <code>errdisable recovery interval 300</code>.</p>

<h3>802.1X: authenticate the user or device</h3>
<p><b>IEEE 802.1X</b> is port-based authentication with three roles: the <b>supplicant</b> (software on the laptop), the <b>authenticator</b> (the switch or wireless AP) and the <b>authentication server</b> (a RADIUS server backed by the directory). Until authentication succeeds, the port passes only EAP messages (EAP over LAN). On success, the RADIUS server can also assign a VLAN or ACL. Devices without a supplicant, such as printers, can use <b>MAC authentication bypass (MAB)</b> as a fallback. 802.1X is far stronger than port security because it checks credentials or certificates, not just a MAC.</p>

<h3>MAC filtering</h3>
<p><b>MAC filtering</b> is an allow list (or block list) of MAC addresses on a switch, AP or router. It is simple and stops casual mistakes, but MACs are sent in clear and can be changed in seconds, exactly as you did with <code>set mac</code>. Treat it as a speed bump, never as your only control.</p>

<div class="warn"><p><b>Common mistakes.</b> Enabling port security on a dynamic or trunk port (it needs <code>switchport mode access</code>). Setting maximum 1 on a desk with an IP phone and a PC. Forgetting to save the config, so sticky MACs vanish on reload. Bouncing an err-disabled port before removing the rogue device.</p></div>

<div class="exam"><p><b>Exam trap.</b> Shutdown is the default violation mode and leads to err-disabled. Restrict drops and logs; protect drops silently. 802.1X roles: supplicant, authenticator, authentication server (RADIUS). MAC filtering is easily defeated by spoofing.</p></div>

<div class="scn"><h4>The new PC that killed the port</h4><p>IT replaced the reception PC with a new one, and the port went err-disabled within seconds. The sticky MAC of the old PC was still in the configuration. The engineer cleared it with <code>clear port-security sticky interface GigabitEthernet0/1</code>, bounced the port, let the new PC be learned and saved the configuration. The change process was updated so every hardware swap includes clearing the sticky entry.</p><p><b>Lesson:</b> port security is doing its job when it blocks an unknown MAC; plan for legitimate changes too.</p></div>

<div class="iv"><p class="q">"Compare port security, MAC filtering and 802.1X."</p><p>Port security limits the number and identity of MACs per switch port and reacts with protect, restrict or shutdown. MAC filtering is an allow list of MACs, easily spoofed. 802.1X authenticates the user or device with EAP and a RADIUS server before the port opens, and can assign VLANs dynamically; it is the enterprise answer, with MAB for devices that cannot run a supplicant.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Port security: maximum MACs, sticky learning, violation protect, restrict or shutdown.</li>
<li>Shutdown violation puts the port in err-disabled; fix the cause, then shutdown / no shutdown.</li>
<li>Verify with <code>show port-security interface</code>, <code>show port-security address</code> and <code>show interfaces status err-disabled</code>.</li>
<li>802.1X uses supplicant, authenticator and RADIUS server; MAB covers devices without a supplicant.</li>
<li>MAC filtering is weak on its own because MACs are easy to spoof.</li>
</ul></div>
`,hi:`
<p>Housing society ke gate par cars control karne ke teen tareeke hain. Approved number plates ki sticker list aasaan hai lekin koi bhi sticker copy kar sakta hai (MAC filtering). Har parking slot pehli car yaad rakhta hai jo wahan park hoti hai aur alag car aaye to alarm bajata hai (sticky learning wala port security). Ya guard barrier kholne se pehle har driver ki ID society ke central register se check karta hai (802.1X). Teeno <b>network access control (NAC)</b> hain: yeh tay karna ki kaunse devices network use kar bhi sakte hain.</p>

<h3>Port security</h3>
<p><b>Port security</b> seemit karta hai ki kaunse MAC addresses switch access port mein traffic bhej sakte hain. Aap chunte ho:</p>
<ul>
<li><b>Maximum</b>: kitne MACs allowed hain (default 1). Jis IP phone ke peeche PC ho use 2 ya 3 chahiye.</li>
<li><b>Learning</b>: static (haath se type kiya), dynamic (seekha hua, reload par chala jaata hai) ya <b>sticky</b> (seekha hua aur running configuration mein likha hua, isliye save karne ke baad reload mein bhi bachta hai).</li>
<li><b>Violation mode</b>: jab extra ya unknown MAC aaye to kya ho.</li>
</ul>
<table class="cmp"><tr><th>Mode</th><th>Unknown frames</th><th>Counter aur log</th><th>Port</th></tr>
<tr><td><b>protect</b></td><td>Drop</td><td>Na counter, na log</td><td>Up rehta hai</td></tr>
<tr><td><b>restrict</b></td><td>Drop</td><td>Counter badhta hai, syslog/SNMP</td><td>Up rehta hai</td></tr>
<tr><td><b>shutdown</b> (default)</td><td>Poora port ruk jaata hai</td><td>Counter badhta hai, syslog/SNMP</td><td>err-disabled</td></tr>
</table>
<p>Port security <b>MAC flooding</b> ko bhi harata hai, kyunki ek port ab hazaaron fake addresses nahi daal sakta.</p>

<h3>Lab 2 walkthrough: rogue devices roko</h3>
<p>Ek visitor ne reception port mein apna laptop laga diya. SW1 Gi0/1 ko reception PC (PC1, MAC 0050.7966.0a01) ke liye lock karo: ek sticky MAC, violation par shutdown. Gi0/2 par PC2 aur gateway R1 (Gi0/0 side par 192.168.10.1) VLAN 1 ka subnet 192.168.10.0/24 share karte hain.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Lab 2 topology">
<rect x="10" y="20" width="150" height="50" rx="10" fill="#bbf7d0"/><text x="85" y="42" text-anchor="middle" class="svg-ink" font-size="13">PC1 .11</text><text x="85" y="60" text-anchor="middle" class="svg-muted" font-size="12">0050.7966.0a01</text>
<rect x="10" y="130" width="150" height="50" rx="10" fill="#bae6fd"/><text x="85" y="152" text-anchor="middle" class="svg-ink" font-size="13">PC2 .12</text><text x="85" y="170" text-anchor="middle" class="svg-muted" font-size="12">0050.7966.0a02</text>
<rect x="270" y="75" width="120" height="50" rx="10" fill="#e2e8f0"/><text x="330" y="105" text-anchor="middle" class="svg-ink" font-size="14">SW1</text>
<rect x="490" y="75" width="140" height="50" rx="10" fill="#ddd6fe"/><text x="560" y="97" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="560" y="114" text-anchor="middle" class="svg-muted" font-size="12">192.168.10.1</text>
<line x1="160" y1="45" x2="270" y2="95" stroke="#64748b" stroke-width="2"/><line x1="160" y1="155" x2="270" y2="105" stroke="#64748b" stroke-width="2"/><line x1="390" y1="100" x2="490" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="215" y="55" text-anchor="middle" class="svg-accent" font-size="12">Gi0/1 secured</text><text x="215" y="160" text-anchor="middle" class="svg-muted" font-size="12">Gi0/2</text><text x="440" y="92" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0</text>
</svg><p class="cap">Is lab mein sirf Gi0/1 lock hai; PC1 reception PC hai.</p></div>

<p><b>Step 1: configure karo.</b> Port pehle se access port hai, jo port security ke liye zaroori hai.</p>
<pre class="code">SW1# configure terminal
SW1(config)# interface GigabitEthernet0/1
SW1(config-if)# switchport port-security
SW1(config-if)# switchport port-security maximum 1
SW1(config-if)# switchport port-security mac-address sticky
SW1(config-if)# switchport port-security violation shutdown
SW1(config-if)# end</pre>
<p><b>Step 2: PC1 ko seekho.</b> PC1 se 192.168.10.1 ping karo taaki switch uska MAC dekhe, phir check karo:</p>
<pre class="out">SW1# show port-security address
               Secure Mac Address Table
-----------------------------------------------------------------------------
Vlan    Mac Address       Type                          Ports   Remaining Age
                                                                   (mins)
----    -----------       ----                          -----   -------------
<span class="hl">   1    0050.7966.0a01    SecureSticky                  Gi0/1        -</span>
-----------------------------------------------------------------------------</pre>
<p>Running config mein ab <code>switchport port-security mac-address sticky 0050.7966.0a01</code> hai.</p>
<p><b>Step 3: rogue device bano.</b> PC1 par <code>set mac 0bad.beef.0001</code> chalao aur gateway ko dobara ping karo. Yeh visitor ke laptop ki nakal karta hai, aur yeh bhi dikhata hai ki MAC kitni aasaani se spoof hota hai.</p>
<pre class="out">%PORT_SECURITY-2-PSECURE_VIOLATION: Security violation occurred, caused by MAC address 0bad.beef.0001 on port GigabitEthernet0/1.
%PM-4-ERR_DISABLE: psecure-violation error detected on Gi0/1, putting Gi0/1 in err-disable state

SW1# show port-security interface GigabitEthernet0/1
Port Security              : Enabled
<span class="hl">Port Status                : Secure-shutdown</span>
Violation Mode             : Shutdown
Maximum MAC Addresses      : 1
Total MAC Addresses        : 1
Sticky MAC Addresses       : 1
Last Source Address:Vlan   : 0bad.beef.0001:1
<span class="hl">Security Violation Count   : 1</span>

SW1# show interfaces status err-disabled
Port      Name               Status       Reason               Err-disabled Vlans
<span class="hl">Gi0/1                        err-disabled psecure-violation</span></pre>
<p>Lab question ka jawab <b>err-disabled</b> hai.</p>
<p><b>Step 4: recover karo.</b> Pehle wajah hatao, phir port bounce karo. Order matter karta hai: agar pehle bounce karoge, to rogue MAC turant naya violation trigger kar dega.</p>
<pre class="code">PC1&gt; set mac 0050.7966.0a01
SW1(config)# interface GigabitEthernet0/1
SW1(config-if)# shutdown
SW1(config-if)# no shutdown
SW1(config-if)# end</pre>
<p>PC1 phir se 192.168.10.1 ko successfully ping karta hai, aur violation count saboot ke roop mein 1 par rehta hai. Production mein aap <code>errdisable recovery cause psecure-violation</code> aur <code>errdisable recovery interval 300</code> se switch ko apne aap recover karne bhi de sakte ho.</p>

<h3>802.1X: user ya device ko authenticate karo</h3>
<p><b>IEEE 802.1X</b> port-based authentication hai jismein teen roles hain: <b>supplicant</b> (laptop par software), <b>authenticator</b> (switch ya wireless AP) aur <b>authentication server</b> (directory se juda RADIUS server). Authentication successful hone tak port sirf EAP messages pass karta hai (EAP over LAN). Success par RADIUS server VLAN ya ACL bhi assign kar sakta hai. Bina supplicant wale devices, jaise printers, fallback ke roop mein <b>MAC authentication bypass (MAB)</b> use kar sakte hain. 802.1X port security se kahin zyada strong hai kyunki woh credentials ya certificates check karta hai, sirf MAC nahi.</p>

<h3>MAC filtering</h3>
<p><b>MAC filtering</b> switch, AP ya router par MAC addresses ki allow list (ya block list) hai. Yeh simple hai aur casual galtiyan rokta hai, lekin MACs clear mein bheje jaate hain aur seconds mein badle ja sakte hain, bilkul jaise aapne <code>set mac</code> se kiya. Ise speed bump samjho, kabhi apna akela control nahi.</p>

<div class="warn"><p><b>Common galtiyan.</b> Dynamic ya trunk port par port security enable karna (ise <code>switchport mode access</code> chahiye). IP phone aur PC wali desk par maximum 1 set karna. Config save karna bhool jaana, jisse sticky MACs reload par gayab ho jaate hain. Rogue device hataane se pehle err-disabled port ko bounce karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Shutdown default violation mode hai aur err-disabled tak le jaata hai. Restrict drop aur log karta hai; protect chupchaap drop karta hai. 802.1X roles: supplicant, authenticator, authentication server (RADIUS). MAC filtering spoofing se aasaani se haar jaata hai.</p></div>

<div class="scn"><h4>Naya PC jisne port band kar diya</h4><p>IT ne reception PC ko naye se badla, aur port kuch seconds mein err-disabled ho gaya. Purane PC ka sticky MAC ab bhi configuration mein tha. Engineer ne ise <code>clear port-security sticky interface GigabitEthernet0/1</code> se clear kiya, port bounce kiya, naye PC ko seekhne diya aur configuration save ki. Change process update hua taaki har hardware swap mein sticky entry clear karna shaamil ho.</p><p><b>Seekh:</b> jab port security unknown MAC ko block karta hai to woh apna kaam kar raha hai; legitimate changes ke liye bhi plan karo.</p></div>

<div class="iv"><p class="q">"Port security, MAC filtering aur 802.1X ko compare karo."</p><p>Port security har switch port par MACs ki sankhya aur pehchaan seemit karta hai aur protect, restrict ya shutdown se react karta hai. MAC filtering MACs ki allow list hai, aasaani se spoof hoti hai. 802.1X port khulne se pehle EAP aur RADIUS server se user ya device ko authenticate karta hai, aur VLANs dynamically assign kar sakta hai; yeh enterprise jawab hai, un devices ke liye MAB ke saath jo supplicant nahi chala sakte.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Port security: maximum MACs, sticky learning, violation protect, restrict ya shutdown.</li>
<li>Shutdown violation port ko err-disabled mein daalta hai; wajah theek karo, phir shutdown / no shutdown.</li>
<li><code>show port-security interface</code>, <code>show port-security address</code> aur <code>show interfaces status err-disabled</code> se verify karo.</li>
<li>802.1X supplicant, authenticator aur RADIUS server use karta hai; MAB bina supplicant wale devices cover karta hai.</li>
<li>MAC filtering akele kamzor hai kyunki MACs spoof karna aasaan hai.</li>
</ul></div>
`}};export{e as default};