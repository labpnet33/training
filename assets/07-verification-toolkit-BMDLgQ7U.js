var e={id:`verification-toolkit`,h:{en:`The verification toolkit: reading switching output`,hi:`Verification toolkit: switching output padhna`},body:{en:`
<p>A doctor does not guess. She measures temperature, pulse and pressure, and each number answers one question. A network engineer does the same with <code>show</code> commands. In this chapter you learn which command answers which question, and how to read the columns, so that in the next chapter you can find a fault in minutes instead of hours.</p>

<h3>One question, one command</h3>
<table class="cmp"><tr><th>Question</th><th>Command</th></tr>
<tr><td>Is the cable and port up?</td><td><code>show interfaces terse</code></td></tr>
<tr><td>Which VLANs exist and which ports are in them?</td><td><code>show vlans</code></td></tr>
<tr><td>What mode and which VLANs does one port carry?</td><td><code>show ethernet-switching interface ge-0/0/0 detail</code></td></tr>
<tr><td>Which MAC was learned where?</td><td><code>show ethernet-switching table</code></td></tr>
<tr><td>Is the gateway up and is the subnet routed?</td><td><code>show interfaces terse irb</code>, <code>show route</code></td></tr>
<tr><td>Can I reach the neighbour end to end?</td><td><code>ping</code>, <code>traceroute</code></td></tr>
<tr><td>What did someone change?</td><td><code>show system commit</code>, <code>show configuration</code>, <code>show | compare rollback 1</code></td></tr></table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Bottom up method">
<rect x="10" y="50" width="110" height="60" rx="8" fill="#fde68a"/><text x="65" y="76" text-anchor="middle" class="svg-ink" font-size="13">1 Physical</text><text x="65" y="94" text-anchor="middle" class="svg-muted" font-size="11">interfaces terse</text>
<rect x="135" y="50" width="110" height="60" rx="8" fill="#bae6fd"/><text x="190" y="76" text-anchor="middle" class="svg-ink" font-size="13">2 Switching</text><text x="190" y="94" text-anchor="middle" class="svg-muted" font-size="11">family, mode</text>
<rect x="260" y="50" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="315" y="76" text-anchor="middle" class="svg-ink" font-size="13">3 VLANs</text><text x="315" y="94" text-anchor="middle" class="svg-muted" font-size="11">both trunk ends</text>
<rect x="385" y="50" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="440" y="76" text-anchor="middle" class="svg-ink" font-size="13">4 MAC table</text><text x="440" y="94" text-anchor="middle" class="svg-muted" font-size="11">learned where</text>
<rect x="510" y="50" width="110" height="60" rx="8" fill="#fed7aa"/><text x="565" y="76" text-anchor="middle" class="svg-ink" font-size="13">5 Layer 3</text><text x="565" y="94" text-anchor="middle" class="svg-muted" font-size="11">IRB, gateway</text>
<line x1="120" y1="80" x2="135" y2="80" stroke="#64748b" stroke-width="2"/><line x1="245" y1="80" x2="260" y2="80" stroke="#64748b" stroke-width="2"/><line x1="370" y1="80" x2="385" y2="80" stroke="#64748b" stroke-width="2"/><line x1="495" y1="80" x2="510" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">Work from the bottom up. Stop at the first layer that is wrong.</text>
</svg><p class="cap">The five-step method used in every troubleshooting lab.</p></div>

<h3>Step 1: the physical layer</h3>
<pre class="out">lab@ACC&gt; show interfaces terse
Interface               Admin Link Proto    Local                 Remote
ge-0/0/0                up    up
ge-0/0/0.0              up    up   <span class="hl">eth-switch</span>
ge-0/0/1                up    up
ge-0/0/1.0              up    up   eth-switch
ge-0/0/3                up    down</pre>
<p><b>Admin</b> is what the configuration says, <b>Link</b> is what the cable says. <code>up down</code> means the port is enabled but nothing is connected or the other side is down. The Proto <code>eth-switch</code> on unit 0 proves that <code>family ethernet-switching</code> is configured. A physical port with no unit 0 line does not switch.</p>

<h3>Steps 2 and 3: switching family and VLAN membership</h3>
<pre class="out">lab@ACC&gt; show ethernet-switching interface
Logical         Vlan      TAG    MAC     MAC+IP  STP         Logical     Tagging
interface       members          limit   limit   state       interface flags
ge-0/0/1.0                       294912  294912                          untagged
                STAFF     30     294912  294912  Forwarding              untagged
ge-0/0/2.0                       294912  294912                          tagged
                STAFF     30     294912  294912  Forwarding              tagged</pre>
<p>This is the single most useful switching table. For each port it shows the VLAN, the tag, the spanning-tree state and whether frames are <b>tagged</b> or <b>untagged</b>. Here ge-0/0/2 is tagged, which is correct for a trunk but wrong for a PC. It is a real excerpt of the Lab 3 fault captured from the simulator.</p>
<p>Use the <code>detail</code> form for one port when you need the mode and native VLAN. The line <code>Interface mode : trunk, native VLAN STAFF (30)</code> tells you the role and the native VLAN in one go.</p>

<h3>Step 4: the MAC table as a proof</h3>
<pre class="out">lab@ACC&gt; show ethernet-switching table
Ethernet switching table : 2 entries, 2 learned
Routing instance : default-switch
   Vlan   MAC                 MAC    Age    Logical
   name   address             flags         interface
   SALES  00:50:7f:06:6d:01   D      -      ge-0/0/1.0
   ENG    00:50:80:06:6e:01   D      -      ge-0/0/2.0</pre>
<p>If a host's MAC appears in the right VLAN on the right port, Layer 2 is fine up to that point. If the MAC is missing, the frames are not reaching the switch (cable, port, VLAN mismatch, or the host is silent). If it appears in the wrong VLAN, the port membership or the native VLAN is wrong.</p>

<h3>Step 5: Layer 3</h3>
<p>Check <code>show interfaces terse irb</code> and <code>show route</code> from the previous chapter. Then ping from the host to its gateway first, and only then to remote subnets. A host that reaches its gateway but not another VLAN points at routing, not at switching.</p>

<h3>Change history</h3>
<p>When something worked yesterday, ask what changed. <code>show system commit</code> lists commits with user and time; <code>show | compare rollback 1</code> in configuration mode shows the difference between the active configuration and the previous one.</p>

<div class="eg"><p><b>Worked example.</b> PC2 on ACC ge-0/0/2 cannot reach its gateway. Step 1: link up. Step 2: <code>show ethernet-switching interface</code> shows ge-0/0/2 as <i>tagged</i>. A PC sends untagged frames, so a trunk with no native VLAN drops them. Fix: set <code>interface-mode access</code>. Verify: the MAC of PC2 now appears in the table and the gateway ping works. Five minutes and three commands.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Starting at Layer 3 (pinging) when the cable is unplugged. Looking at only one end of a trunk. Trusting a configuration without checking the operational state: the configuration may be right while the port is <code>up down</code>. Forgetting that the asterisk in <code>show vlans</code> marks an up interface.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam shows output and asks what is wrong. Look for tagged versus untagged, the native VLAN line, a missing VLAN in the member list, and an IRB that is up/down.</p></div>

<div class="scn"><h4>Ten minutes instead of two hours</h4><p>A new engineer spent two hours re-entering gateway settings on a PC that could not reach the network. A colleague ran <code>show ethernet-switching interface</code> on the access switch and saw that the port had been left as a trunk by the previous tenant of the desk. One line changed the port to access mode.</p><p><b>Lesson:</b> start at the switch port, not at the PC.</p></div>

<div class="iv"><p class="q">"A user cannot reach the network. What do you check on the switch?"</p><p>Bottom up: link state with <code>show interfaces terse</code>, port mode and VLAN with <code>show ethernet-switching interface</code>, the MAC table to see whether the host's MAC is learned in the expected VLAN, then the IRB gateway and routes. Finish with <code>show system commit</code> if it used to work.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work bottom up: link, switching family, VLAN membership, MAC table, Layer 3.</li>
<li><code>show ethernet-switching interface</code> reveals tagged versus untagged and the STP state.</li>
<li>The <code>detail</code> form shows the port mode and the native VLAN.</li>
<li>Use <code>show system commit</code> to find what changed.</li>
</ul></div>
`,hi:`
<p>Doctor andaaza nahi lagati. Woh temperature, pulse aur pressure naapti hai, aur har number ek sawaal ka jawab deta hai. Network engineer <code>show</code> commands se yahi karta hai. Is chapter mein aap seekhoge ki kaunsa command kaunse sawaal ka jawab deta hai, aur columns kaise padhte hain, taaki agle chapter mein fault ghanton ki jagah minutes mein mil jaaye.</p>

<h3>Ek sawaal, ek command</h3>
<table class="cmp"><tr><th>Sawaal</th><th>Command</th></tr>
<tr><td>Cable aur port up hai?</td><td><code>show interfaces terse</code></td></tr>
<tr><td>Kaunse VLANs hain aur unmein kaunse ports?</td><td><code>show vlans</code></td></tr>
<tr><td>Ek port kaunsa mode aur kaunse VLANs le jaata hai?</td><td><code>show ethernet-switching interface ge-0/0/0 detail</code></td></tr>
<tr><td>Kaunsa MAC kahan learn hua?</td><td><code>show ethernet-switching table</code></td></tr>
<tr><td>Gateway up hai aur subnet routed hai?</td><td><code>show interfaces terse irb</code>, <code>show route</code></td></tr>
<tr><td>Neighbour tak end to end pahunch sakte hain?</td><td><code>ping</code>, <code>traceroute</code></td></tr>
<tr><td>Kisne kya badla?</td><td><code>show system commit</code>, <code>show configuration</code>, <code>show | compare rollback 1</code></td></tr></table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Bottom up method">
<rect x="10" y="50" width="110" height="60" rx="8" fill="#fde68a"/><text x="65" y="76" text-anchor="middle" class="svg-ink" font-size="13">1 Physical</text><text x="65" y="94" text-anchor="middle" class="svg-muted" font-size="11">interfaces terse</text>
<rect x="135" y="50" width="110" height="60" rx="8" fill="#bae6fd"/><text x="190" y="76" text-anchor="middle" class="svg-ink" font-size="13">2 Switching</text><text x="190" y="94" text-anchor="middle" class="svg-muted" font-size="11">family, mode</text>
<rect x="260" y="50" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="315" y="76" text-anchor="middle" class="svg-ink" font-size="13">3 VLANs</text><text x="315" y="94" text-anchor="middle" class="svg-muted" font-size="11">trunk ke dono ends</text>
<rect x="385" y="50" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="440" y="76" text-anchor="middle" class="svg-ink" font-size="13">4 MAC table</text><text x="440" y="94" text-anchor="middle" class="svg-muted" font-size="11">kahan learn hua</text>
<rect x="510" y="50" width="110" height="60" rx="8" fill="#fed7aa"/><text x="565" y="76" text-anchor="middle" class="svg-ink" font-size="13">5 Layer 3</text><text x="565" y="94" text-anchor="middle" class="svg-muted" font-size="11">IRB, gateway</text>
<line x1="120" y1="80" x2="135" y2="80" stroke="#64748b" stroke-width="2"/><line x1="245" y1="80" x2="260" y2="80" stroke="#64748b" stroke-width="2"/><line x1="370" y1="80" x2="385" y2="80" stroke="#64748b" stroke-width="2"/><line x1="495" y1="80" x2="510" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">Neeche se upar jao. Pehli galat layer par ruk jao.</text>
</svg><p class="cap">Har troubleshooting lab mein use hone wala paanch-step method.</p></div>

<h3>Step 1: physical layer</h3>
<pre class="out">lab@ACC&gt; show interfaces terse
Interface               Admin Link Proto    Local                 Remote
ge-0/0/0                up    up
ge-0/0/0.0              up    up   <span class="hl">eth-switch</span>
ge-0/0/1                up    up
ge-0/0/1.0              up    up   eth-switch
ge-0/0/3                up    down</pre>
<p><b>Admin</b> configuration ka kehna hai, <b>Link</b> cable ka kehna hai. <code>up down</code> ka matlab port enabled hai lekin kuch juda nahi ya doosra side down hai. Unit 0 par Proto <code>eth-switch</code> saabit karta hai ki <code>family ethernet-switching</code> configured hai. Jis physical port par unit 0 line nahi, woh switch nahi karta.</p>

<h3>Step 2 aur 3: switching family aur VLAN membership</h3>
<pre class="out">lab@ACC&gt; show ethernet-switching interface
Logical         Vlan      TAG    MAC     MAC+IP  STP         Logical     Tagging
interface       members          limit   limit   state       interface flags
ge-0/0/1.0                       294912  294912                          untagged
                STAFF     30     294912  294912  Forwarding              untagged
ge-0/0/2.0                       294912  294912                          tagged
                STAFF     30     294912  294912  Forwarding              tagged</pre>
<p>Yeh switching ka sabse kaam ka table hai. Har port ke liye yeh VLAN, tag, spanning-tree state aur frames <b>tagged</b> hain ya <b>untagged</b> yeh dikhata hai. Yahan ge-0/0/2 tagged hai, jo trunk ke liye sahi hai lekin PC ke liye galat. Yeh Lab 3 ke fault ka simulator se capture kiya real excerpt hai.</p>
<p>Ek port ka mode aur native VLAN chahiye to <code>detail</code> form use karo. Line <code>Interface mode : trunk, native VLAN STAFF (30)</code> role aur native VLAN ek hi baar mein bata deti hai.</p>

<h3>Step 4: saboot ke roop mein MAC table</h3>
<pre class="out">lab@ACC&gt; show ethernet-switching table
Ethernet switching table : 2 entries, 2 learned
Routing instance : default-switch
   Vlan   MAC                 MAC    Age    Logical
   name   address             flags         interface
   SALES  00:50:7f:06:6d:01   D      -      ge-0/0/1.0
   ENG    00:50:80:06:6e:01   D      -      ge-0/0/2.0</pre>
<p>Host ka MAC sahi VLAN mein sahi port par dikhe to us point tak Layer 2 theek hai. MAC missing ho to frames switch tak pahunch hi nahi rahe (cable, port, VLAN mismatch, ya host chup hai). Galat VLAN mein dikhe to port membership ya native VLAN galat hai.</p>

<h3>Step 5: Layer 3</h3>
<p>Pichhle chapter ke <code>show interfaces terse irb</code> aur <code>show route</code> dekho. Phir host se pehle gateway ko ping karo, uske baad remote subnets ko. Jo host gateway tak pahunche lekin doosre VLAN tak nahi, woh switching nahi routing ki taraf ishara karta hai.</p>

<h3>Change history</h3>
<p>Kal tak chal raha tha to poocho kya badla. <code>show system commit</code> user aur time ke saath commits list karta hai; configuration mode mein <code>show | compare rollback 1</code> active configuration aur pichhli ke beech ka difference dikhata hai.</p>

<div class="eg"><p><b>Worked example.</b> ACC ke ge-0/0/2 par PC2 apne gateway tak nahi pahunch raha. Step 1: link up. Step 2: <code>show ethernet-switching interface</code> mein ge-0/0/2 <i>tagged</i> dikhta hai. PC untagged frames bhejta hai, aur bina native VLAN ka trunk unhe drop karta hai. Fix: <code>interface-mode access</code> set karo. Verify: PC2 ka MAC ab table mein dikhta hai aur gateway ping chalta hai. Paanch minute aur teen commands.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Cable nikla ho aur Layer 3 se (ping se) shuru karna. Trunk ka sirf ek end dekhna. Operational state check kiye bina configuration par bharosa karna: configuration sahi ho sakta hai jabki port <code>up down</code> ho. Yeh bhoolna ki <code>show vlans</code> mein asterisk up interface dikhata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam output dikhakar poochta hai ki kya galat hai. Tagged versus untagged, native VLAN line, member list mein missing VLAN, aur up/down IRB dhoondho.</p></div>

<div class="scn"><h4>Do ghante ki jagah das minute</h4><p>Ek naye engineer ne PC par gateway settings do ghante tak dobara daalin jo network tak nahi pahunch raha tha. Ek colleague ne access switch par <code>show ethernet-switching interface</code> chalaya aur dekha ki desk ke pichhle user ne port ko trunk chhod diya tha. Ek line ne port ko access mode mein kar diya.</p><p><b>Lesson:</b> PC se nahi, switch port se shuru karo.</p></div>

<div class="iv"><p class="q">"User network tak nahi pahunch pa raha. Switch par kya check karoge?"</p><p>Neeche se upar: <code>show interfaces terse</code> se link state, <code>show ethernet-switching interface</code> se port mode aur VLAN, MAC table se dekho ki host ka MAC expected VLAN mein learn hua ya nahi, phir IRB gateway aur routes. Pehle chal raha tha to <code>show system commit</code> se khatam karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Neeche se upar kaam karo: link, switching family, VLAN membership, MAC table, Layer 3.</li>
<li><code>show ethernet-switching interface</code> tagged versus untagged aur STP state dikhata hai.</li>
<li><code>detail</code> form port mode aur native VLAN dikhata hai.</li>
<li>Kya badla yeh jaanne ke liye <code>show system commit</code> use karo.</li>
</ul></div>
`}};export{e as default};