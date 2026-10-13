var e={id:`spaces-connector`,h:{en:`Cisco Spaces: the cloud connector, AP locations and analytics`,hi:`Cisco Spaces: cloud connector, AP locations aur analytics`},body:{en:`
<p>A shop owner counts customers at the door with a clicker. That tells her how many people came in, but not where they went, how long they stayed or whether they came back. <b>Cisco Spaces</b> is a cloud platform that answers those questions using the Wi-Fi network as a sensor: it receives location data from your controllers and turns it into maps, counts and alerts. This chapter has two parts: the cloud connector and AP location labels, which you configure hands-on in lab 4, and the analytics use cases, which are concept only.</p>

<h3>How a controller talks to Spaces</h3>
<p>The 9800 sends client and AP data to the cloud using <b>NMSP</b> (Network Mobility Services Protocol) inside a secure connection. There are several connection methods in the real product: a <b>Spaces connector</b> (a small virtual appliance on your network that many controllers talk to), <b>direct connect</b> from each controller, and a link through <b>Catalyst Center</b>. The lab models direct connect, which uses three commands. The URL and token come from the Spaces dashboard when you add the controller; in the lab they are given.</p>
<pre class="code"><span class="c">! Direct connect to Cisco Spaces (lab names)</span>
nmsp cloud-services server url h&#116;tps://nk-spaces.example.net/api/ctx
nmsp cloud-services server token NkSpacesToken123
nmsp cloud-services enable</pre>
<p>The URL must start with the secure scheme. A plain scheme is refused with <code>% The cloud-services URL must start with h&#116;tps://</code>, because location data must be encrypted in transit.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Spaces connection and dependencies">
<rect x="20" y="70" width="130" height="70" rx="8" fill="#bae6fd"/><text x="85" y="100" text-anchor="middle" class="svg-ink" font-size="14">WLC1</text><text x="85" y="120" text-anchor="middle" class="svg-muted" font-size="12">10.10.99.10</text>
<rect x="260" y="20" width="130" height="40" rx="8" fill="#fde68a"/><text x="325" y="45" text-anchor="middle" class="svg-ink" font-size="13">NTP: clock</text>
<rect x="260" y="90" width="130" height="40" rx="8" fill="#fde68a"/><text x="325" y="115" text-anchor="middle" class="svg-ink" font-size="13">DNS: name</text>
<rect x="260" y="160" width="130" height="40" rx="8" fill="#fde68a"/><text x="325" y="185" text-anchor="middle" class="svg-ink" font-size="13">Default route</text>
<rect x="490" y="70" width="130" height="70" rx="8" fill="#ddd6fe"/><text x="555" y="100" text-anchor="middle" class="svg-ink" font-size="14">Cisco Spaces</text><text x="555" y="120" text-anchor="middle" class="svg-muted" font-size="12">cloud, secure</text>
<line x1="150" y1="105" x2="490" y2="105" stroke="#64748b" stroke-width="3"/><text x="320" y="82" text-anchor="middle" class="svg-accent" font-size="12" opacity="0">x</text>
<line x1="325" y1="60" x2="325" y2="90" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><line x1="325" y1="130" x2="325" y2="160" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
</svg><p class="cap">The connector depends on a correct clock, name resolution and a route out. If one is missing the service stays Inactive.</p></div>

<h3>The summary and its fields</h3>
<pre class="out">WLC1# show nmsp cloud-services summary

CMX Cloud-Services Status
-------------------------
Server: h&#116;tps://nk-spaces.example.net/api/ctx
CMX Service
  Enabled: Yes
  Connectivity: h&#116;tps: DOWN
  <span class="hl">Service Status: Inactive</span>
  Last IP Address: 10.10.99.10
  Last Request Status: No response
  <span class="hl">Heartbeat Status: Not OK</span></pre>
<p>Read it from top to bottom. <b>Server</b> shows the URL is set. <b>Enabled: Yes</b> shows you ran <code>nmsp cloud-services enable</code>. Connectivity and Service Status show the result. In the lab, the service is Active only when it is enabled, the URL and token are set, the clock is synchronised, DNS is configured and a default route exists. The fix in this case is not in the NMSP commands at all.</p>

<h3>Lab 4: the walk-through</h3>
<ol>
<li><b>Evidence.</b> <code>show nmsp cloud-services summary</code>, <code>show ntp status</code>, <code>show hosts</code>. The summary is Inactive, the clock says unsynchronised, and no name server is listed (<code>Name servers are 255.255.255.255</code>).</li>
<li><b>Fix.</b> Give the controller a reachable NTP server and a DNS server. RAD1 (10.10.60.20) plays both roles in the lab.</li>
<li><b>Verify.</b> The summary turns Active, Last Request Status shows a success, heartbeat OK.</li>
<li><b>Label the APs.</b> Floor text is what a location service uses to place devices on a floor.</li>
</ol>
<pre class="code">ntp server 10.10.60.20
ip name-server 10.10.60.20
ap name AP1 location Floor2-East
ap name AP2 location Floor2-West</pre>
<pre class="out">WLC1# show ntp status

<span class="hl">Clock is synchronized, stratum 4, reference is 10.10.60.20</span>

WLC1# show nmsp cloud-services summary
...
  <span class="hl">Service Status: Active</span>
  Last Request Status: H&#84;TP/2.0 200 OK
  <span class="hl">Heartbeat Status: OK</span></pre>
<p>Web UI: <b>Configuration &gt; Wireless &gt; Access Points</b>, select the AP, then <b>General &gt; Location</b>. Check the result in <b>Monitoring &gt; Wireless &gt; Access Points</b>. In the lab the connector itself is a CLI feature, and <b>Troubleshooting &gt; Logs</b> helps. The lab's NTP "synchronised" rule is a simplification (the server only has to answer a ping).</p>

<h3>Analytics use cases (concept only)</h3>
<ul>
<li><b>Footfall and dwell time</b>: how many devices came, how long they stayed, how many returned, by zone.</li>
<li><b>Heat maps and paths</b>: where crowds form and which route people take.</li>
<li><b>Captive portal and engagement</b>: guests sign in through a branded page on the guest SSID; marketing triggers (a welcome message, a coupon) can follow.</li>
<li><b>Proximity and asset tracking</b>: find a wheelchair, an infusion pump, a laptop on a floor map using Wi-Fi or BLE tags.</li>
<li><b>Safety and occupancy</b>: alert when a room exceeds a limit.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> A mall has 18,000 visitors on Saturday. Spaces reports that 9,400 connected devices were seen, average dwell time 47 minutes, and 31 percent were repeat visitors. Because phones with random MAC addresses can look like new devices every day, the team uses the captive-portal opt-in to identify returning guests instead of relying on MAC addresses.</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring the connector and ignoring time and DNS. A cloud connection needs a valid clock (certificates are time-sensitive) and a name to resolve. The second mistake is to forget privacy: location data about people needs a lawful basis, notices and opt-in. Follow your local data protection law and use hashed or anonymised identifiers where possible.</p></div>

<div class="exam"><p><b>Exam trap.</b> The three NMSP cloud commands do not make the service Active by themselves; the clock, DNS and route are dependencies. Also remember that Spaces replaces the older on-premises CMX.</p></div>

<div class="scn"><h4>Heartbeat failing on a new site</h4><p>A branch controller showed Spaces Inactive for two days. NMSP commands were correct, the token had not expired. The branch had a new firewall that blocked UDP 123 to the NTP server, so the controller clock drifted 6 minutes and the secure session failed. The firewall rule was added, <code>show ntp status</code> turned synchronised and the heartbeat recovered.</p><p><b>Lesson:</b> read the dependencies when a cloud service is configured but not Active.</p></div>

<div class="iv"><p class="q">"A controller is configured for Cisco Spaces but the service is Inactive. What do you check?"</p><p>Read the summary, then check clock sync (NTP), DNS, default route and that the URL uses the secure scheme and the token is valid, then any firewall on the path. Mention that you labelled AP locations because maps need accurate AP placement.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NMSP carries location data to Spaces; direct connect needs URL, token and enable.</li>
<li>The service is Active only with a synchronised clock, DNS and a default route.</li>
<li>AP location text helps a location service place devices by floor.</li>
<li>Analytics (footfall, dwell, heat maps, portals, assets) are concept only.</li>
<li>Treat location data as personal data: opt-in, notices, minimal retention.</li>
</ul></div>
`,hi:`
<p>Ek dukaan ki malkin darwaze par clicker se customers ginti hai. Isse pata chalta hai kitne log aaye, lekin yeh nahi ki woh kahan gaye, kitni der ruke ya wapas aaye ya nahi. <b>Cisco Spaces</b> ek cloud platform hai jo Wi-Fi network ko sensor ki tarah use karke yeh sawal solve karta hai: woh aapke controllers se location data leta hai aur use maps, counts aur alerts mein badalta hai. Is chapter ke do hisse hain: cloud connector aur AP location labels, jo aap lab 4 mein hands-on configure karoge, aur analytics use cases, jo sirf concept hain.</p>

<h3>Controller Spaces se kaise baat karta hai</h3>
<p>9800 client aur AP data ko cloud tak <b>NMSP</b> (Network Mobility Services Protocol) se, secure connection ke andar bhejta hai. Real product mein kai connection methods hain: <b>Spaces connector</b> (aapke network par chhota virtual appliance jisse kai controllers baat karte hain), har controller se <b>direct connect</b>, aur <b>Catalyst Center</b> ke through link. Lab direct connect model karta hai, jisme teen commands lagte hain. URL aur token controller add karte waqt Spaces dashboard se milte hain; lab mein diye gaye hain.</p>
<pre class="code"><span class="c">! Cisco Spaces se direct connect (lab ke naam)</span>
nmsp cloud-services server url h&#116;tps://nk-spaces.example.net/api/ctx
nmsp cloud-services server token NkSpacesToken123
nmsp cloud-services enable</pre>
<p>URL secure scheme se shuru hona chahiye. Plain scheme par <code>% The cloud-services URL must start with h&#116;tps://</code> milta hai, kyunki location data transit mein encrypted hona chahiye.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Spaces connection aur dependencies">
<rect x="20" y="70" width="130" height="70" rx="8" fill="#bae6fd"/><text x="85" y="100" text-anchor="middle" class="svg-ink" font-size="14">WLC1</text><text x="85" y="120" text-anchor="middle" class="svg-muted" font-size="12">10.10.99.10</text>
<rect x="260" y="20" width="130" height="40" rx="8" fill="#fde68a"/><text x="325" y="45" text-anchor="middle" class="svg-ink" font-size="13">NTP: clock</text>
<rect x="260" y="90" width="130" height="40" rx="8" fill="#fde68a"/><text x="325" y="115" text-anchor="middle" class="svg-ink" font-size="13">DNS: naam</text>
<rect x="260" y="160" width="130" height="40" rx="8" fill="#fde68a"/><text x="325" y="185" text-anchor="middle" class="svg-ink" font-size="13">Default route</text>
<rect x="490" y="70" width="130" height="70" rx="8" fill="#ddd6fe"/><text x="555" y="100" text-anchor="middle" class="svg-ink" font-size="14">Cisco Spaces</text><text x="555" y="120" text-anchor="middle" class="svg-muted" font-size="12">cloud, secure</text>
<line x1="150" y1="105" x2="490" y2="105" stroke="#64748b" stroke-width="3"/>
<line x1="325" y1="60" x2="325" y2="90" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><line x1="325" y1="130" x2="325" y2="160" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
</svg><p class="cap">Connector sahi clock, name resolution aur bahar ke route par depend karta hai. Ek bhi missing ho to service Inactive rehti hai.</p></div>

<h3>Summary aur uske fields</h3>
<pre class="out">WLC1# show nmsp cloud-services summary

CMX Cloud-Services Status
-------------------------
Server: h&#116;tps://nk-spaces.example.net/api/ctx
CMX Service
  Enabled: Yes
  Connectivity: h&#116;tps: DOWN
  <span class="hl">Service Status: Inactive</span>
  Last IP Address: 10.10.99.10
  Last Request Status: No response
  <span class="hl">Heartbeat Status: Not OK</span></pre>
<p>Ise upar se neeche padho. <b>Server</b> dikhata hai URL set hai. <b>Enabled: Yes</b> dikhata hai aapne <code>nmsp cloud-services enable</code> chalaya. Connectivity aur Service Status result dikhate hain. Lab mein service tabhi Active hoti hai jab woh enabled ho, URL aur token set hon, clock synchronised ho, DNS configured ho aur default route ho. Is case mein fix NMSP commands mein hai hi nahi.</p>

<h3>Lab 4: walk-through</h3>
<ol>
<li><b>Evidence.</b> <code>show nmsp cloud-services summary</code>, <code>show ntp status</code>, <code>show hosts</code>. Summary Inactive hai, clock unsynchronised kehti hai, aur koi name server listed nahi (<code>Name servers are 255.255.255.255</code>).</li>
<li><b>Fix.</b> Controller ko reachable NTP server aur DNS server do. Lab mein RAD1 (10.10.60.20) dono roles nibhata hai.</li>
<li><b>Verify.</b> Summary Active ho jaati hai, Last Request Status success dikhata hai, heartbeat OK.</li>
<li><b>APs ko label karo.</b> Floor text woh hai jise location service devices ko floor par place karne ke liye use karti hai.</li>
</ol>
<pre class="code">ntp server 10.10.60.20
ip name-server 10.10.60.20
ap name AP1 location Floor2-East
ap name AP2 location Floor2-West</pre>
<pre class="out">WLC1# show ntp status

<span class="hl">Clock is synchronized, stratum 4, reference is 10.10.60.20</span>

WLC1# show nmsp cloud-services summary
...
  <span class="hl">Service Status: Active</span>
  Last Request Status: H&#84;TP/2.0 200 OK
  <span class="hl">Heartbeat Status: OK</span></pre>
<p>Web UI: <b>Configuration &gt; Wireless &gt; Access Points</b>, AP select karo, phir <b>General &gt; Location</b>. Result <b>Monitoring &gt; Wireless &gt; Access Points</b> mein check karo. Lab mein connector khud CLI feature hai, aur <b>Troubleshooting &gt; Logs</b> madad karta hai. Lab ka NTP "synchronised" rule simplification hai (server ko sirf ping ka jawab dena hota hai).</p>

<h3>Analytics use cases (sirf concept)</h3>
<ul>
<li><b>Footfall aur dwell time</b>: kitne devices aaye, kitni der ruke, kitne wapas aaye, zone ke hisaab se.</li>
<li><b>Heat maps aur paths</b>: bheed kahan banti hai aur log kaun sa route lete hain.</li>
<li><b>Captive portal aur engagement</b>: guests guest SSID par branded page se sign in karte hain; marketing triggers (welcome message, coupon) aage aa sakte hain.</li>
<li><b>Proximity aur asset tracking</b>: Wi-Fi ya BLE tags se wheelchair, infusion pump, laptop ko floor map par dhoondho.</li>
<li><b>Safety aur occupancy</b>: room limit se zyada hone par alert.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Ek mall mein Saturday ko 18,000 visitors aaye. Spaces report karta hai ki 9,400 connected devices dikhe, average dwell time 47 minute, aur 31 percent repeat visitors the. Random MAC addresses wale phones har din naye devices jaise dikh sakte hain, isliye team returning guests ko MAC par nahi, captive-portal opt-in se pehchanti hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Connector configure karke time aur DNS ko ignore karna. Cloud connection ko valid clock (certificates time-sensitive hote hain) aur resolve hone wala naam chahiye. Doosri galti privacy bhoolna hai: logon ke baare mein location data ke liye lawful basis, notices aur opt-in chahiye. Apne local data protection law ko follow karo aur jahan ho sake hashed ya anonymised identifiers use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Teen NMSP cloud commands akele service ko Active nahi banate; clock, DNS aur route dependencies hain. Yeh bhi yaad rakho ki Spaces purane on-premises CMX ko replace karta hai.</p></div>

<div class="scn"><h4>Naye site par heartbeat fail</h4><p>Ek branch controller par Spaces do din se Inactive tha. NMSP commands sahi the, token expire nahi hua tha. Branch par naya firewall tha jo NTP server tak UDP 123 block karta tha, isliye controller clock 6 minute drift ho gayi aur secure session fail hua. Firewall rule add hua, <code>show ntp status</code> synchronised ho gaya aur heartbeat wapas aa gaya.</p><p><b>Lesson:</b> jab cloud service configured ho lekin Active na ho to dependencies padho.</p></div>

<div class="iv"><p class="q">"Controller Cisco Spaces ke liye configured hai lekin service Inactive hai. Aap kya check karoge?"</p><p>Summary padho, phir clock sync (NTP), DNS, default route aur yeh ki URL secure scheme use karta hai aur token valid hai, phir raaste ka koi firewall. Batao ki aapne AP locations label kiye kyunki maps ko accurate AP placement chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NMSP location data ko Spaces tak le jaata hai; direct connect ko URL, token aur enable chahiye.</li>
<li>Service tabhi Active hai jab clock synchronised, DNS aur default route ho.</li>
<li>AP location text location service ko devices floor ke hisaab se place karne mein madad karta hai.</li>
<li>Analytics (footfall, dwell, heat maps, portals, assets) sirf concept hain.</li>
<li>Location data ko personal data maano: opt-in, notices, minimal retention.</li>
</ul></div>
`}};export{e as default};