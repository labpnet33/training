var e=e=>`<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="TFTP exchange">
<text x="95" y="20" text-anchor="middle" class="svg-ink" font-size="14">Client (router)</text><text x="545" y="20" text-anchor="middle" class="svg-ink" font-size="14">Server</text>
<line x1="95" y1="30" x2="95" y2="240" stroke="#64748b" stroke-width="2"/><line x1="545" y1="30" x2="545" y2="240" stroke="#64748b" stroke-width="2"/>
<rect x="180" y="40" width="280" height="26" rx="6" fill="#fde68a"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="12">WRQ "R1.cfg" to port 69</text>
<line x1="95" y1="53" x2="180" y2="53" stroke="#64748b" stroke-width="2"/><line x1="460" y1="53" x2="545" y2="53" stroke="#64748b" stroke-width="2"/>
<rect x="180" y="82" width="280" height="26" rx="6" fill="#bbf7d0"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="12">ACK block 0 (from a new port)</text>
<line x1="95" y1="95" x2="180" y2="95" stroke="#64748b" stroke-width="2"/><line x1="460" y1="95" x2="545" y2="95" stroke="#64748b" stroke-width="2"/>
<rect x="180" y="124" width="280" height="26" rx="6" fill="#bae6fd"/><text x="320" y="142" text-anchor="middle" class="svg-ink" font-size="12">DATA block 1 (up to 512 bytes)</text>
<line x1="95" y1="137" x2="180" y2="137" stroke="#64748b" stroke-width="2"/><line x1="460" y1="137" x2="545" y2="137" stroke="#64748b" stroke-width="2"/>
<rect x="180" y="166" width="280" height="26" rx="6" fill="#bbf7d0"/><text x="320" y="184" text-anchor="middle" class="svg-ink" font-size="12">ACK block 1</text>
<line x1="95" y1="179" x2="180" y2="179" stroke="#64748b" stroke-width="2"/><line x1="460" y1="179" x2="545" y2="179" stroke="#64748b" stroke-width="2"/>
<text x="320" y="218" text-anchor="middle" class="svg-muted" font-size="12">... repeat; a block shorter than 512 bytes ends the transfer</text>
</svg><p class="cap">`+e+`</p></div>`,t=`<pre class="code">netadmin@tftp01:~$ ss -uln</pre>
<pre class="out">Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:Port
udp   UNCONN 0      0        127.0.0.53%lo:53        0.0.0.0:*
udp   UNCONN 0      0              0.0.0.0:<span class="hl">69</span>        0.0.0.0:*</pre>`,n=`<pre class="code">netadmin@admin01:~$ nc -zvu 10.99.0.40 69</pre>
<pre class="out">Connection to 10.99.0.40 69 port [udp/tftp] succeeded!</pre>`,r=`<pre class="code"><span class="c"># Reference commands (not run in the simulator): a Linux TFTP client</span>
sudo apt install tftp-hpa
tftp 10.99.0.40
tftp&gt; get PUN-CORE-R1.cfg
tftp&gt; put local-file.cfg
tftp&gt; quit</pre>`,i={id:`tftp-protocol`,h:{en:`How TFTP works: UDP 69, requests and blocks`,hi:`TFTP kaise kaam karta hai: UDP 69, requests aur blocks`},body:{en:`
<p>The word <b>Trivial</b> in TFTP is honest. The protocol (RFC 1350) was designed so small that it fits in the boot ROM of a device that has no operating system yet, no disk and no TCP stack. That is why a switch can fetch its first software over TFTP, and why it is still everywhere. In this chapter we open the box and look at every step.</p>

<h3>One transfer, step by step</h3>
<p>A client (the router) wants to upload <code>R1.cfg</code>. TFTP has only five message types. Remember them by what they do:</p>
<dl class="terms">
<dt>RRQ (read request)</dt><dd>"Please send me this file." A download, used to restore a config or load an image.</dd>
<dt>WRQ (write request)</dt><dd>"I want to send you this file." An upload, used for backups.</dd>
<dt>DATA</dt><dd>A numbered block of the file, up to 512 bytes.</dd>
<dt>ACK</dt><dd>"I received block N." The sender does not send block N+1 until it hears this.</dd>
<dt>ERROR</dt><dd>"I cannot do this", with a code and a short text. The transfer stops.</dd>
</dl>
`+e(`A write request, then block by block with an acknowledgment after each block.`)+`
<ol>
<li>The client sends a WRQ naming the file to <b>UDP port 69</b> of the server.</li>
<li>The server picks a <b>new random port</b> and answers from it with ACK of block 0. From now on both sides talk to these two ports, and port 69 is free for the next client.</li>
<li>The client sends DATA block 1. The server answers ACK 1. Then block 2, ACK 2, and so on.</li>
<li>A block shorter than 512 bytes is the last one. The transfer is complete.</li>
</ol>
<p>This one-block-at-a-time pattern is called <b>lock-step</b>. It is simple and tolerant of loss (a timer resends a block that is not acknowledged), but slow on long links: every block waits for one round trip. Extensions (RFC 2347 to 2349) add option negotiation, so that a larger block size can be agreed; tftpd-hpa supports it and many routers use it. Classic TFTP also has a limit: block numbers are 16 bits, so with 512-byte blocks the maximum file is about 32 MB. Large images need the block-size option.</p>

<h3>What TFTP does not have</h3>
<table class="cmp"><tr><th>Feature</th><th>TFTP</th><th>SCP / SFTP</th></tr>
<tr><td>Username and password</td><td>None</td><td>Yes (SSH keys or passwords)</td></tr>
<tr><td>Encryption</td><td>None, everything is clear text</td><td>Yes</td></tr>
<tr><td>Directory listing</td><td>None: you must know the file name</td><td>Yes (SFTP)</td></tr>
<tr><td>Transport</td><td>UDP 69 (+ random data ports)</td><td>TCP 22</td></tr>
<tr><td>Integrity check</td><td>Weak (UDP checksum only)</td><td>Strong (SSH)</td></tr></table>
<p>The consequences are practical. Anyone who can reach UDP 69 on the server can ask for any file the daemon is allowed to read and, if writing is enabled, can upload or overwrite files. Anyone who can capture traffic between the router and the server can read the configuration, including passwords stored in clear or weakly hashed form. This is why TFTP belongs only on an isolated management network, behind a firewall that allows only your devices.</p>

<h3>Seeing the service on the server</h3>
<p>When a TFTP server is running, it listens on UDP port 69. You can check with <code>ss -uln</code> (UDP, listening, numeric):</p>
`+t+`
<p>Port 53 is the local name-resolution cache. Port 69 on all addresses (0.0.0.0) is the TFTP daemon. If your router reports a timeout, this is the first thing to look at: is anything listening at all?</p>
<p>From another Linux machine on the network, a quick reachability test is possible with <code>nc</code>. The flags: <code>-z</code> scan without sending data, <code>-v</code> verbose, <code>-u</code> UDP.</p>
`+n+`
<p>Careful with UDP tests. UDP has no handshake. "Succeeded" here only means that no error came back, not that a real TFTP daemon answered. For a TCP service, success means a real connection. For UDP, treat it as a hint, and confirm with <code>ss -uln</code> on the server and a real transfer.</p>
`+r+`

<div class="eg"><p><b>Worked example.</b> Count blocks. A router configuration of 624 bytes needs two blocks: block 1 of 512 bytes and block 2 of 112 bytes. The short second block tells the server the file has ended. A file of exactly 1024 bytes needs three blocks, because the sender must finish with a block of 0 bytes (shorter than 512) to signal the end. A 20 MB image at 512 bytes per block needs about 40,000 blocks, each acknowledged: slow, and one reason to negotiate a larger block size.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Assuming a stateful firewall in the middle will pass TFTP like normal UDP. The server answers from a different port than 69, so a firewall without a TFTP helper may drop the reply. Allow UDP 69 on the server, and on devices in between use the vendor's TFTP inspection or a rule that allows the return traffic.</p></div>
<div class="exam"><p><b>Exam trap.</b> Initial requests go to <b>UDP 69</b>, but the data transfer then uses ephemeral ports chosen by the server. "Which port does TFTP use?" is 69, and "does it authenticate?" is no.</p></div>

<div class="scn"><h4>The upgrade that took an hour</h4><p>A 30 MB software image was copied to a remote-site switch over a slow, high-latency WAN link using default TFTP. Each 512-byte block waited for an acknowledgment across a 120 ms round trip, so the copy took more than 90 minutes. The team moved the transfer to SCP, which streams data over TCP, and the same file finished in minutes.</p><p><b>Lesson:</b> lock-step transfer is fine on a local management LAN and poor over distance.</p></div>

<div class="iv"><p class="q">"How does TFTP differ from FTP, and why is it insecure?"</p><p>TFTP is a minimal UDP protocol on port 69 with five message types and 512-byte lock-step blocks. It has no login, no directory listing and no encryption. FTP uses TCP with a control connection and a data connection, supports login (in clear text) and listings. TFTP is insecure because anyone who reaches the port can read or overwrite files and traffic is readable on the wire, so it must live on an isolated management network.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>TFTP: UDP 69, five messages (RRQ, WRQ, DATA, ACK, ERROR), 512-byte blocks acknowledged one by one.</li>
<li>RRQ downloads to the device (restore, images); WRQ uploads from the device (backup).</li>
<li>The server answers from a random port, which matters for firewalls in the middle.</li>
<li>No authentication, no encryption, no directory listing.</li>
<li>Use <code>ss -uln</code> on the server to see the listener; UDP reachability tests are only hints.</li>
</ul></div>
`,hi:`
<p>TFTP mein <b>Trivial</b> shabd imaandaar hai. Protocol (RFC 1350) itna chhota design kiya gaya ki woh us device ke boot ROM mein fit ho jaaye jiske paas abhi operating system, disk aur TCP stack nahi hai. Isiliye switch apna pehla software TFTP se la sakta hai, aur isiliye yeh abhi bhi har jagah hai. Is chapter mein hum dabba kholkar har step dekhte hain.</p>

<h3>Ek transfer, step by step</h3>
<p>Ek client (router) <code>R1.cfg</code> upload karna chahta hai. TFTP mein sirf paanch message types hain. Unhe unke kaam se yaad rakho:</p>
<dl class="terms">
<dt>RRQ (read request)</dt><dd>"Kripya yeh file bhejo." Download, config restore ya image load karne ke liye.</dd>
<dt>WRQ (write request)</dt><dd>"Main yeh file tumhe bhejna chahta hoon." Upload, backups ke liye.</dd>
<dt>DATA</dt><dd>File ka numbered block, 512 bytes tak.</dd>
<dt>ACK</dt><dd>"Mujhe block N mil gaya." Sender jab tak yeh na sune block N+1 nahi bhejta.</dd>
<dt>ERROR</dt><dd>"Main yeh nahi kar sakta", code aur chhote text ke saath. Transfer ruk jaata hai.</dd>
</dl>
`+e(`Write request, phir block by block, har block ke baad acknowledgment.`)+`
<ol>
<li>Client file ka naam batane wala WRQ server ke <b>UDP port 69</b> par bhejta hai.</li>
<li>Server ek <b>naya random port</b> chunta hai aur usse block 0 ke ACK ke saath jawab deta hai. Ab dono taraf in do ports par baat karti hain, aur port 69 agle client ke liye khali hai.</li>
<li>Client DATA block 1 bhejta hai. Server ACK 1 deta hai. Phir block 2, ACK 2, aur aage.</li>
<li>512 bytes se chhota block aakhri hai. Transfer poora hua.</li>
</ol>
<p>Ek-ek block ka yeh pattern <b>lock-step</b> kehlata hai. Yeh simple hai aur loss ke prati sahansheel (timer unacknowledged block dobara bhejta hai), par lambi links par dheema: har block ek round trip ka intezaar karta hai. Extensions (RFC 2347 se 2349) option negotiation jodte hain, jisse bada block size tay ho sake; tftpd-hpa ise support karta hai aur bahut se routers use karte hain. Classic TFTP ki ek limit bhi hai: block numbers 16 bit ke hain, isliye 512-byte blocks ke saath max file lagbhag 32 MB hai. Badi images ko block-size option chahiye.</p>

<h3>TFTP mein kya nahi hai</h3>
<table class="cmp"><tr><th>Feature</th><th>TFTP</th><th>SCP / SFTP</th></tr>
<tr><td>Username aur password</td><td>Nahi</td><td>Haan (SSH keys ya passwords)</td></tr>
<tr><td>Encryption</td><td>Nahi, sab clear text</td><td>Haan</td></tr>
<tr><td>Directory listing</td><td>Nahi: file ka naam pata hona chahiye</td><td>Haan (SFTP)</td></tr>
<tr><td>Transport</td><td>UDP 69 (+ random data ports)</td><td>TCP 22</td></tr>
<tr><td>Integrity check</td><td>Kamzor (sirf UDP checksum)</td><td>Mazboot (SSH)</td></tr></table>
<p>Nateeje practical hain. Server ke UDP 69 tak pahunchne wala koi bhi woh file maang sakta hai jo daemon padh sakta hai aur, agar writing on hai, to files upload ya overwrite kar sakta hai. Router aur server ke beech traffic capture karne wala configuration padh sakta hai, passwords samet jo clear ya kamzor hash mein stored hain. Isiliye TFTP sirf isolated management network par aur aise firewall ke peeche rehna chahiye jo sirf aapke devices allow kare.</p>

<h3>Server par service dekhna</h3>
<p>TFTP server chal raha ho to woh UDP port 69 par sunta hai. Aap <code>ss -uln</code> (UDP, listening, numeric) se check kar sakte ho:</p>
`+t+`
<p>Port 53 local name-resolution cache hai. Sabhi addresses (0.0.0.0) par port 69 TFTP daemon hai. Agar router timeout report kare, to sabse pehle yeh dekho: kya kuch sun bhi raha hai?</p>
<p>Network ki kisi doosri Linux machine se <code>nc</code> se quick reachability test ho sakta hai. Flags: <code>-z</code> bina data bheje scan, <code>-v</code> verbose, <code>-u</code> UDP.</p>
`+n+`
<p>UDP tests mein savdhan raho. UDP mein handshake nahi hota. Yahan "succeeded" ka matlab sirf yeh hai ki koi error wapas nahi aaya, yeh nahi ki asli TFTP daemon ne jawab diya. TCP service mein success ka matlab asli connection hota hai. UDP ke liye ise hint maano, aur server par <code>ss -uln</code> aur asli transfer se confirm karo.</p>
`+r+`

<div class="eg"><p><b>Worked example.</b> Blocks gino. 624 bytes ki router configuration ko do blocks chahiye: block 1 512 bytes ka aur block 2 112 bytes ka. Chhota doosra block server ko batata hai ki file khatam hui. Bilkul 1024 bytes ki file ko teen blocks chahiye, kyunki sender ko end batane ke liye 0 bytes ka (512 se chhota) block bhejna padta hai. 512 bytes per block par 20 MB ki image ko lagbhag 40,000 blocks chahiye, har ek acknowledged: dheema, aur bada block size negotiate karne ki ek wajah.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Yeh maan lena ki beech ka stateful firewall TFTP ko normal UDP ki tarah pass kar dega. Server 69 se alag port se jawab deta hai, isliye TFTP helper ke bina firewall reply drop kar sakta hai. Server par UDP 69 allow karo, aur beech ke devices par vendor ka TFTP inspection ya aisa rule use karo jo return traffic allow kare.</p></div>
<div class="exam"><p><b>Exam trap.</b> Shuruaati requests <b>UDP 69</b> par jaati hain, par data transfer phir server ke chune hue ephemeral ports use karta hai. "TFTP kaunsa port use karta hai?" ka jawab 69 hai, aur "kya authenticate karta hai?" ka jawab nahi.</p></div>

<div class="scn"><h4>Woh upgrade jisme ek ghanta laga</h4><p>30 MB ki software image ek remote-site switch par dheemi, high-latency WAN link se default TFTP se copy ki gayi. Har 512-byte block 120 ms round trip ke paar acknowledgment ka intezaar karta raha, isliye copy mein 90 minute se zyada lage. Team ne transfer ko SCP par move kiya, jo TCP par data stream karta hai, aur wahi file minutes mein khatam hui.</p><p><b>Lesson:</b> lock-step transfer local management LAN par theek hai aur doori par kharab.</p></div>

<div class="iv"><p class="q">"TFTP FTP se kaise alag hai, aur yeh insecure kyun hai?"</p><p>TFTP port 69 par minimal UDP protocol hai jisme paanch message types aur 512-byte lock-step blocks hain. Na login, na directory listing, na encryption. FTP control aur data connection ke saath TCP use karta hai, login (clear text mein) aur listings support karta hai. TFTP insecure hai kyunki port tak pahunchne wala koi bhi files padh ya overwrite kar sakta hai aur traffic wire par padha ja sakta hai, isliye use isolated management network par rehna chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>TFTP: UDP 69, paanch messages (RRQ, WRQ, DATA, ACK, ERROR), 512-byte blocks jo ek-ek karke acknowledge hote hain.</li>
<li>RRQ device ko download karta hai (restore, images); WRQ device se upload karta hai (backup).</li>
<li>Server random port se jawab deta hai, jo beech ke firewalls ke liye matter karta hai.</li>
<li>Na authentication, na encryption, na directory listing.</li>
<li>Server par listener dekhne ke liye <code>ss -uln</code> use karo; UDP reachability tests sirf hints hain.</li>
</ul></div>
`}};export{i as default};