var e={id:`tcp-handshake`,h:{en:`TCP on the wire: handshake, flags, seq/ack, window, retransmissions`,hi:`Wire par TCP: handshake, flags, seq/ack, window, retransmissions`},body:{en:`
<p>Think of a careful phone call on a bad line. "Hello, can you hear me?" "Yes, I hear you. Can you hear me?" "Yes." Only then does the real conversation start, and every few sentences the listener says "got it, up to where you said the price". If a sentence is lost, the speaker repeats it. That is <b>TCP</b>: a handshake to agree that both sides are ready, numbered bytes, acknowledgements, and repetition when something goes missing.</p>

<h3>The TCP header fields you will read</h3>
<dl class="terms">
<dt>Source port / Destination port</dt><dd>Identify the applications. The server uses a well-known port (22 SSH, 23 Telnet, 80 HTTP, 443 HTTPS); the client picks a random <b>ephemeral</b> port, typically 49152 to 65535.</dd>
<dt>Sequence number</dt><dd>The number of the first data byte in this segment. Wireshark and the lab viewer show <b>relative</b> numbers starting at 0, although the real initial sequence number is random.</dd>
<dt>Acknowledgment number</dt><dd>The next byte the sender expects to receive. "Ack=80" means "I have everything up to byte 79".</dd>
<dt>Flags</dt><dd><b>SYN</b> opens a connection, <b>ACK</b> says the acknowledgment number is valid, <b>FIN</b> closes gracefully, <b>RST</b> aborts immediately, <b>PSH</b> asks the receiver to pass data to the application now.</dd>
<dt>Window</dt><dd>How many more bytes the sender of this segment is ready to receive. It is flow control: the receiver protecting its buffer.</dd>
<dt>Options</dt><dd>Seen in SYN segments: <b>MSS</b> (maximum segment size, 1460 on standard Ethernet), SACK permitted, window scale.</dd>
</dl>

<h3>The three-way handshake</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="TCP handshake and data">
<rect x="30" y="10" width="140" height="34" rx="8" fill="#bbf7d0"/><text x="100" y="32" text-anchor="middle" class="svg-ink" font-size="13">Client :50122</text>
<rect x="470" y="10" width="140" height="34" rx="8" fill="#ddd6fe"/><text x="540" y="32" text-anchor="middle" class="svg-ink" font-size="13">Server :80</text>
<line x1="100" y1="44" x2="100" y2="240" stroke="#64748b" stroke-width="1.5"/><line x1="540" y1="44" x2="540" y2="240" stroke="#64748b" stroke-width="1.5"/>
<line x1="100" y1="70" x2="540" y2="80" stroke="#64748b" stroke-width="2"/><text x="320" y="66" text-anchor="middle" class="svg-ink" font-size="12">[SYN] Seq=0  MSS=1460</text>
<line x1="540" y1="100" x2="100" y2="110" stroke="#64748b" stroke-width="2"/><text x="320" y="97" text-anchor="middle" class="svg-ink" font-size="12">[SYN, ACK] Seq=0 Ack=1</text>
<line x1="100" y1="130" x2="540" y2="140" stroke="#64748b" stroke-width="2"/><text x="320" y="127" text-anchor="middle" class="svg-ink" font-size="12">[ACK] Seq=1 Ack=1</text>
<line x1="100" y1="170" x2="540" y2="180" stroke="#64748b" stroke-width="2"/><text x="320" y="167" text-anchor="middle" class="svg-accent" font-size="12">[PSH, ACK] Seq=1 Ack=1 Len=79 (GET request)</text>
<line x1="540" y1="205" x2="100" y2="215" stroke="#64748b" stroke-width="2"/><text x="320" y="202" text-anchor="middle" class="svg-accent" font-size="12">[ACK] Seq=1 Ack=80</text>
</svg><p class="cap">SYN and FIN each consume one sequence number; that is why the first data byte is Seq=1.</p></div>
<p>The client sends <b>SYN</b>. The server, if a process listens on that port, answers <b>SYN, ACK</b>. The client finishes with <b>ACK</b>. In the list the Info column reads, for example, <code>50122 → 80 [SYN] Seq=0 Win=64240 Len=0 MSS=1460 SACK_PERM</code>. The time between the SYN and the SYN, ACK is a clean measurement of the network round-trip time, because no application work is involved yet.</p>

<h3>Following sequence and acknowledgment numbers</h3>
<div class="eg"><p><b>Worked example.</b> After the handshake the client sends a 79-byte request: <code>Seq=1 Len=79</code>. The server acknowledges <code>Ack=80</code> (1 + 79). The server then sends two full segments of 1460 bytes: <code>Seq=1 Len=1460</code> and <code>Seq=1461 Len=1460</code>. The client answers <code>Ack=2921</code> (1 + 1460 + 1460). If you ever see the client acknowledge 1461 again and again while the server keeps sending higher numbers, the segment starting at 1461 was lost somewhere.</p></div>

<h3>Closing: FIN versus RST</h3>
<p>A graceful close uses <b>FIN</b> from each side, each acknowledged: FIN, ACK / ACK / FIN, ACK / ACK, often compressed to three segments. Both sides agree the conversation is over and no data is lost. A <b>RST</b> is an abrupt "this connection does not exist" or "I refuse". The next chapter is dedicated to what a reset means for troubleshooting.</p>

<h3>Window: the receiver saying "slow down"</h3>
<p>The Window field advertises free buffer space. A sender may have at most that many unacknowledged bytes in flight. If a receiver advertises <b>Window 0</b> (a "zero window"), its application is not reading data fast enough, and the sender must pause and probe. This is a classic case where the capture proves "it is not the network": the path is fine, the receiving server is overloaded.</p>

<h3>Retransmissions and duplicate ACKs</h3>
<p>If a segment is not acknowledged in time, TCP sends it again with the <b>same sequence number</b>. The retransmission timer doubles each time. For a SYN that never gets an answer, a Linux client typically retries after 1, 2, 4 and 8 seconds, so in the Time column you see SYNs at about 0, 1, 3 and 7 seconds: the fingerprint of silence. When data segments go missing mid-stream, the receiver keeps sending the same Ack number (<b>duplicate ACKs</b>); after three duplicates the sender retransmits immediately (<b>fast retransmit</b>).</p>
<p>Wireshark has an expert system that labels these for you: <code>tcp.analysis.retransmission</code>, <code>tcp.analysis.duplicate_ack</code>, <code>tcp.analysis.zero_window</code>. The lab viewer does not add those labels, so train your eye: the same Seq sent twice is a retransmission, the same Ack repeated is a duplicate ACK.</p>

<div class="note"><p><b>Where you capture changes the meaning.</b> Captured at the sender, a retransmission proves the original or its ACK was lost somewhere downstream. Captured at the receiver, seeing only the retransmission (never the original) proves the original died on the path. Capture both ends to locate the loss.</p></div>

<div class="warn"><p><b>Common mistake.</b> Blaming the network for every retransmission. A few retransmissions in a long transfer are normal. A steady stream of them on one path is worth investigating (duplex mismatch, errors, congestion). A zero window is the receiver's problem, not the network's.</p></div>

<div class="exam"><p><b>Exam trap.</b> TCP is connection-oriented (handshake, sequencing, acknowledgements, retransmission, windowing); UDP has none of these. The handshake order is SYN, SYN-ACK, ACK. Windowing is flow control, controlled by the receiver.</p></div>

<div class="scn"><h4>The slow file share</h4><p>Users in a branch complained that copying files from head office was painfully slow, while web browsing was fine. A capture at the branch file client showed duplicate ACKs and fast retransmissions in bursts, and the switch port toward the WAN router showed a growing number of late collisions. One side was hard-set to 100 Mbps full duplex, the other auto-negotiating and falling back to half duplex. Small web requests hardly suffered; large bulk transfers lost segments constantly. Fixing duplex removed the retransmissions and the copy speed jumped tenfold.</p><p><b>Lesson:</b> retransmissions tell you loss is happening; interface counters and duplex tell you why. Combine the capture with show commands.</p></div>

<div class="iv"><p class="q">"Explain sequence and acknowledgment numbers with an example."</p><p>Strong answer: each byte in a TCP stream is numbered. The sequence number is the number of the first byte in a segment; the acknowledgment number is the next byte expected. After a handshake, if the client sends 100 bytes with Seq=1, the server replies Ack=101. SYN and FIN consume one number each. Repeated identical Acks mean a gap, and a segment resent with the same Seq is a retransmission. Mention that Wireshark shows relative numbers.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Handshake: SYN, SYN-ACK, ACK; SYN to SYN-ACK time is the network round trip.</li>
<li>Seq = first byte of this segment; Ack = next byte expected; relative numbers start at 0.</li>
<li>FIN closes gracefully; RST aborts or refuses.</li>
<li>Window is receiver flow control; Window 0 means a slow receiver, not a bad network.</li>
<li>Same Seq twice = retransmission; same Ack repeated = duplicate ACK; SYNs at 0, 1, 3, 7 s = no answer at all.</li>
</ul></div>
`,hi:`
<p>Kharab line par ek dhyaan se ki gayi phone call socho. "Hello, meri awaaz aa rahi hai?" "Haan, sun raha hoon. Meri aa rahi hai?" "Haan." Tabhi asli baat shuru hoti hai, aur har kuch vaakyon mein sunne wala kehta hai "mil gaya, jahan tak tumne price bataya". Agar koi vaakya kho jaaye, bolne wala use dohrata hai. Yahi <b>TCP</b> hai: dono sides ready hain yeh tay karne ke liye handshake, numbered bytes, acknowledgements, aur kuch kho jaane par dohrana.</p>

<h3>TCP header ke fields jo aap padhoge</h3>
<dl class="terms">
<dt>Source port / Destination port</dt><dd>Applications ki pehchaan. Server well-known port use karta hai (22 SSH, 23 Telnet, 80 HTTP, 443 HTTPS); client random <b>ephemeral</b> port chunta hai, aam taur par 49152 se 65535.</dd>
<dt>Sequence number</dt><dd>Is segment ke pehle data byte ka number. Wireshark aur lab viewer 0 se shuru hone wale <b>relative</b> numbers dikhate hain, jabki asli initial sequence number random hota hai.</dd>
<dt>Acknowledgment number</dt><dd>Agla byte jo sender receive karne ki umeed karta hai. "Ack=80" ka matlab "mere paas byte 79 tak sab hai".</dd>
<dt>Flags</dt><dd><b>SYN</b> connection kholta hai, <b>ACK</b> batata hai ki acknowledgment number valid hai, <b>FIN</b> araam se band karta hai, <b>RST</b> turant abort karta hai, <b>PSH</b> receiver ko kehta hai ki data abhi application ko de do.</dd>
<dt>Window</dt><dd>Is segment ka sender aur kitne bytes receive karne ko ready hai. Yeh flow control hai: receiver apne buffer ko bacha raha hai.</dd>
<dt>Options</dt><dd>SYN segments mein dikhte hain: <b>MSS</b> (maximum segment size, standard Ethernet par 1460), SACK permitted, window scale.</dd>
</dl>

<h3>Three-way handshake</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="TCP handshake aur data">
<rect x="30" y="10" width="140" height="34" rx="8" fill="#bbf7d0"/><text x="100" y="32" text-anchor="middle" class="svg-ink" font-size="13">Client :50122</text>
<rect x="470" y="10" width="140" height="34" rx="8" fill="#ddd6fe"/><text x="540" y="32" text-anchor="middle" class="svg-ink" font-size="13">Server :80</text>
<line x1="100" y1="44" x2="100" y2="240" stroke="#64748b" stroke-width="1.5"/><line x1="540" y1="44" x2="540" y2="240" stroke="#64748b" stroke-width="1.5"/>
<line x1="100" y1="70" x2="540" y2="80" stroke="#64748b" stroke-width="2"/><text x="320" y="66" text-anchor="middle" class="svg-ink" font-size="12">[SYN] Seq=0  MSS=1460</text>
<line x1="540" y1="100" x2="100" y2="110" stroke="#64748b" stroke-width="2"/><text x="320" y="97" text-anchor="middle" class="svg-ink" font-size="12">[SYN, ACK] Seq=0 Ack=1</text>
<line x1="100" y1="130" x2="540" y2="140" stroke="#64748b" stroke-width="2"/><text x="320" y="127" text-anchor="middle" class="svg-ink" font-size="12">[ACK] Seq=1 Ack=1</text>
<line x1="100" y1="170" x2="540" y2="180" stroke="#64748b" stroke-width="2"/><text x="320" y="167" text-anchor="middle" class="svg-accent" font-size="12">[PSH, ACK] Seq=1 Ack=1 Len=79 (GET request)</text>
<line x1="540" y1="205" x2="100" y2="215" stroke="#64748b" stroke-width="2"/><text x="320" y="202" text-anchor="middle" class="svg-accent" font-size="12">[ACK] Seq=1 Ack=80</text>
</svg><p class="cap">SYN aur FIN dono ek-ek sequence number khaate hain; isiliye pehla data byte Seq=1 hota hai.</p></div>
<p>Client <b>SYN</b> bhejta hai. Server, agar us port par koi process listen kar raha hai, <b>SYN, ACK</b> se jawab deta hai. Client <b>ACK</b> se khatam karta hai. List mein Info column aisa dikhta hai, jaise <code>50122 → 80 [SYN] Seq=0 Win=64240 Len=0 MSS=1460 SACK_PERM</code>. SYN aur SYN, ACK ke beech ka time network round-trip time ka saaf naap hai, kyunki abhi tak koi application kaam shamil nahi hai.</p>

<h3>Sequence aur acknowledgment numbers follow karna</h3>
<div class="eg"><p><b>Worked example.</b> Handshake ke baad client 79-byte request bhejta hai: <code>Seq=1 Len=79</code>. Server acknowledge karta hai <code>Ack=80</code> (1 + 79). Phir server 1460 bytes ke do poore segments bhejta hai: <code>Seq=1 Len=1460</code> aur <code>Seq=1461 Len=1460</code>. Client jawab deta hai <code>Ack=2921</code> (1 + 1460 + 1460). Agar kabhi dikhe ki client baar baar 1461 acknowledge kar raha hai jabki server upar ke numbers bhejta ja raha hai, to 1461 se shuru hone wala segment kahin kho gaya.</p></div>

<h3>Band karna: FIN versus RST</h3>
<p>Graceful close mein dono sides se <b>FIN</b> jaata hai, har ek acknowledge hota hai: FIN, ACK / ACK / FIN, ACK / ACK, aksar teen segments mein compress. Dono sides maanti hain ki baat khatam, aur koi data nahi khota. <b>RST</b> achanak kehta hai "yeh connection exist nahi karta" ya "main mana karta hoon". Agla chapter poora is baat par hai ki troubleshooting mein reset ka kya matlab hai.</p>

<h3>Window: receiver keh raha hai "dheere"</h3>
<p>Window field khaali buffer space advertise karta hai. Sender ke paas zyada se zyada utne unacknowledged bytes raaste mein ho sakte hain. Agar receiver <b>Window 0</b> ("zero window") advertise kare, to uski application data jaldi nahi padh rahi, aur sender ko rukna aur probe karna padta hai. Yeh classic case hai jahan capture prove karta hai "network nahi hai": path theek hai, receiving server overloaded hai.</p>

<h3>Retransmissions aur duplicate ACKs</h3>
<p>Agar segment time par acknowledge nahi hota, TCP use <b>same sequence number</b> ke saath dobara bhejta hai. Retransmission timer har baar double hota hai. Jis SYN ka kabhi jawab nahi aata, uske liye Linux client aam taur par 1, 2, 4 aur 8 seconds baad retry karta hai, isliye Time column mein SYNs lagbhag 0, 1, 3 aur 7 seconds par dikhte hain: khamoshi ki fingerprint. Jab stream ke beech data segments kho jaate hain, receiver baar baar same Ack number bhejta hai (<b>duplicate ACKs</b>); teen duplicates ke baad sender turant retransmit karta hai (<b>fast retransmit</b>).</p>
<p>Wireshark ka expert system inhe aapke liye label karta hai: <code>tcp.analysis.retransmission</code>, <code>tcp.analysis.duplicate_ack</code>, <code>tcp.analysis.zero_window</code>. Lab viewer yeh labels nahi jodta, isliye apni aankh train karo: same Seq do baar bheja gaya to retransmission, same Ack repeat hua to duplicate ACK.</p>

<div class="note"><p><b>Aap kahan capture karte ho, isse matlab badalta hai.</b> Sender par capture kiya to retransmission prove karta hai ki original ya uska ACK aage kahin kho gaya. Receiver par capture kiya aur sirf retransmission dikha (original kabhi nahi), to prove hota hai ki original raaste mein mara. Loss locate karne ke liye dono ends par capture karo.</p></div>

<div class="warn"><p><b>Common galti.</b> Har retransmission ke liye network ko blame karna. Lambe transfer mein kuch retransmissions normal hain. Ek path par unki lagataar dhaara investigate karne layak hai (duplex mismatch, errors, congestion). Zero window receiver ki problem hai, network ki nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> TCP connection-oriented hai (handshake, sequencing, acknowledgements, retransmission, windowing); UDP mein inmein se kuch nahi. Handshake ka order SYN, SYN-ACK, ACK hai. Windowing flow control hai, jo receiver control karta hai.</p></div>

<div class="scn"><h4>Slow file share</h4><p>Ek branch ke users complain kar rahe the ki head office se files copy karna bahut slow hai, jabki web browsing theek thi. Branch ke file client par capture mein bursts mein duplicate ACKs aur fast retransmissions dikhe, aur WAN router ki taraf wale switch port par late collisions badh rahe the. Ek side hard-set 100 Mbps full duplex thi, dusri auto-negotiate karke half duplex par gir rahi thi. Chhoti web requests par zyada asar nahi tha; bade bulk transfers lagataar segments kho rahe the. Duplex theek karne se retransmissions khatam hue aur copy speed das guna badh gayi.</p><p><b>Seekh:</b> retransmissions batate hain ki loss ho raha hai; interface counters aur duplex batate hain kyun. Capture ko show commands ke saath jodo.</p></div>

<div class="iv"><p class="q">"Sequence aur acknowledgment numbers example ke saath samjhao."</p><p>Strong answer: TCP stream ka har byte numbered hota hai. Sequence number segment ke pehle byte ka number hai; acknowledgment number agla expected byte hai. Handshake ke baad agar client Seq=1 ke saath 100 bytes bhejta hai, server Ack=101 se jawab deta hai. SYN aur FIN ek-ek number khaate hain. Baar baar same Ack ka matlab gap hai, aur same Seq ke saath dobara bheja segment retransmission hai. Batao ki Wireshark relative numbers dikhata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Handshake: SYN, SYN-ACK, ACK; SYN se SYN-ACK ka time network round trip hai.</li>
<li>Seq = is segment ka pehla byte; Ack = agla expected byte; relative numbers 0 se shuru.</li>
<li>FIN araam se band karta hai; RST abort ya refuse karta hai.</li>
<li>Window receiver ka flow control hai; Window 0 matlab slow receiver, kharab network nahi.</li>
<li>Same Seq do baar = retransmission; same Ack repeat = duplicate ACK; 0, 1, 3, 7 s par SYNs = koi jawab hi nahi.</li>
</ul></div>
`}};export{e as default};