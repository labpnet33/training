var e={id:`design-and-extras`,h:{en:`Campus VLAN design, interface ranges and extra Layer 2 features`,hi:`Campus VLAN design, interface ranges aur extra Layer 2 features`},body:{en:`
<p>So far you built VLANs one port at a time. Real campuses have hundreds of ports, and an engineer who types every line by hand will eventually make a mistake. This chapter shows how professionals keep Layer 2 designs tidy, and introduces the extra Layer 2 features the JNCIS-ENT blueprint mentions: voice VLANs, Q-in-Q tunnelling and MAC address handling. You will not configure them in the labs, but you must recognise them.</p>

<h3>A sensible VLAN plan</h3>
<p>Write the plan down before you type. A common pattern is one VLAN per function per building, with the VLAN ID and the third octet of the subnet kept the same, so that VLAN 30 is 10.30.0.0/24 and its gateway is irb.30 at 10.30.0.1. Lab 3 follows this: STAFF is VLAN 30 with 10.30.0.1/24, PRINT is VLAN 40 with 10.40.0.1/24 and MGMT is VLAN 99 with 10.99.0.1/24.</p>
<table class="cmp"><tr><th>VLAN</th><th>Name</th><th>Subnet</th><th>Gateway (IRB)</th></tr>
<tr><td>30</td><td>STAFF</td><td>10.30.0.0/24</td><td>irb.30 = 10.30.0.1</td></tr>
<tr><td>40</td><td>PRINT</td><td>10.40.0.0/24</td><td>irb.40 = 10.40.0.1</td></tr>
<tr><td>99</td><td>MGMT</td><td>10.99.0.0/24</td><td>irb.99 = 10.99.0.1</td></tr></table>
<p>Keep the user-facing VLANs separate from <b>management</b>. Management traffic (SSH, SNMP) belongs in its own VLAN, which is also a good candidate for the trunk's native VLAN so that device-to-device control traffic stays untagged and isolated from users.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Campus layers">
<rect x="220" y="15" width="200" height="44" rx="10" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">Core / distribution (IRBs)</text>
<rect x="60" y="85" width="140" height="44" rx="10" fill="#ddd6fe"/><text x="130" y="112" text-anchor="middle" class="svg-ink" font-size="13">Access switch A</text>
<rect x="250" y="85" width="140" height="44" rx="10" fill="#ddd6fe"/><text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="13">Access switch B</text>
<rect x="440" y="85" width="140" height="44" rx="10" fill="#ddd6fe"/><text x="510" y="112" text-anchor="middle" class="svg-ink" font-size="13">Access switch C</text>
<line x1="280" y1="59" x2="130" y2="85" stroke="#64748b" stroke-width="3"/><line x1="320" y1="59" x2="320" y2="85" stroke="#64748b" stroke-width="3"/><line x1="360" y1="59" x2="510" y2="85" stroke="#64748b" stroke-width="3"/>
<rect x="60" y="160" width="140" height="30" rx="8" fill="#bae6fd"/><text x="130" y="180" text-anchor="middle" class="svg-ink" font-size="12">users, phones, printers</text>
<rect x="250" y="160" width="140" height="30" rx="8" fill="#bae6fd"/><text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="12">users, phones, printers</text>
<rect x="440" y="160" width="140" height="30" rx="8" fill="#bae6fd"/><text x="510" y="180" text-anchor="middle" class="svg-ink" font-size="12">users, phones, printers</text>
<line x1="130" y1="129" x2="130" y2="160" stroke="#64748b" stroke-width="2"/><line x1="320" y1="129" x2="320" y2="160" stroke="#64748b" stroke-width="2"/><line x1="510" y1="129" x2="510" y2="160" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Access switches are Layer 2 only; the VLANs end at IRB gateways in the core or distribution layer.</p></div>

<h3>Interface ranges and descriptions</h3>
<p>An <b>interface range</b> lets you configure many ports once. Put the shared lines under the range and the range expands to each port at commit time:</p>
<pre class="code">set interfaces interface-range USERS member-range ge-0/0/1 to ge-0/0/20
set interfaces interface-range USERS unit 0 family ethernet-switching interface-mode access vlan members STAFF
set interfaces ge-0/0/0 description "uplink to CORE ge-0/0/0"
set vlans STAFF description "Staff laptops, building A"</pre>
<p>Descriptions cost nothing and save hours during a fault. Read them with <code>show interfaces descriptions</code>. Remember that a setting directly on one port overrides the range, so exceptions are easy.</p>

<h3>Extra Layer 2 features to recognise</h3>
<dl class="terms">
<dt>Voice VLAN</dt><dd>An IP phone and a PC share one wall port. The port carries the PC untagged in the data VLAN and the phone tagged in a voice VLAN, so voice can be given priority. Junos learns the voice VLAN for a port from the <code>switch-options voip</code> configuration, often together with LLDP-MED.</dd>
<dt>Q-in-Q (802.1ad)</dt><dd>A service provider or an enterprise wraps customer frames in a second, outer tag so many customer VLANs travel through the network unchanged. On Junos this is enabled with <code>dot1q-tunneling</code> on a VLAN.</dd>
<dt>MAC limiting and static MACs</dt><dd>A port can be limited to a number of learned addresses, or a MAC can be pinned to a port. These are security tools and the Layer 2 security module covers them.</dd>
<dt>Storm control, port mirroring, LLDP</dt><dd>Protection against broadcast storms, copying traffic for analysis, and neighbour discovery. All are standard enterprise switch features.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> A 24-port access switch in a call centre: ports 1 to 20 are for agents with a PC and a phone, 21 and 22 are printers, 23 is a spare and 24 is the uplink trunk. The engineer creates one range for ports 1 to 20, one for 21 and 22, leaves 23 unconfigured (no <code>family ethernet-switching</code>, so it does not switch) and configures 24 as a trunk with MGMT as native. Four blocks of configuration instead of twenty-four.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Leaving unused ports in the default VLAN where anyone can plug in. Better to leave them without <code>family ethernet-switching</code> or park them in an unused "parking" VLAN. Using VLAN 1 for user traffic and management. Mixing naming styles (Sales, SALES, sales_floor) so nobody can search the configuration.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the names: voice VLAN, Q-in-Q (dot1q-tunneling), MAC limiting. The exam asks which feature solves which problem; it does not ask you to configure a voice VLAN from memory.</p></div>

<div class="scn"><h4>The copy-paste that moved 20 phones</h4><p>A technician copied a block of access-port configuration from a data switch to a voice switch. The pasted lines referenced a VLAN that did not exist on the second switch. Junos refused the commit with an error, so nothing changed; the technician created the VLAN, then committed. On a platform that applies lines one by one the phones would have dropped one at a time.</p><p><b>Lesson:</b> commit check and the all-or-nothing commit protect you from half-applied changes.</p></div>

<div class="iv"><p class="q">"How do you keep a large campus switch configuration manageable?"</p><p>A written VLAN plan with consistent names and IDs, interface ranges for repeated access ports, descriptions on every uplink and every VLAN, management in its own VLAN, and unused ports shut down or parked. Mention <code>show | compare</code> before every commit.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Plan VLAN IDs, names, subnets and gateways before configuring.</li>
<li>Use <code>interface-range</code> and descriptions to cut errors on large switches.</li>
<li>Keep management in its own VLAN and unused ports out of user VLANs.</li>
<li>Recognise voice VLAN, Q-in-Q and MAC limiting by name and purpose.</li>
</ul></div>
`,hi:`
<p>Ab tak aapne VLANs ek-ek port karke banaye. Asli campuses mein sau-sau ports hote hain, aur jo engineer har line haath se type karta hai woh kabhi na kabhi galti karega. Yeh chapter dikhata hai ki professionals Layer 2 design ko saaf kaise rakhte hain, aur JNCIS-ENT blueprint ke extra Layer 2 features batata hai: voice VLANs, Q-in-Q tunnelling aur MAC address handling. Labs mein aap unhe configure nahi karoge, lekin pehchanna zaroori hai.</p>

<h3>Samajhdaar VLAN plan</h3>
<p>Type karne se pehle plan likh lo. Aam pattern hai har building mein har function ke liye ek VLAN, aur VLAN ID tatha subnet ka teesra octet same rakhna, taaki VLAN 30 matlab 10.30.0.0/24 aur uska gateway irb.30 at 10.30.0.1. Lab 3 isi tarah hai: STAFF VLAN 30 hai 10.30.0.1/24 ke saath, PRINT VLAN 40 hai 10.40.0.1/24 ke saath aur MGMT VLAN 99 hai 10.99.0.1/24 ke saath.</p>
<table class="cmp"><tr><th>VLAN</th><th>Naam</th><th>Subnet</th><th>Gateway (IRB)</th></tr>
<tr><td>30</td><td>STAFF</td><td>10.30.0.0/24</td><td>irb.30 = 10.30.0.1</td></tr>
<tr><td>40</td><td>PRINT</td><td>10.40.0.0/24</td><td>irb.40 = 10.40.0.1</td></tr>
<tr><td>99</td><td>MGMT</td><td>10.99.0.0/24</td><td>irb.99 = 10.99.0.1</td></tr></table>
<p>User-facing VLANs ko <b>management</b> se alag rakho. Management traffic (SSH, SNMP) ka apna VLAN hona chahiye, jo trunk ke native VLAN ke liye bhi achha candidate hai, taaki device-to-device control traffic untagged rahe aur users se alag.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Campus layers">
<rect x="220" y="15" width="200" height="44" rx="10" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">Core / distribution (IRBs)</text>
<rect x="60" y="85" width="140" height="44" rx="10" fill="#ddd6fe"/><text x="130" y="112" text-anchor="middle" class="svg-ink" font-size="13">Access switch A</text>
<rect x="250" y="85" width="140" height="44" rx="10" fill="#ddd6fe"/><text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="13">Access switch B</text>
<rect x="440" y="85" width="140" height="44" rx="10" fill="#ddd6fe"/><text x="510" y="112" text-anchor="middle" class="svg-ink" font-size="13">Access switch C</text>
<line x1="280" y1="59" x2="130" y2="85" stroke="#64748b" stroke-width="3"/><line x1="320" y1="59" x2="320" y2="85" stroke="#64748b" stroke-width="3"/><line x1="360" y1="59" x2="510" y2="85" stroke="#64748b" stroke-width="3"/>
<rect x="60" y="160" width="140" height="30" rx="8" fill="#bae6fd"/><text x="130" y="180" text-anchor="middle" class="svg-ink" font-size="12">users, phones, printers</text>
<rect x="250" y="160" width="140" height="30" rx="8" fill="#bae6fd"/><text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="12">users, phones, printers</text>
<rect x="440" y="160" width="140" height="30" rx="8" fill="#bae6fd"/><text x="510" y="180" text-anchor="middle" class="svg-ink" font-size="12">users, phones, printers</text>
<line x1="130" y1="129" x2="130" y2="160" stroke="#64748b" stroke-width="2"/><line x1="320" y1="129" x2="320" y2="160" stroke="#64748b" stroke-width="2"/><line x1="510" y1="129" x2="510" y2="160" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Access switches sirf Layer 2 hain; VLANs core ya distribution layer ke IRB gateways par khatam hote hain.</p></div>

<h3>Interface ranges aur descriptions</h3>
<p><b>Interface range</b> se aap bahut saare ports ek baar mein configure karte ho. Shared lines range ke neeche daalo aur commit ke waqt range har port par expand ho jaati hai:</p>
<pre class="code">set interfaces interface-range USERS member-range ge-0/0/1 to ge-0/0/20
set interfaces interface-range USERS unit 0 family ethernet-switching interface-mode access vlan members STAFF
set interfaces ge-0/0/0 description "uplink to CORE ge-0/0/0"
set vlans STAFF description "Staff laptops, building A"</pre>
<p>Descriptions ka koi kharcha nahi aur fault ke waqt ghanton bachate hain. Unhe <code>show interfaces descriptions</code> se padho. Yaad rakho ki ek port par seedha likhi setting range ko override karti hai, isliye exceptions aasaan hain.</p>

<h3>Pehchanne wale extra Layer 2 features</h3>
<dl class="terms">
<dt>Voice VLAN</dt><dd>IP phone aur PC ek hi wall port share karte hain. Port PC ko data VLAN mein untagged aur phone ko voice VLAN mein tagged le jaata hai, taaki voice ko priority mil sake. Junos port ke liye voice VLAN <code>switch-options voip</code> configuration se seekhta hai, aksar LLDP-MED ke saath.</dd>
<dt>Q-in-Q (802.1ad)</dt><dd>Service provider ya enterprise customer frames ko ek doosre, outer tag mein lapet deta hai taaki kai customer VLANs network se bina badle guzar jaayein. Junos par yeh VLAN par <code>dot1q-tunneling</code> se enable hota hai.</dd>
<dt>MAC limiting aur static MACs</dt><dd>Port par learn hone wale addresses ki sankhya limit ho sakti hai, ya ek MAC ko port se pin kiya ja sakta hai. Yeh security tools hain aur Layer 2 security module inhe cover karta hai.</dd>
<dt>Storm control, port mirroring, LLDP</dt><dd>Broadcast storms se bachav, analysis ke liye traffic ki copy, aur neighbour discovery. Teeno standard enterprise switch features hain.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> Call centre ka 24-port access switch: ports 1 se 20 agents ke liye PC aur phone ke saath, 21 aur 22 printers, 23 spare aur 24 uplink trunk. Engineer ports 1 se 20 ke liye ek range banata hai, 21 aur 22 ke liye ek, 23 ko unconfigured chhodta hai (<code>family ethernet-switching</code> nahi, isliye switch nahi karta) aur 24 ko MGMT native ke saath trunk banata hai. Chaubees ki jagah chaar configuration blocks.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Unused ports ko default VLAN mein chhodna jahan koi bhi plug kar sakta hai. Behtar hai unhe <code>family ethernet-switching</code> ke bina chhodo ya unused "parking" VLAN mein daalo. User traffic aur management dono ke liye VLAN 1 use karna. Naming styles mix karna (Sales, SALES, sales_floor) jisse configuration mein search nahi ho paati.</p></div>
<div class="exam"><p><b>Exam trap.</b> Naam yaad rakho: voice VLAN, Q-in-Q (dot1q-tunneling), MAC limiting. Exam poochta hai ki kaunsa feature kaunsi problem solve karta hai; voice VLAN yaad se configure karne ko nahi kehta.</p></div>

<div class="scn"><h4>Copy-paste jisne 20 phones hila diye</h4><p>Ek technician ne data switch se access-port configuration ka block voice switch par copy kiya. Pasted lines ek aise VLAN ko refer karti thin jo doosre switch par tha hi nahi. Junos ne error ke saath commit refuse kar diya, isliye kuch nahi badla; technician ne VLAN banaya, phir commit kiya. Jis platform par lines ek-ek karke apply hoti hain wahan phones ek-ek karke gir jaate.</p><p><b>Lesson:</b> commit check aur all-or-nothing commit aapko aadhe apply hue changes se bachate hain.</p></div>

<div class="iv"><p class="q">"Bade campus switch ki configuration manageable kaise rakhte ho?"</p><p>Consistent naam aur IDs ke saath likha hua VLAN plan, repeated access ports ke liye interface ranges, har uplink aur har VLAN par descriptions, management alag VLAN mein, aur unused ports shut down ya parked. Har commit se pehle <code>show | compare</code> ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Configure karne se pehle VLAN IDs, names, subnets aur gateways plan karo.</li>
<li>Bade switches par galtiyan kam karne ke liye <code>interface-range</code> aur descriptions use karo.</li>
<li>Management ko apne VLAN mein aur unused ports ko user VLANs se bahar rakho.</li>
<li>Voice VLAN, Q-in-Q aur MAC limiting ko naam aur maqsad se pehchano.</li>
</ul></div>
`}};export{e as default};