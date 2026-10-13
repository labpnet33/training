var e=(e,t,n,r,i,a,o)=>`<rect x="`+e+`" y="`+t+`" width="`+n+`" height="`+r+`" rx="8" fill="`+i+`"/><text x="`+(e+n/2)+`" y="`+(t+r/2+(o?-2:4))+`" text-anchor="middle" class="svg-ink" font-size="12">`+a+`</text>`+(o?`<text x="`+(e+n/2)+`" y="`+(t+r/2+13)+`" text-anchor="middle" class="svg-muted" font-size="11">`+o+`</text>`:``),t=(e,t,n,r)=>`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="#64748b" stroke-width="2"/>`,n=(e,t,n)=>`<div class="dia"><svg viewBox="0 0 640 `+e+`" role="img" aria-label="diagram">`+t+`</svg><p class="cap">`+n+`</p></div>`,r=r=>n(250,`<rect x="10" y="10" width="620" height="170" rx="12" fill="#f1f5f9" stroke="#64748b"/><text x="320" y="32" text-anchor="middle" class="svg-accent" font-size="13">`+r.title+`</text>`+e(25,45,110,55,`#bae6fd`,`NGFW`,r.f1)+e(150,45,110,55,`#bbf7d0`,`SD-WAN`,r.f2)+e(275,45,110,55,`#fde68a`,r.f3,`BGP, OSPF`)+e(400,45,110,55,`#ddd6fe`,`IPsec`,r.f4)+e(525,45,95,55,`#fed7aa`,`ADVPN`,r.f5)+e(25,115,595,52,`#e2e8f0`,r.os,r.os2)+e(150,195,340,44,`#bae6fd`,`FortiManager`,r.fm)+t(320,180,320,195),r.cap),i={id:`why-fortinet`,h:{en:`Why Fortinet puts SD-WAN, security and routing in one box`,hi:`Fortinet SD-WAN, security aur routing ek hi box mein kyun rakhta hai`},body:{en:`
<p>Many vendors sell SD-WAN as a separate product: an SD-WAN edge router in front of, or beside, a firewall. Fortinet made a different choice: <b>SD-WAN is a feature of FortiOS</b>, the same operating system that runs the next-generation firewall (NGFW). The result is called <b>Secure SD-WAN</b>. To see why that matters, picture the branch when you cannot rely on the data centre to inspect everything.</p>
<h3>The problem it solves: breakout needs security</h3>
<p>Local internet breakout is the main saving of SD-WAN, but it removes the central firewall from the path. If the branch gets direct internet access, the branch must now defend itself: firewall policy, intrusion prevention, web filtering, application control, SSL inspection. A design with a separate SD-WAN edge plus a separate firewall means two boxes, two configurations, two places to troubleshoot, and a policy that must stay consistent between them. One box removes that gap.</p>
`+r({title:`One FortiGate running one FortiOS`,f1:`inspect, NAT`,f2:`steer, measure`,f3:`Routing`,f4:`overlay tunnels`,f5:`shortcuts`,os:`FortiOS: one policy engine, one session table, one CLI`,os2:`same logs, same diagnose commands`,fm:`central templates, monitoring, overlay orchestration`,cap:`Everything a branch needs runs in one FortiOS; FortiManager manages many such units as one design.`})+`
<h3>What "in one box" really gives you</h3>
<table class="cmp"><tr><th>Capability</th><th>Benefit of having it in FortiOS</th></tr>
<tr><td><b>NGFW + SD-WAN</b></td><td>The firewall policy points at the SD-WAN zone. Security profiles (antivirus, IPS, web filter, application control) apply to traffic whichever link carries it.</td></tr>
<tr><td><b>Shared application knowledge</b></td><td>The same application signatures and the Internet Service Database (ISDB) that power the firewall also power SD-WAN rules.</td></tr>
<tr><td><b>Routing</b></td><td>Static routes, OSPF and BGP run on the same device and cooperate with SD-WAN, for example BGP over the tunnels (see <b>fsd-routing</b>).</td></tr>
<tr><td><b>IPsec overlay</b></td><td>Tunnels to the hub are interfaces; they can be SD-WAN members and measured like any link.</td></tr>
<tr><td><b>ADVPN</b></td><td>Auto-Discovery VPN lets two branches build a direct shortcut tunnel on demand, without a full mesh configured in advance (see <b>fsd-advpn</b>).</td></tr>
<tr><td><b>Central management</b></td><td>FortiManager provides SD-WAN templates, CLI templates and an overlay orchestrator; FortiAnalyzer can report on SD-WAN. Details in <b>fsd-fmg</b>.</td></tr>
<tr><td><b>Hardware</b></td><td>FortiGate models use Fortinet security processors (SPUs) to accelerate firewall and IPsec work; the amount depends on the model, so check the data sheet.</td></tr></table>
<div class="eg"><p><b>Worked example: devices and configurations.</b> A company has 50 branches. With a separate SD-WAN edge and firewall per branch that is 100 devices, 100 configurations, and two sets of upgrades and licences. With Secure SD-WAN it is 50 devices and one template. Even if the hardware cost were equal, the operations effort is roughly halved, and a branch outage has one place to look at instead of two.</p></div>
<h3>The secure part, in one policy</h3>
<p>This is the same zone policy you saw in <b>nse4-sdwan</b>, now with the inspection that makes breakout safe. The security profile names are the standard ones; yours may differ.</p>
<pre class="code">! Reference configuration (not run in the simulator)
config firewall policy
    edit 10
        set name "LAN-to-SDWAN"
        set srcintf "port3"
        set dstintf "virtual-wan-link"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set utm-status enable
        set ssl-ssh-profile "certificate-inspection"
        set application-list "default"
        set ips-sensor "default"
        set nat enable
        set logtraffic all
    next
end</pre>
<p>Notice what is missing: any mention of a particular ISP. The policy protects the zone, so a third link added tomorrow is protected automatically.</p>
<h3>Honest trade-offs</h3>
<ul><li>One box means one failure domain: plan <b>high availability</b> (a FortiGate HA pair) at hubs and important branches.</li><li>One vendor means skills and tools concentrate: that is a benefit for operations and a dependency for procurement.</li><li>Hardware must be sized for IPsec and inspection throughput, not only for link speed.</li></ul>
<div class="warn"><p><b>Common mistake.</b> Enabling local breakout without turning on inspection, because "the SD-WAN part works". A branch that sends users straight to the internet with no profiles has lost the protection the central firewall used to give.</p></div>
<div class="exam"><p><b>Exam trap.</b> Secure SD-WAN is not a separate licensed product line on the unit; SD-WAN is built into FortiOS. FortiManager is the management layer and is optional for a small network but central to the Architect exam.</p></div>
<div class="scn"><h4>Two boxes, two answers</h4><p>A school group had a third-party SD-WAN edge and a FortiGate firewall at each campus. When a student portal was blocked, the network team blamed the firewall and the security team blamed the edge; the fix took two days of joint calls. After consolidating to FortiGate Secure SD-WAN, the same problem was traced in one flow debug in minutes.</p><p><b>Lesson:</b> One device, one session table and one set of diagnose commands shorten every investigation.</p></div>
<div class="iv"><p class="q">"Why would you choose Fortinet Secure SD-WAN over a standalone SD-WAN appliance plus a firewall?"</p><p>Local breakout needs inspection at the branch; having NGFW, SD-WAN, routing, IPsec and ADVPN in one FortiOS means one policy, one troubleshooting surface, fewer devices and a single management plane in FortiManager. Mention the trade-off: plan HA and size hardware for inspected throughput.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Secure SD-WAN is SD-WAN as a FortiOS feature next to NGFW, routing, IPsec and ADVPN.</li><li>It exists because local breakout moves security to the branch.</li><li>Policies point at the SD-WAN zone and apply to whichever link carries the traffic.</li><li>FortiManager manages many units as one design; plan HA for single points of failure.</li></ul></div>
`,hi:`
<p>Kai vendors SD-WAN ko alag product ki tarah bechte hain: ek SD-WAN edge router firewall ke aage ya baju mein. Fortinet ne alag raasta chuna: <b>SD-WAN FortiOS ka ek feature hai</b>, wahi operating system jo next-generation firewall (NGFW) chalata hai. Is result ko <b>Secure SD-WAN</b> kehte hain. Yeh kyun maayne rakhta hai samajhne ke liye us branch ko socho jahan aap sab kuch inspect karne ke liye data centre par nirbhar nahi reh sakte.</p>
<h3>Jo problem yeh solve karta hai: breakout ko security chahiye</h3>
<p>Local internet breakout SD-WAN ki sabse badi bachat hai, lekin yeh path se central firewall hata deta hai. Agar branch ko seedha internet access mile, to ab branch ko khud ki raksha karni hogi: firewall policy, intrusion prevention, web filtering, application control, SSL inspection. Alag SD-WAN edge aur alag firewall wale design mein do boxes, do configurations, troubleshoot karne ki do jagah, aur ek policy hoti hai jo dono ke beech consistent rakhni padti hai. Ek box yeh gap hata deta hai.</p>
`+r({title:`Ek FortiGate, ek FortiOS`,f1:`inspect, NAT`,f2:`steer, measure`,f3:`Routing`,f4:`overlay tunnels`,f5:`shortcuts`,os:`FortiOS: ek policy engine, ek session table, ek CLI`,os2:`wahi logs, wahi diagnose commands`,fm:`central templates, monitoring, overlay orchestration`,cap:`Branch ko jo chahiye woh sab ek FortiOS mein chalta hai; FortiManager kai aise units ko ek design ki tarah manage karta hai.`})+`
<h3>"Ek box mein" asal mein kya milta hai</h3>
<table class="cmp"><tr><th>Capability</th><th>FortiOS mein hone ka fayda</th></tr>
<tr><td><b>NGFW + SD-WAN</b></td><td>Firewall policy SD-WAN zone ko point karti hai. Security profiles (antivirus, IPS, web filter, application control) us traffic par lagte hain jo bhi link use ho.</td></tr>
<tr><td><b>Shared application knowledge</b></td><td>Wahi application signatures aur Internet Service Database (ISDB) jo firewall ko chalate hain, SD-WAN rules ko bhi chalate hain.</td></tr>
<tr><td><b>Routing</b></td><td>Static routes, OSPF aur BGP usi device par chalte hain aur SD-WAN ke saath cooperate karte hain, jaise tunnels ke upar BGP (<b>fsd-routing</b> dekho).</td></tr>
<tr><td><b>IPsec overlay</b></td><td>Hub tak tunnels interfaces hote hain; woh SD-WAN members ban sakte hain aur kisi bhi link ki tarah naape ja sakte hain.</td></tr>
<tr><td><b>ADVPN</b></td><td>Auto-Discovery VPN do branches ko demand par seedha shortcut tunnel banane deta hai, pehle se full mesh configure kiye bina (<b>fsd-advpn</b> dekho).</td></tr>
<tr><td><b>Central management</b></td><td>FortiManager SD-WAN templates, CLI templates aur overlay orchestrator deta hai; FortiAnalyzer SD-WAN par reporting kar sakta hai. Details <b>fsd-fmg</b> mein.</td></tr>
<tr><td><b>Hardware</b></td><td>FortiGate models Fortinet ke security processors (SPUs) se firewall aur IPsec ka kaam accelerate karte hain; kitna, model par nirbhar hai, isliye data sheet dekho.</td></tr></table>
<div class="eg"><p><b>Worked example: devices aur configurations.</b> Ek company ke 50 branches hain. Har branch par alag SD-WAN edge aur firewall ho to 100 devices, 100 configurations, aur upgrades aur licences ke do set. Secure SD-WAN ke saath 50 devices aur ek template. Hardware cost barabar bhi ho to operations ka effort lagbhag aadha ho jaata hai, aur branch outage mein do ki jagah ek hi jagah dekhni padti hai.</p></div>
<h3>Secure hissa, ek policy mein</h3>
<p>Yeh wahi zone policy hai jo aapne <b>nse4-sdwan</b> mein dekhi, ab us inspection ke saath jo breakout ko safe banata hai. Security profile ke naam standard wale hain; aapke alag ho sakte hain.</p>
<pre class="code">! Reference configuration (not run in the simulator)
config firewall policy
    edit 10
        set name "LAN-to-SDWAN"
        set srcintf "port3"
        set dstintf "virtual-wan-link"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set utm-status enable
        set ssl-ssh-profile "certificate-inspection"
        set application-list "default"
        set ips-sensor "default"
        set nat enable
        set logtraffic all
    next
end</pre>
<p>Dhyaan do ki kya missing hai: kisi khaas ISP ka zikr. Policy zone ko protect karti hai, isliye kal jodi gayi teesri link apne aap protected hoti hai.</p>
<h3>Imaandaar trade-offs</h3>
<ul><li>Ek box ka matlab ek failure domain: hubs aur important branches par <b>high availability</b> (FortiGate HA pair) plan karo.</li><li>Ek vendor ka matlab skills aur tools ek jagah concentrate: operations ke liye fayda, procurement ke liye dependency.</li><li>Hardware ko IPsec aur inspection throughput ke hisaab se size karo, sirf link speed ke hisaab se nahi.</li></ul>
<div class="warn"><p><b>Common galti.</b> Inspection on kiye bina local breakout enable karna, kyunki "SD-WAN wala hissa chal raha hai". Jo branch users ko bina profiles ke seedha internet par bhejta hai, woh wahi protection kho deta hai jo central firewall deta tha.</p></div>
<div class="exam"><p><b>Exam trap.</b> Secure SD-WAN unit par alag licensed product line nahi hai; SD-WAN FortiOS mein built-in hai. FortiManager management layer hai aur chhote network ke liye optional hai, lekin Architect exam ke liye central hai.</p></div>
<div class="scn"><h4>Do boxes, do jawab</h4><p>Ek school group ke har campus par third-party SD-WAN edge aur FortiGate firewall tha. Jab student portal block hua, network team ne firewall ko aur security team ne edge ko doshi kaha; fix mein do din ki joint calls lagi. FortiGate Secure SD-WAN par consolidate karne ke baad wahi problem ek flow debug se minutes mein trace ho gayi.</p><p><b>Seekh:</b> Ek device, ek session table aur ek hi diagnose commands har investigation chhoti kar dete hain.</p></div>
<div class="iv"><p class="q">"Standalone SD-WAN appliance plus firewall ki jagah Fortinet Secure SD-WAN kyun chunoge?"</p><p>Local breakout ko branch par inspection chahiye; NGFW, SD-WAN, routing, IPsec aur ADVPN ek FortiOS mein hone ka matlab ek policy, ek troubleshooting surface, kam devices aur FortiManager mein ek management plane. Trade-off bhi batao: HA plan karo aur hardware ko inspected throughput ke hisaab se size karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Secure SD-WAN matlab SD-WAN FortiOS feature ki tarah NGFW, routing, IPsec aur ADVPN ke baju mein.</li><li>Yeh isliye hai kyunki local breakout security ko branch par le aata hai.</li><li>Policies SD-WAN zone ko point karti hain aur jo bhi link traffic uthaye us par lagti hain.</li><li>FortiManager kai units ko ek design ki tarah manage karta hai; single points of failure ke liye HA plan karo.</li></ul></div>
`}};export{i as default};