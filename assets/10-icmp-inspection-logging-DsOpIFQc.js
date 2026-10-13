var e={id:`inspect-log`,h:{en:`ICMP inspection, the Modular Policy Framework and basic logging`,hi:`ICMP inspection, Modular Policy Framework aur basic logging`},body:{en:`
<p>Every new ASA engineer meets the same ticket in their first week: "Internet works, but ping does not." Users browse happily, yet the helpdesk's favourite test, <code>ping 8.8.8.8</code>, times out. The guard at our security desk remembers everyone who walks out through a door (TCP, UDP), but by default he does not bother writing down people who only shout a question across the street (ICMP). When the answer is shouted back, he does not recognise it and blocks it. This chapter fixes that, and teaches you to read the guard's diary: the syslog.</p>

<h3>The Modular Policy Framework in one picture</h3>
<p>Protocol-aware inspection on the ASA is configured with the <b>Modular Policy Framework (MPF)</b>, three building blocks you will see in every ASA config:</p>
<pre class="code"><span class="c">! WHICH traffic: a class-map (the default one matches the standard ports)</span>
class-map inspection_default
 match default-inspection-traffic
<span class="c">! WHAT to do with it: a policy-map</span>
policy-map global_policy
 class inspection_default
  inspect dns preset_dns_map
  inspect ftp
  inspect sip
  inspect tftp
<span class="c">! WHERE: apply it globally (all interfaces)</span>
service-policy global_policy global</pre>
<p>The default <code>global_policy</code> already inspects protocols such as DNS, FTP, SIP, H.323, RTSP, ESMTP, SQL*Net, SunRPC, TFTP and NetBIOS. These protocols need help: FTP, for example, negotiates a second data connection inside the control channel, and the ASA must read it to open that data connection. <b>ICMP is not in the default list.</b></p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="ICMP with and without inspection">
<text x="160" y="22" text-anchor="middle" class="svg-accent" font-size="13">Without inspect icmp</text>
<rect x="20" y="40" width="90" height="36" rx="8" fill="#bbf7d0"/><text x="65" y="63" text-anchor="middle" class="svg-ink" font-size="12">PC1</text>
<rect x="130" y="40" width="70" height="36" rx="8" fill="#fed7aa"/><text x="165" y="63" text-anchor="middle" class="svg-ink" font-size="12">ASA</text>
<rect x="220" y="40" width="90" height="36" rx="8" fill="#fde68a"/><text x="265" y="63" text-anchor="middle" class="svg-ink" font-size="12">8.8.8.8</text>
<line x1="110" y1="52" x2="220" y2="52" stroke="#64748b"/><text x="165" y="100" text-anchor="middle" class="svg-muted" font-size="12">echo reply dropped</text>
<text x="165" y="118" text-anchor="middle" class="svg-muted" font-size="12">(106014)</text>
<line x1="220" y1="68" x2="200" y2="68" stroke="#dc2626" stroke-width="2"/>
<text x="480" y="22" text-anchor="middle" class="svg-accent" font-size="13">With inspect icmp</text>
<rect x="340" y="40" width="90" height="36" rx="8" fill="#bbf7d0"/><text x="385" y="63" text-anchor="middle" class="svg-ink" font-size="12">PC1</text>
<rect x="450" y="40" width="70" height="36" rx="8" fill="#fed7aa"/><text x="485" y="63" text-anchor="middle" class="svg-ink" font-size="12">ASA</text>
<rect x="540" y="40" width="90" height="36" rx="8" fill="#fde68a"/><text x="585" y="63" text-anchor="middle" class="svg-ink" font-size="12">8.8.8.8</text>
<line x1="430" y1="52" x2="540" y2="52" stroke="#64748b"/><line x1="540" y1="68" x2="430" y2="68" stroke="#16a34a" stroke-width="2"/>
<text x="485" y="100" text-anchor="middle" class="svg-muted" font-size="12">reply matches the tracked ping</text>
<rect x="20" y="140" width="600" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="167" text-anchor="middle" class="svg-ink" font-size="13">Fix: policy-map global_policy / class inspection_default / inspect icmp</text>
</svg><p class="cap">Without ICMP inspection the echo reply looks like new inbound traffic from outside and is denied.</p></div>

<h3>Why ping fails without inspection</h3>
<p>The echo request (type 8) from PC1 is allowed out: inside 100 to outside 0. But without ICMP inspection the ASA does not tie the returning <b>echo reply</b> (type 0) to that request. The reply arrives on outside as if it were a brand-new inbound packet: lower to higher, no ACL permitting it, so it is denied and logged:</p>
<pre class="out">NK-ASA# show logging | include 106014
<span class="hl">%ASA-3-106014: Deny inbound icmp src outside:8.8.8.8 dst inside:10.0.1.10 (type 0, code 0)</span></pre>

<h3>The clean fix: inspect icmp</h3>
<pre class="code">policy-map global_policy
 class inspection_default
  inspect icmp
<span class="c">! optional: also translate addresses embedded in ICMP error messages</span>
  inspect icmp error</pre>
<p>With inspection, each ping is tracked like a small session. The reply must match an outstanding request (same addresses, identifier and sequence), and only one reply per request is allowed. That is far safer than the alternative, an outside ACL line such as <code>permit icmp any any echo-reply</code>, which lets any echo reply in whether or not anyone asked for it. And never "fix" it with <code>permit icmp any any</code>.</p>
<pre class="out">NK-ASA# show service-policy inspect icmp
Global policy:
  Service-policy: global_policy
    Class-map: inspection_default
      <span class="hl">Inspect: icmp, packet 16, lock fail 0, drop 0, reset-drop 0</span> ...(trimmed)
NK-ASA# show logging | include 302020
%ASA-6-302020: Built outbound ICMP connection for faddr 8.8.8.8/0 gaddr 203.0.113.2/1 laddr 10.0.1.10/1 type 8 code 0</pre>
<p>Remember from chapter 4: ICMP to the ASA's own interfaces is a separate topic, controlled by the <code>icmp permit</code> and <code>icmp deny</code> commands, not by inspection.</p>

<h3>Basic logging</h3>
<pre class="code">logging enable
logging timestamp
logging buffered informational
logging buffer-size 16384
<span class="c">! send to a syslog server on the inside</span>
logging trap informational
logging host inside 10.0.1.50</pre>
<table class="cmp"><tr><th>Level</th><th>Name</th><th>Typical messages</th></tr>
<tr><td>0 to 2</td><td>emergencies, alerts, critical</td><td>serious system and attack alerts</td></tr>
<tr><td>3</td><td>errors</td><td>106014 ICMP denied, interface errors</td></tr>
<tr><td>4</td><td>warnings</td><td>106023 denied by access-group, 419xxx TCP issues</td></tr>
<tr><td>5</td><td>notifications</td><td>configuration changes (111008)</td></tr>
<tr><td>6</td><td>informational</td><td>302013/302014 built/teardown TCP, 305011 translation, 106015 no connection</td></tr>
<tr><td>7</td><td>debugging</td><td>very noisy; troubleshooting only</td></tr>
</table>
<p>A level includes everything more severe than it: <code>informational</code> (6) logs levels 0 to 6. Destinations are independent: <code>logging buffered</code> (RAM, read with <code>show logging</code>), <code>logging trap</code> plus <code>logging host</code> (syslog server), <code>logging console</code> (avoid high levels, it slows the box) and <code>logging monitor</code> with <code>terminal monitor</code> for your SSH session.</p>

<div class="eg"><p><b>Worked example (lab tasks 4 and 5).</b> PC1 pings 8.8.8.8 and fails. <code>show logging</code> shows 106014 with type 0: replies are being dropped. You add <code>inspect icmp</code> under <code>class inspection_default</code>, PC1's ping now succeeds, <code>show service-policy inspect icmp</code> shows the packet counter rising, and you finish with <code>write memory</code>.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Creating a new policy-map with <code>inspect icmp</code> and forgetting <code>service-policy ... global</code>: an unapplied policy does nothing. Only one global policy can exist, so add to <code>global_policy</code> rather than creating another. Setting <code>logging console debugging</code> on a busy ASA. Forgetting <code>logging timestamp</code>, which makes the buffer almost useless in an investigation.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Users can browse but not ping" points to ICMP inspection, not routing, not NAT and not DNS: browsing proves those work. And ICMP inspection is not enabled in the default global policy.</p></div>

<div class="scn"><h4>The monitoring system that said the internet was down</h4><p>A new ASA went live on Saturday. On Monday the NOC monitoring platform reported "internet link down" every minute, while every user was working normally. The platform tested reachability by pinging a public address. <code>show logging</code> on the ASA was full of 106014 messages for type 0 replies addressed to the monitoring server. The engineer added <code>inspect icmp</code> to <code>global_policy</code>; the alarms cleared within one polling cycle.</p><p><b>Lesson:</b> ping is not the internet. Check how the monitoring tests, and enable ICMP inspection when ping is part of your operations.</p></div>

<div class="iv"><p class="q">"Users can browse but pings to the internet fail through an ASA. Why, and how do you fix it?"</p><p>Strong answer: TCP and UDP are tracked in the connection table, but ICMP is not inspected by default, so the echo reply arrives on outside as unsolicited lower-to-higher traffic and is denied (syslog 106014, type 0). The correct fix is <code>inspect icmp</code> in <code>global_policy</code>, which tracks each echo request and permits only its matching reply. An outside ACL permitting echo-reply works but is less strict; <code>permit icmp any any</code> is wrong. Prove it with syslog and packet-tracer.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MPF = class-map (which traffic) + policy-map (what action) + service-policy (where).</li>
<li>The default global_policy inspects DNS, FTP, SIP and others, but not ICMP.</li>
<li>No ICMP inspection: echo replies are denied with syslog 106014 (type 0).</li>
<li>Fix with <code>inspect icmp</code> under <code>class inspection_default</code>; avoid broad ICMP ACLs.</li>
<li>Logging: enable, timestamp, buffered and trap levels; informational (6) shows builds, teardowns and translations.</li>
</ul></div>
`,hi:`
<p>Har naya ASA engineer apne pehle hafte mein ek hi ticket se milta hai: "Internet chalta hai, lekin ping nahi." Users khushi se browse karte hain, phir bhi helpdesk ka favourite test, <code>ping 8.8.8.8</code>, timeout ho jaata hai. Hamare security desk ka guard har us insaan ko yaad rakhta hai jo darwaze se bahar jaata hai (TCP, UDP), lekin default se woh un logon ko nahi likhta jo sirf sadak ke paar sawaal chillaate hain (ICMP). Jab jawab wapas chillaaya jaata hai, woh use pehchaanta nahi aur rok deta hai. Yeh chapter ise theek karta hai, aur aapko guard ki diary padhna sikhata hai: syslog.</p>

<h3>Ek picture mein Modular Policy Framework</h3>
<p>ASA par protocol-aware inspection <b>Modular Policy Framework (MPF)</b> se configure hota hai, teen building blocks jo aapko har ASA config mein dikhenge:</p>
<pre class="code"><span class="c">! KAUNSA traffic: ek class-map (default wala standard ports match karta hai)</span>
class-map inspection_default
 match default-inspection-traffic
<span class="c">! USKE SAATH KYA karna hai: ek policy-map</span>
policy-map global_policy
 class inspection_default
  inspect dns preset_dns_map
  inspect ftp
  inspect sip
  inspect tftp
<span class="c">! KAHAN: globally apply karo (saare interfaces)</span>
service-policy global_policy global</pre>
<p>Default <code>global_policy</code> pehle se DNS, FTP, SIP, H.323, RTSP, ESMTP, SQL*Net, SunRPC, TFTP aur NetBIOS jaise protocols inspect karti hai. In protocols ko madad chahiye: jaise FTP control channel ke andar ek doosra data connection negotiate karta hai, aur ASA ko woh data connection kholne ke liye use padhna padta hai. <b>ICMP default list mein nahi hai.</b></p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Inspection ke saath aur bina ICMP">
<text x="160" y="22" text-anchor="middle" class="svg-accent" font-size="13">inspect icmp ke bina</text>
<rect x="20" y="40" width="90" height="36" rx="8" fill="#bbf7d0"/><text x="65" y="63" text-anchor="middle" class="svg-ink" font-size="12">PC1</text>
<rect x="130" y="40" width="70" height="36" rx="8" fill="#fed7aa"/><text x="165" y="63" text-anchor="middle" class="svg-ink" font-size="12">ASA</text>
<rect x="220" y="40" width="90" height="36" rx="8" fill="#fde68a"/><text x="265" y="63" text-anchor="middle" class="svg-ink" font-size="12">8.8.8.8</text>
<line x1="110" y1="52" x2="220" y2="52" stroke="#64748b"/><text x="165" y="100" text-anchor="middle" class="svg-muted" font-size="12">echo reply drop</text>
<text x="165" y="118" text-anchor="middle" class="svg-muted" font-size="12">(106014)</text>
<line x1="220" y1="68" x2="200" y2="68" stroke="#dc2626" stroke-width="2"/>
<text x="480" y="22" text-anchor="middle" class="svg-accent" font-size="13">inspect icmp ke saath</text>
<rect x="340" y="40" width="90" height="36" rx="8" fill="#bbf7d0"/><text x="385" y="63" text-anchor="middle" class="svg-ink" font-size="12">PC1</text>
<rect x="450" y="40" width="70" height="36" rx="8" fill="#fed7aa"/><text x="485" y="63" text-anchor="middle" class="svg-ink" font-size="12">ASA</text>
<rect x="540" y="40" width="90" height="36" rx="8" fill="#fde68a"/><text x="585" y="63" text-anchor="middle" class="svg-ink" font-size="12">8.8.8.8</text>
<line x1="430" y1="52" x2="540" y2="52" stroke="#64748b"/><line x1="540" y1="68" x2="430" y2="68" stroke="#16a34a" stroke-width="2"/>
<text x="485" y="100" text-anchor="middle" class="svg-muted" font-size="12">reply tracked ping se match</text>
<rect x="20" y="140" width="600" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="167" text-anchor="middle" class="svg-ink" font-size="13">Fix: policy-map global_policy / class inspection_default / inspect icmp</text>
</svg><p class="cap">ICMP inspection ke bina echo reply outside se aaya naya inbound traffic lagta hai aur deny hota hai.</p></div>

<h3>Inspection ke bina ping fail kyun hota hai</h3>
<p>PC1 ka echo request (type 8) bahar jaane diya jaata hai: inside 100 se outside 0. Lekin ICMP inspection ke bina ASA wapas aane wale <b>echo reply</b> (type 0) ko us request se nahi jodta. Reply outside par aise aata hai jaise bilkul naya inbound packet ho: neeche se ooncha, koi ACL use permit nahi karta, isliye deny hota hai aur log hota hai:</p>
<pre class="out">NK-ASA# show logging | include 106014
<span class="hl">%ASA-3-106014: Deny inbound icmp src outside:8.8.8.8 dst inside:10.0.1.10 (type 0, code 0)</span></pre>

<h3>Saaf fix: inspect icmp</h3>
<pre class="code">policy-map global_policy
 class inspection_default
  inspect icmp
<span class="c">! optional: ICMP error messages ke andar ke addresses bhi translate karo</span>
  inspect icmp error</pre>
<p>Inspection ke saath har ping ek chhote session ki tarah track hota hai. Reply ko ek pending request se match karna padta hai (same addresses, identifier aur sequence), aur har request ke liye sirf ek reply allowed hai. Yeh alternative se kahin zyada safe hai, yaani outside ACL line jaise <code>permit icmp any any echo-reply</code>, jo koi bhi echo reply andar aane deti hai chahe kisi ne maanga ho ya nahi. Aur ise kabhi <code>permit icmp any any</code> se "fix" mat karo.</p>
<pre class="out">NK-ASA# show service-policy inspect icmp
Global policy:
  Service-policy: global_policy
    Class-map: inspection_default
      <span class="hl">Inspect: icmp, packet 16, lock fail 0, drop 0, reset-drop 0</span> ...(trimmed)
NK-ASA# show logging | include 302020
%ASA-6-302020: Built outbound ICMP connection for faddr 8.8.8.8/0 gaddr 203.0.113.2/1 laddr 10.0.1.10/1 type 8 code 0</pre>
<p>Chapter 4 yaad karo: ASA ke apne interfaces ko ICMP alag topic hai, jo <code>icmp permit</code> aur <code>icmp deny</code> commands se control hota hai, inspection se nahi.</p>

<h3>Basic logging</h3>
<pre class="code">logging enable
logging timestamp
logging buffered informational
logging buffer-size 16384
<span class="c">! inside par syslog server ko bhejo</span>
logging trap informational
logging host inside 10.0.1.50</pre>
<table class="cmp"><tr><th>Level</th><th>Naam</th><th>Typical messages</th></tr>
<tr><td>0 se 2</td><td>emergencies, alerts, critical</td><td>serious system aur attack alerts</td></tr>
<tr><td>3</td><td>errors</td><td>106014 ICMP denied, interface errors</td></tr>
<tr><td>4</td><td>warnings</td><td>106023 access-group se denied, 419xxx TCP issues</td></tr>
<tr><td>5</td><td>notifications</td><td>configuration changes (111008)</td></tr>
<tr><td>6</td><td>informational</td><td>302013/302014 built/teardown TCP, 305011 translation, 106015 no connection</td></tr>
<tr><td>7</td><td>debugging</td><td>bahut noisy; sirf troubleshooting ke liye</td></tr>
</table>
<p>Ek level apne se zyada severe sab kuch include karta hai: <code>informational</code> (6) levels 0 se 6 log karta hai. Destinations independent hain: <code>logging buffered</code> (RAM, <code>show logging</code> se padho), <code>logging trap</code> plus <code>logging host</code> (syslog server), <code>logging console</code> (high levels se bacho, box slow hota hai) aur aapke SSH session ke liye <code>terminal monitor</code> ke saath <code>logging monitor</code>.</p>

<div class="eg"><p><b>Worked example (lab tasks 4 aur 5).</b> PC1 8.8.8.8 ping karta hai aur fail hota hai. <code>show logging</code> type 0 ke saath 106014 dikhata hai: replies drop ho rahe hain. Aap <code>class inspection_default</code> ke neeche <code>inspect icmp</code> jodte ho, PC1 ka ping ab successful hai, <code>show service-policy inspect icmp</code> packet counter badhta dikhata hai, aur aap <code>write memory</code> se khatam karte ho.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> <code>inspect icmp</code> wali nayi policy-map banana aur <code>service-policy ... global</code> bhool jaana: bina apply ki policy kuch nahi karti. Sirf ek global policy ho sakti hai, isliye doosri banane ki jagah <code>global_policy</code> mein jodo. Busy ASA par <code>logging console debugging</code> set karna. <code>logging timestamp</code> bhool jaana, jisse investigation mein buffer lagbhag bekaar ho jaata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Users browse kar sakte hain lekin ping nahi" ICMP inspection ki taraf ishara karta hai, routing, NAT ya DNS ki taraf nahi: browsing saabit karta hai ki woh kaam kar rahe hain. Aur ICMP inspection default global policy mein enable nahi hota.</p></div>

<div class="scn"><h4>Monitoring system jo kehta tha internet down hai</h4><p>Ek naya ASA Saturday ko live hua. Monday ko NOC monitoring platform har minute "internet link down" report kar raha tha, jabki har user normally kaam kar raha tha. Platform ek public address ping karke reachability test karta tha. ASA par <code>show logging</code> monitoring server ke liye type 0 replies ke 106014 messages se bhara tha. Engineer ne <code>global_policy</code> mein <code>inspect icmp</code> joda; ek polling cycle mein alarms clear ho gaye.</p><p><b>Seekh:</b> ping internet nahi hai. Check karo monitoring kaise test karta hai, aur jab ping aapke operations ka hissa ho to ICMP inspection enable karo.</p></div>

<div class="iv"><p class="q">"ASA ke through users browse kar sakte hain lekin internet ki pings fail hoti hain. Kyun, aur kaise fix karoge?"</p><p>Strong answer: TCP aur UDP connection table mein track hote hain, lekin ICMP default se inspect nahi hota, isliye echo reply outside par unsolicited neeche-se-oonche traffic ki tarah aata hai aur deny hota hai (syslog 106014, type 0). Sahi fix <code>global_policy</code> mein <code>inspect icmp</code> hai, jo har echo request track karta hai aur sirf uska matching reply permit karta hai. Echo-reply permit karne wala outside ACL chalta hai lekin kam strict hai; <code>permit icmp any any</code> galat hai. Syslog aur packet-tracer se saabit karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MPF = class-map (kaunsa traffic) + policy-map (kya action) + service-policy (kahan).</li>
<li>Default global_policy DNS, FTP, SIP aur doosre inspect karti hai, lekin ICMP nahi.</li>
<li>ICMP inspection nahi: echo replies syslog 106014 (type 0) ke saath deny hote hain.</li>
<li><code>class inspection_default</code> ke neeche <code>inspect icmp</code> se fix karo; broad ICMP ACLs se bacho.</li>
<li>Logging: enable, timestamp, buffered aur trap levels; informational (6) builds, teardowns aur translations dikhata hai.</li>
</ul></div>
`}};export{e as default};