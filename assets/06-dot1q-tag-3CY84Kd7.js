var e={id:`dot1q-tag`,h:{en:`Inside the 802.1Q tag`,hi:`802.1Q tag ke andar`},body:{en:`
<p>Back to the office building: people from every floor share the one staircase, and at the other end each person must come out on the right floor. They manage because everyone wears a badge with their floor number. When a frame leaves one switch towards another on a shared link, it needs the same kind of badge. That badge is the <b>802.1Q tag</b>, and in this chapter you will open it up bit by bit.</p>

<h3>Why a tag is needed</h3>
<p>Between SW1 and SW2 in lab 2 (Sahyadri Health) there is only one cable, Gi0/0 to Gi0/0, but two user VLANs: STAFF (10) and LAB (20). When SW2 receives a frame on that cable it must know which VLAN it belongs to, otherwise it cannot choose the right MAC table or flood to the right ports. An access port has no way to say this, because its frames are untagged. So links that carry several VLANs, called <b>trunks</b>, add a small field to each frame that names the VLAN.</p>

<h3>Where the tag sits</h3>
<p>IEEE 802.1Q inserts <b>4 bytes</b> into the Ethernet header, directly <b>after the source MAC address</b> and before the original EtherType. Nothing else in the frame moves or changes, except that the <b>FCS</b> (the checksum at the end) must be recalculated because the frame content changed. The maximum standard frame size grows from 1518 to <b>1522</b> bytes.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Ethernet frame with the 4-byte 802.1Q tag inserted after the source MAC">
<rect x="10" y="30" width="90" height="44" fill="#e2e8f0" stroke="#64748b"/><text x="55" y="50" text-anchor="middle" class="svg-ink" font-size="12">Dest MAC</text><text x="55" y="66" text-anchor="middle" class="svg-muted" font-size="12">6 B</text>
<rect x="100" y="30" width="90" height="44" fill="#e2e8f0" stroke="#64748b"/><text x="145" y="50" text-anchor="middle" class="svg-ink" font-size="12">Src MAC</text><text x="145" y="66" text-anchor="middle" class="svg-muted" font-size="12">6 B</text>
<rect x="190" y="30" width="110" height="44" fill="#fde68a" stroke="#64748b"/><text x="245" y="50" text-anchor="middle" class="svg-ink" font-size="12">802.1Q tag</text><text x="245" y="66" text-anchor="middle" class="svg-muted" font-size="12">4 B</text>
<rect x="300" y="30" width="80" height="44" fill="#e2e8f0" stroke="#64748b"/><text x="340" y="50" text-anchor="middle" class="svg-ink" font-size="12">EtherType</text><text x="340" y="66" text-anchor="middle" class="svg-muted" font-size="12">2 B</text>
<rect x="380" y="30" width="170" height="44" fill="#bbf7d0" stroke="#64748b"/><text x="465" y="56" text-anchor="middle" class="svg-ink" font-size="12">Payload (IP packet)</text>
<rect x="550" y="30" width="80" height="44" fill="#fed7aa" stroke="#64748b"/><text x="590" y="50" text-anchor="middle" class="svg-ink" font-size="12">FCS</text><text x="590" y="66" text-anchor="middle" class="svg-muted" font-size="12">recalc</text>
<line x1="190" y1="74" x2="70" y2="130" stroke="#64748b" stroke-width="1.5"/><line x1="300" y1="74" x2="570" y2="130" stroke="#64748b" stroke-width="1.5"/>
<rect x="70" y="130" width="200" height="44" fill="#fde68a" stroke="#64748b"/><text x="170" y="150" text-anchor="middle" class="svg-ink" font-size="12">TPID 0x8100</text><text x="170" y="166" text-anchor="middle" class="svg-muted" font-size="12">16 bits</text>
<rect x="270" y="130" width="90" height="44" fill="#ddd6fe" stroke="#64748b"/><text x="315" y="150" text-anchor="middle" class="svg-ink" font-size="12">PCP</text><text x="315" y="166" text-anchor="middle" class="svg-muted" font-size="12">3 bits</text>
<rect x="360" y="130" width="60" height="44" fill="#e2e8f0" stroke="#64748b"/><text x="390" y="150" text-anchor="middle" class="svg-ink" font-size="12">DEI</text><text x="390" y="166" text-anchor="middle" class="svg-muted" font-size="12">1 bit</text>
<rect x="420" y="130" width="150" height="44" fill="#bae6fd" stroke="#64748b"/><text x="495" y="150" text-anchor="middle" class="svg-ink" font-size="12">VLAN ID</text><text x="495" y="166" text-anchor="middle" class="svg-muted" font-size="12">12 bits</text>
<text x="415" y="200" text-anchor="middle" class="svg-muted" font-size="12">PCP + DEI + VID = TCI (16 bits)</text>
</svg><p class="cap">The tag is 4 bytes: a 2-byte TPID and a 2-byte TCI containing priority, drop eligibility and the 12-bit VLAN ID.</p></div>

<h3>The four fields</h3>
<dl class="terms">
<dt>TPID (Tag Protocol Identifier), 16 bits</dt><dd>Always <b>0x8100</b> for 802.1Q. It sits where the EtherType normally is, so a receiver that sees 0x8100 knows "a VLAN tag follows" instead of "an IPv4 packet follows" (0x0800).</dd>
<dt>PCP (Priority Code Point), 3 bits</dt><dd>Values 0 to 7, also called <b>CoS</b> (Class of Service). Used by QoS; voice is normally CoS 5. This is 802.1p priority carried inside the 802.1Q tag.</dd>
<dt>DEI (Drop Eligible Indicator), 1 bit</dt><dd>Marks frames that may be dropped first under congestion. In older documents it is called CFI (Canonical Format Indicator).</dd>
<dt>VID (VLAN Identifier), 12 bits</dt><dd>The VLAN number. 12 bits give 4096 values, 0 to 4095; 0 and 4095 are reserved, so 1 to 4094 are usable.</dd>
</dl>

<div class="eg"><p><b>Worked example: decoding tags by hand.</b></p>
<ul>
<li>Bytes <code>81 00 00 0A</code>: TPID 0x8100; TCI 0x000A = binary 000 0 0000 0000 1010, so PCP 0, DEI 0, <b>VID 10</b>. A STAFF frame from lab 2.</li>
<li>Bytes <code>81 00 A0 6E</code>: TCI 0xA06E = 101 0 0000 0110 1110, so <b>PCP 5</b> (voice), DEI 0, <b>VID 110</b>. A phone frame from chapter 5.</li>
</ul></div>

<h3>A frame's journey across a trunk</h3>
<ol>
<li>PC1 (10.10.10.11) on SW1 Gi0/1, VLAN 10, sends an untagged frame to PC2 (10.10.10.12).</li>
<li>SW1 associates it with VLAN 10, looks up PC2's MAC in VLAN 10 and finds it via the trunk Gi0/0.</li>
<li>SW1 inserts a tag with VID 10, recalculates the FCS and sends it on the trunk.</li>
<li>SW2 reads TPID 0x8100 and VID 10, uses its VLAN 10 MAC table, removes the tag and sends the frame untagged out of Gi0/1 to PC2.</li>
</ol>
<p>This is what a packet capture on the trunk shows:</p>
<pre class="out">Ethernet II, Src: 00:50:79:66:68:01, Dst: 00:50:79:66:68:02
    Destination: 00:50:79:66:68:02
    Source: 00:50:79:66:68:01
<span class="hl">    Type: 802.1Q Virtual LAN (0x8100)</span>
<span class="hl">802.1Q Virtual LAN, PRI: 0, DEI: 0, ID: 10</span>
    000. .... .... .... = Priority: Best Effort (default) (0)
    ...0 .... .... .... = DEI: Ineligible
    .... 0000 0000 1010 = ID: 10
    Type: IPv4 (0x0800)
Internet Protocol Version 4, Src: 10.10.10.11, Dst: 10.10.10.12</pre>

<h3>ISL, the older Cisco method</h3>
<p>Before 802.1Q became universal, Cisco used <b>ISL</b> (Inter-Switch Link). ISL does not insert a tag; it <b>encapsulates</b> the whole original frame inside a new 26-byte header and adds a 4-byte trailer CRC, 30 bytes in total. ISL is proprietary, has no native VLAN concept, and is not supported on most current Catalyst switches. You only need to recognise it: some older switches that support both ask you to choose with <code>switchport trunk encapsulation dot1q</code> before a trunk can be forced on.</p>
<p>For senior interviews, also know <b>802.1ad (Q-in-Q)</b>: a service provider adds a second, outer tag (commonly TPID 0x88A8) around the customer's 802.1Q tag to carry many customer VLANs inside one provider VLAN.</p>

<div class="warn"><p><b>Common mistake.</b> Saying the tag is added "at the front of the frame" or "after the EtherType". It goes after the source MAC and before the EtherType/length field. Another mistake is forgetting that the FCS is recalculated each time a tag is added or removed.</p></div>

<div class="exam"><p><b>Exam trap.</b> Numbers are tested: tag size 4 bytes, TPID 0x8100, VID 12 bits, PCP 3 bits, usable VLANs 1 to 4094, ISL overhead 30 bytes. A question that says "802.1Q encapsulates the frame" is wrong: 802.1Q inserts a tag, ISL encapsulates.</p></div>

<div class="scn"><h4>Big transfers fail, pings work</h4><p>A company placed an older third-party media converter in the middle of a new trunk between two buildings. Pings worked, small web pages loaded, but file transfers and backups stalled. A capture showed full-size 1500-byte IP packets leaving one switch as 1522-byte tagged frames and never arriving. The converter only accepted frames up to 1518 bytes and silently dropped the larger tagged ones; small frames survived. Replacing the converter with one that supports 802.1Q frame sizes fixed it at once.</p><p><b>Lesson:</b> the tag adds 4 bytes. Every device in a trunk path must accept 1522-byte frames, otherwise only full-size packets fail, which looks like an application problem.</p></div>

<div class="iv"><p class="q">"Describe the 802.1Q header."</p><p>Strong answer: a 4-byte tag inserted after the source MAC. The first 2 bytes are the TPID, 0x8100. The next 2 bytes are the TCI: 3-bit PCP (CoS, used for QoS), 1-bit DEI (formerly CFI) and a 12-bit VLAN ID giving 4094 usable VLANs. The FCS is recalculated and the maximum frame becomes 1522 bytes. Contrast it with ISL, which encapsulates the frame with 30 bytes of overhead and is legacy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Trunks need tags so the receiving switch knows each frame's VLAN.</li>
<li>802.1Q inserts 4 bytes after the source MAC: TPID 0x8100 plus TCI (PCP 3 bits, DEI 1 bit, VID 12 bits).</li>
<li>The FCS is recalculated; maximum frame size becomes 1522 bytes.</li>
<li>Access ports send and receive untagged frames; the tag is added and removed at the trunk.</li>
<li>ISL is legacy Cisco encapsulation (30 bytes); 802.1Q is the standard you configure.</li>
</ul></div>
`,hi:`
<p>Office building par wapas chalo: har floor ke log ek staircase share karte hain, aur doosre end par har insaan ko sahi floor par nikalna hai. Yeh isliye ho paata hai kyunki sab ek badge pehente hain jisme unka floor number hai. Jab frame ek switch se doosre switch ki taraf shared link par jaata hai, use bhi aisa hi badge chahiye. Woh badge <b>802.1Q tag</b> hai, aur is chapter mein aap use bit by bit khologe.</p>

<h3>Tag kyun chahiye</h3>
<p>Lab 2 (Sahyadri Health) mein SW1 aur SW2 ke beech sirf ek cable hai, Gi0/0 se Gi0/0, par do user VLANs hain: STAFF (10) aur LAB (20). Jab SW2 us cable par frame receive karta hai, use pata hona chahiye ki woh kis VLAN ka hai, warna woh sahi MAC table choose nahi kar sakta ya sahi ports par flood nahi kar sakta. Access port yeh batane ka koi tareeka nahi rakhta, kyunki uske frames untagged hote hain. Isliye jo links kai VLANs carry karte hain, jinhe <b>trunks</b> kehte hain, woh har frame mein ek chhota field jodte hain jo VLAN ka naam batata hai.</p>

<h3>Tag kahan baithta hai</h3>
<p>IEEE 802.1Q Ethernet header mein <b>4 bytes</b> insert karta hai, seedha <b>source MAC address ke baad</b> aur original EtherType se pehle. Frame mein aur kuch move ya change nahi hota, bas <b>FCS</b> (end wala checksum) dobara calculate karna padta hai kyunki frame ka content badal gaya. Maximum standard frame size 1518 se <b>1522</b> bytes ho jaata hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Ethernet frame jisme source MAC ke baad 4-byte 802.1Q tag insert hai">
<rect x="10" y="30" width="90" height="44" fill="#e2e8f0" stroke="#64748b"/><text x="55" y="50" text-anchor="middle" class="svg-ink" font-size="12">Dest MAC</text><text x="55" y="66" text-anchor="middle" class="svg-muted" font-size="12">6 B</text>
<rect x="100" y="30" width="90" height="44" fill="#e2e8f0" stroke="#64748b"/><text x="145" y="50" text-anchor="middle" class="svg-ink" font-size="12">Src MAC</text><text x="145" y="66" text-anchor="middle" class="svg-muted" font-size="12">6 B</text>
<rect x="190" y="30" width="110" height="44" fill="#fde68a" stroke="#64748b"/><text x="245" y="50" text-anchor="middle" class="svg-ink" font-size="12">802.1Q tag</text><text x="245" y="66" text-anchor="middle" class="svg-muted" font-size="12">4 B</text>
<rect x="300" y="30" width="80" height="44" fill="#e2e8f0" stroke="#64748b"/><text x="340" y="50" text-anchor="middle" class="svg-ink" font-size="12">EtherType</text><text x="340" y="66" text-anchor="middle" class="svg-muted" font-size="12">2 B</text>
<rect x="380" y="30" width="170" height="44" fill="#bbf7d0" stroke="#64748b"/><text x="465" y="56" text-anchor="middle" class="svg-ink" font-size="12">Payload (IP packet)</text>
<rect x="550" y="30" width="80" height="44" fill="#fed7aa" stroke="#64748b"/><text x="590" y="50" text-anchor="middle" class="svg-ink" font-size="12">FCS</text><text x="590" y="66" text-anchor="middle" class="svg-muted" font-size="12">recalc</text>
<line x1="190" y1="74" x2="70" y2="130" stroke="#64748b" stroke-width="1.5"/><line x1="300" y1="74" x2="570" y2="130" stroke="#64748b" stroke-width="1.5"/>
<rect x="70" y="130" width="200" height="44" fill="#fde68a" stroke="#64748b"/><text x="170" y="150" text-anchor="middle" class="svg-ink" font-size="12">TPID 0x8100</text><text x="170" y="166" text-anchor="middle" class="svg-muted" font-size="12">16 bits</text>
<rect x="270" y="130" width="90" height="44" fill="#ddd6fe" stroke="#64748b"/><text x="315" y="150" text-anchor="middle" class="svg-ink" font-size="12">PCP</text><text x="315" y="166" text-anchor="middle" class="svg-muted" font-size="12">3 bits</text>
<rect x="360" y="130" width="60" height="44" fill="#e2e8f0" stroke="#64748b"/><text x="390" y="150" text-anchor="middle" class="svg-ink" font-size="12">DEI</text><text x="390" y="166" text-anchor="middle" class="svg-muted" font-size="12">1 bit</text>
<rect x="420" y="130" width="150" height="44" fill="#bae6fd" stroke="#64748b"/><text x="495" y="150" text-anchor="middle" class="svg-ink" font-size="12">VLAN ID</text><text x="495" y="166" text-anchor="middle" class="svg-muted" font-size="12">12 bits</text>
<text x="415" y="200" text-anchor="middle" class="svg-muted" font-size="12">PCP + DEI + VID = TCI (16 bits)</text>
</svg><p class="cap">Tag 4 bytes ka hai: 2-byte TPID aur 2-byte TCI jisme priority, drop eligibility aur 12-bit VLAN ID hai.</p></div>

<h3>Chaar fields</h3>
<dl class="terms">
<dt>TPID (Tag Protocol Identifier), 16 bits</dt><dd>802.1Q ke liye hamesha <b>0x8100</b>. Yeh wahan baithta hai jahan normally EtherType hota hai, isliye 0x8100 dekhne wala receiver samajh jaata hai ki "aage VLAN tag hai", "aage IPv4 packet hai" (0x0800) nahi.</dd>
<dt>PCP (Priority Code Point), 3 bits</dt><dd>Values 0 se 7, ise <b>CoS</b> (Class of Service) bhi kehte hain. QoS ke liye use hota hai; voice normally CoS 5 hota hai. Yeh 802.1Q tag ke andar carry hone wali 802.1p priority hai.</dd>
<dt>DEI (Drop Eligible Indicator), 1 bit</dt><dd>Un frames ko mark karta hai jo congestion mein pehle drop kiye ja sakte hain. Purane documents mein ise CFI (Canonical Format Indicator) kehte hain.</dd>
<dt>VID (VLAN Identifier), 12 bits</dt><dd>VLAN number. 12 bits se 4096 values milti hain, 0 se 4095; 0 aur 4095 reserved hain, isliye 1 se 4094 usable hain.</dd>
</dl>

<div class="eg"><p><b>Worked example: haath se tags decode karna.</b></p>
<ul>
<li>Bytes <code>81 00 00 0A</code>: TPID 0x8100; TCI 0x000A = binary 000 0 0000 0000 1010, yaani PCP 0, DEI 0, <b>VID 10</b>. Lab 2 ka STAFF frame.</li>
<li>Bytes <code>81 00 A0 6E</code>: TCI 0xA06E = 101 0 0000 0110 1110, yaani <b>PCP 5</b> (voice), DEI 0, <b>VID 110</b>. Chapter 5 ka phone frame.</li>
</ul></div>

<h3>Trunk ke across ek frame ka safar</h3>
<ol>
<li>SW1 Gi0/1 par PC1 (10.10.10.11), VLAN 10, PC2 (10.10.10.12) ko ek untagged frame bhejta hai.</li>
<li>SW1 use VLAN 10 se jodta hai, VLAN 10 mein PC2 ka MAC dhoondhta hai aur use trunk Gi0/0 ke through paata hai.</li>
<li>SW1 VID 10 wala tag insert karta hai, FCS dobara calculate karta hai aur trunk par bhejta hai.</li>
<li>SW2 TPID 0x8100 aur VID 10 padhta hai, apni VLAN 10 MAC table use karta hai, tag hataata hai aur frame ko Gi0/1 se PC2 ko untagged bhejta hai.</li>
</ol>
<p>Trunk par packet capture yeh dikhata hai:</p>
<pre class="out">Ethernet II, Src: 00:50:79:66:68:01, Dst: 00:50:79:66:68:02
    Destination: 00:50:79:66:68:02
    Source: 00:50:79:66:68:01
<span class="hl">    Type: 802.1Q Virtual LAN (0x8100)</span>
<span class="hl">802.1Q Virtual LAN, PRI: 0, DEI: 0, ID: 10</span>
    000. .... .... .... = Priority: Best Effort (default) (0)
    ...0 .... .... .... = DEI: Ineligible
    .... 0000 0000 1010 = ID: 10
    Type: IPv4 (0x0800)
Internet Protocol Version 4, Src: 10.10.10.11, Dst: 10.10.10.12</pre>

<h3>ISL, purana Cisco tareeka</h3>
<p>802.1Q ke universal hone se pehle Cisco <b>ISL</b> (Inter-Switch Link) use karta tha. ISL tag insert nahi karta; woh poore original frame ko ek naye 26-byte header ke andar <b>encapsulate</b> karta hai aur 4-byte trailer CRC jodta hai, total 30 bytes. ISL proprietary hai, isme native VLAN ka concept nahi hai, aur zyada tar current Catalyst switches par support nahi hota. Aapko bas ise pehchanna hai: kuch purane switches jo dono support karte hain, trunk force karne se pehle <code>switchport trunk encapsulation dot1q</code> se choose karne ko kehte hain.</p>
<p>Senior interviews ke liye <b>802.1ad (Q-in-Q)</b> bhi jaano: service provider customer ke 802.1Q tag ke bahar ek doosra, outer tag (aam taur par TPID 0x88A8) jodta hai taaki kai customer VLANs ek provider VLAN ke andar carry ho sakein.</p>

<div class="warn"><p><b>Common galti.</b> Kehna ki tag "frame ke bilkul aage" ya "EtherType ke baad" lagta hai. Woh source MAC ke baad aur EtherType/length field se pehle jaata hai. Doosri galti yeh bhoolna ki har baar tag jodne ya hataane par FCS dobara calculate hota hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Numbers test hote hain: tag size 4 bytes, TPID 0x8100, VID 12 bits, PCP 3 bits, usable VLANs 1 se 4094, ISL overhead 30 bytes. Jo question kahe "802.1Q frame ko encapsulate karta hai" woh galat hai: 802.1Q tag insert karta hai, ISL encapsulate karta hai.</p></div>

<div class="scn"><h4>Bade transfers fail, pings chalte hain</h4><p>Ek company ne do buildings ke beech naye trunk ke beech mein ek purana third-party media converter laga diya. Pings chalte the, chhote web pages load hote the, par file transfers aur backups atak jaate the. Capture ne dikhaya ki full-size 1500-byte IP packets ek switch se 1522-byte tagged frames ban kar nikalte the aur kabhi pahunchte nahi the. Converter sirf 1518 bytes tak ke frames accept karta tha aur bade tagged frames chupchaap drop kar deta tha; chhote frames bach jaate the. Converter ko aise model se badalne par jo 802.1Q frame sizes support karta ho, problem turant theek ho gayi.</p><p><b>Seekh:</b> tag 4 bytes jodta hai. Trunk path ke har device ko 1522-byte frames accept karne chahiye, warna sirf full-size packets fail hote hain, jo application problem jaisa dikhta hai.</p></div>

<div class="iv"><p class="q">"802.1Q header describe karo."</p><p>Strong answer: source MAC ke baad insert hone wala 4-byte tag. Pehle 2 bytes TPID hain, 0x8100. Agle 2 bytes TCI hain: 3-bit PCP (CoS, QoS ke liye), 1-bit DEI (pehle CFI) aur 12-bit VLAN ID jo 4094 usable VLANs deta hai. FCS dobara calculate hota hai aur maximum frame 1522 bytes ho jaata hai. ISL se compare karo, jo 30 bytes overhead ke saath frame ko encapsulate karta hai aur legacy hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Trunks ko tags chahiye taaki receiving switch ko har frame ka VLAN pata ho.</li>
<li>802.1Q source MAC ke baad 4 bytes insert karta hai: TPID 0x8100 plus TCI (PCP 3 bits, DEI 1 bit, VID 12 bits).</li>
<li>FCS dobara calculate hota hai; maximum frame size 1522 bytes ho jaata hai.</li>
<li>Access ports untagged frames bhejte aur lete hain; tag trunk par joda aur hataya jaata hai.</li>
<li>ISL legacy Cisco encapsulation hai (30 bytes); 802.1Q woh standard hai jo aap configure karte ho.</li>
</ul></div>
`}};export{e as default};