var e={id:`troubleshooting`,h:{en:`Troubleshooting: no data, partial data, wrong data`,hi:`Troubleshooting: no data, partial data, wrong data`},body:{en:`
<p><b>One idea:</b> a telemetry pipeline has many stages, so "the graph is empty" could mean fifteen different things. The method is to follow the data from the device outward and find the <b>first stage where data is missing</b>. Do not start by changing things at random.</p>
<p>These commands are reference examples for the platforms named; the simulator does not run telemetry, so you cannot type them in the lab. Treat the checks as a checklist and learn what each result means.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="1 Config subscription exists to 2 State valid, receiver up to 3 Network route, port, TLS to 4 Collector listening, decoding to 5 Store database, query"><rect x="20" y="40" width="92" height="76" rx="10" fill="#fde68a"/><text x="66" y="74" text-anchor="middle" class="svg-ink" font-size="13">1 Config</text><text x="66" y="90" text-anchor="middle" class="svg-muted" font-size="12">subscription exists</text><line x1="112" y1="78" x2="142" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="146,78 138,73 138,83" fill="#64748b"/><rect x="146" y="40" width="92" height="76" rx="10" fill="#bae6fd"/><text x="192" y="74" text-anchor="middle" class="svg-ink" font-size="13">2 State</text><text x="192" y="90" text-anchor="middle" class="svg-muted" font-size="12">valid, receiver up</text><line x1="238" y1="78" x2="268" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="272,78 264,73 264,83" fill="#64748b"/><rect x="272" y="40" width="92" height="76" rx="10" fill="#fed7aa"/><text x="318" y="74" text-anchor="middle" class="svg-ink" font-size="13">3 Network</text><text x="318" y="90" text-anchor="middle" class="svg-muted" font-size="12">route, port, TLS</text><line x1="364" y1="78" x2="394" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="398,78 390,73 390,83" fill="#64748b"/><rect x="398" y="40" width="92" height="76" rx="10" fill="#bbf7d0"/><text x="444" y="74" text-anchor="middle" class="svg-ink" font-size="13">4 Collector</text><text x="444" y="90" text-anchor="middle" class="svg-muted" font-size="12">listening, decoding</text><line x1="490" y1="78" x2="520" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="524,78 516,73 516,83" fill="#64748b"/><rect x="524" y="40" width="92" height="76" rx="10" fill="#ddd6fe"/><text x="570" y="74" text-anchor="middle" class="svg-ink" font-size="13">5 Store</text><text x="570" y="90" text-anchor="middle" class="svg-muted" font-size="12">database, query</text></svg><p class="cap">Follow the data outward. The first stage with no data is where the fault is.</p></div>
<h3>Step 1 and 2: the device</h3>
<pre class="code"><span class="c">! Reference code (not run in the simulator)</span>
show telemetry ietf subscription all
show telemetry ietf subscription 101 detail
show telemetry ietf subscription 101 receiver
show clock
ping 198.51.100.20 source 192.0.2.10
show running-config | section telemetry</pre>
<ul><li>Is the subscription present, and is its <b>state valid</b>? An invalid state usually means a bad XPath, an unsupported path, or an unsupported combination such as on-change on a path that cannot do it.</li><li>Is the <b>receiver connected</b>? A receiver stuck in a connecting state means the device cannot reach the collector: route, firewall, wrong port, wrong VRF or source address, or a TLS failure.</li><li><code>show clock</code> and NTP: if device time is far off, timestamps are wrong and a TLS certificate may look expired or not yet valid.</li><li>Does the <code>ping</code> use the same <code>source</code> address as the subscription? A firewall rule that allows 192.0.2.10 does not help if the device sends from another address.</li></ul>
<p>On IOS XR the same questions are answered by the <code>show telemetry model-driven</code> family:</p>
<pre class="code"><span class="c">! Reference code (not run in the simulator)</span>
show telemetry model-driven subscription
show telemetry model-driven destination
show telemetry model-driven sensor-group
show telemetry model-driven trace</pre>
<h3>Step 3 and 4: network and collector</h3>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
ss -ltn | grep 57000
sudo tcpdump -ni any port 57000 -c 20
sudo journalctl -u telegraf --since "10 minutes ago"</pre>
<ul><li><code>ss -ltn</code> lists listening TCP ports on the collector. If port 57000 is not listed, the collector is not running or listens on another port.</li><li><code>tcpdump</code> shows whether packets arrive. If the device sends and nothing arrives, a firewall or route is dropping them. If packets arrive but no data appears, look at decoding.</li><li>The collector log shows decode errors, TLS handshake failures and "unknown field" messages. Compact GPB without the right .proto file is a common decode failure; kvGPB or JSON avoids it.</li><li>Matching encodings and ports: the device says kvGPB on 57000, so the collector must expect kvGPB on 57000.</li></ul>
<h3>Step 5: store and show</h3>
<ul><li>Query the database directly. If the data is there but the panel is empty, the dashboard query, time range, label filter or unit is wrong.</li><li>If only some devices appear, compare tag values. A device whose hostname changed shows up as a new series, and old panels keep filtering by the old name.</li><li>Gaps in the graph usually mean lost messages, a collector overload, or clock errors.</li></ul>
<h3>Detecting silence automatically</h3>
<p>The best troubleshooting is an alert that tells you a device went quiet. The code below uses made-up ages (seconds since data last arrived) and flags any device silent for three intervals. <code>sorted(last_seen.items())</code> turns the dictionary into a list of (device, age) pairs in alphabetical order.</p>
<pre class="code"><span class="c"># Teaching data (made up): seconds since the collector last heard from each device</span>
last_seen = {"R1": 8, "R2": 12, "R3": 640, "R4": 9, "R5": 4000}

INTERVAL = 60                      # the subscription interval in seconds
LIMIT = INTERVAL * 3               # silent for 3 intervals counts as stale

for device, age in sorted(last_seen.items()):
    state = "STALE" if age &gt; LIMIT else "ok"
    print(f"{device:&lt;4} last data {age:&gt;5} s ago  {state}")</pre>
<pre class="out">R1   last data     8 s ago  ok
R2   last data    12 s ago  ok
R3   last data   640 s ago  STALE
R4   last data     9 s ago  ok
R5   last data  4000 s ago  STALE</pre>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>First check</th></tr><tr><td>No data from any device</td><td>Collector down, port or database</td><td>ss -ltn and collector log</td></tr><tr><td>No data from one device</td><td>Subscription invalid or receiver down</td><td>show telemetry ... subscription</td></tr><tr><td>Data arrives then stops</td><td>Connection reset, TLS expiry, collector restart</td><td>Receiver state and certificate dates</td></tr><tr><td>Numbers look wrong</td><td>Wrong unit, wrap, wrong path</td><td>Compare with show interfaces</td></tr></table>
<div class="warn"><p><b>Common mistake.</b> Opening the firewall wide ("any to any") to make telemetry work. Allow only the device addresses to the collector port, and keep the collector in a management network.</p></div>
<div class="exam"><p><b>Exam trap.</b> The order matters: configuration, subscription state, receiver connection, network path, collector listener and decoding, database and query. Be able to say what an invalid subscription state and a stuck connecting receiver each point to.</p></div>
<div class="eg"><p><b>Worked example.</b> The device config said port 57000, the collector listened on 57500, and the receiver stayed in a connecting state. Changing one number made data flow. The logs on the collector had never recorded a connection at all, which was the clue: nothing reached it.</p></div>
<div class="scn"><h4>Telemetry stopped at midnight on the 30th</h4><p>Data from 60 routers stopped at the same minute. The collector was fine and packets arrived, but the handshake failed. The collector's TLS certificate had expired. The team renewed it, added a certificate-expiry alert 30 days ahead, and added the missing-data alert so the next silence is caught in minutes.</p><p><b>Lesson:</b> Everything with a certificate needs an expiry alert.</p></div>
<div class="iv"><p class="q">"Telemetry data from one router stopped appearing on the dashboard. Walk me through your checks."</p><p>I follow the data outward. First the router: is the subscription present and valid, is the receiver connected, and is the clock right? Then the path: can the router reach the collector from the right source address and port, and is TLS fine? Then the collector: is it listening, and does the log show decode or handshake errors? Finally the database and the dashboard query. The first stage where data is missing is the fault.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Follow the data from the device outward; the first stage without data is the fault.</li><li>Device checks: subscription valid, receiver connected, clock correct, source address right.</li><li>Collector checks: listening port, packets arriving, decode and TLS errors.</li><li>Matching ports and encodings on both ends are the most common fix.</li><li>Alert on silence and on certificate expiry.</li></ul></div>
`,hi:`
<p><b>Ek idea:</b> telemetry pipeline mein kai stages hote hain, isliye "graph khaali hai" ke pandrah matlab ho sakte hain. Tareeka hai data ko device se bahar ki taraf follow karna aur <b>pehla stage dhoondhna jahan data gayab hai</b>. Random cheezein badalna shuru mat karo.</p>
<p>Yeh commands unhi platforms ke reference examples hain; simulator telemetry nahi chalata, isliye aap inhe lab mein type nahi kar sakte. Checks ko checklist samjho aur seekho ki har result ka matlab kya hai.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="1 Config subscription hai to 2 State valid, receiver up to 3 Network route, port, TLS to 4 Collector sun raha, decode to 5 Store database, query"><rect x="20" y="40" width="92" height="76" rx="10" fill="#fde68a"/><text x="66" y="74" text-anchor="middle" class="svg-ink" font-size="13">1 Config</text><text x="66" y="90" text-anchor="middle" class="svg-muted" font-size="12">subscription hai</text><line x1="112" y1="78" x2="142" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="146,78 138,73 138,83" fill="#64748b"/><rect x="146" y="40" width="92" height="76" rx="10" fill="#bae6fd"/><text x="192" y="74" text-anchor="middle" class="svg-ink" font-size="13">2 State</text><text x="192" y="90" text-anchor="middle" class="svg-muted" font-size="12">valid, receiver up</text><line x1="238" y1="78" x2="268" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="272,78 264,73 264,83" fill="#64748b"/><rect x="272" y="40" width="92" height="76" rx="10" fill="#fed7aa"/><text x="318" y="74" text-anchor="middle" class="svg-ink" font-size="13">3 Network</text><text x="318" y="90" text-anchor="middle" class="svg-muted" font-size="12">route, port, TLS</text><line x1="364" y1="78" x2="394" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="398,78 390,73 390,83" fill="#64748b"/><rect x="398" y="40" width="92" height="76" rx="10" fill="#bbf7d0"/><text x="444" y="74" text-anchor="middle" class="svg-ink" font-size="13">4 Collector</text><text x="444" y="90" text-anchor="middle" class="svg-muted" font-size="12">sun raha, decode</text><line x1="490" y1="78" x2="520" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="524,78 516,73 516,83" fill="#64748b"/><rect x="524" y="40" width="92" height="76" rx="10" fill="#ddd6fe"/><text x="570" y="74" text-anchor="middle" class="svg-ink" font-size="13">5 Store</text><text x="570" y="90" text-anchor="middle" class="svg-muted" font-size="12">database, query</text></svg><p class="cap">Data ko bahar ki taraf follow karo. Jis pehle stage mein data nahi hai wahin fault hai.</p></div>
<h3>Step 1 aur 2: device</h3>
<pre class="code"><span class="c">! Reference code (not run in the simulator)</span>
show telemetry ietf subscription all
show telemetry ietf subscription 101 detail
show telemetry ietf subscription 101 receiver
show clock
ping 198.51.100.20 source 192.0.2.10
show running-config | section telemetry</pre>
<ul><li>Kya subscription maujood hai, aur uski <b>state valid</b> hai? Invalid state ka matlab aam taur par galat XPath, unsupported path, ya unsupported combination jaise on-change aise path par jo support nahi karta.</li><li>Kya <b>receiver connected</b> hai? Connecting state mein atka receiver matlab device collector tak nahi pahunch pa raha: route, firewall, galat port, galat VRF ya source address, ya TLS failure.</li><li><code>show clock</code> aur NTP: device time bahut alag ho to timestamps galat hote hain aur TLS certificate expired ya abhi valid nahi dikh sakta.</li><li>Kya <code>ping</code> wahi <code>source</code> address use karta hai jo subscription? Firewall rule jo 192.0.2.10 allow karta hai woh madad nahi karta agar device kisi aur address se bhejta hai.</li></ul>
<p>IOS XR par wahi sawaal <code>show telemetry model-driven</code> family se answer hote hain:</p>
<pre class="code"><span class="c">! Reference code (not run in the simulator)</span>
show telemetry model-driven subscription
show telemetry model-driven destination
show telemetry model-driven sensor-group
show telemetry model-driven trace</pre>
<h3>Step 3 aur 4: network aur collector</h3>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
ss -ltn | grep 57000
sudo tcpdump -ni any port 57000 -c 20
sudo journalctl -u telegraf --since "10 minutes ago"</pre>
<ul><li><code>ss -ltn</code> collector par listening TCP ports list karta hai. Port 57000 list nahi hai to collector chal nahi raha ya kisi aur port par sun raha hai.</li><li><code>tcpdump</code> dikhata hai ki packets aa rahe hain ya nahi. Device bhej raha hai aur kuch nahi aa raha to firewall ya route drop kar raha hai. Packets aa rahe hain par data nahi dikh raha to decoding dekho.</li><li>Collector log decode errors, TLS handshake failures aur "unknown field" messages dikhata hai. Sahi .proto file ke bina compact GPB aam decode failure hai; kvGPB ya JSON isse bachata hai.</li><li>Encodings aur ports match karo: device 57000 par kvGPB bolta hai, to collector ko 57000 par kvGPB expect karna chahiye.</li></ul>
<h3>Step 5: store aur show</h3>
<ul><li>Database ko seedha query karo. Data wahan hai lekin panel khaali hai to dashboard query, time range, label filter ya unit galat hai.</li><li>Sirf kuch devices dikh rahe hain to tag values compare karo. Jis device ka hostname badla woh nayi series ki tarah dikhta hai, aur purane panels purane naam se filter karte rehte hain.</li><li>Graph mein gaps aam taur par lost messages, collector overload ya clock errors ka matlab hote hain.</li></ul>
<h3>Silence ko automatically pakadna</h3>
<p>Sabse achha troubleshooting woh alert hai jo batata hai ki device chup ho gaya. Neeche ka code made-up ages (data aakhri baar aane ke baad ke seconds) use karta hai aur teen intervals se chup device ko flag karta hai. <code>sorted(last_seen.items())</code> dictionary ko (device, age) pairs ki list mein alphabetical order mein badalta hai.</p>
<pre class="code"><span class="c"># Teaching data (made up): seconds since the collector last heard from each device</span>
last_seen = {"R1": 8, "R2": 12, "R3": 640, "R4": 9, "R5": 4000}

INTERVAL = 60                      # the subscription interval in seconds
LIMIT = INTERVAL * 3               # silent for 3 intervals counts as stale

for device, age in sorted(last_seen.items()):
    state = "STALE" if age &gt; LIMIT else "ok"
    print(f"{device:&lt;4} last data {age:&gt;5} s ago  {state}")</pre>
<pre class="out">R1   last data     8 s ago  ok
R2   last data    12 s ago  ok
R3   last data   640 s ago  STALE
R4   last data     9 s ago  ok
R5   last data  4000 s ago  STALE</pre>
<table class="cmp"><tr><th>Symptom</th><th>Sambhavit wajah</th><th>Pehla check</th></tr><tr><td>Kisi device se data nahi</td><td>Collector down, port ya database</td><td>ss -ltn aur collector log</td></tr><tr><td>Ek device se data nahi</td><td>Subscription invalid ya receiver down</td><td>show telemetry ... subscription</td></tr><tr><td>Data aata hai phir ruk jaata hai</td><td>Connection reset, TLS expiry, collector restart</td><td>Receiver state aur certificate dates</td></tr><tr><td>Numbers galat dikhte hain</td><td>Galat unit, wrap, galat path</td><td>show interfaces se compare karo</td></tr></table>
<div class="warn"><p><b>Aam galti.</b> Telemetry chalane ke liye firewall poora khol dena ("any to any"). Sirf device addresses ko collector port tak allow karo, aur collector ko management network mein rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Order matter karta hai: configuration, subscription state, receiver connection, network path, collector listener aur decoding, database aur query. Bata sako ki invalid subscription state aur atka connecting receiver har ek kis taraf ishara karta hai.</p></div>
<div class="eg"><p><b>Worked example.</b> Device config mein port 57000 tha, collector 57500 par sun raha tha, aur receiver connecting state mein atka raha. Ek number badalne se data aane laga. Collector ke logs mein connection ka record hi nahi tha, yahi clue tha: kuch pahuncha hi nahi.</p></div>
<div class="scn"><h4>Telemetry mahine ki 30 tareekh raat ko ruk gayi</h4><p>60 routers ka data ek hi minute par ruk gaya. Collector theek tha aur packets aa rahe the, lekin handshake fail ho raha tha. Collector ka TLS certificate expire ho gaya tha. Team ne use renew kiya, 30 din pehle certificate-expiry alert jodi, aur missing-data alert jodi taaki agli chuppi minuton mein pakdi jaaye.</p><p><b>Lesson:</b> Jis cheez mein certificate hai uski expiry alert honi chahiye.</p></div>
<div class="iv"><p class="q">"Ek router ka telemetry data dashboard par aana band ho gaya. Apne checks batao."</p><p>Main data ko bahar ki taraf follow karta hoon. Pehle router: kya subscription maujood aur valid hai, kya receiver connected hai, aur kya clock sahi hai? Phir path: kya router sahi source address aur port se collector tak pahunch sakta hai, aur TLS theek hai? Phir collector: kya woh sun raha hai, aur log mein decode ya handshake errors hain? Aakhir mein database aur dashboard query. Jis pehle stage mein data gayab hai wahi fault hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Data ko device se bahar follow karo; jis pehle stage mein data nahi wahi fault hai.</li><li>Device checks: subscription valid, receiver connected, clock sahi, source address sahi.</li><li>Collector checks: listening port, packets aa rahe, decode aur TLS errors.</li><li>Dono ends par ports aur encodings match karna sabse aam fix hai.</li><li>Chuppi aur certificate expiry par alert karo.</li></ul></div>
`}};export{e as default};