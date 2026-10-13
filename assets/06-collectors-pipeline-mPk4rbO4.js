var e={id:`collectors-pipeline`,h:{en:`The pipeline: collector, database and dashboard`,hi:`Pipeline: collector, database aur dashboard`},body:{en:`
<p><b>One idea:</b> a device streams messages, but people read graphs. Between them sits a <b>pipeline</b> that receives, decodes, tidies, stores and displays the data. Knowing the job of each stage is what lets you find the broken stage when the graph is empty.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Receive gRPC listener to Decode GPB or JSON to fields to Shape tags, fields, rates to Store time-series DB to Show dashboard, alert"><rect x="20" y="40" width="92" height="76" rx="10" fill="#fde68a"/><text x="66" y="74" text-anchor="middle" class="svg-ink" font-size="13">Receive</text><text x="66" y="90" text-anchor="middle" class="svg-muted" font-size="12">gRPC listener</text><line x1="112" y1="78" x2="142" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="146,78 138,73 138,83" fill="#64748b"/><rect x="146" y="40" width="92" height="76" rx="10" fill="#bae6fd"/><text x="192" y="74" text-anchor="middle" class="svg-ink" font-size="13">Decode</text><text x="192" y="90" text-anchor="middle" class="svg-muted" font-size="12">GPB or JSON to fields</text><line x1="238" y1="78" x2="268" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="272,78 264,73 264,83" fill="#64748b"/><rect x="272" y="40" width="92" height="76" rx="10" fill="#fed7aa"/><text x="318" y="74" text-anchor="middle" class="svg-ink" font-size="13">Shape</text><text x="318" y="90" text-anchor="middle" class="svg-muted" font-size="12">tags, fields, rates</text><line x1="364" y1="78" x2="394" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="398,78 390,73 390,83" fill="#64748b"/><rect x="398" y="40" width="92" height="76" rx="10" fill="#bbf7d0"/><text x="444" y="74" text-anchor="middle" class="svg-ink" font-size="13">Store</text><text x="444" y="90" text-anchor="middle" class="svg-muted" font-size="12">time-series DB</text><line x1="490" y1="78" x2="520" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="524,78 516,73 516,83" fill="#64748b"/><rect x="524" y="40" width="92" height="76" rx="10" fill="#ddd6fe"/><text x="570" y="74" text-anchor="middle" class="svg-ink" font-size="13">Show</text><text x="570" y="90" text-anchor="middle" class="svg-muted" font-size="12">dashboard, alert</text></svg><p class="cap">Five jobs in the pipeline. One program can do several of them, but each job can fail on its own.</p></div>
<h3>The roles</h3>
<ul><li><b>Collector.</b> The program that listens for dial-out connections (or opens dial-in sessions), decodes the messages and passes values on. Telegraf, the OpenTelemetry Collector and several commercial tools do this. At large scale a message bus such as Kafka sits in the middle to absorb bursts.</li><li><b>Time-series database (TSDB).</b> Storage built for values with timestamps: Prometheus, InfluxDB and similar. It compresses data and answers questions like "average over the last hour".</li><li><b>Dashboard.</b> Grafana is the common choice. It queries the database and draws panels.</li><li><b>Alert manager.</b> Evaluates rules against the data and notifies people (next chapter).</li></ul>
<h3>Reference: a tiny collector configuration</h3>
<p>The next two blocks are written in the style of Telegraf and Prometheus. They are examples for reading, not something the simulator runs. Telegraf has an input plugin that accepts Cisco model-driven telemetry over gRPC, and an output that exposes the values on a port for Prometheus to collect.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
[[inputs.cisco_telemetry_mdt]]
  transport = "grpc"
  service_address = ":57000"

[[outputs.prometheus_client]]
  listen = ":9273"</pre>
<p>The input listens on port 57000, the same port the device's <code>receiver</code> line named in chapter 4. If these two numbers differ, nothing arrives. The output makes the values available on port 9273.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
scrape_configs:
  - job_name: "network-telemetry"
    scrape_interval: 15s
    static_configs:
      - targets: ["collector.example:9273"]</pre>
<p>Prometheus <b>scrapes</b> (polls!) the collector every 15 seconds. Do not be confused: the <i>network</i> side is push, while Prometheus pulls from the collector. That is a normal design choice, because the collector is one well-known machine.</p>
<h3>Shaping the data: tags, fields and rates</h3>
<p>A TSDB stores each value with <b>tags</b> (labels that identify the series, such as device and interface) and <b>fields</b> or the value itself. The collector must pick sensible tags. The code below turns raw counter updates into rates and tags them by device and interface. It uses made-up data, and it uses a dictionary named <code>last</code> to remember the previous reading for each series.</p>
<pre class="code"><span class="c"># Teaching data (made up): decoded updates from two devices, 10 seconds apart</span>
updates = [
    {"device": "R1", "interface": "Gi1", "time": 1000, "in_octets": 5_000_000},
    {"device": "R1", "interface": "Gi1", "time": 1010, "in_octets": 5_625_000},
    {"device": "R2", "interface": "Gi1", "time": 1000, "in_octets": 9_000_000},
    {"device": "R2", "interface": "Gi1", "time": 1010, "in_octets": 9_000_500},
]

last = {}                                    # remembers the previous reading per device and interface
points = []
for u in updates:
    key = (u["device"], u["interface"])      # the series identity: tags
    if key in last:
        before = last[key]
        rate = (u["in_octets"] - before["in_octets"]) * 8 / (u["time"] - before["time"])
        points.append({"device": key[0], "interface": key[1], "time": u["time"], "in_bps": rate})
    last[key] = u

for pt in points:
    print(pt)</pre>
<pre class="out">{'device': 'R1', 'interface': 'Gi1', 'time': 1010, 'in_bps': 500000.0}
{'device': 'R2', 'interface': 'Gi1', 'time': 1010, 'in_bps': 400.0}</pre>
<p>Check the maths: R1 received 625,000 more bytes in 10 seconds, which is 5,000,000 bits per second (5 Mbps). R2 received 500 more bytes, which is 400 bits per second. The tuple <code>(device, interface)</code> is the series identity; two different devices with the same interface name never get mixed up. The first update for each series produces no rate, because a rate needs two readings.</p>
<h3>Cardinality: the quiet cost</h3>
<p><b>Cardinality</b> is the number of distinct series. Each device times each interface times each metric is one series. A tag whose values keep changing (such as a session ID, or the full text of a message) creates a new series every time and can make the database slow or crash. Keep tags to stable, small sets: device, interface, site.</p>
<div class="warn"><p><b>Common mistake.</b> Ignoring time. If the device clock is wrong, points land at the wrong time or look "in the future" and graphs show gaps. Use NTP on devices and collectors and prefer the device timestamp from the message.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the stages and their jobs, that Prometheus <i>pulls</i> from the collector while devices <i>push</i> to it, and that high-cardinality tags are a scaling hazard.</p></div>
<div class="eg"><p><b>Worked example.</b> 200 devices, 48 interfaces, 6 counters give 57,600 series. If someone adds a tag such as <code>packet-id</code> with a new value in every message, the series count explodes and the database runs out of memory within hours.</p></div>
<div class="scn"><h4>The dashboard that ate the database</h4><p>A well-meaning engineer added the neighbour's full description text as a tag so panels could show friendly names. Descriptions contained timestamps, so every update made a new series. Memory climbed until the database restarted. The fix was to remove the tag, keep device and interface only, and add friendly names in the dashboard through a lookup.</p><p><b>Lesson:</b> Tags must be small, stable sets.</p></div>
<div class="iv"><p class="q">"Describe a telemetry pipeline from router to dashboard."</p><p>The router pushes YANG-modelled data over gRPC to a collector such as Telegraf. The collector decodes it and tags it by device and interface, then writes to or exposes it for a time-series database such as Prometheus or InfluxDB. Grafana queries the database for dashboards, and an alert manager evaluates rules and notifies on-call staff. At scale a message bus buffers bursts. I watch the collector's own health too.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Pipeline stages: receive, decode, shape, store, show.</li><li>Ports must match between the device receiver and the collector listener.</li><li>Rates need two readings; tag series by stable identities such as device and interface.</li><li>High cardinality is a hidden cost: avoid changing tag values.</li><li>Keep clocks in sync with NTP.</li></ul></div>
`,hi:`
<p><b>Ek idea:</b> device messages stream karta hai, lekin log graphs padhte hain. Dono ke beech ek <b>pipeline</b> hoti hai jo data receive, decode, tidy, store aur display karti hai. Har stage ka kaam jaanne se hi aap khaali graph par toota hua stage dhoondh sakte ho.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Receive gRPC listener to Decode GPB ya JSON se fields to Shape tags, fields, rates to Store time-series DB to Show dashboard, alert"><rect x="20" y="40" width="92" height="76" rx="10" fill="#fde68a"/><text x="66" y="74" text-anchor="middle" class="svg-ink" font-size="13">Receive</text><text x="66" y="90" text-anchor="middle" class="svg-muted" font-size="12">gRPC listener</text><line x1="112" y1="78" x2="142" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="146,78 138,73 138,83" fill="#64748b"/><rect x="146" y="40" width="92" height="76" rx="10" fill="#bae6fd"/><text x="192" y="74" text-anchor="middle" class="svg-ink" font-size="13">Decode</text><text x="192" y="90" text-anchor="middle" class="svg-muted" font-size="12">GPB ya JSON se fields</text><line x1="238" y1="78" x2="268" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="272,78 264,73 264,83" fill="#64748b"/><rect x="272" y="40" width="92" height="76" rx="10" fill="#fed7aa"/><text x="318" y="74" text-anchor="middle" class="svg-ink" font-size="13">Shape</text><text x="318" y="90" text-anchor="middle" class="svg-muted" font-size="12">tags, fields, rates</text><line x1="364" y1="78" x2="394" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="398,78 390,73 390,83" fill="#64748b"/><rect x="398" y="40" width="92" height="76" rx="10" fill="#bbf7d0"/><text x="444" y="74" text-anchor="middle" class="svg-ink" font-size="13">Store</text><text x="444" y="90" text-anchor="middle" class="svg-muted" font-size="12">time-series DB</text><line x1="490" y1="78" x2="520" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="524,78 516,73 516,83" fill="#64748b"/><rect x="524" y="40" width="92" height="76" rx="10" fill="#ddd6fe"/><text x="570" y="74" text-anchor="middle" class="svg-ink" font-size="13">Show</text><text x="570" y="90" text-anchor="middle" class="svg-muted" font-size="12">dashboard, alert</text></svg><p class="cap">Pipeline mein paanch kaam. Ek program kai kar sakta hai, lekin har kaam alag se fail ho sakta hai.</p></div>
<h3>Roles</h3>
<ul><li><b>Collector.</b> Woh program jo dial-out connections sunta hai (ya dial-in sessions kholta hai), messages decode karta hai aur values aage bhejta hai. Telegraf, OpenTelemetry Collector aur kai commercial tools yeh karte hain. Bade scale par Kafka jaisa message bus beech mein bursts absorb karta hai.</li><li><b>Time-series database (TSDB).</b> Timestamp wali values ke liye bana storage: Prometheus, InfluxDB aur aise. Yeh data compress karta hai aur "pichhle ghante ka average" jaise sawaal ka jawab deta hai.</li><li><b>Dashboard.</b> Grafana aam choice hai. Yeh database query karta hai aur panels draw karta hai.</li><li><b>Alert manager.</b> Data par rules evaluate karta hai aur logon ko notify karta hai (agla chapter).</li></ul>
<h3>Reference: ek chhoti collector configuration</h3>
<p>Agle do blocks Telegraf aur Prometheus ki style mein likhe hain. Yeh padhne ke examples hain, simulator inhe nahi chalata. Telegraf ka ek input plugin gRPC par Cisco model-driven telemetry accept karta hai, aur ek output jo values ko port par expose karta hai taaki Prometheus unhe collect kare.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
[[inputs.cisco_telemetry_mdt]]
  transport = "grpc"
  service_address = ":57000"

[[outputs.prometheus_client]]
  listen = ":9273"</pre>
<p>Input port 57000 par sunta hai, wahi port jo chapter 4 mein device ki <code>receiver</code> line ne naam diya tha. Agar yeh do numbers alag hain to kuch nahi aata. Output values ko port 9273 par available karata hai.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
scrape_configs:
  - job_name: "network-telemetry"
    scrape_interval: 15s
    static_configs:
      - targets: ["collector.example:9273"]</pre>
<p>Prometheus har 15 second mein collector ko <b>scrape</b> (poll!) karta hai. Confuse mat ho: <i>network</i> side push hai, jabki Prometheus collector se pull karta hai. Yeh normal design choice hai, kyunki collector ek jaani-pehchani machine hai.</p>
<h3>Data ko shape dena: tags, fields aur rates</h3>
<p>TSDB har value ko <b>tags</b> (labels jo series pehchante hain, jaise device aur interface) aur <b>fields</b> ya value ke saath store karta hai. Collector ko sahi tags chunne padte hain. Neeche ka code raw counter updates ko rates mein badalta hai aur unhe device tatha interface se tag karta hai. Yeh made-up data use karta hai, aur <code>last</code> naam ki dictionary se har series ki pichhli reading yaad rakhta hai.</p>
<pre class="code"><span class="c"># Teaching data (made up): decoded updates from two devices, 10 seconds apart</span>
updates = [
    {"device": "R1", "interface": "Gi1", "time": 1000, "in_octets": 5_000_000},
    {"device": "R1", "interface": "Gi1", "time": 1010, "in_octets": 5_625_000},
    {"device": "R2", "interface": "Gi1", "time": 1000, "in_octets": 9_000_000},
    {"device": "R2", "interface": "Gi1", "time": 1010, "in_octets": 9_000_500},
]

last = {}                                    # remembers the previous reading per device and interface
points = []
for u in updates:
    key = (u["device"], u["interface"])      # the series identity: tags
    if key in last:
        before = last[key]
        rate = (u["in_octets"] - before["in_octets"]) * 8 / (u["time"] - before["time"])
        points.append({"device": key[0], "interface": key[1], "time": u["time"], "in_bps": rate})
    last[key] = u

for pt in points:
    print(pt)</pre>
<pre class="out">{'device': 'R1', 'interface': 'Gi1', 'time': 1010, 'in_bps': 500000.0}
{'device': 'R2', 'interface': 'Gi1', 'time': 1010, 'in_bps': 400.0}</pre>
<p>Maths check karo: R1 ko 10 second mein 625,000 bytes zyada mile, jo 5,000,000 bits per second (5 Mbps) hai. R2 ko 500 bytes zyada mile, jo 400 bits per second hai. Tuple <code>(device, interface)</code> series ki identity hai; same interface naam wale do alag devices kabhi mix nahi hote. Har series ka pehla update koi rate nahi deta, kyunki rate ke liye do readings chahiye.</p>
<h3>Cardinality: chupi hui keemat</h3>
<p><b>Cardinality</b> alag-alag series ki sankhya hai. Har device guna har interface guna har metric ek series hai. Jis tag ki values badalti rehti hain (jaise session ID, ya message ka poora text) woh har baar nayi series banata hai aur database ko slow ya crash kar sakta hai. Tags ko stable, chhote sets tak rakho: device, interface, site.</p>
<div class="warn"><p><b>Aam galti.</b> Time ko ignore karna. Device clock galat ho to points galat time par aate hain ya "future mein" dikhte hain aur graphs mein gaps aate hain. Devices aur collectors par NTP use karo aur message ka device timestamp prefer karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Stages aur unke kaam jaano, ki Prometheus collector se <i>pull</i> karta hai jabki devices usko <i>push</i> karte hain, aur high-cardinality tags scaling ka khatra hain.</p></div>
<div class="eg"><p><b>Worked example.</b> 200 devices, 48 interfaces, 6 counters 57,600 series dete hain. Agar koi <code>packet-id</code> jaisa tag jodta hai jiski har message mein nayi value hoti hai, to series count phat jaati hai aur database ghanton mein memory khatam kar deta hai.</p></div>
<div class="scn"><h4>Dashboard jisne database kha liya</h4><p>Ek achhe irade wale engineer ne neighbour ka poora description text tag ke roop mein joda taaki panels mein friendly names dikhein. Descriptions mein timestamps the, isliye har update nayi series banata tha. Memory badhti gayi jab tak database restart nahi hua. Fix tha tag hatana, sirf device aur interface rakhna, aur friendly names dashboard mein lookup se jodna.</p><p><b>Lesson:</b> Tags chhote, stable sets hone chahiye.</p></div>
<div class="iv"><p class="q">"Router se dashboard tak telemetry pipeline describe karo."</p><p>Router YANG-modelled data gRPC par Telegraf jaise collector ko push karta hai. Collector use decode karke device aur interface se tag karta hai, phir Prometheus ya InfluxDB jaise time-series database mein likhta ya expose karta hai. Grafana dashboards ke liye database query karta hai, aur alert manager rules evaluate karke on-call staff ko notify karta hai. Bade scale par message bus bursts buffer karta hai. Main collector ki apni health bhi dekhta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Pipeline stages: receive, decode, shape, store, show.</li><li>Device receiver aur collector listener ke ports match hone chahiye.</li><li>Rates ke liye do readings chahiye; series ko device aur interface jaisi stable identities se tag karo.</li><li>High cardinality chhupi hui keemat hai: badalti tag values se bacho.</li><li>Clocks ko NTP se sync rakho.</li></ul></div>
`}};export{e as default};