var e=(e,t,n,r,i,a,o)=>`<rect x="`+e+`" y="`+t+`" width="`+n+`" height="`+r+`" rx="6" fill="`+i+`" stroke="`+(o||`#64748b`)+`"/>`+(a?`<text x="`+(e+n/2)+`" y="`+(t+r/2+4)+`" text-anchor="middle" class="svg-ink" font-size="12">`+a+`</text>`:``),t=(e,t,n,r,i)=>`<text x="`+e+`" y="`+t+`" text-anchor="`+(i||`middle`)+`" class="`+(r||`svg-ink`)+`" font-size="12">`+n+`</text>`,n=(e,t,n,r,i,a)=>`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="`+i+`" stroke-width="2"`+(a?` stroke-dasharray="6 4"`:``)+`/>`,r=(e,t)=>`<circle cx="`+e+`" cy="`+t+`" r="8" fill="#0ea5e9" stroke="#0369a1"/>`,i=(e,t)=>`<circle cx="`+e+`" cy="`+t+`" r="6" fill="#22c55e" stroke="#15803d" stroke-width="2"/>`,a=(e,t)=>`<rect x="`+(e-8)+`" y="`+(t-7)+`" width="16" height="14" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>`,o=o=>`<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="`+o.aria+`">`+e(20,8,110,34,`#fde68a`,o.enc)+e(170,8,120,34,`#bbf7d0`,o.core)+e(330,8,150,34,`#ddd6fe`,o.wlc)+n(130,25,170,25,`#2563eb`)+n(290,25,330,25,`#2563eb`)+n(405,42,120,110,`#94a3b8`)+n(405,42,260,110,`#94a3b8`)+n(405,42,400,110,`#94a3b8`)+n(405,42,540,110,`#94a3b8`)+t(140,78,o.grp,`svg-muted`)+r(120,118)+r(260,118)+r(400,118)+r(540,118)+`<polyline points="120,184 120,160 540,160 540,184" fill="none" stroke="#f97316" stroke-width="2" stroke-dasharray="6 4"/>`+t(400,152,o.mdns,`svg-accent`)+n(260,126,260,184,`#7c3aed`)+t(270,178,o.uni,`svg-ink`,`start`)+i(120,190)+i(260,190)+a(540,190)+t(120,222,o.v1)+t(260,222,o.v1)+t(540,222,o.v2)+r(20,248)+t(34,252,o.k1,`svg-ink`,`start`)+e(80,240,22,16,`#bbf7d0`,``)+t(110,252,o.k2,`svg-ink`,`start`)+i(250,248)+t(262,252,o.k3,`svg-ink`,`start`)+a(360,248)+t(374,252,o.k4,`svg-ink`,`start`)+n(20,276,50,276,`#f97316`,!0)+t(58,280,o.k5,`svg-ink`,`start`)+n(220,276,250,276,`#7c3aed`)+t(258,280,o.k6,`svg-ink`,`start`)+n(450,276,480,276,`#2563eb`)+t(488,280,o.k7,`svg-ink`,`start`)+`</svg><p class="cap">`+o.cap+`</p></div>`,s=o({aria:`Multicast video and mDNS gateway across campus VLANs`,enc:`Video encoder`,core:`Core: PIM, IGMP`,wlc:`WLC: mDNS gateway`,grp:`CAPWAP multicast group to APs`,mdns:`mDNS via gateway`,uni:`Unicast copy (VideoStream)`,v1:`VLAN 110 students`,v2:`VLAN 120 Apple TV`,k1:`AP`,k2:`Wired`,k3:`Client`,k4:`Apple TV`,k5:`mDNS path`,k6:`Unicast copy`,k7:`Wired multicast`,cap:`Northfield University: wired multicast reaches the controller and APs; mDNS crosses VLANs only through the gateway policy.`}),c=o({aria:`Campus VLANs ke beech multicast video aur mDNS gateway`,enc:`Video encoder`,core:`Core: PIM, IGMP`,wlc:`WLC: mDNS gateway`,grp:`APs ko CAPWAP multicast group`,mdns:`Gateway se mDNS`,uni:`Unicast copy (VideoStream)`,v1:`VLAN 110 students`,v2:`VLAN 120 Apple TV`,k1:`AP`,k2:`Wired`,k3:`Client`,k4:`Apple TV`,k5:`mDNS path`,k6:`Unicast copy`,k7:`Wired multicast`,cap:`Northfield University: wired multicast controller aur APs tak pahunchta hai; mDNS VLANs ke beech sirf gateway policy se jata hai.`}),l={id:`multicast-video-mdns`,h:{en:`Multicast, video and mDNS design`,hi:`Multicast, video aur mDNS design`},body:{en:`
<h3>Case 3: Northfield University residence halls (fictional)</h3>
<p>Northfield has six halls with about 1,800 students. Each common room has an Apple TV and a printer. Students want to cast their phones to the TV and print. Once a term the university also streams a live town-hall as multicast video to a big hall with about 300 laptops.</p>

<h3>Requirements</h3>
<ul>
<li>Students in the same hall can discover the common-room TV and printer, but not those of other halls.</li>
<li>The live town-hall (a 4 Mbps stream in this example) must play smoothly for 300 viewers.</li>
<li>Ordinary student traffic must not suffer while the stream runs.</li>
</ul>

<h3>Constraints</h3>
<p>Students sit on a student VLAN, devices sit on a device VLAN, and the routers do not forward link-local multicast. The campus core runs PIM sparse mode, but the security team does not want a single large VLAN per hall.</p>

<h3>Why wireless multicast is hard</h3>
<p>On Wi-Fi, multicast and broadcast frames are sent after the DTIM beacon at the <b>lowest mandatory data rate</b>, so every listener can decode them. They are not acknowledged, so a lost frame is gone. A 4 Mbps stream sent at a 6 Mbps basic rate takes nearly all the cell airtime. Multicast therefore needs deliberate design.</p>

<h3>Controller multicast modes</h3>
<ul>
<li><b>Unicast mode</b>: the controller copies each multicast packet to every AP over CAPWAP unicast. It works with no multicast on the wired network but loads the controller and uplinks.</li>
<li><b>Multicast mode</b>: the controller sends one copy to a CAPWAP multicast group address that APs join. The wired network must support multicast routing and IGMP snooping.</li>
<li><b>Multicast-to-unicast (VideoStream or Multicast Direct)</b>: the AP turns a selected stream into a unicast copy per client. Each copy is acknowledged, uses client data rates and can be QoS-marked, at the cost of more airtime per viewer.</li>
</ul>
<table class="cmp"><tr><th>Option</th><th>Reliability</th><th>Airtime</th><th>Wired needs</th></tr>
<tr><td><b>A. Multicast at the basic rate</b></td><td>Low, no ack</td><td>Poor if the basic rate is low</td><td>Multicast routing</td></tr>
<tr><td><b>B. Multicast with a higher mandatory rate</b></td><td>Medium</td><td>Good for many viewers</td><td>Multicast routing</td></tr>
<tr><td><b>C. Multicast-to-unicast (VideoStream)</b></td><td>High, acked, QoS</td><td>Grows with every viewer</td><td>Multicast to the controller</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> The hall has 12 APs with about 25 viewers each. With option C, each AP sends 25 unicast copies of a 4 Mbps stream: 100 Mbps of payload per AP. That is more than a cell can carry, so C fails for the big hall. With option B and a 24 Mbps basic rate, one multicast copy of 4 Mbps uses roughly 4 / 24, about 17 percent of airtime before overhead (typical estimate), which fits. For a small seminar room with 8 viewers, C costs only 32 Mbps and gives acked delivery, so C wins there.</p></div>
`+s+`
<h3>The mDNS problem</h3>
<p><b>mDNS</b> (multicast DNS, used by Bonjour) sends queries to 224.0.0.251 on UDP port 5353 with a link-local scope. It never crosses a router. The student phone on VLAN 110 cannot hear the Apple TV on VLAN 120. Options: put everything in one VLAN (large broadcast domain, no privacy), or use the controller <b>mDNS gateway</b>, which listens, caches service advertisements and answers on behalf of the other VLAN. The gateway uses <b>service policies and lists</b> so that only wanted services (for example AirPlay and printing) are shared. <b>Location-specific services</b> restrict answers by AP group, so a student in Hall 3 sees only Hall 3 devices.</p>

<h3>Chosen design</h3>
<pre class="out">DESIGN SUMMARY (example, not device output)
Town-hall hall    multicast mode, IGMP snooping, PIM in core
Multicast rate    higher mandatory rate (for example 24 Mbps), 5 GHz
<span class="hl">Seminar rooms    VideoStream, limited viewers per AP</span>
mDNS              gateway on WLC, service policy: AirPlay + print only
Location filter   per hall AP group
Student VLAN 110  Device VLAN 120  (documentation example)
</pre>
<p>Northfield uses multicast mode with a raised mandatory rate in the big hall and VideoStream in small rooms. The mDNS gateway is enabled with a policy limited to AirPlay and printing, and location filtering keeps each hall private.</p>

<div class="warn"><p><b>Common mistakes.</b> Raising the mandatory rate so high that the far-edge clients lose the beacon, enabling multicast mode without IGMP snooping (the stream floods every port), enabling the mDNS gateway with all services allowed, and forgetting that multicast over a Layer 3 roam follows the tunnel.</p></div>
<div class="exam"><p><b>Exam trap.</b> Multicast-to-unicast does not scale with audience size. It is a reliability tool for small groups. Also remember mDNS is link-local, so a routed design always needs a gateway or a relay.</p></div>

<h3>Post-mortem</h3>
<div class="scn"><h4>The printer that appeared in the wrong hall</h4><p>In week two a student in Hall 5 printed to the Hall 2 printer by mistake. The mDNS gateway had been enabled with the default open policy and no location filter. The engineer created a service policy limited to AirPlay and printing and bound it to per-hall AP groups with location-specific services. The leak stopped, and the town-hall stream was unaffected.</p><p><b>Lesson:</b> a gateway makes discovery easy. Policy and location make it safe.</p></div>

<div class="iv"><p class="q">"How would you deliver a live multicast video to 300 wireless clients?"</p><p>Strong answer: use multicast mode on the controller with IGMP snooping and PIM on the wired side, raise the mandatory data rate to cut airtime, keep the stream on 5 GHz, and check AP counts. Mention that multicast-to-unicast is reliable but scales per viewer, so use it for small groups.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Wireless multicast goes out at the lowest mandatory rate and is not acknowledged.</li>
<li>Controller modes: unicast, multicast and multicast-to-unicast (VideoStream).</li>
<li>Multicast mode needs wired multicast routing and IGMP snooping.</li>
<li>mDNS is UDP 5353 to 224.0.0.251 and needs a gateway to cross VLANs.</li>
<li>Always filter the gateway by service and location.</li>
</ul></div>
`,hi:`
<h3>Case 3: Northfield University residence halls (fictional)</h3>
<p>Northfield mein chhe halls hain jinmein lagbhag 1,800 students rehte hain. Har common room mein ek Apple TV aur ek printer hai. Students apne phones TV par cast karna aur print karna chahte hain. Term mein ek baar university ek live town-hall ko multicast video ke roop mein ek bade hall mein stream karti hai jahan lagbhag 300 laptops hote hain.</p>

<h3>Requirements</h3>
<ul>
<li>Ek hi hall ke students common-room ka TV aur printer discover kar sakein, lekin doosre halls ke nahi.</li>
<li>Live town-hall (is example mein 4 Mbps stream) 300 viewers ke liye smoothly chalna chahiye.</li>
<li>Stream chalte waqt normal student traffic ko nuksan na ho.</li>
</ul>

<h3>Constraints</h3>
<p>Students student VLAN par hain, devices device VLAN par, aur routers link-local multicast forward nahi karte. Campus core PIM sparse mode chalata hai, lekin security team har hall ke liye ek bada VLAN nahi chahti.</p>

<h3>Wireless multicast mushkil kyun hai</h3>
<p>Wi-Fi par multicast aur broadcast frames DTIM beacon ke baad <b>lowest mandatory data rate</b> par bheje jate hain, taaki har listener decode kar sake. Unka acknowledgement nahi hota, isliye lost frame gaya samjho. 6 Mbps basic rate par 4 Mbps stream cell ka lagbhag poora airtime kha leti hai. Isliye multicast ko soch samajh kar design karna padta hai.</p>

<h3>Controller multicast modes</h3>
<ul>
<li><b>Unicast mode</b>: controller har multicast packet ko CAPWAP unicast se har AP ko copy karta hai. Wired network par multicast ke bina chalta hai lekin controller aur uplinks par load badhata hai.</li>
<li><b>Multicast mode</b>: controller ek copy CAPWAP multicast group address par bhejta hai jise APs join karte hain. Wired network ko multicast routing aur IGMP snooping support karni chahiye.</li>
<li><b>Multicast-to-unicast (VideoStream ya Multicast Direct)</b>: AP chuni hui stream ko har client ke liye unicast copy mein badal deta hai. Har copy acknowledge hoti hai, client data rates use karti hai aur QoS-mark ho sakti hai, lekin har viewer par zyada airtime lagta hai.</li>
</ul>
<table class="cmp"><tr><th>Option</th><th>Reliability</th><th>Airtime</th><th>Wired needs</th></tr>
<tr><td><b>A. Basic rate par multicast</b></td><td>Low, ack nahi</td><td>Basic rate low ho to kharab</td><td>Multicast routing</td></tr>
<tr><td><b>B. Higher mandatory rate ke saath multicast</b></td><td>Medium</td><td>Kai viewers ke liye achha</td><td>Multicast routing</td></tr>
<tr><td><b>C. Multicast-to-unicast (VideoStream)</b></td><td>High, acked, QoS</td><td>Har viewer ke saath badhta hai</td><td>Controller tak multicast</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Hall mein 12 APs hain aur har AP par lagbhag 25 viewers. Option C mein har AP 4 Mbps stream ki 25 unicast copies bhejta hai: per AP 100 Mbps payload. Yeh ek cell ki capacity se zyada hai, isliye bade hall ke liye C fail hota hai. Option B mein 24 Mbps basic rate ke saath 4 Mbps ki ek multicast copy lagbhag 4 / 24, yaani overhead se pehle lagbhag 17 percent airtime leti hai (typical estimate), jo fit hota hai. 8 viewers wale chhote seminar room ke liye C sirf 32 Mbps leta hai aur acked delivery deta hai, isliye wahan C jeetta hai.</p></div>
`+c+`
<h3>mDNS ki problem</h3>
<p><b>mDNS</b> (multicast DNS, Bonjour use karta hai) queries ko 224.0.0.251 par UDP port 5353 se link-local scope ke saath bhejta hai. Yeh kabhi router cross nahi karta. VLAN 110 ka student phone VLAN 120 ke Apple TV ko sun nahi sakta. Options: sab kuch ek VLAN mein rakho (bada broadcast domain, privacy nahi), ya controller ka <b>mDNS gateway</b> use karo, jo sunta hai, service advertisements cache karta hai aur doosre VLAN ki taraf se jawab deta hai. Gateway <b>service policies aur lists</b> use karta hai taaki sirf zaroori services (jaise AirPlay aur printing) share hon. <b>Location-specific services</b> AP group ke hisaab se jawab restrict karti hain, isliye Hall 3 ka student sirf Hall 3 ke devices dekhta hai.</p>

<h3>Chosen design</h3>
<pre class="out">DESIGN SUMMARY (example, not device output)
Town-hall hall    multicast mode, IGMP snooping, PIM in core
Multicast rate    higher mandatory rate (for example 24 Mbps), 5 GHz
<span class="hl">Seminar rooms    VideoStream, limited viewers per AP</span>
mDNS              gateway on WLC, service policy: AirPlay + print only
Location filter   per hall AP group
Student VLAN 110  Device VLAN 120  (documentation example)
</pre>
<p>Northfield bade hall mein raised mandatory rate ke saath multicast mode aur chhote rooms mein VideoStream use karta hai. mDNS gateway AirPlay aur printing tak limited policy ke saath enable hai, aur location filtering har hall ko private rakhti hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Mandatory rate itna high kar dena ki edge ke clients beacon kho dein, IGMP snooping ke bina multicast mode enable karna (stream har port par flood hoti hai), mDNS gateway ko saari services allow ke saath enable karna, aur yeh bhool jana ki Layer 3 roam par multicast tunnel ko follow karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Multicast-to-unicast audience size ke saath scale nahi karta. Yeh chhote groups ke liye reliability tool hai. Yaad rakho mDNS link-local hai, isliye routed design mein hamesha gateway ya relay chahiye.</p></div>

<h3>Post-mortem</h3>
<div class="scn"><h4>Galat hall mein dikhne wala printer</h4><p>Doosre hafte Hall 5 ke ek student ne galti se Hall 2 ke printer par print kar diya. mDNS gateway default open policy aur bina location filter ke enable tha. Engineer ne AirPlay aur printing tak limited service policy banayi aur use location-specific services ke saath per-hall AP groups se bind kiya. Leak band ho gaya, aur town-hall stream par koi asar nahi pada.</p><p><b>Seekh:</b> gateway discovery aasan banata hai. Policy aur location use safe banate hain.</p></div>

<div class="iv"><p class="q">"300 wireless clients ko live multicast video kaise deliver karoge?"</p><p>Strong answer: controller par multicast mode, wired side par IGMP snooping aur PIM, airtime ghatane ke liye mandatory data rate badhao, stream 5 GHz par rakho, aur AP counts check karo. Batao ki multicast-to-unicast reliable hai lekin per viewer scale hota hai, isliye chhote groups ke liye use karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Wireless multicast lowest mandatory rate par jata hai aur acknowledge nahi hota.</li>
<li>Controller modes: unicast, multicast aur multicast-to-unicast (VideoStream).</li>
<li>Multicast mode ko wired multicast routing aur IGMP snooping chahiye.</li>
<li>mDNS UDP 5353 se 224.0.0.251 par hai aur VLANs cross karne ke liye gateway chahiye.</li>
<li>Gateway ko hamesha service aur location se filter karo.</li>
</ul></div>
`}};export{l as default};