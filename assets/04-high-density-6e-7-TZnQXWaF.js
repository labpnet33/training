var e=(e,t,n,r,i,a)=>`<rect x="`+e+`" y="`+t+`" width="`+n+`" height="`+r+`" rx="6" fill="`+i+`" stroke="#64748b"/>`+(a?`<text x="`+(e+n/2)+`" y="`+(t+r/2+4)+`" text-anchor="middle" class="svg-ink" font-size="12">`+a+`</text>`:``),t=(e,t,n,r,i)=>`<text x="`+e+`" y="`+t+`" text-anchor="`+(i||`middle`)+`" class="`+(r||`svg-ink`)+`" font-size="12">`+n+`</text>`,n=(e,t,n,r,i,a)=>`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="`+i+`" stroke-width="2"`+(a?` stroke-dasharray="6 4"`:``)+`/>`,r=(e,t,n)=>`<circle cx="`+e+`" cy="`+t+`" r="6" fill="`+(n?`#22c55e`:`#ffffff`)+`" stroke="#15803d" stroke-width="2"/>`,i=``,a=[];for(let e=0;e<10;e++){let t=e*36*Math.PI/180;a.push([Math.round(320+235*Math.cos(t)),Math.round(135-72*Math.sin(t)),e])}a.forEach(e=>{i+=`<circle cx="`+e[0]+`" cy="`+e[1]+`" r="26" fill="none" stroke="#0ea5e9" stroke-dasharray="4 3"/>`}),a.forEach(e=>{i+=`<circle cx="`+e[0]+`" cy="`+e[1]+`" r="8" fill="`+(e[2]%2?`#f59e0b`:`#0ea5e9`)+`" stroke="#334155"/>`});var o=a=>`<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="`+a.aria+`">`+e(20,4,120,26,`#ddd6fe`,a.wlc)+e(200,4,140,26,`#bbf7d0`,a.sw)+n(140,17,200,17,`#7c3aed`)+`<ellipse cx="320" cy="135" rx="300" ry="100" fill="#f1f5f9" stroke="#64748b"/><ellipse cx="320" cy="135" rx="170" ry="48" fill="#bbf7d0" stroke="#64748b"/>`+t(320,139,a.field)+n(270,30,247,67,`#94a3b8`)+n(310,30,393,67,`#94a3b8`)+i+r(563,112,!0)+n(563,112,540,150,`#f97316`,!0)+r(540,150,!1)+`<circle cx="86" cy="128" r="4" fill="#22c55e"/><circle cx="96" cy="150" r="4" fill="#22c55e"/><circle cx="548" cy="170" r="4" fill="#22c55e"/><circle cx="430" cy="196" r="4" fill="#22c55e"/><circle cx="215" cy="196" r="4" fill="#22c55e"/>`+t(320,247,a.note,`svg-muted`)+`<circle cx="24" cy="266" r="8" fill="#0ea5e9" stroke="#334155"/>`+t(38,270,a.k1,`svg-ink`,`start`)+`<circle cx="190" cy="266" r="8" fill="#f59e0b" stroke="#334155"/>`+t(204,270,a.k2,`svg-ink`,`start`)+`<circle cx="380" cy="266" r="12" fill="none" stroke="#0ea5e9" stroke-dasharray="4 3"/>`+t(398,270,a.k3,`svg-ink`,`start`)+n(500,266,530,266,`#f97316`,!0)+t(538,270,a.k4,`svg-ink`,`start`)+`</svg><p class="cap">`+a.cap+`</p></div>`,s=o({aria:`Stadium bowl with small cells around the seating ring`,wlc:`Controller`,sw:`Distribution switch`,field:`Field`,note:`Small cells, one AP per seating block, clients mostly static (green dots)`,k1:`Under-seat AP`,k2:`Rail AP`,k3:`Small 5/6 GHz cell`,k4:`Roam`,cap:`Eastbank Arena: ten of the many bowl APs. Small overlapping cells keep each radio near its client ceiling.`}),c=o({aria:`Seating ring ke chaaro taraf chhoti cells wala stadium bowl`,wlc:`Controller`,sw:`Distribution switch`,field:`Field`,note:`Chhoti cells, har seating block par ek AP, clients zyadatar static (green dots)`,k1:`Under-seat AP`,k2:`Rail AP`,k3:`Chhoti 5/6 GHz cell`,k4:`Roam`,cap:`Eastbank Arena: bowl ke bahut saare APs mein se dus. Chhoti overlapping cells har radio ko uske client ceiling ke paas rakhti hain.`}),l={id:`high-density-6e-7`,h:{en:`High density: cell size, airtime, 6 GHz and Wi-Fi 7`,hi:`High density: cell size, airtime, 6 GHz aur Wi-Fi 7`},body:{en:`
<h3>Case 4: Eastbank Arena (fictional)</h3>
<p>Eastbank Arena seats 40,000 for concerts and matches. The owner promises fans a ticket app, mobile ordering, replay video and social uploads. Operations need POS terminals, gate scanners and press Wi-Fi to stay healthy even when the crowd uploads at half time.</p>

<h3>Requirements</h3>
<ul>
<li>Plan for 30 percent of 40,000 fans on Wi-Fi, so about 12,000 associated clients.</li>
<li>A typical planning ceiling is about 50 to 60 clients per radio, so every radio is kept under that.</li>
<li>Gate scanners and POS must never share a congested cell with fans; they use a separate SSID and priority.</li>
</ul>

<h3>Constraints</h3>
<p>The bowl is concrete and steel, which reflects signal. A weather radar nearby makes some DFS channels unreliable. Under-seat mounting is expensive but possible. The venue wants to use 6 GHz for capacity but only some phones support it.</p>

<h3>The rules of high density</h3>
<ul>
<li><b>Shrink the cell.</b> Lower AP transmit power, use directional antennas, and consider RX-SOP so the AP ignores weak distant clients. Smaller cells let channels be reused.</li>
<li><b>Raise the minimum data rate.</b> Turn off low rates so slow frames do not eat airtime. Management and multicast frames then go out faster too.</li>
<li><b>Use narrow channels.</b> Use 20 MHz channels in 5 GHz for density. Wide channels give peak speed but too few channels to reuse.</li>
<li><b>Count airtime, not Mbps.</b> Beacons for every SSID, probe traffic and retransmissions all consume it. Keep SSIDs few (typically 3 to 4).</li>
<li><b>Steer clients.</b> Band steering and similar features push dual-band clients to 5 and 6 GHz and keep 2.4 GHz mostly off or lightly used. Flexible Radio Assignment can convert a spare 2.4 GHz radio to a second 5 GHz radio.</li>
</ul>

<h3>6 GHz and Wi-Fi 6E rules</h3>
<p>The 6 GHz band adds up to 1200 MHz in some regions, giving up to 59 non-overlapping 20 MHz channels, 14 of 80 MHz, 7 of 160 MHz and 3 of 320 MHz (a typical figure for the US; rules differ by country). Key design rules:</p>
<ul>
<li>There is no legacy 802.11a/b/g/n client in 6 GHz, and <b>WPA3 is mandatory</b>. An open guest SSID must use OWE (Enhanced Open); WPA2 is not allowed. Protected management frames are required.</li>
<li>No DFS in 6 GHz, which helps near radar.</li>
<li>Clients discover 6 GHz through <b>preferred scanning channels (PSC)</b>, FILS discovery or unsolicited probe responses, and the reduced neighbour report in 2.4/5 GHz beacons.</li>
<li>Power modes: low power indoor (LPI), standard power (needs an AFC system) and very low power. Outdoor and stadium roof use needs careful reading of the regulatory rules.</li>
</ul>

<h3>Wi-Fi 6 and Wi-Fi 7 features that matter</h3>
<table class="cmp"><tr><th>Feature</th><th>Standard</th><th>Design value</th></tr>
<tr><td>OFDMA</td><td>Wi-Fi 6</td><td>Many small frames share one transmission, good for chatty phones</td></tr>
<tr><td>BSS colouring</td><td>Wi-Fi 6</td><td>Allows more spatial reuse of a channel</td></tr>
<tr><td>Target wake time</td><td>Wi-Fi 6</td><td>IoT and phone battery, less contention</td></tr>
<tr><td>Multi-link operation (MLO)</td><td>Wi-Fi 7</td><td>One client uses more than one band at once for lower latency and higher throughput</td></tr>
<tr><td>320 MHz, 4096-QAM, preamble puncturing</td><td>Wi-Fi 7</td><td>Peak speed in 6 GHz where space exists; puncturing avoids an interfered sub-channel</td></tr>
</table>
<p>At high density Wi-Fi 7 does not mean wider channels. The gain is MLO and efficiency, not 320 MHz in a crowded bowl.</p>
`+s+`
<h3>Options and trade-offs</h3>
<table class="cmp"><tr><th>Option</th><th>Cell control</th><th>Cost</th><th>Risk</th></tr>
<tr><td><b>A. Overhead omni APs only</b></td><td>Poor, big cells</td><td>Low</td><td>Co-channel interference, overloaded radios</td></tr>
<tr><td><b>B. Under-seat and rail APs, directional, 5 GHz</b></td><td>Excellent</td><td>High</td><td>Install work, 6 GHz clients unused</td></tr>
<tr><td><b>C. B plus 6 GHz radios, 20 MHz channels, 3 SSIDs, band steering</b></td><td>Excellent</td><td>High</td><td>Needs planning, pays off as 6 GHz clients grow</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> 12,000 clients with a ceiling of 55 per radio needs at least 12,000 / 55 = about 218 radios. An AP with a 5 GHz and a 6 GHz data radio gives two usable radios, so about 110 APs, plus spares and gate and concourse coverage. The team plans 130 APs. This is a typical-method estimate, not a vendor guarantee.</p></div>

<h3>Chosen design</h3>
<p>Eastbank picks option C. Directional under-seat and rail APs use reduced power, 20 MHz channels in 5 and 6 GHz, a 12 or 24 Mbps minimum rate (typical choices after test), three SSIDs, 2.4 GHz mostly off, and WPA3 on the 6 GHz SSIDs with OWE for guests.</p>

<div class="warn"><p><b>Common mistakes.</b> Using 80 or 160 MHz channels in a dense bowl, forgetting that only some fans have 6 GHz clients, sizing DHCP for 12,000 addresses with a /24, and keeping old low data rates for the sake of a few legacy devices.</p></div>
<div class="exam"><p><b>Exam trap.</b> In high density, fewer, narrower and smaller is better. The exam expects you to reduce cell size, raise minimum rates, limit SSIDs and note that 6 GHz needs WPA3.</p></div>

<h3>Post-mortem</h3>
<div class="scn"><h4>The half-time slowdown</h4><p>At the first match 5 GHz channel utilisation hit about 85 percent at half time. The cause was five SSIDs, a 6 Mbps minimum rate and many fans on old 5 GHz phones with no 6 GHz option. The engineers cut the SSIDs to three, raised the minimum rate, lowered AP power and trimmed channel width to 20 MHz. At the next match utilisation stayed near 50 percent.</p><p><b>Lesson:</b> a high-density WLAN is an airtime budget. Measure utilisation, not only signal.</p></div>

<div class="iv"><p class="q">"What changes when you design for 20,000 clients in one venue?"</p><p>Strong answer: reduce the cell size with power and antennas, raise the minimum data rate, use narrow channels, limit SSIDs, use band steering and the 6 GHz band with WPA3, plan clients per radio, size DHCP and uplinks, and verify with channel utilisation.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>High density is an airtime problem: smaller cells, higher minimum rates, narrow channels, few SSIDs.</li>
<li>Plan clients per radio (typical ceiling about 50 to 60).</li>
<li>6 GHz needs WPA3 and PMF, uses PSC, FILS or RNR discovery and has no DFS.</li>
<li>Wi-Fi 6 adds OFDMA, BSS colouring and TWT; Wi-Fi 7 adds MLO, 320 MHz and 4096-QAM.</li>
<li>Do not use wide channels in dense rooms.</li>
</ul></div>
`,hi:`
<h3>Case 4: Eastbank Arena (fictional)</h3>
<p>Eastbank Arena mein concerts aur matches ke liye 40,000 seats hain. Owner fans se ticket app, mobile ordering, replay video aur social uploads ka vaada karta hai. Operations ko POS terminals, gate scanners aur press Wi-Fi chahiye jo half time par jab crowd upload kare tab bhi healthy rahein.</p>

<h3>Requirements</h3>
<ul>
<li>40,000 fans mein se 30 percent Wi-Fi par maan kar plan karo, yaani lagbhag 12,000 associated clients.</li>
<li>Typical planning ceiling per radio lagbhag 50 se 60 clients hai, isliye har radio isse neeche rakhi jati hai.</li>
<li>Gate scanners aur POS kabhi fans ke saath congested cell share na karein; unka alag SSID aur priority hai.</li>
</ul>

<h3>Constraints</h3>
<p>Bowl concrete aur steel ka hai jo signal reflect karta hai. Paas ka weather radar kuch DFS channels ko unreliable bana deta hai. Under-seat mounting mehenga hai lekin possible hai. Venue capacity ke liye 6 GHz use karna chahta hai lekin sirf kuch phones ise support karte hain.</p>

<h3>High density ke rules</h3>
<ul>
<li><b>Cell chhoti karo.</b> AP transmit power kam karo, directional antennas use karo, aur RX-SOP socho taaki AP door ke weak clients ko ignore kare. Chhoti cells channels ko reuse karne deti hain.</li>
<li><b>Minimum data rate badhao.</b> Low rates band karo taaki slow frames airtime na khayein. Management aur multicast frames bhi tez jate hain.</li>
<li><b>Narrow channels use karo.</b> Density ke liye 5 GHz mein 20 MHz channels. Wide channels peak speed dete hain lekin reuse ke liye channels kam bachte hain.</li>
<li><b>Mbps nahi, airtime gino.</b> Har SSID ke beacons, probe traffic aur retransmissions sab airtime khate hain. SSIDs kam rakho (typically 3 se 4).</li>
<li><b>Clients ko steer karo.</b> Band steering jaise features dual-band clients ko 5 aur 6 GHz par bhejte hain aur 2.4 GHz ko zyadatar off ya halka use rakhte hain. Flexible Radio Assignment spare 2.4 GHz radio ko doosri 5 GHz radio bana sakta hai.</li>
</ul>

<h3>6 GHz aur Wi-Fi 6E rules</h3>
<p>6 GHz band kuch regions mein 1200 MHz tak jodta hai, jisse 59 non-overlapping 20 MHz channels, 14 80 MHz ke, 7 160 MHz ke aur 3 320 MHz ke milte hain (US ke liye typical figure; rules country ke hisaab se alag hain). Key design rules:</p>
<ul>
<li>6 GHz mein koi legacy 802.11a/b/g/n client nahi hai, aur <b>WPA3 mandatory</b> hai. Open guest SSID ko OWE (Enhanced Open) use karna padta hai; WPA2 allowed nahi. Protected management frames required hain.</li>
<li>6 GHz mein DFS nahi hai, jo radar ke paas madad karta hai.</li>
<li>Clients 6 GHz <b>preferred scanning channels (PSC)</b>, FILS discovery ya unsolicited probe responses, aur 2.4/5 GHz beacons mein reduced neighbour report se discover karte hain.</li>
<li>Power modes: low power indoor (LPI), standard power (AFC system chahiye) aur very low power. Outdoor aur stadium roof use ke liye regulatory rules dhyaan se padhne padte hain.</li>
</ul>

<h3>Wi-Fi 6 aur Wi-Fi 7 ke zaroori features</h3>
<table class="cmp"><tr><th>Feature</th><th>Standard</th><th>Design value</th></tr>
<tr><td>OFDMA</td><td>Wi-Fi 6</td><td>Kai chhote frames ek transmission share karte hain, chatty phones ke liye achha</td></tr>
<tr><td>BSS colouring</td><td>Wi-Fi 6</td><td>Channel ka zyada spatial reuse</td></tr>
<tr><td>Target wake time</td><td>Wi-Fi 6</td><td>IoT aur phone battery, kam contention</td></tr>
<tr><td>Multi-link operation (MLO)</td><td>Wi-Fi 7</td><td>Ek client ek saath ek se zyada band use karta hai, kam latency aur zyada throughput ke liye</td></tr>
<tr><td>320 MHz, 4096-QAM, preamble puncturing</td><td>Wi-Fi 7</td><td>Jahan space ho wahan 6 GHz mein peak speed; puncturing interfered sub-channel se bachata hai</td></tr>
</table>
<p>High density mein Wi-Fi 7 ka matlab wide channels nahi hai. Fayda MLO aur efficiency ka hai, bheed bhare bowl mein 320 MHz ka nahi.</p>
`+c+`
<h3>Options aur trade-offs</h3>
<table class="cmp"><tr><th>Option</th><th>Cell control</th><th>Cost</th><th>Risk</th></tr>
<tr><td><b>A. Sirf overhead omni APs</b></td><td>Kharab, badi cells</td><td>Kam</td><td>Co-channel interference, overloaded radios</td></tr>
<tr><td><b>B. Under-seat aur rail APs, directional, 5 GHz</b></td><td>Excellent</td><td>High</td><td>Install work, 6 GHz clients unused</td></tr>
<tr><td><b>C. B plus 6 GHz radios, 20 MHz channels, 3 SSIDs, band steering</b></td><td>Excellent</td><td>High</td><td>Planning chahiye, 6 GHz clients badhne par payoff</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> 12,000 clients, har radio par ceiling 55, to kam se kam 12,000 / 55 = lagbhag 218 radios chahiye. 5 GHz aur 6 GHz data radio wala AP do usable radios deta hai, to lagbhag 110 APs, plus spares aur gate aur concourse coverage. Team 130 APs plan karti hai. Yeh typical-method estimate hai, vendor guarantee nahi.</p></div>

<h3>Chosen design</h3>
<p>Eastbank option C chunta hai. Directional under-seat aur rail APs reduced power, 5 aur 6 GHz mein 20 MHz channels, 12 ya 24 Mbps minimum rate (test ke baad typical choices), teen SSIDs, 2.4 GHz zyadatar off, aur 6 GHz SSIDs par WPA3 plus guests ke liye OWE use karte hain.</p>

<div class="warn"><p><b>Common mistakes.</b> Dense bowl mein 80 ya 160 MHz channels use karna, yeh bhool jana ki sirf kuch fans ke paas 6 GHz clients hain, 12,000 addresses ke liye DHCP /24 se size karna, aur kuch legacy devices ki wajah se purane low data rates rakhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> High density mein kam, narrow aur chhota better hai. Exam expect karta hai ki aap cell size kam karo, minimum rates badhao, SSIDs limit karo aur yaad rakho ki 6 GHz ko WPA3 chahiye.</p></div>

<h3>Post-mortem</h3>
<div class="scn"><h4>Half-time ki slowdown</h4><p>Pehle match mein half time par 5 GHz channel utilisation lagbhag 85 percent tak pahunch gayi. Wajah thi paanch SSIDs, 6 Mbps minimum rate aur bahut saare fans ke purane 5 GHz phones jinke paas 6 GHz option nahi tha. Engineers ne SSIDs teen kiye, minimum rate badhaya, AP power ghataya aur channel width 20 MHz ki. Agle match mein utilisation lagbhag 50 percent par rahi.</p><p><b>Seekh:</b> high-density WLAN airtime budget hai. Sirf signal nahi, utilisation naapo.</p></div>

<div class="iv"><p class="q">"Ek venue mein 20,000 clients ke liye design karte waqt kya badalta hai?"</p><p>Strong answer: power aur antennas se cell size kam karo, minimum data rate badhao, narrow channels use karo, SSIDs limit karo, band steering aur WPA3 ke saath 6 GHz band use karo, clients per radio plan karo, DHCP aur uplinks size karo, aur channel utilisation se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>High density airtime ki problem hai: chhoti cells, higher minimum rates, narrow channels, kam SSIDs.</li>
<li>Clients per radio plan karo (typical ceiling lagbhag 50 se 60).</li>
<li>6 GHz ko WPA3 aur PMF chahiye, PSC, FILS ya RNR discovery use karta hai aur DFS nahi hai.</li>
<li>Wi-Fi 6 OFDMA, BSS colouring aur TWT lata hai; Wi-Fi 7 MLO, 320 MHz aur 4096-QAM lata hai.</li>
<li>Dense rooms mein wide channels use mat karo.</li>
</ul></div>
`}};export{l as default};