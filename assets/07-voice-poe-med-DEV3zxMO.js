var e={id:`voice-poe-med`,h:{en:`IP phones: voice VLAN, PoE and LLDP-MED`,hi:`IP phones: voice VLAN, PoE aur LLDP-MED`},body:{en:`
<p>When a new employee joins, the receptionist hands over two things: a desk number and a visitor badge with the right access. Nobody expects the employee to guess them. An IP phone is that new employee. The moment it is plugged in, the switch must tell it which VLAN to use for voice and how much power it may draw. Discovery protocols are the receptionist.</p>

<h3>The phone, the PC and one cable</h3>
<p>Most desks have one network socket. A typical IP phone contains a small three-port switch: one port to the wall (the access switch), one internal port for the phone itself, and one port on the back for the user's PC. Voice and data must stay in <b>different VLANs</b> so voice can get priority and separate security rules. The switch port is configured like this:</p>
<pre class="code">SW1(config)# interface g0/7
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 10      <span class="c">! data VLAN, PC traffic untagged</span>
SW1(config-if)# switchport voice vlan 20       <span class="c">! voice VLAN, phone tags with 802.1Q</span>
SW1(config-if)# spanning-tree portfast</pre>
<p>The port stays an access port. The PC sends untagged frames that land in VLAN 10. The phone sends its voice frames <b>tagged</b> with VLAN 20 and CoS 5 (high priority). But how does the phone know the number 20? The switch tells it, using CDP for Cisco phones and <b>LLDP-MED</b> for phones that speak the standard.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Voice VLAN delivered by discovery">
<rect x="30" y="80" width="140" height="56" rx="8" fill="#bbf7d0"/><text x="100" y="104" text-anchor="middle" class="svg-ink" font-size="14">SW1 Gi0/7</text><text x="100" y="122" text-anchor="middle" class="svg-muted" font-size="12">data 10, voice 20</text>
<rect x="260" y="80" width="130" height="56" rx="8" fill="#fde68a"/><text x="325" y="104" text-anchor="middle" class="svg-ink" font-size="14">IP phone</text><text x="325" y="122" text-anchor="middle" class="svg-muted" font-size="12">tags VLAN 20</text>
<rect x="480" y="80" width="130" height="56" rx="8" fill="#bae6fd"/><text x="545" y="104" text-anchor="middle" class="svg-ink" font-size="14">PC</text><text x="545" y="122" text-anchor="middle" class="svg-muted" font-size="12">untagged, VLAN 10</text>
<line x1="170" y1="108" x2="260" y2="108" stroke="#64748b" stroke-width="3"/><line x1="390" y1="108" x2="480" y2="108" stroke="#64748b" stroke-width="2"/>
<text x="215" y="60" text-anchor="middle" class="svg-accent" font-size="12">CDP / LLDP-MED:</text><text x="215" y="75" text-anchor="middle" class="svg-accent" font-size="12">voice VLAN 20</text>
<text x="215" y="160" text-anchor="middle" class="svg-accent" font-size="12">phone asks: 6.3 W</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="13">one cable: voice tagged in VLAN 20, PC data untagged in VLAN 10</text>
</svg><p class="cap">The switch tells the phone its voice VLAN; the phone tells the switch how much power it needs.</p></div>

<h3>CDP with Cisco phones</h3>
<p>A Cisco switch sends the voice VLAN to the phone in a CDP TLV often called the <b>appliance VLAN-ID</b> or VVID. The phone announces itself with capability <b>H P M</b> (host, phone, two-port MAC relay) and a device ID beginning with SEP plus its MAC address.</p>
<pre class="out">SW1# show cdp neighbors gigabitEthernet 0/7
Device ID        Local Intrfce     Holdtme    Capability  Platform  Port ID
<span class="hl">SEP0011223344AA  Gig 0/7           158            H P M  IP Phone  Port 1</span></pre>
<p>This is why the earlier warning mattered: <code>no cdp enable</code> on a Cisco phone port can leave the phone without its voice VLAN, so voice ends up in the data VLAN with no priority.</p>

<h3>LLDP-MED: the standard way</h3>
<p><b>LLDP-MED</b> (Media Endpoint Discovery, ANSI/TIA-1057) is an extension of LLDP for endpoints such as phones, video units and access points. It adds these TLVs:</p>
<dl class="terms">
<dt>LLDP-MED capabilities</dt><dd>Announces that the device supports MED and which MED TLVs it can handle, and its device class. A switch only starts sending MED TLVs on a port after it hears this from an endpoint.</dd>
<dt>Network policy</dt><dd>Voice VLAN ID, Layer 2 priority (CoS) and DSCP for an application type such as voice. This is how a standards-based phone learns VLAN 20.</dd>
<dt>Location identification</dt><dd>A civic address or coordinates, used for emergency-call location.</dd>
<dt>Extended power-via-MDI</dt><dd>Exact power the endpoint needs, its priority and source.</dd>
<dt>Inventory</dt><dd>Hardware, firmware and software revision, serial number, manufacturer and model, useful for asset tracking.</dd>
</dl>
<p>On IOS, LLDP must be running (<code>lldp run</code>) and the port must transmit and receive. On Catalyst switches the voice VLAN from <code>switchport voice vlan</code> is advertised in the network policy TLV, and a <code>network-policy profile</code> can set the voice VLAN, CoS and DSCP explicitly for more control.</p>

<h3>Power over Ethernet negotiation</h3>
<p>PoE lets the switch (the power sourcing equipment) feed a phone or access point (the powered device) over the same cable. Standards set the ceilings: 802.3af PoE up to 15.4 W at the switch port, 802.3at PoE+ up to 30 W, and 802.3bt up to 60 or 90 W. Hardware classification only gives coarse classes, so the switch must reserve the maximum for the class. With CDP or LLDP power TLVs, the device can say exactly what it needs, and the switch reserves only that, leaving more of its power budget for other ports.</p>
<pre class="out">SW1# show power inline gigabitEthernet 0/7
Interface Admin  Oper       Power   Device              Class Max
                            (Watts)
--------- ------ ---------- ------- ------------------- ----- ----
<span class="hl">Gi0/7     auto   on         6.3     IP Phone 8845       2     30.0</span></pre>

<div class="eg"><p><b>Worked example.</b> A 12-port PoE switch has a 180 W budget. Each phone is hardware class 2, which would reserve 7 W each, and each access point is class 4 (30 W). With CDP or LLDP negotiation, each phone asks for 6.3 W and each access point for 18 W. For 8 phones and 2 access points the switch reserves 50.4 + 36 = 86.4 W instead of 56 + 60 = 116 W. Negotiation frees almost 30 W, enough to power one more access point from the same budget.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Enabling LLDP globally for third-party phones but leaving <code>no lldp transmit</code> on their ports from an old security template. (2) Assuming the voice VLAN turns the port into a trunk: it stays an access port with an extra voice VLAN. (3) Blaming the phone when voice lands in the data VLAN; check whether CDP or LLDP-MED is actually exchanged on that port.</p></div>

<div class="exam"><p><b>Exam trap.</b> LLDP-MED is an extension of LLDP, not of CDP, and it is what a non-Cisco phone uses to learn its voice VLAN. In LLDP output a phone shows capability <b>T</b> (telephone); in CDP output it shows <b>P</b>.</p></div>

<div class="scn"><h4>New phones, no dial tone</h4><p>A company replaced Cisco phones with another brand on one floor. The new phones powered up but registered in the data VLAN and calls were choppy. <code>show lldp neighbors</code> returned "% LLDP is not enabled": the switches only ran CDP, which the new phones ignored. After <code>lldp run</code> the switches sent the LLDP-MED network policy with voice VLAN 20, the phones moved to VLAN 20 with CoS 5, and call quality returned.</p><p><b>Lesson:</b> the discovery protocol the phone speaks decides how it learns its voice VLAN.</p></div>

<div class="iv"><p class="q">"How does an IP phone learn which VLAN to use for voice?"</p><p>Explain the port configuration (access VLAN for data plus <code>switchport voice vlan</code>), then say the switch advertises the voice VLAN to the phone: via CDP for Cisco phones and the LLDP-MED network policy TLV for standards-based phones. The phone tags voice frames with that VLAN and CoS 5; the PC behind it stays untagged in the data VLAN. Mention PoE negotiation as a bonus.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A phone port is an access port with a data VLAN plus <code>switchport voice vlan</code>.</li>
<li>Cisco phones learn the voice VLAN via CDP; standards-based phones via the LLDP-MED network policy TLV.</li>
<li>LLDP-MED TLVs: capabilities, network policy, location, extended power-via-MDI, inventory.</li>
<li>CDP and LLDP let powered devices request an exact PoE amount, saving the switch's power budget.</li>
<li>Disabling discovery on phone ports can break voice VLAN assignment.</li>
</ul></div>
`,hi:`
<p>Jab naya employee join karta hai, receptionist use do cheezein deta hai: desk number aur sahi access wala visitor badge. Koi expect nahi karta ki employee inhe guess kare. IP phone wahi naya employee hai. Plug hote hi switch ko use batana padta hai ki voice ke liye kaunsa VLAN use kare aur kitni power le sakta hai. Discovery protocols receptionist hain.</p>

<h3>Phone, PC aur ek cable</h3>
<p>Zyada tar desks par ek hi network socket hota hai. Typical IP phone ke andar ek chhota three-port switch hota hai: ek port deewar ki taraf (access switch), ek internal port phone ke liye, aur ek port peeche user ke PC ke liye. Voice aur data <b>alag VLANs</b> mein rehne chahiye taaki voice ko priority aur alag security rules mil sakein. Switch port aise configure hota hai:</p>
<pre class="code">SW1(config)# interface g0/7
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 10      <span class="c">! data VLAN, PC traffic untagged</span>
SW1(config-if)# switchport voice vlan 20       <span class="c">! voice VLAN, phone 802.1Q se tag karta hai</span>
SW1(config-if)# spanning-tree portfast</pre>
<p>Port access port hi rehta hai. PC untagged frames bhejta hai jo VLAN 10 mein jaate hain. Phone apne voice frames VLAN 20 aur CoS 5 (high priority) ke saath <b>tagged</b> bhejta hai. Lekin phone ko number 20 pata kaise chalta hai? Switch use batata hai, Cisco phones ke liye CDP se aur standard bolne wale phones ke liye <b>LLDP-MED</b> se.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Discovery se voice VLAN">
<rect x="30" y="80" width="140" height="56" rx="8" fill="#bbf7d0"/><text x="100" y="104" text-anchor="middle" class="svg-ink" font-size="14">SW1 Gi0/7</text><text x="100" y="122" text-anchor="middle" class="svg-muted" font-size="12">data 10, voice 20</text>
<rect x="260" y="80" width="130" height="56" rx="8" fill="#fde68a"/><text x="325" y="104" text-anchor="middle" class="svg-ink" font-size="14">IP phone</text><text x="325" y="122" text-anchor="middle" class="svg-muted" font-size="12">VLAN 20 tag</text>
<rect x="480" y="80" width="130" height="56" rx="8" fill="#bae6fd"/><text x="545" y="104" text-anchor="middle" class="svg-ink" font-size="14">PC</text><text x="545" y="122" text-anchor="middle" class="svg-muted" font-size="12">untagged, VLAN 10</text>
<line x1="170" y1="108" x2="260" y2="108" stroke="#64748b" stroke-width="3"/><line x1="390" y1="108" x2="480" y2="108" stroke="#64748b" stroke-width="2"/>
<text x="215" y="60" text-anchor="middle" class="svg-accent" font-size="12">CDP / LLDP-MED:</text><text x="215" y="75" text-anchor="middle" class="svg-accent" font-size="12">voice VLAN 20</text>
<text x="215" y="160" text-anchor="middle" class="svg-accent" font-size="12">phone maangta hai: 6.3 W</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="13">ek cable: voice VLAN 20 mein tagged, PC data VLAN 10 mein untagged</text>
</svg><p class="cap">Switch phone ko uska voice VLAN batata hai; phone switch ko batata hai ki use kitni power chahiye.</p></div>

<h3>Cisco phones ke saath CDP</h3>
<p>Cisco switch phone ko voice VLAN ek CDP TLV mein bhejta hai jise aksar <b>appliance VLAN-ID</b> ya VVID kehte hain. Phone khud ko capability <b>H P M</b> (host, phone, two-port MAC relay) aur SEP plus apne MAC address se shuru hone wale device ID ke saath announce karta hai.</p>
<pre class="out">SW1# show cdp neighbors gigabitEthernet 0/7
Device ID        Local Intrfce     Holdtme    Capability  Platform  Port ID
<span class="hl">SEP0011223344AA  Gig 0/7           158            H P M  IP Phone  Port 1</span></pre>
<p>Isiliye pehle wali warning important thi: Cisco phone port par <code>no cdp enable</code> phone ko uske voice VLAN ke bina chhod sakta hai, aur voice bina priority ke data VLAN mein chali jaati hai.</p>

<h3>LLDP-MED: standard tareeka</h3>
<p><b>LLDP-MED</b> (Media Endpoint Discovery, ANSI/TIA-1057) phones, video units aur access points jaise endpoints ke liye LLDP ka extension hai. Yeh yeh TLVs jodta hai:</p>
<dl class="terms">
<dt>LLDP-MED capabilities</dt><dd>Announce karta hai ki device MED support karta hai, kaunse MED TLVs handle kar sakta hai, aur uski device class. Switch kisi port par MED TLVs tabhi bhejna shuru karta hai jab use endpoint se yeh sunai de.</dd>
<dt>Network policy</dt><dd>Voice jaise application type ke liye voice VLAN ID, Layer 2 priority (CoS) aur DSCP. Isi se standards-based phone VLAN 20 seekhta hai.</dd>
<dt>Location identification</dt><dd>Civic address ya coordinates, emergency-call location ke liye.</dd>
<dt>Extended power-via-MDI</dt><dd>Endpoint ko exactly kitni power chahiye, uski priority aur source.</dd>
<dt>Inventory</dt><dd>Hardware, firmware aur software revision, serial number, manufacturer aur model, asset tracking ke liye useful.</dd>
</dl>
<p>IOS par LLDP chalna chahiye (<code>lldp run</code>) aur port transmit aur receive karta ho. Catalyst switches par <code>switchport voice vlan</code> wala voice VLAN network policy TLV mein advertise hota hai, aur zyada control ke liye <code>network-policy profile</code> voice VLAN, CoS aur DSCP explicitly set kar sakta hai.</p>

<h3>Power over Ethernet negotiation</h3>
<p>PoE switch (power sourcing equipment) ko usi cable par phone ya access point (powered device) ko bijli dene deta hai. Standards ceilings set karte hain: 802.3af PoE switch port par 15.4 W tak, 802.3at PoE+ 30 W tak, aur 802.3bt 60 ya 90 W tak. Hardware classification sirf mote classes deta hai, isliye switch ko class ka maximum reserve karna padta hai. CDP ya LLDP power TLVs ke saath device exactly bata sakta hai ki use kitna chahiye, aur switch sirf utna reserve karta hai, jisse doosre ports ke liye power budget zyada bachta hai.</p>
<pre class="out">SW1# show power inline gigabitEthernet 0/7
Interface Admin  Oper       Power   Device              Class Max
                            (Watts)
--------- ------ ---------- ------- ------------------- ----- ----
<span class="hl">Gi0/7     auto   on         6.3     IP Phone 8845       2     30.0</span></pre>

<div class="eg"><p><b>Worked example.</b> Ek 12-port PoE switch ka budget 180 W hai. Har phone hardware class 2 hai, jo har ek ke liye 7 W reserve karta, aur har access point class 4 (30 W) hai. CDP ya LLDP negotiation ke saath har phone 6.3 W aur har access point 18 W maangta hai. 8 phones aur 2 access points ke liye switch 56 + 60 = 116 W ki jagah 50.4 + 36 = 86.4 W reserve karta hai. Negotiation lagbhag 30 W bachata hai, jo usi budget se ek aur access point chalane ke liye kaafi hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Third-party phones ke liye LLDP globally enable karna lekin purane security template se unke ports par <code>no lldp transmit</code> chhod dena. (2) Yeh maanna ki voice VLAN port ko trunk bana deta hai: yeh ek extra voice VLAN wala access port hi rehta hai. (3) Voice data VLAN mein chali jaaye to phone ko dosh dena; check karo ki us port par CDP ya LLDP-MED sach mein exchange ho raha hai ya nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> LLDP-MED LLDP ka extension hai, CDP ka nahi, aur non-Cisco phone isi se apna voice VLAN seekhta hai. LLDP output mein phone capability <b>T</b> (telephone) dikhata hai; CDP output mein <b>P</b>.</p></div>

<div class="scn"><h4>Naye phones, dial tone nahi</h4><p>Ek company ne ek floor par Cisco phones ko doosre brand se badla. Naye phones power up hue lekin data VLAN mein register hue aur calls tootti-phootti thi. <code>show lldp neighbors</code> ne "% LLDP is not enabled" diya: switches sirf CDP chala rahe the, jise naye phones ignore karte the. <code>lldp run</code> ke baad switches ne voice VLAN 20 ke saath LLDP-MED network policy bheji, phones CoS 5 ke saath VLAN 20 mein aa gaye, aur call quality wapas aa gayi.</p><p><b>Seekh:</b> phone jo discovery protocol bolta hai, wahi decide karta hai ki woh voice VLAN kaise seekhega.</p></div>

<div class="iv"><p class="q">"IP phone kaise seekhta hai ki voice ke liye kaunsa VLAN use kare?"</p><p>Port configuration samjhao (data ke liye access VLAN plus <code>switchport voice vlan</code>), phir batao ki switch phone ko voice VLAN advertise karta hai: Cisco phones ke liye CDP se aur standards-based phones ke liye LLDP-MED network policy TLV se. Phone voice frames ko us VLAN aur CoS 5 se tag karta hai; uske peeche ka PC data VLAN mein untagged rehta hai. Bonus mein PoE negotiation batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Phone port ek access port hai jismein data VLAN plus <code>switchport voice vlan</code> hota hai.</li>
<li>Cisco phones voice VLAN CDP se seekhte hain; standards-based phones LLDP-MED network policy TLV se.</li>
<li>LLDP-MED TLVs: capabilities, network policy, location, extended power-via-MDI, inventory.</li>
<li>CDP aur LLDP powered devices ko exact PoE amount maangne dete hain, jisse switch ka power budget bachta hai.</li>
<li>Phone ports par discovery band karne se voice VLAN assignment toot sakta hai.</li>
</ul></div>
`}};export{e as default};