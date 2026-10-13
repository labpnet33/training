var e={id:`snmp-from-zero`,h:{en:`SNMP from zero: managers, agents, MIBs, OIDs and the get, walk and set operations`,hi:`SNMP zero se: manager, agent, MIB, OID aur get, walk, set operations`},body:{en:`
<h3>What you will learn</h3>
<p>SNMP, the Simple Network Management Protocol, is the oldest and most widely used way to read numbers from network devices. In this module you learn how it works, how to configure version 2c and version 3 on a router, how to receive traps, and how to troubleshoot it. This first chapter builds the vocabulary: manager, agent, MIB, OID and the basic operations.</p>
<p><b>Prerequisites:</b> module obs-start (the four signals, the NMS, polling versus pushing) and basic router configuration. You should know that the NMS is 10.1.50.100 and that the Godavari routers have loopbacks 10.255.0.1, .2 and .3.</p>

<h3>An analogy: a library catalogue</h3>
<p>Imagine a huge library. Every book has a catalogue number such as 1.3.6.1.2.1.1.5. The librarian does not keep a conversation with you; you hand over a slip with a number, and she hands back whatever is on that shelf. The <b>catalogue book</b> that explains what each number means is the MIB. The <b>number</b> is the OID. You, with your slip, are the manager. The librarian is the agent.</p>

<h3>The parts</h3>
<dl class="terms">
<dt>Manager</dt><dd>The program that asks questions. In our labs it is the NMS at 10.1.50.100, using the commands snmpget, snmpwalk and snmpset.</dd>
<dt>Agent</dt><dd>The software inside the router or switch that answers. It listens on UDP 161.</dd>
<dt>MIB (Management Information Base)</dt><dd>A text file that names and describes the objects a device can report. Think of it as a dictionary: it says that a certain number means "the interface status". The MIB is not data; it is the meaning of the data.</dd>
<dt>OID (Object Identifier)</dt><dd>The dotted number that points to one object in a tree. It is the address of the value.</dd>
<dt>Managed object / variable</dt><dd>One item, such as the device name or the state of an interface.</dd>
<dt>Instance</dt><dd>A scalar object ends with <code>.0</code> (there is only one device name). A table object ends with an index: interface number 2 is <code>.2</code>.</dd>
</dl>

<h3>The OID tree</h3>
<p>OIDs form a tree, like folders. The path 1.3.6.1.2.1 is called mib-2 and holds the standard objects. A few you will use all the time:</p>
<table class="cmp"><tr><th>Name</th><th>OID</th><th>Meaning</th></tr>
<tr><td>sysDescr</td><td>1.3.6.1.2.1.1.1.0</td><td>description of the device</td></tr>
<tr><td>sysUpTime</td><td>1.3.6.1.2.1.1.3.0</td><td>time since the agent restarted</td></tr>
<tr><td>sysName</td><td>1.3.6.1.2.1.1.5.0</td><td>hostname</td></tr>
<tr><td>sysLocation</td><td>1.3.6.1.2.1.1.6.0</td><td>where the device is</td></tr>
<tr><td>ifDescr.N</td><td>1.3.6.1.2.1.2.2.1.2.N</td><td>name of interface N</td></tr>
<tr><td>ifOperStatus.N</td><td>1.3.6.1.2.1.2.2.1.8.N</td><td>up(1) or down(2)</td></tr>
<tr><td>ifInOctets.N</td><td>1.3.6.1.2.1.2.2.1.10.N</td><td>bytes received (counter)</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="OID tree">
<rect x="270" y="10" width="100" height="30" rx="6" fill="#e2e8f0"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="12">1.3.6.1.2.1 mib-2</text>
<rect x="110" y="80" width="130" height="30" rx="6" fill="#bae6fd"/><text x="175" y="100" text-anchor="middle" class="svg-ink" font-size="12">.1 system</text>
<rect x="400" y="80" width="130" height="30" rx="6" fill="#bbf7d0"/><text x="465" y="100" text-anchor="middle" class="svg-ink" font-size="12">.2 interfaces</text>
<rect x="20" y="160" width="100" height="30" rx="6" fill="#ddd6fe"/><text x="70" y="180" text-anchor="middle" class="svg-ink" font-size="12">.5 sysName</text>
<rect x="135" y="160" width="100" height="30" rx="6" fill="#ddd6fe"/><text x="185" y="180" text-anchor="middle" class="svg-ink" font-size="12">.3 sysUpTime</text>
<rect x="350" y="160" width="130" height="30" rx="6" fill="#fde68a"/><text x="415" y="180" text-anchor="middle" class="svg-ink" font-size="12">.2.1.8 ifOperStatus</text>
<rect x="495" y="160" width="130" height="30" rx="6" fill="#fde68a"/><text x="560" y="180" text-anchor="middle" class="svg-ink" font-size="12">.2.1.10 ifInOctets</text>
<line x1="300" y1="40" x2="190" y2="80" stroke="#64748b" stroke-width="2"/><line x1="340" y1="40" x2="450" y2="80" stroke="#64748b" stroke-width="2"/>
<line x1="150" y1="110" x2="75" y2="160" stroke="#64748b" stroke-width="2"/><line x1="190" y1="110" x2="185" y2="160" stroke="#64748b" stroke-width="2"/>
<line x1="450" y1="110" x2="415" y2="160" stroke="#64748b" stroke-width="2"/><line x1="480" y1="110" x2="560" y2="160" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The tree under mib-2: reading a value means following the numbers down the branches.</p></div>

<h3>The operations</h3>
<ul>
<li><b>Get:</b> read one or more named objects. "What is sysName.0?"</li>
<li><b>GetNext:</b> give me the object that comes after this one in the tree. It lets you explore without knowing the names.</li>
<li><b>Walk:</b> a tool that repeats GetNext until the end of a branch, so you can list a whole table. (Version 2c adds GetBulk, which fetches many rows in one request.)</li>
<li><b>Set:</b> write a value. It changes the device, so it needs a read-write credential and is rarely used for monitoring.</li>
<li><b>Response:</b> the agent's answer to any request.</li>
<li><b>Trap and Inform:</b> a message the agent starts, sent to the manager on UDP 162. Chapter 2 covers them.</li>
</ul>
<p>Requests go to UDP 161. Notifications go to UDP 162. The two ports are easy to swap in an exam; remember "161 asks, 162 tells".</p>

<h3>Walkthrough: first reads from the NMS</h3>
<p>With the lab configuration from obs-start in place (community GF-RO, ACL 20 permitting the NMS), try the three read operations:</p>
<pre class="out">NMS&gt; snmpget -c GF-RO 10.255.0.1 sysName.0
<span class="hl">SNMPv2-MIB::sysName.0 = STRING: HYD-CORE-R1</span>

NMS&gt; snmpget -c GF-RO 10.255.0.1 ifOperStatus.2
IF-MIB::ifOperStatus.2 = INTEGER: up(1)

NMS&gt; snmpwalk -c GF-RO 10.255.0.1 system
SNMPv2-MIB::sysDescr.0 = STRING: NK-OS Software, learning simulator
SNMPv2-MIB::sysObjectID.0 = OID: 1.3.6.1.4.1.99999.1.1
DISMAN-EVENT-MIB::sysUpTime.0 = Timeticks: (412300) 1:08:43.00
SNMPv2-MIB::sysContact.0 = STRING:
SNMPv2-MIB::sysName.0 = STRING: HYD-CORE-R1
SNMPv2-MIB::sysLocation.0 = STRING: Hyderabad-Rack-A1</pre>
<p>Read the format: the MIB name, two colons, the object name with its instance, then the data type (STRING, INTEGER, Timeticks, Counter32) and the value. Timeticks are hundredths of a second, so 412300 ticks is 4123 seconds, about 1 hour 8 minutes. A walk of <code>interfaces</code> would list ifDescr, ifOperStatus and the octet counters for every interface.</p>

<div class="eg"><p><b>Worked example.</b> You want to know if Gi0/1 on R-KCH is up. Step 1: find its index. A walk of ifDescr shows ifDescr.2 = GigabitEthernet0/1. Step 2: get ifOperStatus.2. If it says down(2), the port is down. If you had asked for ifOperStatus.9 on a router with only 4 interfaces you would get "No Such Object available on this agent at this OID".</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Forgetting the instance: sysName alone is not a value, sysName.0 is. (2) Assuming interface numbers are the same on all devices; ifIndex differs per device and can change after a reload on some platforms. (3) Reading a counter once and calling it a rate. (4) Using snmpset on production without thinking.</p></div>
<div class="exam"><p><b>Exam trap.</b> The MIB describes objects; it does not hold values. SNMP is carried over UDP, not TCP. A walk is not a protocol operation; it is a client behaviour built from repeated GetNext (or GetBulk) requests.</p></div>

<div class="scn"><h4>The interface index that moved</h4><p>After a software upgrade, Kochi's monitoring graphed the wrong port. The team had hard-coded ifIndex 2 as the WAN link, but the upgrade changed the numbering and index 2 became a different interface. Priya walked ifDescr, found the new index for GigabitEthernet0/1, and the graph returned to normal. Later the team switched to selecting interfaces by name.</p><p><b>Lesson:</b> walk first, then poll by index, and recheck after changes.</p></div>

<div class="iv"><p class="q">"What is the difference between a MIB and an OID?"</p><p>Strong answer: the OID is the numeric address of one object in the tree, such as 1.3.6.1.2.1.1.5.0. The MIB is the file that gives names, types and meanings to those numbers, so tools can show sysName.0 instead of digits. The MIB holds no live data; the agent does.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A manager (the NMS) asks; an agent on the device answers on UDP 161; notifications go to UDP 162.</li>
<li>An OID is the dotted address of an object; a MIB explains what the numbers mean.</li>
<li>Scalars end in .0; table objects end in an index such as the interface number.</li>
<li>Get reads, GetNext steps through the tree, a walk repeats GetNext, and set writes.</li>
<li>Remember sysName 1.3.6.1.2.1.1.5.0, ifOperStatus 1.3.6.1.2.1.2.2.1.8.N and ifInOctets 1.3.6.1.2.1.2.2.1.10.N.</li>
</ul></div>
`,hi:`
<h3>Is chapter mein aap kya seekhoge</h3>
<p>SNMP, Simple Network Management Protocol, network devices se numbers padhne ka sabse purana aur sabse zyada use hone wala tareeka hai. Is module mein aap seekhoge ki yeh kaise kaam karta hai, router par version 2c aur version 3 kaise configure karte hain, traps kaise receive karte hain, aur troubleshoot kaise karte hain. Yeh pehla chapter vocabulary banata hai: manager, agent, MIB, OID aur basic operations.</p>
<p><b>Prerequisites:</b> module obs-start (chaar signals, NMS, polling versus pushing) aur basic router configuration. Aapko pata hona chahiye ki NMS 10.1.50.100 hai aur Godavari routers ke loopbacks 10.255.0.1, .2 aur .3 hain.</p>

<h3>Ek analogy: library ka catalogue</h3>
<p>Ek bahut badi library socho. Har kitab ka catalogue number hota hai jaise 1.3.6.1.2.1.1.5. Librarian aapse baatein nahi karti; aap ek parchi par number dete ho, aur woh us shelf par jo rakha hai woh wapas deti hai. Jo <b>catalogue book</b> batati hai ki har number ka matlab kya hai woh MIB hai. <b>Number</b> OID hai. Aap, parchi ke saath, manager ho. Librarian agent hai.</p>

<h3>Parts</h3>
<dl class="terms">
<dt>Manager</dt><dd>Woh program jo sawaal poochta hai. Hamare labs mein yeh 10.1.50.100 par NMS hai, jo snmpget, snmpwalk aur snmpset commands use karta hai.</dd>
<dt>Agent</dt><dd>Router ya switch ke andar ka software jo jawab deta hai. Yeh UDP 161 par listen karta hai.</dd>
<dt>MIB (Management Information Base)</dt><dd>Ek text file jo un objects ke naam aur description deti hai jo device report kar sakta hai. Ise dictionary samjho: yeh batati hai ki ek number ka matlab "interface status" hai. MIB data nahi hai; data ka matlab hai.</dd>
<dt>OID (Object Identifier)</dt><dd>Dotted number jo tree mein ek object ki taraf point karta hai. Yeh value ka address hai.</dd>
<dt>Managed object / variable</dt><dd>Ek item, jaise device ka naam ya ek interface ki state.</dd>
<dt>Instance</dt><dd>Scalar object <code>.0</code> par khatam hota hai (device name ek hi hota hai). Table object index par khatam hota hai: interface number 2 matlab <code>.2</code>.</dd>
</dl>

<h3>OID tree</h3>
<p>OIDs ek tree banate hain, folders ki tarah. 1.3.6.1.2.1 path ko mib-2 kehte hain aur ismein standard objects hote hain. Kuch jo aap hamesha use karoge:</p>
<table class="cmp"><tr><th>Name</th><th>OID</th><th>Matlab</th></tr>
<tr><td>sysDescr</td><td>1.3.6.1.2.1.1.1.0</td><td>device ka description</td></tr>
<tr><td>sysUpTime</td><td>1.3.6.1.2.1.1.3.0</td><td>agent restart ke baad ka time</td></tr>
<tr><td>sysName</td><td>1.3.6.1.2.1.1.5.0</td><td>hostname</td></tr>
<tr><td>sysLocation</td><td>1.3.6.1.2.1.1.6.0</td><td>device kahan hai</td></tr>
<tr><td>ifDescr.N</td><td>1.3.6.1.2.1.2.2.1.2.N</td><td>interface N ka naam</td></tr>
<tr><td>ifOperStatus.N</td><td>1.3.6.1.2.1.2.2.1.8.N</td><td>up(1) ya down(2)</td></tr>
<tr><td>ifInOctets.N</td><td>1.3.6.1.2.1.2.2.1.10.N</td><td>received bytes (counter)</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="OID tree">
<rect x="270" y="10" width="100" height="30" rx="6" fill="#e2e8f0"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="12">1.3.6.1.2.1 mib-2</text>
<rect x="110" y="80" width="130" height="30" rx="6" fill="#bae6fd"/><text x="175" y="100" text-anchor="middle" class="svg-ink" font-size="12">.1 system</text>
<rect x="400" y="80" width="130" height="30" rx="6" fill="#bbf7d0"/><text x="465" y="100" text-anchor="middle" class="svg-ink" font-size="12">.2 interfaces</text>
<rect x="20" y="160" width="100" height="30" rx="6" fill="#ddd6fe"/><text x="70" y="180" text-anchor="middle" class="svg-ink" font-size="12">.5 sysName</text>
<rect x="135" y="160" width="100" height="30" rx="6" fill="#ddd6fe"/><text x="185" y="180" text-anchor="middle" class="svg-ink" font-size="12">.3 sysUpTime</text>
<rect x="350" y="160" width="130" height="30" rx="6" fill="#fde68a"/><text x="415" y="180" text-anchor="middle" class="svg-ink" font-size="12">.2.1.8 ifOperStatus</text>
<rect x="495" y="160" width="130" height="30" rx="6" fill="#fde68a"/><text x="560" y="180" text-anchor="middle" class="svg-ink" font-size="12">.2.1.10 ifInOctets</text>
<line x1="300" y1="40" x2="190" y2="80" stroke="#64748b" stroke-width="2"/><line x1="340" y1="40" x2="450" y2="80" stroke="#64748b" stroke-width="2"/>
<line x1="150" y1="110" x2="75" y2="160" stroke="#64748b" stroke-width="2"/><line x1="190" y1="110" x2="185" y2="160" stroke="#64748b" stroke-width="2"/>
<line x1="450" y1="110" x2="415" y2="160" stroke="#64748b" stroke-width="2"/><line x1="480" y1="110" x2="560" y2="160" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">mib-2 ke neeche ka tree: value padhna matlab numbers ko branches ke neeche follow karna.</p></div>

<h3>Operations</h3>
<ul>
<li><b>Get:</b> ek ya zyada named objects padhna. "sysName.0 kya hai?"</li>
<li><b>GetNext:</b> tree mein is object ke baad wala object do. Isse naam jaane bina explore kar sakte ho.</li>
<li><b>Walk:</b> ek tool jo branch ke end tak GetNext repeat karta hai, taaki poori table list ho. (Version 2c GetBulk jodta hai, jo ek request mein kai rows laata hai.)</li>
<li><b>Set:</b> value likhna. Yeh device badalta hai, isliye read-write credential chahiye aur monitoring mein kam use hota hai.</li>
<li><b>Response:</b> kisi bhi request ka agent ka jawab.</li>
<li><b>Trap aur Inform:</b> agent ka shuru kiya message, manager ke UDP 162 par jaata hai. Chapter 2 inhe cover karta hai.</li>
</ul>
<p>Requests UDP 161 par jaati hain. Notifications UDP 162 par. Exam mein dono ports aasani se ulat jaate hain; yaad rakho "161 poochta hai, 162 batata hai".</p>

<h3>Walkthrough: NMS se pehle reads</h3>
<p>obs-start ki lab configuration ke saath (community GF-RO, ACL 20 NMS ko permit karti hai) teen read operations try karo:</p>
<pre class="out">NMS&gt; snmpget -c GF-RO 10.255.0.1 sysName.0
<span class="hl">SNMPv2-MIB::sysName.0 = STRING: HYD-CORE-R1</span>

NMS&gt; snmpget -c GF-RO 10.255.0.1 ifOperStatus.2
IF-MIB::ifOperStatus.2 = INTEGER: up(1)

NMS&gt; snmpwalk -c GF-RO 10.255.0.1 system
SNMPv2-MIB::sysDescr.0 = STRING: NK-OS Software, learning simulator
SNMPv2-MIB::sysObjectID.0 = OID: 1.3.6.1.4.1.99999.1.1
DISMAN-EVENT-MIB::sysUpTime.0 = Timeticks: (412300) 1:08:43.00
SNMPv2-MIB::sysContact.0 = STRING:
SNMPv2-MIB::sysName.0 = STRING: HYD-CORE-R1
SNMPv2-MIB::sysLocation.0 = STRING: Hyderabad-Rack-A1</pre>
<p>Format padho: MIB ka naam, do colons, instance ke saath object ka naam, phir data type (STRING, INTEGER, Timeticks, Counter32) aur value. Timeticks second ke sau-vein hisse hain, to 412300 ticks yaani 4123 seconds, lagbhag 1 ghanta 8 minute. <code>interfaces</code> ka walk har interface ke liye ifDescr, ifOperStatus aur octet counters list karega.</p>

<div class="eg"><p><b>Worked example.</b> Aap jaanna chahte ho ki R-KCH ka Gi0/1 up hai ya nahi. Step 1: uska index dhoondho. ifDescr ka walk dikhata hai ifDescr.2 = GigabitEthernet0/1. Step 2: ifOperStatus.2 get karo. Agar down(2) kehta hai, to port down hai. Agar aap sirf 4 interfaces wale router par ifOperStatus.9 maangte to "No Such Object available on this agent at this OID" milta.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Instance bhool jaana: sysName akela value nahi hai, sysName.0 hai. (2) Maanna ki interface numbers saare devices par same hote hain; ifIndex device ke hisaab se alag hota hai aur kuch platforms par reload ke baad badal sakta hai. (3) Counter ek baar padh kar use rate kehna. (4) Production par bina socche snmpset use karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> MIB objects describe karta hai; values nahi rakhta. SNMP UDP par chalta hai, TCP par nahi. Walk protocol operation nahi hai; yeh client ka behaviour hai jo baar baar GetNext (ya GetBulk) requests se banta hai.</p></div>

<div class="scn"><h4>Woh interface index jo khisak gaya</h4><p>Software upgrade ke baad Kochi ki monitoring ne galat port graph kiya. Team ne ifIndex 2 ko WAN link ke roop mein hard-code kar rakha tha, lekin upgrade ne numbering badal di aur index 2 koi aur interface ban gaya. Priya ne ifDescr walk kiya, GigabitEthernet0/1 ka naya index dhoondha, aur graph normal ho gaya. Baad mein team ne interfaces ko naam se select karna shuru kiya.</p><p><b>Seekh:</b> pehle walk karo, phir index se poll karo, aur changes ke baad dobara check karo.</p></div>

<div class="iv"><p class="q">"MIB aur OID mein kya difference hai?"</p><p>Strong answer: OID tree mein ek object ka numeric address hai, jaise 1.3.6.1.2.1.1.5.0. MIB woh file hai jo in numbers ko naam, type aur matlab deti hai, taaki tools digits ki jagah sysName.0 dikha sakein. MIB mein live data nahi hota; woh agent ke paas hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Manager (NMS) poochta hai; device ka agent UDP 161 par jawab deta hai; notifications UDP 162 par jaate hain.</li>
<li>OID object ka dotted address hai; MIB samjhata hai ki numbers ka matlab kya hai.</li>
<li>Scalars .0 par khatam hote hain; table objects interface number jaise index par.</li>
<li>Get padhta hai, GetNext tree mein aage badhta hai, walk GetNext repeat karta hai, aur set likhta hai.</li>
<li>Yaad rakho sysName 1.3.6.1.2.1.1.5.0, ifOperStatus 1.3.6.1.2.1.2.2.1.8.N aur ifInOctets 1.3.6.1.2.1.2.2.1.10.N.</li>
</ul></div>
`}};export{e as default};