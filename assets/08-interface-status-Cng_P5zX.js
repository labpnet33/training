var e={id:`status`,h:{en:`Reading interface status: show ip interface brief, show interfaces status and err-disabled`,hi:`Interface status padhna: show ip interface brief, show interfaces status aur err-disabled`},body:{en:`
<p>A hospital ward has a board by the door: every bed, and next to it "occupied", "empty", "cleaning" or "isolated". A nurse glances at it and knows where to go. Interface status commands are that board for your switch and router. In ten seconds they tell you which ports are working, which are empty, which somebody switched off, and which the switch itself put in isolation.</p>

<h3>Two words: status and protocol</h3>
<p>Every IOS interface reports two states, which you first met in the IOS module:</p>
<ul>
<li><b>Status (line)</b>: Layer 1. Is there a working physical signal?</li>
<li><b>Protocol (line protocol)</b>: Layer 2. Is the data link working? On Ethernet this normally follows the line status.</li>
</ul>
<table class="cmp"><tr><th>Status / Protocol</th><th>Usual meaning</th><th>What to do</th></tr>
<tr><td>up / up</td><td>Working</td><td>Check counters if users still complain</td></tr>
<tr><td>administratively down / down</td><td>Someone typed <code>shutdown</code> (router interfaces start this way)</td><td><code>no shutdown</code></td></tr>
<tr><td>down / down</td><td>No signal: cable unplugged or broken, far end shut down or powered off, speed mismatch, wrong or missing optic</td><td>Check cable, far end, speed settings</td></tr>
<tr><td>up / down</td><td>Signal present but Layer 2 fails; mostly serial links (encapsulation mismatch, missing clocking, keepalives)</td><td>Compare Layer 2 settings on both ends</td></tr>
<tr><td>down / down (err-disabled)</td><td>The switch shut the port because of a policy violation or fault</td><td>Find the cause, fix it, then recover</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Reading the state of a port">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">show interfaces status</text>
<line x1="320" y1="50" x2="80" y2="90" stroke="#64748b"/><line x1="320" y1="50" x2="240" y2="90" stroke="#64748b"/><line x1="320" y1="50" x2="400" y2="90" stroke="#64748b"/><line x1="320" y1="50" x2="560" y2="90" stroke="#64748b"/>
<rect x="10" y="90" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="80" y="115" text-anchor="middle" class="svg-ink" font-size="13">connected</text>
<rect x="170" y="90" width="140" height="40" rx="8" fill="#fde68a"/><text x="240" y="115" text-anchor="middle" class="svg-ink" font-size="13">notconnect</text>
<rect x="330" y="90" width="140" height="40" rx="8" fill="#bae6fd"/><text x="400" y="115" text-anchor="middle" class="svg-ink" font-size="13">disabled</text>
<rect x="490" y="90" width="140" height="40" rx="8" fill="#fed7aa"/><text x="560" y="115" text-anchor="middle" class="svg-ink" font-size="13">err-disabled</text>
<text x="80" y="155" text-anchor="middle" class="svg-muted" font-size="12">check duplex,</text><text x="80" y="172" text-anchor="middle" class="svg-muted" font-size="12">speed, counters</text>
<text x="240" y="155" text-anchor="middle" class="svg-muted" font-size="12">cable, far end,</text><text x="240" y="172" text-anchor="middle" class="svg-muted" font-size="12">optic, speed</text>
<text x="400" y="155" text-anchor="middle" class="svg-muted" font-size="12">no shutdown</text>
<text x="560" y="155" text-anchor="middle" class="svg-muted" font-size="12">read reason,</text><text x="560" y="172" text-anchor="middle" class="svg-muted" font-size="12">fix, then recover</text>
</svg><p class="cap">Each switch port state points to a different first action.</p></div>

<h3>show ip interface brief: the one-line view</h3>
<pre class="out">R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
<span class="hl">FastEthernet0/0        10.0.12.1       YES manual up                    up</span>
FastEthernet0/1        unassigned      YES unset  administratively down down

SW1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
Vlan1                  10.0.12.2       YES manual up                    up
FastEthernet0/1        unassigned      YES unset  up                    up
FastEthernet0/2        unassigned      YES unset  down                  down</pre>
<p>This works on routers and switches and shows IP addresses, but not speed, duplex or VLAN.</p>

<h3>show interfaces status: the switch engineer's favourite</h3>
<pre class="out">SW1# show interfaces status
Port      Name       Status       Vlan       Duplex  Speed Type
<span class="hl">Fa0/1     UPLINK-R1  connected    1            full    100 10/100BaseTX</span>
Fa0/2                notconnect   1            auto   auto 10/100BaseTX
Fa0/3                disabled     1            auto   auto 10/100BaseTX
Fa0/4                connected    20         a-full  a-100 10/100BaseTX
Fa0/5                err-disabled 1            auto   auto 10/100BaseTX
Fa0/6                inactive     30           auto   auto 10/100BaseTX</pre>
<dl class="terms">
<dt>connected</dt><dd>Up/up. Look at Duplex and Speed: <code>a-</code> means negotiated. Fa0/1 shows <code>full 100</code> without <code>a-</code>, so it is hard-coded, which is the first clue in this module's lab.</dd>
<dt>notconnect</dt><dd>No link: nothing plugged in, bad cable, far end down, or speed mismatch.</dd>
<dt>disabled</dt><dd>Administratively shut down.</dd>
<dt>err-disabled</dt><dd>Shut down by the switch itself.</dd>
<dt>inactive</dt><dd>The access VLAN (30 here) does not exist on the switch, so the port forwards nothing. You will see this in the VLAN module.</dd>
</dl>

<h3>show interfaces: the full story</h3>
<p><code>show interfaces fa0/1</code> starts with the state line, then hardware, description, MTU and bandwidth, then the duplex and speed line, then rates and counters (chapter 9).</p>
<pre class="out">SW1# show interfaces fa0/1
<span class="hl">FastEthernet0/1 is up, line protocol is up (connected)</span>
  Hardware is Fast Ethernet, address is 0019.e86a.6f81 (bia 0019.e86a.6f81)
  Description: UPLINK-R1
  MTU 1500 bytes, BW 100000 Kbit/sec, DLY 100 usec,
     reliability 255/255, txload 1/255, rxload 1/255
  Encapsulation ARPA, loopback not set
<span class="hl">  Full-duplex, 100Mb/s, media type is 10/100BaseTX</span>
  Last input 00:00:01, output 00:00:00, output hang never
  Last clearing of "show interface" counters never</pre>
<p><b>reliability</b> 255/255 is perfect; it drops as errors grow. <b>txload/rxload</b> show utilisation out of 255. <b>Last clearing ... never</b> warns you that the counters may include errors from months ago.</p>

<h3>err-disabled: a preview</h3>
<p>Some features protect the network by shutting a port the moment something dangerous happens: <b>port security</b> violations, <b>BPDU Guard</b> receiving a BPDU on a PortFast port, <b>UDLD</b> finding a one-way fibre, and <b>link-flap</b> detection when a port goes up and down too often (by default 5 flaps in 10 seconds on Catalyst). The port shows <code>err-disabled</code> and a log message names the cause:</p>
<pre class="out">%PM-4-ERR_DISABLE: link-flap error detected on Fa0/5, putting Fa0/5 in err-disable state

SW1# show interfaces status err-disabled
Port      Name       Status       Reason               Err-disabled Vlans
<span class="hl">Fa0/5                err-disabled link-flap</span></pre>
<p>Recovery: first fix the cause (here, a faulty cable), then bounce the port with <code>shutdown</code> and <code>no shutdown</code>. Optionally, automatic recovery can be enabled per cause:</p>
<pre class="code">SW1(config)# errdisable recovery cause link-flap
SW1(config)# errdisable recovery interval 300     <span class="c">! seconds, default 300</span>
SW1(config)# interface fa0/5
SW1(config-if)# shutdown
SW1(config-if)# no shutdown</pre>
<p>Port security and BPDU Guard are covered in depth in the Layer 2 security and STP modules.</p>

<div class="eg"><p><b>Worked example.</b> A user on Fa0/2 reports no network. <code>show interfaces status</code> shows Fa0/2 <code>notconnect</code>. The PC's NIC light is off too. You swap the patch cord and the port becomes <code>connected a-full a-100</code>. If it had shown <code>disabled</code>, the fix would be <code>no shutdown</code>; if <code>err-disabled</code>, you would read the reason first.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Typing <code>no shutdown</code> on an err-disabled port without fixing the cause: it goes straight back to err-disabled. Confusing <code>notconnect</code> (Layer 1, no signal) with <code>disabled</code> (configuration). Trusting counters without checking when they were last cleared.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Administratively down" always means the <code>shutdown</code> command. An unplugged cable gives down/down, shown as <code>notconnect</code> on a switch. A speed mismatch also gives down/down; a duplex mismatch gives up/up.</p></div>

<div class="scn"><h4>The port that kept switching itself off</h4><p>A meeting room port kept going dead every morning. <code>show interfaces status</code> showed <code>err-disabled</code>, and the log said <code>link-flap error detected on Fa0/5</code>. Someone had been bouncing it back with <code>shutdown</code>/<code>no shutdown</code> daily. The engineer tested the wall cable and found a loose termination in the wall outlet that made the link flap whenever someone moved the table. After re-terminating, the port stayed connected and no more err-disable events occurred.</p><p><b>Lesson:</b> err-disabled is a symptom with a named cause. Read the reason and fix the root cause before recovering the port.</p></div>

<div class="iv"><p class="q">"What is the difference between administratively down, down/down and err-disabled?"</p><p>Strong answer: administratively down means someone configured <code>shutdown</code>; fix with <code>no shutdown</code>. Down/down means no Layer 1 signal: cable, far end, optic, or a speed mismatch. Err-disabled means the switch disabled the port because a feature detected a problem such as port security, BPDU Guard, UDLD or link flap; check <code>show interfaces status err-disabled</code> for the reason, fix it, then shut/no shut or use errdisable recovery. Mention up/down on serial links for encapsulation mismatches.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Status is Layer 1, protocol is Layer 2; read both.</li>
<li><code>show ip interface brief</code>: state and IP. <code>show interfaces status</code>: state, VLAN, duplex, speed, type.</li>
<li>Switch states: connected, notconnect, disabled, err-disabled, inactive.</li>
<li><code>a-</code> means negotiated; values without it are hard-coded.</li>
<li>err-disabled: find the reason, fix it, then shut/no shut or use <code>errdisable recovery</code>.</li>
</ul></div>
`,hi:`
<p>Hospital ward ke darwaaze par ek board hota hai: har bed, aur uske saamne "occupied", "empty", "cleaning" ya "isolated". Nurse ek nazar daalti hai aur jaan jaati hai kahan jaana hai. Interface status commands aapke switch aur router ke liye wahi board hain. Das second mein woh batate hain kaunse ports chal rahe hain, kaunse khaali hain, kaunse kisi ne band kiye, aur kaunse switch ne khud isolation mein daal diye.</p>

<h3>Do shabd: status aur protocol</h3>
<p>Har IOS interface do states report karta hai, jo aap pehli baar IOS module mein mile the:</p>
<ul>
<li><b>Status (line)</b>: Layer 1. Kya working physical signal hai?</li>
<li><b>Protocol (line protocol)</b>: Layer 2. Kya data link chal raha hai? Ethernet par yeh aam taur par line status ko follow karta hai.</li>
</ul>
<table class="cmp"><tr><th>Status / Protocol</th><th>Aam matlab</th><th>Kya karein</th></tr>
<tr><td>up / up</td><td>Chal raha hai</td><td>Agar users phir bhi complain karein to counters check karo</td></tr>
<tr><td>administratively down / down</td><td>Kisi ne <code>shutdown</code> type kiya (router interfaces aise hi start hote hain)</td><td><code>no shutdown</code></td></tr>
<tr><td>down / down</td><td>Signal nahi: cable nikla ya toota, far end shutdown ya power off, speed mismatch, galat ya missing optic</td><td>Cable, far end, speed settings check karo</td></tr>
<tr><td>up / down</td><td>Signal hai lekin Layer 2 fail; zyada tar serial links (encapsulation mismatch, clocking missing, keepalives)</td><td>Dono ends par Layer 2 settings compare karo</td></tr>
<tr><td>down / down (err-disabled)</td><td>Switch ne policy violation ya fault ki wajah se port band kiya</td><td>Cause dhoondo, fix karo, phir recover karo</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Port ki state padhna">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">show interfaces status</text>
<line x1="320" y1="50" x2="80" y2="90" stroke="#64748b"/><line x1="320" y1="50" x2="240" y2="90" stroke="#64748b"/><line x1="320" y1="50" x2="400" y2="90" stroke="#64748b"/><line x1="320" y1="50" x2="560" y2="90" stroke="#64748b"/>
<rect x="10" y="90" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="80" y="115" text-anchor="middle" class="svg-ink" font-size="13">connected</text>
<rect x="170" y="90" width="140" height="40" rx="8" fill="#fde68a"/><text x="240" y="115" text-anchor="middle" class="svg-ink" font-size="13">notconnect</text>
<rect x="330" y="90" width="140" height="40" rx="8" fill="#bae6fd"/><text x="400" y="115" text-anchor="middle" class="svg-ink" font-size="13">disabled</text>
<rect x="490" y="90" width="140" height="40" rx="8" fill="#fed7aa"/><text x="560" y="115" text-anchor="middle" class="svg-ink" font-size="13">err-disabled</text>
<text x="80" y="155" text-anchor="middle" class="svg-muted" font-size="12">duplex, speed,</text><text x="80" y="172" text-anchor="middle" class="svg-muted" font-size="12">counters dekho</text>
<text x="240" y="155" text-anchor="middle" class="svg-muted" font-size="12">cable, far end,</text><text x="240" y="172" text-anchor="middle" class="svg-muted" font-size="12">optic, speed</text>
<text x="400" y="155" text-anchor="middle" class="svg-muted" font-size="12">no shutdown</text>
<text x="560" y="155" text-anchor="middle" class="svg-muted" font-size="12">reason padho,</text><text x="560" y="172" text-anchor="middle" class="svg-muted" font-size="12">fix, phir recover</text>
</svg><p class="cap">Har switch port state ek alag pehla action batati hai.</p></div>

<h3>show ip interface brief: ek line ka view</h3>
<pre class="out">R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
<span class="hl">FastEthernet0/0        10.0.12.1       YES manual up                    up</span>
FastEthernet0/1        unassigned      YES unset  administratively down down

SW1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
Vlan1                  10.0.12.2       YES manual up                    up
FastEthernet0/1        unassigned      YES unset  up                    up
FastEthernet0/2        unassigned      YES unset  down                  down</pre>
<p>Yeh routers aur switches dono par chalta hai aur IP addresses dikhata hai, lekin speed, duplex ya VLAN nahi.</p>

<h3>show interfaces status: switch engineer ka favourite</h3>
<pre class="out">SW1# show interfaces status
Port      Name       Status       Vlan       Duplex  Speed Type
<span class="hl">Fa0/1     UPLINK-R1  connected    1            full    100 10/100BaseTX</span>
Fa0/2                notconnect   1            auto   auto 10/100BaseTX
Fa0/3                disabled     1            auto   auto 10/100BaseTX
Fa0/4                connected    20         a-full  a-100 10/100BaseTX
Fa0/5                err-disabled 1            auto   auto 10/100BaseTX
Fa0/6                inactive     30           auto   auto 10/100BaseTX</pre>
<dl class="terms">
<dt>connected</dt><dd>Up/up. Duplex aur Speed dekho: <code>a-</code> ka matlab negotiated. Fa0/1 bina <code>a-</code> ke <code>full 100</code> dikhata hai, yaani hard-coded, jo is module ki lab ka pehla clue hai.</dd>
<dt>notconnect</dt><dd>Link nahi: kuch plug nahi, kharab cable, far end down, ya speed mismatch.</dd>
<dt>disabled</dt><dd>Administratively shut down.</dd>
<dt>err-disabled</dt><dd>Switch ne khud band kiya.</dd>
<dt>inactive</dt><dd>Access VLAN (yahan 30) switch par exist nahi karta, isliye port kuch forward nahi karta. Yeh aap VLAN module mein dekhoge.</dd>
</dl>

<h3>show interfaces: poori kahani</h3>
<p><code>show interfaces fa0/1</code> state line se shuru hota hai, phir hardware, description, MTU aur bandwidth, phir duplex aur speed wali line, phir rates aur counters (chapter 9).</p>
<pre class="out">SW1# show interfaces fa0/1
<span class="hl">FastEthernet0/1 is up, line protocol is up (connected)</span>
  Hardware is Fast Ethernet, address is 0019.e86a.6f81 (bia 0019.e86a.6f81)
  Description: UPLINK-R1
  MTU 1500 bytes, BW 100000 Kbit/sec, DLY 100 usec,
     reliability 255/255, txload 1/255, rxload 1/255
  Encapsulation ARPA, loopback not set
<span class="hl">  Full-duplex, 100Mb/s, media type is 10/100BaseTX</span>
  Last input 00:00:01, output 00:00:00, output hang never
  Last clearing of "show interface" counters never</pre>
<p><b>reliability</b> 255/255 perfect hai; errors badhne par yeh girti hai. <b>txload/rxload</b> 255 mein se utilisation dikhate hain. <b>Last clearing ... never</b> aapko warn karta hai ki counters mein mahino purane errors bhi ho sakte hain.</p>

<h3>err-disabled: ek preview</h3>
<p>Kuch features network ko bachane ke liye kuch khatarnaak hote hi port band kar dete hain: <b>port security</b> violations, PortFast port par BPDU milne par <b>BPDU Guard</b>, one-way fibre milne par <b>UDLD</b>, aur <b>link-flap</b> detection jab port bahut baar up-down ho (Catalyst par default 10 second mein 5 flaps). Port <code>err-disabled</code> dikhata hai aur log message cause ka naam batata hai:</p>
<pre class="out">%PM-4-ERR_DISABLE: link-flap error detected on Fa0/5, putting Fa0/5 in err-disable state

SW1# show interfaces status err-disabled
Port      Name       Status       Reason               Err-disabled Vlans
<span class="hl">Fa0/5                err-disabled link-flap</span></pre>
<p>Recovery: pehle cause fix karo (yahan kharab cable), phir <code>shutdown</code> aur <code>no shutdown</code> se port bounce karo. Chahein to har cause ke liye automatic recovery enable ho sakti hai:</p>
<pre class="code">SW1(config)# errdisable recovery cause link-flap
SW1(config)# errdisable recovery interval 300     <span class="c">! seconds, default 300</span>
SW1(config)# interface fa0/5
SW1(config-if)# shutdown
SW1(config-if)# no shutdown</pre>
<p>Port security aur BPDU Guard Layer 2 security aur STP modules mein detail mein cover hote hain.</p>

<div class="eg"><p><b>Worked example.</b> Fa0/2 par ek user network nahi hone ki report karta hai. <code>show interfaces status</code> Fa0/2 ko <code>notconnect</code> dikhata hai. PC ke NIC ki light bhi off hai. Aap patch cord badalte ho aur port <code>connected a-full a-100</code> ho jaata hai. Agar <code>disabled</code> dikhta, to fix <code>no shutdown</code> hota; agar <code>err-disabled</code>, to aap pehle reason padhte.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Cause fix kiye bina err-disabled port par <code>no shutdown</code> type karna: woh seedha wapas err-disabled ho jaata hai. <code>notconnect</code> (Layer 1, signal nahi) ko <code>disabled</code> (configuration) se confuse karna. Counters par bina check kiye bharosa karna ki woh aakhri baar kab clear hue.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Administratively down" ka matlab hamesha <code>shutdown</code> command. Nikla hua cable down/down deta hai, switch par <code>notconnect</code> dikhta hai. Speed mismatch bhi down/down deta hai; duplex mismatch up/up deta hai.</p></div>

<div class="scn"><h4>Woh port jo khud ko band karta rehta tha</h4><p>Ek meeting room ka port har subah dead ho jaata tha. <code>show interfaces status</code> mein <code>err-disabled</code> dikha, aur log mein <code>link-flap error detected on Fa0/5</code> tha. Koi roz <code>shutdown</code>/<code>no shutdown</code> se use wapas la raha tha. Engineer ne wall cable test ki aur wall outlet mein loose termination paaya jo table hilne par link flap karta tha. Re-terminate karne ke baad port connected raha aur aur koi err-disable event nahi hua.</p><p><b>Seekh:</b> err-disabled ek symptom hai jiske cause ka naam hota hai. Reason padho aur port recover karne se pehle root cause fix karo.</p></div>

<div class="iv"><p class="q">"Administratively down, down/down aur err-disabled mein kya farak hai?"</p><p>Strong answer: administratively down ka matlab kisi ne <code>shutdown</code> configure kiya; <code>no shutdown</code> se fix karo. Down/down ka matlab Layer 1 signal nahi: cable, far end, optic, ya speed mismatch. Err-disabled ka matlab switch ne port disable kiya kyunki kisi feature ne problem detect ki jaise port security, BPDU Guard, UDLD ya link flap; reason ke liye <code>show interfaces status err-disabled</code> check karo, fix karo, phir shut/no shut ya errdisable recovery use karo. Encapsulation mismatch ke liye serial links par up/down ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Status Layer 1 hai, protocol Layer 2; dono padho.</li>
<li><code>show ip interface brief</code>: state aur IP. <code>show interfaces status</code>: state, VLAN, duplex, speed, type.</li>
<li>Switch states: connected, notconnect, disabled, err-disabled, inactive.</li>
<li><code>a-</code> ka matlab negotiated; iske bina values hard-coded.</li>
<li>err-disabled: reason dhoondo, fix karo, phir shut/no shut ya <code>errdisable recovery</code> use karo.</li>
</ul></div>
`}};export{e as default};