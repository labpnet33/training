var e={id:`marking`,h:{en:`Marking at Layer 2 and Layer 3: CoS, Precedence, DSCP and ECN`,hi:`Layer 2 aur Layer 3 par marking: CoS, Precedence, DSCP aur ECN`},body:{en:`
<p>Courier companies print a colour band on every parcel: red for express, yellow for normal, grey for bulk. A sorter three cities later reads the band in half a second without opening the parcel or checking the sender. Marking is that colour band. The band is written once, near the source, and every later device simply reads it. There are two places to write it: in the Ethernet frame (Layer 2) and in the IP header (Layer 3).</p>

<h3>Layer 2: CoS in the 802.1Q tag</h3>
<p>You met the 4-byte 802.1Q tag in the VLAN chapters. Inside it, the <b>PCP</b> (Priority Code Point) field has <b>3 bits</b>, giving the <b>Class of Service (CoS)</b> values 0 to 7. The next bit is DEI (drop eligible), then the 12-bit VLAN ID.</p>
<div class="dia"><svg viewBox="0 0 660 150" role="img" aria-label="802.1Q tag fields">
<rect x="10" y="30" width="170" height="50" fill="#e2e8f0"/><text x="95" y="52" text-anchor="middle" class="svg-ink" font-size="12">TPID 0x8100</text><text x="95" y="68" text-anchor="middle" class="svg-muted" font-size="11">16 bits</text>
<rect x="180" y="30" width="110" height="50" fill="#fde68a"/><text x="235" y="52" text-anchor="middle" class="svg-ink" font-size="12">PCP = CoS</text><text x="235" y="68" text-anchor="middle" class="svg-muted" font-size="11">3 bits, 0 to 7</text>
<rect x="290" y="30" width="60" height="50" fill="#bae6fd"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="12">DEI</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="11">1 bit</text>
<rect x="350" y="30" width="200" height="50" fill="#ddd6fe"/><text x="450" y="52" text-anchor="middle" class="svg-ink" font-size="12">VLAN ID</text><text x="450" y="68" text-anchor="middle" class="svg-muted" font-size="11">12 bits</text>
<text x="330" y="115" text-anchor="middle" class="svg-accent" font-size="12">CoS exists only in a tagged frame (trunk, or voice VLAN on an access port)</text>
<text x="330" y="135" text-anchor="middle" class="svg-muted" font-size="11">A router removes the Layer 2 header at every hop, so CoS does not cross a routed link.</text>
</svg><p class="cap">The 16 bits after the TPID are the Tag Control Information.</p></div>
<p>CoS is simple but limited. It exists only on trunks, so it disappears when a router builds a new frame, and it has only 8 values. Layer 3 markings travel end to end.</p>

<h3>Layer 3: the ToS byte, IP Precedence, DSCP and ECN</h3>
<p>The IPv4 header has a one-byte field that was originally the <b>Type of Service (ToS)</b> byte. IPv6 calls the same byte <b>Traffic Class</b>. It is interpreted in two ways.</p>
<div class="dia"><svg viewBox="0 0 660 190" role="img" aria-label="ToS byte layout">
<g font-size="12">
<rect x="20" y="20" width="60" height="36" fill="#fde68a"/><text x="50" y="43" text-anchor="middle" class="svg-ink">b7</text>
<rect x="80" y="20" width="60" height="36" fill="#fde68a"/><text x="110" y="43" text-anchor="middle" class="svg-ink">b6</text>
<rect x="140" y="20" width="60" height="36" fill="#fde68a"/><text x="170" y="43" text-anchor="middle" class="svg-ink">b5</text>
<rect x="200" y="20" width="60" height="36" fill="#bae6fd"/><text x="230" y="43" text-anchor="middle" class="svg-ink">b4</text>
<rect x="260" y="20" width="60" height="36" fill="#bae6fd"/><text x="290" y="43" text-anchor="middle" class="svg-ink">b3</text>
<rect x="320" y="20" width="60" height="36" fill="#bae6fd"/><text x="350" y="43" text-anchor="middle" class="svg-ink">b2</text>
<rect x="380" y="20" width="60" height="36" fill="#fecaca"/><text x="410" y="43" text-anchor="middle" class="svg-ink">b1</text>
<rect x="440" y="20" width="60" height="36" fill="#fecaca"/><text x="470" y="43" text-anchor="middle" class="svg-ink">b0</text>
</g>
<path d="M20 70 H200" stroke="#ca8a04" stroke-width="3"/><text x="110" y="90" text-anchor="middle" class="svg-ink" font-size="12">IP Precedence (3 bits)</text>
<path d="M20 110 H380" stroke="#0284c7" stroke-width="3"/><text x="200" y="130" text-anchor="middle" class="svg-ink" font-size="12">DSCP (6 bits)</text>
<path d="M380 70 H500" stroke="#dc2626" stroke-width="3"/><text x="440" y="90" text-anchor="middle" class="svg-ink" font-size="12">ECN (2 bits)</text>
<text x="330" y="168" text-anchor="middle" class="svg-muted" font-size="11">DSCP = ToS byte divided by 4. Precedence = the first three bits of DSCP.</text>
</svg><p class="cap">The same eight bits, read as the old 3-bit Precedence or as the modern 6-bit DSCP plus 2 ECN bits.</p></div>
<dl class="terms">
<dt>IP Precedence</dt><dd>The original 3-bit view, values 0 to 7: 0 routine, 1 priority, 2 immediate, 3 flash, 4 flash-override, 5 critical, 6 internet, 7 network. Still used for backward compatibility.</dd>
<dt>DSCP</dt><dd>Differentiated Services Code Point, the 6-bit view, values 0 to 63. It allows far more classes and, for the Assured Forwarding family, a drop precedence inside each class.</dd>
<dt>ECN</dt><dd>Explicit Congestion Notification uses the last two bits. <code>00</code> means the flow does not support ECN; <code>10</code> and <code>01</code> mean ECN-capable (ECT(0) and ECT(1)); <code>11</code> means Congestion Experienced (CE). A congested router can set CE instead of dropping, and the endpoints slow down. For CCNA it is enough to know that ECN is the last two bits and is not part of the DSCP value.</dd>
</dl>

<h3>The common values</h3>
<div class="tbl"><table>
<tr><th>Name</th><th>DSCP</th><th>Binary</th><th>ToS byte</th><th>Prec</th><th>Typical use</th></tr>
<tr><td>Default (CS0)</td><td>0</td><td>000000</td><td>0</td><td>0</td><td>Best effort, everything unmarked</td></tr>
<tr><td>CS1</td><td>8</td><td>001000</td><td>32</td><td>1</td><td>Scavenger, background</td></tr>
<tr><td>AF11 / AF12 / AF13</td><td>10 / 12 / 14</td><td>001010 / 001100 / 001110</td><td>40 / 48 / 56</td><td>1</td><td>Bulk data</td></tr>
<tr><td>CS2</td><td>16</td><td>010000</td><td>64</td><td>2</td><td>Network management (OAM)</td></tr>
<tr><td>AF21 / AF22 / AF23</td><td>18 / 20 / 22</td><td>010010 / 010100 / 010110</td><td>72 / 80 / 88</td><td>2</td><td>Transactional data</td></tr>
<tr><td>CS3</td><td>24</td><td>011000</td><td>96</td><td>3</td><td>Call signalling</td></tr>
<tr><td>AF31 / AF32 / AF33</td><td>26 / 28 / 30</td><td>011010 / 011100 / 011110</td><td>104 / 112 / 120</td><td>3</td><td>Streaming video, critical apps</td></tr>
<tr><td>CS4</td><td>32</td><td>100000</td><td>128</td><td>4</td><td>Real-time interactive</td></tr>
<tr><td>AF41 / AF42 / AF43</td><td>34 / 36 / 38</td><td>100010 / 100100 / 100110</td><td>136 / 144 / 152</td><td>4</td><td>Interactive video</td></tr>
<tr><td>CS5</td><td>40</td><td>101000</td><td>160</td><td>5</td><td>Broadcast video</td></tr>
<tr><td><b>EF</b></td><td><b>46</b></td><td>101110</td><td>184 (0xB8)</td><td>5</td><td><b>Voice bearer</b></td></tr>
<tr><td>CS6</td><td>48</td><td>110000</td><td>192</td><td>6</td><td>Network control (routing protocols)</td></tr>
<tr><td>CS7</td><td>56</td><td>111000</td><td>224</td><td>7</td><td>Reserved</td></tr>
</table></div>
<p>The common CoS pairing is: CoS 5 for voice, CoS 4 for video, CoS 3 for call signalling, CoS 6 and 7 for network control, CoS 0 for everything else. Be careful: on Catalyst switches the default CoS-to-DSCP map is 0, 8, 16, 24, 32, 40, 48, 56, so CoS 5 becomes DSCP 40 by default, not 46. Sites that mark voice as EF either trust DSCP or edit the map.</p>

<h3>Converting between the forms</h3>
<div class="eg"><p><b>DSCP to binary to ToS.</b> Take EF, DSCP 46. Break 46 into powers of two: 32 + 8 + 4 + 2, so the six bits are <code>101110</code>. Add the two ECN bits <code>00</code> to get the byte <code>10111000</code>, which is 128 + 32 + 16 + 8 = <b>184</b> or 0xB8. Shortcut: ToS = DSCP x 4. Precedence is the first three bits, <code>101</code> = 5. So EF is DSCP 46, precedence 5, ToS 184.</p>
<p><b>ToS back to a name.</b> A capture shows ToS 0x88, which is 136. Divide by 4: DSCP 34 = <code>100010</code>. The first three bits are 100, so class 4; the next two bits are 01, so drop precedence 1; the last bit is always 0. That is <b>AF41</b>. In the AF formula, DSCP = 8 x class + 2 x drop precedence = 32 + 2 = 34.</p>
<p><b>With ECN.</b> ToS 186 is 184 + 2, DSCP 46 with ECT(0): still EF, and the sender supports ECN. ToS 187 would be EF with CE set.</p></div>

<h3>Marking on the simulator</h3>
<p>The host <code>traffic</code> command can write a DSCP onto test flows, using a name or a number. The simulator echoes the number and the name, which is a quick check of the table above.</p>
<pre class="code">PHONE> traffic 10.20.0.100 udp/20000 400 20 dscp ef
PHONE> traffic 10.20.0.100 udp/20001 4000 20 dscp af41
PHONE> traffic 10.20.0.100 tcp/5060 50 20 dscp cs3
PHONE> traffic 10.20.0.100 tcp/443 100 20 dscp af21 size 800
PHONE> traffic 10.20.0.100 tcp/445 100 20 dscp 10
PHONE> traffic 10.20.0.100 udp/9 100 20 dscp cs1</pre>
<pre class="out">Flow 1: 10.10.10.10 -> 10.20.0.100 UDP dport 20000, DSCP 46 (EF), 400 kbps for 20 s
Flow 2: 10.10.10.10 -> 10.20.0.100 UDP dport 20001, DSCP 34 (AF41), 4000 kbps for 20 s
Flow 3: 10.10.10.10 -> 10.20.0.100 TCP dport 5060, DSCP 24 (CS3), 50 kbps for 20 s
Flow 4: 10.10.10.10 -> 10.20.0.100 TCP dport 443, DSCP 18 (AF21), 100 kbps for 20 s
Flow 5: 10.10.10.10 -> 10.20.0.100 TCP dport 445, DSCP 10 (AF11), 100 kbps for 20 s
Flow 6: 10.10.10.10 -> 10.20.0.100 UDP dport 9, DSCP 8 (CS1), 100 kbps for 20 s</pre>
<p>On a router the marking is done by a policy with <code>set dscp</code> (chapter 8). <code>set cos</code> and <code>set precedence</code> exist as well, but DSCP is what modern designs use.</p>

<div class="warn"><p><b>Common mistakes.</b> Believing CoS survives a router. Reading the ToS byte as the DSCP value (it is four times larger). Writing "DSCP 46" in a design but "CoS 46" in a config: CoS tops out at 7. Forgetting that AF class number does not mean priority by itself; queuing does that, as the next chapter explains.</p></div>

<div class="exam"><p><b>Exam traps.</b> CoS = 3 bits in the 802.1Q tag, Layer 2, trunks only. DSCP = 6 bits, IP header, Layer 3. EF = 46 = voice. CS3 = 24 = call signalling. Default = 0. AF41 = 34. Precedence = first 3 bits of DSCP. The ToS byte = DSCP x 4. IPv6 uses the Traffic Class byte the same way.</p></div>

<div class="scn"><h4>The capture that said 184</h4><p>A junior engineer opened a capture and reported "voice is marked 184, which is outside the DSCP range of 0 to 63". The senior engineer showed him the packet details in the Differentiated Services field: DSCP 0x2e (46), ECN 0, and the raw byte 0xb8. The tool was displaying the whole ToS byte in hex. Nothing was wrong; EF was correctly set.</p><p><b>Lesson:</b> always check whether a tool shows the whole byte or only the DSCP bits. Divide by 4 to convert.</p></div>

<div class="iv"><p class="q">"What are DSCP 46 and 24, and how many bits is DSCP?"</p><p>DSCP is 6 bits in the IP header. 46 is Expedited Forwarding, used for voice bearer traffic and treated as priority. 24 is CS3, commonly call signalling. Show you can convert: 46 is 101110, ToS 184, precedence 5. Mention that CoS is the Layer 2 equivalent with only 3 bits.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layer 2 marking is CoS (3-bit PCP in the 802.1Q tag); it does not cross routers.</li>
<li>Layer 3 marking is the ToS/Traffic Class byte: 6-bit DSCP plus 2-bit ECN; Precedence is the first 3 bits.</li>
<li>Key values: Default 0, CS3 24 (signalling), AF41 34 (video), EF 46 (voice), CS6 48 (network control).</li>
<li>AF formula: DSCP = 8 x class + 2 x drop precedence. ToS byte = DSCP x 4.</li>
<li>Mark on input at the edge with <code>set dscp</code>; later devices only read the value.</li>
</ul></div>
`,hi:`
<p>Courier companies har parcel par colour band chhapti hain: express ke liye laal, normal ke liye peela, bulk ke liye grey. Teen shehar baad ka sorter parcel kholkar ya sender check kiye bina aadhe second mein band padh leta hai. Marking wahi colour band hai. Band ek baar, source ke paas likhi jaati hai, aur har agla device bas use padhta hai. Likhne ki do jagah hain: Ethernet frame mein (Layer 2) aur IP header mein (Layer 3).</p>

<h3>Layer 2: 802.1Q tag mein CoS</h3>
<p>802.1Q ka 4-byte tag aap VLAN chapters mein mil chuke ho. Uske andar <b>PCP</b> (Priority Code Point) field <b>3 bits</b> ka hai, jo <b>Class of Service (CoS)</b> values 0 se 7 deta hai. Agla bit DEI (drop eligible) hai, phir 12-bit VLAN ID.</p>
<div class="dia"><svg viewBox="0 0 660 150" role="img" aria-label="802.1Q tag ke fields">
<rect x="10" y="30" width="170" height="50" fill="#e2e8f0"/><text x="95" y="52" text-anchor="middle" class="svg-ink" font-size="12">TPID 0x8100</text><text x="95" y="68" text-anchor="middle" class="svg-muted" font-size="11">16 bits</text>
<rect x="180" y="30" width="110" height="50" fill="#fde68a"/><text x="235" y="52" text-anchor="middle" class="svg-ink" font-size="12">PCP = CoS</text><text x="235" y="68" text-anchor="middle" class="svg-muted" font-size="11">3 bits, 0 se 7</text>
<rect x="290" y="30" width="60" height="50" fill="#bae6fd"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="12">DEI</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="11">1 bit</text>
<rect x="350" y="30" width="200" height="50" fill="#ddd6fe"/><text x="450" y="52" text-anchor="middle" class="svg-ink" font-size="12">VLAN ID</text><text x="450" y="68" text-anchor="middle" class="svg-muted" font-size="11">12 bits</text>
<text x="330" y="115" text-anchor="middle" class="svg-accent" font-size="12">CoS sirf tagged frame mein hota hai (trunk, ya access port par voice VLAN)</text>
<text x="330" y="135" text-anchor="middle" class="svg-muted" font-size="11">Router har hop par Layer 2 header hata deta hai, isliye CoS routed link paar nahi karta.</text>
</svg><p class="cap">TPID ke baad ke 16 bits Tag Control Information hain.</p></div>
<p>CoS simple hai lekin limited. Woh sirf trunks par hota hai, isliye router naya frame banata hai to gayab ho jaata hai, aur uski sirf 8 values hain. Layer 3 markings end to end jaati hain.</p>

<h3>Layer 3: ToS byte, IP Precedence, DSCP aur ECN</h3>
<p>IPv4 header mein ek-byte ka field hai jo originally <b>Type of Service (ToS)</b> byte tha. IPv6 usi byte ko <b>Traffic Class</b> kehta hai. Ise do tareeke se padha jaata hai.</p>
<div class="dia"><svg viewBox="0 0 660 190" role="img" aria-label="ToS byte ka layout">
<g font-size="12">
<rect x="20" y="20" width="60" height="36" fill="#fde68a"/><text x="50" y="43" text-anchor="middle" class="svg-ink">b7</text>
<rect x="80" y="20" width="60" height="36" fill="#fde68a"/><text x="110" y="43" text-anchor="middle" class="svg-ink">b6</text>
<rect x="140" y="20" width="60" height="36" fill="#fde68a"/><text x="170" y="43" text-anchor="middle" class="svg-ink">b5</text>
<rect x="200" y="20" width="60" height="36" fill="#bae6fd"/><text x="230" y="43" text-anchor="middle" class="svg-ink">b4</text>
<rect x="260" y="20" width="60" height="36" fill="#bae6fd"/><text x="290" y="43" text-anchor="middle" class="svg-ink">b3</text>
<rect x="320" y="20" width="60" height="36" fill="#bae6fd"/><text x="350" y="43" text-anchor="middle" class="svg-ink">b2</text>
<rect x="380" y="20" width="60" height="36" fill="#fecaca"/><text x="410" y="43" text-anchor="middle" class="svg-ink">b1</text>
<rect x="440" y="20" width="60" height="36" fill="#fecaca"/><text x="470" y="43" text-anchor="middle" class="svg-ink">b0</text>
</g>
<path d="M20 70 H200" stroke="#ca8a04" stroke-width="3"/><text x="110" y="90" text-anchor="middle" class="svg-ink" font-size="12">IP Precedence (3 bits)</text>
<path d="M20 110 H380" stroke="#0284c7" stroke-width="3"/><text x="200" y="130" text-anchor="middle" class="svg-ink" font-size="12">DSCP (6 bits)</text>
<path d="M380 70 H500" stroke="#dc2626" stroke-width="3"/><text x="440" y="90" text-anchor="middle" class="svg-ink" font-size="12">ECN (2 bits)</text>
<text x="330" y="168" text-anchor="middle" class="svg-muted" font-size="11">DSCP = ToS byte / 4. Precedence = DSCP ke pehle teen bits.</text>
</svg><p class="cap">Wahi aath bits, purane 3-bit Precedence ya modern 6-bit DSCP plus 2 ECN bits ki tarah padhe gaye.</p></div>
<dl class="terms">
<dt>IP Precedence</dt><dd>Original 3-bit view, values 0 se 7: 0 routine, 1 priority, 2 immediate, 3 flash, 4 flash-override, 5 critical, 6 internet, 7 network. Backward compatibility ke liye abhi bhi use hota hai.</dd>
<dt>DSCP</dt><dd>Differentiated Services Code Point, 6-bit view, values 0 se 63. Isse bahut zyada classes milti hain aur Assured Forwarding family mein har class ke andar drop precedence bhi.</dd>
<dt>ECN</dt><dd>Explicit Congestion Notification aakhri do bits use karta hai. <code>00</code> matlab flow ECN support nahi karta; <code>10</code> aur <code>01</code> matlab ECN-capable (ECT(0) aur ECT(1)); <code>11</code> matlab Congestion Experienced (CE). Congested router drop karne ki jagah CE set kar sakta hai, aur endpoints dheeme ho jaate hain. CCNA ke liye bas itna jaano ki ECN aakhri do bits hain aur DSCP value ka hissa nahi.</dd>
</dl>

<h3>Aam values</h3>
<div class="tbl"><table>
<tr><th>Naam</th><th>DSCP</th><th>Binary</th><th>ToS byte</th><th>Prec</th><th>Aam use</th></tr>
<tr><td>Default (CS0)</td><td>0</td><td>000000</td><td>0</td><td>0</td><td>Best effort, sab unmarked</td></tr>
<tr><td>CS1</td><td>8</td><td>001000</td><td>32</td><td>1</td><td>Scavenger, background</td></tr>
<tr><td>AF11 / AF12 / AF13</td><td>10 / 12 / 14</td><td>001010 / 001100 / 001110</td><td>40 / 48 / 56</td><td>1</td><td>Bulk data</td></tr>
<tr><td>CS2</td><td>16</td><td>010000</td><td>64</td><td>2</td><td>Network management (OAM)</td></tr>
<tr><td>AF21 / AF22 / AF23</td><td>18 / 20 / 22</td><td>010010 / 010100 / 010110</td><td>72 / 80 / 88</td><td>2</td><td>Transactional data</td></tr>
<tr><td>CS3</td><td>24</td><td>011000</td><td>96</td><td>3</td><td>Call signalling</td></tr>
<tr><td>AF31 / AF32 / AF33</td><td>26 / 28 / 30</td><td>011010 / 011100 / 011110</td><td>104 / 112 / 120</td><td>3</td><td>Streaming video, critical apps</td></tr>
<tr><td>CS4</td><td>32</td><td>100000</td><td>128</td><td>4</td><td>Real-time interactive</td></tr>
<tr><td>AF41 / AF42 / AF43</td><td>34 / 36 / 38</td><td>100010 / 100100 / 100110</td><td>136 / 144 / 152</td><td>4</td><td>Interactive video</td></tr>
<tr><td>CS5</td><td>40</td><td>101000</td><td>160</td><td>5</td><td>Broadcast video</td></tr>
<tr><td><b>EF</b></td><td><b>46</b></td><td>101110</td><td>184 (0xB8)</td><td>5</td><td><b>Voice bearer</b></td></tr>
<tr><td>CS6</td><td>48</td><td>110000</td><td>192</td><td>6</td><td>Network control (routing protocols)</td></tr>
<tr><td>CS7</td><td>56</td><td>111000</td><td>224</td><td>7</td><td>Reserved</td></tr>
</table></div>
<p>Aam CoS pairing: voice ke liye CoS 5, video ke liye CoS 4, call signalling ke liye CoS 3, network control ke liye CoS 6 aur 7, baaki sab ke liye CoS 0. Dhyan rakho: Catalyst switches par default CoS-to-DSCP map 0, 8, 16, 24, 32, 40, 48, 56 hai, yaani CoS 5 default mein DSCP 40 banta hai, 46 nahi. Jo sites voice ko EF mark karte hain woh ya to DSCP trust karte hain ya map edit karte hain.</p>

<h3>Forms ke beech conversion</h3>
<div class="eg"><p><b>DSCP se binary se ToS.</b> EF lo, DSCP 46. 46 ko powers of two mein todo: 32 + 8 + 4 + 2, to chhe bits <code>101110</code> hain. Do ECN bits <code>00</code> jodo to byte <code>10111000</code> banta hai, jo 128 + 32 + 16 + 8 = <b>184</b> ya 0xB8 hai. Shortcut: ToS = DSCP x 4. Precedence pehle teen bits hain, <code>101</code> = 5. To EF matlab DSCP 46, precedence 5, ToS 184.</p>
<p><b>ToS se wapas naam.</b> Capture mein ToS 0x88 dikha, jo 136 hai. 4 se bhaag do: DSCP 34 = <code>100010</code>. Pehle teen bits 100 hain, yaani class 4; agle do bits 01 hain, yaani drop precedence 1; aakhri bit hamesha 0. Yeh <b>AF41</b> hai. AF formula mein DSCP = 8 x class + 2 x drop precedence = 32 + 2 = 34.</p>
<p><b>ECN ke saath.</b> ToS 186 matlab 184 + 2, DSCP 46 aur ECT(0): phir bhi EF, aur sender ECN support karta hai. ToS 187 mein EF ke saath CE set hota.</p></div>

<h3>Simulator par marking</h3>
<p>Host ka <code>traffic</code> command test flows par DSCP likh sakta hai, naam ya number se. Simulator number aur naam dono echo karta hai, jo upar ki table ki quick check hai.</p>
<pre class="code">PHONE> traffic 10.20.0.100 udp/20000 400 20 dscp ef
PHONE> traffic 10.20.0.100 udp/20001 4000 20 dscp af41
PHONE> traffic 10.20.0.100 tcp/5060 50 20 dscp cs3
PHONE> traffic 10.20.0.100 tcp/443 100 20 dscp af21 size 800
PHONE> traffic 10.20.0.100 tcp/445 100 20 dscp 10
PHONE> traffic 10.20.0.100 udp/9 100 20 dscp cs1</pre>
<pre class="out">Flow 1: 10.10.10.10 -> 10.20.0.100 UDP dport 20000, DSCP 46 (EF), 400 kbps for 20 s
Flow 2: 10.10.10.10 -> 10.20.0.100 UDP dport 20001, DSCP 34 (AF41), 4000 kbps for 20 s
Flow 3: 10.10.10.10 -> 10.20.0.100 TCP dport 5060, DSCP 24 (CS3), 50 kbps for 20 s
Flow 4: 10.10.10.10 -> 10.20.0.100 TCP dport 443, DSCP 18 (AF21), 100 kbps for 20 s
Flow 5: 10.10.10.10 -> 10.20.0.100 TCP dport 445, DSCP 10 (AF11), 100 kbps for 20 s
Flow 6: 10.10.10.10 -> 10.20.0.100 UDP dport 9, DSCP 8 (CS1), 100 kbps for 20 s</pre>
<p>Router par marking <code>set dscp</code> wali policy se hoti hai (chapter 8). <code>set cos</code> aur <code>set precedence</code> bhi hain, lekin modern designs DSCP use karte hain.</p>

<div class="warn"><p><b>Common galtiyan.</b> Maan lena ki CoS router paar karta hai. ToS byte ko DSCP value padh lena (woh chaar guna bada hota hai). Design mein "DSCP 46" likhna lekin config mein "CoS 46": CoS 7 par khatam hota hai. Yeh bhool jaana ki AF class number akela priority nahi deta; queuing deti hai, jaisa agla chapter samjhata hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> CoS = 802.1Q tag ke 3 bits, Layer 2, sirf trunks. DSCP = 6 bits, IP header, Layer 3. EF = 46 = voice. CS3 = 24 = call signalling. Default = 0. AF41 = 34. Precedence = DSCP ke pehle 3 bits. ToS byte = DSCP x 4. IPv6 Traffic Class byte ko isi tarah use karta hai.</p></div>

<div class="scn"><h4>Woh capture jisme 184 dikha</h4><p>Ek junior engineer ne capture kholkar report kiya "voice 184 mark hai, jo DSCP range 0 se 63 se bahar hai". Senior ne use Differentiated Services field ki packet details dikhayi: DSCP 0x2e (46), ECN 0, aur raw byte 0xb8. Tool poora ToS byte hex mein dikha raha tha. Kuch galat nahi tha; EF sahi set tha.</p><p><b>Seekh:</b> hamesha check karo ki tool poora byte dikha raha hai ya sirf DSCP bits. Convert karne ke liye 4 se bhaag do.</p></div>

<div class="iv"><p class="q">"DSCP 46 aur 24 kya hain, aur DSCP kitne bits ka hota hai?"</p><p>DSCP IP header mein 6 bits ka hai. 46 Expedited Forwarding hai, voice bearer traffic ke liye aur priority treat hota hai. 24 CS3 hai, aam taur par call signalling. Conversion dikhao: 46 matlab 101110, ToS 184, precedence 5. Batao ki CoS Layer 2 ka equivalent hai jisme sirf 3 bits hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layer 2 marking CoS hai (802.1Q tag ka 3-bit PCP); woh routers paar nahi karti.</li>
<li>Layer 3 marking ToS/Traffic Class byte hai: 6-bit DSCP plus 2-bit ECN; Precedence pehle 3 bits hain.</li>
<li>Key values: Default 0, CS3 24 (signalling), AF41 34 (video), EF 46 (voice), CS6 48 (network control).</li>
<li>AF formula: DSCP = 8 x class + 2 x drop precedence. ToS byte = DSCP x 4.</li>
<li>Edge par input mein <code>set dscp</code> se mark karo; baad ke devices sirf value padhte hain.</li>
</ul></div>
`}};export{e as default};