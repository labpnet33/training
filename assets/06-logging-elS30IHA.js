var e=e=>`<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Anatomy of a UFW BLOCK log line">
<rect x="10" y="40" width="75" height="44" rx="6" fill="#bae6fd"/><text x="47" y="66" text-anchor="middle" class="svg-ink" font-size="11">Sep 29 09:00</text>
<rect x="92" y="40" width="85" height="44" rx="6" fill="#e2e8f0"/><text x="134" y="66" text-anchor="middle" class="svg-ink" font-size="11">nms03 kernel</text>
<rect x="184" y="40" width="90" height="44" rx="6" fill="#fecaca"/><text x="229" y="66" text-anchor="middle" class="svg-ink" font-size="11">UFW BLOCK</text>
<rect x="281" y="40" width="75" height="44" rx="6" fill="#fed7aa"/><text x="318" y="66" text-anchor="middle" class="svg-ink" font-size="11">IN=eth0</text>
<rect x="363" y="40" width="100" height="44" rx="6" fill="#ddd6fe"/><text x="413" y="66" text-anchor="middle" class="svg-ink" font-size="11">SRC=10.20.0.10</text>
<rect x="470" y="40" width="85" height="44" rx="6" fill="#ddd6fe"/><text x="512" y="66" text-anchor="middle" class="svg-ink" font-size="11">PROTO=TCP</text>
<rect x="562" y="40" width="70" height="44" rx="6" fill="#bbf7d0"/><text x="597" y="66" text-anchor="middle" class="svg-ink" font-size="11">DPT=22</text>
<text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="11">when, where, verdict, which interface, who, how, which port</text>
</svg><p class="cap">`+e+`</p></div>`,t=`<pre class="code">netadmin@nms03:~$ sudo grep 'SRC=10.20.0.10' /var/log/ufw.log</pre>
<pre class="out">Sep 29 09:00:30 nms03 kernel: [UFW BLOCK] IN=eth0 SRC=10.20.0.10 DST=10.99.0.20 PROTO=TCP DPT=80
Sep 29 09:00:30 nms03 kernel: [UFW BLOCK] IN=eth0 SRC=10.20.0.10 DST=10.99.0.20 PROTO=TCP <span class="hl">DPT=22</span>
Sep 29 09:00:50 nms03 kernel: [UFW BLOCK] IN=eth0 SRC=10.20.0.10 DST=10.99.0.20 PROTO=TCP <span class="hl">DPT=22</span>
Sep 29 09:00:50 nms03 kernel: [UFW BLOCK] IN=eth0 SRC=10.20.0.10 DST=10.99.0.20 PROTO=TCP DPT=514
Sep 29 09:00:50 nms03 kernel: [UFW BLOCK] IN=eth0 SRC=10.20.0.10 DST=10.99.0.20 <span class="hl">PROTO=UDP</span> DPT=514
Sep 29 09:00:50 nms03 kernel: [UFW BLOCK] IN=eth0 SRC=10.20.0.10 DST=10.99.0.20 PROTO=TCP <span class="hl">DPT=22</span></pre>`,n=`<pre class="code">netadmin@nms03:~$ sudo tail -n 3 /var/log/ufw.log
netadmin@nms03:~$ sudo ls -l /var/log/ufw.log</pre>
<pre class="out">Sep 29 09:00:50 nms03 kernel: [UFW BLOCK] IN=eth0 SRC=10.20.0.10 DST=10.99.0.20 PROTO=TCP DPT=514
Sep 29 09:00:50 nms03 kernel: [UFW BLOCK] IN=eth0 SRC=10.20.0.10 DST=10.99.0.20 PROTO=UDP DPT=514
Sep 29 09:00:50 nms03 kernel: [UFW BLOCK] IN=eth0 SRC=10.20.0.10 DST=10.99.0.20 PROTO=TCP DPT=22
-rw-r-----  1 syslog   adm         778 Sep 29 09:00 /var/log/ufw.log</pre>`,r=`<pre class="code"><span class="c"># Reference commands (not run in the simulator)</span>
sudo ufw logging low        <span class="c"># default: log blocked packets</span>
sudo ufw logging medium     <span class="c"># also log allowed new connections, more volume</span>
sudo ufw logging off        <span class="c"># stop logging</span>
sudo tail -f /var/log/ufw.log   <span class="c"># follow new lines live; Ctrl+C to stop</span>
sudo journalctl -k | grep UFW   <span class="c"># kernel messages, on systems using journald</span></pre>`,i={id:`logging`,h:{en:`Firewall logging: reading the blocks`,hi:`Firewall logging: blocks padhna`},body:{en:`
<p>A firewall that drops silently is a mystery for the user and a gift for the engineer: every drop can be written to a log, and the log tells you who tried what. Logging turns "something is blocked" into "this source, to this port, at this time". In chapter 2 you saw <code>Logging: on (low)</code> in the verbose status. At the <b>low</b> level the kernel records packets that the firewall blocks. They are collected in the file <code>/var/log/ufw.log</code>. (It is readable only by privileged users, which is why we use <code>sudo</code>.)</p>
`+e(`Every field of a block line answers one question.`)+`
<h3>Anatomy of one line</h3>
<p>Take the line <code>Sep 29 09:00:30 nms03 kernel: [UFW BLOCK] IN=eth0 SRC=10.20.0.10 DST=10.99.0.20 PROTO=TCP DPT=22</code> and read it left to right:</p>
<dl class="terms">
<dt>Sep 29 09:00:30 nms03 kernel</dt><dd>When it happened, which host, and that the kernel produced the message.</dd>
<dt>[UFW BLOCK]</dt><dd>The verdict. The label you search for. Allowed packets, if you log them, say <code>[UFW ALLOW]</code>.</dd>
<dt>IN=eth0</dt><dd>The packet came in on interface eth0.</dd>
<dt>SRC=10.20.0.10</dt><dd>The source address, the client that was blocked.</dd>
<dt>DST=10.99.0.20</dt><dd>The destination address, this server.</dd>
<dt>PROTO=TCP</dt><dd>The protocol: TCP, UDP or ICMP.</dd>
<dt>DPT=22</dt><dd>The destination port: which service the client wanted. Here, SSH.</dd>
</dl>
<h3>Finding what you need</h3>
<p><code>grep</code> searches a file for text. Searching for the address of one client gives its whole story:</p>
`+t+`
<p>This is the story of USER01, the sales PC. At 09:00:30 it tried the web port 80 and SSH 22. Then at 09:00:50 it tried SSH again, then port 514 over TCP, then over UDP, and SSH once more. The lines carry the evidence you need: the source (always the same), the protocol (<code>PROTO=UDP</code> on the fifth line) and the destination ports (<code>DPT</code>). The repeated <code>DPT=22</code> pattern looks like someone retrying SSH, which could be a user who forgot he is not allowed, or an attacker. The log tells you what, not why. You decide using context.</p>
<p>To see only the newest lines, use <code>tail</code>, and to check the file itself use <code>ls -l</code>:</p>
`+n+`
<p>The file is owned by <code>syslog</code>, group <code>adm</code>, mode <code>rw-r-----</code>: the owner may write, the group may read and others have nothing. That is correct for a security log. The size, 778 bytes, shows it is small; on a busy server it would grow quickly, and the log rotation from the logging module would handle it.</p>
`+r+`
<p>The levels are a trade-off. <b>low</b> keeps blocked packets only. <b>medium</b> adds more detail but produces much more data. <b>off</b> hides the evidence. For most servers, low is right. Use a higher level temporarily when you chase a specific problem, and return to low afterwards.</p>

<h3>From logs to action</h3>
<ul>
<li><b>Repeated DPT=22 from one outside address</b>: password guessing. Keep the deny, consider a <code>limit</code> rule or a block rule for that address.</li>
<li><b>A trusted source blocked on a needed port</b>: a rule is missing or in the wrong order. Add or move the rule.</li>
<li><b>Many sources scanning many ports</b>: normal background noise on an exposed server; do not chase each one.</li>
<li><b>No lines at all, but the client times out</b>: the packet is not reaching this host's firewall. Look at the network path and the router ACL.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A user says "I cannot reach the dashboard from 10.20.0.10". You run the grep for that address. Case A: there is a line with DPT=80 and [UFW BLOCK]: the firewall dropped it, so add or fix an allow for 80/tcp. Case B: there is no line: the packets never arrive, so check routing and ACLs on the path. The log splits the problem in two in one command.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Searching for the wrong address (the log shows the <b>source</b> of the blocked packet); reading BLOCK as an attack when it is often a mis-configured legitimate client; setting logging to high and filling the disk; sharing logs with real addresses in tickets without sanitising them.</p></div>
<div class="exam"><p><b>Exam trap.</b> Logs are evidence, not proof of intent. A block line says that a packet was dropped. It does not say whether the sender was malicious.</p></div>
<div class="scn"><h4>Silence is a clue too</h4><p>A new application server could not send its heartbeat to the monitoring server. The monitoring server's firewall log showed nothing from the application address. The team stopped editing ufw rules and traced the path: a router ACL two hops away was dropping the packets before they ever reached the host.</p><p><b>Lesson:</b> no log line means the problem is elsewhere.</p></div>
<div class="iv"><p class="q">"How do you find out whether the firewall is blocking a client?"</p><p>Filter the firewall log by the client's source address and look for BLOCK lines and the DPT port. If I see them, I fix the rule or its order. If I see none, the packets are not arriving and I check the network path.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Blocked packets are logged in <code>/var/log/ufw.log</code> at the default level.</li>
<li>Fields: time, [UFW BLOCK], IN, SRC, DST, PROTO, DPT.</li>
<li>Filter with <code>grep</code> on the source address; check the file with <code>ls -l</code>.</li>
<li>No line means the packet did not reach this host.</li>
</ul></div>
`,hi:`
<p>Jo firewall chupchaap drop karta hai woh user ke liye paheli hai aur engineer ke liye tohfa: har drop log mein likha ja sakta hai, aur log batata hai kisne kya try kiya. Logging "kuch block ho raha hai" ko "yeh source, is port par, is samay" mein badal deti hai. Chapter 2 mein verbose status mein <code>Logging: on (low)</code> dekha tha. <b>low</b> level par kernel un packets ko record karta hai jo firewall block karta hai. Woh file <code>/var/log/ufw.log</code> mein jama hote hain. (Yeh sirf privileged users padh sakte hain, isliye <code>sudo</code> use karte hain.)</p>
`+e(`Block line ka har field ek sawaal ka jawab deta hai.`)+`
<h3>Ek line ki bunaavat</h3>
<p>Line lo <code>Sep 29 09:00:30 nms03 kernel: [UFW BLOCK] IN=eth0 SRC=10.20.0.10 DST=10.99.0.20 PROTO=TCP DPT=22</code> aur baayen se daayen padho:</p>
<dl class="terms">
<dt>Sep 29 09:00:30 nms03 kernel</dt><dd>Kab hua, kaunsa host, aur message kernel ne banaya.</dd>
<dt>[UFW BLOCK]</dt><dd>Faisla. Woh label jo aap dhoondhte ho. Allowed packets, agar log karo, <code>[UFW ALLOW]</code> kehte hain.</dd>
<dt>IN=eth0</dt><dd>Packet interface eth0 par aaya.</dd>
<dt>SRC=10.20.0.10</dt><dd>Source address, jo client block hua.</dd>
<dt>DST=10.99.0.20</dt><dd>Destination address, yeh server.</dd>
<dt>PROTO=TCP</dt><dd>Protocol: TCP, UDP ya ICMP.</dd>
<dt>DPT=22</dt><dd>Destination port: client ko kaunsi service chahiye thi. Yahan, SSH.</dd>
</dl>
<h3>Jo chahiye woh dhoondhna</h3>
<p><code>grep</code> file mein text dhoondhta hai. Ek client ka address dhoondhne par uski poori kahani milti hai:</p>
`+t+`
<p>Yeh USER01, sales PC, ki kahani hai. 09:00:30 par usne web port 80 aur SSH 22 try kiya. Phir 09:00:50 par usne SSH dobara, phir TCP par port 514, phir UDP par, aur SSH ek aur baar try kiya. Lines mein zaroori saboot hai: source (hamesha wahi), protocol (paanchvi line mein <code>PROTO=UDP</code>) aur destination ports (<code>DPT</code>). Baar-baar <code>DPT=22</code> ka pattern aisa lagta hai jaise koi SSH retry kar raha hai, jo aisa user ho sakta hai jo bhool gaya ki use allowed nahi, ya attacker. Log batata hai kya, kyun nahi. Aap context se tay karte ho.</p>
<p>Sirf naye lines dekhne ke liye <code>tail</code> use karo, aur file khud check karne ke liye <code>ls -l</code>:</p>
`+n+`
<p>File <code>syslog</code> ki hai, group <code>adm</code>, mode <code>rw-r-----</code>: owner likh sakta hai, group padh sakta hai aur others ko kuch nahi. Security log ke liye yeh sahi hai. Size, 778 bytes, dikhata hai ki chhoti hai; busy server par tezi se badhegi, aur logging module ka log rotation use sambhalega.</p>
`+r+`
<p>Levels ek trade-off hain. <b>low</b> sirf blocked packets rakhta hai. <b>medium</b> zyada detail jodta hai par bahut zyada data banata hai. <b>off</b> saboot chhupa deta hai. Zyadatar servers ke liye low sahi hai. Kisi khaas problem ke peeche ho to thodi der ke liye ooncha level use karo, phir low par wapas aao.</p>

<h3>Logs se action tak</h3>
<ul>
<li><b>Ek bahari address se baar-baar DPT=22</b>: password guessing. Deny rakho, <code>limit</code> rule ya us address ke liye block rule sochho.</li>
<li><b>Bharose-mand source zaroori port par blocked</b>: rule missing hai ya galat order mein. Rule jodo ya khiskao.</li>
<li><b>Bahut se sources bahut se ports scan kar rahe hain</b>: exposed server par normal background noise; har ek ke peeche mat bhaago.</li>
<li><b>Ek bhi line nahi, par client timeout hota hai</b>: packet is host ke firewall tak nahi pahunch raha. Network path aur router ACL dekho.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ek user kehta hai "10.20.0.10 se dashboard tak nahi pahunch raha". Aap us address ke liye grep chalate ho. Case A: DPT=80 aur [UFW BLOCK] wali line hai: firewall ne drop kiya, isliye 80/tcp ka allow jodo ya theek karo. Case B: koi line nahi: packets pahunchte hi nahi, isliye raaste ke routing aur ACLs dekho. Log ek command mein problem ko do hisson mein baant deta hai.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Galat address dhoondhna (log blocked packet ka <b>source</b> dikhata hai); BLOCK ko hamla padhna jabki aksar yeh mis-configured legitimate client hota hai; logging high karke disk bhar dena; tickets mein asli addresses bina saaf kiye logs share karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Logs saboot hain, iraade ka praman nahi. Block line batati hai ki packet drop hua. Yeh nahi batati ki bhejne wala malicious tha ya nahi.</p></div>
<div class="scn"><h4>Khamoshi bhi suraag hai</h4><p>Ek naya application server apna heartbeat monitoring server ko nahi bhej pa raha tha. Monitoring server ke firewall log mein application address se kuch nahi dikha. Team ne ufw rules badalna band kiya aur raasta trace kiya: do hop door ek router ACL packets ko host tak pahunchne se pehle hi drop kar raha tha.</p><p><b>Lesson:</b> log line nahi to problem kahin aur hai.</p></div>
<div class="iv"><p class="q">"Kaise pata karoge ki firewall kisi client ko block kar raha hai?"</p><p>Firewall log ko client ke source address se filter karunga aur BLOCK lines aur DPT port dekhunga. Agar dikhein to rule ya uska order theek karunga. Na dikhein to packets aa hi nahi rahe aur network path check karunga.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Default level par blocked packets <code>/var/log/ufw.log</code> mein log hote hain.</li>
<li>Fields: time, [UFW BLOCK], IN, SRC, DST, PROTO, DPT.</li>
<li>Source address par <code>grep</code> se filter karo; file <code>ls -l</code> se check karo.</li>
<li>Line nahi matlab packet is host tak nahi pahunchi.</li>
</ul></div>
`}};export{i as default};