var e={id:`access-tracker`,h:{en:`Evidence: Access Tracker, Event Viewer and the switch view`,hi:`Evidence: Access Tracker, Event Viewer aur switch view`},body:{en:`
<p>A good network engineer does not guess. He reads evidence. ClearPass gives you two main evidence tools, the <b>Access Tracker</b> and the <b>Event Viewer</b>, and the switch gives you a third view. Learning to read all three is what separates someone who clicks around from someone who fixes problems in minutes.</p>

<h3>Analogy: the visitor log, the gate CCTV and the guard's notebook</h3>
<p>If something went wrong at a building, you would check three things. The reception <b>visitor log</b> shows who came, which counter they used and what the decision was. The <b>CCTV at the gate</b> shows things that never reached reception, such as a stranger who left before signing. The <b>guard's notebook</b> shows what the guard actually did. Access Tracker is the visitor log, Event Viewer is the CCTV, and the switch client table is the guard's notebook.</p>

<h3>The Access Tracker</h3>
<p>Real GUI path: <b>Monitoring, Live Monitoring, Access Tracker</b>. Every request that reached a service creates one record. The list shows time, username, service, login status and the NAD. Opening a record gives four tabs:</p>
<table class="cmp"><tr><th>Tab</th><th>Question it answers</th></tr>
<tr><td><b>Summary</b></td><td>Which service handled it, which methods and sources ran, which roles and which profile resulted, and the final result</td></tr>
<tr><td><b>Input</b></td><td>The attributes of the request: NAS-IP-Address, NAS-Port-Type, Service-Type, User-Name, Calling-Station-Id (MAC address) and the authentication data</td></tr>
<tr><td><b>Output</b></td><td>The attributes ClearPass returned: for example Aruba-User-Role and any tunnel attributes</td></tr>
<tr><td><b>Alerts</b></td><td>Error codes and messages, such as 9002 or 215</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Three evidence sources">
<rect x="10" y="30" width="190" height="110" rx="10" fill="#ddd6fe"/><text x="105" y="56" text-anchor="middle" class="svg-ink" font-size="13">Access Tracker</text><text x="105" y="80" text-anchor="middle" class="svg-muted" font-size="11">requests that reached</text><text x="105" y="96" text-anchor="middle" class="svg-muted" font-size="11">a service</text><text x="105" y="116" text-anchor="middle" class="svg-muted" font-size="11">Summary Input Output Alerts</text>
<rect x="225" y="30" width="190" height="110" rx="10" fill="#fde68a"/><text x="320" y="56" text-anchor="middle" class="svg-ink" font-size="13">Event Viewer</text><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="11">system events, dropped</text><text x="320" y="96" text-anchor="middle" class="svg-muted" font-size="11">requests, unknown NAD</text>
<rect x="440" y="30" width="190" height="110" rx="10" fill="#bbf7d0"/><text x="535" y="56" text-anchor="middle" class="svg-ink" font-size="13">Switch view</text><text x="535" y="80" text-anchor="middle" class="svg-muted" font-size="11">show port-access clients</text><text x="535" y="96" text-anchor="middle" class="svg-muted" font-size="11">show radius-server</text>
<text x="320" y="180" text-anchor="middle" class="svg-accent" font-size="13">No record in the tracker? Look at the Event Viewer next.</text>
</svg><p class="cap">Three views; each one answers a different question.</p></div>

<h3>Reading a record (Lab shell)</h3>
<pre class="code">monitoring access-tracker
monitoring access-tracker detail latest summary
monitoring access-tracker detail latest input
monitoring access-tracker detail latest output
monitoring access-tracker detail latest alerts
monitoring access-tracker detail alice alerts</pre>
<pre class="out">Access Tracker (2 records)
Time      Username  Device   Service        Result
10:12:40  bob       ACCESS   Wired 802.1X   <span class="hl">REJECT</span>
10:09:03  alice     ACCESS   Wired 802.1X   ACCEPT

Summary for latest:
  Service        : Wired 802.1X
  Auth method    : [EAP PEAP]   Source: [Local User Repository]
  Enforcement    : EPOL-WIRED  -&gt;  [Deny Access Profile]
Alerts:
  <span class="hl">Default profile applied: no rule matched</span></pre>
<p>Notice how much this teaches in a few seconds. The service matched (so station 2 is fine), the user was found (station 3 is fine), and the enforcement policy used its default, so the next step is to read the policy rules.</p>

<h3>Which tab for which problem?</h3>
<ul>
<li><b>Nothing in the list:</b> the request never got past the NAD check. Go to the Event Viewer.</li>
<li><b>Service column empty with 9002:</b> compare the Input tab values with the service rules.</li>
<li><b>Wrong service listed:</b> the Summary tab shows which service won; check the service order.</li>
<li><b>Accepted but the port is wrong:</b> read the Output tab and compare the role name with the switch.</li>
<li><b>Rejected with 215, 216 or 217:</b> read Alerts and fix the identity source.</li>
</ul>

<h3>The Event Viewer</h3>
<p>Real GUI path: <b>Monitoring, Event Viewer</b>. It lists system events such as service restarts and, important for us, messages about RADIUS requests that were dropped before processing.</p>
<pre class="code">monitoring event-viewer</pre>
<pre class="out">Event Viewer
10:03:51  WARN  RADIUS  <span class="hl">Request from unknown device 10.20.99.2 dropped</span>
10:04:22  WARN  RADIUS  Shared secret mismatch for device ACCESS, request dropped</pre>

<h3>The switch view</h3>
<pre class="code">show port-access clients
show port-access clients detail
show radius-server</pre>
<p>The first two show each client, its method, role and VLAN. The third shows whether the switch considers the RADIUS server reachable. Together with the tracker they let you see both ends of one conversation.</p>

<h3>A word about Change of Authorization (concept preview)</h3>
<p>Enforcement runs at login. If you change a policy while a user is already connected, nothing happens until the session authenticates again. <b>CoA and Disconnect</b> (RFC 5176, UDP 3799) allow ClearPass to tell the switch to re-evaluate or drop a live session. It needs the NAD CoA setting on ClearPass and a dynamic-authorization client entry on the switch with the same secret. Module 4 covers it with a lab.</p>

<div class="eg"><p><b>Worked example.</b> Alice complains at 10:30. You open the Access Tracker, filter on alice and find an ACCEPT at 10:29 with Output Aruba-User-Role EMPLOYEE. On the switch the client is authenticated in VLAN 10 but has no IPv4 address. Evidence says authentication is fine; the problem is DHCP or the trunk. You just saved an hour of looking at policies.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Looking only at the Access Tracker when the problem is a dropped request. Reading the newest record when the user's failing attempt is older. Closing the ticket without checking the switch. Not noting the exact alert code in the ticket.</p></div>

<div class="exam"><p><b>Exam trap.</b> An unknown NAD or a wrong secret leaves <b>no</b> Access Tracker record, because no service was ever evaluated. The evidence is in the Event Viewer and on the switch (the RADIUS server marked dead).</p></div>

<div class="scn"><h4>Silent drop, loud complaints</h4><p>After a switch replacement, a whole floor had no network. The Access Tracker was empty and the first engineer assumed ClearPass was broken. A second engineer opened the Event Viewer and found repeated messages about a shared secret mismatch for the new switch. A one-line secret correction on the network device brought everyone online.</p><p><b>Lesson:</b> empty tracker means look before the services, in the Event Viewer.</p></div>

<div class="iv"><p class="q">"Where in ClearPass do you start when a user says they cannot connect?"</p><p>Strong answer: the Access Tracker, filtered on the username or MAC address. If there is no record, the Event Viewer and the switch RADIUS status. If there is a record, read Summary for the service, Input for what was sent, Alerts for the failure code and Output for what was returned. Then confirm on the switch with show port-access clients.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Access Tracker records every request that reached a service; tabs are Summary, Input, Output, Alerts.</li>
<li>Event Viewer holds dropped requests and system events; no tracker record means start there.</li>
<li>The switch shows the enforcement result: show port-access clients and show radius-server.</li>
<li>Read Output to see what ClearPass returned, Input to see what the switch sent.</li>
<li>CoA is a real feature with its own lab in a later module.</li>
</ul></div>
`,hi:`
<p>Achha network engineer guess nahi karta. Woh evidence padhta hai. ClearPass do main evidence tools deta hai, <b>Access Tracker</b> aur <b>Event Viewer</b>, aur switch teesra view deta hai. Teeno padhna seekhna wahi cheez hai jo click-click karne wale ko minutes mein problem fix karne wale se alag karti hai.</p>

<h3>Analogy: visitor log, gate CCTV aur guard ki notebook</h3>
<p>Agar building mein kuch galat ho jaye to aap teen cheezein check karoge. Reception ka <b>visitor log</b> batata hai kaun aaya, kaunsa counter use kiya aur decision kya tha. <b>Gate ka CCTV</b> woh cheezein dikhata hai jo reception tak pahunchi hi nahi, jaise ajnabi jo sign kiye bina chala gaya. <b>Guard ki notebook</b> dikhati hai ki guard ne asal mein kya kiya. Access Tracker visitor log hai, Event Viewer CCTV hai, aur switch client table guard ki notebook hai.</p>

<h3>Access Tracker</h3>
<p>Real GUI path: <b>Monitoring, Live Monitoring, Access Tracker</b>. Jo bhi request kisi service tak pahunchi, uska ek record banta hai. List mein time, username, service, login status aur NAD dikhte hain. Record kholne par chaar tabs milte hain:</p>
<table class="cmp"><tr><th>Tab</th><th>Kaunsa sawaal answer karta hai</th></tr>
<tr><td><b>Summary</b></td><td>Kaunsi service ne handle kiya, kaunse methods aur sources chale, kaunse roles aur kaunsa profile aaya, aur final result</td></tr>
<tr><td><b>Input</b></td><td>Request ke attributes: NAS-IP-Address, NAS-Port-Type, Service-Type, User-Name, Calling-Station-Id (MAC address) aur authentication data</td></tr>
<tr><td><b>Output</b></td><td>ClearPass ne jo attributes return kiye: jaise Aruba-User-Role aur koi tunnel attributes</td></tr>
<tr><td><b>Alerts</b></td><td>Error codes aur messages, jaise 9002 ya 215</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Teen evidence sources">
<rect x="10" y="30" width="190" height="110" rx="10" fill="#ddd6fe"/><text x="105" y="56" text-anchor="middle" class="svg-ink" font-size="13">Access Tracker</text><text x="105" y="80" text-anchor="middle" class="svg-muted" font-size="11">jo requests service</text><text x="105" y="96" text-anchor="middle" class="svg-muted" font-size="11">tak pahunchi</text><text x="105" y="116" text-anchor="middle" class="svg-muted" font-size="11">Summary Input Output Alerts</text>
<rect x="225" y="30" width="190" height="110" rx="10" fill="#fde68a"/><text x="320" y="56" text-anchor="middle" class="svg-ink" font-size="13">Event Viewer</text><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="11">system events, dropped</text><text x="320" y="96" text-anchor="middle" class="svg-muted" font-size="11">requests, unknown NAD</text>
<rect x="440" y="30" width="190" height="110" rx="10" fill="#bbf7d0"/><text x="535" y="56" text-anchor="middle" class="svg-ink" font-size="13">Switch view</text><text x="535" y="80" text-anchor="middle" class="svg-muted" font-size="11">show port-access clients</text><text x="535" y="96" text-anchor="middle" class="svg-muted" font-size="11">show radius-server</text>
<text x="320" y="180" text-anchor="middle" class="svg-accent" font-size="13">Tracker mein record nahi? Agla Event Viewer dekho.</text>
</svg><p class="cap">Teen views; har ek alag sawaal ka jawab deta hai.</p></div>

<h3>Record padhna (Lab shell)</h3>
<pre class="code">monitoring access-tracker
monitoring access-tracker detail latest summary
monitoring access-tracker detail latest input
monitoring access-tracker detail latest output
monitoring access-tracker detail latest alerts
monitoring access-tracker detail alice alerts</pre>
<pre class="out">Access Tracker (2 records)
Time      Username  Device   Service        Result
10:12:40  bob       ACCESS   Wired 802.1X   <span class="hl">REJECT</span>
10:09:03  alice     ACCESS   Wired 802.1X   ACCEPT

Summary for latest:
  Service        : Wired 802.1X
  Auth method    : [EAP PEAP]   Source: [Local User Repository]
  Enforcement    : EPOL-WIRED  -&gt;  [Deny Access Profile]
Alerts:
  <span class="hl">Default profile applied: no rule matched</span></pre>
<p>Dekho kuch second mein kitna seekhne ko milta hai. Service match hui (station 2 theek hai), user mila (station 3 theek hai), aur enforcement policy ne default use kiya, to agla step policy rules padhna hai.</p>

<h3>Kaunsi problem ke liye kaunsa tab?</h3>
<ul>
<li><b>List mein kuch nahi:</b> request NAD check se aage gayi hi nahi. Event Viewer par jao.</li>
<li><b>Service column khaali, 9002:</b> Input tab ki values ko service rules se compare karo.</li>
<li><b>Galat service listed:</b> Summary tab dikhata hai kaunsi service jeeti; service order check karo.</li>
<li><b>Accepted par port galat:</b> Output tab padho aur role naam ko switch se compare karo.</li>
<li><b>215, 216 ya 217 se rejected:</b> Alerts padho aur identity source fix karo.</li>
</ul>

<h3>Event Viewer</h3>
<p>Real GUI path: <b>Monitoring, Event Viewer</b>. Yeh service restarts jaise system events list karta hai aur, hamare liye important, un RADIUS requests ke messages jo processing se pehle drop ho gayi.</p>
<pre class="code">monitoring event-viewer</pre>
<pre class="out">Event Viewer
10:03:51  WARN  RADIUS  <span class="hl">Request from unknown device 10.20.99.2 dropped</span>
10:04:22  WARN  RADIUS  Shared secret mismatch for device ACCESS, request dropped</pre>

<h3>Switch view</h3>
<pre class="code">show port-access clients
show port-access clients detail
show radius-server</pre>
<p>Pehle do har client, uska method, role aur VLAN dikhate hain. Teesra dikhata hai ki switch RADIUS server ko reachable maanta hai ya nahi. Tracker ke saath milkar yeh ek hi baatcheet ke dono sire dikhate hain.</p>

<h3>Change of Authorization ke baare mein ek baat (concept preview)</h3>
<p>Enforcement login par chalta hai. Agar user already connected ho aur aap policy badlo, to jab tak session dobara authenticate na ho kuch nahi hota. <b>CoA aur Disconnect</b> (RFC 5176, UDP 3799) ClearPass ko switch se kehne dete hain ki live session re-evaluate kare ya drop kare. Isme ClearPass par NAD CoA setting aur switch par same secret ke saath dynamic-authorization client entry chahiye. Module 4 ise lab ke saath cover karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Alice 10:30 par shikayat karti hai. Aap Access Tracker kholte ho, alice par filter karte ho aur 10:29 par ACCEPT dekhte ho jisme Output Aruba-User-Role EMPLOYEE hai. Switch par client VLAN 10 mein authenticated hai par IPv4 address nahi hai. Evidence kehta hai authentication theek hai; problem DHCP ya trunk hai. Aapne policies dekhne mein lagne wala ghanta bacha liya.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Sirf Access Tracker dekhna jab problem dropped request hai. Sabse naya record padhna jab user ki failing attempt purani hai. Switch check kiye bina ticket close karna. Ticket mein exact alert code note na karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Unknown NAD ya wrong secret ka <b>koi</b> Access Tracker record nahi banta, kyunki koi service evaluate hui hi nahi. Evidence Event Viewer mein aur switch par hai (RADIUS server dead mark).</p></div>

<div class="scn"><h4>Silent drop, loud complaints</h4><p>Switch replacement ke baad poori floor ka network chala gaya. Access Tracker khaali tha aur pehle engineer ne maan liya ki ClearPass toota hai. Doosre engineer ne Event Viewer khola aur naye switch ke liye shared secret mismatch ke baar baar messages paye. Network device par ek line ka secret correction sabko wapas online le aaya.</p><p><b>Seekh:</b> tracker khaali hai to services se pehle dekho, Event Viewer mein.</p></div>

<div class="iv"><p class="q">"User kahe ki woh connect nahi kar pa raha, to ClearPass mein aap kahan se shuru karte ho?"</p><p>Strong answer: Access Tracker, username ya MAC address par filter karke. Record nahi hai to Event Viewer aur switch ka RADIUS status. Record hai to Summary mein service, Input mein kya bheja gaya, Alerts mein failure code aur Output mein kya return hua padho. Phir switch par show port-access clients se confirm karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Access Tracker har us request ko record karta hai jo service tak pahunchi; tabs Summary, Input, Output, Alerts.</li>
<li>Event Viewer mein dropped requests aur system events hote hain; tracker record nahi hai to wahin se shuru karo.</li>
<li>Switch enforcement result dikhata hai: show port-access clients aur show radius-server.</li>
<li>Output mein dekho ClearPass ne kya return kiya, Input mein switch ne kya bheja.</li>
<li>CoA real feature hai jiska aage ke module mein apna lab hai.</li>
</ul></div>
`}};export{e as default};