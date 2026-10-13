var e={id:`telemetry`,h:{en:`Model-driven telemetry: dial-in, dial-out and gNMI`,hi:`Model-driven telemetry: dial-in, dial-out aur gNMI`},body:{en:`
<p>A worried parent can phone a teenager every ten minutes to ask "where are you?" That is <b>polling</b>: tiring for both sides, and anything that happens between calls is missed. Or the teenager's phone can share its location continuously, and send a message the moment something changes. That is <b>streaming telemetry</b>. Model-driven telemetry uses the same YANG paths you already know, but the device <b>pushes</b> the data instead of waiting to be asked.</p>

<h3>Why polling is not enough</h3>
<p>SNMP polling (and repeated RESTCONF GETs) typically runs every one to five minutes. A 30-second traffic burst or a flapping link can vanish between polls, the poller loads the device CPU with every request, and scaling to thousands of devices means thousands of queries. Telemetry streams structured data at a steady interval or on change, efficiently encoded, to a <b>collector</b>.</p>

<h3>The building blocks</h3>
<dl class="terms">
<dt>Subscription</dt><dd>What to send (a YANG XPath), how often, and in which encoding.</dd>
<dt>Periodic (cadence-based)</dt><dd>Send every N units; on IOS XE the period is in <b>centiseconds</b>, so 6000 = 60 seconds. Good for counters and CPU.</dd>
<dt>On-change</dt><dd>Send only when the value changes, plus an initial snapshot. Good for interface state or neighbour up/down.</dd>
<dt>Encoding</dt><dd>Compact <b>GPB</b> (protocol buffers, needs the schema to decode), self-describing <b>kvGPB</b> (key-value GPB, used by IOS XE <code>encode-kvgpb</code>), JSON, or XML for NETCONF.</dd>
<dt>Transport</dt><dd>gRPC over HTTP/2 (dial-out <code>grpc-tcp</code> or <code>grpc-tls</code>), NETCONF for dial-in yang-push, and gNMI.</dd>
</dl>

<h3>Dial-in versus dial-out</h3>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Dial-in and dial-out">
<text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="13">Dial-in (dynamic)</text>
<rect x="30" y="40" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="85" y="70" text-anchor="middle" class="svg-ink" font-size="12">Collector</text>
<rect x="190" y="40" width="110" height="50" rx="8" fill="#bae6fd"/><text x="245" y="70" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<line x1="140" y1="55" x2="190" y2="55" stroke="#64748b" stroke-width="2"/><text x="165" y="110" text-anchor="middle" class="svg-muted" font-size="11">1. collector connects, subscribes</text>
<line x1="190" y1="80" x2="140" y2="80" stroke="#64748b" stroke-dasharray="4 4"/><text x="165" y="128" text-anchor="middle" class="svg-muted" font-size="11">2. data flows back</text>
<text x="165" y="150" text-anchor="middle" class="svg-accent" font-size="11">ends with the session</text>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="13">Dial-out (configured)</text>
<rect x="350" y="40" width="110" height="50" rx="8" fill="#bae6fd"/><text x="405" y="70" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<rect x="510" y="40" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="565" y="70" text-anchor="middle" class="svg-ink" font-size="12">Receiver</text>
<line x1="460" y1="65" x2="510" y2="65" stroke="#64748b" stroke-width="2"/><text x="485" y="110" text-anchor="middle" class="svg-muted" font-size="11">R1 connects and pushes</text>
<text x="485" y="128" text-anchor="middle" class="svg-muted" font-size="11">config lives on R1</text>
<text x="485" y="150" text-anchor="middle" class="svg-accent" font-size="11">survives collector restarts</text>
<rect x="150" y="175" width="340" height="45" rx="8" fill="#fde68a"/><text x="320" y="202" text-anchor="middle" class="svg-ink" font-size="12">Telegraf -&gt; InfluxDB -&gt; Grafana (TIG stack)</text>
</svg><p class="cap">Who opens the connection decides the model. Both feed a collector and time-series database.</p></div>
<ul>
<li><b>Dial-in (dynamic)</b>: the collector connects to the device and creates the subscription over NETCONF (<code>establish-subscription</code>, yang-push) or gNMI <code>Subscribe</code>. Nothing is configured on the device; the subscription dies when the session closes.</li>
<li><b>Dial-out (configured)</b>: the subscription is in the device configuration and the <b>device</b> opens the connection to the receiver. It survives reloads of the collector and reconnects automatically; firewalls only need to allow device-to-collector.</li>
</ul>

<h3>A dial-out subscription on IOS XE</h3>
<pre class="code">R1(config)# telemetry ietf subscription 101
R1(config-mdt-subs)#  encoding encode-kvgpb
R1(config-mdt-subs)#  filter xpath /process-cpu-ios-xe-oper:cpu-usage/cpu-utilization/five-seconds
R1(config-mdt-subs)#  source-address 192.168.50.1
R1(config-mdt-subs)#  stream yang-push
R1(config-mdt-subs)#  update-policy periodic 6000         <span class="c">! centiseconds = 60 s</span>
R1(config-mdt-subs)#  receiver ip address 192.168.50.20 57500 protocol grpc-tcp</pre>
<p>Every line maps to a building block: the XPath comes from a YANG operational model (here Cisco-IOS-XE-process-cpu-oper), <code>update-policy</code> chooses periodic or <code>on-change</code>, and the receiver defines where and how to push. <code>netconf-yang</code> must be enabled because telemetry uses the same YANG infrastructure.</p>
<pre class="out">R1# show telemetry ietf subscription 101 receiver
Telemetry subscription receivers detail:

  Subscription ID: 101
  Address: 192.168.50.20
  Port: 57500
  Protocol: grpc-tcp
  Profile:
<span class="hl">  State: Connected</span>
  Explanation:</pre>
<p><code>show telemetry ietf subscription all</code> lists subscriptions with their state (<code>Valid</code> or <code>Invalid</code>, for example when the XPath is wrong); <code>show telemetry internal connection</code> shows the transport sessions.</p>

<h3>gNMI at concept level</h3>
<p><b>gNMI</b> (gRPC Network Management Interface), designed by the OpenConfig community, is a single gRPC service with four RPCs: <b>Capabilities</b> (which models and encodings), <b>Get</b>, <b>Set</b> (configuration) and <b>Subscribe</b> (telemetry). Subscribe modes are <b>STREAM</b> (with sampling or on-change), <b>ONCE</b> and <b>POLL</b>. It runs over HTTP/2 with TLS, uses protobuf or JSON, and addresses data with gNMI paths built from YANG (usually OpenConfig). On IOS XE it is enabled with <code>gnmi-yang</code> and <code>gnmi-yang server</code> (default secure port 9339).</p>

<div class="eg"><p><b>Worked example.</b> You want interface counters every 30 seconds and an immediate message when any interface goes down. Build two subscriptions: periodic <code>update-policy periodic 3000</code> on the interface statistics path, and <code>update-policy on-change</code> on the oper-status path. A single on-change subscription on counters would be a mistake: counters change constantly, so they are usually not on-change capable.</p></div>

<div class="warn"><p><b>Common mistake.</b> Reading the period as milliseconds or seconds. <code>periodic 1000</code> on IOS XE is 10 seconds, not one second or 1000 seconds. Too small a period on many paths can load the CPU.</p></div>
<div class="exam"><p><b>Exam trap.</b> Dial-out = configured on the device, device initiates, persistent. Dial-in = collector initiates, dynamic, ends with the session. gNMI Subscribe is dial-in. Telemetry is push; SNMP is pull.</p></div>

<div class="scn"><h4>The microburst nobody could see</h4><p>Users on a trading floor reported short freezes, but the SNMP graphs at five-minute averages showed uplinks at 30 percent. The team added a dial-out subscription for interface counters every 10 seconds and output drops on change. The new graphs showed 2-second bursts at line rate and drops on one uplink at the market open. A QoS and uplink change fixed it.</p><p><b>Lesson:</b> averages hide bursts; streaming telemetry at a short cadence shows what polling misses.</p></div>

<div class="iv"><p class="q">"Explain dial-in versus dial-out telemetry and when you would use each."</p><p>Strong answer: in dial-out the subscription is configured on the device, which opens the connection to a receiver and pushes data periodically or on change; it is persistent and survives collector restarts, good for permanent monitoring. In dial-in the collector connects (NETCONF establish-subscription or gNMI Subscribe) and creates a dynamic subscription that lasts only for the session, good for on-demand troubleshooting. Mention encodings (kvGPB, GPB, JSON), gRPC transport and a TIG pipeline.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Telemetry pushes YANG-modelled data; polling pulls it and misses events between polls.</li>
<li>Periodic (IOS XE period in centiseconds) versus on-change subscriptions.</li>
<li>Dial-out: configured, device connects, persistent. Dial-in: collector connects, dynamic.</li>
<li>gNMI: gRPC service with Capabilities, Get, Set, Subscribe (STREAM, ONCE, POLL).</li>
<li>Typical pipeline: collector (Telegraf) to time-series database (InfluxDB) to dashboards (Grafana).</li>
</ul></div>
`,hi:`
<p>Ek pareshaan parent teenager ko har das minute mein phone karke pooch sakta hai "kahan ho?" Yeh <b>polling</b> hai: dono ke liye thakaane wala, aur calls ke beech jo hota hai woh miss ho jaata hai. Ya teenager ka phone lagatar location share kar sakta hai, aur kuch badalte hi message bhej sakta hai. Yeh <b>streaming telemetry</b> hai. Model-driven telemetry wahi YANG paths use karti hai jo aap pehle se jaante ho, par device poochhe jaane ka intezaar karne ki jagah data <b>push</b> karta hai.</p>

<h3>Polling kaafi kyun nahi</h3>
<p>SNMP polling (aur baar-baar RESTCONF GETs) aam taur par har ek se paanch minute mein chalti hai. 30-second ka traffic burst ya flap hota link polls ke beech gayab ho sakta hai, poller har request se device CPU par load daalta hai, aur hazaaron devices tak scale karne ka matlab hazaaron queries. Telemetry structured data ko steady interval par ya change par, efficiently encoded, ek <b>collector</b> ko stream karti hai.</p>

<h3>Building blocks</h3>
<dl class="terms">
<dt>Subscription</dt><dd>Kya bhejna hai (ek YANG XPath), kitni baar, aur kis encoding mein.</dd>
<dt>Periodic (cadence-based)</dt><dd>Har N units par bhejo; IOS XE par period <b>centiseconds</b> mein hota hai, to 6000 = 60 seconds. Counters aur CPU ke liye achha.</dd>
<dt>On-change</dt><dd>Sirf value badalne par bhejo, saath mein ek initial snapshot. Interface state ya neighbour up/down ke liye achha.</dd>
<dt>Encoding</dt><dd>Compact <b>GPB</b> (protocol buffers, decode karne ke liye schema chahiye), self-describing <b>kvGPB</b> (key-value GPB, IOS XE <code>encode-kvgpb</code> use karta hai), JSON, ya NETCONF ke liye XML.</dd>
<dt>Transport</dt><dd>HTTP/2 par gRPC (dial-out <code>grpc-tcp</code> ya <code>grpc-tls</code>), dial-in yang-push ke liye NETCONF, aur gNMI.</dd>
</dl>

<h3>Dial-in vs dial-out</h3>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Dial-in and dial-out">
<text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="13">Dial-in (dynamic)</text>
<rect x="30" y="40" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="85" y="70" text-anchor="middle" class="svg-ink" font-size="12">Collector</text>
<rect x="190" y="40" width="110" height="50" rx="8" fill="#bae6fd"/><text x="245" y="70" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<line x1="140" y1="55" x2="190" y2="55" stroke="#64748b" stroke-width="2"/><text x="165" y="110" text-anchor="middle" class="svg-muted" font-size="11">1. collector connect, subscribe</text>
<line x1="190" y1="80" x2="140" y2="80" stroke="#64748b" stroke-dasharray="4 4"/><text x="165" y="128" text-anchor="middle" class="svg-muted" font-size="11">2. data wapas aata hai</text>
<text x="165" y="150" text-anchor="middle" class="svg-accent" font-size="11">session ke saath khatam</text>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="13">Dial-out (configured)</text>
<rect x="350" y="40" width="110" height="50" rx="8" fill="#bae6fd"/><text x="405" y="70" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<rect x="510" y="40" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="565" y="70" text-anchor="middle" class="svg-ink" font-size="12">Receiver</text>
<line x1="460" y1="65" x2="510" y2="65" stroke="#64748b" stroke-width="2"/><text x="485" y="110" text-anchor="middle" class="svg-muted" font-size="11">R1 connect karke push karta hai</text>
<text x="485" y="128" text-anchor="middle" class="svg-muted" font-size="11">config R1 par rehta hai</text>
<text x="485" y="150" text-anchor="middle" class="svg-accent" font-size="11">collector restart jhel leta hai</text>
<rect x="150" y="175" width="340" height="45" rx="8" fill="#fde68a"/><text x="320" y="202" text-anchor="middle" class="svg-ink" font-size="12">Telegraf -&gt; InfluxDB -&gt; Grafana (TIG stack)</text>
</svg><p class="cap">Connection kaun kholta hai, yahi model decide karta hai. Dono collector aur time-series database ko feed karte hain.</p></div>
<ul>
<li><b>Dial-in (dynamic)</b>: collector device se connect karta hai aur NETCONF (<code>establish-subscription</code>, yang-push) ya gNMI <code>Subscribe</code> se subscription banata hai. Device par kuch configure nahi hota; session band hote hi subscription mar jaati hai.</li>
<li><b>Dial-out (configured)</b>: subscription device configuration mein hoti hai aur <b>device</b> receiver tak connection kholta hai. Yeh collector ke reload jhel leti hai aur apne aap reconnect karti hai; firewalls ko sirf device-to-collector allow karna hota hai.</li>
</ul>

<h3>IOS XE par ek dial-out subscription</h3>
<pre class="code">R1(config)# telemetry ietf subscription 101
R1(config-mdt-subs)#  encoding encode-kvgpb
R1(config-mdt-subs)#  filter xpath /process-cpu-ios-xe-oper:cpu-usage/cpu-utilization/five-seconds
R1(config-mdt-subs)#  source-address 192.168.50.1
R1(config-mdt-subs)#  stream yang-push
R1(config-mdt-subs)#  update-policy periodic 6000         <span class="c">! centiseconds = 60 s</span>
R1(config-mdt-subs)#  receiver ip address 192.168.50.20 57500 protocol grpc-tcp</pre>
<p>Har line ek building block par map hoti hai: XPath ek YANG operational model se aata hai (yahan Cisco-IOS-XE-process-cpu-oper), <code>update-policy</code> periodic ya <code>on-change</code> chunta hai, aur receiver define karta hai kahan aur kaise push karna hai. <code>netconf-yang</code> enabled hona chahiye kyunki telemetry wahi YANG infrastructure use karti hai.</p>
<pre class="out">R1# show telemetry ietf subscription 101 receiver
Telemetry subscription receivers detail:

  Subscription ID: 101
  Address: 192.168.50.20
  Port: 57500
  Protocol: grpc-tcp
  Profile:
<span class="hl">  State: Connected</span>
  Explanation:</pre>
<p><code>show telemetry ietf subscription all</code> subscriptions ko unki state ke saath list karta hai (<code>Valid</code> ya <code>Invalid</code>, jaise jab XPath galat ho); <code>show telemetry internal connection</code> transport sessions dikhata hai.</p>

<h3>gNMI concept level par</h3>
<p><b>gNMI</b> (gRPC Network Management Interface), jise OpenConfig community ne design kiya, ek single gRPC service hai jisme chaar RPCs hain: <b>Capabilities</b> (kaunse models aur encodings), <b>Get</b>, <b>Set</b> (configuration) aur <b>Subscribe</b> (telemetry). Subscribe modes <b>STREAM</b> (sampling ya on-change ke saath), <b>ONCE</b> aur <b>POLL</b> hain. Yeh TLS ke saath HTTP/2 par chalta hai, protobuf ya JSON use karta hai, aur YANG se bane gNMI paths se data address karta hai (aam taur par OpenConfig). IOS XE par ise <code>gnmi-yang</code> aur <code>gnmi-yang server</code> se enable karte hain (default secure port 9339).</p>

<div class="eg"><p><b>Worked example.</b> Aapko har 30 seconds mein interface counters chahiye aur koi bhi interface down hote hi turant message. Do subscriptions banao: interface statistics path par periodic <code>update-policy periodic 3000</code>, aur oper-status path par <code>update-policy on-change</code>. Counters par ek single on-change subscription galti hogi: counters lagatar badalte hain, isliye woh aam taur par on-change capable nahi hote.</p></div>

<div class="warn"><p><b>Common galti.</b> Period ko milliseconds ya seconds samajhna. IOS XE par <code>periodic 1000</code> 10 seconds hai, na ek second na 1000 seconds. Bahut saare paths par bahut chhota period CPU par load daal sakta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Dial-out = device par configured, device shuru karta hai, persistent. Dial-in = collector shuru karta hai, dynamic, session ke saath khatam. gNMI Subscribe dial-in hai. Telemetry push hai; SNMP pull.</p></div>

<div class="scn"><h4>Microburst jo kisi ko dikh nahi raha tha</h4><p>Trading floor ke users ne chhote freezes report kiye, par paanch-minute averages wale SNMP graphs uplinks ko 30 percent par dikha rahe the. Team ne har 10 seconds mein interface counters aur on-change output drops ke liye dial-out subscription joda. Naye graphs ne market khulte waqt ek uplink par line rate par 2-second bursts aur drops dikhaye. Ek QoS aur uplink change ne ise theek kiya.</p><p><b>Seekh:</b> averages bursts chhupa dete hain; chhoti cadence par streaming telemetry woh dikhati hai jo polling miss karti hai.</p></div>

<div class="iv"><p class="q">"Dial-in vs dial-out telemetry explain karo aur batao kab kaunsa use karoge."</p><p>Strong answer: dial-out mein subscription device par configured hoti hai, jo receiver tak connection kholta hai aur periodically ya change par data push karta hai; yeh persistent hai aur collector restarts jhel leti hai, permanent monitoring ke liye achhi. Dial-in mein collector connect karta hai (NETCONF establish-subscription ya gNMI Subscribe) aur ek dynamic subscription banata hai jo sirf session tak chalti hai, on-demand troubleshooting ke liye achhi. Encodings (kvGPB, GPB, JSON), gRPC transport aur TIG pipeline batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Telemetry YANG-modelled data push karti hai; polling use pull karti hai aur polls ke beech events miss karti hai.</li>
<li>Periodic (IOS XE period centiseconds mein) vs on-change subscriptions.</li>
<li>Dial-out: configured, device connect karta hai, persistent. Dial-in: collector connect karta hai, dynamic.</li>
<li>gNMI: Capabilities, Get, Set, Subscribe (STREAM, ONCE, POLL) wali gRPC service.</li>
<li>Typical pipeline: collector (Telegraf) se time-series database (InfluxDB) se dashboards (Grafana).</li>
</ul></div>
`}};export{e as default};