var e={id:`markings`,h:{en:`The markings: IP precedence, DSCP and CoS`,hi:`Markings: IP precedence, DSCP aur CoS`},body:{en:`
<p>A marking is a number written into a packet's header so that every device downstream can read the class without redoing the classification. There are two places to write that number: in the IP header (Layer 3) and in the Ethernet VLAN tag (Layer 2). This chapter explains both, the names you must know (EF, AF, CS) and how the Layer 2 and Layer 3 values map to each other.</p>

<h3>The ToS byte and DSCP</h3>
<p>The IPv4 header has a one-byte field originally called <b>Type of Service (ToS)</b>. Today it is split into two parts: the upper <b>6 bits are the DSCP</b> (Differentiated Services Code Point) and the lower 2 bits are used for ECN (explicit congestion notification), which we ignore in this module.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="ToS byte layout">
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="14">IPv4 ToS byte (8 bits)</text>
<rect x="60" y="34" width="60" height="40" fill="#ddd6fe" stroke="#64748b"/><rect x="120" y="34" width="60" height="40" fill="#ddd6fe" stroke="#64748b"/><rect x="180" y="34" width="60" height="40" fill="#ddd6fe" stroke="#64748b"/>
<rect x="240" y="34" width="60" height="40" fill="#bae6fd" stroke="#64748b"/><rect x="300" y="34" width="60" height="40" fill="#bae6fd" stroke="#64748b"/><rect x="360" y="34" width="60" height="40" fill="#bae6fd" stroke="#64748b"/>
<rect x="420" y="34" width="60" height="40" fill="#e2e8f0" stroke="#64748b"/><rect x="480" y="34" width="60" height="40" fill="#e2e8f0" stroke="#64748b"/>
<text x="90" y="60" text-anchor="middle" class="svg-ink" font-size="14">1</text><text x="150" y="60" text-anchor="middle" class="svg-ink" font-size="14">0</text><text x="210" y="60" text-anchor="middle" class="svg-ink" font-size="14">1</text>
<text x="270" y="60" text-anchor="middle" class="svg-ink" font-size="14">1</text><text x="330" y="60" text-anchor="middle" class="svg-ink" font-size="14">1</text><text x="390" y="60" text-anchor="middle" class="svg-ink" font-size="14">0</text>
<text x="450" y="60" text-anchor="middle" class="svg-ink" font-size="14">0</text><text x="510" y="60" text-anchor="middle" class="svg-ink" font-size="14">0</text>
<line x1="60" y1="92" x2="240" y2="92" stroke="#64748b"/><text x="150" y="110" text-anchor="middle" class="svg-muted" font-size="12">IP precedence (3 bits) = 5</text>
<line x1="60" y1="124" x2="420" y2="124" stroke="#64748b"/><text x="240" y="142" text-anchor="middle" class="svg-accent" font-size="12">DSCP (6 bits) = 101110 = 46 = EF</text>
<text x="480" y="110" text-anchor="middle" class="svg-muted" font-size="12">ECN (2 bits)</text>
</svg><p class="cap">EF: DSCP 46 is binary 101110. The whole byte reads 10111000, which is 184 or 0xB8.</p></div>
<p>Before DSCP existed, only the top 3 bits were used and called <b>IP precedence</b> (0 to 7). DSCP keeps the same three bits as its first half, which gives backward compatibility: precedence equals DSCP divided by 8, rounded down. DSCP 46 is precedence 5.</p>

<h3>The names you must know</h3>
<table class="cmp"><tr><th>Name</th><th>DSCP</th><th>Binary</th><th>Meaning and typical use</th></tr>
<tr><td><b>Default (DF, CS0)</b></td><td>0</td><td>000000</td><td>Best effort, no treatment</td></tr>
<tr><td><b>CS1</b></td><td>8</td><td>001000</td><td>Scavenger or bulk background</td></tr>
<tr><td><b>AF11 / AF21 / AF31 / AF41</b></td><td>10 / 18 / 26 / 34</td><td>001010 / 010010 / 011010 / 100010</td><td>Assured forwarding, low drop: bulk, transactional, streaming, interactive video</td></tr>
<tr><td><b>AF12 / AF13</b> (and so on)</td><td>12, 14 (AF1x)</td><td>001100, 001110</td><td>Same class, higher drop preference</td></tr>
<tr><td><b>CS3</b></td><td>24</td><td>011000</td><td>Call signalling</td></tr>
<tr><td><b>CS5</b></td><td>40</td><td>101000</td><td>Broadcast video</td></tr>
<tr><td><b>EF</b></td><td>46</td><td>101110</td><td>Expedited forwarding: voice</td></tr>
<tr><td><b>CS6 / CS7</b></td><td>48 / 56</td><td>110000 / 111000</td><td>Network control (routing protocols)</td></tr>
</table>
<p><b>Class selectors (CSn)</b> are DSCP values of the form <i>nnn000</i>, equal to the old precedence n multiplied by 8. <b>Assured forwarding (AFxy)</b> has two digits: <b>x</b> is the class (1 to 4, higher is better) and <b>y</b> is the drop precedence (1 to 3, higher is dropped first under congestion). The formula is <b>DSCP = 8 x x + 2 x y</b>. <b>EF</b> is a single special value for traffic that needs low delay, low jitter and low loss.</p>
<div class="eg"><p><b>Worked example.</b> What is AF31? Class 3, drop precedence 1. DSCP = 8 x 3 + 2 x 1 = 26, binary 011010. The ToS byte is 26 x 4 = 104 = 0x68. And AF43? 8 x 4 + 2 x 3 = 38.</p></div>

<h3>CoS: the Layer 2 marking</h3>
<p>Ethernet frames carry no priority by default. When a frame travels on a VLAN trunk it gets a 4-byte <b>802.1Q tag</b>, and 3 bits of that tag are the <b>Priority Code Point</b>, widely called <b>CoS</b> (Class of Service, 0 to 7, defined by 802.1p).</p>
<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="802.1Q tag">
<rect x="20" y="30" width="110" height="44" fill="#e2e8f0" stroke="#64748b"/><text x="75" y="57" text-anchor="middle" class="svg-ink" font-size="12">Dest MAC</text>
<rect x="130" y="30" width="110" height="44" fill="#e2e8f0" stroke="#64748b"/><text x="185" y="57" text-anchor="middle" class="svg-ink" font-size="12">Source MAC</text>
<rect x="240" y="30" width="60" height="44" fill="#fde68a" stroke="#64748b"/><text x="270" y="57" text-anchor="middle" class="svg-ink" font-size="12">TPID</text>
<rect x="300" y="30" width="60" height="44" fill="#ddd6fe" stroke="#64748b"/><text x="330" y="57" text-anchor="middle" class="svg-ink" font-size="12">CoS</text>
<rect x="360" y="30" width="40" height="44" fill="#e2e8f0" stroke="#64748b"/><text x="380" y="57" text-anchor="middle" class="svg-ink" font-size="12">DEI</text>
<rect x="400" y="30" width="80" height="44" fill="#bae6fd" stroke="#64748b"/><text x="440" y="57" text-anchor="middle" class="svg-ink" font-size="12">VLAN ID</text>
<rect x="480" y="30" width="140" height="44" fill="#e2e8f0" stroke="#64748b"/><text x="550" y="57" text-anchor="middle" class="svg-ink" font-size="12">Type, IP packet...</text>
<text x="330" y="100" text-anchor="middle" class="svg-accent" font-size="12">CoS = 3 bits, values 0 to 7</text>
</svg><p class="cap">CoS lives only inside the 802.1Q tag. Take the tag off and the CoS is gone.</p></div>
<p>The common CoS usage is 5 for voice, 4 for video, 3 for call signalling or critical data, 1 for background, 0 for best effort, and 6 and 7 for network control. Two facts about CoS matter more than the values themselves.</p>
<ul>
<li><b>CoS exists only on tagged links.</b> A frame on an untagged access port has no CoS bits at all. A phone and its PC are often separated by sending the phone's voice VLAN frames tagged and the PC's frames untagged.</li>
<li><b>CoS does not survive routing.</b> A router removes the Layer 2 header when it forwards a packet and builds a new one. The DSCP in the IP header travels end to end; the CoS does not. That is why we translate at the Layer 2 / Layer 3 border (chapter 6).</li>
</ul>
<p>Providers use the same 3-bit idea inside MPLS labels (the EXP or traffic-class bits); the WAN modules return to that.</p>

<h3>Mapping between the two</h3>
<p>Because the first three DSCP bits equal the precedence, the natural CoS-to-DSCP map is to multiply by 8: CoS 0, 1, 2, 3, 4, 5, 6, 7 become DSCP 0, 8, 16, 24, 32, 40, 48, 56. This is the default map on Catalyst switches. Notice the trap: <b>CoS 5 becomes DSCP 40 (CS5), not 46 (EF)</b>. Voice phones mark EF at Layer 3 and CoS 5 at Layer 2, so if a switch rebuilds DSCP from CoS with the default table, voice silently changes from EF to CS5. You either change the map (<code>mls qos map cos-dscp 0 8 16 24 32 46 48 56</code> on older Catalyst switches) or, as we do in the lab, write an explicit MQC policy.</p>

<h3>The marking plan used in this module</h3>
<table class="cmp"><tr><th>Class</th><th>DSCP</th><th>CoS</th><th>Used in the labs for</th></tr>
<tr><td>Voice</td><td>EF (46)</td><td>5</td><td>RTP, UDP 16384 to 32767</td></tr>
<tr><td>Signalling</td><td>CS3 (24)</td><td>3</td><td>SIP, port 5060</td></tr>
<tr><td>Transactional</td><td>AF21 (18)</td><td>2</td><td>Web, TCP 80 and 443</td></tr>
<tr><td>Bulk, scavenger</td><td>CS1 (8)</td><td>1</td><td>SMB backup, TCP 445</td></tr>
<tr><td>Everything else</td><td>Default (0)</td><td>0</td><td>class-default</td></tr>
</table>

<div class="warn"><p><b>Common mistake.</b> Treating a DSCP name as a number you can type anywhere. IOS accepts both names (<code>ef</code>, <code>af21</code>, <code>cs3</code>) and numbers (46, 18, 24). Pick one style and stay consistent, because outputs print the name and you will compare them by eye.</p></div>
<div class="exam"><p><b>Exam trap.</b> DSCP has 6 bits (64 values), precedence 3 bits (8 values), CoS 3 bits (8 values). AF classes are 1 to 4 and drop precedences 1 to 3. Default CoS 5 maps to DSCP 40, not 46.</p></div>

<div class="scn"><h4>The phones that lost EF at the switch</h4><p>After a switch upgrade in Pune, call quality dropped even though the WAN policy protected DSCP EF. A capture on the router LAN port showed voice arriving as DSCP 40 instead of 46. The new access switch had been set to trust CoS, rebuilt DSCP from the phone's CoS 5 using the default map and produced CS5. The WAN priority class matched only EF, so voice fell into the default queue. A one-line change to the CoS-to-DSCP map restored 46.</p><p><b>Lesson:</b> a default map is a hidden marking decision. Verify the DSCP at the router, not only the CoS at the switch.</p></div>
<div class="iv"><p class="q">"What is the difference between DSCP and CoS, and where does each live?"</p><p>DSCP is 6 bits in the IP header and survives routing, so it works end to end. CoS is 3 bits in the 802.1Q tag and exists only on tagged links, so it is lost at the first router. Add that EF is DSCP 46, voice CoS is 5, and that the default CoS 5 maps to DSCP 40, which is a known trap.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DSCP is the upper 6 bits of the ToS byte; precedence is its top 3 bits; DSCP = 8 x class + 2 x drop for AF.</li>
<li>Know the numbers: EF 46, AF41 34, AF31 26, AF21 18, AF11 10, CS3 24, CS1 8, CS6 48.</li>
<li>CoS is 3 bits in the 802.1Q tag, only on tagged links, and is lost when a router forwards the packet.</li>
<li>Default CoS-to-DSCP map multiplies by 8, so CoS 5 becomes 40, not EF.</li>
<li>Choose a small marking plan and use it everywhere.</li>
</ul></div>
`,hi:`
<p>Marking ek number hai jo packet ke header mein likha jaata hai taaki aage ka har device classification dobara kiye bina class padh sake. Yeh number likhne ki do jagah hain: IP header (Layer 3) aur Ethernet VLAN tag (Layer 2). Yeh chapter dono samjhata hai, woh naam jo aapko aane chahiye (EF, AF, CS) aur Layer 2 aur Layer 3 ki values ek doosre se kaise map hoti hain.</p>

<h3>ToS byte aur DSCP</h3>
<p>IPv4 header mein ek byte ka field hai jise pehle <b>Type of Service (ToS)</b> kehte the. Aaj yeh do hisson mein bata hua hai: upar ke <b>6 bits DSCP</b> (Differentiated Services Code Point) hain aur neeche ke 2 bits ECN (explicit congestion notification) ke liye hain, jise hum is module mein ignore karte hain.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="ToS byte layout">
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="14">IPv4 ToS byte (8 bits)</text>
<rect x="60" y="34" width="60" height="40" fill="#ddd6fe" stroke="#64748b"/><rect x="120" y="34" width="60" height="40" fill="#ddd6fe" stroke="#64748b"/><rect x="180" y="34" width="60" height="40" fill="#ddd6fe" stroke="#64748b"/>
<rect x="240" y="34" width="60" height="40" fill="#bae6fd" stroke="#64748b"/><rect x="300" y="34" width="60" height="40" fill="#bae6fd" stroke="#64748b"/><rect x="360" y="34" width="60" height="40" fill="#bae6fd" stroke="#64748b"/>
<rect x="420" y="34" width="60" height="40" fill="#e2e8f0" stroke="#64748b"/><rect x="480" y="34" width="60" height="40" fill="#e2e8f0" stroke="#64748b"/>
<text x="90" y="60" text-anchor="middle" class="svg-ink" font-size="14">1</text><text x="150" y="60" text-anchor="middle" class="svg-ink" font-size="14">0</text><text x="210" y="60" text-anchor="middle" class="svg-ink" font-size="14">1</text>
<text x="270" y="60" text-anchor="middle" class="svg-ink" font-size="14">1</text><text x="330" y="60" text-anchor="middle" class="svg-ink" font-size="14">1</text><text x="390" y="60" text-anchor="middle" class="svg-ink" font-size="14">0</text>
<text x="450" y="60" text-anchor="middle" class="svg-ink" font-size="14">0</text><text x="510" y="60" text-anchor="middle" class="svg-ink" font-size="14">0</text>
<line x1="60" y1="92" x2="240" y2="92" stroke="#64748b"/><text x="150" y="110" text-anchor="middle" class="svg-muted" font-size="12">IP precedence (3 bits) = 5</text>
<line x1="60" y1="124" x2="420" y2="124" stroke="#64748b"/><text x="240" y="142" text-anchor="middle" class="svg-accent" font-size="12">DSCP (6 bits) = 101110 = 46 = EF</text>
<text x="480" y="110" text-anchor="middle" class="svg-muted" font-size="12">ECN (2 bits)</text>
</svg><p class="cap">EF: DSCP 46 ka binary 101110 hai. Poora byte 10111000 padhta hai, yaani 184 ya 0xB8.</p></div>
<p>DSCP aane se pehle sirf upar ke 3 bits use hote the aur unhe <b>IP precedence</b> (0 se 7) kehte the. DSCP wahi teen bits apne pehle aadhe hisse ki tarah rakhta hai, isse backward compatibility milti hai: precedence = DSCP ko 8 se divide karke neeche round karo. DSCP 46 ka precedence 5 hai.</p>

<h3>Woh naam jo aapko aane chahiye</h3>
<table class="cmp"><tr><th>Name</th><th>DSCP</th><th>Binary</th><th>Matlab aur aam use</th></tr>
<tr><td><b>Default (DF, CS0)</b></td><td>0</td><td>000000</td><td>Best effort, koi treatment nahi</td></tr>
<tr><td><b>CS1</b></td><td>8</td><td>001000</td><td>Scavenger ya bulk background</td></tr>
<tr><td><b>AF11 / AF21 / AF31 / AF41</b></td><td>10 / 18 / 26 / 34</td><td>001010 / 010010 / 011010 / 100010</td><td>Assured forwarding, low drop: bulk, transactional, streaming, interactive video</td></tr>
<tr><td><b>AF12 / AF13</b> (aur aage)</td><td>12, 14 (AF1x)</td><td>001100, 001110</td><td>Wahi class, zyada drop preference</td></tr>
<tr><td><b>CS3</b></td><td>24</td><td>011000</td><td>Call signalling</td></tr>
<tr><td><b>CS5</b></td><td>40</td><td>101000</td><td>Broadcast video</td></tr>
<tr><td><b>EF</b></td><td>46</td><td>101110</td><td>Expedited forwarding: voice</td></tr>
<tr><td><b>CS6 / CS7</b></td><td>48 / 56</td><td>110000 / 111000</td><td>Network control (routing protocols)</td></tr>
</table>
<p><b>Class selectors (CSn)</b> woh DSCP values hain jo <i>nnn000</i> shakal ki hoti hain, yaani purana precedence n ko 8 se multiply karke. <b>Assured forwarding (AFxy)</b> mein do digits hote hain: <b>x</b> class hai (1 se 4, bada behtar) aur <b>y</b> drop precedence hai (1 se 3, bada congestion mein pehle drop hota hai). Formula hai <b>DSCP = 8 x x + 2 x y</b>. <b>EF</b> ek akeli khaas value hai us traffic ke liye jise low delay, low jitter aur low loss chahiye.</p>
<div class="eg"><p><b>Worked example.</b> AF31 kya hai? Class 3, drop precedence 1. DSCP = 8 x 3 + 2 x 1 = 26, binary 011010. ToS byte 26 x 4 = 104 = 0x68. Aur AF43? 8 x 4 + 2 x 3 = 38.</p></div>

<h3>CoS: Layer 2 marking</h3>
<p>Ethernet frames mein default se koi priority nahi hoti. Jab frame VLAN trunk par chalta hai to use 4-byte ka <b>802.1Q tag</b> milta hai, aur us tag ke 3 bits <b>Priority Code Point</b> hain, jise aam taur par <b>CoS</b> (Class of Service, 0 se 7, 802.1p se define) kehte hain.</p>
<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="802.1Q tag">
<rect x="20" y="30" width="110" height="44" fill="#e2e8f0" stroke="#64748b"/><text x="75" y="57" text-anchor="middle" class="svg-ink" font-size="12">Dest MAC</text>
<rect x="130" y="30" width="110" height="44" fill="#e2e8f0" stroke="#64748b"/><text x="185" y="57" text-anchor="middle" class="svg-ink" font-size="12">Source MAC</text>
<rect x="240" y="30" width="60" height="44" fill="#fde68a" stroke="#64748b"/><text x="270" y="57" text-anchor="middle" class="svg-ink" font-size="12">TPID</text>
<rect x="300" y="30" width="60" height="44" fill="#ddd6fe" stroke="#64748b"/><text x="330" y="57" text-anchor="middle" class="svg-ink" font-size="12">CoS</text>
<rect x="360" y="30" width="40" height="44" fill="#e2e8f0" stroke="#64748b"/><text x="380" y="57" text-anchor="middle" class="svg-ink" font-size="12">DEI</text>
<rect x="400" y="30" width="80" height="44" fill="#bae6fd" stroke="#64748b"/><text x="440" y="57" text-anchor="middle" class="svg-ink" font-size="12">VLAN ID</text>
<rect x="480" y="30" width="140" height="44" fill="#e2e8f0" stroke="#64748b"/><text x="550" y="57" text-anchor="middle" class="svg-ink" font-size="12">Type, IP packet...</text>
<text x="330" y="100" text-anchor="middle" class="svg-accent" font-size="12">CoS = 3 bits, values 0 se 7</text>
</svg><p class="cap">CoS sirf 802.1Q tag ke andar rehta hai. Tag hata do to CoS chala jaata hai.</p></div>
<p>Aam CoS usage: voice ke liye 5, video ke liye 4, call signalling ya critical data ke liye 3, background ke liye 1, best effort ke liye 0, aur network control ke liye 6 aur 7. CoS ke baare mein do baatein values se zyada zaroori hain.</p>
<ul>
<li><b>CoS sirf tagged links par hota hai.</b> Untagged access port ke frame mein CoS bits hote hi nahi. Phone aur uske PC ko aksar aise alag karte hain ki phone ke voice VLAN frames tagged jaate hain aur PC ke frames untagged.</li>
<li><b>CoS routing se bachta nahi.</b> Router packet forward karte waqt Layer 2 header hata deta hai aur naya banata hai. IP header ka DSCP end to end jaata hai; CoS nahi. Isliye hum Layer 2 / Layer 3 border par translate karte hain (chapter 6).</li>
</ul>
<p>Providers yahi 3-bit idea MPLS labels ke andar use karte hain (EXP ya traffic-class bits); WAN modules us par wapas aayenge.</p>

<h3>Dono ke beech mapping</h3>
<p>Kyunki DSCP ke pehle teen bits precedence ke barabar hain, natural CoS-to-DSCP map 8 se multiply karna hai: CoS 0, 1, 2, 3, 4, 5, 6, 7 se DSCP 0, 8, 16, 24, 32, 40, 48, 56 bante hain. Catalyst switches par yahi default map hai. Trap dekho: <b>CoS 5 se DSCP 40 (CS5) banta hai, 46 (EF) nahi</b>. Voice phones Layer 3 par EF aur Layer 2 par CoS 5 mark karte hain, isliye agar switch default table se CoS se DSCP dobara banaye to voice chupchaap EF se CS5 ho jaati hai. Ya to map badlo (purane Catalyst switches par <code>mls qos map cos-dscp 0 8 16 24 32 46 48 56</code>) ya, jaise hum lab mein karte hain, explicit MQC policy likho.</p>

<h3>Is module ka marking plan</h3>
<table class="cmp"><tr><th>Class</th><th>DSCP</th><th>CoS</th><th>Labs mein kiske liye</th></tr>
<tr><td>Voice</td><td>EF (46)</td><td>5</td><td>RTP, UDP 16384 se 32767</td></tr>
<tr><td>Signalling</td><td>CS3 (24)</td><td>3</td><td>SIP, port 5060</td></tr>
<tr><td>Transactional</td><td>AF21 (18)</td><td>2</td><td>Web, TCP 80 aur 443</td></tr>
<tr><td>Bulk, scavenger</td><td>CS1 (8)</td><td>1</td><td>SMB backup, TCP 445</td></tr>
<tr><td>Baaki sab</td><td>Default (0)</td><td>0</td><td>class-default</td></tr>
</table>

<div class="warn"><p><b>Common mistake.</b> DSCP naam ko aisa number samajhna jo kahin bhi type kar sakte ho. IOS naam (<code>ef</code>, <code>af21</code>, <code>cs3</code>) aur numbers (46, 18, 24) dono leta hai. Ek style chuno aur uspar tiko, kyunki outputs naam chhaapte hain aur aap unhe aankh se compare karoge.</p></div>
<div class="exam"><p><b>Exam trap.</b> DSCP 6 bits (64 values), precedence 3 bits (8 values), CoS 3 bits (8 values). AF classes 1 se 4 aur drop precedences 1 se 3. Default CoS 5 se DSCP 40 banta hai, 46 nahi.</p></div>

<div class="scn"><h4>Woh phones jinhone switch par EF kho diya</h4><p>Pune mein switch upgrade ke baad call quality gir gayi jabki WAN policy DSCP EF ko protect karti thi. Router LAN port par capture mein voice 46 ke bajaye DSCP 40 ke saath aati dikhi. Naye access switch ko CoS trust par set kiya gaya tha, usne phone ke CoS 5 se default map ke zariye DSCP dobara banaya aur CS5 nikla. WAN priority class sirf EF match karti thi, isliye voice default queue mein gir gayi. CoS-to-DSCP map mein ek line badalne se 46 wapas aa gaya.</p><p><b>Lesson:</b> default map ek chhupa hua marking decision hai. DSCP ko router par verify karo, sirf switch par CoS nahi.</p></div>
<div class="iv"><p class="q">"DSCP aur CoS mein kya farak hai, aur har ek kahan rehta hai?"</p><p>DSCP IP header ke 6 bits hain aur routing se bachta hai, isliye end to end kaam karta hai. CoS 802.1Q tag ke 3 bits hain aur sirf tagged links par hota hai, isliye pehle router par kho jaata hai. Bolo ki EF DSCP 46 hai, voice CoS 5 hai, aur default CoS 5 se DSCP 40 banta hai jo ek jaana-maana trap hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DSCP ToS byte ke upar ke 6 bits hain; precedence uske top 3 bits; AF ke liye DSCP = 8 x class + 2 x drop.</li>
<li>Numbers yaad rakho: EF 46, AF41 34, AF31 26, AF21 18, AF11 10, CS3 24, CS1 8, CS6 48.</li>
<li>CoS 802.1Q tag ke 3 bits hain, sirf tagged links par, aur router ke forward karte hi kho jaata hai.</li>
<li>Default CoS-to-DSCP map 8 se multiply karta hai, isliye CoS 5 se 40 banta hai, EF nahi.</li>
<li>Chhota marking plan chuno aur har jagah wahi use karo.</li>
</ul></div>
`}};export{e as default};