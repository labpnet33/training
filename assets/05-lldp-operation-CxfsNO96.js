var e={id:`lldp-operation`,h:{en:`LLDP: the open-standard discovery protocol`,hi:`LLDP: open-standard discovery protocol`},body:{en:`
<p>At an international airport, staff from dozens of countries work side by side. Each can speak their own language with colleagues from home, but to talk to everybody they use one shared language. CDP is Cisco's home language: rich, but only Cisco devices (and a few others) speak it. <b>LLDP</b> is the shared language. A Cisco switch, a Juniper router, an Aruba access point, a Linux server and a Polycom phone can all understand each other with LLDP.</p>

<h3>What LLDP is</h3>
<p><b>LLDP (Link Layer Discovery Protocol)</b> is defined by <b>IEEE 802.1AB</b>. It does the same job as CDP: each device periodically advertises information about itself out of each interface, and the directly connected neighbour stores it. Like CDP it is one-way: a device announces, the other listens. There is no request, reply or handshake, and it never forms an adjacency like a routing protocol.</p>
<ul>
<li><b>EtherType 0x88CC.</b> LLDP frames use a normal Ethernet II header with their own EtherType, not SNAP like CDP.</li>
<li><b>Destination MAC 0180.c200.000e</b> (the "nearest bridge" address). This address is in the IEEE reserved range that standard bridges must never forward, so frames stay on one link.</li>
<li><b>Off by default on Cisco IOS.</b> You must enable it with <code>lldp run</code>. On many other vendors' switches it is on by default.</li>
</ul>

<h3>Timers: 30, 120 and 2</h3>
<table class="cmp"><tr><th>Timer</th><th>Default (IOS)</th><th>Meaning</th><th>Command</th></tr>
<tr><td>Advertisement interval</td><td>30 s</td><td>How often LLDPDUs are sent</td><td><code>lldp timer</code></td></tr>
<tr><td>Holdtime (TTL)</td><td>120 s</td><td>How long the receiver keeps the information</td><td><code>lldp holdtime</code></td></tr>
<tr><td>Reinitialisation delay</td><td>2 s</td><td>Wait before LLDP starts again on a port after it is disabled or goes down</td><td><code>lldp reinit</code></td></tr>
</table>
<p>The holdtime travels in the <b>TTL TLV</b> of every LLDPDU, just as the CDP holdtime does. When a port is administratively disabled or LLDP is turned off, a well-behaved device sends a final LLDPDU with <b>TTL 0</b>, a "shutdown" message that tells the neighbour to delete the entry immediately instead of waiting 120 seconds. The <b>reinit delay</b> stops a flapping port from bombarding the neighbour with start-up frames.</p>

<h3>The LLDPDU and its TLVs</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="LLDPDU structure">
<rect x="10" y="30" width="110" height="50" rx="6" fill="#fde68a"/><text x="65" y="52" text-anchor="middle" class="svg-ink" font-size="13">Chassis ID</text><text x="65" y="70" text-anchor="middle" class="svg-muted" font-size="12">type 1</text>
<rect x="125" y="30" width="100" height="50" rx="6" fill="#fde68a"/><text x="175" y="52" text-anchor="middle" class="svg-ink" font-size="13">Port ID</text><text x="175" y="70" text-anchor="middle" class="svg-muted" font-size="12">type 2</text>
<rect x="230" y="30" width="80" height="50" rx="6" fill="#fde68a"/><text x="270" y="52" text-anchor="middle" class="svg-ink" font-size="13">TTL</text><text x="270" y="70" text-anchor="middle" class="svg-muted" font-size="12">type 3</text>
<rect x="315" y="30" width="230" height="50" rx="6" fill="#bae6fd"/><text x="430" y="52" text-anchor="middle" class="svg-ink" font-size="13">optional TLVs</text><text x="430" y="70" text-anchor="middle" class="svg-muted" font-size="12">name, description, caps, mgmt</text>
<rect x="550" y="30" width="80" height="50" rx="6" fill="#fde68a"/><text x="590" y="52" text-anchor="middle" class="svg-ink" font-size="13">End</text><text x="590" y="70" text-anchor="middle" class="svg-muted" font-size="12">type 0</text>
<text x="320" y="115" text-anchor="middle" class="svg-accent" font-size="13">mandatory: Chassis ID, Port ID, TTL, End</text>
<rect x="315" y="135" width="230" height="44" rx="6" fill="#ddd6fe"/><text x="430" y="155" text-anchor="middle" class="svg-ink" font-size="13">type 127: organisation TLVs</text><text x="430" y="172" text-anchor="middle" class="svg-muted" font-size="12">802.1, 802.3, LLDP-MED</text>
</svg><p class="cap">Every LLDPDU starts with Chassis ID, Port ID and TTL and ends with End of LLDPDU. Everything in between is optional.</p></div>
<dl class="terms">
<dt>Chassis ID</dt><dd>Identifies the device, usually a MAC address. Mandatory.</dd>
<dt>Port ID</dt><dd>Identifies the sending port, for example Gi0/1. Mandatory.</dd>
<dt>Time To Live</dt><dd>The holdtime in seconds. Mandatory.</dd>
<dt>Port description, System name, System description</dt><dd>The interface description, the hostname and the software/platform string. Optional basic TLVs.</dd>
<dt>System capabilities</dt><dd>Two lists: what the device <b>can</b> do and what is <b>enabled</b>. A router that could bridge shows "B,R" as capable and "R" as enabled.</dd>
<dt>Management address</dt><dd>The IP address to manage the neighbour. Optional but almost always sent.</dd>
<dt>Organisation-specific (type 127)</dt><dd>IEEE 802.1 TLVs (port VLAN ID, VLAN names), IEEE 802.3 TLVs (speed and duplex autonegotiation, power via MDI, link aggregation, maximum frame size) and <b>LLDP-MED</b> TLVs for phones, covered in chapter 7.</dd>
</dl>

<h3>LLDP capability codes</h3>
<p>LLDP uses its own letters, which differ from CDP: <b>R</b> router, <b>B</b> bridge (a switch), <b>T</b> telephone, <b>W</b> WLAN access point, <b>C</b> DOCSIS cable device, <b>P</b> repeater, <b>S</b> station (an end host), <b>O</b> other. The most tested difference: a switch is <b>S</b> in CDP but <b>B</b> in LLDP, while <b>S</b> in LLDP means an end station.</p>

<h3>CDP and LLDP side by side</h3>
<table class="cmp"><tr><th></th><th>CDP</th><th>LLDP</th></tr>
<tr><td>Standard</td><td>Cisco proprietary</td><td>IEEE 802.1AB</td></tr>
<tr><td>Encapsulation</td><td>SNAP, MAC 0100.0ccc.cccc</td><td>EtherType 0x88CC, MAC 0180.c200.000e</td></tr>
<tr><td>Timers</td><td>60 s / 180 s</td><td>30 s / 120 s, reinit 2 s</td></tr>
<tr><td>IOS default</td><td>On</td><td>Off</td></tr>
<tr><td>Global command</td><td><code>cdp run</code></td><td><code>lldp run</code></td></tr>
<tr><td>Per interface</td><td><code>cdp enable</code> (both ways)</td><td><code>lldp transmit</code>, <code>lldp receive</code> (separate)</td></tr>
<tr><td>Switch capability</td><td>S</td><td>B</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> SW1 receives an LLDPDU from R1 at 10:00:00 carrying TTL 120. Advertisements then arrive at 10:00:30, 10:01:00 and 10:01:30, each resetting the countdown to 120. At 10:01:40 someone unplugs the cable at R1's end while SW1's port stays up through a media converter. The last frame was at 10:01:30, so SW1 removes R1 at about 10:03:30. If instead the technician had typed <code>shutdown</code> on R1's port, R1 would have sent a TTL 0 LLDPDU and the entry would have gone at once.</p></div>

<div class="warn"><p><b>Common mistake.</b> Assuming that LLDP works on a Cisco switch because a neighbour from another vendor sends it. Receiving requires LLDP to be enabled too. With LLDP off, the Cisco switch simply drops the frames and <code>show lldp neighbors</code> returns "% LLDP is not enabled".</p></div>

<div class="exam"><p><b>Exam trap.</b> Remember three numbers for LLDP: 30 (timer), 120 (holdtime), 2 (reinit). The mandatory TLVs are Chassis ID, Port ID, TTL and End of LLDPDU. System Name is <b>optional</b>, so when a neighbour does not send it, IOS shows the chassis ID (a MAC address) in the Device ID column instead of a hostname.</p></div>

<div class="scn"><h4>The server team's LLDP request</h4><p>A data center server team wanted to confirm which switch port each new server was cabled to. Their Linux hosts ran an LLDP agent, but the Cisco top-of-rack switches showed nothing. The switch team had never enabled LLDP because CDP had always been enough between Cisco devices. After <code>lldp run</code> on the switches, every server appeared in <code>show lldp neighbors</code>, and the servers' LLDP agents reported the switch name and port, which the server team used to verify cabling automatically.</p><p><b>Lesson:</b> the moment a non-Cisco device is involved, CDP is not enough; enable LLDP.</p></div>

<div class="iv"><p class="q">"What are the main differences between CDP and LLDP?"</p><p>Cover: proprietary vs IEEE 802.1AB; encapsulation (SNAP vs EtherType 0x88CC); timers 60/180 vs 30/120; default on vs off on IOS; per-interface control (one command vs separate transmit and receive); capability letters differ. Close with when you use each: CDP between Cisco devices, LLDP in any multi-vendor network, often both at once.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LLDP is IEEE 802.1AB, EtherType 0x88CC, destination MAC 0180.c200.000e, and never forwarded.</li>
<li>IOS defaults: timer 30 s, holdtime 120 s, reinit 2 s; LLDP is off until <code>lldp run</code>.</li>
<li>Mandatory TLVs: Chassis ID, Port ID, TTL, End of LLDPDU; the rest is optional.</li>
<li>A TTL 0 LLDPDU removes the entry immediately.</li>
<li>In LLDP a switch is B (bridge); S means an end station.</li>
</ul></div>
`,hi:`
<p>International airport par darjanon deshon ka staff saath kaam karta hai. Har koi apne desh ke colleagues se apni bhasha mein baat kar sakta hai, lekin sabse baat karne ke liye ek shared bhasha use hoti hai. CDP Cisco ki ghar ki bhasha hai: rich, lekin sirf Cisco devices (aur kuch doosre) ise bolte hain. <b>LLDP</b> shared bhasha hai. Cisco switch, Juniper router, Aruba access point, Linux server aur Polycom phone sab LLDP se ek doosre ko samajh sakte hain.</p>

<h3>LLDP kya hai</h3>
<p><b>LLDP (Link Layer Discovery Protocol)</b> <b>IEEE 802.1AB</b> mein define hai. Yeh CDP wala hi kaam karta hai: har device time-time par har interface se apne baare mein information advertise karta hai, aur directly connected neighbour use store karta hai. CDP ki tarah yeh one-way hai: ek device announce karta hai, doosra sunta hai. Koi request, reply ya handshake nahi, aur yeh routing protocol ki tarah kabhi adjacency nahi banata.</p>
<ul>
<li><b>EtherType 0x88CC.</b> LLDP frames apne EtherType ke saath normal Ethernet II header use karte hain, CDP ki tarah SNAP nahi.</li>
<li><b>Destination MAC 0180.c200.000e</b> ("nearest bridge" address). Yeh address IEEE reserved range mein hai jise standard bridges kabhi forward nahi karte, isliye frames ek link par hi rehte hain.</li>
<li><b>Cisco IOS par default off.</b> Ise <code>lldp run</code> se enable karna padta hai. Kai doosre vendors ke switches par yeh default on hota hai.</li>
</ul>

<h3>Timers: 30, 120 aur 2</h3>
<table class="cmp"><tr><th>Timer</th><th>Default (IOS)</th><th>Matlab</th><th>Command</th></tr>
<tr><td>Advertisement interval</td><td>30 s</td><td>LLDPDUs kitni baar bheje jaate hain</td><td><code>lldp timer</code></td></tr>
<tr><td>Holdtime (TTL)</td><td>120 s</td><td>Receiver information kitni der rakhta hai</td><td><code>lldp holdtime</code></td></tr>
<tr><td>Reinitialisation delay</td><td>2 s</td><td>Port disable ya down hone ke baad LLDP dobara shuru karne se pehle ka wait</td><td><code>lldp reinit</code></td></tr>
</table>
<p>Holdtime har LLDPDU ke <b>TTL TLV</b> mein jaata hai, bilkul CDP holdtime ki tarah. Jab port administratively disable hota hai ya LLDP band kiya jaata hai, tab achha device ek aakhri LLDPDU <b>TTL 0</b> ke saath bhejta hai, ek "shutdown" message jo neighbour ko 120 seconds wait karne ke bajaye entry turant delete karne ko kehta hai. <b>Reinit delay</b> flap karte port ko neighbour par start-up frames ki barsaat karne se rokta hai.</p>

<h3>LLDPDU aur uske TLVs</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="LLDPDU structure">
<rect x="10" y="30" width="110" height="50" rx="6" fill="#fde68a"/><text x="65" y="52" text-anchor="middle" class="svg-ink" font-size="13">Chassis ID</text><text x="65" y="70" text-anchor="middle" class="svg-muted" font-size="12">type 1</text>
<rect x="125" y="30" width="100" height="50" rx="6" fill="#fde68a"/><text x="175" y="52" text-anchor="middle" class="svg-ink" font-size="13">Port ID</text><text x="175" y="70" text-anchor="middle" class="svg-muted" font-size="12">type 2</text>
<rect x="230" y="30" width="80" height="50" rx="6" fill="#fde68a"/><text x="270" y="52" text-anchor="middle" class="svg-ink" font-size="13">TTL</text><text x="270" y="70" text-anchor="middle" class="svg-muted" font-size="12">type 3</text>
<rect x="315" y="30" width="230" height="50" rx="6" fill="#bae6fd"/><text x="430" y="52" text-anchor="middle" class="svg-ink" font-size="13">optional TLVs</text><text x="430" y="70" text-anchor="middle" class="svg-muted" font-size="12">name, description, caps, mgmt</text>
<rect x="550" y="30" width="80" height="50" rx="6" fill="#fde68a"/><text x="590" y="52" text-anchor="middle" class="svg-ink" font-size="13">End</text><text x="590" y="70" text-anchor="middle" class="svg-muted" font-size="12">type 0</text>
<text x="320" y="115" text-anchor="middle" class="svg-accent" font-size="13">mandatory: Chassis ID, Port ID, TTL, End</text>
<rect x="315" y="135" width="230" height="44" rx="6" fill="#ddd6fe"/><text x="430" y="155" text-anchor="middle" class="svg-ink" font-size="13">type 127: organisation TLVs</text><text x="430" y="172" text-anchor="middle" class="svg-muted" font-size="12">802.1, 802.3, LLDP-MED</text>
</svg><p class="cap">Har LLDPDU Chassis ID, Port ID aur TTL se shuru hota hai aur End of LLDPDU par khatam. Beech ka sab optional hai.</p></div>
<dl class="terms">
<dt>Chassis ID</dt><dd>Device ko identify karta hai, aam taur par MAC address. Mandatory.</dd>
<dt>Port ID</dt><dd>Bhejne wale port ko identify karta hai, jaise Gi0/1. Mandatory.</dd>
<dt>Time To Live</dt><dd>Seconds mein holdtime. Mandatory.</dd>
<dt>Port description, System name, System description</dt><dd>Interface description, hostname aur software/platform string. Optional basic TLVs.</dd>
<dt>System capabilities</dt><dd>Do lists: device kya <b>kar sakta</b> hai aur kya <b>enabled</b> hai. Jo router bridge kar sakta hai woh capable mein "B,R" aur enabled mein "R" dikhata hai.</dd>
<dt>Management address</dt><dd>Neighbour ko manage karne ka IP address. Optional lekin lagbhag hamesha bheja jaata hai.</dd>
<dt>Organisation-specific (type 127)</dt><dd>IEEE 802.1 TLVs (port VLAN ID, VLAN names), IEEE 802.3 TLVs (speed aur duplex autonegotiation, power via MDI, link aggregation, maximum frame size) aur phones ke liye <b>LLDP-MED</b> TLVs, jo chapter 7 mein cover honge.</dd>
</dl>

<h3>LLDP capability codes</h3>
<p>LLDP apne letters use karta hai, jo CDP se alag hain: <b>R</b> router, <b>B</b> bridge (switch), <b>T</b> telephone, <b>W</b> WLAN access point, <b>C</b> DOCSIS cable device, <b>P</b> repeater, <b>S</b> station (end host), <b>O</b> other. Sabse zyada test hone wala farak: CDP mein switch <b>S</b> hai lekin LLDP mein <b>B</b>, jabki LLDP mein <b>S</b> ka matlab end station hai.</p>

<h3>CDP aur LLDP saath-saath</h3>
<table class="cmp"><tr><th></th><th>CDP</th><th>LLDP</th></tr>
<tr><td>Standard</td><td>Cisco proprietary</td><td>IEEE 802.1AB</td></tr>
<tr><td>Encapsulation</td><td>SNAP, MAC 0100.0ccc.cccc</td><td>EtherType 0x88CC, MAC 0180.c200.000e</td></tr>
<tr><td>Timers</td><td>60 s / 180 s</td><td>30 s / 120 s, reinit 2 s</td></tr>
<tr><td>IOS default</td><td>On</td><td>Off</td></tr>
<tr><td>Global command</td><td><code>cdp run</code></td><td><code>lldp run</code></td></tr>
<tr><td>Per interface</td><td><code>cdp enable</code> (dono taraf)</td><td><code>lldp transmit</code>, <code>lldp receive</code> (alag)</td></tr>
<tr><td>Switch capability</td><td>S</td><td>B</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> SW1 ko 10:00:00 par R1 se TTL 120 wala LLDPDU milta hai. Phir advertisements 10:00:30, 10:01:00 aur 10:01:30 par aate hain, har ek countdown ko 120 par reset karta hai. 10:01:40 par koi R1 wale end par cable nikaal deta hai jabki media converter ki wajah se SW1 ka port up rehta hai. Aakhri frame 10:01:30 par tha, isliye SW1 R1 ko lagbhag 10:03:30 par hatata hai. Agar technician ne R1 ke port par <code>shutdown</code> type kiya hota, to R1 TTL 0 wala LLDPDU bhejta aur entry turant chali jaati.</p></div>

<div class="warn"><p><b>Common galti.</b> Yeh maan lena ki Cisco switch par LLDP kaam karega kyunki doosre vendor ka neighbour use bhej raha hai. Receive karne ke liye bhi LLDP enabled hona chahiye. LLDP off ho to Cisco switch frames ko bas drop kar deta hai aur <code>show lldp neighbors</code> "% LLDP is not enabled" deta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> LLDP ke teen numbers yaad rakho: 30 (timer), 120 (holdtime), 2 (reinit). Mandatory TLVs hain Chassis ID, Port ID, TTL aur End of LLDPDU. System Name <b>optional</b> hai, isliye jab neighbour use nahi bhejta, IOS Device ID column mein hostname ki jagah chassis ID (ek MAC address) dikhata hai.</p></div>

<div class="scn"><h4>Server team ki LLDP request</h4><p>Ek data center server team confirm karna chahti thi ki har naya server kaunse switch port se cabled hai. Unke Linux hosts par LLDP agent chal raha tha, lekin Cisco top-of-rack switches kuch nahi dikha rahe the. Switch team ne kabhi LLDP enable hi nahi kiya tha kyunki Cisco devices ke beech CDP hamesha kaafi tha. Switches par <code>lldp run</code> ke baad har server <code>show lldp neighbors</code> mein dikha, aur servers ke LLDP agents ne switch ka naam aur port report kiya, jise server team ne cabling automatically verify karne ke liye use kiya.</p><p><b>Seekh:</b> jaise hi koi non-Cisco device involved ho, CDP kaafi nahi; LLDP enable karo.</p></div>

<div class="iv"><p class="q">"CDP aur LLDP mein main differences kya hain?"</p><p>Cover karo: proprietary vs IEEE 802.1AB; encapsulation (SNAP vs EtherType 0x88CC); timers 60/180 vs 30/120; IOS par default on vs off; per-interface control (ek command vs alag transmit aur receive); capability letters alag. Ant mein batao har ek kab use karte ho: Cisco devices ke beech CDP, kisi bhi multi-vendor network mein LLDP, aksar dono ek saath.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LLDP IEEE 802.1AB hai, EtherType 0x88CC, destination MAC 0180.c200.000e, aur kabhi forward nahi hota.</li>
<li>IOS defaults: timer 30 s, holdtime 120 s, reinit 2 s; <code>lldp run</code> tak LLDP off rehta hai.</li>
<li>Mandatory TLVs: Chassis ID, Port ID, TTL, End of LLDPDU; baaki optional.</li>
<li>TTL 0 wala LLDPDU entry turant hata deta hai.</li>
<li>LLDP mein switch B (bridge) hai; S ka matlab end station.</li>
</ul></div>
`}};export{e as default};