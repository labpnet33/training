var e={id:`cdp-operation`,h:{en:`How CDP works: frames, timers and TLVs`,hi:`CDP kaise kaam karta hai: frames, timers aur TLVs`},body:{en:`
<p>Think of CDP as a shopkeeper who pins a fresh notice on the shop door every minute: "Open, owner Ravi, phone 98xxx." A neighbour who reads the notice remembers it for three minutes. If three minutes pass without a fresh notice, the neighbour assumes the shop has closed and forgets it. That is CDP in one paragraph: a periodic advertisement plus a <b>holdtime</b> that tells the listener how long to trust it.</p>

<h3>The CDP frame</h3>
<p>CDP (Cisco Discovery Protocol) runs directly on top of the data link layer. Each advertisement is an Ethernet frame with these properties:</p>
<ul>
<li><b>Destination MAC 0100.0ccc.cccc</b>, a Cisco reserved <b>multicast</b> address. It is not a broadcast. A Cisco switch that receives it hands it to its own CPU and <b>does not forward it</b>.</li>
<li><b>SNAP encapsulation</b> (an 802.2 LLC header with SNAP, Cisco OUI 00000C, protocol ID 0x2000). You do not need to memorise the header bytes, but you should know CDP needs no IP.</li>
<li>Sent out of <b>every interface that is up</b> and has CDP enabled: access ports, trunks, routed ports and even ports that spanning tree is blocking, because discovery frames are link-local and not subject to STP forwarding rules.</li>
</ul>
<p>Because the frame uses no IP header, CDP works on a brand-new switch with no configuration at all, and between two devices whose IP addresses are in different subnets. That is exactly when you need it most.</p>

<h3>Timers: 60 seconds and 180 seconds</h3>
<dl class="terms">
<dt>Advertisement timer</dt><dd>How often a device sends CDP out of each interface. Default <b>60 seconds</b>. Changed globally with <code>cdp timer</code>.</dd>
<dt>Holdtime</dt><dd>How long a <b>receiver</b> keeps the entry if no new advertisement arrives. Default <b>180 seconds</b>, three times the timer. Changed globally with <code>cdp holdtime</code>. The value travels inside every advertisement, so the receiver always uses the holdtime the <b>sender</b> advertised.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="CDP holdtime timeline">
<line x1="40" y1="100" x2="610" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="40" y="125" class="svg-muted" font-size="12">0 s</text><text x="150" y="125" class="svg-muted" font-size="12">60 s</text><text x="260" y="125" class="svg-muted" font-size="12">120 s</text><text x="370" y="125" class="svg-muted" font-size="12">180 s</text><text x="480" y="125" class="svg-muted" font-size="12">240 s</text><text x="580" y="125" class="svg-muted" font-size="12">300 s</text>
<circle cx="45" cy="100" r="7" fill="#bbf7d0"/><circle cx="155" cy="100" r="7" fill="#bbf7d0"/><circle cx="265" cy="100" r="7" fill="#fed7aa"/>
<text x="45" y="80" text-anchor="middle" class="svg-ink" font-size="12">hello</text><text x="155" y="80" text-anchor="middle" class="svg-ink" font-size="12">hello</text><text x="265" y="80" text-anchor="middle" class="svg-accent" font-size="12">link cut</text>
<rect x="155" y="140" width="330" height="26" rx="6" fill="#fde68a"/><text x="320" y="158" text-anchor="middle" class="svg-ink" font-size="12">holdtime counts down 180 to 0 from last hello</text>
<text x="485" y="80" text-anchor="middle" class="svg-accent" font-size="12">entry removed</text>
</svg><p class="cap">Each hello resets the holdtime to 180. After the last hello at 60 s, the entry disappears at about 240 s if nothing new arrives (sooner if the local interface goes down).</p></div>

<p>In <code>show cdp neighbors</code> the <b>Holdtme</b> column shows the countdown. With default timers a healthy neighbour always shows a value between about 120 and 180, because a new advertisement arrives every 60 seconds and resets it. A value that keeps falling below 120 means advertisements are being lost.</p>

<h3>What CDP advertises: the TLVs</h3>
<p>The body of every CDP frame is a list of <b>TLVs</b> (Type-Length-Value fields). Each TLV carries one fact. Receivers skip any type they do not understand, which is how the protocol grew over the years without breaking older devices.</p>
<table class="cmp"><tr><th>TLV</th><th>Example value</th><th>Why you care</th></tr>
<tr><td>Device ID</td><td>SW2</td><td>The hostname of the neighbour</td></tr>
<tr><td>Address</td><td>IP 10.50.0.12</td><td>Where to SSH next</td></tr>
<tr><td>Port ID</td><td>GigabitEthernet0/1</td><td>The neighbour's end of the cable</td></tr>
<tr><td>Capabilities</td><td>Switch, IGMP</td><td>Router, switch, phone, host</td></tr>
<tr><td>Software version</td><td>IOS 15.2(7)E</td><td>Upgrade planning, bug checks</td></tr>
<tr><td>Platform</td><td>WS-C3560CX-12PC-S</td><td>Exact hardware model</td></tr>
<tr><td>VTP management domain</td><td>NK-CAMPUS</td><td>VTP consistency</td></tr>
<tr><td>Native VLAN</td><td>1</td><td>Native VLAN mismatch warning</td></tr>
<tr><td>Duplex</td><td>full</td><td>Duplex mismatch warning</td></tr>
<tr><td>Management address</td><td>IP 10.50.0.12</td><td>The address to manage the box</td></tr>
</table>
<p>For IP phones, CDP also carries a power request and the voice VLAN (called the appliance VLAN). You will meet those in the voice and PoE chapter.</p>

<h3>CDP version 1 and version 2</h3>
<p>CDPv1 carried the basics: device ID, addresses, port ID, capabilities, version and platform. <b>CDPv2</b> added the VTP management domain, native VLAN and full/half duplex TLVs, which is what makes the mismatch warnings possible. Every current IOS device sends <b>version 2 by default</b> and still understands version 1. The command <code>no cdp advertise-v2</code> falls back to v1, which you would only do for a very old neighbour.</p>
<pre class="code">SW1# show cdp
Global CDP information:
        Sending CDP packets every 60 seconds
        Sending a holdtime value of 180 seconds
        Sending CDPv2 advertisements is  enabled</pre>
<pre class="code"><span class="c">! change the timers (normally left at defaults)</span>
SW1(config)# cdp timer 30
SW1(config)# cdp holdtime 90</pre>

<div class="eg"><p><b>Worked example.</b> SW2 runs default timers, SW1 is changed to <code>cdp timer 30</code> and <code>cdp holdtime 90</code>. SW1 now sends every 30 seconds with holdtime 90, so on SW2 the SW1 entry counts down from 90 and is refreshed every 30 seconds. SW2 still sends holdtime 180 every 60 seconds, so on SW1 the SW2 entry counts from 180. Timers do not have to match: unlike routing protocol hellos, a timer difference never breaks CDP.</p></div>

<div class="warn"><p><b>Common mistake.</b> Believing that the receiver's own <code>cdp holdtime</code> decides when a neighbour is removed. It is the holdtime <b>inside the neighbour's advertisement</b> that counts. Another mistake: setting a holdtime lower than the timer, which makes neighbours flap in and out of the table between advertisements.</p></div>

<div class="exam"><p><b>Exam trap.</b> Swapped numbers. CDP is 60/180; LLDP is 30/120. Also, CDP frames go to a <b>multicast</b> MAC (0100.0ccc.cccc), not the broadcast MAC ffff.ffff.ffff.</p></div>

<div class="scn"><h4>Six neighbours on one port</h4><p>An engineer saw three different Cisco phones and two access points listed against the same local port Gi0/20 on a floor switch. The switch was fine. Someone had inserted a small unmanaged desk switch. Because an unmanaged switch does not understand CDP, it treats 0100.0ccc.cccc as ordinary multicast and floods it out of all its ports, so the Cisco switch heard every device behind it. The engineer removed the desk switch and patched the devices to proper ports.</p><p><b>Lesson:</b> several CDP neighbours on one port almost always means a hub or unmanaged switch sits in between.</p></div>

<div class="iv"><p class="q">"How does a Cisco device decide when to remove a CDP neighbour?"</p><p>Explain that each advertisement carries a holdtime (180 seconds by default) chosen by the sender. The receiver starts counting down from that value, resets it whenever a new advertisement arrives every 60 seconds, and deletes the entry when it reaches zero. Also mention that the entry is removed immediately if the local interface goes down.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CDP uses SNAP frames to multicast MAC 0100.0ccc.cccc; Cisco devices consume them and never forward them.</li>
<li>Defaults: advertisement every 60 s, holdtime 180 s; the sender's holdtime governs the receiver.</li>
<li>TLVs carry device ID, addresses, port ID, capabilities, version, platform, VTP domain, native VLAN, duplex and management address.</li>
<li>CDPv2 is the default and adds VTP domain, native VLAN and duplex.</li>
<li>Timer mismatches never break CDP.</li>
</ul></div>
`,hi:`
<p>CDP ko ek dukaandaar ki tarah socho jo har minute dukaan ke darwaaze par naya notice lagata hai: "Khula hai, maalik Ravi, phone 98xxx." Jo padosi notice padhta hai, woh use teen minute yaad rakhta hai. Agar teen minute tak naya notice nahi aaya, to padosi maan leta hai ki dukaan band ho gayi aur use bhool jaata hai. Ek paragraph mein yahi CDP hai: ek periodic advertisement aur ek <b>holdtime</b> jo sunne wale ko batata hai ki use kitni der tak bharosa karna hai.</p>

<h3>CDP frame</h3>
<p>CDP (Cisco Discovery Protocol) seedha data link layer ke upar chalta hai. Har advertisement ek Ethernet frame hai jiski properties yeh hain:</p>
<ul>
<li><b>Destination MAC 0100.0ccc.cccc</b>, ek Cisco reserved <b>multicast</b> address. Yeh broadcast nahi hai. Cisco switch ise receive karke apne CPU ko deta hai aur <b>forward nahi karta</b>.</li>
<li><b>SNAP encapsulation</b> (SNAP ke saath 802.2 LLC header, Cisco OUI 00000C, protocol ID 0x2000). Header bytes yaad karne ki zaroorat nahi, lekin yeh pata hona chahiye ki CDP ko IP nahi chahiye.</li>
<li><b>Har up interface</b> se bheja jaata hai jahan CDP enabled hai: access ports, trunks, routed ports aur woh ports bhi jinhe spanning tree block kar raha hai, kyunki discovery frames link-local hote hain aur STP forwarding rules un par lagu nahi hote.</li>
</ul>
<p>Kyunki frame mein IP header nahi hota, CDP bina kisi configuration wale bilkul naye switch par bhi kaam karta hai, aur aise do devices ke beech bhi jinke IP addresses alag subnets mein hain. Yahi woh waqt hai jab iski sabse zyada zaroorat hoti hai.</p>

<h3>Timers: 60 seconds aur 180 seconds</h3>
<dl class="terms">
<dt>Advertisement timer</dt><dd>Device har interface se kitni baar CDP bhejta hai. Default <b>60 seconds</b>. Globally <code>cdp timer</code> se badla jaata hai.</dd>
<dt>Holdtime</dt><dd>Naya advertisement na aaye to <b>receiver</b> entry ko kitni der rakhta hai. Default <b>180 seconds</b>, timer ka teen guna. Globally <code>cdp holdtime</code> se badla jaata hai. Yeh value har advertisement ke andar jaati hai, isliye receiver hamesha woh holdtime use karta hai jo <b>sender</b> ne advertise kiya.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="CDP holdtime timeline">
<line x1="40" y1="100" x2="610" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="40" y="125" class="svg-muted" font-size="12">0 s</text><text x="150" y="125" class="svg-muted" font-size="12">60 s</text><text x="260" y="125" class="svg-muted" font-size="12">120 s</text><text x="370" y="125" class="svg-muted" font-size="12">180 s</text><text x="480" y="125" class="svg-muted" font-size="12">240 s</text><text x="580" y="125" class="svg-muted" font-size="12">300 s</text>
<circle cx="45" cy="100" r="7" fill="#bbf7d0"/><circle cx="155" cy="100" r="7" fill="#bbf7d0"/><circle cx="265" cy="100" r="7" fill="#fed7aa"/>
<text x="45" y="80" text-anchor="middle" class="svg-ink" font-size="12">hello</text><text x="155" y="80" text-anchor="middle" class="svg-ink" font-size="12">hello</text><text x="265" y="80" text-anchor="middle" class="svg-accent" font-size="12">link kata</text>
<rect x="155" y="140" width="330" height="26" rx="6" fill="#fde68a"/><text x="320" y="158" text-anchor="middle" class="svg-ink" font-size="12">aakhri hello se holdtime 180 se 0 tak girta hai</text>
<text x="485" y="80" text-anchor="middle" class="svg-accent" font-size="12">entry hati</text>
</svg><p class="cap">Har hello holdtime ko 180 par reset karta hai. 60 s wale aakhri hello ke baad, kuch naya na aaye to entry lagbhag 240 s par gayab hoti hai (local interface down ho to jaldi).</p></div>

<p><code>show cdp neighbors</code> mein <b>Holdtme</b> column yahi countdown dikhata hai. Default timers ke saath healthy neighbour hamesha lagbhag 120 aur 180 ke beech value dikhata hai, kyunki har 60 seconds mein naya advertisement aa kar use reset karta hai. Agar value baar-baar 120 se neeche jaaye to matlab advertisements kho rahe hain.</p>

<h3>CDP kya advertise karta hai: TLVs</h3>
<p>Har CDP frame ki body <b>TLVs</b> (Type-Length-Value fields) ki list hoti hai. Har TLV ek fact carry karta hai. Receivers jo type nahi samajhte use skip kar dete hain, isi tarah protocol saalon mein bina purane devices tode bada hua.</p>
<table class="cmp"><tr><th>TLV</th><th>Example value</th><th>Aapko kyun farak padta hai</th></tr>
<tr><td>Device ID</td><td>SW2</td><td>Neighbour ka hostname</td></tr>
<tr><td>Address</td><td>IP 10.50.0.12</td><td>Agla SSH kahan karna hai</td></tr>
<tr><td>Port ID</td><td>GigabitEthernet0/1</td><td>Cable ka neighbour wala end</td></tr>
<tr><td>Capabilities</td><td>Switch, IGMP</td><td>Router, switch, phone, host</td></tr>
<tr><td>Software version</td><td>IOS 15.2(7)E</td><td>Upgrade planning, bug checks</td></tr>
<tr><td>Platform</td><td>WS-C3560CX-12PC-S</td><td>Exact hardware model</td></tr>
<tr><td>VTP management domain</td><td>NK-CAMPUS</td><td>VTP consistency</td></tr>
<tr><td>Native VLAN</td><td>1</td><td>Native VLAN mismatch warning</td></tr>
<tr><td>Duplex</td><td>full</td><td>Duplex mismatch warning</td></tr>
<tr><td>Management address</td><td>IP 10.50.0.12</td><td>Box manage karne ka address</td></tr>
</table>
<p>IP phones ke liye CDP ek power request aur voice VLAN (jise appliance VLAN kehte hain) bhi carry karta hai. Woh aap voice aur PoE wale chapter mein dekhoge.</p>

<h3>CDP version 1 aur version 2</h3>
<p>CDPv1 basics carry karta tha: device ID, addresses, port ID, capabilities, version aur platform. <b>CDPv2</b> ne VTP management domain, native VLAN aur full/half duplex TLVs jode, aur isi se mismatch warnings possible hoti hain. Har current IOS device <b>default version 2</b> bhejta hai aur version 1 bhi samajhta hai. Command <code>no cdp advertise-v2</code> v1 par wapas le jaata hai, jo aap sirf bahut purane neighbour ke liye karoge.</p>
<pre class="code">SW1# show cdp
Global CDP information:
        Sending CDP packets every 60 seconds
        Sending a holdtime value of 180 seconds
        Sending CDPv2 advertisements is  enabled</pre>
<pre class="code"><span class="c">! timers badlo (normally defaults par hi chhode jaate hain)</span>
SW1(config)# cdp timer 30
SW1(config)# cdp holdtime 90</pre>

<div class="eg"><p><b>Worked example.</b> SW2 default timers chalata hai, SW1 ko <code>cdp timer 30</code> aur <code>cdp holdtime 90</code> par badla gaya. SW1 ab har 30 seconds mein holdtime 90 ke saath bhejta hai, isliye SW2 par SW1 ki entry 90 se count down hoti hai aur har 30 seconds mein refresh hoti hai. SW2 ab bhi har 60 seconds mein holdtime 180 bhejta hai, isliye SW1 par SW2 ki entry 180 se count hoti hai. Timers match hone zaroori nahi: routing protocol hellos ki tarah, timer ka farak CDP ko kabhi nahi todta.</p></div>

<div class="warn"><p><b>Common galti.</b> Yeh maanna ki receiver ka apna <code>cdp holdtime</code> decide karta hai ki neighbour kab hatega. Asal mein <b>neighbour ke advertisement ke andar</b> wala holdtime count hota hai. Ek aur galti: holdtime ko timer se kam set karna, jisse neighbours advertisements ke beech table mein aate-jaate (flap) rehte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Numbers ulat dena. CDP 60/180 hai; LLDP 30/120. Aur CDP frames <b>multicast</b> MAC (0100.0ccc.cccc) par jaate hain, broadcast MAC ffff.ffff.ffff par nahi.</p></div>

<div class="scn"><h4>Ek port par chhe neighbours</h4><p>Ek engineer ne floor switch par ek hi local port Gi0/20 ke saamne teen alag Cisco phones aur do access points list hote dekhe. Switch theek tha. Kisi ne ek chhota unmanaged desk switch laga diya tha. Unmanaged switch CDP nahi samajhta, isliye woh 0100.0ccc.cccc ko normal multicast maan kar apne saare ports se flood karta hai, aur Cisco switch ne uske peeche ke har device ko sun liya. Engineer ne desk switch hataya aur devices ko sahi ports par patch kiya.</p><p><b>Seekh:</b> ek port par kai CDP neighbours ka matlab lagbhag hamesha hota hai ki beech mein hub ya unmanaged switch baitha hai.</p></div>

<div class="iv"><p class="q">"Cisco device kaise decide karta hai ki CDP neighbour kab hatana hai?"</p><p>Samjhao ki har advertisement ek holdtime (default 180 seconds) carry karta hai jo sender chunta hai. Receiver us value se count down shuru karta hai, har 60 seconds mein naya advertisement aane par ise reset karta hai, aur zero par entry delete kar deta hai. Yeh bhi batao ki local interface down hote hi entry turant hat jaati hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CDP SNAP frames ko multicast MAC 0100.0ccc.cccc par bhejta hai; Cisco devices inhe consume karte hain aur kabhi forward nahi karte.</li>
<li>Defaults: har 60 s advertisement, holdtime 180 s; receiver par sender ka holdtime chalta hai.</li>
<li>TLVs device ID, addresses, port ID, capabilities, version, platform, VTP domain, native VLAN, duplex aur management address carry karte hain.</li>
<li>CDPv2 default hai aur VTP domain, native VLAN aur duplex jodta hai.</li>
<li>Timer mismatch CDP ko kabhi nahi todta.</li>
</ul></div>
`}};export{e as default};