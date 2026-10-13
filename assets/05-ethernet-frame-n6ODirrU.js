var e={id:`ethernet`,h:{en:`The Ethernet frame and MAC addresses`,hi:`Ethernet frame aur MAC addresses`},body:{en:`
<p>Inside a large office, the internal mail trolley does not care about city names or postcodes. It needs just two things written on the envelope: which desk it goes to and which desk it came from. If the envelope is torn, the mail room throws it away. That internal envelope is the <b>Ethernet frame</b>, and the desk numbers are <b>MAC addresses</b>. Ethernet (IEEE 802.3) is the Layer 2 technology of almost every wired LAN and data center.</p>

<h3>The Ethernet II frame, field by field</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Ethernet frame fields">
<rect x="10" y="40" width="80" height="50" fill="#e2e8f0"/><text x="50" y="62" text-anchor="middle" class="svg-ink" font-size="12">Preamble</text><text x="50" y="80" text-anchor="middle" class="svg-muted" font-size="12">7</text>
<rect x="90" y="40" width="40" height="50" fill="#e2e8f0"/><text x="110" y="62" text-anchor="middle" class="svg-ink" font-size="12">SFD</text><text x="110" y="80" text-anchor="middle" class="svg-muted" font-size="12">1</text>
<rect x="130" y="40" width="100" height="50" fill="#bae6fd"/><text x="180" y="62" text-anchor="middle" class="svg-ink" font-size="12">Dest MAC</text><text x="180" y="80" text-anchor="middle" class="svg-muted" font-size="12">6</text>
<rect x="230" y="40" width="100" height="50" fill="#bae6fd"/><text x="280" y="62" text-anchor="middle" class="svg-ink" font-size="12">Src MAC</text><text x="280" y="80" text-anchor="middle" class="svg-muted" font-size="12">6</text>
<rect x="330" y="40" width="70" height="50" fill="#bae6fd"/><text x="365" y="62" text-anchor="middle" class="svg-ink" font-size="12">Type</text><text x="365" y="80" text-anchor="middle" class="svg-muted" font-size="12">2</text>
<rect x="400" y="40" width="160" height="50" fill="#ddd6fe"/><text x="480" y="62" text-anchor="middle" class="svg-ink" font-size="12">Payload (IP packet)</text><text x="480" y="80" text-anchor="middle" class="svg-muted" font-size="12">46-1500</text>
<rect x="560" y="40" width="70" height="50" fill="#bae6fd"/><text x="595" y="62" text-anchor="middle" class="svg-ink" font-size="12">FCS</text><text x="595" y="80" text-anchor="middle" class="svg-muted" font-size="12">4</text>
<text x="70" y="25" text-anchor="middle" class="svg-muted" font-size="12">not in the frame size</text>
<text x="265" y="118" text-anchor="middle" class="svg-accent" font-size="12">14-byte header</text>
<text x="380" y="150" text-anchor="middle" class="svg-ink" font-size="12">Frame = 64 to 1518 bytes (header + payload + FCS)</text>
</svg><p class="cap">Sizes in bytes. The preamble and SFD are sent on the wire but are not counted in the frame size.</p></div>

<dl class="terms">
<dt>Preamble (7 bytes) and SFD (1 byte)</dt><dd>Alternating 1s and 0s (10101010) let the receiver synchronise its clock; the Start Frame Delimiter (10101011) says "the frame starts now". Captures do not show them.</dd>
<dt>Destination MAC (6 bytes)</dt><dd>Who on this link should receive the frame. It comes <b>first</b> so a switch can start its forwarding decision as soon as it has read six bytes.</dd>
<dt>Source MAC (6 bytes)</dt><dd>Who sent it on this link. Switches <b>learn</b> from this field: "MAC X lives behind port Gi0/1".</dd>
<dt>Type / Length (2 bytes)</dt><dd>In Ethernet II, the <b>EtherType</b> names the payload: 0x0800 IPv4, 0x0806 ARP, 0x86DD IPv6. Values of 1536 (0x0600) or more are types; values up to 1500 mean the older IEEE 802.3 length format, where an LLC header follows (used by, for example, spanning tree BPDUs).</dd>
<dt>Payload (46 to 1500 bytes)</dt><dd>The IP packet. If it is shorter than 46 bytes, padding is added so the frame reaches the <b>minimum 64 bytes</b>. The 1500-byte maximum is the Ethernet <b>MTU</b>.</dd>
<dt>FCS (4 bytes)</dt><dd>Frame Check Sequence, a CRC-32 computed over the frame. The receiver recalculates it; a mismatch means the frame was damaged, and it is <b>discarded</b> and counted as a CRC error. Ethernet detects errors but never corrects or resends; that is TCP's job.</dd>
</dl>

<h3>MAC addresses</h3>
<p>A MAC address is <b>48 bits</b>, written as 12 hexadecimal digits. Cisco writes <code>5254.00a1.0010</code>, most other systems write <code>52:54:00:a1:00:10</code> or <code>52-54-00-A1-00-10</code>; all three are the same address. The first 24 bits are the <b>OUI</b> (Organisationally Unique Identifier) that the IEEE assigns to a manufacturer; the last 24 bits are chosen by the manufacturer. The address burned into the NIC is the <b>BIA</b> (burned-in address).</p>
<ul>
<li><b>Unicast</b>: one NIC. The lowest bit of the first byte (the I/G bit) is 0.</li>
<li><b>Multicast</b>: a group. The I/G bit is 1. IPv4 multicast maps to MACs starting <code>0100.5e</code>.</li>
<li><b>Broadcast</b>: everyone on the LAN, <code>ffff.ffff.ffff</code>. ARP requests use it.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> PC1's MAC is 52:54:00:a1:00:10. The first byte 0x52 is 0101 0010 in binary. The lowest bit is 0, so it is <b>unicast</b>. The next bit (the U/L bit) is 1, so it is a <b>locally administered</b> address, which is typical for virtual machines; 52:54:00 is the prefix commonly used by KVM/QEMU virtual NICs. A laptop's real NIC would have that bit set to 0 and a vendor OUI.</p></div>

<h3>How SW1 uses the frame</h3>
<p>SW1 checks the FCS, learns the source MAC against the incoming port, then looks up the destination MAC. Known unicast is sent out of one port; broadcast, multicast and unknown unicast are <b>flooded</b> out of every port in the VLAN except the one it came in on. SW1 changes <b>nothing</b> in the frame.</p>
<pre class="code"><span class="c">! Which MACs has SW1 learned, and on which ports?</span>
SW1# show mac address-table dynamic</pre>
<pre class="out">          Mac Address Table
-------------------------------------------

Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
<span class="hl">   1    5254.00a1.0010    DYNAMIC     Gi0/1</span>
   1    5254.0c04.4b01    DYNAMIC     Gi0/0
Total Mac Addresses for this criterion: 2</pre>
<p>PC1 lives behind Gi0/1 and R1's LAN interface behind Gi0/0, exactly as cabled. Notice there is no entry for SRV: SRV is on another subnet, and its frames never reach SW1.</p>

<h3>A look ahead: the 802.1Q tag</h3>
<p>On trunk links a switch inserts a 4-byte <b>802.1Q tag</b> between the source MAC and the EtherType: TPID <code>0x8100</code>, then 3 bits of priority (PCP), 1 DEI bit and a 12-bit <b>VLAN ID</b>. The maximum frame grows to 1522 bytes. You will configure this in ccna-vlans.</p>

<div class="warn"><p><b>Common mistakes.</b> Thinking the switch "adds its own MAC" to frames it forwards (it does not). Mixing up MTU (1500, the payload) and frame size (1518). Assuming a CRC error was caused by the device that reports it: the counter increments on the <b>receiving</b> side, so the bad cable, optic or far-end port is on that link.</p></div>

<div class="exam"><p><b>Exam traps.</b> Ethernet header = 14 bytes, FCS = 4 bytes, minimum frame = 64 bytes, maximum = 1518 (1522 tagged). The FCS detects errors only. The EtherType for IPv4 is 0x0800 and for ARP 0x0806. The OUI is the first half of the MAC.</p></div>

<div class="scn"><h4>The printer that dropped jobs</h4><p>Users complained that large print jobs to one floor printer failed randomly. On the access switch the engineer ran <code>show interfaces GigabitEthernet1/0/14</code> and saw <b>input errors and CRC</b> counters increasing every few seconds while other ports were clean. The FCS check was failing on frames arriving from the printer, so the switch discarded them and TCP kept retransmitting until the job timed out. A crushed patch cable under a desk leg was replaced; the counters stopped and print jobs finished.</p><p><b>Lesson:</b> CRC and FCS errors point to the physical path of that link. Clear the counters, watch them, and fix the cable or optic before touching configuration.</p></div>

<div class="iv"><p class="q">"What is in an Ethernet header and what does a switch do with it?"</p><p>Name the fields in order: destination MAC, source MAC, EtherType (plus preamble/SFD before and FCS after). Explain that the switch learns the source MAC, forwards or floods based on the destination MAC, drops frames that fail the FCS, and changes nothing. Bonus: explain why destination comes first (cut-through switching) and what the 802.1Q tag adds.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ethernet II: Preamble+SFD, destination MAC, source MAC, EtherType, payload 46-1500, FCS.</li>
<li>Frame size 64 to 1518 bytes; MTU 1500; 802.1Q adds 4 bytes.</li>
<li>MAC = 48 bits: 24-bit OUI + 24-bit vendor part; unicast, multicast, broadcast ffff.ffff.ffff.</li>
<li>Switches learn source MACs, forward on destination MAC, flood unknown and broadcast, and never modify the frame.</li>
<li>FCS failures mean discarded frames and a physical problem on that link.</li>
</ul></div>
`,hi:`
<p>Ek badi office ke andar, internal mail trolley ko shehron ke naam ya pincodes ki parwah nahi. Use envelope par sirf do cheezein likhi chahiye: kis desk par jaana hai aur kis desk se aaya hai. Agar envelope phata ho, to mail room use phenk deta hai. Woh internal envelope <b>Ethernet frame</b> hai, aur desk numbers <b>MAC addresses</b> hain. Ethernet (IEEE 802.3) lagbhag har wired LAN aur data center ki Layer 2 technology hai.</p>

<h3>Ethernet II frame, field by field</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Ethernet frame ke fields">
<rect x="10" y="40" width="80" height="50" fill="#e2e8f0"/><text x="50" y="62" text-anchor="middle" class="svg-ink" font-size="12">Preamble</text><text x="50" y="80" text-anchor="middle" class="svg-muted" font-size="12">7</text>
<rect x="90" y="40" width="40" height="50" fill="#e2e8f0"/><text x="110" y="62" text-anchor="middle" class="svg-ink" font-size="12">SFD</text><text x="110" y="80" text-anchor="middle" class="svg-muted" font-size="12">1</text>
<rect x="130" y="40" width="100" height="50" fill="#bae6fd"/><text x="180" y="62" text-anchor="middle" class="svg-ink" font-size="12">Dest MAC</text><text x="180" y="80" text-anchor="middle" class="svg-muted" font-size="12">6</text>
<rect x="230" y="40" width="100" height="50" fill="#bae6fd"/><text x="280" y="62" text-anchor="middle" class="svg-ink" font-size="12">Src MAC</text><text x="280" y="80" text-anchor="middle" class="svg-muted" font-size="12">6</text>
<rect x="330" y="40" width="70" height="50" fill="#bae6fd"/><text x="365" y="62" text-anchor="middle" class="svg-ink" font-size="12">Type</text><text x="365" y="80" text-anchor="middle" class="svg-muted" font-size="12">2</text>
<rect x="400" y="40" width="160" height="50" fill="#ddd6fe"/><text x="480" y="62" text-anchor="middle" class="svg-ink" font-size="12">Payload (IP packet)</text><text x="480" y="80" text-anchor="middle" class="svg-muted" font-size="12">46-1500</text>
<rect x="560" y="40" width="70" height="50" fill="#bae6fd"/><text x="595" y="62" text-anchor="middle" class="svg-ink" font-size="12">FCS</text><text x="595" y="80" text-anchor="middle" class="svg-muted" font-size="12">4</text>
<text x="70" y="25" text-anchor="middle" class="svg-muted" font-size="12">frame size mein nahi</text>
<text x="265" y="118" text-anchor="middle" class="svg-accent" font-size="12">14-byte header</text>
<text x="380" y="150" text-anchor="middle" class="svg-ink" font-size="12">Frame = 64 se 1518 bytes (header + payload + FCS)</text>
</svg><p class="cap">Sizes bytes mein. Preamble aur SFD wire par bheje jaate hain lekin frame size mein gine nahi jaate.</p></div>

<dl class="terms">
<dt>Preamble (7 bytes) aur SFD (1 byte)</dt><dd>Baari baari 1 aur 0 (10101010) receiver ko apni clock sync karne dete hain; Start Frame Delimiter (10101011) kehta hai "frame ab shuru hota hai". Captures inhe nahi dikhate.</dd>
<dt>Destination MAC (6 bytes)</dt><dd>Is link par frame kise receive karna chahiye. Yeh <b>pehle</b> aata hai taaki switch chhe bytes padhte hi apna forwarding decision shuru kar sake.</dd>
<dt>Source MAC (6 bytes)</dt><dd>Is link par kisne bheja. Switches is field se <b>seekhte</b> hain: "MAC X port Gi0/1 ke peeche rehta hai".</dd>
<dt>Type / Length (2 bytes)</dt><dd>Ethernet II mein <b>EtherType</b> payload ka naam batata hai: 0x0800 IPv4, 0x0806 ARP, 0x86DD IPv6. 1536 (0x0600) ya usse zyada values types hain; 1500 tak ki values purane IEEE 802.3 length format ka matlab hain, jahan baad mein LLC header aata hai (jaise spanning tree BPDUs mein).</dd>
<dt>Payload (46 se 1500 bytes)</dt><dd>IP packet. Agar yeh 46 bytes se chhota ho, to padding jodi jaati hai taaki frame <b>minimum 64 bytes</b> tak pahunche. 1500-byte maximum Ethernet ka <b>MTU</b> hai.</dd>
<dt>FCS (4 bytes)</dt><dd>Frame Check Sequence, frame par nikala gaya CRC-32. Receiver ise dobara nikaalta hai; mismatch ka matlab frame kharab hua, aur woh <b>discard</b> hota hai aur CRC error gina jaata hai. Ethernet errors detect karta hai lekin kabhi correct ya dobara nahi bhejta; yeh TCP ka kaam hai.</dd>
</dl>

<h3>MAC addresses</h3>
<p>MAC address <b>48 bits</b> ka hota hai, 12 hexadecimal digits mein likha jaata hai. Cisco <code>5254.00a1.0010</code> likhta hai, zyada tar dusre systems <code>52:54:00:a1:00:10</code> ya <code>52-54-00-A1-00-10</code> likhte hain; teeno same address hain. Pehle 24 bits <b>OUI</b> (Organisationally Unique Identifier) hain jo IEEE kisi manufacturer ko deta hai; aakhri 24 bits manufacturer chunta hai. NIC mein burn kiya address <b>BIA</b> (burned-in address) hai.</p>
<ul>
<li><b>Unicast</b>: ek NIC. Pehle byte ka sabse neecha bit (I/G bit) 0 hota hai.</li>
<li><b>Multicast</b>: ek group. I/G bit 1 hota hai. IPv4 multicast <code>0100.5e</code> se shuru hone wale MACs par map hota hai.</li>
<li><b>Broadcast</b>: LAN par sab, <code>ffff.ffff.ffff</code>. ARP requests ise use karti hain.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> PC1 ka MAC 52:54:00:a1:00:10 hai. Pehla byte 0x52 binary mein 0101 0010 hai. Sabse neecha bit 0 hai, isliye yeh <b>unicast</b> hai. Agla bit (U/L bit) 1 hai, isliye yeh <b>locally administered</b> address hai, jo virtual machines ke liye typical hai; 52:54:00 woh prefix hai jo KVM/QEMU virtual NICs aam taur par use karte hain. Laptop ke real NIC mein woh bit 0 hota aur vendor ka OUI hota.</p></div>

<h3>SW1 frame ka use kaise karta hai</h3>
<p>SW1 FCS check karta hai, source MAC ko incoming port ke saath seekhta hai, phir destination MAC dhoondhta hai. Known unicast ek port se bheja jaata hai; broadcast, multicast aur unknown unicast VLAN ke har port se <b>flood</b> hote hain, sivaay us port ke jahan se aaye. SW1 frame mein <b>kuch nahi</b> badalta.</p>
<pre class="code"><span class="c">! SW1 ne kaunse MACs seekhe hain, aur kin ports par?</span>
SW1# show mac address-table dynamic</pre>
<pre class="out">          Mac Address Table
-------------------------------------------

Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
<span class="hl">   1    5254.00a1.0010    DYNAMIC     Gi0/1</span>
   1    5254.0c04.4b01    DYNAMIC     Gi0/0
Total Mac Addresses for this criterion: 2</pre>
<p>PC1 Gi0/1 ke peeche hai aur R1 ka LAN interface Gi0/0 ke peeche, bilkul cabling ke hisaab se. Dhyan do ki SRV ki koi entry nahi: SRV dusre subnet par hai, aur uske frames kabhi SW1 tak nahi pahunchte.</p>

<h3>Aage ki jhalak: 802.1Q tag</h3>
<p>Trunk links par switch source MAC aur EtherType ke beech 4-byte ka <b>802.1Q tag</b> daalta hai: TPID <code>0x8100</code>, phir 3 bits priority (PCP), 1 DEI bit aur 12-bit <b>VLAN ID</b>. Maximum frame 1522 bytes ho jaata hai. Ise aap ccna-vlans mein configure karoge.</p>

<div class="warn"><p><b>Common galtiyan.</b> Sochna ki switch forward kiye frames mein "apna MAC jodta hai" (nahi jodta). MTU (1500, payload) aur frame size (1518) mix karna. Maan lena ki CRC error us device ne kiya jo use report kar raha hai: counter <b>receiving</b> side par badhta hai, isliye kharab cable, optic ya far-end port usi link par hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Ethernet header = 14 bytes, FCS = 4 bytes, minimum frame = 64 bytes, maximum = 1518 (tagged 1522). FCS sirf errors detect karta hai. IPv4 ka EtherType 0x0800 aur ARP ka 0x0806 hai. OUI MAC ka pehla aadha hissa hai.</p></div>

<div class="scn"><h4>Printer jo jobs gira deta tha</h4><p>Users ki shikayat thi ki floor ke ek printer par bade print jobs randomly fail hote the. Access switch par engineer ne <code>show interfaces GigabitEthernet1/0/14</code> chalaya aur dekha ki <b>input errors aur CRC</b> counters har kuch second mein badh rahe the jabki baaki ports clean the. Printer se aane wale frames par FCS check fail ho raha tha, isliye switch unhe discard kar raha tha aur TCP retransmit karta rehta tha jab tak job timeout na ho jaaye. Desk ke paaye ke neeche dabi ek patch cable badli gayi; counters ruk gaye aur print jobs poore hone lage.</p><p><b>Seekh:</b> CRC aur FCS errors us link ke physical path ki taraf ishaara karte hain. Counters clear karo, unhe dekho, aur configuration chhune se pehle cable ya optic theek karo.</p></div>

<div class="iv"><p class="q">"Ethernet header mein kya hota hai aur switch uske saath kya karta hai?"</p><p>Fields order mein batao: destination MAC, source MAC, EtherType (pehle preamble/SFD aur baad mein FCS). Samjhao ki switch source MAC seekhta hai, destination MAC ke basis par forward ya flood karta hai, FCS fail hone wale frames drop karta hai, aur kuch nahi badalta. Bonus: samjhao ki destination pehle kyun aata hai (cut-through switching) aur 802.1Q tag kya jodta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ethernet II: Preamble+SFD, destination MAC, source MAC, EtherType, payload 46-1500, FCS.</li>
<li>Frame size 64 se 1518 bytes; MTU 1500; 802.1Q 4 bytes jodta hai.</li>
<li>MAC = 48 bits: 24-bit OUI + 24-bit vendor part; unicast, multicast, broadcast ffff.ffff.ffff.</li>
<li>Switches source MACs seekhte hain, destination MAC par forward karte hain, unknown aur broadcast flood karte hain, aur frame kabhi modify nahi karte.</li>
<li>FCS failures ka matlab discarded frames aur us link par physical problem.</li>
</ul></div>
`}};export{e as default};