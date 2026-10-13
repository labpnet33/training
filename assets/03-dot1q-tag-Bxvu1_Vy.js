var e=(e,t,n,r,i,a)=>`<text x="`+e+`" y="`+t+`" text-anchor="`+(a||`middle`)+`" class="`+(r||`svg-ink`)+`" font-size="`+(i||12)+`">`+n+`</text>`,t=(e,t,n,r,i)=>`<rect x="`+e+`" y="`+t+`" width="`+n+`" height="`+r+`" fill="`+i+`" stroke="#64748b" stroke-width="0.8"/>`,n=(n,r,i,a,o)=>{let s=``;return s+=t(10,30,70,40,`#e2e8f0`)+e(45,55,`Src MAC`,`svg-ink`,12),s+=t(80,30,120,40,`#fde68a`)+e(140,48,`TPID 0x8100`,`svg-ink`,13)+e(140,63,`16 bits`,`svg-muted`,10),s+=t(200,30,120,40,`#fed7aa`)+e(260,48,`TCI 0xa064`,`svg-ink`,13)+e(260,63,`16 bits`,`svg-muted`,10),s+=t(320,30,100,40,`#bae6fd`)+e(370,55,`EtherType 0x0800`,`svg-ink`,11),s+=t(420,30,210,40,`#ddd6fe`)+e(525,55,`IP packet ...`,`svg-ink`,12),s+=e(260,18,r,`svg-accent`,12),`1010000001100100`.split(``).forEach((n,r)=>{let i=r<3?`#fde68a`:r===3?`#fed7aa`:`#bbf7d0`;s+=t(40+r*35,110,35,30,i)+e(57+r*35,130,n,`svg-ink`,14)}),s+=`<line x1="260" y1="70" x2="260" y2="100" stroke="#64748b" stroke-width="1"/><line x1="40" y1="100" x2="600" y2="100" stroke="#64748b" stroke-width="1"/>`,s+=e(92,160,i,`svg-ink`,12)+e(162,160,a,`svg-ink`,12)+e(390,160,o,`svg-ink`,12),s+=e(92,176,`101 = 5`,`svg-muted`,11)+e(162,176,`0`,`svg-muted`,11)+e(390,176,`000001100100 = 100`,`svg-muted`,11),`<div class="dia"><svg viewBox="0 0 640 188" role="img" aria-label="802.1Q tag bits">`+s+`</svg><p class="cap">`+n+`</p></div>`},r=`<pre class="out">0000  52 54 00 c1 00 01 52 54 00 c9 00 05 <span class="hl">81 00</span> <span class="hl">a0 64</span>
0010  08 00 45 b8 00 c8 71 2e 00 00 40 11 f2 df 0a 64

802.1Q Virtual LAN, PRI: 5, DEI: 0, ID: 100
    Priority: 5 (Voice, &lt; 10ms latency)
    DEI: 0
    ID: 100
    Type: IPv4 (0x0800)</pre>`,i=`<pre class="out">Ethernet II, Src: NKLabs_a1:00:10, Dst: Broadcast
    Type: 802.1Q Virtual LAN (0x8100)
802.1Q Virtual LAN, PRI: 0, DEI: 0, ID: 10
    Type: ARP (0x0806)

0000  ff ff ff ff ff ff 52 54 00 a1 00 10 <span class="hl">81 00 00 0a</span>
0010  08 06 00 01 08 00 06 04 00 01 52 54 00 a1 00 10</pre>`,a={id:`dot1q-tag`,h:{en:`The 802.1Q tag on trunks: TPID, PCP, DEI, VID and the native VLAN`,hi:`Trunks par 802.1Q tag: TPID, PCP, DEI, VID aur native VLAN`},body:{en:`
<p>Picture a courier van that carries parcels for ten companies at once. Each parcel gets a coloured sticker so the depot knows which company it belongs to, and some stickers also say "urgent". The sticker is the <b>802.1Q tag</b>: four bytes pushed into the Ethernet header of every frame that crosses a trunk. Access ports never show you this tag, but every trunk capture does, and it tells you the VLAN, the priority and whether the two ends of the link agree.</p>

<h3>Where the tag sits and what it contains</h3>
<p>The switch inserts the tag <b>between the source MAC and the original EtherType</b>. The tag has two 16-bit halves:</p>
`+n(`The 802.1Q tag from the voice frame below: TPID, then 16 bits of TCI split into 3 + 1 + 12 bits.`,`Tag inserted after the source MAC`,`PCP 3 bits`,`DEI 1`,`VID 12 bits`)+`
<dl class="terms">
<dt>TPID, 16 bits, always 0x8100</dt><dd>Sits where the EtherType normally sits, so a receiver that sees 0x8100 knows a tag follows. The real EtherType (0x0800, 0x0806 and so on) is pushed 4 bytes further on.</dd>
<dt>PCP, 3 bits (priority code point)</dt><dd>Layer 2 class of service, 0 to 7, also called CoS. 0 is best effort; 5 is voice; 6 and 7 are network control. The simulator labels value 5 as "Voice, &lt; 10ms latency".</dd>
<dt>DEI, 1 bit</dt><dd>Drop Eligible Indicator. When 1, the frame may be dropped first during congestion. Most networks leave it 0.</dd>
<dt>VID, 12 bits</dt><dd>The VLAN ID: 0 to 4095, but 0 (priority-tagged, no VLAN) and 4095 are reserved, so usable VLANs are 1 to 4094. VLAN 1 is the default.</dd>
</dl>
<p>Because the four tag bytes sit inside the frame, the maximum size grows from 1518 to <b>1522</b> bytes. The payload MTU does not change: it is still 1500. A 64-byte untagged frame becomes 68 bytes when tagged.</p>

<h3>Reading the real bytes</h3>
<p>This is the Packet Studio <code>qos</code> flow: an IP phone sending voice on VLAN 100. Take the four bytes after the source MAC.</p>
`+r+`
<div class="eg"><p><b>Worked example: decode 0xa064.</b> Write it in binary: 1010 0000 0110 0100. The first three bits are 101 = <b>PCP 5</b>. The fourth bit is 0 = <b>DEI 0</b>. The last twelve bits are 0000 0110 0100 = 0x064 = <b>VLAN 100</b>. Then the real EtherType 0x0800 follows and the IP header begins with <code>45 b8</code>: the 0xb8 is DSCP 46 (EF). So the phone marks voice twice, CoS 5 at Layer 2 and DSCP 46 at Layer 3. Frame size: 14 + 4 + 200 = 218 bytes, which is exactly what the capture reports.</p></div>

<p>An ARP broadcast flooded onto the trunk in VLAN 10 is the same idea with PCP 0:</p>
`+i+`
<p>The tag bytes are <code>81 00 00 0a</code>: TPID 0x8100, PCP 0, DEI 0, VID 0x00a = 10. The ARP message itself is unchanged; only the 4 bytes were inserted. The simulator pads the tagged ARP to 60 bytes, as it does for any short frame.</p>

<h3>The native VLAN travels untagged</h3>
<p>On an IEEE 802.1Q trunk exactly one VLAN, the <b>native VLAN</b>, is sent <b>without a tag</b>. Frames arriving untagged on the trunk are placed in the native VLAN. In the Packet Studio <code>vlan</code> flow, a ping between two switch management interfaces in VLAN 99 crosses the trunk with no 0x8100 at all, because VLAN 99 is the native VLAN of that link. This is by design, for backward compatibility, but it creates two classic problems:</p>
<ul>
<li><b>Native VLAN mismatch.</b> If one end says native 99 and the other native 1, untagged frames from VLAN 99 land in VLAN 1 on the far side: traffic silently leaks between VLANs. The switches usually log a CDP native-VLAN mismatch message (%CDP-4-NATIVE_VLAN_MISMATCH) and spanning tree may report inconsistencies.</li>
<li><b>Double-tagging attacks.</b> Because the native VLAN is untagged, an attacker-controlled frame carrying two tags can have its outer tag stripped and arrive in another VLAN. The defence is simple: never use VLAN 1 as native, use an unused VLAN, and do not put users in the native VLAN.</li>
</ul>
<p><b>Access ports</b> expect untagged frames; a host that sends tags to an access port is misconfigured. <b>QinQ</b> (IEEE 802.1ad) stacks a second tag with TPID 0x88A8 so a service provider can carry a customer's tagged frames inside its own VLAN, adding another 4 bytes (1526).</p>

<div class="warn"><p><b>Common mistakes.</b> Expecting a capture on an access port to show 0x8100: it never will. Saying the MTU becomes 1504 on a trunk: the frame grows, the IP MTU stays 1500. Using VLAN 1 for management and as the native VLAN. Forgetting that an <i>allowed VLAN</i> list on a trunk drops tagged frames silently when the VID is not on it.</p></div>

<div class="exam"><p><b>Exam traps.</b> TPID is 0x8100 and the tag is 4 bytes; the VID field is 12 bits; the maximum frame becomes 1522. The native VLAN is the one that is <b>not</b> tagged. PCP is 3 bits (0 to 7), not 6. Usable VLAN IDs are 1 to 4094 (1002 to 1005 are legacy ranges on Cisco).</p></div>

<div class="scn"><h4>The management network that leaked</h4><p>A new access switch could not reach its gateway, yet the old switch on the other end of the trunk could see its traffic in the wrong VLAN. CDP logged a native-VLAN mismatch: one side used native VLAN 1, the other native VLAN 99. Untagged frames sent in VLAN 99 were arriving in VLAN 1 on the far side. The engineer captured on the trunk and saw management frames <b>without</b> a tag, which confirmed that the sender thought VLAN 99 was native. Setting the same native VLAN on both ends fixed it, and changing the native VLAN from 1 to an unused ID closed the leak for good.</p><p><b>Lesson:</b> on a trunk capture, an untagged frame is by definition in the native VLAN. Check both ends.</p></div>

<div class="iv"><p class="q">"What is in an 802.1Q tag and what does the native VLAN do?"</p><p>Four bytes: a TPID of 0x8100, then 3-bit PCP, 1-bit DEI and 12-bit VID. The native VLAN is the one VLAN sent without a tag and it must match on both ends. Add the security point (double tagging, avoid VLAN 1) and that the tag raises the maximum frame to 1522 bytes without changing the 1500 MTU.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The tag sits after the source MAC: TPID 0x8100 then PCP (3), DEI (1), VID (12).</li>
<li>The real EtherType moves 4 bytes later; the frame maximum is 1522, the MTU stays 1500.</li>
<li>PCP 5 is voice; DSCP 46 (EF) at Layer 3 is the matching marking.</li>
<li>The native VLAN is untagged; a mismatch leaks traffic between VLANs and is logged by CDP.</li>
<li>QinQ adds a second tag (TPID 0x88A8) for service-provider transport.</li>
</ul></div>
`,hi:`
<p>Ek courier van sochiye jo ek saath das companies ke parcels le jaati hai. Har parcel par rangin sticker lagta hai taaki depot jaan sake kaunsi company ka hai, aur kuch stickers par "urgent" bhi likha hota hai. Woh sticker <b>802.1Q tag</b> hai: chaar bytes jo trunk paar karne wale har frame ke Ethernet header mein daale jaate hain. Access ports par yeh tag kabhi nahi dikhta, lekin har trunk capture mein dikhta hai, aur woh VLAN, priority aur link ke dono ends ki agreement batata hai.</p>

<h3>Tag kahan baithta hai aur usme kya hai</h3>
<p>Switch tag ko <b>source MAC aur original EtherType ke beech</b> daalta hai. Tag ke do 16-bit hisse hain:</p>
`+n(`Neeche wale voice frame ka 802.1Q tag: TPID, phir 16 bits ka TCI jo 3 + 1 + 12 bits mein bantta hai.`,`Tag source MAC ke baad daala jaata hai`,`PCP 3 bits`,`DEI 1`,`VID 12 bits`)+`
<dl class="terms">
<dt>TPID, 16 bits, hamesha 0x8100</dt><dd>Wahan baithta hai jahan normally EtherType hota hai, isliye receiver 0x8100 dekhte hi jaan jaata hai ki tag aage hai. Asli EtherType (0x0800, 0x0806 waghera) 4 bytes aage chala jaata hai.</dd>
<dt>PCP, 3 bits (priority code point)</dt><dd>Layer 2 class of service, 0 se 7, ise CoS bhi kehte hain. 0 best effort hai; 5 voice hai; 6 aur 7 network control hain. Simulator value 5 ko "Voice, &lt; 10ms latency" label karta hai.</dd>
<dt>DEI, 1 bit</dt><dd>Drop Eligible Indicator. 1 ho to congestion mein frame pehle drop ho sakta hai. Zyada tar networks ise 0 rakhte hain.</dd>
<dt>VID, 12 bits</dt><dd>VLAN ID: 0 se 4095, lekin 0 (priority-tagged, koi VLAN nahi) aur 4095 reserved hain, isliye usable VLANs 1 se 4094 hain. VLAN 1 default hai.</dd>
</dl>
<p>Chaar tag bytes frame ke andar baithte hain, isliye maximum size 1518 se badhkar <b>1522</b> bytes ho jaata hai. Payload MTU nahi badalta: woh abhi bhi 1500 hai. 64-byte untagged frame tag lagne par 68 bytes ka ho jaata hai.</p>

<h3>Asli bytes padhna</h3>
<p>Yeh Packet Studio ka <code>qos</code> flow hai: IP phone VLAN 100 par voice bhej raha hai. Source MAC ke baad ke chaar bytes lo.</p>
`+r+`
<div class="eg"><p><b>Worked example: 0xa064 decode karo.</b> Binary mein likho: 1010 0000 0110 0100. Pehle teen bits 101 = <b>PCP 5</b>. Chautha bit 0 = <b>DEI 0</b>. Aakhri barah bits 0000 0110 0100 = 0x064 = <b>VLAN 100</b>. Phir asli EtherType 0x0800 aata hai aur IP header <code>45 b8</code> se shuru hota hai: 0xb8 matlab DSCP 46 (EF). Yaani phone voice ko do baar mark karta hai, Layer 2 par CoS 5 aur Layer 3 par DSCP 46. Frame size: 14 + 4 + 200 = 218 bytes, bilkul jo capture batata hai.</p></div>

<p>VLAN 10 mein trunk par flood hua ARP broadcast wahi idea hai, PCP 0 ke saath:</p>
`+i+`
<p>Tag bytes <code>81 00 00 0a</code> hain: TPID 0x8100, PCP 0, DEI 0, VID 0x00a = 10. ARP message khud nahi badla; sirf 4 bytes daale gaye. Simulator tagged ARP ko 60 bytes tak pad karta hai, jaise har chhote frame ko.</p>

<h3>Native VLAN bina tag ke jaata hai</h3>
<p>IEEE 802.1Q trunk par sirf ek VLAN, <b>native VLAN</b>, <b>bina tag</b> ke bheji jaati hai. Trunk par untagged aane wale frames native VLAN mein daale jaate hain. Packet Studio ke <code>vlan</code> flow mein VLAN 99 ke do switch management interfaces ke beech ping trunk par bina kisi 0x8100 ke guzarta hai, kyunki VLAN 99 us link ki native VLAN hai. Yeh backward compatibility ke liye design hai, lekin do classic problems paida karta hai:</p>
<ul>
<li><b>Native VLAN mismatch.</b> Agar ek end native 99 kahe aur dusra native 1, to VLAN 99 ke untagged frames far side par VLAN 1 mein pahunch jaate hain: traffic chupchaap VLANs ke beech leak hota hai. Switches aam taur par CDP native-VLAN mismatch message (%CDP-4-NATIVE_VLAN_MISMATCH) log karte hain aur spanning tree inconsistency report kar sakta hai.</li>
<li><b>Double-tagging attacks.</b> Native VLAN untagged hone ki wajah se do tags wala attacker-controlled frame apna outer tag hatwa kar dusri VLAN mein pahunch sakta hai. Defence simple hai: VLAN 1 ko native mat rakho, koi unused VLAN use karo, aur native VLAN mein users mat daalo.</li>
</ul>
<p><b>Access ports</b> untagged frames expect karte hain; jo host access port ko tags bheje woh misconfigured hai. <b>QinQ</b> (IEEE 802.1ad) TPID 0x88A8 ke saath dusra tag stack karta hai taaki service provider customer ke tagged frames ko apni VLAN ke andar le ja sake, aur 4 bytes aur jodta hai (1526).</p>

<div class="warn"><p><b>Common galtiyan.</b> Access port ke capture mein 0x8100 ki ummeed rakhna: woh kabhi nahi dikhega. Kehna ki trunk par MTU 1504 ho jaata hai: frame badhta hai, IP MTU 1500 hi rehta hai. Management ke liye VLAN 1 aur native VLAN dono VLAN 1 rakhna. Yeh bhoolna ki trunk ki <i>allowed VLAN</i> list mein VID na ho to tagged frames chupchaap drop ho jaate hain.</p></div>

<div class="exam"><p><b>Exam traps.</b> TPID 0x8100 hai aur tag 4 bytes ka; VID field 12 bits ka; maximum frame 1522 ho jaata hai. Native VLAN woh hai jo <b>tag nahi</b> hoti. PCP 3 bits ka hai (0 se 7), 6 nahi. Usable VLAN IDs 1 se 4094 (1002 se 1005 Cisco par legacy ranges hain).</p></div>

<div class="scn"><h4>Management network jo leak hua</h4><p>Naya access switch apne gateway tak nahi pahunch pa raha tha, jabki trunk ke dusre end ka purana switch uska traffic galat VLAN mein dekh raha tha. CDP ne native-VLAN mismatch log kiya: ek side native VLAN 1, dusri native VLAN 99. VLAN 99 mein bheje gaye untagged frames far side par VLAN 1 mein aa rahe the. Engineer ne trunk par capture kiya aur management frames <b>bina</b> tag ke dekhe, jisse confirm hua ki sender VLAN 99 ko native samajhta hai. Dono ends par same native VLAN set karne se theek hua, aur native VLAN ko 1 se unused ID karne se leak hamesha ke liye band hua.</p><p><b>Seekh:</b> trunk capture mein untagged frame definition se native VLAN mein hota hai. Dono ends check karo.</p></div>

<div class="iv"><p class="q">"802.1Q tag mein kya hota hai aur native VLAN kya karti hai?"</p><p>Chaar bytes: 0x8100 ka TPID, phir 3-bit PCP, 1-bit DEI aur 12-bit VID. Native VLAN woh ek VLAN hai jo bina tag ke bheji jaati hai aur dono ends par match honi chahiye. Security point jodo (double tagging, VLAN 1 se bacho) aur yeh ki tag maximum frame ko 1522 bytes kar deta hai bina 1500 MTU badle.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tag source MAC ke baad baithta hai: TPID 0x8100 phir PCP (3), DEI (1), VID (12).</li>
<li>Asli EtherType 4 bytes aage khisakta hai; frame maximum 1522, MTU 1500 hi rehta hai.</li>
<li>PCP 5 voice hai; Layer 3 par DSCP 46 (EF) uski matching marking hai.</li>
<li>Native VLAN untagged hai; mismatch VLANs ke beech traffic leak karta hai aur CDP log karta hai.</li>
<li>QinQ service-provider transport ke liye dusra tag (TPID 0x88A8) jodta hai.</li>
</ul></div>
`}};export{a as default};