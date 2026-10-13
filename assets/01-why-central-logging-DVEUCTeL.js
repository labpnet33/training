var e={id:`why-central-logging`,h:{en:`Why central logging exists and what FortiAnalyzer is`,hi:`Central logging kyun zaroori hai aur FortiAnalyzer kya hai`},body:{en:`
<div class="note"><p><b>What you will learn.</b> Why the logs that stay on a FortiGate are not enough, what a FortiAnalyzer is and what it is not, which words you need (log, traffic log, UTM log, event log, ADOM, registration), and how this module is organised. <b>Prerequisites:</b> FortiGate basics at administrator level. You can log in to a FortiGate CLI, you know what an interface and a firewall policy are, and you can read an IP address with a mask. Nothing about FortiAnalyzer is assumed.</p></div>

<p>Think of a shop with a CCTV camera that records on a small card inside the camera itself. When the card is full, the camera records over the oldest video. If there was a theft last month, the evidence is probably gone. A sensible owner sends every camera feed to one recorder room with a big disk and a person who can search it. A FortiAnalyzer is that recorder room for FortiGate firewalls.</p>

<h3>What a log is</h3>
<p>A <b>log</b> is one line of text that a firewall writes about something that happened: a connection that was allowed, a download that was blocked, an administrator who changed a setting. A FortiGate writes three families of logs.</p>
<table class="cmp"><tr><th>Log type</th><th>What it records</th><th>Example</th></tr>
<tr><td>Traffic</td><td>One line per session that matched a policy with logging on</td><td>10.10.0.10 to 192.0.2.80 port 80, action accept</td></tr>
<tr><td>UTM</td><td>A security profile found something (web filter, application control, IPS, antivirus)</td><td>BitTorrent blocked by application control</td></tr>
<tr><td>Event</td><td>Something about the device itself</td><td>An administrator changed a policy</td></tr>
</table>
<p><b>UTM</b> means unified threat management: the security profiles that inspect traffic beyond the simple allow or deny of a policy.</p>

<h3>The problem with logs that stay on the FortiGate</h3>
<p>Our invented company, Kaveri Retail, has a head office in Chennai and branches in Madurai and Trichy, each with its own FortiGate: HQ-FGT, MDU-FGT and TRY-FGT. Each device keeps a little log memory. This causes four problems.</p>
<table class="cmp"><tr><th>Problem</th><th>What it looks like</th></tr>
<tr><td>Short memory</td><td>Small disk or memory, old logs are overwritten in days, not months.</td></tr>
<tr><td>Many places to search</td><td>To follow a user across sites you log in to three devices.</td></tr>
<tr><td>No reports</td><td>Nobody wants to count sessions by hand for the store manager.</td></tr>
<tr><td>Evidence at risk</td><td>If the device is replaced or attacked, its local logs go with it.</td></tr>
</table>

<h3>What FortiAnalyzer is</h3>
<p><b>FortiAnalyzer</b> is a separate system, often a virtual machine, that receives logs from many FortiGates, stores them on a large disk, lets you search them (Log View), turns patterns into events and incidents, and builds reports. In this course it is called FAZ-1 and has the address 192.0.2.6. This module covers only the first step: how logs travel from the FortiGate to FAZ-1 and what must be true before FAZ-1 keeps them.</p>
<p>Two words you need now. A <b>device</b> is a managed FortiGate. <b>Registration</b> means the FortiAnalyzer has an entry for that FortiGate (identified by its serial number) in its device table. An <b>ADOM</b> (administrative domain) is a named container for devices and their logs; until chapter 6 you only need to know that, with ADOMs off, everything goes to a built-in one called root.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Three FortiGates send logs to FAZ-1">
<rect x="245" y="14" width="150" height="58" rx="8" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">FAZ-1</text><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.6</text>
<rect x="30" y="140" width="150" height="58" rx="8" fill="#bae6fd"/><text x="105" y="165" text-anchor="middle" class="svg-ink" font-size="13">HQ-FGT</text><text x="105" y="183" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.11</text>
<rect x="245" y="140" width="150" height="58" rx="8" fill="#bae6fd"/><text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT</text><text x="320" y="183" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.12</text>
<rect x="460" y="140" width="150" height="58" rx="8" fill="#bae6fd"/><text x="535" y="165" text-anchor="middle" class="svg-ink" font-size="13">TRY-FGT</text><text x="535" y="183" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.13</text>
<line x1="105" y1="140" x2="290" y2="72" stroke="#64748b" stroke-width="2"/><line x1="320" y1="140" x2="320" y2="72" stroke="#64748b" stroke-width="2"/><line x1="535" y1="140" x2="350" y2="72" stroke="#64748b" stroke-width="2"/>
<text x="150" y="100" class="svg-accent" font-size="12">logs, port 514</text>
</svg><p class="cap">Logs flow from each FortiGate to one FortiAnalyzer on the management network 192.0.2.0/24.</p></div>

<h3>What FortiAnalyzer is not</h3>
<p>FortiAnalyzer is not in the traffic path: PC traffic never passes through FAZ-1. It also does not block anything. It records and reports. If FAZ-1 is switched off, the FortiGates keep forwarding and keep protecting; they only hold logs in a queue for a while.</p>

<div class="eg"><p><b>Worked example.</b> A store manager in Madurai says a customer's phone could not reach the intranet at 11:40 yesterday. On MDU-FGT the local log has already rolled over. On FAZ-1 you search the source address and the time and find a deny log, then the policy that caused it. One search, one place, no login to the branch device.</p></div>

<h3>How this module is organised</h3>
<p>Chapter 2 explains the log flow. Chapter 3 is the FortiGate side, chapter 4 the FortiAnalyzer side, chapter 5 the connection states and a troubleshooting order, chapter 6 compares the real product with the simulator. Chapters 7 and 8 walk through the three labs (fa-connect, fa-register, fa-unreg-ts). Chapter 9 is the checklist.</p>

<div class="warn"><p><b>Honest boundaries.</b> The labs run in a simulator, not real FortiAnalyzer software. Actions such as registering a device are GUI actions in the real product; the simulator offers them as <code>execute fazui ...</code> commands and we say so each time. Serial numbers and versions are synthetic. This is independent training; it does not prepare you for a vendor exam.</p></div>

<div class="scn"><h4>The evidence that rolled over</h4><p>A retailer suspected that a point-of-sale PC had contacted a strange server three weeks earlier. The FortiGate kept only four days of logs. With no central copy, the team could prove nothing and had to guess. After they sent logs to a FortiAnalyzer with a large disk, the same question took one search.</p><p><b>Lesson:</b> central logging is about keeping evidence long enough and in one searchable place.</p></div>

<div class="iv"><p class="q">"Why send logs to a FortiAnalyzer when the FortiGate already has logging?"</p><p>Local storage is small and short-lived, logs are spread over many devices, and reports and event correlation need one big store. Add that FortiAnalyzer is not in the traffic path and does not enforce anything.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A FortiGate writes traffic, UTM and event logs, but keeps them only briefly.</li>
<li>FortiAnalyzer receives, stores, searches and reports on logs from many FortiGates.</li>
<li>FAZ-1 (192.0.2.6) is outside the traffic path and never blocks traffic.</li>
<li>Registration means the FortiAnalyzer has a device entry for the FortiGate serial number.</li>
<li>In the simulator, registration is the command <code>execute fazui register</code>; it is a GUI action in the real product.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Is chapter mein aap seekhoge.</b> FortiGate par jo logs rehte hain wo kyun kaafi nahi hain, FortiAnalyzer kya hai aur kya nahi hai, kaun se words zaroori hain (log, traffic log, UTM log, event log, ADOM, registration), aur ye module kaise organised hai. <b>Prerequisites:</b> administrator level ke FortiGate basics. Aap FortiGate CLI mein login kar sakte ho, interface aur firewall policy kya hote hain jaante ho, aur mask ke saath IP address padh sakte ho. FortiAnalyzer ke baare mein kuch assume nahi kiya gaya.</p></div>

<p>Socho ek shop hai jiska CCTV camera apne andar ke chhote card par record karta hai. Card full ho jaye to camera purani video ke upar record kar deta hai. Pichhle mahine chori hui ho to saboot shayad mit chuka hai. Samajhdaar owner har camera ka feed ek recorder room mein bhejta hai jahan bada disk hai aur ek insaan jo search kar sake. FortiAnalyzer FortiGate firewalls ke liye wahi recorder room hai.</p>

<h3>Log kya hota hai</h3>
<p><b>Log</b> text ki ek line hai jo firewall kisi hui ghatna ke baare mein likhta hai: ek connection jo allow hua, ek download jo block hua, ek administrator jisne setting badli. FortiGate teen families ke logs likhta hai.</p>
<table class="cmp"><tr><th>Log type</th><th>Kya record karta hai</th><th>Example</th></tr>
<tr><td>Traffic</td><td>Logging on wali policy se match hue har session ki ek line</td><td>10.10.0.10 se 192.0.2.80 port 80, action accept</td></tr>
<tr><td>UTM</td><td>Security profile ko kuch mila (web filter, application control, IPS, antivirus)</td><td>BitTorrent application control se block hua</td></tr>
<tr><td>Event</td><td>Device ke apne baare mein kuch</td><td>Administrator ne policy badli</td></tr>
</table>
<p><b>UTM</b> ka matlab unified threat management: wo security profiles jo policy ke simple allow ya deny se aage traffic inspect karte hain.</p>

<h3>FortiGate par rehne wale logs ki problem</h3>
<p>Humari invented company Kaveri Retail ka head office Chennai mein hai aur branches Madurai aur Trichy mein, har ek ka apna FortiGate: HQ-FGT, MDU-FGT aur TRY-FGT. Har device thodi si log memory rakhta hai. Isse chaar problems aati hain.</p>
<table class="cmp"><tr><th>Problem</th><th>Kaisi dikhti hai</th></tr>
<tr><td>Chhoti memory</td><td>Chhota disk ya memory, purane logs mahino nahi, kuch dinon mein overwrite ho jate hain.</td></tr>
<tr><td>Search ki kai jagah</td><td>Ek user ko sites ke beech follow karna ho to teen devices mein login karna padta hai.</td></tr>
<tr><td>Reports nahi</td><td>Store manager ke liye sessions haath se gintna koi nahi chahta.</td></tr>
<tr><td>Saboot khatre mein</td><td>Device badla ya attack hua to uske local logs bhi chale jate hain.</td></tr>
</table>

<h3>FortiAnalyzer kya hai</h3>
<p><b>FortiAnalyzer</b> ek alag system hai, aksar virtual machine, jo kai FortiGates se logs leta hai, bade disk par store karta hai, search karne deta hai (Log View), patterns ko events aur incidents mein badalta hai, aur reports banata hai. Is course mein uska naam FAZ-1 hai aur address 192.0.2.6. Ye module sirf pehla step cover karta hai: logs FortiGate se FAZ-1 tak kaise jate hain aur FAZ-1 ke unhe rakhne se pehle kya sach hona chahiye.</p>
<p>Abhi do words chahiye. <b>Device</b> matlab managed FortiGate. <b>Registration</b> matlab FortiAnalyzer ke device table mein us FortiGate ki entry hai (serial number se pehchani hui). <b>ADOM</b> (administrative domain) devices aur unke logs ka named container hai; chapter 6 tak bas itna jaano ki ADOMs off hone par sab kuch built-in root mein jata hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Teen FortiGates FAZ-1 ko logs bhejte hain">
<rect x="245" y="14" width="150" height="58" rx="8" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">FAZ-1</text><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.6</text>
<rect x="30" y="140" width="150" height="58" rx="8" fill="#bae6fd"/><text x="105" y="165" text-anchor="middle" class="svg-ink" font-size="13">HQ-FGT</text><text x="105" y="183" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.11</text>
<rect x="245" y="140" width="150" height="58" rx="8" fill="#bae6fd"/><text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT</text><text x="320" y="183" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.12</text>
<rect x="460" y="140" width="150" height="58" rx="8" fill="#bae6fd"/><text x="535" y="165" text-anchor="middle" class="svg-ink" font-size="13">TRY-FGT</text><text x="535" y="183" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.13</text>
<line x1="105" y1="140" x2="290" y2="72" stroke="#64748b" stroke-width="2"/><line x1="320" y1="140" x2="320" y2="72" stroke="#64748b" stroke-width="2"/><line x1="535" y1="140" x2="350" y2="72" stroke="#64748b" stroke-width="2"/>
<text x="150" y="100" class="svg-accent" font-size="12">logs, port 514</text>
</svg><p class="cap">Logs har FortiGate se ek FortiAnalyzer tak jate hain, management network 192.0.2.0/24 par.</p></div>

<h3>FortiAnalyzer kya nahi hai</h3>
<p>FortiAnalyzer traffic path mein nahi hota: PC ka traffic kabhi FAZ-1 ke through nahi jata. Ye kuch block bhi nahi karta. Ye sirf record aur report karta hai. FAZ-1 band ho jaye to FortiGates forward karte rehte hain aur protect karte rehte hain; bas kuch der ke liye logs queue mein rakhte hain.</p>

<div class="eg"><p><b>Worked example.</b> Madurai ka store manager kehta hai ki kal 11:40 par customer ka phone intranet tak nahi pahunch paya. MDU-FGT par local log roll over ho chuka hai. FAZ-1 par aap source address aur time search karte ho aur deny log milta hai, phir wo policy jisne ye kiya. Ek search, ek jagah, branch device mein login nahi.</p></div>

<h3>Ye module kaise organised hai</h3>
<p>Chapter 2 log flow samjhata hai. Chapter 3 FortiGate side hai, chapter 4 FortiAnalyzer side, chapter 5 connection states aur troubleshooting ka order, chapter 6 real product aur simulator ki tulna karta hai. Chapters 7 aur 8 teen labs (fa-connect, fa-register, fa-unreg-ts) walk through karte hain. Chapter 9 checklist hai.</p>

<div class="warn"><p><b>Honest boundaries.</b> Labs simulator mein chalte hain, real FortiAnalyzer software mein nahi. Device register karna jaise actions real product mein GUI actions hain; simulator unhe <code>execute fazui ...</code> commands ki tarah deta hai aur hum har baar ye batate hain. Serial numbers aur versions synthetic hain. Ye independent training hai; ye kisi vendor exam ki taiyari nahi karwati.</p></div>

<div class="scn"><h4>Wo saboot jo roll over ho gaya</h4><p>Ek retailer ko shak tha ki teen hafte pehle ek point-of-sale PC ne kisi ajeeb server se contact kiya. FortiGate sirf chaar din ke logs rakhta tha. Central copy nahi thi, isliye team kuch saabit nahi kar payi aur andaza lagana pada. Bade disk wale FortiAnalyzer ko logs bhejne ke baad wahi sawal ek search mein mil gaya.</p><p><b>Lesson:</b> central logging ka matlab hai saboot ko kaafi der tak aur ek searchable jagah par rakhna.</p></div>

<div class="iv"><p class="q">"FortiGate mein logging pehle se hai, phir FortiAnalyzer ko logs kyun bhejte hain?"</p><p>Local storage chhota aur kam samay ka hota hai, logs kai devices mein bikhre hote hain, aur reports aur event correlation ke liye ek bada store chahiye. Ye bhi jodo ki FortiAnalyzer traffic path mein nahi hai aur kuch enforce nahi karta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FortiGate traffic, UTM aur event logs likhta hai, par unhe sirf thodi der rakhta hai.</li>
<li>FortiAnalyzer kai FortiGates ke logs leta, store karta, search karwata aur report banata hai.</li>
<li>FAZ-1 (192.0.2.6) traffic path ke bahar hai aur traffic kabhi block nahi karta.</li>
<li>Registration matlab FortiAnalyzer ke paas FortiGate serial number ki device entry hai.</li>
<li>Simulator mein registration command <code>execute fazui register</code> hai; real product mein ye GUI action hai.</li>
</ul></div>
`}};export{e as default};