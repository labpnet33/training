var e={id:`hardware-device-commands`,h:{en:`Hardware tools and device show commands`,hi:`Hardware tools aur device show commands`},body:{en:`
<p>The second half of objective 5.5 covers the tools you carry in your bag and the commands you type on switches and routers. Software tools tell you what a host thinks; hardware tools tell you what the <b>cable and the air</b> are really doing; device commands tell you what the <b>network</b> thinks. A good engineer moves between all three without hesitation.</p>

<h3>Hardware tools</h3>
<dl class="terms">
<dt>Toner (tone generator and probe)</dt><dd>You clip the tone generator to one end of a cable; it puts an audible signal on the wire. At the patch panel or in the ceiling you sweep the inductive probe along the bundle until it beeps loudest. Used to <b>find which cable is which</b> when labels are missing.</dd>
<dt>Cable tester</dt><dd>Checks copper wiring: continuity, <b>wire map</b> (opens, shorts, crossed or split pairs, A/B mismatch) and often length. Many use a time domain reflectometer (TDR) to show the <b>distance to a fault</b>. A <b>certifier</b> goes further and proves the cable meets its category (Cat6, Cat6a) for NEXT, attenuation and return loss.</dd>
<dt>Taps</dt><dd>A network <b>TAP</b> (test access point) sits inline on a link and copies every frame, including errored frames, to a monitoring port for a protocol analyzer. Passive taps need no power for fiber; active taps are used for copper. Compared with switch port mirroring (SPAN), a tap does not drop copies when the switch is busy and does not depend on switch config.</dd>
<dt>Wi-Fi analyzer</dt><dd>Software or a dedicated device that lists SSIDs, BSSIDs, channels, channel widths, RSSI, noise and security. Advanced models include a <b>spectrum analyzer</b> that also sees non-Wi-Fi interference such as microwaves. Used for site surveys and walk tests.</dd>
<dt>Visual fault locator (VFL)</dt><dd>A pen-sized visible red laser (around 650 nm) injected into a fiber. Light escapes at <b>breaks, sharp bends and bad connectors</b>, so the fault glows through the jacket. Also used to check continuity and polarity of short fiber runs. Good for a few kilometres; longer runs need an OTDR.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Which hardware tool for which layer">
<rect x="10" y="20" width="195" height="50" rx="8" fill="#fed7aa"/><text x="107" y="42" text-anchor="middle" class="svg-ink" font-size="13">Copper cable</text><text x="107" y="60" text-anchor="middle" class="svg-muted" font-size="12">toner, cable tester</text>
<rect x="222" y="20" width="195" height="50" rx="8" fill="#fde68a"/><text x="319" y="42" text-anchor="middle" class="svg-ink" font-size="13">Fiber</text><text x="319" y="60" text-anchor="middle" class="svg-muted" font-size="12">VFL, power meter</text>
<rect x="434" y="20" width="195" height="50" rx="8" fill="#bae6fd"/><text x="531" y="42" text-anchor="middle" class="svg-ink" font-size="13">Radio</text><text x="531" y="60" text-anchor="middle" class="svg-muted" font-size="12">Wi-Fi analyzer</text>
<rect x="110" y="88" width="420" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">Traffic on a live link</text><text x="320" y="128" text-anchor="middle" class="svg-muted" font-size="12">tap (or SPAN) + protocol analyzer</text>
</svg><p class="cap">Match the hardware tool to the medium you suspect.</p></div>

<h3>Basic network device commands</h3>
<p>Network+ lists these commands by function; on the Cisco-style CLI used in the labs they look like this:</p>
<table class="cmp"><tr><th>Function</th><th>Command</th><th>What you learn</th></tr>
<tr><td>show mac-address-table</td><td><code>show mac address-table</code></td><td>Which port and VLAN a MAC was learnt on</td></tr>
<tr><td>show route</td><td><code>show ip route</code></td><td>Routes, next hops, the gateway of last resort</td></tr>
<tr><td>show interface</td><td><code>show interfaces</code>, <code>show ip interface brief</code>, <code>show interfaces status</code></td><td>Up/down state, speed, duplex, errors, drops</td></tr>
<tr><td>show config</td><td><code>show running-config</code> (and <code>startup-config</code>)</td><td>The active configuration; compare with the saved one</td></tr>
<tr><td>show arp</td><td><code>show ip arp</code></td><td>IP-to-MAC mappings the router or L3 switch knows</td></tr>
<tr><td>show vlan</td><td><code>show vlan brief</code></td><td>VLANs and their access ports</td></tr>
<tr><td>show power</td><td><code>show power inline</code></td><td>PoE budget, per-port power and state</td></tr>
</table>

<div class="eg"><p><b>Worked example: find the port of a misbehaving PC.</b> Monitoring shows 10.0.10.57 flooding the network. You need the physical port.</p>
<pre class="out">R1# show ip arp 10.0.10.57
Protocol  Address          Age (min)  Hardware Addr   Type   Interface
Internet  10.0.10.57              3   <span class="hl">0050.7966.0a39</span>  ARPA   GigabitEthernet0/0

SW1# show mac address-table address 0050.7966.0a39
          Mac Address Table
-------------------------------------------
Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
  10    0050.7966.0a39    DYNAMIC     <span class="hl">Gi1/0/14</span>
Total Mac Addresses for this criterion: 1

SW1# show running-config interface Gi1/0/14
interface GigabitEthernet1/0/14
 description Desk-3-14
 switchport access vlan 10
 switchport mode access
 spanning-tree portfast</pre>
<p>Three commands took you from an IP address to desk 3-14. If the MAC had appeared on an uplink instead of an access port, you would repeat <code>show mac address-table</code> on the next switch down, using <code>show cdp neighbors</code> or <code>show lldp neighbors</code> to learn which switch that is.</p></div>

<h3>Reading show commands like a pro</h3>
<ul>
<li><b>Start broad, then narrow:</b> <code>show ip interface brief</code> for every interface in one screen, then <code>show interfaces Gi0/1</code> for the one that looks wrong.</li>
<li><b>Filter:</b> <code>| include</code>, <code>| section</code> and <code>| begin</code> cut long output down to the lines you need.</li>
<li><b>Compare running and startup:</b> an unsaved change disappears after a reload; a change saved but not active never took effect.</li>
<li><b>Clear, test, read:</b> <code>clear counters</code>, reproduce the problem, then read the counters again, as you will in the slow-link lab.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Using a toner on a live PoE port with a tone generator not rated for it. Trusting a simple continuity tester to prove a cable supports 10 Gbps (only a certifier does). Setting up SPAN on a busy switch and assuming you saw every frame. Reading <code>show running-config</code> when the question is about what the device learnt (tables such as ARP, MAC and routes are not in the config).</p></div>

<div class="exam"><p><b>Exam traps.</b> Toner = find a cable; cable tester = wiring faults; certifier = performance to category; VFL = red light shows fiber breaks and bends; Wi-Fi analyzer = channels and signal; tap = copies all traffic inline. show mac address-table maps MAC to port; show arp maps IP to MAC; show power shows PoE.</p></div>

<div class="scn"><h4>The unlabelled patch panel</h4><p>A branch office needed one user moved to a new VLAN, but the patch panel had no labels and the switch descriptions were out of date. The technician plugged a tone generator into the user's wall socket and found the panel port with the probe in under a minute. On the switch, <code>show mac address-table address</code> for the user's laptop MAC confirmed the switch port was Gi1/0/22, and <code>show lldp neighbors</code> confirmed the uplinks. He changed the VLAN, labelled both ends, and updated the port description.</p><p><b>Lesson:</b> hardware tools and show commands confirm each other. Always leave the labels and descriptions better than you found them.</p></div>

<div class="iv"><p class="q">"How do you find which switch port a device is connected to if you only know its IP address?"</p><p>On the gateway, <code>show ip arp</code> for the IP to get its MAC. On the access switch, <code>show mac address-table address</code> for that MAC to get the port and VLAN. If the port is an uplink, use CDP or LLDP to find the next switch and repeat until you reach an access port. Confirm with <code>show running-config interface</code> and the port description, or physically with a toner.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Toner finds cables; testers find wiring faults; certifiers prove category performance.</li>
<li>A VFL shows fiber breaks and bends with red light; a Wi-Fi analyzer shows channels, RSSI and interference.</li>
<li>Taps copy all traffic inline, including errors; SPAN may drop copies under load.</li>
<li>IP to MAC with show arp, MAC to port with show mac address-table, port settings with show running-config.</li>
<li>show interfaces, show ip route, show vlan and show power inline are your daily health checks.</li>
</ul></div>
`,hi:`
<p>Objective 5.5 ka doosra half un tools ko cover karta hai jo aap apne bag mein rakhte ho aur un commands ko jo switches aur routers par type karte ho. Software tools batate hain host kya sochta hai; hardware tools batate hain <b>cable aur hawa</b> asal mein kya kar rahe hain; device commands batate hain <b>network</b> kya sochta hai. Achha engineer teeno ke beech bina jhijhak aata-jaata hai.</p>

<h3>Hardware tools</h3>
<dl class="terms">
<dt>Toner (tone generator aur probe)</dt><dd>Aap tone generator ko cable ke ek end par clip karte ho; woh wire par sunaai dene wala signal daalta hai. Patch panel par ya ceiling mein aap inductive probe ko bundle ke saath ghumaate ho jab tak sabse zor se beep na kare. Labels missing hon to <b>kaunsi cable kaunsi hai</b> dhoondhne ke liye use hota hai.</dd>
<dt>Cable tester</dt><dd>Copper wiring check karta hai: continuity, <b>wire map</b> (opens, shorts, crossed ya split pairs, A/B mismatch) aur aksar length. Kai time domain reflectometer (TDR) use karke <b>fault tak ki doori</b> dikhate hain. <b>Certifier</b> aage jaata hai aur saabit karta hai ki cable NEXT, attenuation aur return loss ke liye apni category (Cat6, Cat6a) poori karti hai.</dd>
<dt>Taps</dt><dd>Network <b>TAP</b> (test access point) link par inline baithta hai aur har frame, errored frames samet, protocol analyzer ke liye monitoring port par copy karta hai. Fiber ke passive taps ko power nahi chahiye; copper ke liye active taps use hote hain. Switch port mirroring (SPAN) ke comparison mein, tap switch busy hone par copies drop nahi karta aur switch config par depend nahi karta.</dd>
<dt>Wi-Fi analyzer</dt><dd>Software ya dedicated device jo SSIDs, BSSIDs, channels, channel widths, RSSI, noise aur security list karta hai. Advanced models mein <b>spectrum analyzer</b> hota hai jo microwaves jaisa non-Wi-Fi interference bhi dekhta hai. Site surveys aur walk tests ke liye use hota hai.</dd>
<dt>Visual fault locator (VFL)</dt><dd>Pen jitna visible laal laser (lagbhag 650 nm) jo fiber mein daala jaata hai. <b>Breaks, sharp bends aur kharab connectors</b> par light bahar nikalti hai, isliye fault jacket ke through chamakta hai. Chhote fiber runs ki continuity aur polarity check karne ke liye bhi use hota hai. Kuch kilometres ke liye achha; lambe runs ko OTDR chahiye.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Kis layer ke liye kaunsa hardware tool">
<rect x="10" y="20" width="195" height="50" rx="8" fill="#fed7aa"/><text x="107" y="42" text-anchor="middle" class="svg-ink" font-size="13">Copper cable</text><text x="107" y="60" text-anchor="middle" class="svg-muted" font-size="12">toner, cable tester</text>
<rect x="222" y="20" width="195" height="50" rx="8" fill="#fde68a"/><text x="319" y="42" text-anchor="middle" class="svg-ink" font-size="13">Fiber</text><text x="319" y="60" text-anchor="middle" class="svg-muted" font-size="12">VFL, power meter</text>
<rect x="434" y="20" width="195" height="50" rx="8" fill="#bae6fd"/><text x="531" y="42" text-anchor="middle" class="svg-ink" font-size="13">Radio</text><text x="531" y="60" text-anchor="middle" class="svg-muted" font-size="12">Wi-Fi analyzer</text>
<rect x="110" y="88" width="420" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">Live link par traffic</text><text x="320" y="128" text-anchor="middle" class="svg-muted" font-size="12">tap (ya SPAN) + protocol analyzer</text>
</svg><p class="cap">Hardware tool ko us medium se match karo jiska aapko shak hai.</p></div>

<h3>Basic network device commands</h3>
<p>Network+ yeh commands function ke hisaab se list karta hai; labs mein use hone wale Cisco-style CLI par yeh aise dikhte hain:</p>
<table class="cmp"><tr><th>Function</th><th>Command</th><th>Aap kya seekhte ho</th></tr>
<tr><td>show mac-address-table</td><td><code>show mac address-table</code></td><td>MAC kis port aur VLAN par seekha gaya</td></tr>
<tr><td>show route</td><td><code>show ip route</code></td><td>Routes, next hops, gateway of last resort</td></tr>
<tr><td>show interface</td><td><code>show interfaces</code>, <code>show ip interface brief</code>, <code>show interfaces status</code></td><td>Up/down state, speed, duplex, errors, drops</td></tr>
<tr><td>show config</td><td><code>show running-config</code> (aur <code>startup-config</code>)</td><td>Active configuration; saved wale se compare karo</td></tr>
<tr><td>show arp</td><td><code>show ip arp</code></td><td>Router ya L3 switch ko pata IP-to-MAC mappings</td></tr>
<tr><td>show vlan</td><td><code>show vlan brief</code></td><td>VLANs aur unke access ports</td></tr>
<tr><td>show power</td><td><code>show power inline</code></td><td>PoE budget, per-port power aur state</td></tr>
</table>

<div class="eg"><p><b>Worked example: gadbad karte PC ka port dhoondo.</b> Monitoring dikhata hai ki 10.0.10.57 network ko flood kar raha hai. Aapko physical port chahiye.</p>
<pre class="out">R1# show ip arp 10.0.10.57
Protocol  Address          Age (min)  Hardware Addr   Type   Interface
Internet  10.0.10.57              3   <span class="hl">0050.7966.0a39</span>  ARPA   GigabitEthernet0/0

SW1# show mac address-table address 0050.7966.0a39
          Mac Address Table
-------------------------------------------
Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
  10    0050.7966.0a39    DYNAMIC     <span class="hl">Gi1/0/14</span>
Total Mac Addresses for this criterion: 1

SW1# show running-config interface Gi1/0/14
interface GigabitEthernet1/0/14
 description Desk-3-14
 switchport access vlan 10
 switchport mode access
 spanning-tree portfast</pre>
<p>Teen commands aapko IP address se desk 3-14 tak le gaye. Agar MAC access port ki jagah uplink par dikhta, to aap agle neeche wale switch par <code>show mac address-table</code> repeat karte, <code>show cdp neighbors</code> ya <code>show lldp neighbors</code> se yeh jaan kar ki woh kaunsa switch hai.</p></div>

<h3>Show commands pro ki tarah padhna</h3>
<ul>
<li><b>Broad se shuru karo, phir narrow:</b> ek screen mein har interface ke liye <code>show ip interface brief</code>, phir jo galat dikhe uske liye <code>show interfaces Gi0/1</code>.</li>
<li><b>Filter karo:</b> <code>| include</code>, <code>| section</code> aur <code>| begin</code> lambe output ko zaroori lines tak kaat dete hain.</li>
<li><b>Running aur startup compare karo:</b> unsaved change reload ke baad gayab ho jaata hai; saved lekin active nahi change kabhi laagu hi nahi hua.</li>
<li><b>Clear, test, read:</b> <code>clear counters</code>, problem reproduce karo, phir counters dobara padho, jaise aap slow-link lab mein karoge.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> Live PoE port par aise tone generator ke saath toner use karna jo uske liye rated nahi. Simple continuity tester par bharosa karna ki cable 10 Gbps support karti hai (sirf certifier yeh saabit karta hai). Busy switch par SPAN set karke maan lena ki aapne har frame dekha. Jab sawaal yeh ho ki device ne kya seekha tab <code>show running-config</code> padhna (ARP, MAC aur routes jaisi tables config mein nahi hoti).</p></div>

<div class="exam"><p><b>Exam traps.</b> Toner = cable dhoondho; cable tester = wiring faults; certifier = category tak performance; VFL = laal light fiber breaks aur bends dikhati hai; Wi-Fi analyzer = channels aur signal; tap = inline saara traffic copy karta hai. show mac address-table MAC ko port se map karta hai; show arp IP ko MAC se; show power PoE dikhata hai.</p></div>

<div class="scn"><h4>Bina label ka patch panel</h4><p>Ek branch office ko ek user ko naye VLAN mein move karna tha, lekin patch panel par koi label nahi the aur switch descriptions purani thi. Technician ne user ke wall socket mein tone generator lagaya aur ek minute se kam mein probe se panel port dhoondh liya. Switch par user ke laptop MAC ke liye <code>show mac address-table address</code> ne confirm kiya ki switch port Gi1/0/22 hai, aur <code>show lldp neighbors</code> ne uplinks confirm kiye. Usne VLAN badla, dono ends label kiye, aur port description update ki.</p><p><b>Seekh:</b> hardware tools aur show commands ek doosre ko confirm karte hain. Labels aur descriptions ko hamesha jaisa mila usse behtar chhodo.</p></div>

<div class="iv"><p class="q">"Agar aapko sirf device ka IP address pata hai to kaise dhoondoge ki woh kis switch port se juda hai?"</p><p>Gateway par IP ke liye <code>show ip arp</code> se uska MAC lo. Access switch par us MAC ke liye <code>show mac address-table address</code> se port aur VLAN lo. Agar port uplink hai, to CDP ya LLDP se agla switch dhoondo aur access port tak pahunchne tak repeat karo. <code>show running-config interface</code> aur port description se, ya physically toner se confirm karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Toner cables dhoondhta hai; testers wiring faults dhoondhte hain; certifiers category performance saabit karte hain.</li>
<li>VFL laal light se fiber breaks aur bends dikhata hai; Wi-Fi analyzer channels, RSSI aur interference dikhata hai.</li>
<li>Taps inline saara traffic copy karte hain, errors samet; SPAN load par copies drop kar sakta hai.</li>
<li>show arp se IP to MAC, show mac address-table se MAC to port, show running-config se port settings.</li>
<li>show interfaces, show ip route, show vlan aur show power inline aapke daily health checks hain.</li>
</ul></div>
`}};export{e as default};