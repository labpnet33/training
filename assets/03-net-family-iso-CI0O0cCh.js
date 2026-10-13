var e={id:`net-family-iso`,h:{en:`The NET, family iso and your first IS-IS configuration`,hi:`NET, family iso aur aapki pehli IS-IS configuration`},body:{en:`
<p>In IP, a router's identity is an address on an interface. In IS-IS the router has one identity for the whole box, called the <b>NET (network entity title)</b>. Think of a postal code that names the neighbourhood (the area) plus a house number that is unique in the country (the system ID). Both are written in one string, and the rule is simple: the area part must be right, and the system ID must be unique.</p>

<h3>Anatomy of a NET</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="NET structure">
<rect x="20" y="40" width="70" height="46" rx="6" fill="#fde68a"/><text x="55" y="68" text-anchor="middle" class="svg-ink" font-size="14">49</text>
<rect x="95" y="40" width="110" height="46" rx="6" fill="#bae6fd"/><text x="150" y="68" text-anchor="middle" class="svg-ink" font-size="14">0040</text>
<rect x="210" y="40" width="240" height="46" rx="6" fill="#bbf7d0"/><text x="330" y="68" text-anchor="middle" class="svg-ink" font-size="14">0100.4025.5002</text>
<rect x="455" y="40" width="70" height="46" rx="6" fill="#ddd6fe"/><text x="490" y="68" text-anchor="middle" class="svg-ink" font-size="14">00</text>
<text x="55" y="110" text-anchor="middle" class="svg-muted" font-size="12">AFI</text><text x="150" y="110" text-anchor="middle" class="svg-muted" font-size="12">area ID</text><text x="330" y="110" text-anchor="middle" class="svg-muted" font-size="12">system ID (6 bytes)</text><text x="490" y="110" text-anchor="middle" class="svg-muted" font-size="12">NSEL</text>
<text x="105" y="135" text-anchor="middle" class="svg-accent" font-size="12">area address 49.0040</text>
</svg><p class="cap">49.0040.0100.4025.5002.00 = area 49.0040, system ID 0100.4025.5002.</p></div>
<table class="cmp"><tr><th>Part</th><th>Example</th><th>Meaning</th></tr>
<tr><td>AFI</td><td>49</td><td>authority and format identifier; 49 means private addressing, like RFC 1918 for IP</td></tr>
<tr><td>Area ID</td><td>0040</td><td>together with the AFI it forms the area address 49.0040; can be 1 to 13 bytes</td></tr>
<tr><td>System ID</td><td>0100.4025.5002</td><td>6 bytes, unique in the network; Junos expects 6 bytes</td></tr>
<tr><td>NSEL</td><td>00</td><td>always 00 for a router</td></tr></table>
<p>The system ID is the identity of the router. A common convention is to pad the loopback address 10.40.255.2 to 010.040.255.002 and regroup the digits as 0100.4025.5002. The lab routers use this trick, so you can see the loopback inside the NET. The <b>area address</b> is everything before the system ID, here 49.0040. A router can have up to 3 area addresses (Junos shows <code>Maximum Areas: 3</code>), which helps during area merges.</p>

<h3>Turning IS-IS on, step by step</h3>
<p>You need three things on every IS-IS router, and one on every interface:</p>
<ol>
<li>A NET on the loopback, as <code>family iso address</code>.</li>
<li>IS-IS listed on the interfaces under <code>protocols isis</code>.</li>
<li><code>family iso</code> on each IS-IS interface unit.</li>
<li>Optionally <code>point-to-point</code> on two-router links and <code>passive</code> on the loopback.</li>
</ol>
<pre class="code"><span class="c">! R2 of the first lab: three links, one loopback, level 2 only</span>
set interfaces lo0 unit 0 family inet address 10.40.255.2/32
set interfaces lo0 unit 0 family iso address 49.0040.0100.4025.5002.00
set interfaces ge-0/0/0 unit 0 family iso
set interfaces ge-0/0/1 unit 0 family iso
set protocols isis interface ge-0/0/0.0 point-to-point
set protocols isis interface ge-0/0/1.0 point-to-point
set protocols isis interface lo0.0 passive
set protocols isis level 1 disable</pre>
<p>Notice that the IPv4 addresses on ge-0/0/0 and ge-0/0/1 are already there from the base configuration; <code>family iso</code> is added to the same units. Junos never sends IS-IS hellos on lo0, and <code>passive</code> on lo0.0 advertises the loopback prefix with metric 0 without trying to form an adjacency. If you forget to list lo0.0 under IS-IS, the loopback prefix is not advertised and BGP sessions to it would fail later.</p>
<p>Verify with the interface and adjacency views. The <code>L</code> column in the interface list is the enabled level of the circuit, and 0 means passive:</p>
<pre class="out">lab@R2&gt; show isis interface
IS-IS interface database:
Interface             L CirID Level 1 DR        Level 2 DR        L1/L2 Metric
ge-0/0/0.0            2   0x1 Disabled          Point to Point           10/10
ge-0/0/1.0            2   0x2 Disabled          Point to Point           10/10
lo0.0                 0   0x7 Disabled          Passive                    0/0
lab@R2&gt; show isis adjacency
Interface             System         L State        Hold (secs) SNPA
ge-0/0/0.0            R1             2 Up                   23
ge-0/0/1.0            R3             2 Up                   22
lab@R2&gt; show isis overview
  Hostname: R2
  Sysid: 0100.4025.5002
  Areaid: 49.0040</pre>
<p><code>show isis overview</code> shows the router's identity: system ID and area, plus which levels are enabled, preference values and timers. If your NET is not what you meant, you see it here first.</p>

<h3>The classic mistake: no family iso</h3>
<p>In the troubleshooting lab, R2 had <code>ge-0/0/1.0</code> under <code>protocols isis</code> but no <code>family iso</code> on that unit. The commit succeeded. The interface just never appeared in IS-IS:</p>
<pre class="out">lab@R2&gt; show isis interface
IS-IS interface database:
Interface             L CirID Level 1 DR        Level 2 DR        L1/L2 Metric
ge-0/0/0.0            3   0x1 Point to Point    Point to Point           10/10
lo0.0                 0   0x7 Passive           Passive                    0/0
<span class="hl">(ge-0/0/1.0 is missing)</span></pre>
<p>The fix is one line: <code>set interfaces ge-0/0/1 unit 0 family iso</code>. A quick habit: after configuring IS-IS, compare the interfaces you typed with the ones in <code>show isis interface</code>. Any missing one is a missing family or a typo in the name.</p>

<div class="eg"><p><b>Worked example.</b> Build the NET for a router with loopback 10.70.255.4 in area 49.0070. Pad the loopback to 010.070.255.004, regroup digits as 0100.7025.5004, add the area and NSEL: <code>49.0070.0100.7025.5004.00</code>. The area part 49.0070 must equal that of the other routers in the same level 1 area; the system ID part must differ on each router.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using the same system ID on two routers (copy and paste of a NET) or putting the NET on a physical interface instead of lo0. A duplicate system ID makes LSPs overwrite each other and adjacencies flap. Also forgetting that the NET needs the trailing <code>.00</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> The NSEL is always 00 on a router. The area is everything before the 6-byte system ID. The system ID must be unique; the area need not be. A question showing 49.0001.1921.6800.1001.00 expects you to read: area 49.0001, system ID 1921.6800.1001.</p></div>

<div class="scn"><h4>The router that appeared with no name</h4><p>After a hardware swap, the new router came up with a NET copied from the old one, but the old one was still online for a day while the cutover was prepared. IS-IS flapped between the two with the same system ID and LSPs fought over sequence numbers. The team gave the temporary router a new system ID, then switched back during the cutover.</p><p><b>Lesson:</b> a system ID belongs to exactly one router at a time. Treat NETs like IP addresses in an addressing spreadsheet.</p></div>

<div class="iv"><p class="q">"Explain the parts of a NET and how you choose the system ID."</p><p>AFI 49 for private use, an area ID (together the area address), a 6-byte system ID that must be unique, and NSEL 00. I derive the system ID from the loopback IP so it is predictable and unique, for example 10.40.255.2 becomes 0100.4025.5002. Then I put it on lo0 as family iso and verify with <code>show isis overview</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A NET = area address + 6-byte system ID + NSEL 00, configured on lo0 under <code>family iso</code>.</li>
<li>Each IS-IS interface needs <code>family iso</code> and a line under <code>protocols isis</code>.</li>
<li>Add lo0.0 as passive so the loopback is advertised with metric 0.</li>
<li>If an interface is missing from <code>show isis interface</code>, suspect the missing family.</li>
<li>System IDs must be unique; areas can be shared.</li>
</ul></div>
`,hi:`
<p>IP mein router ki pehchaan interface par ek address hoti hai. IS-IS mein poore box ki ek hi pehchaan hoti hai, jise <b>NET (network entity title)</b> kehte hain. Ise aise socho: postal code jo mohalla (area) batata hai plus ghar ka number jo poore desh mein unique hai (system ID). Dono ek hi string mein likhe jaate hain, aur rule seedha hai: area wala hissa sahi hona chahiye, aur system ID unique hona chahiye.</p>

<h3>NET ki anatomy</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="NET structure">
<rect x="20" y="40" width="70" height="46" rx="6" fill="#fde68a"/><text x="55" y="68" text-anchor="middle" class="svg-ink" font-size="14">49</text>
<rect x="95" y="40" width="110" height="46" rx="6" fill="#bae6fd"/><text x="150" y="68" text-anchor="middle" class="svg-ink" font-size="14">0040</text>
<rect x="210" y="40" width="240" height="46" rx="6" fill="#bbf7d0"/><text x="330" y="68" text-anchor="middle" class="svg-ink" font-size="14">0100.4025.5002</text>
<rect x="455" y="40" width="70" height="46" rx="6" fill="#ddd6fe"/><text x="490" y="68" text-anchor="middle" class="svg-ink" font-size="14">00</text>
<text x="55" y="110" text-anchor="middle" class="svg-muted" font-size="12">AFI</text><text x="150" y="110" text-anchor="middle" class="svg-muted" font-size="12">area ID</text><text x="330" y="110" text-anchor="middle" class="svg-muted" font-size="12">system ID (6 bytes)</text><text x="490" y="110" text-anchor="middle" class="svg-muted" font-size="12">NSEL</text>
<text x="105" y="135" text-anchor="middle" class="svg-accent" font-size="12">area address 49.0040</text>
</svg><p class="cap">49.0040.0100.4025.5002.00 = area 49.0040, system ID 0100.4025.5002.</p></div>
<table class="cmp"><tr><th>Hissa</th><th>Example</th><th>Matlab</th></tr>
<tr><td>AFI</td><td>49</td><td>authority and format identifier; 49 ka matlab private addressing, jaise IP ke liye RFC 1918</td></tr>
<tr><td>Area ID</td><td>0040</td><td>AFI ke saath mil kar area address 49.0040 banta hai; 1 se 13 bytes ho sakta hai</td></tr>
<tr><td>System ID</td><td>0100.4025.5002</td><td>6 bytes, network mein unique; Junos 6 bytes expect karta hai</td></tr>
<tr><td>NSEL</td><td>00</td><td>router ke liye hamesha 00</td></tr></table>
<p>System ID router ki pehchaan hai. Aam convention hai loopback address 10.40.255.2 ko 010.040.255.002 tak pad karke digits ko 0100.4025.5002 mein regroup karna. Lab routers yahi trick use karte hain, isliye NET ke andar loopback dikhta hai. <b>Area address</b> system ID se pehle ka sab kuch hai, yahan 49.0040. Ek router ke up to 3 area addresses ho sakte hain (Junos <code>Maximum Areas: 3</code> dikhata hai), jo area merge ke dauran kaam aata hai.</p>

<h3>IS-IS ko step by step on karna</h3>
<p>Har IS-IS router par teen cheezein chahiye, aur har interface par ek:</p>
<ol>
<li>Loopback par <code>family iso address</code> ke roop mein NET.</li>
<li><code>protocols isis</code> ke neeche interfaces mein IS-IS listed.</li>
<li>Har IS-IS interface unit par <code>family iso</code>.</li>
<li>Optional: do-router links par <code>point-to-point</code> aur loopback par <code>passive</code>.</li>
</ol>
<pre class="code"><span class="c">! Pehle lab ka R2: teen links, ek loopback, sirf level 2</span>
set interfaces lo0 unit 0 family inet address 10.40.255.2/32
set interfaces lo0 unit 0 family iso address 49.0040.0100.4025.5002.00
set interfaces ge-0/0/0 unit 0 family iso
set interfaces ge-0/0/1 unit 0 family iso
set protocols isis interface ge-0/0/0.0 point-to-point
set protocols isis interface ge-0/0/1.0 point-to-point
set protocols isis interface lo0.0 passive
set protocols isis level 1 disable</pre>
<p>Dhyan do ki ge-0/0/0 aur ge-0/0/1 par IPv4 addresses base configuration se pehle se hain; <code>family iso</code> usi unit mein jodte hain. Junos lo0 par IS-IS hellos kabhi nahi bhejta, aur lo0.0 par <code>passive</code> adjacency banane ki koshish kiye bina loopback prefix ko metric 0 ke saath advertise karta hai. lo0.0 ko IS-IS ke neeche list karna bhool gaye to loopback prefix advertise nahi hota aur baad mein uske BGP sessions fail honge.</p>
<p>Interface aur adjacency views se verify karo. Interface list ka <code>L</code> column circuit ka enabled level hai, aur 0 ka matlab passive:</p>
<pre class="out">lab@R2&gt; show isis interface
IS-IS interface database:
Interface             L CirID Level 1 DR        Level 2 DR        L1/L2 Metric
ge-0/0/0.0            2   0x1 Disabled          Point to Point           10/10
ge-0/0/1.0            2   0x2 Disabled          Point to Point           10/10
lo0.0                 0   0x7 Disabled          Passive                    0/0
lab@R2&gt; show isis adjacency
Interface             System         L State        Hold (secs) SNPA
ge-0/0/0.0            R1             2 Up                   23
ge-0/0/1.0            R3             2 Up                   22
lab@R2&gt; show isis overview
  Hostname: R2
  Sysid: 0100.4025.5002
  Areaid: 49.0040</pre>
<p><code>show isis overview</code> router ki identity dikhata hai: system ID aur area, saath mein kaun se levels enabled hain, preference values aur timers. Aapka NET wo nahi hai jo aap chahte the to yahin pehle dikhta hai.</p>

<h3>Classic galti: family iso nahi</h3>
<p>Troubleshooting lab mein R2 par <code>ge-0/0/1.0</code> <code>protocols isis</code> ke neeche tha par us unit par <code>family iso</code> nahi tha. Commit ho gaya. Interface IS-IS mein kabhi dikha hi nahi:</p>
<pre class="out">lab@R2&gt; show isis interface
IS-IS interface database:
Interface             L CirID Level 1 DR        Level 2 DR        L1/L2 Metric
ge-0/0/0.0            3   0x1 Point to Point    Point to Point           10/10
lo0.0                 0   0x7 Passive           Passive                    0/0
<span class="hl">(ge-0/0/1.0 missing hai)</span></pre>
<p>Fix ek line hai: <code>set interfaces ge-0/0/1 unit 0 family iso</code>. Ek achhi aadat: IS-IS configure karne ke baad jo interfaces type kiye unhe <code>show isis interface</code> se compare karo. Jo missing ho wo missing family ya naam mein typo hai.</p>

<div class="eg"><p><b>Worked example.</b> Loopback 10.70.255.4 aur area 49.0070 wale router ka NET banao. Loopback ko 010.070.255.004 tak pad karo, digits ko 0100.7025.5004 mein regroup karo, area aur NSEL jodo: <code>49.0070.0100.7025.5004.00</code>. Area part 49.0070 same level 1 area ke baaki routers jaisa hona chahiye; system ID part har router par alag.</p></div>

<div class="warn"><p><b>Common mistake.</b> Do routers par same system ID (NET copy-paste) ya NET ko lo0 ki jagah physical interface par rakhna. Duplicate system ID se LSPs ek doosre ko overwrite karte hain aur adjacencies flap karti hain. Saath hi NET ke aakhir ka <code>.00</code> bhoolna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Router par NSEL hamesha 00 hai. Area 6-byte system ID se pehle ka sab kuch hai. System ID unique hona chahiye; area share ho sakta hai. 49.0001.1921.6800.1001.00 dikhane wala sawal padhwana chahta hai: area 49.0001, system ID 1921.6800.1001.</p></div>

<div class="scn"><h4>Router jo bina naam ke aaya</h4><p>Hardware swap ke baad naya router purane se copy kiya hua NET leke aaya, par purana router cutover ki taiyari ke liye ek din aur online tha. IS-IS dono ke beech same system ID ke saath flap karta raha aur LSPs sequence numbers par ladte rahe. Team ne temporary router ko naya system ID diya, aur cutover ke waqt wapas badla.</p><p><b>Lesson:</b> system ID ek samay mein sirf ek router ka hota hai. NETs ko addressing spreadsheet mein IP addresses ki tarah treat karo.</p></div>

<div class="iv"><p class="q">"NET ke hisse samjhao aur system ID kaise chunte ho."</p><p>Private use ke liye AFI 49, ek area ID (dono milke area address), 6-byte system ID jo unique ho, aur NSEL 00. System ID main loopback IP se nikalta hoon taaki predictable aur unique ho, jaise 10.40.255.2 se 0100.4025.5002. Phir use lo0 par family iso ke roop mein lagata hoon aur <code>show isis overview</code> se verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NET = area address + 6-byte system ID + NSEL 00, lo0 par <code>family iso</code> ke neeche configure hota hai.</li>
<li>Har IS-IS interface ko <code>family iso</code> aur <code>protocols isis</code> mein ek line chahiye.</li>
<li>lo0.0 ko passive jodo taaki loopback metric 0 ke saath advertise ho.</li>
<li>Interface <code>show isis interface</code> mein missing ho to missing family ka shak karo.</li>
<li>System IDs unique hon; areas share ho sakte hain.</li>
</ul></div>
`}};export{e as default};