var e={id:`reading-output`,h:{en:`Reading Junos output like an exhibit`,hi:`Junos output ko exhibit ki tarah padhna`},body:{en:`
<p>The exam hands you an exhibit and a question. The skill is not typing commands but <b>reading</b> them fast: which columns matter, which word gives the answer. This chapter walks through five real outputs captured from the simulator in this course and shows how to read each in a calm, repeatable order.</p>

<h3>A reading routine</h3>
<ol>
<li><b>Identify the command.</b> It tells you the layer: VLANs, MAC table, spanning tree or routing.</li>
<li><b>Read the header line.</b> Counts like "2 entries" or "0 destinations" often answer the question.</li>
<li><b>Scan the state columns.</b> Up and down, FWD and BLK, active asterisk, flags.</li>
<li><b>Compare with the symptom.</b> Does anything look missing or different from the intended design?</li>
</ol>

<h3>Output 1: show vlans</h3>
<p>Captured on the lab switch CORE after VLANs SALES (10) and ENG (20) were bound to their routed interfaces:</p>
<pre>lab@CORE&gt; show vlans

Routing instance        VLAN name             Tag          Interfaces
default-switch          default               1            
                                                           ge-0/0/1.0

default-switch          ENG                   20           
                                                           (l3-interface irb.20)

default-switch          SALES                 10           
                                                           (l3-interface irb.10)</pre>
<p>Read it: each VLAN has a name and a tag. The line in brackets shows the <b>l3-interface</b>, the IRB that routes the VLAN. Notice that ENG and SALES list <i>no physical interface</i>. A VLAN with no member port is a clue: no host or trunk carries it yet. Notice also that ge-0/0/1.0 still sits in the default VLAN because it has not been given VLAN members as an access or trunk port yet in this state.</p>

<h3>Output 2: show ethernet-switching table</h3>
<pre>lab@ACC&gt; show ethernet-switching table

Ethernet switching table : 2 entries, 2 learned
Routing instance : default-switch
   Vlan                MAC                 MAC         Age    Logical      NH     RTR
   name                address             flags              interface    Index  ID
   SALES               00:50:7f:06:6d:01   D           -      ge-0/0/1.0   0      0
   ENG                 00:50:80:06:6e:01   D           -      ge-0/0/2.0   0      0</pre>
<p>Read it: two dynamic (D) addresses were learned. SALES hosts live behind ge-0/0/1.0 and ENG hosts behind ge-0/0/2.0. If a host is silent, its MAC does not appear; if it appears on an unexpected port, you have found a patching or loop problem.</p>

<h3>Output 3: show interfaces terse irb</h3>
<pre>lab@CORE&gt; show interfaces terse irb
Interface               Admin Link Proto    Local                 Remote
irb                     up    up
irb.10                  up    down inet     10.10.10.1/24
irb.20                  up    down inet     10.10.20.1/24</pre>
<p>Read it: the addresses are correct and the admin state is up, but the <b>Link is down</b>. An IRB stays down while its VLAN has no up member port. This is the Layer 2 fault showing up as a Layer 3 symptom. The cure is not an IP change; it is bringing a port or trunk for that VLAN up.</p>

<h3>Output 4: show route</h3>
<pre>lab@CORE&gt; show route
inet.0: 0 destinations, 0 routes (0 active, 0 holddown, 0 hidden)</pre>
<p>Read it: no destinations at all, because the IRB links are down so no Direct or Local routes exist. Once a VLAN comes up, you would see lines such as 10.10.10.0/24 marked Direct and 10.10.10.1/32 marked Local. An asterisk marks the active route.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Reading order">
<rect x="20" y="70" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="85" y="100" text-anchor="middle" class="svg-ink" font-size="13">show vlans</text>
<rect x="175" y="70" width="130" height="50" rx="8" fill="#bae6fd"/><text x="240" y="100" text-anchor="middle" class="svg-ink" font-size="13">MAC table</text>
<rect x="330" y="70" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="395" y="100" text-anchor="middle" class="svg-ink" font-size="13">irb terse</text>
<rect x="485" y="70" width="130" height="50" rx="8" fill="#fde68a"/><text x="550" y="100" text-anchor="middle" class="svg-ink" font-size="13">show route</text>
<line x1="150" y1="95" x2="175" y2="95" stroke="#64748b" stroke-width="2"/><line x1="305" y1="95" x2="330" y2="95" stroke="#64748b" stroke-width="2"/><line x1="460" y1="95" x2="485" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="13">Bottom up: Layer 2 first, then the interface, then routing</text>
</svg><p class="cap">The same order works for almost every enterprise switching fault.</p></div>

<h3>Output 5: show spanning-tree interface</h3>
<pre>lab@FLOOR2&gt; show spanning-tree interface

Spanning tree interface parameters for instance 0

Interface   Port ID  Designated  Designated         Port  State  Role
                     port ID     bridge ID          Cost
ge-0/0/0    128:1    128:1       32768.525400a77100 20000 FWD    DESG
ge-0/0/1    128:2    128:2       32768.525400a77100 20000 FWD    DESG
ge-0/0/2    128:3    128:3       32768.525400a77100 20000 FWD    DESG</pre>
<p>Read it: Port Cost 20000 is the default for a 1 Gbps link, State is the forwarding state, Role is DESG (designated). When the designated bridge ID equals this switch's own bridge ID and no port is a root port, this switch believes it is the root. A normal access switch shows one ROOT port and often an ALT port; seeing only DESG on an access switch is a hint to check priority and neighbours.</p>

<div class="eg"><p><b>Worked example.</b> Symptom: hosts in VLAN 20 cannot ping their gateway 10.10.20.1. Step 1: show vlans lists ENG with no member port. Step 2: irb terse shows irb.20 with Link down. Conclusion: the cause is Layer 2, not the IP address. Fix the trunk or access port first, then recheck show route for the Direct route.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Reading only the last line. Confusing Admin and Link columns. Assuming an empty table means broken when the hosts may simply be silent. Judging an output without noting which device and which routing instance it came from.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exhibit often shows <i>correct</i> configuration with a <i>down</i> state. Do not choose an answer that changes IP addressing when the state column points at a Layer 2 problem.</p></div>

<div class="scn"><h4>The gateway that was up but unreachable</h4><p>A help desk could see irb.10 configured with the right address, yet users could not reach it. The terse output showed Admin up, Link down. The trunk toward the access switch had lost VLAN 10. After the trunk members were corrected, the link came up and the Direct route appeared.</p><p><b>Lesson:</b> read both Admin and Link, and trace down to Layer 2.</p></div>

<div class="iv"><p class="q">"An IRB has the right IP address but is down. What do you check?"</p><p>I check show vlans for member interfaces, then show interfaces terse for the physical ports and trunks. An IRB needs at least one up port in its VLAN. I also confirm the VLAN is bound to the IRB with l3-interface.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read in order: command, header counts, state columns, symptom match.</li>
<li>show vlans shows members and l3-interface bindings.</li>
<li>The MAC table shows where each host was learned.</li>
<li>An IRB stays down without an up member port.</li>
<li>No Direct route means the interface is not up with an address.</li>
</ul></div>
`,hi:`
<p>Exam aapko exhibit aur question deta hai. Skill commands type karna nahi, unhe jaldi <b>padhna</b> hai: kaunse columns matter karte hain, kaunsa shabd jawab deta hai. Yeh chapter is course ke simulator se liye gaye paanch real outputs ko dikhata hai aur har ek ko shaant, doharaye jaane layak order mein padhna sikhata hai.</p>

<h3>Padhne ka routine</h3>
<ol>
<li><b>Command pehchano.</b> Woh layer batata hai: VLANs, MAC table, spanning tree ya routing.</li>
<li><b>Header line padho.</b> "2 entries" ya "0 destinations" jaise counts aksar jawab de dete hain.</li>
<li><b>State columns scan karo.</b> Up aur down, FWD aur BLK, active asterisk, flags.</li>
<li><b>Symptom se milao.</b> Kya kuch missing hai ya intended design se alag dikhta hai?</li>
</ol>

<h3>Output 1: show vlans</h3>
<p>Lab switch CORE par capture kiya gaya, jab VLANs SALES (10) aur ENG (20) apne routed interfaces se bandhe the:</p>
<pre>lab@CORE&gt; show vlans

Routing instance        VLAN name             Tag          Interfaces
default-switch          default               1            
                                                           ge-0/0/1.0

default-switch          ENG                   20           
                                                           (l3-interface irb.20)

default-switch          SALES                 10           
                                                           (l3-interface irb.10)</pre>
<p>Padho: har VLAN ka naam aur tag hai. Bracket wali line <b>l3-interface</b> dikhati hai, yaani woh IRB jo VLAN ko route karta hai. Dhyan do ki ENG aur SALES koi <i>physical interface</i> list nahi karte. Member port ke bina VLAN ek clue hai: abhi koi host ya trunk use carry nahi kar raha. Yeh bhi dekho ki ge-0/0/1.0 abhi default VLAN mein hai kyunki is state mein use access ya trunk port ke roop mein VLAN members nahi mile.</p>

<h3>Output 2: show ethernet-switching table</h3>
<pre>lab@ACC&gt; show ethernet-switching table

Ethernet switching table : 2 entries, 2 learned
Routing instance : default-switch
   Vlan                MAC                 MAC         Age    Logical      NH     RTR
   name                address             flags              interface    Index  ID
   SALES               00:50:7f:06:6d:01   D           -      ge-0/0/1.0   0      0
   ENG                 00:50:80:06:6e:01   D           -      ge-0/0/2.0   0      0</pre>
<p>Padho: do dynamic (D) addresses seekhe gaye. SALES hosts ge-0/0/1.0 ke peeche hain aur ENG hosts ge-0/0/2.0 ke peeche. Agar host chup hai to uska MAC nahi dikhta; agar anapekshit port par dikhe to patching ya loop ki samasya mili.</p>

<h3>Output 3: show interfaces terse irb</h3>
<pre>lab@CORE&gt; show interfaces terse irb
Interface               Admin Link Proto    Local                 Remote
irb                     up    up
irb.10                  up    down inet     10.10.10.1/24
irb.20                  up    down inet     10.10.20.1/24</pre>
<p>Padho: addresses sahi hain aur admin state up hai, lekin <b>Link down</b> hai. IRB tab tak down rehta hai jab tak uske VLAN mein koi up member port na ho. Yeh Layer 2 fault hai jo Layer 3 symptom ke roop mein dikh raha hai. Ilaaj IP badalna nahi; us VLAN ke liye port ya trunk up karna hai.</p>

<h3>Output 4: show route</h3>
<pre>lab@CORE&gt; show route
inet.0: 0 destinations, 0 routes (0 active, 0 holddown, 0 hidden)</pre>
<p>Padho: koi destination nahi, kyunki IRB links down hain isliye Direct ya Local routes nahi hain. VLAN up hone par aapko 10.10.10.0/24 Direct aur 10.10.10.1/32 Local jaisi lines dikhengi. Asterisk active route ko mark karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Reading order">
<rect x="20" y="70" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="85" y="100" text-anchor="middle" class="svg-ink" font-size="13">show vlans</text>
<rect x="175" y="70" width="130" height="50" rx="8" fill="#bae6fd"/><text x="240" y="100" text-anchor="middle" class="svg-ink" font-size="13">MAC table</text>
<rect x="330" y="70" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="395" y="100" text-anchor="middle" class="svg-ink" font-size="13">irb terse</text>
<rect x="485" y="70" width="130" height="50" rx="8" fill="#fde68a"/><text x="550" y="100" text-anchor="middle" class="svg-ink" font-size="13">show route</text>
<line x1="150" y1="95" x2="175" y2="95" stroke="#64748b" stroke-width="2"/><line x1="305" y1="95" x2="330" y2="95" stroke="#64748b" stroke-width="2"/><line x1="460" y1="95" x2="485" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="13">Neeche se upar: pehle Layer 2, phir interface, phir routing</text>
</svg><p class="cap">Lagbhag har enterprise switching fault ke liye yahi order kaam karta hai.</p></div>

<h3>Output 5: show spanning-tree interface</h3>
<pre>lab@FLOOR2&gt; show spanning-tree interface

Spanning tree interface parameters for instance 0

Interface   Port ID  Designated  Designated         Port  State  Role
                     port ID     bridge ID          Cost
ge-0/0/0    128:1    128:1       32768.525400a77100 20000 FWD    DESG
ge-0/0/1    128:2    128:2       32768.525400a77100 20000 FWD    DESG
ge-0/0/2    128:3    128:3       32768.525400a77100 20000 FWD    DESG</pre>
<p>Padho: Port Cost 20000 1 Gbps link ka default hai, State forwarding state hai, Role DESG (designated) hai. Jab designated bridge ID is switch ke apne bridge ID ke barabar ho aur koi port root port na ho, to yeh switch maanta hai ki woh root hai. Normal access switch par ek ROOT port aur aksar ek ALT port dikhta hai; access switch par sirf DESG dikhna priority aur neighbours check karne ka sanket hai.</p>

<div class="eg"><p><b>Worked example.</b> Symptom: VLAN 20 ke hosts apne gateway 10.10.20.1 ko ping nahi kar paate. Step 1: show vlans mein ENG ke saath koi member port nahi. Step 2: irb terse mein irb.20 ka Link down. Nishkarsh: cause Layer 2 hai, IP address nahi. Pehle trunk ya access port theek karo, phir show route mein Direct route dobara dekho.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Sirf aakhri line padhna. Admin aur Link columns ko mix karna. Khaali table ko broken maan lena jabki hosts shayad chup hon. Output judge karne se pehle yeh note na karna ki woh kaunse device aur routing instance ka hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exhibit aksar <i>sahi</i> configuration ke saath <i>down</i> state dikhata hai. Aisa answer mat chuno jo IP addressing badalta ho jabki state column Layer 2 problem ki taraf ishara kar raha hai.</p></div>

<div class="scn"><h4>Gateway jo up tha par reach nahi ho raha tha</h4><p>Help desk ne irb.10 ko sahi address ke saath configured dekha, phir bhi users use reach nahi kar paate the. Terse output mein Admin up, Link down tha. Access switch ki taraf trunk se VLAN 10 gayab ho gaya tha. Trunk members theek karne ke baad link up hua aur Direct route aa gaya.</p><p><b>Lesson:</b> Admin aur Link dono padho, aur Layer 2 tak trace karo.</p></div>

<div class="iv"><p class="q">"IRB ka IP address sahi hai lekin woh down hai. Aap kya check karoge?"</p><p>Main member interfaces ke liye show vlans dekhta hoon, phir physical ports aur trunks ke liye show interfaces terse. IRB ko apne VLAN mein kam se kam ek up port chahiye. Main yeh bhi confirm karta hoon ki VLAN l3-interface se IRB se bandha hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order mein padho: command, header counts, state columns, symptom match.</li>
<li>show vlans members aur l3-interface bindings dikhata hai.</li>
<li>MAC table dikhata hai ki har host kahan seekha gaya.</li>
<li>Up member port ke bina IRB down rehta hai.</li>
<li>Direct route na ho to interface address ke saath up nahi hai.</li>
</ul></div>
`}};export{e as default};