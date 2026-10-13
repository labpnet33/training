var e={id:`voice-vlan`,h:{en:`The voice VLAN: tagged voice and untagged data on one port`,hi:`Voice VLAN: ek port par tagged voice aur untagged data`},body:{en:`
<p>A desk usually has one cable: switch, phone, PC. The phone has two ports, <b>LAN</b> to the switch and <b>PC</b> to the computer, with a tiny switch inside. The goal is to put the PC in the <b>data VLAN</b> and the phone in the <b>voice VLAN</b> without a second cable and without making the PC aware of VLANs.</p>

<h3>The trick: tagged and untagged on the same port</h3>
<p>The switch port stays an <b>access port</b> in the data VLAN. Frames from the PC arrive <b>untagged</b> and belong to DATA. The phone sends its own frames <b>tagged</b> with the voice VLAN ID, so they belong to VOICE. The port forwards both. The PC never sees a tag; the phone strips none.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Tagged voice and untagged data">
<rect x="20" y="70" width="140" height="70" rx="10" fill="#bae6fd"/><text x="90" y="98" text-anchor="middle" class="svg-ink" font-size="13">EX switch</text><text x="90" y="118" text-anchor="middle" class="svg-muted" font-size="11">ge-0/0/1 access, DATA</text>
<rect x="260" y="70" width="140" height="70" rx="10" fill="#bbf7d0"/><text x="330" y="98" text-anchor="middle" class="svg-ink" font-size="13">IP phone</text><text x="330" y="118" text-anchor="middle" class="svg-muted" font-size="11">tiny switch inside</text>
<rect x="500" y="70" width="120" height="70" rx="10" fill="#fde68a"/><text x="560" y="110" text-anchor="middle" class="svg-ink" font-size="13">PC</text>
<line x1="160" y1="95" x2="260" y2="95" stroke="#2563eb" stroke-width="3"/><text x="210" y="86" text-anchor="middle" class="svg-accent" font-size="11">VLAN 20 tagged</text>
<line x1="160" y1="118" x2="260" y2="118" stroke="#16a34a" stroke-width="3"/><text x="210" y="136" text-anchor="middle" class="svg-accent" font-size="11">VLAN 10 untagged</text>
<line x1="400" y1="105" x2="500" y2="105" stroke="#16a34a" stroke-width="3"/><text x="450" y="96" text-anchor="middle" class="svg-accent" font-size="11">untagged</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">Voice is tagged on the wire; the PC sees only untagged frames</text>
</svg><p class="cap">Two VLANs, one cable, one access port.</p></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! VLANs and gateways</span>
set vlans DATA vlan-id 10
set vlans DATA l3-interface irb.10
set vlans VOICE vlan-id 20
set vlans VOICE l3-interface irb.20
set interfaces irb unit 10 family inet address 10.10.0.1/24
set interfaces irb unit 20 family inet address 10.20.0.1/24
<span class="c">! the phone ports stay access ports in DATA</span>
set interfaces ge-0/0/1 unit 0 family ethernet-switching vlan members DATA
set interfaces ge-0/0/2 unit 0 family ethernet-switching vlan members DATA
<span class="c">! add the voice VLAN, tagged, to those ports</span>
set switch-options voip interface ge-0/0/1.0 vlan VOICE
set switch-options voip interface ge-0/0/2.0 vlan VOICE
set switch-options voip interface ge-0/0/1.0 forwarding-class expedited-forwarding</pre>
<p>The <code>switch-options voip</code> statement is the heart. It declares the voice VLAN on the port, tells LLDP-MED to advertise it, and (with the optional <code>forwarding-class</code>) puts voice into a high-priority queue. You can also use <code>interface access-ports</code> as a shortcut for all access ports. This is the ELS syntax used on the EX2300 and EX4300 in the labs.</p>

<h3>Real output: one port, two VLANs</h3>
<pre class="out">lab@ACC1&gt; show ethernet-switching interface ge-0/0/1
Logical         Vlan                     TAG     MAC     MAC+IP  STP         Logical           Tagging
interface       members                          limit   limit   state       interface flags
ge-0/0/1.0                                       294912  294912                                untagged
                DATA                     10      294912  294912  Forwarding                    <span class="hl">untagged</span>
                VOICE                    20      294912  294912  Forwarding                    <span class="hl">tagged</span></pre>
<p>This is the proof you want: DATA 10 untagged, VOICE 20 tagged, both Forwarding. The interface itself is untagged (an access port). Then the real ping from PHONE1 to the call server 10.20.0.50 succeeds, and PC1 behind it can reach 10.10.0.1:</p>
<pre class="out">PHONE1&gt; ping 10.20.0.50
84 bytes from 10.20.0.50 icmp_seq=1 ttl=64 time=0.500 ms
84 bytes from 10.20.0.50 icmp_seq=2 ttl=64 time=0.600 ms</pre>
<p>Both devices work on one port. The router, here the switch's own irb interfaces, routes between DATA and VOICE when allowed (see filters in the next chapter).</p>

<h3>What decides the phone's VLAN?</h3>
<ol>
<li>The switch holds the voice VLAN for the port (<code>voip</code> statement).</li>
<li>LLDP-MED sends it to the phone as network policy.</li>
<li>The phone sends its voice tagged; the switch puts the frames in VOICE.</li>
<li>If the phone gets no policy, it sends untagged: its frames land in DATA, and its voice subnet does not exist there.</li>
</ol>

<h3>Symptoms and meaning</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th></tr>
<tr><td>Phone and PC both dark</td><td>no PoE on the port, port disabled, budget exhausted</td></tr>
<tr><td>Phone powered, no registration, lands in DATA</td><td>LLDP-MED off for this port, no <code>voip</code> statement</td></tr>
<tr><td>PC behind phone works, phone does not</td><td>missing voice VLAN or the VLAN has no gateway or DHCP</td></tr>
<tr><td>Voice choppy</td><td>no priority marking; check CoS and DSCP</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> Making the port a trunk with data native: some phones work, but the PC gets tagged traffic. Typing <code>voip</code> for a port that is not an access port. Forgetting a gateway or DHCP scope for the voice VLAN. Using VLAN 1 as the voice VLAN.</p></div>
<div class="exam"><p><b>Exam trap.</b> In <code>show ethernet-switching interface</code> the voice VLAN appears <b>tagged</b> and the data VLAN <b>untagged</b> on the same port. The voice VLAN is configured under <code>switch-options voip</code>, not under <code>vlan members</code> and not as a trunk.</p></div>

<div class="scn"><h4>Two phones, two floors, one mistake</h4><p>An engineer copied the working port configuration from floor 2 to floor 3 but forgot the <code>switch-options voip</code> lines. The floor 3 phones powered up, found their neighbours by LLDP, but received no policy and sat in DATA with an IP from the wrong subnet. Adding the three voip lines put them in VOICE in a minute.</p><p><b>Lesson:</b> the voice VLAN is a per-port statement; copy it with the port, or use the access-ports shortcut.</p></div>

<div class="iv"><p class="q">"How can a PC and a phone share one switch port yet be in different VLANs?"</p><p>The port is an access port in the data VLAN, so PC frames are untagged. The voice VLAN is added with switch-options voip, and LLDP-MED tells the phone to tag its voice with that VLAN ID. The port therefore forwards DATA untagged and VOICE tagged; I verify it with show ethernet-switching interface.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Phone ports stay access ports in the data VLAN; voice is added tagged with <code>switch-options voip</code>.</li>
<li>Verification shows DATA untagged and VOICE tagged, both Forwarding.</li>
<li>The phone learns the VLAN through LLDP-MED; no policy means untagged voice in DATA.</li>
<li>Optional <code>forwarding-class</code> gives voice priority.</li>
<li>The voice VLAN needs its own gateway and DHCP.</li>
</ul></div>
`,hi:`
<p>Desk par aam taur par ek hi cable hoti hai: switch, phone, PC. Phone ke do ports hote hain, switch ki taraf <b>LAN</b> aur computer ki taraf <b>PC</b>, andar chhota switch. Maqsad hai PC ko <b>data VLAN</b> mein aur phone ko <b>voice VLAN</b> mein rakhna, doosri cable ke bina aur PC ko VLANs ka pata chale bina.</p>

<h3>Trick: ek hi port par tagged aur untagged</h3>
<p>Switch port data VLAN ka <b>access port</b> rehta hai. PC ke frames <b>untagged</b> aate hain aur DATA ke hote hain. Phone apne frames voice VLAN ID se <b>tagged</b> bhejta hai, isliye woh VOICE ke hote hain. Port dono forward karta hai. PC ko tag kabhi nahi dikhta.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Tagged voice aur untagged data">
<rect x="20" y="70" width="140" height="70" rx="10" fill="#bae6fd"/><text x="90" y="98" text-anchor="middle" class="svg-ink" font-size="13">EX switch</text><text x="90" y="118" text-anchor="middle" class="svg-muted" font-size="11">ge-0/0/1 access, DATA</text>
<rect x="260" y="70" width="140" height="70" rx="10" fill="#bbf7d0"/><text x="330" y="98" text-anchor="middle" class="svg-ink" font-size="13">IP phone</text><text x="330" y="118" text-anchor="middle" class="svg-muted" font-size="11">andar chhota switch</text>
<rect x="500" y="70" width="120" height="70" rx="10" fill="#fde68a"/><text x="560" y="110" text-anchor="middle" class="svg-ink" font-size="13">PC</text>
<line x1="160" y1="95" x2="260" y2="95" stroke="#2563eb" stroke-width="3"/><text x="210" y="86" text-anchor="middle" class="svg-accent" font-size="11">VLAN 20 tagged</text>
<line x1="160" y1="118" x2="260" y2="118" stroke="#16a34a" stroke-width="3"/><text x="210" y="136" text-anchor="middle" class="svg-accent" font-size="11">VLAN 10 untagged</text>
<line x1="400" y1="105" x2="500" y2="105" stroke="#16a34a" stroke-width="3"/><text x="450" y="96" text-anchor="middle" class="svg-accent" font-size="11">untagged</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">Wire par voice tagged hai; PC ko sirf untagged frames dikhte hain</text>
</svg><p class="cap">Do VLANs, ek cable, ek access port.</p></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! VLANs aur gateways</span>
set vlans DATA vlan-id 10
set vlans DATA l3-interface irb.10
set vlans VOICE vlan-id 20
set vlans VOICE l3-interface irb.20
set interfaces irb unit 10 family inet address 10.10.0.1/24
set interfaces irb unit 20 family inet address 10.20.0.1/24
<span class="c">! phone ports DATA ke access ports rehte hain</span>
set interfaces ge-0/0/1 unit 0 family ethernet-switching vlan members DATA
set interfaces ge-0/0/2 unit 0 family ethernet-switching vlan members DATA
<span class="c">! in ports mein voice VLAN, tagged, jodo</span>
set switch-options voip interface ge-0/0/1.0 vlan VOICE
set switch-options voip interface ge-0/0/2.0 vlan VOICE
set switch-options voip interface ge-0/0/1.0 forwarding-class expedited-forwarding</pre>
<p><code>switch-options voip</code> statement dil hai. Yeh port par voice VLAN declare karta hai, LLDP-MED ko use advertise karne ko kehta hai, aur (optional <code>forwarding-class</code> ke saath) voice ko high-priority queue mein daalta hai. Saare access ports ke liye shortcut <code>interface access-ports</code> bhi hai. Labs ke EX2300 aur EX4300 par yahi ELS syntax hai.</p>

<h3>Asli output: ek port, do VLANs</h3>
<pre class="out">lab@ACC1&gt; show ethernet-switching interface ge-0/0/1
Logical         Vlan                     TAG     MAC     MAC+IP  STP         Logical           Tagging
interface       members                          limit   limit   state       interface flags
ge-0/0/1.0                                       294912  294912                                untagged
                DATA                     10      294912  294912  Forwarding                    <span class="hl">untagged</span>
                VOICE                    20      294912  294912  Forwarding                    <span class="hl">tagged</span></pre>
<p>Yahi proof chahiye: DATA 10 untagged, VOICE 20 tagged, dono Forwarding. Interface khud untagged hai (access port). Phir PHONE1 se call server 10.20.0.50 ka asli ping succeed hota hai, aur uske peeche ka PC1 10.10.0.1 tak pahunchta hai:</p>
<pre class="out">PHONE1&gt; ping 10.20.0.50
84 bytes from 10.20.0.50 icmp_seq=1 ttl=64 time=0.500 ms
84 bytes from 10.20.0.50 icmp_seq=2 ttl=64 time=0.600 ms</pre>
<p>Dono devices ek port par chalte hain. Router, yahan switch ke apne irb interfaces, DATA aur VOICE ke beech route karta hai jab allowed ho (agle chapter mein filters).</p>

<h3>Phone ka VLAN kaun tay karta hai?</h3>
<ol>
<li>Switch ke paas port ka voice VLAN hai (<code>voip</code> statement).</li>
<li>LLDP-MED use phone ko network policy ki tarah bhejta hai.</li>
<li>Phone voice tagged bhejta hai; switch frames ko VOICE mein daalta hai.</li>
<li>Phone ko policy na mile to woh untagged bhejta hai: uske frames DATA mein jaate hain, aur wahan uska voice subnet exist nahi karta.</li>
</ol>

<h3>Symptoms aur matlab</h3>
<table class="cmp"><tr><th>Symptom</th><th>Sambhav kaaran</th></tr>
<tr><td>Phone aur PC dono dark</td><td>port par PoE nahi, port disabled, budget khatam</td></tr>
<tr><td>Phone powered, register nahi, DATA mein dikhta hai</td><td>is port par LLDP-MED off, <code>voip</code> statement nahi</td></tr>
<tr><td>Phone ke peeche PC chalta hai, phone nahi</td><td>voice VLAN missing ya VLAN ka gateway ya DHCP nahi</td></tr>
<tr><td>Voice choppy</td><td>priority marking nahi; CoS aur DSCP dekho</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> Port ko data native ke saath trunk banana: kuch phones chalte hain, par PC ko tagged traffic milta hai. Jo port access nahi hai uske liye <code>voip</code> likhna. Voice VLAN ka gateway ya DHCP scope bhoolna. VLAN 1 ko voice VLAN banana.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>show ethernet-switching interface</code> mein ek hi port par voice VLAN <b>tagged</b> aur data VLAN <b>untagged</b> dikhta hai. Voice VLAN <code>switch-options voip</code> ke neeche configure hota hai, <code>vlan members</code> ke neeche nahi aur trunk ke roop mein nahi.</p></div>

<div class="scn"><h4>Do phones, do floors, ek galti</h4><p>Ek engineer ne floor 2 ki working port configuration floor 3 par copy ki par <code>switch-options voip</code> lines bhool gaya. Floor 3 ke phones power hue, LLDP se neighbours mile, par policy nahi mili aur woh DATA mein galat subnet ke IP ke saath baithe the. Teen voip lines jodne se woh ek minute mein VOICE mein aa gaye.</p><p><b>Lesson:</b> voice VLAN per-port statement hai; port ke saath copy karo, ya access-ports shortcut use karo.</p></div>

<div class="iv"><p class="q">"PC aur phone ek hi switch port share karke alag VLANs mein kaise ho sakte hain?"</p><p>Port data VLAN ka access port hai, isliye PC frames untagged hain. Voice VLAN switch-options voip se jodi jaati hai, aur LLDP-MED phone ko kehta hai ki voice us VLAN ID se tag kare. Port isliye DATA untagged aur VOICE tagged forward karta hai; main show ethernet-switching interface se verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Phone ports data VLAN ke access ports rehte hain; voice <code>switch-options voip</code> se tagged jodi jaati hai.</li>
<li>Verification mein DATA untagged aur VOICE tagged dikhte hain, dono Forwarding.</li>
<li>Phone VLAN LLDP-MED se seekhta hai; policy nahi to voice untagged DATA mein.</li>
<li>Optional <code>forwarding-class</code> voice ko priority deta hai.</li>
<li>Voice VLAN ko apna gateway aur DHCP chahiye.</li>
</ul></div>
`}};export{e as default};