var e={id:`load-balancing`,h:{en:`Load balancing: hashing and why links are uneven`,hi:`Load balancing: hashing aur links uneven kyun hote hain`},body:{en:`
<p>A toll plaza has four lanes, and a simple rule decides your lane: the last digit of your number plate. Plates ending 0 or 4 use lane 1, 1 or 5 lane 2, and so on. The rule is fast, needs no thinking, and a car always takes the same lane, so a convoy never gets split up. But on a day when a transport company sends 200 trucks whose plates all end in 4, lane 1 is jammed while lanes 2 to 4 sit empty. EtherChannel load balancing is exactly this toll plaza.</p>

<h3>Per flow, not per frame</h3>
<p>A switch could, in theory, spray frames round-robin across members. It does not, because frames of one conversation would arrive <b>out of order</b> when members have slightly different delays, and many applications react badly to reordering. Instead the switch picks a member per <b>flow</b>: it takes some fields from the frame header, runs them through a <b>hash</b>, and the result selects a member. The same fields always produce the same result, so every frame of one flow uses the same member and stays in order.</p>
<p>The consequence you must remember: <b>one flow can never use more than one member's bandwidth</b>. A 2 x 10 Gbps bundle offers 20 Gbps of capacity to many flows, but a single backup stream between two hosts tops out at 10 Gbps.</p>

<h3>How the hash picks a member</h3>
<p>On most Catalyst platforms the hash result is one of <b>8 buckets</b>, and the buckets are shared among the active members. With 2 members each gets 4 buckets, with 4 members 2 each, and with 8 members 1 each. With 3 members the split is 3/3/2, and with 6 members it is 2/2/1/1/1/1, so some members get a bigger share of flows by design. That is why powers of two (2, 4, 8) balance best.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Hash to buckets to members">
<rect x="20" y="80" width="130" height="60" rx="8" fill="#fde68a"/><text x="85" y="104" text-anchor="middle" class="svg-ink" font-size="13">frame fields</text><text x="85" y="122" text-anchor="middle" class="svg-muted" font-size="12">src/dst IP or MAC</text>
<line x1="150" y1="110" x2="190" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="190" y="85" width="90" height="50" rx="8" fill="#ddd6fe"/><text x="235" y="115" text-anchor="middle" class="svg-ink" font-size="13">hash</text>
<line x1="280" y1="110" x2="320" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="320" y="20" width="60" height="22" rx="4" fill="#bbf7d0"/><text x="350" y="36" text-anchor="middle" class="svg-ink" font-size="12">0</text>
<rect x="320" y="45" width="60" height="22" rx="4" fill="#bae6fd"/><text x="350" y="61" text-anchor="middle" class="svg-ink" font-size="12">1</text>
<rect x="320" y="70" width="60" height="22" rx="4" fill="#fed7aa"/><text x="350" y="86" text-anchor="middle" class="svg-ink" font-size="12">2</text>
<rect x="320" y="95" width="60" height="22" rx="4" fill="#bbf7d0"/><text x="350" y="111" text-anchor="middle" class="svg-ink" font-size="12">3</text>
<rect x="320" y="120" width="60" height="22" rx="4" fill="#bae6fd"/><text x="350" y="136" text-anchor="middle" class="svg-ink" font-size="12">4</text>
<rect x="320" y="145" width="60" height="22" rx="4" fill="#fed7aa"/><text x="350" y="161" text-anchor="middle" class="svg-ink" font-size="12">5</text>
<rect x="320" y="170" width="60" height="22" rx="4" fill="#bbf7d0"/><text x="350" y="186" text-anchor="middle" class="svg-ink" font-size="12">6</text>
<rect x="320" y="195" width="60" height="22" rx="4" fill="#bae6fd"/><text x="350" y="211" text-anchor="middle" class="svg-ink" font-size="12">7</text>
<text x="350" y="14" text-anchor="middle" class="svg-muted" font-size="12">8 buckets</text>
<rect x="450" y="40" width="160" height="36" rx="8" fill="#bbf7d0"/><text x="530" y="63" text-anchor="middle" class="svg-ink" font-size="13">Gi0/1: 3 buckets</text>
<rect x="450" y="95" width="160" height="36" rx="8" fill="#bae6fd"/><text x="530" y="118" text-anchor="middle" class="svg-ink" font-size="13">Gi0/2: 3 buckets</text>
<rect x="450" y="150" width="160" height="36" rx="8" fill="#fed7aa"/><text x="530" y="173" text-anchor="middle" class="svg-ink" font-size="13">Gi0/3: 2 buckets</text>
<line x1="380" y1="110" x2="450" y2="113" stroke="#64748b"/><line x1="380" y1="60" x2="450" y2="58" stroke="#64748b"/><line x1="380" y1="160" x2="450" y2="168" stroke="#64748b"/>
</svg><p class="cap">With three members, as in the LACP lab's Po10, the 8 buckets split 3/3/2, so the third member carries fewer flows by design.</p></div>

<h3>The methods</h3>
<p>You choose which fields feed the hash with one <b>global</b> command, <code>port-channel load-balance</code>, which applies to every port-channel on the switch. Common options: <code>src-mac</code>, <code>dst-mac</code>, <code>src-dst-mac</code>, <code>src-ip</code>, <code>dst-ip</code>, <code>src-dst-ip</code>, and on many platforms Layer 4 options such as <code>src-dst-port</code> or mixed IP-and-port methods. The default depends on the platform: many older access switches use <code>src-mac</code>, while the Catalyst 9000 family uses <code>src-dst-ip</code>. Each switch hashes only the traffic it <b>sends</b>, so the two ends can use different methods.</p>

<pre class="code">DSW1(config)# port-channel load-balance src-dst-ip
DSW1(config)# end
DSW1# show etherchannel load-balance</pre>
<pre class="out">EtherChannel Load-Balancing Configuration:
<span class="hl">        src-dst-ip</span>

EtherChannel Load-Balancing Addresses Used Per-Protocol:
Non-IP: Source XOR Destination MAC address
  IPv4: Source XOR Destination IP address
  IPv6: Source XOR Destination IP address</pre>
<p>In the LACP lab you set this on both DSW1 and ASW1 so that camera streams, which all go to the same gateway MAC, still spread across the three members because their IP addresses differ.</p>

<div class="eg"><p><b>Worked example: a simplified XOR hash.</b> Classic Catalyst documentation describes the idea like this for a 2-member bundle with <code>src-dst-ip</code>: take the lowest bit of the source IP and of the destination IP and XOR them; 0 selects member 1, 1 selects member 2. Server 10.1.1.50 talks to clients 10.1.1.10 and 10.1.1.11. For .10 and .50, both last bits are 0, 0 XOR 0 = 0: member 1. For .11 and .50, 1 XOR 0 = 1: member 2. The two flows spread. Now switch the method to <code>dst-mac</code> on a link facing a firewall: every frame has the firewall's MAC as destination, so the hash is always the same, and one member carries everything. Real platforms use more bits and a stronger hash, but the lesson is the same: the hash can only spread traffic if the chosen fields <b>vary</b>.</p></div>

<h3>Why traffic may not spread evenly</h3>
<ul>
<li><b>Few, large flows.</b> Three big backup streams on a 2-member bundle can never be 50/50.</li>
<li><b>Wrong fields for the traffic.</b> <code>dst-mac</code> towards a router or firewall, or <code>src-mac</code> on traffic leaving a router, uses a field that never changes.</li>
<li><b>Odd member counts.</b> 3, 5, 6 or 7 members cannot split 8 buckets evenly.</li>
<li><b>Each direction is separate.</b> Outbound and inbound are hashed by different switches, possibly with different methods.</li>
<li><b>Polarisation.</b> In multi-tier designs where every switch uses the same hash on the same fields, traffic that was already sorted onto one link can keep landing on the same member at the next tier.</li>
</ul>
<p>To see the bucket split, look at the Load column of <code>show etherchannel port-channel</code> (chapter 9), and compare member counters with <code>show interfaces g0/1 | include rate</code>.</p>

<div class="warn"><p><b>Common mistake.</b> Adding more members to fix one hot link. If the hot link is caused by one elephant flow or a constant hash field, the new member sits idle too. Fix the method, or accept that one flow is limited to one member.</p></div>

<div class="exam"><p><b>Exam trap.</b> The load-balance command is <b>global</b>, not per port-channel, on Catalyst switches. EtherChannel never splits one flow across members. And load balancing is not per packet round-robin.</p></div>

<div class="scn"><h4>The backup that never got faster</h4><p>A media company upgraded its NAS uplink from a single 10 Gbps link to a 2 x 10 Gbps LACP bundle, expecting its nightly backup to finish in half the time. It did not change at all. <code>show interfaces</code> showed one member at 9.6 Gbps and the other almost idle. The backup was a single TCP session between one NAS and one backup server, so every hash method produced the same member. The team split the job into four parallel streams from different source ports and set <code>src-dst-port</code>; the job then finished in just over half the time.</p><p><b>Lesson:</b> bundles add capacity for many flows, not speed for one flow.</p></div>

<div class="iv"><p class="q">"Why is one member of my port-channel at 90% while the other is almost idle?"</p><p>Strong answer: EtherChannel hashes per flow on configured fields, so imbalance comes from few or large flows, a hash method whose fields do not vary (for example dst-mac towards a firewall), or an odd number of members. Check with <code>show etherchannel load-balance</code> and interface counters, then change to a method with more entropy such as src-dst-ip or src-dst-port. Mention that the command is global and each side hashes its own transmit direction.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Load sharing is per flow via a hash; frames of one flow stay in order on one member.</li>
<li>One flow never exceeds one member's bandwidth.</li>
<li>Most Catalyst platforms hash into 8 buckets; 2, 4 or 8 members balance best.</li>
<li><code>port-channel load-balance</code> is global; verify with <code>show etherchannel load-balance</code>.</li>
<li>Uneven load usually means few big flows or a hash field that never changes.</li>
</ul></div>
`,hi:`
<p>Ek toll plaza mein chaar lanes hain, aur ek simple rule aapki lane tay karta hai: aapki number plate ka aakhri digit. 0 ya 4 par khatam hone wali plates lane 1 use karti hain, 1 ya 5 lane 2, aur aise hi. Rule tez hai, sochna nahi padta, aur car hamesha same lane leti hai, isliye convoy kabhi toot-ta nahi. Lekin jis din ek transport company 200 trucks bhejti hai jinki saari plates 4 par khatam hoti hain, us din lane 1 jam ho jaati hai jabki lanes 2 se 4 khaali padi rehti hain. EtherChannel load balancing bilkul yahi toll plaza hai.</p>

<h3>Per flow, per frame nahi</h3>
<p>Theory mein switch frames ko round-robin members par bikher sakta hai. Woh aisa nahi karta, kyunki members ke delays thode alag hon to ek conversation ke frames <b>out of order</b> pahunchenge, aur kai applications reordering par bura react karti hain. Iski jagah switch har <b>flow</b> ke liye ek member chunta hai: woh frame header se kuch fields leta hai, unhe <b>hash</b> se guzaarta hai, aur result ek member select karta hai. Same fields hamesha same result dete hain, isliye ek flow ka har frame same member use karta hai aur order mein rehta hai.</p>
<p>Jo consequence yaad rakhna hai: <b>ek flow kabhi ek member se zyada bandwidth use nahi kar sakta</b>. 2 x 10 Gbps bundle kai flows ko 20 Gbps capacity deta hai, lekin do hosts ke beech ek backup stream 10 Gbps par ruk jaata hai.</p>

<h3>Hash member kaise chunta hai</h3>
<p>Zyada tar Catalyst platforms par hash result <b>8 buckets</b> mein se ek hota hai, aur buckets active members mein baante jaate hain. 2 members ho to har ek ko 4 buckets, 4 members ho to 2-2, aur 8 members ho to 1-1. 3 members ke saath split 3/3/2 hai, aur 6 members ke saath 2/2/1/1/1/1, isliye design se hi kuch members ko flows ka bada hissa milta hai. Isi wajah se powers of two (2, 4, 8) sabse achha balance karte hain.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Hash se buckets se members">
<rect x="20" y="80" width="130" height="60" rx="8" fill="#fde68a"/><text x="85" y="104" text-anchor="middle" class="svg-ink" font-size="13">frame fields</text><text x="85" y="122" text-anchor="middle" class="svg-muted" font-size="12">src/dst IP ya MAC</text>
<line x1="150" y1="110" x2="190" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="190" y="85" width="90" height="50" rx="8" fill="#ddd6fe"/><text x="235" y="115" text-anchor="middle" class="svg-ink" font-size="13">hash</text>
<line x1="280" y1="110" x2="320" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="320" y="20" width="60" height="22" rx="4" fill="#bbf7d0"/><text x="350" y="36" text-anchor="middle" class="svg-ink" font-size="12">0</text>
<rect x="320" y="45" width="60" height="22" rx="4" fill="#bae6fd"/><text x="350" y="61" text-anchor="middle" class="svg-ink" font-size="12">1</text>
<rect x="320" y="70" width="60" height="22" rx="4" fill="#fed7aa"/><text x="350" y="86" text-anchor="middle" class="svg-ink" font-size="12">2</text>
<rect x="320" y="95" width="60" height="22" rx="4" fill="#bbf7d0"/><text x="350" y="111" text-anchor="middle" class="svg-ink" font-size="12">3</text>
<rect x="320" y="120" width="60" height="22" rx="4" fill="#bae6fd"/><text x="350" y="136" text-anchor="middle" class="svg-ink" font-size="12">4</text>
<rect x="320" y="145" width="60" height="22" rx="4" fill="#fed7aa"/><text x="350" y="161" text-anchor="middle" class="svg-ink" font-size="12">5</text>
<rect x="320" y="170" width="60" height="22" rx="4" fill="#bbf7d0"/><text x="350" y="186" text-anchor="middle" class="svg-ink" font-size="12">6</text>
<rect x="320" y="195" width="60" height="22" rx="4" fill="#bae6fd"/><text x="350" y="211" text-anchor="middle" class="svg-ink" font-size="12">7</text>
<text x="350" y="14" text-anchor="middle" class="svg-muted" font-size="12">8 buckets</text>
<rect x="450" y="40" width="160" height="36" rx="8" fill="#bbf7d0"/><text x="530" y="63" text-anchor="middle" class="svg-ink" font-size="13">Gi0/1: 3 buckets</text>
<rect x="450" y="95" width="160" height="36" rx="8" fill="#bae6fd"/><text x="530" y="118" text-anchor="middle" class="svg-ink" font-size="13">Gi0/2: 3 buckets</text>
<rect x="450" y="150" width="160" height="36" rx="8" fill="#fed7aa"/><text x="530" y="173" text-anchor="middle" class="svg-ink" font-size="13">Gi0/3: 2 buckets</text>
<line x1="380" y1="110" x2="450" y2="113" stroke="#64748b"/><line x1="380" y1="60" x2="450" y2="58" stroke="#64748b"/><line x1="380" y1="160" x2="450" y2="168" stroke="#64748b"/>
</svg><p class="cap">Teen members ke saath, jaise LACP lab ke Po10 mein, 8 buckets 3/3/2 mein bat-te hain, isliye teesra member design se hi kam flows le jaata hai.</p></div>

<h3>Methods</h3>
<p>Hash mein kaunse fields jaayenge, yeh aap ek <b>global</b> command <code>port-channel load-balance</code> se chunte ho, jo switch ke har port-channel par lagta hai. Common options: <code>src-mac</code>, <code>dst-mac</code>, <code>src-dst-mac</code>, <code>src-ip</code>, <code>dst-ip</code>, <code>src-dst-ip</code>, aur kai platforms par Layer 4 options jaise <code>src-dst-port</code> ya mixed IP-aur-port methods. Default platform par depend karta hai: kai purane access switches <code>src-mac</code> use karte hain, jabki Catalyst 9000 family <code>src-dst-ip</code> use karti hai. Har switch sirf woh traffic hash karta hai jo woh <b>bhejta</b> hai, isliye dono ends alag methods use kar sakte hain.</p>

<pre class="code">DSW1(config)# port-channel load-balance src-dst-ip
DSW1(config)# end
DSW1# show etherchannel load-balance</pre>
<pre class="out">EtherChannel Load-Balancing Configuration:
<span class="hl">        src-dst-ip</span>

EtherChannel Load-Balancing Addresses Used Per-Protocol:
Non-IP: Source XOR Destination MAC address
  IPv4: Source XOR Destination IP address
  IPv6: Source XOR Destination IP address</pre>
<p>LACP lab mein aap ise DSW1 aur ASW1 dono par set karte ho taaki camera streams, jo saari same gateway MAC par jaati hain, phir bhi teen members par phail jaayein kyunki unke IP addresses alag hain.</p>

<div class="eg"><p><b>Worked example: simplified XOR hash.</b> Classic Catalyst documentation 2-member bundle aur <code>src-dst-ip</code> ke liye idea aise samjhati hai: source IP aur destination IP ka sabse neeche wala bit lo aur unka XOR karo; 0 member 1 chunta hai, 1 member 2. Server 10.1.1.50 clients 10.1.1.10 aur 10.1.1.11 se baat karta hai. .10 aur .50 ke liye dono last bits 0 hain, 0 XOR 0 = 0: member 1. .11 aur .50 ke liye, 1 XOR 0 = 1: member 2. Dono flows bat jaate hain. Ab firewall ki taraf ke link par method <code>dst-mac</code> kar do: har frame ka destination firewall ka MAC hai, isliye hash hamesha same hai, aur ek member sab kuch le jaata hai. Real platforms zyada bits aur strong hash use karte hain, lekin seekh wahi hai: hash traffic tabhi phaila sakta hai jab chune gaye fields <b>badalte</b> hon.</p></div>

<h3>Traffic evenly kyun nahi phailta</h3>
<ul>
<li><b>Kam, bade flows.</b> 2-member bundle par teen bade backup streams kabhi 50/50 nahi ho sakte.</li>
<li><b>Traffic ke liye galat fields.</b> Router ya firewall ki taraf <code>dst-mac</code>, ya router se nikalne wale traffic par <code>src-mac</code>, aisa field use karta hai jo kabhi nahi badalta.</li>
<li><b>Odd member counts.</b> 3, 5, 6 ya 7 members 8 buckets ko barabar nahi baant sakte.</li>
<li><b>Har direction alag hai.</b> Outbound aur inbound alag switches hash karte hain, shayad alag methods se.</li>
<li><b>Polarisation.</b> Multi-tier designs mein jahan har switch same fields par same hash use karta hai, jo traffic ek link par sort ho chuka hai woh agle tier par bhi same member par land karta reh sakta hai.</li>
</ul>
<p>Bucket split dekhne ke liye <code>show etherchannel port-channel</code> ka Load column dekho (chapter 9), aur member counters ko <code>show interfaces g0/1 | include rate</code> se compare karo.</p>

<div class="warn"><p><b>Common galti.</b> Ek hot link theek karne ke liye aur members add karna. Agar hot link ek elephant flow ya constant hash field ki wajah se hai, to naya member bhi idle baitha rahega. Method theek karo, ya maan lo ki ek flow ek member tak limited hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Catalyst switches par load-balance command <b>global</b> hai, per port-channel nahi. EtherChannel kabhi ek flow ko members mein nahi baant-ta. Aur load balancing per packet round-robin nahi hai.</p></div>

<div class="scn"><h4>Backup jo kabhi tez nahi hua</h4><p>Ek media company ne apne NAS uplink ko single 10 Gbps link se 2 x 10 Gbps LACP bundle mein upgrade kiya, yeh ummeed karke ki nightly backup aadhe time mein khatam hoga. Kuch nahi badla. <code>show interfaces</code> ne ek member ko 9.6 Gbps par aur doosre ko lagbhag idle dikhaya. Backup ek NAS aur ek backup server ke beech single TCP session tha, isliye har hash method same member deta tha. Team ne job ko alag source ports se chaar parallel streams mein toda aur <code>src-dst-port</code> set kiya; phir job aadhe se thoda zyada time mein khatam hua.</p><p><b>Seekh:</b> bundles kai flows ke liye capacity badhate hain, ek flow ki speed nahi.</p></div>

<div class="iv"><p class="q">"Mere port-channel ka ek member 90% par kyun hai jabki doosra lagbhag idle hai?"</p><p>Strong answer: EtherChannel configured fields par per flow hash karta hai, isliye imbalance kam ya bade flows se, aise hash method se jiske fields badalte nahi (jaise firewall ki taraf dst-mac), ya odd number of members se aata hai. <code>show etherchannel load-balance</code> aur interface counters se check karo, phir zyada entropy wale method par jao jaise src-dst-ip ya src-dst-port. Batao ki command global hai aur har side apni transmit direction hash karti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Load sharing hash ke through per flow hoti hai; ek flow ke frames ek member par order mein rehte hain.</li>
<li>Ek flow kabhi ek member ki bandwidth se aage nahi jaata.</li>
<li>Zyada tar Catalyst platforms 8 buckets mein hash karte hain; 2, 4 ya 8 members sabse achha balance karte hain.</li>
<li><code>port-channel load-balance</code> global hai; <code>show etherchannel load-balance</code> se verify karo.</li>
<li>Uneven load ka matlab aam taur par kam bade flows ya aisa hash field jo kabhi nahi badalta.</li>
</ul></div>
`}};export{e as default};