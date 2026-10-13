var e={id:`flexible-netflow`,h:{en:`Flexible NetFlow: record, exporter, monitor`,hi:`Flexible NetFlow: record, exporter, monitor`},body:{en:`
<p>Traditional NetFlow is a printed form with seven fixed boxes. <b>Flexible NetFlow</b> (FNF) lets you design your own form: you choose which boxes identify a conversation, which boxes just get filled in, where the finished forms are posted, and which doors of the building hand out the form. Those four choices are exactly the four FNF building blocks.</p>

<h3>The four building blocks</h3>
<dl class="terms">
<dt>Flow record</dt><dd>Defines <b>what</b> is tracked. <code>match</code> statements define the <b>key fields</b> (they create a new flow when they differ). <code>collect</code> statements define <b>non-key fields</b> (information stored with the flow but not used to separate flows).</dd>
<dt>Flow exporter</dt><dd>Defines <b>where</b> the records go: collector address, source interface, transport port and export protocol (netflow-v5, netflow-v9 or ipfix).</dd>
<dt>Flow monitor</dt><dd>Ties a record to one or more exporters and holds the <b>cache</b> and its timeouts.</dd>
<dt>Interface attachment</dt><dd><code>ip flow monitor NAME input</code> or <code>output</code> applies the monitor to traffic in one direction on an interface.</dd>
</dl>
<p>An optional fifth block, the <b>flow sampler</b>, analyses only one out of N packets on very fast links to save CPU and memory.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Flexible NetFlow building blocks">
<rect x="20" y="30" width="160" height="70" rx="10" fill="#fde68a"/><text x="100" y="60" text-anchor="middle" class="svg-ink" font-size="13">flow record</text><text x="100" y="80" text-anchor="middle" class="svg-muted" font-size="12">match + collect</text>
<rect x="20" y="130" width="160" height="70" rx="10" fill="#bbf7d0"/><text x="100" y="160" text-anchor="middle" class="svg-ink" font-size="13">flow exporter</text><text x="100" y="180" text-anchor="middle" class="svg-muted" font-size="12">dest, port, version</text>
<rect x="250" y="75" width="160" height="80" rx="10" fill="#bae6fd"/><text x="330" y="108" text-anchor="middle" class="svg-ink" font-size="13">flow monitor</text><text x="330" y="128" text-anchor="middle" class="svg-muted" font-size="12">cache + timeouts</text>
<rect x="480" y="75" width="140" height="80" rx="10" fill="#ddd6fe"/><text x="550" y="108" text-anchor="middle" class="svg-ink" font-size="13">interface</text><text x="550" y="128" text-anchor="middle" class="svg-muted" font-size="12">input / output</text>
<line x1="180" y1="65" x2="250" y2="100" stroke="#64748b" stroke-width="2"/><line x1="180" y1="165" x2="250" y2="130" stroke="#64748b" stroke-width="2"/><line x1="410" y1="115" x2="480" y2="115" stroke="#64748b" stroke-width="2"/>
<text x="445" y="105" text-anchor="middle" class="svg-accent" font-size="12">apply</text>
</svg><p class="cap">Record and exporter plug into a monitor; the monitor is applied to an interface in one direction.</p></div>

<h3>Configuration walkthrough</h3>
<p>Goal: on EDGE, track every conversation entering from the LAN (Gi0/2) and export it with NetFlow v9 to the collector 192.0.2.40 on UDP 2055.</p>
<pre class="code"><span class="c">! 1. The record: keys and non-keys</span>
EDGE(config)# flow record NK-REC
EDGE(config-flow-record)# match ipv4 source address
EDGE(config-flow-record)# match ipv4 destination address
EDGE(config-flow-record)# match ipv4 protocol
EDGE(config-flow-record)# match transport source-port
EDGE(config-flow-record)# match transport destination-port
EDGE(config-flow-record)# match interface input
EDGE(config-flow-record)# collect interface output
EDGE(config-flow-record)# collect counter bytes long
EDGE(config-flow-record)# collect counter packets long
EDGE(config-flow-record)# collect timestamp sys-uptime first
EDGE(config-flow-record)# collect timestamp sys-uptime last

<span class="c">! 2. The exporter: where to send</span>
EDGE(config)# flow exporter NK-EXP
EDGE(config-flow-exporter)# destination 192.0.2.40
EDGE(config-flow-exporter)# source Loopback0
EDGE(config-flow-exporter)# transport udp 2055
EDGE(config-flow-exporter)# export-protocol netflow-v9

<span class="c">! 3. The monitor: record + exporter + cache</span>
EDGE(config)# flow monitor NK-MON
EDGE(config-flow-monitor)# record NK-REC
EDGE(config-flow-monitor)# exporter NK-EXP
EDGE(config-flow-monitor)# cache timeout active 60

<span class="c">! 4. Apply to the interface</span>
EDGE(config)# interface GigabitEthernet0/2
EDGE(config-if)# ip flow monitor NK-MON input</pre>
<p>Instead of building your own record you can use a predefined one, for example <code>record netflow ipv4 original-input</code>, which reproduces the traditional seven keys. A user-defined record must be fully configured before the monitor is applied; while a monitor is attached to an interface you cannot change its record.</p>

<h3>Verification</h3>
<pre class="out">EDGE# show flow monitor NK-MON cache
  Cache type:                               Normal
  Cache size:                                 4096
  Current entries:                               3
  High Watermark:                                5

  Flows added:                                  42
  Flows aged:                                   39
    - Active timeout      (    60 secs)          6
    - Inactive timeout    (    15 secs)         33

<span class="hl">IPV4 SOURCE ADDRESS:       192.168.50.10</span>
<span class="hl">IPV4 DESTINATION ADDRESS:  198.51.100.10</span>
TRNS SOURCE PORT:          51514
TRNS DESTINATION PORT:     443
INTERFACE INPUT:           Gi0/2
IP PROTOCOL:               6
interface output:          Gi0/0
counter bytes long:        184220
counter packets long:      212</pre>
<p>Upper-case field names are <b>keys</b>, lower-case names are <b>non-key</b> collected fields: a quick way to read any FNF cache. Other useful commands:</p>
<ul>
<li><code>show flow record NK-REC</code>: the fields in the record.</li>
<li><code>show flow exporter NK-EXP</code> and <code>show flow exporter statistics</code>: destination, version and how many packets were sent or failed.</li>
<li><code>show flow interface GigabitEthernet0/2</code>: which monitors are applied, in which direction.</li>
<li><code>show flow monitor NK-MON cache format table</code>: one line per flow, easier to scan.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Management wants a report of traffic per DSCP class and per destination only, not per port. Build a record with <code>match ipv4 dscp</code> and <code>match ipv4 destination address</code> as keys and collect bytes and packets. Now all web, voice and backup traffic to one server with the same DSCP collapse into a single flow, and the cache shrinks from thousands of entries to a few dozen. Choosing fewer keys means fewer, larger flows.</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring the monitor but forgetting to attach the exporter, or attaching it to the interface only in the <code>output</code> direction when you meant input. The cache fills but the collector receives nothing, or you see only half the conversations. Check <code>show flow interface</code> and <code>show flow exporter statistics</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>match</code> = key field, <code>collect</code> = non-key field. An exam item may show a record and ask which change creates more flows: adding a <code>match</code> does, adding a <code>collect</code> does not. The default export protocol for an FNF exporter is NetFlow v9.</p></div>

<div class="scn"><h4>Collector shows no data from the new router</h4><p>A new branch router was configured with FNF, and <code>show flow monitor cache</code> listed hundreds of flows, yet the collector showed nothing. <code>show flow exporter statistics</code> showed packets sent, so the router was exporting. A capture at the data centre revealed the exports arriving from the WAN interface address, which the collector did not have in its device list. Adding <code>source Loopback0</code> to the exporter made the packets come from the registered loopback address, and data appeared.</p><p><b>Lesson:</b> always set the exporter source to a stable loopback that the collector knows.</p></div>

<div class="iv"><p class="q">"Explain the components of Flexible NetFlow and how they relate."</p><p>A flow record defines key fields with <code>match</code> and non-key fields with <code>collect</code>. A flow exporter defines the collector, source, transport and version. A flow monitor combines one record with one or more exporters and owns the cache and timeouts. The monitor is applied to an interface with <code>ip flow monitor NAME input</code> or <code>output</code>. Optionally a sampler reduces load. Verify with <code>show flow monitor NAME cache</code> and exporter statistics.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FNF = record (match keys, collect non-keys) + exporter + monitor + interface attachment.</li>
<li>Export protocol options: netflow-v5, netflow-v9 (default), ipfix.</li>
<li>More match fields mean more flows; collect fields only add data.</li>
<li>Apply with <code>ip flow monitor NAME input|output</code>; verify with <code>show flow monitor NAME cache</code>.</li>
<li>Set a loopback as the exporter source so the collector recognises the device.</li>
</ul></div>
`,hi:`
<p>Traditional NetFlow saat fixed boxes wala ek printed form hai. <b>Flexible NetFlow</b> (FNF) aapko apna form design karne deta hai: aap chunte ho kaunse boxes conversation ki pehchaan banenge, kaunse boxes sirf bhare jaayenge, bhare hue forms kahan post honge, aur building ke kaunse darwaze form baantenge. Yahi chaar choices exactly FNF ke chaar building blocks hain.</p>

<h3>Chaar building blocks</h3>
<dl class="terms">
<dt>Flow record</dt><dd>Define karta hai ki <b>kya</b> track hoga. <code>match</code> statements <b>key fields</b> define karte hain (alag hone par naya flow banate hain). <code>collect</code> statements <b>non-key fields</b> define karte hain (flow ke saath store hone wali information jo flows ko alag karne mein use nahi hoti).</dd>
<dt>Flow exporter</dt><dd>Define karta hai ki records <b>kahan</b> jaayenge: collector address, source interface, transport port aur export protocol (netflow-v5, netflow-v9 ya ipfix).</dd>
<dt>Flow monitor</dt><dd>Ek record ko ek ya zyada exporters se jodta hai aur <b>cache</b> aur uske timeouts rakhta hai.</dd>
<dt>Interface attachment</dt><dd><code>ip flow monitor NAME input</code> ya <code>output</code> monitor ko interface par ek direction ke traffic par lagata hai.</dd>
</dl>
<p>Ek optional paanchva block, <b>flow sampler</b>, bahut tez links par CPU aur memory bachane ke liye N mein se sirf ek packet analyse karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Flexible NetFlow building blocks">
<rect x="20" y="30" width="160" height="70" rx="10" fill="#fde68a"/><text x="100" y="60" text-anchor="middle" class="svg-ink" font-size="13">flow record</text><text x="100" y="80" text-anchor="middle" class="svg-muted" font-size="12">match + collect</text>
<rect x="20" y="130" width="160" height="70" rx="10" fill="#bbf7d0"/><text x="100" y="160" text-anchor="middle" class="svg-ink" font-size="13">flow exporter</text><text x="100" y="180" text-anchor="middle" class="svg-muted" font-size="12">dest, port, version</text>
<rect x="250" y="75" width="160" height="80" rx="10" fill="#bae6fd"/><text x="330" y="108" text-anchor="middle" class="svg-ink" font-size="13">flow monitor</text><text x="330" y="128" text-anchor="middle" class="svg-muted" font-size="12">cache + timeouts</text>
<rect x="480" y="75" width="140" height="80" rx="10" fill="#ddd6fe"/><text x="550" y="108" text-anchor="middle" class="svg-ink" font-size="13">interface</text><text x="550" y="128" text-anchor="middle" class="svg-muted" font-size="12">input / output</text>
<line x1="180" y1="65" x2="250" y2="100" stroke="#64748b" stroke-width="2"/><line x1="180" y1="165" x2="250" y2="130" stroke="#64748b" stroke-width="2"/><line x1="410" y1="115" x2="480" y2="115" stroke="#64748b" stroke-width="2"/>
<text x="445" y="105" text-anchor="middle" class="svg-accent" font-size="12">apply</text>
</svg><p class="cap">Record aur exporter monitor mein plug hote hain; monitor interface par ek direction mein apply hota hai.</p></div>

<h3>Configuration walkthrough</h3>
<p>Goal: EDGE par LAN (Gi0/2) se aane wali har conversation track karo aur use NetFlow v9 ke saath collector 192.0.2.40 par UDP 2055 par export karo.</p>
<pre class="code"><span class="c">! 1. Record: keys aur non-keys</span>
EDGE(config)# flow record NK-REC
EDGE(config-flow-record)# match ipv4 source address
EDGE(config-flow-record)# match ipv4 destination address
EDGE(config-flow-record)# match ipv4 protocol
EDGE(config-flow-record)# match transport source-port
EDGE(config-flow-record)# match transport destination-port
EDGE(config-flow-record)# match interface input
EDGE(config-flow-record)# collect interface output
EDGE(config-flow-record)# collect counter bytes long
EDGE(config-flow-record)# collect counter packets long
EDGE(config-flow-record)# collect timestamp sys-uptime first
EDGE(config-flow-record)# collect timestamp sys-uptime last

<span class="c">! 2. Exporter: kahan bhejna hai</span>
EDGE(config)# flow exporter NK-EXP
EDGE(config-flow-exporter)# destination 192.0.2.40
EDGE(config-flow-exporter)# source Loopback0
EDGE(config-flow-exporter)# transport udp 2055
EDGE(config-flow-exporter)# export-protocol netflow-v9

<span class="c">! 3. Monitor: record + exporter + cache</span>
EDGE(config)# flow monitor NK-MON
EDGE(config-flow-monitor)# record NK-REC
EDGE(config-flow-monitor)# exporter NK-EXP
EDGE(config-flow-monitor)# cache timeout active 60

<span class="c">! 4. Interface par apply karo</span>
EDGE(config)# interface GigabitEthernet0/2
EDGE(config-if)# ip flow monitor NK-MON input</pre>
<p>Apna record banane ki jagah aap predefined record use kar sakte ho, jaise <code>record netflow ipv4 original-input</code>, jo traditional saat keys ko dohrata hai. User-defined record monitor apply hone se pehle poora configure hona chahiye; jab monitor kisi interface par attached ho tab aap uska record nahi badal sakte.</p>

<h3>Verification</h3>
<pre class="out">EDGE# show flow monitor NK-MON cache
  Cache type:                               Normal
  Cache size:                                 4096
  Current entries:                               3
  High Watermark:                                5

  Flows added:                                  42
  Flows aged:                                   39
    - Active timeout      (    60 secs)          6
    - Inactive timeout    (    15 secs)         33

<span class="hl">IPV4 SOURCE ADDRESS:       192.168.50.10</span>
<span class="hl">IPV4 DESTINATION ADDRESS:  198.51.100.10</span>
TRNS SOURCE PORT:          51514
TRNS DESTINATION PORT:     443
INTERFACE INPUT:           Gi0/2
IP PROTOCOL:               6
interface output:          Gi0/0
counter bytes long:        184220
counter packets long:      212</pre>
<p>Upper-case field names <b>keys</b> hain, lower-case names <b>non-key</b> collected fields hain: kisi bhi FNF cache ko padhne ka quick tareeka. Doosre useful commands:</p>
<ul>
<li><code>show flow record NK-REC</code>: record ke fields.</li>
<li><code>show flow exporter NK-EXP</code> aur <code>show flow exporter statistics</code>: destination, version aur kitne packets gaye ya fail hue.</li>
<li><code>show flow interface GigabitEthernet0/2</code>: kaunse monitors kis direction mein applied hain.</li>
<li><code>show flow monitor NK-MON cache format table</code>: har flow ek line, scan karna aasaan.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Management ko sirf har DSCP class aur har destination ke hisaab se traffic report chahiye, har port ke hisaab se nahi. <code>match ipv4 dscp</code> aur <code>match ipv4 destination address</code> keys ke saath record banao aur bytes aur packets collect karo. Ab ek server ki taraf same DSCP wala saara web, voice aur backup traffic ek hi flow mein simat jaata hai, aur cache hazaaron entries se ghatkar kuch darjan reh jaata hai. Kam keys chunne ka matlab kam, bade flows.</p></div>

<div class="warn"><p><b>Common galti.</b> Monitor configure karna par exporter attach karna bhool jaana, ya use interface par sirf <code>output</code> direction mein lagana jab input chahiye tha. Cache bharta hai par collector ko kuch nahi milta, ya aapko sirf aadhi conversations dikhti hain. <code>show flow interface</code> aur <code>show flow exporter statistics</code> check karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>match</code> = key field, <code>collect</code> = non-key field. Exam item ek record dikhakar pooch sakta hai ki kaunsa change zyada flows banata hai: <code>match</code> jodna banata hai, <code>collect</code> jodna nahi. FNF exporter ka default export protocol NetFlow v9 hai.</p></div>

<div class="scn"><h4>Collector naye router ka data nahi dikhata</h4><p>Ek naye branch router par FNF configure hua, aur <code>show flow monitor cache</code> mein saikdon flows the, phir bhi collector kuch nahi dikha raha tha. <code>show flow exporter statistics</code> mein packets sent dikhe, to router export kar raha tha. Data centre par capture se pata chala ki exports WAN interface address se aa rahe the, jo collector ki device list mein nahi tha. Exporter mein <code>source Loopback0</code> jodne se packets registered loopback address se aane lage, aur data dikhne laga.</p><p><b>Seekh:</b> exporter source hamesha ek stable loopback par set karo jise collector jaanta ho.</p></div>

<div class="iv"><p class="q">"Flexible NetFlow ke components aur unka aapas mein rishta samjhao."</p><p>Flow record <code>match</code> se key fields aur <code>collect</code> se non-key fields define karta hai. Flow exporter collector, source, transport aur version define karta hai. Flow monitor ek record ko ek ya zyada exporters se jodta hai aur cache aur timeouts ka maalik hai. Monitor <code>ip flow monitor NAME input</code> ya <code>output</code> se interface par apply hota hai. Optionally sampler load kam karta hai. <code>show flow monitor NAME cache</code> aur exporter statistics se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FNF = record (match keys, collect non-keys) + exporter + monitor + interface attachment.</li>
<li>Export protocol options: netflow-v5, netflow-v9 (default), ipfix.</li>
<li>Zyada match fields matlab zyada flows; collect fields sirf data jodte hain.</li>
<li><code>ip flow monitor NAME input|output</code> se apply karo; <code>show flow monitor NAME cache</code> se verify karo.</li>
<li>Exporter source ek loopback par set karo taaki collector device ko pehchaane.</li>
</ul></div>
`}};export{e as default};