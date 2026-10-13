var e={id:`lldp-med`,h:{en:`LLDP-MED: telling the phone its VLAN, priority and power`,hi:`LLDP-MED: phone ko uska VLAN, priority aur power batana`},body:{en:`
<p><b>LLDP-MED</b> (Media Endpoint Discovery, ANSI/TIA-1057) extends LLDP for devices at the edge such as phones. It lets the switch push <b>settings</b> to the endpoint instead of the administrator typing them on every phone. The phone then configures itself.</p>

<h3>The MED TLV families</h3>
<table class="cmp"><tr><th>TLV</th><th>Carries</th><th>Why it matters</th></tr>
<tr><td>Capabilities</td><td>which MED features the device supports and its class (I, II, III)</td><td>the switch only sends policy to devices that announced MED</td></tr>
<tr><td>Network policy</td><td>application type (voice), <b>VLAN ID</b>, tagged or untagged, <b>802.1p priority</b>, <b>DSCP</b></td><td>the phone learns the voice VLAN and marks its packets</td></tr>
<tr><td>Extended power via MDI</td><td>power type, source, priority, requested and allocated power</td><td>fine-grained PoE negotiation beyond the class</td></tr>
<tr><td>Inventory</td><td>hardware, software, model, serial</td><td>asset tracking</td></tr>
<tr><td>Location (ECS ELIN, civic address, coordinates)</td><td>where the port is</td><td>emergency calls identify the caller's location</td></tr></table>
<p>Endpoint device classes: Class I generic endpoints (computers), Class II media endpoints (conference bridges), Class III communication devices (phones). Our lab phone reports <b>Class III</b>.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="LLDP-MED exchange">
<rect x="30" y="60" width="150" height="70" rx="10" fill="#bae6fd"/><text x="105" y="88" text-anchor="middle" class="svg-ink" font-size="13">EX switch</text><text x="105" y="108" text-anchor="middle" class="svg-muted" font-size="11">lldp-med enabled</text>
<rect x="460" y="60" width="150" height="70" rx="10" fill="#bbf7d0"/><text x="535" y="88" text-anchor="middle" class="svg-ink" font-size="13">IP phone</text><text x="535" y="108" text-anchor="middle" class="svg-muted" font-size="11">MED class III</text>
<line x1="460" y1="75" x2="180" y2="75" stroke="#16a34a" stroke-width="2"/><text x="320" y="68" text-anchor="middle" class="svg-accent" font-size="12">1 I support MED: capabilities</text>
<line x1="180" y1="105" x2="460" y2="105" stroke="#2563eb" stroke-width="2"/><text x="320" y="98" text-anchor="middle" class="svg-accent" font-size="12">2 Policy: voice, VLAN 20, tagged, 802.1p 5, DSCP 46</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">3 The phone re-tags its voice frames with VLAN 20</text>
</svg><p class="cap">The switch only sends network policy after it hears MED capabilities from the phone.</p></div>

<h3>Configuration</h3>
<pre class="code">set protocols lldp interface all
set protocols lldp-med interface all
set protocols lldp-med interface ge-0/0/20 disable
set protocols lldp-med fast-start 3                 <span class="c">! quick policy delivery at link-up</span>
set switch-options voip interface ge-0/0/1.0 vlan VOICE      <span class="c">! the voice VLAN the policy announces</span></pre>
<p>The network policy is built from the <b>voip</b> statement of the port (next chapter) and the CoS settings. LLDP-MED itself only needs to be enabled. <b>Fast start</b> makes the switch send the first MED frames in quick succession when a device appears, so the phone is not waiting 30 seconds for its VLAN.</p>

<h3>Real output: a phone that received its policy</h3>
<pre class="out">lab@ACC1&gt; show lldp neighbors interface ge-0/0/1
Neighbour Information:
System name        : PHONE1
System capabilities
        Supported: Bridge Telephone
        Enabled  : Bridge Telephone
LLDP-MED capabilities:
        Supported: Capabilities Network-Policy Extended-power-via-MDI Inventory
        Device class: Endpoint Class III (communication device)
Network policy:
        <span class="hl">Application type : Voice, VLAN ID: 20, Tagged, Priority: 5, DSCP: 46</span>
Extended power via MDI:
        Power type: PD device, Power source: PSE, Priority: Low, Power value: 5.4W
Inventory:
        Hardware revision: 2, Software revision: NK-PH 4.1, Model: NK-IPPHONE</pre>
<p>Read the highlighted line: voice traffic, <b>VLAN 20, tagged</b>, 802.1p priority 5 and <b>DSCP 46</b> (Expedited Forwarding). The same output shows the power the phone really uses (5.4 W) and its priority, and the inventory of the phone.</p>

<h3>Real output: a phone that did not</h3>
<p>In Lab 2 the HR phone's port had <code>lldp-med interface ge-0/0/2 disable</code>. LLDP still works (the phone is a neighbour) but MED does not deliver any policy:</p>
<pre class="out">lab@ACC2&gt; show lldp neighbors interface ge-0/0/2
System name        : PHONE2
LLDP-MED capabilities:
        Supported: Capabilities Network-Policy Extended-power-via-MDI Inventory
        Device class: Endpoint Class III (communication device)
Network policy:
        Application type : Voice, <span class="hl">Policy: unknown (none received from this switch)</span></pre>
<p>"Policy: unknown (none received from this switch)" is the signature of a phone that was never told its VLAN. It will send voice untagged, and the switch will put it in the data VLAN, where the call server is not reachable. This one line explains many "phone is powered but cannot register" tickets.</p>

<h3>LLDP-MED versus other ways to tell a phone its VLAN</h3>
<table class="cmp"><tr><th>Method</th><th>Notes</th></tr>
<tr><td>LLDP-MED</td><td>standard, dynamic, central; works on any vendor's phone that supports MED</td></tr>
<tr><td>CDP-based voice VLAN</td><td>Cisco phones; not used on Juniper without MED support</td></tr>
<tr><td>Manual VLAN on the phone</td><td>works but does not scale; error prone</td></tr>
<tr><td>DHCP option (vendor specific)</td><td>some phones learn VLAN from DHCP; not Junos-specific</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> Enabling <code>lldp-med</code> but not <code>lldp</code> on the port. Disabling MED on one port "for testing" and leaving it. Expecting MED to provide the IP address: that is DHCP. Forgetting that the phone must support MED (and have LLDP enabled in its menu).</p></div>
<div class="exam"><p><b>Exam trap.</b> LLDP-MED conveys the voice VLAN ID, tagging, 802.1p priority and DSCP in the <b>network policy TLV</b>. The switch sends it only to endpoints that announced MED capability. Power is delivered by PoE; MED only negotiates details.</p></div>

<div class="scn"><h4>The HR phone and the missing line</h4><p>On the Vadodara floor one phone, in the HR corner, powered up but never registered, while every other phone worked. All hardware and the PoE were fine. A comparison of <code>show lldp neighbors interface</code> for the HR port and a working port showed "Policy: unknown" on HR's. A leftover <code>lldp-med interface ge-0/0/2 disable</code> from a previous test was the cause. Deleting it brought the phone into VLAN 20 within seconds.</p><p><b>Lesson:</b> compare a bad port with a good one; the difference is usually one line.</p></div>

<div class="iv"><p class="q">"How does a Juniper switch tell an IP phone which VLAN to use?"</p><p>With LLDP-MED. The switch enables LLDP and LLDP-MED on the access port, the phone announces MED capabilities, and the switch replies with a network policy TLV that carries the voice VLAN ID, tagged or untagged, 802.1p priority and DSCP. The phone then tags its voice with the VLAN. I verify with show lldp neighbors interface and look for "Network policy: Voice, VLAN ID".</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LLDP-MED adds network policy, extended power, inventory and location to LLDP.</li>
<li>Network policy carries VLAN, tag, 802.1p and DSCP 46 for voice.</li>
<li>"Policy: unknown (none received from this switch)" means the phone got no policy.</li>
<li>The phone must support MED; the port needs LLDP and LLDP-MED enabled.</li>
<li>MED informs; PoE powers; DHCP addresses.</li>
</ul></div>
`,hi:`
<p><b>LLDP-MED</b> (Media Endpoint Discovery, ANSI/TIA-1057) LLDP ko edge ke devices jaise phones ke liye extend karta hai. Isse switch endpoint ko <b>settings</b> push kar sakta hai, har phone par administrator ko type karni nahi padti. Phone phir khud configure ho jaata hai.</p>

<h3>MED TLV families</h3>
<table class="cmp"><tr><th>TLV</th><th>Kya carry karta hai</th><th>Kyun zaroori</th></tr>
<tr><td>Capabilities</td><td>device kaunse MED features support karta hai aur uski class (I, II, III)</td><td>switch sirf unhi devices ko policy bhejta hai jinhone MED announce kiya</td></tr>
<tr><td>Network policy</td><td>application type (voice), <b>VLAN ID</b>, tagged ya untagged, <b>802.1p priority</b>, <b>DSCP</b></td><td>phone voice VLAN seekhta hai aur apne packets mark karta hai</td></tr>
<tr><td>Extended power via MDI</td><td>power type, source, priority, requested aur allocated power</td><td>class se aage fine-grained PoE negotiation</td></tr>
<tr><td>Inventory</td><td>hardware, software, model, serial</td><td>asset tracking</td></tr>
<tr><td>Location (ECS ELIN, civic address, coordinates)</td><td>port kahan hai</td><td>emergency calls mein caller ki location pehchani jaati hai</td></tr></table>
<p>Endpoint device classes: Class I generic endpoints (computers), Class II media endpoints (conference bridges), Class III communication devices (phones). Hamara lab phone <b>Class III</b> report karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="LLDP-MED exchange">
<rect x="30" y="60" width="150" height="70" rx="10" fill="#bae6fd"/><text x="105" y="88" text-anchor="middle" class="svg-ink" font-size="13">EX switch</text><text x="105" y="108" text-anchor="middle" class="svg-muted" font-size="11">lldp-med enabled</text>
<rect x="460" y="60" width="150" height="70" rx="10" fill="#bbf7d0"/><text x="535" y="88" text-anchor="middle" class="svg-ink" font-size="13">IP phone</text><text x="535" y="108" text-anchor="middle" class="svg-muted" font-size="11">MED class III</text>
<line x1="460" y1="75" x2="180" y2="75" stroke="#16a34a" stroke-width="2"/><text x="320" y="68" text-anchor="middle" class="svg-accent" font-size="12">1 Main MED support karta hoon: capabilities</text>
<line x1="180" y1="105" x2="460" y2="105" stroke="#2563eb" stroke-width="2"/><text x="320" y="98" text-anchor="middle" class="svg-accent" font-size="12">2 Policy: voice, VLAN 20, tagged, 802.1p 5, DSCP 46</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">3 Phone apne voice frames VLAN 20 se tag karta hai</text>
</svg><p class="cap">Switch network policy tabhi bhejta hai jab phone se MED capabilities sun leta hai.</p></div>

<h3>Configuration</h3>
<pre class="code">set protocols lldp interface all
set protocols lldp-med interface all
set protocols lldp-med interface ge-0/0/20 disable
set protocols lldp-med fast-start 3                 <span class="c">! link-up par tez policy delivery</span>
set switch-options voip interface ge-0/0/1.0 vlan VOICE      <span class="c">! policy jo voice VLAN announce karti hai</span></pre>
<p>Network policy port ke <b>voip</b> statement (agla chapter) aur CoS settings se banti hai. LLDP-MED ko khud sirf enable karna hota hai. <b>Fast start</b> device dikhte hi switch ko pehle MED frames tezi se bhejne deta hai, taaki phone ko apne VLAN ke liye 30 second intezaar na karna pade.</p>

<h3>Asli output: policy paane wala phone</h3>
<pre class="out">lab@ACC1&gt; show lldp neighbors interface ge-0/0/1
Neighbour Information:
System name        : PHONE1
System capabilities
        Supported: Bridge Telephone
        Enabled  : Bridge Telephone
LLDP-MED capabilities:
        Supported: Capabilities Network-Policy Extended-power-via-MDI Inventory
        Device class: Endpoint Class III (communication device)
Network policy:
        <span class="hl">Application type : Voice, VLAN ID: 20, Tagged, Priority: 5, DSCP: 46</span>
Extended power via MDI:
        Power type: PD device, Power source: PSE, Priority: Low, Power value: 5.4W
Inventory:
        Hardware revision: 2, Software revision: NK-PH 4.1, Model: NK-IPPHONE</pre>
<p>Highlighted line padho: voice traffic, <b>VLAN 20, tagged</b>, 802.1p priority 5 aur <b>DSCP 46</b> (Expedited Forwarding). Wahi output phone jo power asal mein use karta hai (5.4 W), uski priority, aur phone ki inventory bhi dikhata hai.</p>

<h3>Asli output: jis phone ko nahi mili</h3>
<p>Lab 2 mein HR phone ke port par <code>lldp-med interface ge-0/0/2 disable</code> tha. LLDP chalta hai (phone neighbour hai) par MED koi policy nahi deta:</p>
<pre class="out">lab@ACC2&gt; show lldp neighbors interface ge-0/0/2
System name        : PHONE2
LLDP-MED capabilities:
        Supported: Capabilities Network-Policy Extended-power-via-MDI Inventory
        Device class: Endpoint Class III (communication device)
Network policy:
        Application type : Voice, <span class="hl">Policy: unknown (none received from this switch)</span></pre>
<p>"Policy: unknown (none received from this switch)" us phone ki pehchaan hai jise VLAN kabhi bataya hi nahi gaya. Woh voice untagged bhejega, aur switch use data VLAN mein daalega, jahan call server reachable nahi. Yeh ek line "phone powered hai par register nahi hota" wale kai tickets samjha deti hai.</p>

<h3>LLDP-MED aur phone ko VLAN batane ke doosre tareeke</h3>
<table class="cmp"><tr><th>Method</th><th>Notes</th></tr>
<tr><td>LLDP-MED</td><td>standard, dynamic, central; MED support karne wale kisi bhi vendor ke phone ke saath chalta hai</td></tr>
<tr><td>CDP-based voice VLAN</td><td>Cisco phones; MED support ke bina Juniper par use nahi hota</td></tr>
<tr><td>Phone par manual VLAN</td><td>chalta hai par scale nahi hota; galti ki sambhavna</td></tr>
<tr><td>DHCP option (vendor specific)</td><td>kuch phones DHCP se VLAN seekhte hain; Junos-specific nahi</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> Port par <code>lldp-med</code> enable karna par <code>lldp</code> nahi. "Testing" ke liye ek port par MED disable karke chhod dena. MED se IP address milne ki ummeed: woh DHCP hai. Yeh bhoolna ki phone MED support karna chahiye (aur uske menu mein LLDP enabled ho).</p></div>
<div class="exam"><p><b>Exam trap.</b> LLDP-MED voice VLAN ID, tagging, 802.1p priority aur DSCP <b>network policy TLV</b> mein bhejta hai. Switch yeh sirf un endpoints ko bhejta hai jinhone MED capability announce ki. Power PoE deta hai; MED sirf details negotiate karta hai.</p></div>

<div class="scn"><h4>HR phone aur gaayab line</h4><p>Vadodara floor par HR corner ka ek phone power hota tha par kabhi register nahi hota tha, jabki baaki sab phones chalte the. Hardware aur PoE theek the. HR port aur ek working port ke <code>show lldp neighbors interface</code> compare karne par HR par "Policy: unknown" dikha. Pichhle test ka bacha hua <code>lldp-med interface ge-0/0/2 disable</code> kaaran tha. Use delete karte hi phone kuch second mein VLAN 20 mein aa gaya.</p><p><b>Lesson:</b> kharab port ko achhe port se compare karo; fark aksar ek line ka hota hai.</p></div>

<div class="iv"><p class="q">"Juniper switch IP phone ko kaise batata hai ki kaunsa VLAN use kare?"</p><p>LLDP-MED se. Switch access port par LLDP aur LLDP-MED enable karta hai, phone MED capabilities announce karta hai, aur switch network policy TLV se jawab deta hai jisme voice VLAN ID, tagged ya untagged, 802.1p priority aur DSCP hote hain. Phone phir voice ko VLAN se tag karta hai. Main show lldp neighbors interface se verify karta hoon aur "Network policy: Voice, VLAN ID" dhoondta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LLDP-MED LLDP mein network policy, extended power, inventory aur location jodta hai.</li>
<li>Network policy voice ke liye VLAN, tag, 802.1p aur DSCP 46 carry karti hai.</li>
<li>"Policy: unknown (none received from this switch)" matlab phone ko policy nahi mili.</li>
<li>Phone MED support kare; port par LLDP aur LLDP-MED enabled hon.</li>
<li>MED inform karta hai; PoE power deta hai; DHCP address deta hai.</li>
</ul></div>
`}};export{e as default};