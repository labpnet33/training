var e={id:`filters-panes`,h:{en:`Capture filters, display filters and the three panes`,hi:`Capture filters, display filters aur teen panes`},body:{en:`
<p>A fisherman has two ways to be selective. He can choose the <b>mesh of the net</b> before he throws it: small fish swim straight through and are gone forever. Or he can pull everything aboard and <b>sort the catch on the deck</b>, putting aside what he does not need right now but keeping it in the boat. Capture filters are the mesh. Display filters are the sorting table.</p>

<h3>Capture filters: decide what is recorded</h3>
<p>A <b>capture filter</b> is applied while packets are being recorded. Anything that does not match is never saved. Wireshark and <code>tcpdump</code> use the <b>BPF</b> (Berkeley Packet Filter) syntax for this, which is short and word-based:</p>
<table class="cmp"><tr><th>Capture filter (BPF)</th><th>Keeps</th></tr>
<tr><td><code>host 10.9.9.1</code></td><td>Packets to or from 10.9.9.1</td></tr>
<tr><td><code>net 10.5.5.0/24</code></td><td>Packets to or from that subnet</td></tr>
<tr><td><code>tcp port 22</code></td><td>SSH traffic in either direction</td></tr>
<tr><td><code>arp or icmp</code></td><td>ARP and ICMP only</td></tr>
<tr><td><code>host 10.9.9.1 and not port 22</code></td><td>Everything with that host except SSH</td></tr>
</table>
<pre class="code"><span class="c"># on a Linux server: interface eth0, no name lookups, only SSH with the router</span>
tcpdump -i eth0 -nn host 10.9.9.1 and tcp port 22 -w ssh.pcap</pre>
<p>Use capture filters when the link is busy and you cannot store everything, for example a 10 Gbps uplink. The risk: if you filter on the wrong thing, the evidence is gone. Filtering on <code>tcp port 22</code> will hide the ICMP unreachable that explained why SSH failed.</p>

<h3>Display filters: decide what is shown</h3>
<p>A <b>display filter</b> is applied after recording. It hides non-matching packets from the list but deletes nothing, so you can change it a hundred times. Display filters use <b>field names</b> from the protocol tree and comparison operators:</p>
<table class="cmp"><tr><th>Display filter</th><th>Shows</th></tr>
<tr><td><code>arp</code>, <code>icmp</code>, <code>tcp</code>, <code>udp</code>, <code>dns</code>, <code>dhcp</code>, <code>ospf</code></td><td>One protocol</td></tr>
<tr><td><code>ip.addr == 10.9.9.1</code></td><td>Source or destination is 10.9.9.1</td></tr>
<tr><td><code>ip.src == 10.9.9.10 &amp;&amp; tcp.port == 22</code></td><td>SSH sent by PC1</td></tr>
<tr><td><code>arp.opcode == 2</code></td><td>ARP replies only</td></tr>
<tr><td><code>icmp.type == 3</code></td><td>Destination unreachable messages</td></tr>
<tr><td><code>tcp.flags.syn == 1 &amp;&amp; tcp.flags.ack == 0</code></td><td>Connection attempts (first SYN only)</td></tr>
<tr><td><code>tcp.flags.reset == 1</code></td><td>Resets (Wireshark field name)</td></tr>
<tr><td><code>tcp.analysis.retransmission</code></td><td>Retransmitted segments (Wireshark analysis)</td></tr>
</table>
<p>Operators: <code>==</code> <code>!=</code> <code>&gt;</code> <code>&lt;</code>, joined with <code>&amp;&amp;</code> or <code>and</code>, <code>||</code> or <code>or</code>, and negated with <code>!</code> or <code>not</code>.</p>

<div class="warn"><p><b>Common mistake.</b> Mixing the two syntaxes. <code>host 10.9.9.1</code> is a capture filter and is invalid as a display filter; <code>ip.addr == 10.9.9.1</code> is a display filter and is invalid as a capture filter. A second classic: in Wireshark, <code>ip.addr != 10.1.1.1</code> can still show packets involving 10.1.1.1, because a packet has two addresses and one of them is not 10.1.1.1. Write <code>!(ip.addr == 10.1.1.1)</code> instead.</p></div>

<h3>The three panes</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Capture viewer panes">
<rect x="10" y="10" width="620" height="30" rx="6" fill="#bbf7d0"/><text x="20" y="30" class="svg-ink" font-size="12">Filter: tcp  (green = valid)       Displayed: 4/37      Save .pcap   Clear</text>
<rect x="10" y="46" width="620" height="80" rx="6" fill="#bae6fd"/><text x="20" y="66" class="svg-ink" font-size="12">1 Packet list: No. | Time | Source | Destination | Protocol | Length | Info</text>
<text x="20" y="90" class="svg-muted" font-size="12">3  0.001  10.9.9.10  10.9.9.1  TCP  60  51234 → 22 [SYN] Seq=0</text>
<text x="20" y="112" class="svg-accent" font-size="12">4  0.002  10.9.9.1  10.9.9.10  TCP  60  22 → 51234 [RST, ACK] Seq=0 Ack=1</text>
<rect x="10" y="132" width="330" height="108" rx="6" fill="#ddd6fe"/><text x="20" y="152" class="svg-ink" font-size="12">2 Packet details (tree)</text>
<text x="30" y="174" class="svg-muted" font-size="12">Frame 4: 60 bytes on wire</text><text x="30" y="194" class="svg-muted" font-size="12">Ethernet II, IPv4, TCP</text><text x="30" y="214" class="svg-muted" font-size="12">Flags: 0x014 (RST, ACK)</text>
<rect x="350" y="132" width="280" height="108" rx="6" fill="#fde68a"/><text x="360" y="152" class="svg-ink" font-size="12">3 Packet bytes (hex + ASCII)</text>
<text x="360" y="176" class="svg-muted" font-size="12">0000  52 54 00 ...</text><text x="360" y="198" class="svg-muted" font-size="12">0010  00 28 ...</text>
</svg><p class="cap">List on top, details bottom-left, bytes bottom-right. Click a field in the tree and its bytes light up.</p></div>
<ol>
<li><b>Packet list.</b> One row per frame. <b>No.</b> is the order in the capture, <b>Time</b> is seconds since the capture started, <b>Source</b> and <b>Destination</b> are IP addresses (or MAC addresses for ARP and other non-IP frames), <b>Protocol</b> is the highest layer decoded, <b>Length</b> is bytes on the wire, and <b>Info</b> is a one-line summary: flags, ports, sequence numbers, ARP question.</li>
<li><b>Packet details.</b> The selected frame decoded as a tree, one layer per line: Frame, Ethernet II, then ARP or IPv4, then ICMP, TCP, UDP or OSPF, then the application. Expand a layer to see every field and its value.</li>
<li><b>Packet bytes.</b> The raw frame in hexadecimal with offsets on the left and printable ASCII on the right. Clicking a field in the tree highlights its bytes, and clicking a byte selects its field.</li>
</ol>

<h3>This course's capture viewer</h3>
<p>The lab viewer follows the same layout and adds two teaching panels under the bytes: a <b>Header anatomy</b> diagram that draws the selected header bit by bit, and <b>What this field does</b>, which explains the chosen field and shows its filter key, offset and length. Rows are coloured by type: resets in red, ARP, ICMP errors, routing protocols, and SYN or FIN segments each have their own shade. The filter box turns green for valid syntax and red for invalid syntax, and "Displayed: x/y" shows how many packets pass. <b>Save .pcap</b> downloads what is displayed so you can open it in Wireshark.</p>
<p>The viewer supports the common fields you will use in this module: <code>eth.addr</code>, <code>arp.opcode</code>, <code>ip.addr</code>, <code>ip.src</code>, <code>ip.dst</code>, <code>ip.ttl</code>, <code>icmp.type</code>, <code>icmp.code</code>, <code>tcp.port</code>, <code>tcp.flags.syn</code>, <code>tcp.flags.ack</code>, <code>udp.port</code>, <code>ospf.srcrouter</code> and <code>ospf.hello.hello_interval</code>. Two differences from Wireshark: the reset flag field is <code>tcp.flags.rst</code> (Wireshark calls it <code>tcp.flags.reset</code>), and parentheses are not supported, so keep filters to simple <code>&amp;&amp;</code> and <code>||</code> chains. A green box only means the syntax parses; if an unknown field name drops "Displayed" to 0, check the key shown in "What this field does".</p>

<div class="eg"><p><b>Worked example.</b> In Lab 2 the capture on <code>PC1 eth0 ↔ SW1 Gi0/1</code> holds 37 frames: ARP, pings, SSH attempts. Type <code>tcp</code>: Displayed 4/37. The rows are SYN from 10.9.9.10, RST, ACK from 10.9.9.1, and the same pair again for the retry. Type <code>tcp.flags.rst == 1</code>: Displayed 2/37, both from 10.9.9.1. Two keystrokes turned 37 packets into the answer.</p></div>

<div class="exam"><p><b>Exam trap.</b> Capture filter = before recording, data not matching is lost. Display filter = after recording, nothing is lost. If a question asks how to review an existing capture for one host, the answer is a display filter.</p></div>

<div class="scn"><h4>The filter that hid the answer</h4><p>A junior engineer investigating failed HTTPS connections captured on a server with the capture filter <code>tcp port 443</code>. The capture showed SYNs arriving and nothing leaving. Two hours later a senior engineer captured again without a filter and immediately saw the server sending ICMP type 3 code 4 (fragmentation needed) messages in response. Those ICMP messages had been thrown away by the capture filter. An MTU mismatch on a new VPN path was the real cause.</p><p><b>Lesson:</b> capture broadly and narrow with display filters. Only use capture filters when volume forces you to, and never filter out ICMP while troubleshooting.</p></div>

<div class="iv"><p class="q">"What is the difference between a capture filter and a display filter?"</p><p>Strong answer: a capture filter uses BPF syntax, like <code>host 10.1.1.1 and port 22</code>, and decides what gets recorded; anything else is lost. A display filter uses protocol field names, like <code>ip.addr == 10.1.1.1 &amp;&amp; tcp.port == 22</code>, and only hides packets from view. I capture broadly and use display filters to narrow down, unless the link is too busy. Bonus: mention the <code>!=</code> trap with <code>ip.addr</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Capture filters (BPF) decide what is recorded; non-matching packets are lost.</li>
<li>Display filters (field names) decide what is shown; nothing is lost.</li>
<li>Three panes: packet list, packet details tree, packet bytes. Clicking one highlights the others.</li>
<li>The lab viewer adds Header anatomy and field explanations, and uses <code>tcp.flags.rst</code> for resets.</li>
<li>Watch the "Displayed: x/y" counter so a filter never fools you into "no traffic".</li>
</ul></div>
`,hi:`
<p>Ek machhuare ke paas selective hone ke do tareeke hain. Woh jaal phenkne se pehle <b>jaal ki mesh</b> chun sakta hai: chhoti machhliyan seedhi nikal jaati hain aur hamesha ke liye chali jaati hain. Ya woh sab kuch naav mein kheench kar <b>deck par catch sort</b> kar sakta hai, jo abhi nahi chahiye use side mein rakh deta hai lekin naav mein hi rakhta hai. Capture filters mesh hain. Display filters sorting table hain.</p>

<h3>Capture filters: kya record ho yeh tay karo</h3>
<p><b>Capture filter</b> packets record hote waqt lagta hai. Jo match nahi karta woh kabhi save nahi hota. Wireshark aur <code>tcpdump</code> iske liye <b>BPF</b> (Berkeley Packet Filter) syntax use karte hain, jo chhota aur words-based hai:</p>
<table class="cmp"><tr><th>Capture filter (BPF)</th><th>Kya rakhta hai</th></tr>
<tr><td><code>host 10.9.9.1</code></td><td>10.9.9.1 ko ya usse aane wale packets</td></tr>
<tr><td><code>net 10.5.5.0/24</code></td><td>Us subnet ko ya usse aane wale packets</td></tr>
<tr><td><code>tcp port 22</code></td><td>Dono directions ka SSH traffic</td></tr>
<tr><td><code>arp or icmp</code></td><td>Sirf ARP aur ICMP</td></tr>
<tr><td><code>host 10.9.9.1 and not port 22</code></td><td>Us host ka sab kuch, SSH ke alawa</td></tr>
</table>
<pre class="code"><span class="c"># Linux server par: interface eth0, name lookups nahi, sirf router ke saath SSH</span>
tcpdump -i eth0 -nn host 10.9.9.1 and tcp port 22 -w ssh.pcap</pre>
<p>Capture filters tab use karo jab link busy ho aur sab kuch store na kar sako, jaise 10 Gbps uplink. Risk: galat cheez par filter kiya to saboot chala gaya. <code>tcp port 22</code> par filter karne se woh ICMP unreachable chhup jaayega jo batata ki SSH kyun fail hua.</p>

<h3>Display filters: kya dikhe yeh tay karo</h3>
<p><b>Display filter</b> recording ke baad lagta hai. Yeh non-matching packets ko list se chhupata hai lekin kuch delete nahi karta, isliye aap ise sau baar badal sakte ho. Display filters protocol tree ke <b>field names</b> aur comparison operators use karte hain:</p>
<table class="cmp"><tr><th>Display filter</th><th>Kya dikhata hai</th></tr>
<tr><td><code>arp</code>, <code>icmp</code>, <code>tcp</code>, <code>udp</code>, <code>dns</code>, <code>dhcp</code>, <code>ospf</code></td><td>Ek protocol</td></tr>
<tr><td><code>ip.addr == 10.9.9.1</code></td><td>Source ya destination 10.9.9.1 hai</td></tr>
<tr><td><code>ip.src == 10.9.9.10 &amp;&amp; tcp.port == 22</code></td><td>PC1 ka bheja SSH</td></tr>
<tr><td><code>arp.opcode == 2</code></td><td>Sirf ARP replies</td></tr>
<tr><td><code>icmp.type == 3</code></td><td>Destination unreachable messages</td></tr>
<tr><td><code>tcp.flags.syn == 1 &amp;&amp; tcp.flags.ack == 0</code></td><td>Connection attempts (sirf pehla SYN)</td></tr>
<tr><td><code>tcp.flags.reset == 1</code></td><td>Resets (Wireshark field name)</td></tr>
<tr><td><code>tcp.analysis.retransmission</code></td><td>Retransmitted segments (Wireshark analysis)</td></tr>
</table>
<p>Operators: <code>==</code> <code>!=</code> <code>&gt;</code> <code>&lt;</code>, <code>&amp;&amp;</code> ya <code>and</code>, <code>||</code> ya <code>or</code> se jode jaate hain, aur <code>!</code> ya <code>not</code> se ulte kiye jaate hain.</p>

<div class="warn"><p><b>Common galti.</b> Dono syntaxes mix karna. <code>host 10.9.9.1</code> capture filter hai aur display filter ke roop mein invalid hai; <code>ip.addr == 10.9.9.1</code> display filter hai aur capture filter ke roop mein invalid hai. Dusri classic galti: Wireshark mein <code>ip.addr != 10.1.1.1</code> phir bhi 10.1.1.1 wale packets dikha sakta hai, kyunki packet mein do addresses hote hain aur unmein se ek 10.1.1.1 nahi hota. Iski jagah <code>!(ip.addr == 10.1.1.1)</code> likho.</p></div>

<h3>Teen panes</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Capture viewer ke panes">
<rect x="10" y="10" width="620" height="30" rx="6" fill="#bbf7d0"/><text x="20" y="30" class="svg-ink" font-size="12">Filter: tcp  (green = valid)       Displayed: 4/37      Save .pcap   Clear</text>
<rect x="10" y="46" width="620" height="80" rx="6" fill="#bae6fd"/><text x="20" y="66" class="svg-ink" font-size="12">1 Packet list: No. | Time | Source | Destination | Protocol | Length | Info</text>
<text x="20" y="90" class="svg-muted" font-size="12">3  0.001  10.9.9.10  10.9.9.1  TCP  60  51234 → 22 [SYN] Seq=0</text>
<text x="20" y="112" class="svg-accent" font-size="12">4  0.002  10.9.9.1  10.9.9.10  TCP  60  22 → 51234 [RST, ACK] Seq=0 Ack=1</text>
<rect x="10" y="132" width="330" height="108" rx="6" fill="#ddd6fe"/><text x="20" y="152" class="svg-ink" font-size="12">2 Packet details (tree)</text>
<text x="30" y="174" class="svg-muted" font-size="12">Frame 4: 60 bytes on wire</text><text x="30" y="194" class="svg-muted" font-size="12">Ethernet II, IPv4, TCP</text><text x="30" y="214" class="svg-muted" font-size="12">Flags: 0x014 (RST, ACK)</text>
<rect x="350" y="132" width="280" height="108" rx="6" fill="#fde68a"/><text x="360" y="152" class="svg-ink" font-size="12">3 Packet bytes (hex + ASCII)</text>
<text x="360" y="176" class="svg-muted" font-size="12">0000  52 54 00 ...</text><text x="360" y="198" class="svg-muted" font-size="12">0010  00 28 ...</text>
</svg><p class="cap">Upar list, neeche left details, neeche right bytes. Tree mein field par click karo aur uske bytes highlight ho jaate hain.</p></div>
<ol>
<li><b>Packet list.</b> Har frame ki ek row. <b>No.</b> capture mein order hai, <b>Time</b> capture shuru hone se seconds hain, <b>Source</b> aur <b>Destination</b> IP addresses hain (ARP aur dusre non-IP frames ke liye MAC addresses), <b>Protocol</b> sabse upar ki decoded layer hai, <b>Length</b> wire par bytes hai, aur <b>Info</b> ek line ki summary hai: flags, ports, sequence numbers, ARP ka sawaal.</li>
<li><b>Packet details.</b> Chuna hua frame tree ke roop mein decode hota hai, har line ek layer: Frame, Ethernet II, phir ARP ya IPv4, phir ICMP, TCP, UDP ya OSPF, phir application. Layer expand karo aur har field aur uski value dekho.</li>
<li><b>Packet bytes.</b> Raw frame hexadecimal mein, left mein offsets aur right mein printable ASCII. Tree mein field par click karne se uske bytes highlight hote hain, aur byte par click karne se uska field select hota hai.</li>
</ol>

<h3>Is course ka capture viewer</h3>
<p>Lab viewer yahi layout follow karta hai aur bytes ke neeche do teaching panels jodta hai: <b>Header anatomy</b> diagram jo chune header ko bit by bit draw karta hai, aur <b>What this field does</b>, jo chuna field samjhata hai aur uska filter key, offset aur length dikhata hai. Rows type ke hisaab se colour hoti hain: resets laal, ARP, ICMP errors, routing protocols, aur SYN ya FIN segments sabka apna shade. Filter box valid syntax par green aur invalid syntax par laal hota hai, aur "Displayed: x/y" batata hai kitne packets pass hue. <b>Save .pcap</b> jo dikh raha hai use download karta hai taaki aap Wireshark mein khol sako.</p>
<p>Viewer is module mein use hone wale common fields support karta hai: <code>eth.addr</code>, <code>arp.opcode</code>, <code>ip.addr</code>, <code>ip.src</code>, <code>ip.dst</code>, <code>ip.ttl</code>, <code>icmp.type</code>, <code>icmp.code</code>, <code>tcp.port</code>, <code>tcp.flags.syn</code>, <code>tcp.flags.ack</code>, <code>udp.port</code>, <code>ospf.srcrouter</code> aur <code>ospf.hello.hello_interval</code>. Wireshark se do farak: reset flag field <code>tcp.flags.rst</code> hai (Wireshark ise <code>tcp.flags.reset</code> kehta hai), aur parentheses support nahi hote, isliye filters ko simple <code>&amp;&amp;</code> aur <code>||</code> chains tak rakho. Green box ka matlab sirf itna hai ki syntax parse hua; agar unknown field name se "Displayed" 0 ho jaaye, to "What this field does" mein dikhaya key check karo.</p>

<div class="eg"><p><b>Worked example.</b> Lab 2 mein <code>PC1 eth0 ↔ SW1 Gi0/1</code> par capture mein 37 frames hain: ARP, pings, SSH attempts. <code>tcp</code> type karo: Displayed 4/37. Rows hain 10.9.9.10 se SYN, 10.9.9.1 se RST, ACK, aur retry ke liye wahi jodi dobara. <code>tcp.flags.rst == 1</code> type karo: Displayed 2/37, dono 10.9.9.1 se. Do keystrokes ne 37 packets ko jawab mein badal diya.</p></div>

<div class="exam"><p><b>Exam trap.</b> Capture filter = recording se pehle, jo match nahi karta woh kho jaata hai. Display filter = recording ke baad, kuch nahi khota. Agar sawaal pooche ki existing capture ko ek host ke liye kaise review karein, to jawab display filter hai.</p></div>

<div class="scn"><h4>Woh filter jisne jawab chhupa diya</h4><p>Failed HTTPS connections investigate kar raha ek junior engineer server par capture filter <code>tcp port 443</code> ke saath capture kar raha tha. Capture mein SYNs aate dikhe aur kuch bahar jaata nahi dikha. Do ghante baad ek senior engineer ne bina filter ke dobara capture kiya aur turant dekha ki server jawab mein ICMP type 3 code 4 (fragmentation needed) messages bhej raha tha. Un ICMP messages ko capture filter ne phenk diya tha. Asli wajah ek naye VPN path par MTU mismatch tha.</p><p><b>Seekh:</b> broad capture karo aur display filters se narrow karo. Capture filters sirf tab use karo jab volume majboor kare, aur troubleshooting ke dauraan ICMP ko kabhi filter out mat karo.</p></div>

<div class="iv"><p class="q">"Capture filter aur display filter mein kya farak hai?"</p><p>Strong answer: capture filter BPF syntax use karta hai, jaise <code>host 10.1.1.1 and port 22</code>, aur tay karta hai ki kya record hoga; baaki sab kho jaata hai. Display filter protocol field names use karta hai, jaise <code>ip.addr == 10.1.1.1 &amp;&amp; tcp.port == 22</code>, aur sirf packets ko view se chhupata hai. Main broad capture karta hoon aur display filters se narrow karta hoon, jab tak link bahut busy na ho. Bonus: <code>ip.addr</code> ke saath <code>!=</code> wala trap mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Capture filters (BPF) tay karte hain kya record hoga; non-matching packets kho jaate hain.</li>
<li>Display filters (field names) tay karte hain kya dikhega; kuch nahi khota.</li>
<li>Teen panes: packet list, packet details tree, packet bytes. Ek par click karo to baaki highlight hote hain.</li>
<li>Lab viewer Header anatomy aur field explanations jodta hai, aur resets ke liye <code>tcp.flags.rst</code> use karta hai.</li>
<li>"Displayed: x/y" counter dekhte raho taaki koi filter aapko "traffic nahi hai" ka dhokha na de.</li>
</ul></div>
`}};export{e as default};