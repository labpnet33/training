var e={id:`inspection-health`,h:{en:`Inspection, CPU and memory: is the firewall itself healthy?`,hi:`Inspection, CPU aur memory: kya firewall khud healthy hai?`},body:{en:`
<p>Back at the airport checkpoint. Sometimes the rulebook is perfect and the officers are doing their job, yet passengers still miss their flights. Why? Either a special bag needed a <b>specialist officer</b> who was not on duty (a musical instrument, a medical device), or the <b>X-ray machine itself</b> is overheating and the queue is spilling out of the door. On the ASA, the specialist officers are the <b>inspection engines</b>, and the X-ray machine is the box itself: its <b>CPU</b>, <b>memory</b>, packet buffers and interfaces. This chapter teaches you to check both before you blame an access list.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="ASA health checks">
<rect x="250" y="95" width="140" height="60" rx="10" fill="#fed7aa"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="14">ASA health</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">NK-ASA</text>
<rect x="20" y="20" width="200" height="60" rx="8" fill="#bae6fd"/><text x="120" y="45" text-anchor="middle" class="svg-ink" font-size="13">Inspection</text><text x="120" y="64" text-anchor="middle" class="svg-muted" font-size="12">show service-policy</text>
<rect x="420" y="20" width="200" height="60" rx="8" fill="#bbf7d0"/><text x="520" y="45" text-anchor="middle" class="svg-ink" font-size="13">CPU</text><text x="520" y="64" text-anchor="middle" class="svg-muted" font-size="12">show cpu usage</text>
<rect x="20" y="170" width="200" height="60" rx="8" fill="#ddd6fe"/><text x="120" y="195" text-anchor="middle" class="svg-ink" font-size="13">Memory and buffers</text><text x="120" y="214" text-anchor="middle" class="svg-muted" font-size="12">show memory, show blocks</text>
<rect x="420" y="170" width="200" height="60" rx="8" fill="#fde68a"/><text x="520" y="195" text-anchor="middle" class="svg-ink" font-size="13">Load</text><text x="520" y="214" text-anchor="middle" class="svg-muted" font-size="12">show conn count, show perfmon</text>
<line x1="220" y1="60" x2="250" y2="105" stroke="#64748b" stroke-width="2"/><line x1="420" y1="60" x2="390" y2="105" stroke="#64748b" stroke-width="2"/>
<line x1="220" y1="195" x2="250" y2="145" stroke="#64748b" stroke-width="2"/><line x1="420" y1="195" x2="390" y2="145" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Four health questions to ask when the rules look right but traffic still suffers.</p></div>

<h3>Inspection: the specialist officers</h3>
<p>The connection table handles ordinary TCP and UDP well: it remembers the flow and lets the return traffic back. Some protocols need more. <b>Application inspection</b> is an engine that reads inside a protocol and acts on it. FTP, for example, negotiates a <b>second</b> data connection on a port written inside the control channel; without <code>inspect ftp</code>, the ASA never opens a hole for it, so login works and the directory listing hangs. ICMP has no connection at all; without <code>inspect icmp</code>, an echo reply arriving on <code>outside</code> finds no session and is denied unless an outside ACL permits it.</p>
<p>Inspections are applied with the <b>Modular Policy Framework</b> (MPF): the class-map <code>inspection_default</code> matches the default inspection ports, the policy-map <code>global_policy</code> lists the inspect commands, and <code>service-policy global_policy global</code> applies it to every interface. In our lab the base config added <code>inspect icmp</code> to that class.</p>

<pre class="code"><span class="c">! What is inspected, and is it being used?</span>
show running-config policy-map
show service-policy
<span class="c">! Add a missing inspection to the default class</span>
configure terminal
policy-map global_policy
 class inspection_default
  inspect ftp
end</pre>

<pre class="out">NK-ASA# show service-policy

Global policy:
  Service-policy: global_policy
    Class-map: inspection_default
      Inspect: dns preset_dns_map, packet 214, lock fail 0, drop 0, reset-drop 0, 5-min-pkt-rate 0 pkts/sec, v6-fail-close 0 sctp-drop-override 0
      Inspect: ftp, packet 0, lock fail 0, drop 0, reset-drop 0, 5-min-pkt-rate 0 pkts/sec, v6-fail-close 0 sctp-drop-override 0
      <span class="hl">Inspect: icmp, packet 48, lock fail 0, drop 0, reset-drop 0, 5-min-pkt-rate 0 pkts/sec, v6-fail-close 0 sctp-drop-override 0</span></pre>
<p>The <b>packet</b> counter grows as the engine sees traffic; a growing <b>drop</b> counter means the engine itself is rejecting packets that break the protocol rules. If ICMP replies are missing, look for syslog <code>%ASA-4-313004: Denied ICMP type=0, from laddr 8.8.8.8 on interface outside to 203.0.113.2: no matching session</code>: the reply came back but no ICMP session existed.</p>

<h3>CPU: how busy is the brain?</h3>
<pre class="out">NK-ASA# show cpu usage
<span class="hl">CPU utilization for 5 seconds = 3%; 1 minute: 2%; 5 minutes: 2%</span></pre>
<p>Read the three numbers as a trend: a high 5-second value with a normal 5-minute value is a short burst; all three high is a sustained problem. <code>show processes cpu-usage sorted non-zero</code> lists which processes use the CPU. On multi-core models packet forwarding runs in <b>data path</b> threads, so high data-path usage points to traffic volume, while a high control process points to something like heavy logging, routing churn or management load. Common self-inflicted causes: <code>logging console debugging</code> left on, debug commands left running, and very large captures.</p>

<h3>Load: how many flows, how fast?</h3>
<pre class="out">NK-ASA# show conn count
212400 in use, 214117 most used
NK-ASA# show perfmon
PERFMON STATS:    Current      Average
Xlates               12/s          3/s
<span class="hl">Connections        4100/s          9/s</span>
TCP Conns          4095/s          6/s
UDP Conns             5/s          3/s</pre>
<p><code>show conn count</code> shows the size of the connection table and its peak; <code>show perfmon</code> shows the rate of new connections and translations. <code>show traffic</code> gives packets and bytes per interface, and <code>show local-host</code> shows how many flows each host owns.</p>

<h3>Memory, buffers and interfaces</h3>
<pre class="out">NK-ASA# show memory
Free memory:        6128033792 bytes (71%)
Used memory:        2479030272 bytes (29%)
-------------     ------------------
Total memory:       8607064064 bytes (100%)</pre>
<p>One reading tells you little; a <b>trend</b> tells a story. Free memory that falls every day while the connection count stays flat suggests a software defect, so note the version and check the release notes. <code>show blocks</code> shows packet buffers by size: the <b>CNT</b> column is how many are free now, and a <b>LOW</b> value of 0 means that size ran out at some point. Finally, <code>show interface</code> shows drops that happen <b>before</b> the ASA processes a packet: <b>overrun</b> and <b>no buffer</b> mean the interface received more than it could take in. Those packets never reach a capture or <code>show asp drop</code>.</p>
<pre class="out">NK-ASA# show interface GigabitEthernet0/0
Interface GigabitEthernet0/0 "outside", is up, line protocol is up
        2365802 packets input, 1873526150 bytes, 0 no buffer
        Received 1289 broadcasts, 0 runts, 0 giants
        <span class="hl">1843 input errors, 0 CRC, 0 frame, 1843 overrun, 0 ignored, 0 abort</span></pre>

<div class="eg"><p><b>Worked example.</b> Monday 09:10, every user says "the internet is slow". <code>show cpu usage</code>: 5 seconds 91%, 1 minute 88%, 5 minutes 74%, so this is sustained. <code>show perfmon</code>: 4,100 new connections per second against a normal 9. <code>show conn count</code>: 212,400 in use. <code>show local-host 10.0.1.77</code>: TCP flow count 198,000. That single host owns 198,000 / 212,400 = about 93% of the table. The service desk isolates the laptop and the security team investigates it. As a lasting control, the team adds per-client limits (<code>set connection per-client-max</code>) in the MPF policy. The ACLs were never the problem.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Leaving <code>logging console debugging</code> or a debug running after a session. Removing <code>service-policy global_policy global</code> while "cleaning up" a config and losing every default inspection. Treating one memory reading as a leak. Forgetting that interface overruns are invisible to captures.</p></div>

<div class="exam"><p><b>Exam traps.</b> The default global policy already inspects protocols such as DNS and FTP; ICMP is <b>not</b> inspected by default, which is why the lab adds <code>inspect icmp</code>. Inspection is applied with MPF (class-map, policy-map, service-policy), not with an ACL. In <code>show cpu usage</code>, the three values are 5-second, 1-minute and 5-minute averages.</p></div>

<div class="scn"><h4>Login works, listing hangs</h4><p>After a firewall replacement, a supplier could log in to the company FTP server in the DMZ but every directory listing timed out. The ACL permitted TCP 21 and packet-tracer for port 21 showed ALLOW. <code>show service-policy</code> printed nothing: the new config had been written from a template that omitted <code>service-policy global_policy global</code>. Without FTP inspection the ASA never opened the data channel. The engineer restored the global policy; <code>show service-policy</code> showed the ftp packet counter rising and listings worked.</p><p><b>Lesson:</b> when the first connection of a protocol works and the second does not, think inspection before ACLs.</p></div>

<div class="iv"><p class="q">"Users say everything through the firewall is slow, but nothing is denied. What do you check?"</p><p>Show that you look at the box, not only the rules: <code>show cpu usage</code> and the three averages, <code>show processes cpu-usage sorted non-zero</code>, <code>show conn count</code> and <code>show perfmon</code> for flow rate, <code>show local-host</code> to find a top talker, <code>show memory</code> and <code>show blocks</code> for resources, and <code>show interface</code> for overruns. Mention self-inflicted causes like console debugging, and a lasting control such as per-client connection limits.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inspection engines handle protocols the connection table cannot, such as FTP data channels and ICMP replies; check them with <code>show service-policy</code>.</li>
<li>ICMP is not inspected by default; without <code>inspect icmp</code> replies are denied with 313004.</li>
<li><code>show cpu usage</code> gives 5-second, 1-minute and 5-minute averages; read them as a trend.</li>
<li><code>show conn count</code>, <code>show perfmon</code> and <code>show local-host</code> reveal load and top talkers.</li>
<li><code>show memory</code>, <code>show blocks</code> and interface overruns cover resources; overruns never appear in captures.</li>
</ul></div>
`,hi:`
<p>Airport checkpoint par wapas chalte hain. Kabhi kabhi rulebook perfect hoti hai aur officers apna kaam kar rahe hote hain, phir bhi passengers ki flight chhoot jaati hai. Kyun? Ya to kisi special bag ke liye ek <b>specialist officer</b> chahiye tha jo duty par nahi tha (musical instrument, medical device), ya <b>X-ray machine khud</b> garam ho rahi hai aur queue darwaze ke bahar tak phail rahi hai. ASA par specialist officers hain <b>inspection engines</b>, aur X-ray machine hai box khud: uska <b>CPU</b>, <b>memory</b>, packet buffers aur interfaces. Is chapter mein aap seekhoge ki access list ko blame karne se pehle in dono ko kaise check karein.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="ASA health checks">
<rect x="250" y="95" width="140" height="60" rx="10" fill="#fed7aa"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="14">ASA health</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">NK-ASA</text>
<rect x="20" y="20" width="200" height="60" rx="8" fill="#bae6fd"/><text x="120" y="45" text-anchor="middle" class="svg-ink" font-size="13">Inspection</text><text x="120" y="64" text-anchor="middle" class="svg-muted" font-size="12">show service-policy</text>
<rect x="420" y="20" width="200" height="60" rx="8" fill="#bbf7d0"/><text x="520" y="45" text-anchor="middle" class="svg-ink" font-size="13">CPU</text><text x="520" y="64" text-anchor="middle" class="svg-muted" font-size="12">show cpu usage</text>
<rect x="20" y="170" width="200" height="60" rx="8" fill="#ddd6fe"/><text x="120" y="195" text-anchor="middle" class="svg-ink" font-size="13">Memory aur buffers</text><text x="120" y="214" text-anchor="middle" class="svg-muted" font-size="12">show memory, show blocks</text>
<rect x="420" y="170" width="200" height="60" rx="8" fill="#fde68a"/><text x="520" y="195" text-anchor="middle" class="svg-ink" font-size="13">Load</text><text x="520" y="214" text-anchor="middle" class="svg-muted" font-size="12">show conn count, show perfmon</text>
<line x1="220" y1="60" x2="250" y2="105" stroke="#64748b" stroke-width="2"/><line x1="420" y1="60" x2="390" y2="105" stroke="#64748b" stroke-width="2"/>
<line x1="220" y1="195" x2="250" y2="145" stroke="#64748b" stroke-width="2"/><line x1="420" y1="195" x2="390" y2="145" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Chaar health sawaal jo tab poochne hain jab rules sahi dikhein par traffic phir bhi pareshan ho.</p></div>

<h3>Inspection: specialist officers</h3>
<p>Connection table normal TCP aur UDP ko achhe se handle karta hai: woh flow yaad rakhta hai aur return traffic ko wapas aane deta hai. Kuch protocols ko isse zyada chahiye. <b>Application inspection</b> ek engine hai jo protocol ke andar padhta hai aur uske hisaab se action leta hai. Jaise FTP ek <b>doosra</b> data connection negotiate karta hai, jiska port control channel ke andar likha hota hai; <code>inspect ftp</code> ke bina ASA uske liye kabhi raasta nahi kholta, isliye login chalta hai aur directory listing latak jaati hai. ICMP ka koi connection hota hi nahi; <code>inspect icmp</code> ke bina <code>outside</code> par aane wala echo reply koi session nahi paata aur deny ho jaata hai, jab tak koi outside ACL use permit na kare.</p>
<p>Inspections <b>Modular Policy Framework</b> (MPF) se lagti hain: class-map <code>inspection_default</code> default inspection ports match karta hai, policy-map <code>global_policy</code> inspect commands list karta hai, aur <code>service-policy global_policy global</code> use har interface par apply karta hai. Hamari lab mein base config ne us class mein <code>inspect icmp</code> joda hai.</p>

<pre class="code"><span class="c">! Kya inspect ho raha hai, aur kya woh use ho raha hai?</span>
show running-config policy-map
show service-policy
<span class="c">! Default class mein missing inspection jodo</span>
configure terminal
policy-map global_policy
 class inspection_default
  inspect ftp
end</pre>

<pre class="out">NK-ASA# show service-policy

Global policy:
  Service-policy: global_policy
    Class-map: inspection_default
      Inspect: dns preset_dns_map, packet 214, lock fail 0, drop 0, reset-drop 0, 5-min-pkt-rate 0 pkts/sec, v6-fail-close 0 sctp-drop-override 0
      Inspect: ftp, packet 0, lock fail 0, drop 0, reset-drop 0, 5-min-pkt-rate 0 pkts/sec, v6-fail-close 0 sctp-drop-override 0
      <span class="hl">Inspect: icmp, packet 48, lock fail 0, drop 0, reset-drop 0, 5-min-pkt-rate 0 pkts/sec, v6-fail-close 0 sctp-drop-override 0</span></pre>
<p><b>packet</b> counter tab badhta hai jab engine traffic dekhta hai; badhta hua <b>drop</b> counter matlab engine khud un packets ko reject kar raha hai jo protocol ke rules todte hain. Agar ICMP replies gayab hain, to syslog <code>%ASA-4-313004: Denied ICMP type=0, from laddr 8.8.8.8 on interface outside to 203.0.113.2: no matching session</code> dhoondho: reply wapas aaya par koi ICMP session exist nahi karta tha.</p>

<h3>CPU: dimaag kitna busy hai?</h3>
<pre class="out">NK-ASA# show cpu usage
<span class="hl">CPU utilization for 5 seconds = 3%; 1 minute: 2%; 5 minutes: 2%</span></pre>
<p>Teeno numbers ko ek trend ki tarah padho: 5-second value high aur 5-minute value normal matlab chhota burst; teeno high matlab lagataar problem. <code>show processes cpu-usage sorted non-zero</code> batata hai kaunse processes CPU use kar rahe hain. Multi-core models par packet forwarding <b>data path</b> threads mein chalta hai, isliye high data-path usage traffic volume ki taraf ishara karta hai, jabki high control process heavy logging, routing churn ya management load jaisi cheez ki taraf. Aam khud ki banayi wajahen: <code>logging console debugging</code> on chhod dena, debug commands chalte chhod dena, aur bahut bade captures.</p>

<h3>Load: kitne flows, kitni speed se?</h3>
<pre class="out">NK-ASA# show conn count
212400 in use, 214117 most used
NK-ASA# show perfmon
PERFMON STATS:    Current      Average
Xlates               12/s          3/s
<span class="hl">Connections        4100/s          9/s</span>
TCP Conns          4095/s          6/s
UDP Conns             5/s          3/s</pre>
<p><code>show conn count</code> connection table ka size aur uska peak dikhata hai; <code>show perfmon</code> naye connections aur translations ka rate dikhata hai. <code>show traffic</code> har interface ke packets aur bytes deta hai, aur <code>show local-host</code> dikhata hai ki har host ke paas kitne flows hain.</p>

<h3>Memory, buffers aur interfaces</h3>
<pre class="out">NK-ASA# show memory
Free memory:        6128033792 bytes (71%)
Used memory:        2479030272 bytes (29%)
-------------     ------------------
Total memory:       8607064064 bytes (100%)</pre>
<p>Ek reading se kam pata chalta hai; ek <b>trend</b> kahani batata hai. Agar free memory har din girti jaaye jabki connection count flat rahe, to yeh software defect ka ishara hai, isliye version note karo aur release notes check karo. <code>show blocks</code> size ke hisaab se packet buffers dikhata hai: <b>CNT</b> column batata hai abhi kitne free hain, aur <b>LOW</b> value 0 matlab woh size kabhi na kabhi khatam ho gaya tha. Aakhir mein, <code>show interface</code> woh drops dikhata hai jo ASA ke packet process karne se <b>pehle</b> hote hain: <b>overrun</b> aur <b>no buffer</b> matlab interface ne jitna le sakta tha usse zyada receive kiya. Woh packets kabhi capture ya <code>show asp drop</code> tak nahi pahunchte.</p>
<pre class="out">NK-ASA# show interface GigabitEthernet0/0
Interface GigabitEthernet0/0 "outside", is up, line protocol is up
        2365802 packets input, 1873526150 bytes, 0 no buffer
        Received 1289 broadcasts, 0 runts, 0 giants
        <span class="hl">1843 input errors, 0 CRC, 0 frame, 1843 overrun, 0 ignored, 0 abort</span></pre>

<div class="eg"><p><b>Worked example.</b> Somvaar subah 09:10, har user kehta hai "internet slow hai". <code>show cpu usage</code>: 5 seconds 91%, 1 minute 88%, 5 minutes 74%, yaani lagataar problem. <code>show perfmon</code>: normal 9 ke muqable 4,100 naye connections per second. <code>show conn count</code>: 212,400 in use. <code>show local-host 10.0.1.77</code>: TCP flow count 198,000. Akele is host ke paas 198,000 / 212,400 = lagbhag 93% table hai. Service desk laptop ko isolate karta hai aur security team uski jaanch karti hai. Lasting control ke roop mein team MPF policy mein per-client limits (<code>set connection per-client-max</code>) jodti hai. ACLs kabhi problem thi hi nahi.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Session ke baad <code>logging console debugging</code> ya koi debug chalta chhod dena. Config "saaf" karte waqt <code>service-policy global_policy global</code> hata dena aur har default inspection kho dena. Ek memory reading ko leak samajhna. Bhool jaana ki interface overruns captures ko dikhte hi nahi.</p></div>

<div class="exam"><p><b>Exam traps.</b> Default global policy pehle se DNS aur FTP jaise protocols inspect karti hai; ICMP default mein inspect <b>nahi</b> hota, isliye lab <code>inspect icmp</code> jodti hai. Inspection MPF (class-map, policy-map, service-policy) se lagti hai, ACL se nahi. <code>show cpu usage</code> mein teeno values 5-second, 1-minute aur 5-minute averages hain.</p></div>

<div class="scn"><h4>Login chalta hai, listing latakti hai</h4><p>Firewall replacement ke baad ek supplier DMZ mein company ke FTP server par login kar pa raha tha, par har directory listing timeout ho jaati thi. ACL TCP 21 permit karti thi aur port 21 ke liye packet-tracer ALLOW dikhata tha. <code>show service-policy</code> ne kuch print nahi kiya: naya config ek template se likha gaya tha jismein <code>service-policy global_policy global</code> tha hi nahi. FTP inspection ke bina ASA ne data channel kabhi khola hi nahi. Engineer ne global policy wapas lagayi; <code>show service-policy</code> mein ftp packet counter badhta dikha aur listings chalne lagi.</p><p><b>Seekh:</b> jab kisi protocol ka pehla connection chale aur doosra nahi, to ACLs se pehle inspection ke baare mein socho.</p></div>

<div class="iv"><p class="q">"Users kehte hain firewall se sab kuch slow hai, par kuch deny nahi ho raha. Aap kya check karoge?"</p><p>Dikhao ki aap sirf rules nahi, box ko bhi dekhte ho: <code>show cpu usage</code> aur uske teen averages, <code>show processes cpu-usage sorted non-zero</code>, flow rate ke liye <code>show conn count</code> aur <code>show perfmon</code>, top talker dhoondhne ke liye <code>show local-host</code>, resources ke liye <code>show memory</code> aur <code>show blocks</code>, aur overruns ke liye <code>show interface</code>. Console debugging jaisi khud ki banayi wajahen aur per-client connection limits jaisa lasting control bhi mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inspection engines un protocols ko handle karte hain jo connection table nahi kar sakta, jaise FTP data channels aur ICMP replies; inhe <code>show service-policy</code> se check karo.</li>
<li>ICMP default mein inspect nahi hota; <code>inspect icmp</code> ke bina replies 313004 ke saath deny hote hain.</li>
<li><code>show cpu usage</code> 5-second, 1-minute aur 5-minute averages deta hai; inhe trend ki tarah padho.</li>
<li><code>show conn count</code>, <code>show perfmon</code> aur <code>show local-host</code> load aur top talkers dikhate hain.</li>
<li><code>show memory</code>, <code>show blocks</code> aur interface overruns resources cover karte hain; overruns captures mein kabhi nahi dikhte.</li>
</ul></div>
`}};export{e as default};