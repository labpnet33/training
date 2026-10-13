var e={id:`bpdu-bridge-id`,h:{en:`BPDUs and the Bridge ID (with extended system ID)`,hi:`BPDUs aur Bridge ID (extended system ID ke saath)`},body:{en:`
<p>Picture a class electing a monitor with no teacher in the room. Every student writes on a slip "I think the monitor should be: (name, roll number)" and passes it to the neighbours. Whenever you receive a slip naming someone better than your current choice, you copy that name onto your own slips. After a few rounds everyone's slip carries the same name. In STP those slips are <b>BPDUs</b> and the "name and roll number" is the <b>Bridge ID</b>.</p>

<h3>What a BPDU is</h3>
<p>A <b>Bridge Protocol Data Unit</b> is a small Ethernet frame that switches send to each other to run spanning tree. It is never forwarded like user data: a switch receives it, processes it, and sends its <b>own</b> BPDU out of its designated ports. Hosts ignore BPDUs. There are three kinds:</p>
<ul>
<li><b>Configuration BPDU</b> (802.1D, type 0x00): carries the election information. In classic 802.1D only the root generates these every hello time; other switches send one out of their designated ports each time one arrives on the root port.</li>
<li><b>TCN BPDU</b> (802.1D, type 0x80): a 4-byte "Topology Change Notification" sent up toward the root when a switch sees a port change state (chapter 7).</li>
<li><b>RST BPDU</b> (802.1w, type 0x02, version 2): one format for everything. Every RSTP switch sends its own every 2 seconds, and the flag bits carry the port role, proposal, agreement and topology-change information (chapter 8).</li>
</ul>

<table class="cmp"><tr><th>Field</th><th>Size</th><th>What it says</th></tr>
<tr><td>Protocol ID</td><td>2 bytes</td><td>Always 0</td></tr>
<tr><td>Version</td><td>1 byte</td><td>0 = STP, 2 = RSTP, 3 = MST</td></tr>
<tr><td>BPDU type</td><td>1 byte</td><td>0x00 config, 0x80 TCN, 0x02 RST</td></tr>
<tr><td>Flags</td><td>1 byte</td><td>TC, TC-ack; RSTP adds proposal, role, learning, forwarding, agreement</td></tr>
<tr><td><b>Root Bridge ID</b></td><td>8 bytes</td><td>Who the sender believes is the root</td></tr>
<tr><td><b>Root Path Cost</b></td><td>4 bytes</td><td>The sender's total cost to reach that root</td></tr>
<tr><td><b>Sender Bridge ID</b></td><td>8 bytes</td><td>The sender itself</td></tr>
<tr><td><b>Sender Port ID</b></td><td>2 bytes</td><td>Port priority plus port number of the sending port</td></tr>
<tr><td>Message age</td><td>2 bytes</td><td>How many hops (roughly seconds) the information has travelled from the root</td></tr>
<tr><td>Max age, hello, forward delay</td><td>2 bytes each</td><td>Timers set by the root: 20 s, 2 s, 15 s by default</td></tr>
</table>
<p>The four bold fields are the <b>priority vector</b>. Every STP decision in chapters 5 and 6 is a comparison of these four values, in this order, and <b>lower always wins</b>.</p>
<p>IEEE BPDUs are sent to the multicast MAC <b>0180.c200.0000</b>. Cisco per-VLAN BPDUs (PVST+ and Rapid PVST+) for VLANs other than the native VLAN go to <b>0100.0ccc.cccd</b>, tagged with the VLAN ID, so that each VLAN's tree has its own BPDUs.</p>

<h3>The Bridge ID and the extended system ID</h3>
<p>The <b>Bridge ID (BID)</b> is 8 bytes: a 2-byte priority field followed by the switch's 6-byte base MAC address. Originally the whole 16-bit field was a priority from 0 to 65535. With per-VLAN spanning tree, a switch needs a different BID in every VLAN, and burning a separate MAC per VLAN wasted addresses. IEEE 802.1t therefore split the 16 bits:</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Bridge ID layout">
<text x="20" y="22" class="svg-ink" font-size="14">Bridge ID = 8 bytes</text>
<rect x="20" y="36" width="130" height="54" rx="6" fill="#fde68a"/><text x="85" y="58" text-anchor="middle" class="svg-ink" font-size="13">Priority</text><text x="85" y="78" text-anchor="middle" class="svg-muted" font-size="12">4 bits</text>
<rect x="150" y="36" width="190" height="54" rx="6" fill="#ddd6fe"/><text x="245" y="58" text-anchor="middle" class="svg-ink" font-size="13">Extended system ID</text><text x="245" y="78" text-anchor="middle" class="svg-muted" font-size="12">12 bits = VLAN ID</text>
<rect x="340" y="36" width="280" height="54" rx="6" fill="#bae6fd"/><text x="480" y="58" text-anchor="middle" class="svg-ink" font-size="13">MAC address</text><text x="480" y="78" text-anchor="middle" class="svg-muted" font-size="12">48 bits, switch base MAC</text>
<text x="85" y="114" text-anchor="middle" class="svg-ink" font-size="13">32768</text><text x="245" y="114" text-anchor="middle" class="svg-ink" font-size="13">+ 10</text><text x="480" y="114" text-anchor="middle" class="svg-ink" font-size="13">5254.fe23.9f00</text>
<text x="85" y="134" text-anchor="middle" class="svg-muted" font-size="12">0 to 61440, step 4096</text><text x="245" y="134" text-anchor="middle" class="svg-muted" font-size="12">added automatically</text><text x="480" y="134" text-anchor="middle" class="svg-muted" font-size="12">tie-breaker</text>
<rect x="20" y="148" width="600" height="32" rx="6" fill="#e2e8f0"/><text x="320" y="169" text-anchor="middle" class="svg-ink" font-size="13">Priority 32778 (priority 32768 sys-id-ext 10)</text>
</svg><p class="cap">SW3 in VLAN 10 with defaults. You set only the top 4 bits; the VLAN number fills the lower 12.</p></div>

<ul>
<li>The <b>top 4 bits</b> are the configurable priority. Because they are the high bits, each step is worth 4096, so the only legal values are <b>0, 4096, 8192 ... 61440</b> (16 values). The default is <b>32768</b>.</li>
<li>The <b>lower 12 bits</b> are the <b>extended system ID</b>, which carries the VLAN number (0 to 4095). IOS adds it automatically; you cannot configure it.</li>
<li>The switch uses the <b>same base MAC</b> in every VLAN. The VLAN number is what makes each VLAN's BID unique.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> SW3 has the default priority. In VLAN 10 its displayed priority is 32768 + 10 = <b>32778</b>; in VLAN 20 it is 32768 + 20 = <b>32788</b>; in VLAN 1 it is <b>32769</b>. After <code>spanning-tree vlan 20 priority 24576</code> on SW2, SW2 shows <b>24596</b> in VLAN 20. A switch set to priority 4096 shows <b>4106</b> in VLAN 10. To read a priority from output, subtract the VLAN number.</p></div>

<pre class="out">SW3# show spanning-tree vlan 10
VLAN0010
  Spanning tree enabled protocol rstp
  Root ID    Priority    32778
             Address     5254.0023.a200
             Cost        4
             Port        2 (GigabitEthernet0/1)
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec

<span class="hl">  Bridge ID  Priority    32778  (priority 32768 sys-id-ext 10)</span>
             Address     5254.fe23.9f00
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec
             Aging Time  300 sec</pre>
<p>The Root ID block describes the root this switch has accepted (here SW1, MAC 5254.0023.a200). The Bridge ID block describes the switch itself. When both blocks show the same values, IOS prints <code>This bridge is the root</code>.</p>

<h3>Setting the priority</h3>
<pre class="code"><span class="c">! Legal: a multiple of 4096</span>
SW2(config)# spanning-tree vlan 20 priority 24576
<span class="c">! Illegal: IOS refuses and lists the allowed values</span>
SW2(config)# spanning-tree vlan 20 priority 32788
% Bridge Priority must be in increments of 4096.
% Allowed values are:
  0     4096  8192  12288 16384 20480 24576 28672
  32768 36864 40960 45056 49152 53248 57344 61440</pre>

<div class="warn"><p><b>Common mistake.</b> Copying the priority from <code>show</code> output (for example 32778) into a config command. The displayed value includes the VLAN; the configured value never does.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which priority can be configured?" Only multiples of 4096 from 0 to 61440. Values such as 100, 32769 or 65535 are wrong. "What does show spanning-tree display for VLAN 30 with default priority?" 32798.</p></div>

<div class="scn"><h4>The script that never changed the root</h4><p>An automation script at a logistics company read the "Bridge ID Priority" value from each distribution switch, subtracted 8192 to "make it more preferred", and pushed the result back as a config line. On VLAN 10 it tried to push 24586. Every command failed with "% Bridge Priority must be in increments of 4096", but the script ignored errors, and the old access switch with the lowest MAC stayed root. The engineer fixed the script to subtract the VLAN number first and to check the command output.</p><p><b>Lesson:</b> displayed priority = configured priority + VLAN ID; only the configured part is writable.</p></div>

<div class="iv"><p class="q">"Why does show spanning-tree show priority 32769 for VLAN 1 when the default is 32768?"</p><p>Strong answer: because of the extended system ID. The 16-bit priority field of the Bridge ID is split into a 4-bit priority and a 12-bit system ID extension that carries the VLAN number, so each VLAN gets a unique Bridge ID while the switch uses one base MAC. The displayed value is priority plus VLAN, 32768 + 1. That is also why you can only configure multiples of 4096.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BPDUs carry the priority vector: root BID, root path cost, sender BID, sender port ID; lower wins at each step.</li>
<li>IEEE BPDUs go to 0180.c200.0000; Cisco per-VLAN BPDUs go to 0100.0ccc.cccd with a VLAN tag.</li>
<li>Bridge ID = 4-bit priority + 12-bit extended system ID (VLAN) + 48-bit MAC.</li>
<li>Configurable priority: 0 to 61440 in steps of 4096; default 32768; displayed value adds the VLAN ID.</li>
<li>In RSTP every switch originates BPDUs every 2 seconds; in 802.1D only the root originates them.</li>
</ul></div>
`,hi:`
<p>Socho ek class bina teacher ke monitor elect kar rahi hai. Har student ek parchi par likhta hai "mere hisaab se monitor hona chahiye: (naam, roll number)" aur use padosiyon ko pass karta hai. Jab bhi aapko aisi parchi milti hai jismein aapke current choice se better koi naam ho, aap woh naam apni parchiyon par copy kar lete ho. Kuch rounds ke baad sabki parchi par same naam hota hai. STP mein woh parchiyan <b>BPDUs</b> hain aur "naam aur roll number" <b>Bridge ID</b> hai.</p>

<h3>BPDU kya hai</h3>
<p><b>Bridge Protocol Data Unit</b> ek chhota Ethernet frame hai jo switches spanning tree chalane ke liye ek doosre ko bhejte hain. Yeh user data ki tarah kabhi forward nahi hota: switch ise receive karta hai, process karta hai, aur apne designated ports se apna <b>khud ka</b> BPDU bhejta hai. Hosts BPDUs ignore karte hain. Teen kinds hain:</p>
<ul>
<li><b>Configuration BPDU</b> (802.1D, type 0x00): election information le jaata hai. Classic 802.1D mein sirf root inhe har hello time par generate karta hai; baaki switches har baar jab root port par ek aata hai, apne designated ports se ek bhejte hain.</li>
<li><b>TCN BPDU</b> (802.1D, type 0x80): 4-byte ka "Topology Change Notification" jo switch root ki taraf upar bhejta hai jab use kisi port ka state badalta dikhe (chapter 7).</li>
<li><b>RST BPDU</b> (802.1w, type 0x02, version 2): sab kuch ke liye ek format. Har RSTP switch har 2 second apna khud ka bhejta hai, aur flag bits port role, proposal, agreement aur topology-change information le jaate hain (chapter 8).</li>
</ul>

<table class="cmp"><tr><th>Field</th><th>Size</th><th>Kya batata hai</th></tr>
<tr><td>Protocol ID</td><td>2 bytes</td><td>Hamesha 0</td></tr>
<tr><td>Version</td><td>1 byte</td><td>0 = STP, 2 = RSTP, 3 = MST</td></tr>
<tr><td>BPDU type</td><td>1 byte</td><td>0x00 config, 0x80 TCN, 0x02 RST</td></tr>
<tr><td>Flags</td><td>1 byte</td><td>TC, TC-ack; RSTP proposal, role, learning, forwarding, agreement jodta hai</td></tr>
<tr><td><b>Root Bridge ID</b></td><td>8 bytes</td><td>Sender ke hisaab se root kaun hai</td></tr>
<tr><td><b>Root Path Cost</b></td><td>4 bytes</td><td>Us root tak sender ki total cost</td></tr>
<tr><td><b>Sender Bridge ID</b></td><td>8 bytes</td><td>Sender khud</td></tr>
<tr><td><b>Sender Port ID</b></td><td>2 bytes</td><td>Bhejne wale port ki port priority plus port number</td></tr>
<tr><td>Message age</td><td>2 bytes</td><td>Information root se kitne hops (lagbhag seconds) chal chuki hai</td></tr>
<tr><td>Max age, hello, forward delay</td><td>2 bytes har ek</td><td>Root ke set kiye timers: default 20 s, 2 s, 15 s</td></tr>
</table>
<p>Chaar bold fields <b>priority vector</b> hain. Chapters 5 aur 6 ka har STP decision in chaar values ka isi order mein comparison hai, aur <b>kam hamesha jeetta hai</b>.</p>
<p>IEEE BPDUs multicast MAC <b>0180.c200.0000</b> par bheje jaate hain. Native VLAN ke alawa VLANs ke Cisco per-VLAN BPDUs (PVST+ aur Rapid PVST+) <b>0100.0ccc.cccd</b> par VLAN ID ke tag ke saath jaate hain, taaki har VLAN ke tree ke apne BPDUs hon.</p>

<h3>Bridge ID aur extended system ID</h3>
<p><b>Bridge ID (BID)</b> 8 bytes ka hai: 2-byte priority field ke baad switch ka 6-byte base MAC address. Shuru mein poora 16-bit field 0 se 65535 tak ki priority thi. Per-VLAN spanning tree ke saath switch ko har VLAN mein alag BID chahiye, aur har VLAN ke liye alag MAC jalana addresses waste karta tha. Isliye IEEE 802.1t ne 16 bits ko baant diya:</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Bridge ID layout">
<text x="20" y="22" class="svg-ink" font-size="14">Bridge ID = 8 bytes</text>
<rect x="20" y="36" width="130" height="54" rx="6" fill="#fde68a"/><text x="85" y="58" text-anchor="middle" class="svg-ink" font-size="13">Priority</text><text x="85" y="78" text-anchor="middle" class="svg-muted" font-size="12">4 bits</text>
<rect x="150" y="36" width="190" height="54" rx="6" fill="#ddd6fe"/><text x="245" y="58" text-anchor="middle" class="svg-ink" font-size="13">Extended system ID</text><text x="245" y="78" text-anchor="middle" class="svg-muted" font-size="12">12 bits = VLAN ID</text>
<rect x="340" y="36" width="280" height="54" rx="6" fill="#bae6fd"/><text x="480" y="58" text-anchor="middle" class="svg-ink" font-size="13">MAC address</text><text x="480" y="78" text-anchor="middle" class="svg-muted" font-size="12">48 bits, switch ka base MAC</text>
<text x="85" y="114" text-anchor="middle" class="svg-ink" font-size="13">32768</text><text x="245" y="114" text-anchor="middle" class="svg-ink" font-size="13">+ 10</text><text x="480" y="114" text-anchor="middle" class="svg-ink" font-size="13">5254.fe23.9f00</text>
<text x="85" y="134" text-anchor="middle" class="svg-muted" font-size="12">0 se 61440, step 4096</text><text x="245" y="134" text-anchor="middle" class="svg-muted" font-size="12">apne aap judta hai</text><text x="480" y="134" text-anchor="middle" class="svg-muted" font-size="12">tie-breaker</text>
<rect x="20" y="148" width="600" height="32" rx="6" fill="#e2e8f0"/><text x="320" y="169" text-anchor="middle" class="svg-ink" font-size="13">Priority 32778 (priority 32768 sys-id-ext 10)</text>
</svg><p class="cap">Defaults ke saath VLAN 10 mein SW3. Aap sirf upar ke 4 bits set karte ho; VLAN number neeche ke 12 bhar deta hai.</p></div>

<ul>
<li><b>Upar ke 4 bits</b> configurable priority hain. Kyunki yeh high bits hain, har step 4096 ka hai, isliye legal values sirf <b>0, 4096, 8192 ... 61440</b> hain (16 values). Default <b>32768</b> hai.</li>
<li><b>Neeche ke 12 bits</b> <b>extended system ID</b> hain, jo VLAN number (0 se 4095) le jaate hain. IOS ise apne aap jodta hai; aap ise configure nahi kar sakte.</li>
<li>Switch har VLAN mein <b>same base MAC</b> use karta hai. VLAN number hi har VLAN ke BID ko unique banata hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> SW3 ki default priority hai. VLAN 10 mein uski displayed priority 32768 + 10 = <b>32778</b> hai; VLAN 20 mein 32768 + 20 = <b>32788</b>; VLAN 1 mein <b>32769</b>. SW2 par <code>spanning-tree vlan 20 priority 24576</code> ke baad SW2 VLAN 20 mein <b>24596</b> dikhata hai. Priority 4096 par set switch VLAN 10 mein <b>4106</b> dikhata hai. Output se priority padhne ke liye VLAN number ghata do.</p></div>

<pre class="out">SW3# show spanning-tree vlan 10
VLAN0010
  Spanning tree enabled protocol rstp
  Root ID    Priority    32778
             Address     5254.0023.a200
             Cost        4
             Port        2 (GigabitEthernet0/1)
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec

<span class="hl">  Bridge ID  Priority    32778  (priority 32768 sys-id-ext 10)</span>
             Address     5254.fe23.9f00
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec
             Aging Time  300 sec</pre>
<p>Root ID block us root ko describe karta hai jise is switch ne accept kiya hai (yahan SW1, MAC 5254.0023.a200). Bridge ID block switch ko khud describe karta hai. Jab dono blocks same values dikhate hain, IOS <code>This bridge is the root</code> print karta hai.</p>

<h3>Priority set karna</h3>
<pre class="code"><span class="c">! Legal: 4096 ka multiple</span>
SW2(config)# spanning-tree vlan 20 priority 24576
<span class="c">! Illegal: IOS mana karta hai aur allowed values list karta hai</span>
SW2(config)# spanning-tree vlan 20 priority 32788
% Bridge Priority must be in increments of 4096.
% Allowed values are:
  0     4096  8192  12288 16384 20480 24576 28672
  32768 36864 40960 45056 49152 53248 57344 61440</pre>

<div class="warn"><p><b>Common galti.</b> <code>show</code> output se priority (jaise 32778) copy karke config command mein daalna. Displayed value mein VLAN shaamil hota hai; configured value mein kabhi nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsi priority configure ho sakti hai?" Sirf 0 se 61440 tak 4096 ke multiples. 100, 32769 ya 65535 jaisi values galat hain. "Default priority ke saath VLAN 30 ke liye show spanning-tree kya dikhata hai?" 32798.</p></div>

<div class="scn"><h4>Script jisne kabhi root nahi badla</h4><p>Ek logistics company mein ek automation script har distribution switch se "Bridge ID Priority" value padhti thi, use "zyada preferred banane ke liye" 8192 ghatati thi, aur result ko config line ki tarah wapas push karti thi. VLAN 10 par usne 24586 push karne ki koshish ki. Har command "% Bridge Priority must be in increments of 4096" ke saath fail hui, lekin script errors ignore karti thi, aur sabse chhote MAC wala purana access switch root bana raha. Engineer ne script theek ki taaki woh pehle VLAN number ghataye aur command output check kare.</p><p><b>Seekh:</b> displayed priority = configured priority + VLAN ID; sirf configured hissa writable hai.</p></div>

<div class="iv"><p class="q">"Default 32768 hai, to show spanning-tree VLAN 1 ke liye priority 32769 kyun dikhata hai?"</p><p>Strong answer: extended system ID ki wajah se. Bridge ID ka 16-bit priority field 4-bit priority aur 12-bit system ID extension mein bant gaya hai jo VLAN number le jaata hai, taaki har VLAN ko unique Bridge ID mile jabki switch ek hi base MAC use kare. Displayed value priority plus VLAN hai, 32768 + 1. Isiliye aap sirf 4096 ke multiples configure kar sakte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BPDUs priority vector le jaate hain: root BID, root path cost, sender BID, sender port ID; har step par kam jeetta hai.</li>
<li>IEEE BPDUs 0180.c200.0000 par jaate hain; Cisco per-VLAN BPDUs VLAN tag ke saath 0100.0ccc.cccd par.</li>
<li>Bridge ID = 4-bit priority + 12-bit extended system ID (VLAN) + 48-bit MAC.</li>
<li>Configurable priority: 0 se 61440, 4096 ke steps mein; default 32768; displayed value VLAN ID jodti hai.</li>
<li>RSTP mein har switch har 2 second BPDUs originate karta hai; 802.1D mein sirf root karta hai.</li>
</ul></div>
`}};export{e as default};