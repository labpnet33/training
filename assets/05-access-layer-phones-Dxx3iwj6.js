var e={id:`access-layer-phones`,h:{en:`The access layer and phones: voice VLAN, trust and CoS`,hi:`Access layer aur phones: voice VLAN, trust aur CoS`},body:{en:`<h3>Where a call really starts</h3>
<p>A desk has one cable. It runs from the access switch to the IP phone, and the user's PC plugs into a small switch inside the phone. So one switch port carries two very different devices. The phone is a device you manage and can trust; the PC is a device anyone can change. The access layer must keep them apart, ask the phone to mark its own traffic correctly, and refuse to believe the PC.</p>
<h3>The voice VLAN</h3>
<p>The port stays an <b>access port</b> in the <b>data VLAN</b> for the PC (untagged frames), and it <b>additionally</b> carries the <b>voice VLAN</b> as tagged frames for the phone. The phone learns the voice VLAN number from the switch with <b>CDP</b> or from <b>LLDP-MED</b> (Link Layer Discovery Protocol, Media Endpoint Discovery), the standard that also tells the phone which CoS and DSCP values to use and how much PoE power it may draw.</p>
<pre class="code"><span class="c">! classic Catalyst access port for a desk</span>
mls qos
interface GigabitEthernet1/0/5
 switchport mode access
 switchport access vlan 10
 switchport voice vlan 150
 mls qos trust device cisco-phone
 mls qos trust cos
 spanning-tree portfast</pre>
<p>VLAN 10 is the data VLAN, VLAN 150 the voice VLAN. Because voice is tagged, the frame carries a <b>CoS</b> value (Class of Service, 3 bits in the 802.1Q tag, 0 to 7). Phones normally send voice with CoS 5 and DSCP EF, signalling with CoS 3 and DSCP CS3.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Phone and PC on one port">
<rect x="30" y="30" width="110" height="46" rx="6" fill="#bbf7d0" stroke="#64748b"/><text x="85" y="58" text-anchor="middle" class="svg-ink" font-size="12">IP phone (trusted)</text>
<rect x="30" y="120" width="110" height="46" rx="6" fill="#fed7aa" stroke="#64748b"/><text x="85" y="148" text-anchor="middle" class="svg-ink" font-size="12">PC (not trusted)</text>
<rect x="260" y="70" width="110" height="60" rx="6" fill="#bae6fd" stroke="#64748b"/><text x="315" y="96" text-anchor="middle" class="svg-ink" font-size="12">Access switch</text><text x="315" y="114" text-anchor="middle" class="svg-muted" font-size="12">port Gi1/0/5</text>
<rect x="480" y="70" width="130" height="60" rx="6" fill="#ddd6fe" stroke="#64748b"/><text x="545" y="96" text-anchor="middle" class="svg-ink" font-size="12">Distribution /</text><text x="545" y="114" text-anchor="middle" class="svg-ink" font-size="12">branch router</text>
<line x1="140" y1="53" x2="260" y2="90" stroke="#64748b" stroke-width="2"/><line x1="140" y1="143" x2="260" y2="112" stroke="#64748b" stroke-width="2"/><line x1="370" y1="100" x2="480" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="200" y="55" text-anchor="middle" class="svg-accent" font-size="12">voice VLAN 150, CoS 5</text>
<text x="200" y="166" text-anchor="middle" class="svg-accent" font-size="12">data VLAN 10, CoS 0</text>
<text x="425" y="88" text-anchor="middle" class="svg-muted" font-size="12">trunk, DSCP</text></svg><p class="cap">One cable, two VLANs, two levels of trust. The PC's marking is re-written; the phone's is kept.</p></div>
<h3>Trust boundary choices</h3>
<table class="cmp"><tr><th>Option</th><th>What it does</th><th>When to use</th></tr>
<tr><td>Untrusted (default with <code>mls qos</code>)</td><td>resets CoS and DSCP to 0</td><td>PC ports, guests</td></tr>
<tr><td>Trust cos / trust dscp</td><td>believes the marking in the frame</td><td>uplinks between your own switches</td></tr>
<tr><td>Conditional trust (<code>trust device cisco-phone</code>)</td><td>trusts only while a phone is detected by CDP</td><td>desk ports</td></tr>
<tr><td>Re-mark by policy at the router</td><td>classify by ACL or port and set DSCP</td><td>when switches cannot do it, or devices are not phones</td></tr></table>
<p>The lab of this module uses the last option on the branch routers: the LAN-edge input policy classifies by protocol and port and sets the DSCP itself, because phones and PCs are not trusted. Good practice is to do both: the switch enforces trust at the port, and the router re-marks as a safety net.</p>
<div class="note"><p><b>Not simulated.</b> The simulator does not model the access-switch CoS, CDP or LLDP-MED negotiation in these labs. The configuration and the output in this chapter show what you would see on real Catalyst and Junos switches.</p></div>
<h3>CoS and DSCP: the translation at the border</h3>
<p>CoS exists only inside an 802.1Q tag, so it disappears at the first router. Switches therefore translate with a <b>CoS-to-DSCP map</b> when a frame goes up to layer 3: CoS 5 to DSCP 46 (EF), CoS 4 to DSCP 34 (AF41), CoS 3 to DSCP 24 (CS3), CoS 0 to DSCP 0. Check it, and change it only when the design says so.</p>
<pre class="out">SW-PUN#show mls qos interface GigabitEthernet1/0/5
GigabitEthernet1/0/5
<span class="hl">trust state: not trusted</span>
trust mode: trust cos
trust enabled flag: ena
COS override: dis
default COS: 0
DSCP Mutation Map: Default DSCP Mutation Map
<span class="hl">Trust device: cisco-phone</span>
qos mode: port-based</pre>
<p>Read it as: the port trusts CoS only when a Cisco phone is present ("trust state: not trusted" shows no phone is attached at the moment).</p>
<div class="note"><p><b>Junos note.</b> On a Junos switch the voice VLAN is declared with <code>set switch-options voip interface ge-0/0/5.0 vlan VOICE</code> and, optionally, <code>forwarding-class expedited-forwarding</code> to put the phone traffic into the voice queue. LLDP-MED is switched on with <code>set protocols lldp-med interface all</code>. Check with <code>show lldp neighbors</code> and <code>show class-of-service interface ge-0/0/5</code>.</p></div>
<div class="eg"><p><b>Worked example.</b> A Pune desk: the phone sends voice in VLAN 150 with CoS 5 and DSCP EF. The PC next to it runs an SMB copy marked EF by a mischievous user script, in VLAN 10. With <code>mls qos trust device cisco-phone</code> the switch keeps the phone's CoS 5 and sets the PC port to untrusted, so the PC frames leave with CoS 0 and DSCP 0. At the router, input policy MARK-IN again classifies TCP 445 as AF11. The mischief achieves nothing.</p></div>
<div class="warn"><p><b>Common mistake.</b> Using <code>mls qos trust cos</code> on the whole port without the device condition. The PC then shares the trusted channel; and when no phone is connected anyone who plugs in a laptop gets trust.</p></div>
<div class="exam"><p><b>Exam trap.</b> CoS is layer 2 and is lost when the frame crosses a routed hop; DSCP is layer 3 and survives routing. If a question says "markings disappear after the router", ask whether the policy relied on CoS.</p></div>
<div class="scn"><h4>Scenario: The phone that never got priority</h4><p>New phones in Delhi registered fine but sounded poor during the daily backup. The switch port showed "trust state: not trusted" even with a phone connected. CDP was disabled on the switch globally by a hardening script, so conditional trust never activated and every phone packet was reset to CoS 0. The engineer re-enabled CDP on access ports (or LLDP-MED where the phones support it) and the trust state turned "trusted" after the next phone reboot.</p><p><b>Lesson:</b> Conditional trust depends on discovery protocols. If discovery is off, trust is off.</p></div>
<div class="iv"><p class="q">"What is a trust boundary and where do you put it for a branch with phones and PCs?"</p><p>It is the first device whose markings you believe. For desks put it at the access switch port with conditional trust for the phone, untrusted for the PC, and re-classify by ACL or port at the branch router as a safety net. Mention CoS to DSCP mapping.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>One desk port carries two VLANs: data (untagged, PC) and voice (tagged, phone).</li><li>CDP or LLDP-MED tells the phone the voice VLAN and the markings to use.</li><li>Trust the phone conditionally, never the PC; re-mark the rest to 0.</li><li>CoS lives in the 802.1Q tag and is lost at the router; the switch maps CoS to DSCP.</li><li>Re-mark again at the router: belt and braces.</li></ul></div>`,hi:`<h3>Call asal mein kahan se shuru hoti hai</h3>
<p>Ek desk par ek hi cable hoti hai. Woh access switch se IP phone tak jaati hai, aur user ka PC phone ke andar ke chhote switch mein lagta hai. Isliye ek switch port do bahut alag devices ko carry karta hai. Phone woh device hai jise aap manage karte ho aur jis par bharosa kar sakte ho; PC woh device hai jise koi bhi badal sakta hai. Access layer ko dono ko alag rakhna hai, phone se kehna hai ki apna traffic sahi mark kare, aur PC par bharosa nahi karna.</p>
<h3>Voice VLAN</h3>
<p>Port PC ke liye <b>data VLAN</b> mein <b>access port</b> rehta hai (untagged frames), aur phone ke liye <b>voice VLAN</b> ko tagged frames ki tarah <b>additionally</b> carry karta hai. Phone voice VLAN ka number switch se <b>CDP</b> ya <b>LLDP-MED</b> (Link Layer Discovery Protocol, Media Endpoint Discovery) se seekhta hai, wahi standard jo phone ko yeh bhi batata hai ki kaun si CoS aur DSCP values use karni hain aur kitni PoE power le sakta hai.</p>
<pre class="code"><span class="c">! desk ke liye classic Catalyst access port</span>
mls qos
interface GigabitEthernet1/0/5
 switchport mode access
 switchport access vlan 10
 switchport voice vlan 150
 mls qos trust device cisco-phone
 mls qos trust cos
 spanning-tree portfast</pre>
<p>VLAN 10 data VLAN hai, VLAN 150 voice VLAN. Kyunki voice tagged hai, frame mein <b>CoS</b> value hoti hai (Class of Service, 802.1Q tag mein 3 bits, 0 se 7). Phones aam taur par voice CoS 5 aur DSCP EF ke saath, signalling CoS 3 aur DSCP CS3 ke saath bhejte hain.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Ek port par phone aur PC">
<rect x="30" y="30" width="110" height="46" rx="6" fill="#bbf7d0" stroke="#64748b"/><text x="85" y="58" text-anchor="middle" class="svg-ink" font-size="12">IP phone (trusted)</text>
<rect x="30" y="120" width="110" height="46" rx="6" fill="#fed7aa" stroke="#64748b"/><text x="85" y="148" text-anchor="middle" class="svg-ink" font-size="12">PC (not trusted)</text>
<rect x="260" y="70" width="110" height="60" rx="6" fill="#bae6fd" stroke="#64748b"/><text x="315" y="96" text-anchor="middle" class="svg-ink" font-size="12">Access switch</text><text x="315" y="114" text-anchor="middle" class="svg-muted" font-size="12">port Gi1/0/5</text>
<rect x="480" y="70" width="130" height="60" rx="6" fill="#ddd6fe" stroke="#64748b"/><text x="545" y="96" text-anchor="middle" class="svg-ink" font-size="12">Distribution /</text><text x="545" y="114" text-anchor="middle" class="svg-ink" font-size="12">branch router</text>
<line x1="140" y1="53" x2="260" y2="90" stroke="#64748b" stroke-width="2"/><line x1="140" y1="143" x2="260" y2="112" stroke="#64748b" stroke-width="2"/><line x1="370" y1="100" x2="480" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="200" y="55" text-anchor="middle" class="svg-accent" font-size="12">voice VLAN 150, CoS 5</text>
<text x="200" y="166" text-anchor="middle" class="svg-accent" font-size="12">data VLAN 10, CoS 0</text>
<text x="425" y="88" text-anchor="middle" class="svg-muted" font-size="12">trunk, DSCP</text></svg><p class="cap">Ek cable, do VLANs, trust ke do star. PC ki marking dobara likhi jaati hai; phone ki rakhi jaati hai.</p></div>
<h3>Trust boundary ke vikalp</h3>
<table class="cmp"><tr><th>Vikalp</th><th>Kya karta hai</th><th>Kab use karein</th></tr>
<tr><td>Untrusted (<code>mls qos</code> ke saath default)</td><td>CoS aur DSCP ko 0 kar deta hai</td><td>PC ports, guests</td></tr>
<tr><td>Trust cos / trust dscp</td><td>frame ki marking par bharosa karta hai</td><td>apne switches ke beech uplinks</td></tr>
<tr><td>Conditional trust (<code>trust device cisco-phone</code>)</td><td>sirf tab trust karta hai jab CDP se phone detect ho</td><td>desk ports</td></tr>
<tr><td>Router par policy se re-mark</td><td>ACL ya port se classify karke DSCP set karta hai</td><td>jab switches nahi kar sakte, ya devices phone nahi hain</td></tr></table>
<p>Is module ka lab branch routers par aakhri vikalp use karta hai: LAN-edge input policy protocol aur port se classify karti hai aur DSCP khud set karti hai, kyunki phones aur PCs trusted nahi hain. Achhi practice dono karna hai: switch port par trust lagu karta hai, aur router safety net ki tarah re-mark karta hai.</p>
<div class="note"><p><b>Simulated nahi.</b> Simulator in labs mein access-switch CoS, CDP ya LLDP-MED negotiation model nahi karta. Is chapter ki configuration aur output wahi dikhate hain jo real Catalyst aur Junos switches par dikhta.</p></div>
<h3>CoS aur DSCP: border par anuvaad</h3>
<p>CoS sirf 802.1Q tag ke andar hota hai, isliye pehle router par gayab ho jaata hai. Isliye switches frame ke layer 3 par jaate waqt <b>CoS-to-DSCP map</b> se anuvaad karte hain: CoS 5 se DSCP 46 (EF), CoS 4 se DSCP 34 (AF41), CoS 3 se DSCP 24 (CS3), CoS 0 se DSCP 0. Ise check karo, aur design kahe tabhi badlo.</p>
<pre class="out">SW-PUN#show mls qos interface GigabitEthernet1/0/5
GigabitEthernet1/0/5
<span class="hl">trust state: not trusted</span>
trust mode: trust cos
trust enabled flag: ena
COS override: dis
default COS: 0
DSCP Mutation Map: Default DSCP Mutation Map
<span class="hl">Trust device: cisco-phone</span>
qos mode: port-based</pre>
<p>Aise padho: port CoS par sirf tab bharosa karta hai jab Cisco phone maujood ho ("trust state: not trusted" dikhata hai ki is waqt koi phone laga nahi hai).</p>
<div class="note"><p><b>Junos note.</b> Junos switch par voice VLAN <code>set switch-options voip interface ge-0/0/5.0 vlan VOICE</code> se declare hota hai aur, optional, phone traffic ko voice queue mein daalne ke liye <code>forwarding-class expedited-forwarding</code>. LLDP-MED <code>set protocols lldp-med interface all</code> se chalu hota hai. Check karo <code>show lldp neighbors</code> aur <code>show class-of-service interface ge-0/0/5</code> se.</p></div>
<div class="eg"><p><b>Worked example.</b> Pune ka ek desk: phone voice VLAN 150 mein CoS 5 aur DSCP EF ke saath bhejta hai. Uske baju ka PC VLAN 10 mein ek shararati user script se EF mark kiya SMB copy chalata hai. <code>mls qos trust device cisco-phone</code> ke saath switch phone ki CoS 5 rakhta hai aur PC port ko untrusted set karta hai, isliye PC frames CoS 0 aur DSCP 0 ke saath nikalte hain. Router par input policy MARK-IN phir TCP 445 ko AF11 classify karti hai. Sharaarat kuch hasil nahi karti.</p></div>
<div class="warn"><p><b>Common mistake.</b> Device condition ke bina poore port par <code>mls qos trust cos</code> lagana. PC tab trusted channel share karta hai; aur jab koi phone laga na ho to jo laptop lagaye use trust mil jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> CoS layer 2 hai aur frame routed hop paar karte hi kho jaata hai; DSCP layer 3 hai aur routing se bach jaata hai. Agar sawal kahe "router ke baad markings gayab ho jaati hain", to poochho ki policy CoS par to nirbhar nahi thi.</p></div>
<div class="scn"><h4>Scenario: Woh phone jise priority kabhi mili hi nahi</h4><p>Delhi ke naye phones register ho gaye lekin roz ke backup ke dauran kharab sunai dete the. Switch port phone connected hone par bhi "trust state: not trusted" dikhata tha. Ek hardening script ne switch par CDP global roop se disable kar diya tha, isliye conditional trust kabhi active nahi hua aur phone ka har packet CoS 0 par reset ho raha tha. Engineer ne access ports par CDP (ya jahan phones support karte hain wahan LLDP-MED) dobara enable kiya aur agle phone reboot ke baad trust state "trusted" ho gayi.</p><p><b>Lesson:</b> Conditional trust discovery protocols par nirbhar hai. Discovery band to trust band.</p></div>
<div class="iv"><p class="q">"Trust boundary kya hai aur phones aur PCs wali branch ke liye use kahan rakhte ho?"</p><p>Yeh pehla device hai jiski markings aap maante ho. Desks ke liye access switch port par rakho, phone ke liye conditional trust, PC ke liye untrusted, aur safety net ki tarah branch router par ACL ya port se re-classify karo. CoS se DSCP mapping ka zikr karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Ek desk port do VLANs carry karta hai: data (untagged, PC) aur voice (tagged, phone).</li><li>CDP ya LLDP-MED phone ko voice VLAN aur use karne wali markings batata hai.</li><li>Phone par conditional trust, PC par kabhi nahi; baaki ko 0 re-mark karo.</li><li>CoS 802.1Q tag mein rehta hai aur router par kho jaata hai; switch CoS ko DSCP se map karta hai.</li><li>Router par dobara re-mark karo: belt and braces.</li></ul></div>`}};export{e as default};