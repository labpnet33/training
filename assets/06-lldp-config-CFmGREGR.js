var e={id:`lldp-config`,h:{en:`Configuring and verifying LLDP`,hi:`LLDP configure aur verify karna`},body:{en:`
<p>A walkie-talkie has two buttons: one to talk and a volume knob to listen. You can keep listening while never pressing talk, or talk without listening. LLDP gives each interface exactly these two controls, <b>transmit</b> and <b>receive</b>, while CDP only has a single on/off switch. That one design difference produces most of the LLDP exam questions.</p>

<h3>The commands</h3>
<table class="cmp"><tr><th>Where</th><th>Command</th><th>Effect</th></tr>
<tr><td>Global</td><td><code>lldp run</code> / <code>no lldp run</code></td><td>Turn LLDP on or off for the whole device (off by default on IOS)</td></tr>
<tr><td>Global</td><td><code>lldp timer 30</code></td><td>Advertisement interval in seconds</td></tr>
<tr><td>Global</td><td><code>lldp holdtime 120</code></td><td>TTL advertised to neighbours</td></tr>
<tr><td>Global</td><td><code>lldp reinit 2</code></td><td>Delay before re-initialising LLDP on a port</td></tr>
<tr><td>Interface</td><td><code>lldp transmit</code> / <code>no lldp transmit</code></td><td>Send, or stop sending, LLDPDUs on this port</td></tr>
<tr><td>Interface</td><td><code>lldp receive</code> / <code>no lldp receive</code></td><td>Process, or ignore, received LLDPDUs on this port</td></tr>
</table>
<p>Once <code>lldp run</code> is active, every supported interface both transmits and receives by default. You only type interface commands to take something away.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="LLDP lab topology with transmit and receive">
<rect x="60" y="30" width="120" height="46" rx="8" fill="#bae6fd"/><text x="120" y="52" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="120" y="68" text-anchor="middle" class="svg-muted" font-size="12">10.60.0.1</text>
<rect x="260" y="100" width="120" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="320" y="138" text-anchor="middle" class="svg-muted" font-size="12">10.60.0.11</text>
<rect x="460" y="30" width="120" height="46" rx="8" fill="#bbf7d0"/><text x="520" y="52" text-anchor="middle" class="svg-ink" font-size="14">SW2</text><text x="520" y="68" text-anchor="middle" class="svg-muted" font-size="12">10.60.0.12</text>
<rect x="260" y="180" width="120" height="40" rx="8" fill="#fed7aa"/><text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="14">KIOSK</text>
<line x1="180" y1="60" x2="260" y2="115" stroke="#64748b" stroke-width="2"/><line x1="380" y1="115" x2="460" y2="60" stroke="#64748b" stroke-width="2"/><line x1="320" y1="146" x2="320" y2="180" stroke="#64748b" stroke-width="2"/>
<text x="195" y="105" class="svg-accent" font-size="12">Gi0/2</text><text x="410" y="105" class="svg-accent" font-size="12">Gi0/1</text>
<text x="330" y="168" class="svg-accent" font-size="12">Gi0/5: no tx, no rx</text>
</svg><p class="cap">LLDP lab at Tapti Fintech: R1 on SW1 Gi0/2, SW2 on SW1 Gi0/1, the public kiosk on SW1 Gi0/5.</p></div>

<h3>Lab walkthrough: LLDP</h3>
<p>Company policy at Tapti Fintech now allows only the open standard. The steps below follow the lab tasks in order.</p>
<pre class="code"><span class="c">! Task 1: enable LLDP on R1, SW1 and SW2 (repeat on each)</span>
SW1(config)# lldp run
<span class="c">! Task 2: list neighbours on SW1</span>
SW1# show lldp neighbors
<span class="c">! Task 3: silence the public kiosk port in both directions</span>
SW1(config)# interface g0/5
SW1(config-if)# no lldp transmit
SW1(config-if)# no lldp receive
<span class="c">! Task 4: learn R1's management address, use it on SW2</span>
SW1# show lldp neighbors detail
SW2(config)# ip default-gateway 10.60.0.1
<span class="c">! Task 5: policy says CDP off on both switches</span>
SW1(config)# no cdp run
SW2(config)# no cdp run</pre>

<h3>Verification</h3>
<pre class="out">SW1# show lldp

Global LLDP Information:
    <span class="hl">Status: ACTIVE</span>
    LLDP advertisements are sent every 30 seconds
    LLDP hold time advertised is 120 seconds
    LLDP interface reinitialisation delay is 2 seconds

SW1# show lldp neighbors
Capability codes:
    (R) Router, (B) Bridge, (T) Telephone, (C) DOCSIS Cable Device
    (W) WLAN Access Point, (P) Repeater, (S) Station, (O) Other

Device ID           Local Intf     Hold-time  Capability      Port ID
<span class="hl">R1                  Gi0/2          120        R               Gi0/0</span>
SW2                 Gi0/1          120        B               Gi0/1

Total entries displayed: 2</pre>
<p>Notice two differences from CDP. The column is <b>Local Intf</b> and it still means your port. The <b>Hold-time</b> column on IOS shows the TTL the neighbour advertised (120), not a countdown; the remaining time appears in the detail view.</p>
<pre class="out">SW1# show lldp neighbors detail
------------------------------------------------
Local Intf: Gi0/2
Chassis id: 5254.0011.2201
Port id: Gi0/0
Port Description: GigabitEthernet0/0
System Name: R1

System Description:
Cisco IOS Software, C2900 Software (C2900-UNIVERSALK9-M), Version 15.7(3)M8, RELEASE SOFTWARE (fc1)

Time remaining: 97 seconds
System Capabilities: B,R
Enabled Capabilities: R
<span class="hl">Management Addresses:
    IP: 10.60.0.1</span>
Auto Negotiation - not supported
Physical media capabilities - not advertised
Media Attachment Unit type - not advertised
Vlan ID: - not advertised

SW1# show lldp interface gigabitEthernet 0/5

GigabitEthernet0/5:
    <span class="hl">Tx: disabled</span>
    <span class="hl">Rx: disabled</span>
    Tx state: IDLE
    Rx state: WAIT PORT OPER</pre>
<p>Other useful commands: <code>show lldp entry R1</code> shows the detail for one neighbour, <code>show lldp traffic</code> shows frames in and out, errors and aged entries, and <code>clear lldp table</code> empties the neighbour table so you can watch it refill.</p>

<h3>Running CDP and LLDP together</h3>
<p>The two protocols are completely independent. A Cisco switch can run both at once and will keep two separate neighbour tables. Many networks do exactly that: CDP for Cisco-specific details and LLDP for everything else. In the lab, after <code>no cdp run</code>, <code>show cdp neighbors</code> returns "% CDP is not enabled" while <code>show lldp neighbors</code> still lists R1 and SW2, which proves the policy change did not blind the switch.</p>

<div class="eg"><p><b>Worked example.</b> A switch port connects to a monitoring probe that must learn the switch name, but company policy says the probe must not advertise anything the switch would trust. Configure <code>no lldp receive</code> on the port and keep transmit on: the probe learns "SW1, Gi0/7", and anything the probe sends is ignored. The opposite case, <code>no lldp transmit</code> with receive on, lets you learn about a neighbour without revealing your own details.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Configuring <code>lldp transmit</code> on interfaces and forgetting <code>lldp run</code>: nothing happens until LLDP is on globally. (2) Using <code>no lldp run</code> to silence one port: that disables LLDP on the whole device. (3) Expecting a <code>lldp enable</code> interface command: it does not exist on IOS.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Stop sending LLDP on Gi0/5 but still learn about the device plugged into it" is <code>no lldp transmit</code>, not <code>no lldp receive</code>, not <code>no lldp run</code> and not <code>no cdp enable</code>. Read carefully which direction the question keeps.</p></div>

<div class="scn"><h4>The kiosk that saw too much</h4><p>A security audit at a bank branch found that a public information kiosk could read the switch's hostname, IOS version and management IP from LLDP frames arriving every 30 seconds. LLDP had been enabled globally months earlier for new IP phones. The fix was <code>no lldp transmit</code> and <code>no lldp receive</code> on the kiosk and guest ports, verified with <code>show lldp interface</code>. Phones on other ports kept working because LLDP stayed on globally.</p><p><b>Lesson:</b> when you turn discovery on globally, immediately decide which ports must stay silent.</p></div>

<div class="iv"><p class="q">"How do you enable LLDP on a Cisco switch, and how do you stop it on just one port?"</p><p>Answer: <code>lldp run</code> in global configuration, because LLDP is off by default. Then on the port, <code>no lldp transmit</code> and <code>no lldp receive</code>, and explain that they are independent so you can do one without the other. Verify with <code>show lldp interface</code> and <code>show lldp neighbors</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>lldp run</code> enables LLDP globally; interfaces then transmit and receive by default.</li>
<li><code>no lldp transmit</code> and <code>no lldp receive</code> are separate per-interface controls.</li>
<li>Verify with <code>show lldp</code>, <code>show lldp neighbors [detail]</code>, <code>show lldp entry</code>, <code>show lldp interface</code>, <code>show lldp traffic</code>.</li>
<li>Management Addresses in the detail view give you the neighbour's IP.</li>
<li>CDP and LLDP are independent and can run together.</li>
</ul></div>
`,hi:`
<p>Walkie-talkie mein do controls hote hain: bolne ka button aur sunne ka volume knob. Aap sunte reh sakte ho bina kabhi bolne ka button dabaye, ya bina sune bol sakte ho. LLDP har interface ko exactly yahi do controls deta hai, <b>transmit</b> aur <b>receive</b>, jabki CDP mein sirf ek on/off switch hai. Isi ek design farak se LLDP ke zyada tar exam questions bante hain.</p>

<h3>Commands</h3>
<table class="cmp"><tr><th>Kahan</th><th>Command</th><th>Asar</th></tr>
<tr><td>Global</td><td><code>lldp run</code> / <code>no lldp run</code></td><td>Poore device ke liye LLDP on ya off (IOS par default off)</td></tr>
<tr><td>Global</td><td><code>lldp timer 30</code></td><td>Seconds mein advertisement interval</td></tr>
<tr><td>Global</td><td><code>lldp holdtime 120</code></td><td>Neighbours ko advertise hone wala TTL</td></tr>
<tr><td>Global</td><td><code>lldp reinit 2</code></td><td>Port par LLDP dobara initialise karne se pehle ka delay</td></tr>
<tr><td>Interface</td><td><code>lldp transmit</code> / <code>no lldp transmit</code></td><td>Is port par LLDPDUs bhejna, ya bhejna band</td></tr>
<tr><td>Interface</td><td><code>lldp receive</code> / <code>no lldp receive</code></td><td>Is port par aaye LLDPDUs process karna, ya ignore karna</td></tr>
</table>
<p>Ek baar <code>lldp run</code> active ho jaaye, to har supported interface default se transmit aur receive dono karta hai. Interface commands aap sirf kuch hatane ke liye type karte ho.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Transmit aur receive ke saath LLDP lab topology">
<rect x="60" y="30" width="120" height="46" rx="8" fill="#bae6fd"/><text x="120" y="52" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="120" y="68" text-anchor="middle" class="svg-muted" font-size="12">10.60.0.1</text>
<rect x="260" y="100" width="120" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="320" y="138" text-anchor="middle" class="svg-muted" font-size="12">10.60.0.11</text>
<rect x="460" y="30" width="120" height="46" rx="8" fill="#bbf7d0"/><text x="520" y="52" text-anchor="middle" class="svg-ink" font-size="14">SW2</text><text x="520" y="68" text-anchor="middle" class="svg-muted" font-size="12">10.60.0.12</text>
<rect x="260" y="180" width="120" height="40" rx="8" fill="#fed7aa"/><text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="14">KIOSK</text>
<line x1="180" y1="60" x2="260" y2="115" stroke="#64748b" stroke-width="2"/><line x1="380" y1="115" x2="460" y2="60" stroke="#64748b" stroke-width="2"/><line x1="320" y1="146" x2="320" y2="180" stroke="#64748b" stroke-width="2"/>
<text x="195" y="105" class="svg-accent" font-size="12">Gi0/2</text><text x="410" y="105" class="svg-accent" font-size="12">Gi0/1</text>
<text x="330" y="168" class="svg-accent" font-size="12">Gi0/5: na tx, na rx</text>
</svg><p class="cap">Tapti Fintech ka LLDP lab: R1 SW1 Gi0/2 par, SW2 SW1 Gi0/1 par, public kiosk SW1 Gi0/5 par.</p></div>

<h3>Lab walkthrough: LLDP</h3>
<p>Tapti Fintech ki company policy ab sirf open standard allow karti hai. Neeche ke steps lab tasks ko order mein follow karte hain.</p>
<pre class="code"><span class="c">! Task 1: R1, SW1 aur SW2 par LLDP enable (har ek par repeat)</span>
SW1(config)# lldp run
<span class="c">! Task 2: SW1 par neighbours list karo</span>
SW1# show lldp neighbors
<span class="c">! Task 3: public kiosk port ko dono directions mein chup karao</span>
SW1(config)# interface g0/5
SW1(config-if)# no lldp transmit
SW1(config-if)# no lldp receive
<span class="c">! Task 4: R1 ka management address seekho, SW2 par use karo</span>
SW1# show lldp neighbors detail
SW2(config)# ip default-gateway 10.60.0.1
<span class="c">! Task 5: policy kehti hai dono switches par CDP off</span>
SW1(config)# no cdp run
SW2(config)# no cdp run</pre>

<h3>Verification</h3>
<pre class="out">SW1# show lldp

Global LLDP Information:
    <span class="hl">Status: ACTIVE</span>
    LLDP advertisements are sent every 30 seconds
    LLDP hold time advertised is 120 seconds
    LLDP interface reinitialisation delay is 2 seconds

SW1# show lldp neighbors
Capability codes:
    (R) Router, (B) Bridge, (T) Telephone, (C) DOCSIS Cable Device
    (W) WLAN Access Point, (P) Repeater, (S) Station, (O) Other

Device ID           Local Intf     Hold-time  Capability      Port ID
<span class="hl">R1                  Gi0/2          120        R               Gi0/0</span>
SW2                 Gi0/1          120        B               Gi0/1

Total entries displayed: 2</pre>
<p>CDP se do farak dekho. Column ka naam <b>Local Intf</b> hai aur iska matlab ab bhi aapka port hai. IOS par <b>Hold-time</b> column neighbour ka advertise kiya TTL (120) dikhata hai, countdown nahi; bacha hua time detail view mein aata hai.</p>
<pre class="out">SW1# show lldp neighbors detail
------------------------------------------------
Local Intf: Gi0/2
Chassis id: 5254.0011.2201
Port id: Gi0/0
Port Description: GigabitEthernet0/0
System Name: R1

System Description:
Cisco IOS Software, C2900 Software (C2900-UNIVERSALK9-M), Version 15.7(3)M8, RELEASE SOFTWARE (fc1)

Time remaining: 97 seconds
System Capabilities: B,R
Enabled Capabilities: R
<span class="hl">Management Addresses:
    IP: 10.60.0.1</span>
Auto Negotiation - not supported
Physical media capabilities - not advertised
Media Attachment Unit type - not advertised
Vlan ID: - not advertised

SW1# show lldp interface gigabitEthernet 0/5

GigabitEthernet0/5:
    <span class="hl">Tx: disabled</span>
    <span class="hl">Rx: disabled</span>
    Tx state: IDLE
    Rx state: WAIT PORT OPER</pre>
<p>Aur useful commands: <code>show lldp entry R1</code> ek neighbour ki detail dikhata hai, <code>show lldp traffic</code> andar aur bahar ke frames, errors aur aged entries dikhata hai, aur <code>clear lldp table</code> neighbour table khaali karta hai taaki aap use dobara bharte dekh sako.</p>

<h3>CDP aur LLDP saath chalana</h3>
<p>Dono protocols poori tarah independent hain. Cisco switch dono ek saath chala sakta hai aur do alag neighbour tables rakhega. Kai networks exactly yahi karte hain: Cisco-specific details ke liye CDP aur baaki sab ke liye LLDP. Lab mein <code>no cdp run</code> ke baad <code>show cdp neighbors</code> "% CDP is not enabled" deta hai jabki <code>show lldp neighbors</code> ab bhi R1 aur SW2 list karta hai, jo prove karta hai ki policy change ne switch ko andha nahi kiya.</p>

<div class="eg"><p><b>Worked example.</b> Ek switch port ek monitoring probe se juda hai jise switch ka naam seekhna hai, lekin company policy kehti hai ki probe jo bhi advertise kare switch us par bharosa na kare. Port par <code>no lldp receive</code> configure karo aur transmit on rakho: probe "SW1, Gi0/7" seekh leta hai, aur probe jo bhi bhejta hai woh ignore hota hai. Ulta case, receive on ke saath <code>no lldp transmit</code>, aapko apni details bataye bina neighbour ke baare mein seekhne deta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Interfaces par <code>lldp transmit</code> configure karna aur <code>lldp run</code> bhool jaana: jab tak LLDP globally on nahi, kuch nahi hota. (2) Ek port chup karane ke liye <code>no lldp run</code> use karna: yeh poore device par LLDP band kar deta hai. (3) <code>lldp enable</code> interface command expect karna: IOS par yeh exist nahi karta.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Gi0/5 par LLDP bhejna band karo lekin us par lage device ke baare mein seekhte raho" ka jawab <code>no lldp transmit</code> hai, na <code>no lldp receive</code>, na <code>no lldp run</code> aur na <code>no cdp enable</code>. Dhyan se padho ki question kaunsi direction rakhna chahta hai.</p></div>

<div class="scn"><h4>Kiosk jisne bahut kuch dekh liya</h4><p>Ek bank branch ke security audit mein paaya gaya ki ek public information kiosk har 30 seconds mein aane wale LLDP frames se switch ka hostname, IOS version aur management IP padh sakta tha. Naye IP phones ke liye mahino pehle LLDP globally enable kiya gaya tha. Fix tha kiosk aur guest ports par <code>no lldp transmit</code> aur <code>no lldp receive</code>, <code>show lldp interface</code> se verify kiya gaya. Doosre ports ke phones kaam karte rahe kyunki LLDP globally on raha.</p><p><b>Seekh:</b> jab aap discovery globally on karte ho, turant decide karo ki kaunse ports chup rehne chahiye.</p></div>

<div class="iv"><p class="q">"Cisco switch par LLDP kaise enable karte ho, aur sirf ek port par kaise rokte ho?"</p><p>Jawab: global configuration mein <code>lldp run</code>, kyunki LLDP default off hai. Phir port par <code>no lldp transmit</code> aur <code>no lldp receive</code>, aur samjhao ki yeh independent hain isliye ek bina doosre ke kar sakte ho. <code>show lldp interface</code> aur <code>show lldp neighbors</code> se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>lldp run</code> LLDP globally enable karta hai; phir interfaces default se transmit aur receive karte hain.</li>
<li><code>no lldp transmit</code> aur <code>no lldp receive</code> alag per-interface controls hain.</li>
<li><code>show lldp</code>, <code>show lldp neighbors [detail]</code>, <code>show lldp entry</code>, <code>show lldp interface</code>, <code>show lldp traffic</code> se verify karo.</li>
<li>Detail view ke Management Addresses se neighbour ka IP milta hai.</li>
<li>CDP aur LLDP independent hain aur saath chal sakte hain.</li>
</ul></div>
`}};export{e as default};