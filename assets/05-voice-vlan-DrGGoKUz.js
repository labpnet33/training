var e={id:`voice-vlan`,h:{en:`Voice VLAN: a PC and an IP phone on one port`,hi:`Voice VLAN: ek port par PC aur IP phone`},body:{en:`
<p>Most offices have one network socket per desk, but two devices that need it: the IP phone and the PC. Running a second cable to every desk is expensive, so the phone contains a tiny switch and the PC plugs into the back of the phone. Now one cable carries two very different kinds of traffic: voice, which must never stutter, and data, which can wait a few milliseconds. The <b>voice VLAN</b> is how the switch keeps them apart on a single access port.</p>

<h3>How the pieces fit together</h3>
<p>A Cisco IP phone has a small internal 3-port switch: one port towards the wall (the access switch), one port for the PC, and one internal port for the phone itself. The access switch port is configured with <b>two</b> VLANs:</p>
<ul>
<li>The <b>access (data) VLAN</b> for the PC. PC frames cross the cable <b>untagged</b>, exactly like any access port.</li>
<li>The <b>voice VLAN</b> for the phone. Phone frames cross the cable <b>tagged</b> with 802.1Q, carrying the voice VLAN ID and a priority value of <b>CoS 5</b> in the tag's priority bits.</li>
</ul>
<p>The phone is told which voice VLAN to use by the switch through <b>CDP</b> (Cisco Discovery Protocol) for Cisco phones, or <b>LLDP-MED</b> (the standard, vendor-neutral protocol with media extensions) for many other phones. CDP and LLDP are covered fully in their own module; here you only need to know that without one of them the phone cannot learn its voice VLAN and ends up in the data VLAN.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Switch port carries tagged voice VLAN 110 and untagged data VLAN 10 to a phone with a PC behind it">
<rect x="20" y="80" width="130" height="60" rx="8" fill="#bae6fd"/><text x="85" y="106" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="85" y="126" text-anchor="middle" class="svg-muted" font-size="12">Gi0/5</text>
<rect x="290" y="80" width="130" height="60" rx="8" fill="#fde68a"/><text x="355" y="106" text-anchor="middle" class="svg-ink" font-size="14">IP phone</text><text x="355" y="126" text-anchor="middle" class="svg-muted" font-size="12">3-port switch</text>
<rect x="500" y="80" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="115" text-anchor="middle" class="svg-ink" font-size="14">PC</text>
<line x1="150" y1="110" x2="290" y2="110" stroke="#64748b" stroke-width="4"/>
<line x1="420" y1="110" x2="500" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="220" y="70" text-anchor="middle" class="svg-accent" font-size="12">voice: tag 110, CoS 5</text>
<text x="220" y="160" text-anchor="middle" class="svg-muted" font-size="12">data: untagged = VLAN 10</text>
<text x="460" y="160" text-anchor="middle" class="svg-muted" font-size="12">untagged</text>
<text x="220" y="200" text-anchor="middle" class="svg-ink" font-size="12">CDP / LLDP-MED: "use VLAN 110"</text>
</svg><p class="cap">One cable, two VLANs: the phone tags its own frames, the PC's frames stay untagged.</p></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! Create the voice VLAN</span>
SW1(config)# vlan 110
SW1(config-vlan)# name VOICE
SW1(config-vlan)# exit
<span class="c">! Desk port: PC in VLAN 10, phone in VLAN 110</span>
SW1(config)# interface GigabitEthernet0/5
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 10
SW1(config-if)# switchport voice vlan 110
<span class="c">! For non-Cisco phones that use LLDP-MED, enable LLDP globally</span>
SW1(config-if)# exit
SW1(config)# lldp run</pre>
<p>CDP is enabled by default on Cisco switches; LLDP usually is not, which is why <code>lldp run</code> matters for third-party phones. The port is still configured as an access port. Cisco sometimes calls it a <b>multi-VLAN access port</b>, but it is <b>not a trunk</b>: it does not negotiate with DTP, carries only these two VLANs, and does not appear in <code>show interfaces trunk</code>.</p>
<p>Phones need power too. Most get it from the same cable using <b>PoE</b> (Power over Ethernet), and CDP or LLDP also negotiate how much power the phone needs. Voice quality usually also relies on QoS trust settings on the port so that the switch honours the phone's CoS 5 marking; that belongs to the QoS topics and is only mentioned here.</p>

<h3>Verification</h3>
<pre class="out">SW1# show interfaces GigabitEthernet0/5 switchport | include Mode|VLAN
Administrative Mode: static access
<span class="hl">Operational Mode: static access</span>
<span class="hl">Access Mode VLAN: 10 (SALES)</span>
Trunking Native Mode VLAN: 1 (default)
<span class="hl">Voice VLAN: 110 (VOICE)</span>

SW1# show mac address-table interface GigabitEthernet0/5
          Mac Address Table
-------------------------------------------

Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
  10    0050.7966.6805    DYNAMIC     Gi0/5
<span class="hl"> 110    00a1.b2c3.d4e5    DYNAMIC     Gi0/5</span></pre>
<p>Two MAC addresses on one port, in two different VLANs: the PC in VLAN 10 and the phone in VLAN 110. That single output proves the voice VLAN is working. <code>show cdp neighbors</code> should also list the phone (a device ID starting with SEP followed by its MAC, platform "IP Phone").</p>

<div class="eg"><p><b>Worked example.</b> A floor has 80 desks. Without a voice VLAN you would need 160 switch ports and 160 cable runs, and phones would share a subnet and broadcasts with PCs. With a voice VLAN you use 80 ports, PCs get addresses from 10.10.10.0/24 in VLAN 10, phones get addresses from 10.110.0.0/24 in VLAN 110 with a DHCP option pointing to the call server, and QoS can prioritise everything in VLAN 110 with CoS 5.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Configuring the desk port as a trunk "because it carries two VLANs" (unnecessary and less secure); disabling CDP on user ports for security and forgetting that Cisco phones then cannot learn the voice VLAN; forgetting <code>lldp run</code> for non-Cisco phones; and not creating the voice VLAN itself.</p></div>

<div class="exam"><p><b>Exam trap.</b> On a voice port, which traffic is tagged? The <b>voice</b> traffic is tagged with the voice VLAN and CoS 5; the <b>data</b> traffic from the PC is untagged in the access VLAN. And the command is <code>switchport voice vlan</code>, not a trunk command.</p></div>

<div class="scn"><h4>New phones land in the data VLAN</h4><p>A company replaced old Cisco phones with a third-party model on two floors. The new phones booted and got addresses, but from the PC subnet, and calls failed because the call server only accepted phones from the voice subnet. The ports were correct: <code>switchport voice vlan 150</code> was configured and CDP was on. The engineer ran <code>show lldp neighbors</code> and got <code>% LLDP is not enabled</code>. The new phones only understood LLDP-MED, so nobody told them about VLAN 150 and they fell back to sending untagged frames into the data VLAN. After <code>lldp run</code> the phones rebooted into VLAN 150 and registered.</p><p><b>Lesson:</b> the voice VLAN is only half the job; the phone must learn it through CDP or LLDP-MED.</p></div>

<div class="iv"><p class="q">"A port has a PC behind an IP phone. Is that port a trunk?"</p><p>Strong answer: no, it is an access port with a voice VLAN. PC traffic is untagged in the access VLAN; phone traffic is 802.1Q-tagged in the voice VLAN with CoS 5. The phone learns the voice VLAN via CDP or LLDP-MED. Verify with <code>show interfaces switchport</code> (Voice VLAN line) and <code>show mac address-table interface</code>, which shows two MACs in two VLANs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A voice port carries a data VLAN (untagged, for the PC) and a voice VLAN (tagged, CoS 5, for the phone).</li>
<li>Configure with <code>switchport access vlan</code> plus <code>switchport voice vlan</code>; the port stays an access port.</li>
<li>Phones learn the voice VLAN through CDP (Cisco) or LLDP-MED (standard; needs <code>lldp run</code>).</li>
<li>Verify with the Voice VLAN line in <code>show interfaces switchport</code> and two MACs in two VLANs on the port.</li>
<li>Separate voice VLANs give phones their own subnet, QoS treatment and security boundary.</li>
</ul></div>
`,hi:`
<p>Zyada tar offices mein har desk par ek network socket hota hai, par do devices ko uski zaroorat hoti hai: IP phone aur PC. Har desk tak doosri cable daalna mehnga hai, isliye phone ke andar ek chhota switch hota hai aur PC phone ke peeche plug hota hai. Ab ek cable do bilkul alag tarah ka traffic carry karti hai: voice, jo kabhi atakna nahi chahiye, aur data, jo kuch milliseconds wait kar sakta hai. <b>Voice VLAN</b> se switch ek hi access port par dono ko alag rakhta hai.</p>

<h3>Pieces kaise judte hain</h3>
<p>Cisco IP phone mein ek chhota internal 3-port switch hota hai: ek port wall (access switch) ki taraf, ek port PC ke liye, aur ek internal port khud phone ke liye. Access switch ka port <b>do</b> VLANs ke saath configure hota hai:</p>
<ul>
<li>PC ke liye <b>access (data) VLAN</b>. PC ke frames cable par <b>untagged</b> jaate hain, bilkul kisi bhi access port ki tarah.</li>
<li>Phone ke liye <b>voice VLAN</b>. Phone ke frames cable par 802.1Q ke saath <b>tagged</b> jaate hain, jisme voice VLAN ID aur tag ke priority bits mein <b>CoS 5</b> ki value hoti hai.</li>
</ul>
<p>Switch phone ko batata hai ki kaunsa voice VLAN use karna hai: Cisco phones ke liye <b>CDP</b> (Cisco Discovery Protocol) se, ya kai doosre phones ke liye <b>LLDP-MED</b> (standard, vendor-neutral protocol, media extensions ke saath) se. CDP aur LLDP apne module mein poori tarah cover hote hain; yahan bas itna jaanna hai ki inme se kisi ke bina phone apna voice VLAN nahi seekh sakta aur data VLAN mein chala jaata hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Switch port tagged voice VLAN 110 aur untagged data VLAN 10 ko phone tak le jaata hai, phone ke peeche PC">
<rect x="20" y="80" width="130" height="60" rx="8" fill="#bae6fd"/><text x="85" y="106" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="85" y="126" text-anchor="middle" class="svg-muted" font-size="12">Gi0/5</text>
<rect x="290" y="80" width="130" height="60" rx="8" fill="#fde68a"/><text x="355" y="106" text-anchor="middle" class="svg-ink" font-size="14">IP phone</text><text x="355" y="126" text-anchor="middle" class="svg-muted" font-size="12">3-port switch</text>
<rect x="500" y="80" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="115" text-anchor="middle" class="svg-ink" font-size="14">PC</text>
<line x1="150" y1="110" x2="290" y2="110" stroke="#64748b" stroke-width="4"/>
<line x1="420" y1="110" x2="500" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="220" y="70" text-anchor="middle" class="svg-accent" font-size="12">voice: tag 110, CoS 5</text>
<text x="220" y="160" text-anchor="middle" class="svg-muted" font-size="12">data: untagged = VLAN 10</text>
<text x="460" y="160" text-anchor="middle" class="svg-muted" font-size="12">untagged</text>
<text x="220" y="200" text-anchor="middle" class="svg-ink" font-size="12">CDP / LLDP-MED: "VLAN 110 use karo"</text>
</svg><p class="cap">Ek cable, do VLANs: phone apne frames khud tag karta hai, PC ke frames untagged rehte hain.</p></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! Voice VLAN banao</span>
SW1(config)# vlan 110
SW1(config-vlan)# name VOICE
SW1(config-vlan)# exit
<span class="c">! Desk port: PC VLAN 10 mein, phone VLAN 110 mein</span>
SW1(config)# interface GigabitEthernet0/5
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 10
SW1(config-if)# switchport voice vlan 110
<span class="c">! LLDP-MED use karne wale non-Cisco phones ke liye LLDP globally enable karo</span>
SW1(config-if)# exit
SW1(config)# lldp run</pre>
<p>Cisco switches par CDP default mein enabled hota hai; LLDP aam taur par nahi, isiliye third-party phones ke liye <code>lldp run</code> matter karta hai. Port phir bhi access port ki tarah configured hai. Cisco kabhi kabhi ise <b>multi-VLAN access port</b> kehta hai, par yeh <b>trunk nahi hai</b>: yeh DTP se negotiate nahi karta, sirf yeh do VLANs carry karta hai, aur <code>show interfaces trunk</code> mein nahi dikhta.</p>
<p>Phones ko power bhi chahiye. Zyada tar ko wahi cable <b>PoE</b> (Power over Ethernet) se power deti hai, aur CDP ya LLDP yeh bhi negotiate karte hain ki phone ko kitni power chahiye. Voice quality aam taur par port ki QoS trust settings par bhi depend karti hai taaki switch phone ki CoS 5 marking ko maane; woh QoS topics ka hissa hai aur yahan sirf mention kiya gaya hai.</p>

<h3>Verification</h3>
<pre class="out">SW1# show interfaces GigabitEthernet0/5 switchport | include Mode|VLAN
Administrative Mode: static access
<span class="hl">Operational Mode: static access</span>
<span class="hl">Access Mode VLAN: 10 (SALES)</span>
Trunking Native Mode VLAN: 1 (default)
<span class="hl">Voice VLAN: 110 (VOICE)</span>

SW1# show mac address-table interface GigabitEthernet0/5
          Mac Address Table
-------------------------------------------

Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
  10    0050.7966.6805    DYNAMIC     Gi0/5
<span class="hl"> 110    00a1.b2c3.d4e5    DYNAMIC     Gi0/5</span></pre>
<p>Ek port par do MAC addresses, do alag VLANs mein: PC VLAN 10 mein aur phone VLAN 110 mein. Yeh ek output prove karta hai ki voice VLAN chal raha hai. <code>show cdp neighbors</code> mein bhi phone dikhna chahiye (SEP se shuru hone wala device ID aur uske baad MAC, platform "IP Phone").</p>

<div class="eg"><p><b>Worked example.</b> Ek floor par 80 desks hain. Voice VLAN ke bina aapko 160 switch ports aur 160 cable runs chahiye, aur phones PCs ke saath subnet aur broadcasts share karte. Voice VLAN ke saath aap 80 ports use karte ho, PCs VLAN 10 mein 10.10.10.0/24 se addresses lete hain, phones VLAN 110 mein 10.110.0.0/24 se addresses lete hain aur DHCP option call server ki taraf point karta hai, aur QoS VLAN 110 ki har cheez ko CoS 5 ke saath priority de sakta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Desk port ko trunk banana "kyunki woh do VLANs carry karta hai" (zaroori nahi aur kam secure); security ke liye user ports par CDP band karna aur bhool jaana ki phir Cisco phones voice VLAN nahi seekh paate; non-Cisco phones ke liye <code>lldp run</code> bhoolna; aur khud voice VLAN banana bhool jaana.</p></div>

<div class="exam"><p><b>Exam trap.</b> Voice port par kaunsa traffic tagged hota hai? <b>Voice</b> traffic voice VLAN aur CoS 5 ke saath tagged hota hai; PC ka <b>data</b> traffic access VLAN mein untagged hota hai. Aur command <code>switchport voice vlan</code> hai, koi trunk command nahi.</p></div>

<div class="scn"><h4>Naye phones data VLAN mein pahunch gaye</h4><p>Ek company ne do floors par purane Cisco phones ko ek third-party model se badla. Naye phones boot hue aur addresses bhi mile, par PC subnet se, aur calls fail hui kyunki call server sirf voice subnet ke phones accept karta tha. Ports sahi the: <code>switchport voice vlan 150</code> configured tha aur CDP on tha. Engineer ne <code>show lldp neighbors</code> chalaya aur mila <code>% LLDP is not enabled</code>. Naye phones sirf LLDP-MED samajhte the, isliye kisi ne unhe VLAN 150 ke baare mein bataya hi nahi aur woh untagged frames data VLAN mein bhejne lage. <code>lldp run</code> ke baad phones VLAN 150 mein reboot hue aur register ho gaye.</p><p><b>Seekh:</b> voice VLAN sirf aadha kaam hai; phone ko use CDP ya LLDP-MED se seekhna padta hai.</p></div>

<div class="iv"><p class="q">"Ek port par IP phone ke peeche PC hai. Kya woh port trunk hai?"</p><p>Strong answer: nahi, yeh voice VLAN wala access port hai. PC traffic access VLAN mein untagged hai; phone traffic voice VLAN mein CoS 5 ke saath 802.1Q-tagged hai. Phone voice VLAN CDP ya LLDP-MED se seekhta hai. <code>show interfaces switchport</code> (Voice VLAN line) aur <code>show mac address-table interface</code> se verify karo, jo do VLANs mein do MACs dikhata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Voice port ek data VLAN (untagged, PC ke liye) aur ek voice VLAN (tagged, CoS 5, phone ke liye) carry karta hai.</li>
<li><code>switchport access vlan</code> plus <code>switchport voice vlan</code> se configure karo; port access port hi rehta hai.</li>
<li>Phones voice VLAN CDP (Cisco) ya LLDP-MED (standard; <code>lldp run</code> chahiye) se seekhte hain.</li>
<li><code>show interfaces switchport</code> ki Voice VLAN line aur port par do VLANs mein do MACs se verify karo.</li>
<li>Alag voice VLAN phones ko apna subnet, QoS treatment aur security boundary deta hai.</li>
</ul></div>
`}};export{e as default};