var e=`<svg viewBox="0 0 640 230" role="img" aria-label="Record, exporter, monitor and interface">
<rect x="20" y="20" width="170" height="64" rx="10" fill="#fde68a"/><text x="105" y="48" text-anchor="middle" class="svg-ink" font-size="13">Record GF-REC</text><text x="105" y="68" text-anchor="middle" class="svg-muted" font-size="11">match + collect fields</text>
<rect x="20" y="146" width="170" height="64" rx="10" fill="#bbf7d0"/><text x="105" y="174" text-anchor="middle" class="svg-ink" font-size="13">Exporter GF-EXPORT</text><text x="105" y="194" text-anchor="middle" class="svg-muted" font-size="11">10.1.50.100 udp 9995</text>
<rect x="250" y="82" width="170" height="70" rx="10" fill="#bae6fd"/><text x="335" y="110" text-anchor="middle" class="svg-ink" font-size="13">Monitor GF-MON-FLOW</text><text x="335" y="130" text-anchor="middle" class="svg-muted" font-size="11">cache + timeouts</text>
<rect x="480" y="82" width="140" height="70" rx="10" fill="#ddd6fe"/><text x="550" y="110" text-anchor="middle" class="svg-ink" font-size="13">Interface Gi0/0</text><text x="550" y="130" text-anchor="middle" class="svg-muted" font-size="11">input</text>
<line x1="190" y1="55" x2="250" y2="100" stroke="#64748b" stroke-width="2"/><line x1="190" y1="178" x2="250" y2="135" stroke="#64748b" stroke-width="2"/><line x1="420" y1="117" x2="480" y2="117" stroke="#64748b" stroke-width="2"/>
<text x="450" y="108" text-anchor="middle" class="svg-accent" font-size="11">apply</text>
</svg>`,t={id:`exporters-monitors-records`,h:{en:`Exporters, monitors and records`,hi:`Exporters, monitors aur records`},body:{en:`
<h3>Four building blocks, one idea each</h3>
<p>Modern routers use <b>Flexible NetFlow</b>. Instead of one fixed switch, you assemble the feature from four small parts. Think of a photocopy service in an office. The <b>record</b> is the form that says which boxes to copy. The <b>exporter</b> is the courier address and delivery rules. The <b>monitor</b> is the desk that ties one form to one courier and keeps the working pile (the cache). The <b>interface</b> line is the door where the desk opens for business.</p>
<div class="dia">`+e+`<p class="cap">Record and exporter plug into the monitor; the monitor is applied to an interface in one direction.</p></div>
<table class="cmp"><tr><th>Block</th><th>Question it answers</th><th>Typical lines</th></tr>
<tr><td>Record</td><td>What do we track?</td><td>match (key fields), collect (extra counters)</td></tr>
<tr><td>Exporter</td><td>Where and how do records go?</td><td>destination, source, transport udp, export-protocol</td></tr>
<tr><td>Monitor</td><td>Which record, which exporter, how long to cache?</td><td>record, exporter, cache timeout</td></tr>
<tr><td>Interface</td><td>Which traffic is watched?</td><td>ip flow monitor NAME input</td></tr></table>

<h3>Step 1: the record</h3>
<pre class="code">KCH-EDGE-R2(config)# flow record GF-REC
KCH-EDGE-R2(config-flow-record)# match ipv4 source address
KCH-EDGE-R2(config-flow-record)# match ipv4 destination address
KCH-EDGE-R2(config-flow-record)# match ipv4 protocol
KCH-EDGE-R2(config-flow-record)# match transport source-port
KCH-EDGE-R2(config-flow-record)# match transport destination-port
KCH-EDGE-R2(config-flow-record)# match interface input
KCH-EDGE-R2(config-flow-record)# collect counter bytes
KCH-EDGE-R2(config-flow-record)# collect counter packets
KCH-EDGE-R2(config-flow-record)# exit</pre>
<p>The six <code>match</code> lines are the key fields: the five-tuple plus the input interface. The two <code>collect</code> lines are non-key fields that get filled as traffic passes. Without the byte counter you could not rank top talkers. If you do not need a custom layout, many platforms offer a ready-made record that mimics classic NetFlow, written <code>record netflow ipv4 original-input</code> inside the monitor. Use a custom record when you want to add fields such as timestamps or DSCP.</p>

<h3>Step 2: the exporter</h3>
<pre class="code">KCH-EDGE-R2(config)# flow exporter GF-EXPORT
KCH-EDGE-R2(config-flow-exporter)# destination 10.1.50.100
KCH-EDGE-R2(config-flow-exporter)# source Loopback0
KCH-EDGE-R2(config-flow-exporter)# transport udp 9995
KCH-EDGE-R2(config-flow-exporter)# export-protocol netflow-v9
KCH-EDGE-R2(config-flow-exporter)# exit</pre>
<ul>
<li><b>destination</b> is the collector. A wrong address here is the most common mistake.</li>
<li><b>source Loopback0</b> makes the datagrams come from 10.255.0.2. The collector in the lab accepts exports only from known router loopbacks. Any other source address is rejected, just as a firewall would.</li>
<li><b>transport udp 9995</b> is the collector port. It must match what the collector listens on.</li>
<li><b>export-protocol</b> can be <code>netflow-v9</code> or <code>ipfix</code> (and <code>netflow-v5</code> for classic). The collector must understand the version you choose.</li>
</ul>

<h3>Step 3: the monitor</h3>
<pre class="code">KCH-EDGE-R2(config)# flow monitor GF-MON-FLOW
KCH-EDGE-R2(config-flow-monitor)# record GF-REC
KCH-EDGE-R2(config-flow-monitor)# exporter GF-EXPORT
KCH-EDGE-R2(config-flow-monitor)# cache timeout active 60
KCH-EDGE-R2(config-flow-monitor)# cache timeout inactive 15
KCH-EDGE-R2(config-flow-monitor)# exit</pre>
<p>The monitor does nothing yet. It is a desk without a door. The timeouts are the ones from chapter 1: inactive 15 seconds ends an idle flow; active 60 seconds exports a long flow every minute so your graphs are not 30 minutes late.</p>

<h3>Step 4: apply it to an interface</h3>
<pre class="code">KCH-EDGE-R2(config)# interface GigabitEthernet0/0
KCH-EDGE-R2(config-if)# ip flow monitor GF-MON-FLOW input
KCH-EDGE-R2(config-if)# exit
KCH-EDGE-R2(config)# interface GigabitEthernet0/1
KCH-EDGE-R2(config-if)# ip flow monitor GF-MON-FLOW input
KCH-EDGE-R2(config-if)# end</pre>
<p>Direction matters. <b>Input</b> means traffic arriving on that interface. If you watch input on every interface, each packet is seen once, as it enters the router, which avoids double counting. Watching both input and output on the same box would count transit traffic twice. Choose the interfaces facing users and facing the circuit, and apply input on them.</p>

<h3>Verification</h3>
<pre class="code">KCH-EDGE-R2# show flow exporter GF-EXPORT
KCH-EDGE-R2# show flow monitor GF-MON-FLOW
KCH-EDGE-R2# show flow interface</pre>
<pre class="out">Flow Exporter GF-EXPORT:
  Description:              User defined
  Export protocol:          NetFlow Version 9
  Transport Configuration:
    Destination IP address: <span class="hl">10.1.50.100</span>
    Source IP address:      10.255.0.2
    Source Interface:       Loopback0
    Transport Protocol:     UDP
    Destination Port:       <span class="hl">9995</span>
    Source Port:            50312
  Export statistics:
    <span class="hl">86 records exported in 12 packets</span>
    0 records dropped (no route to collector)

Flow Monitor GF-MON-FLOW:
  Flow Record:       GF-REC
  Flow Exporter:     GF-EXPORT
  Cache:
    Status:               <span class="hl">allocated</span>
    Inactive Timeout:     15 secs
    Active Timeout:       60 secs

Interface GigabitEthernet0/0
  FNF:  monitor:         GF-MON-FLOW
        direction:       <span class="hl">Input</span></pre>
<p>Check four things: the destination and port are right; the source interface is Loopback0; the monitor shows <b>allocated</b> (it is applied somewhere; "not allocated" means no interface uses it); and "records exported" rises. On the cache you can see live flows:</p>
<pre class="code">KCH-EDGE-R2# show flow monitor GF-MON-FLOW cache format table</pre>
<pre class="out">IPV4 SOURCE ADDRESS   IPV4 DESTINATION ADDRESS  IP PROTOCOL  TRNS SOURCE PORT  TRNS DESTINATION PORT  INTERFACE INPUT  counter bytes  counter packets
===================   ========================  ===========  ================  =====================  ===============  =============  ===============
10.2.20.21            10.1.20.10                6            51044             443                    Gi0/0            184220         214
10.2.20.35            10.1.20.10                6            40122             443                    Gi0/0            91340          118
10.2.20.21            10.1.50.100               17           60001             53                     Gi0/0            148            2</pre>

<h3>On the collector</h3>
<pre class="code">NMS# show flows</pre>
<pre class="out">Flow records received (collector UDP 9995, v9)
SRC             DST             PROTO  SPORT  DPORT  BYTES     PKTS  EXPORTER
10.2.20.21      10.1.20.10      6      51044  443    184220    214   10.255.0.2
10.2.20.35      10.1.20.10      6      40122  443    91340     118   10.255.0.2</pre>
<p>Records on the collector from 10.255.0.2 prove the whole chain. The first one can take a minute, because it waits for the timeout and for the template.</p>

<div class="eg"><p><b>Worked example.</b> Add up 184,220 and 91,340 bytes: 275,560 bytes from Kochi to the ERP server in this short window. If the active timeout is 60 seconds and a nightly backup streams 600 MB, the router sends a record roughly every minute, each carrying about 10 MB, instead of waiting for the whole transfer to end.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Building the monitor and forgetting to apply it to an interface. (2) Applying input on every interface and also output, double counting. (3) A wrong destination or port in the exporter. (4) Choosing IPFIX while the collector accepts only v9. (5) Leaving the source as a physical interface when the collector expects the loopback.</p></div>
<div class="exam"><p><b>Exam trap.</b> The order is record, exporter, monitor, interface. A monitor that names a record or exporter which does not exist is rejected. Remember that the exporter is where version, destination and port are set, while timeouts are set in the monitor cache.</p></div>

<div class="scn"><h4>Everything configured, graphs empty</h4><p>Ravi Menon configured a record, an exporter and a monitor on R-KCH and saw nothing on NMS. The command show flow monitor said "not allocated". He had never typed the ip flow monitor line on an interface. After applying it on Gi0/0 and Gi0/1 in the input direction, records appeared within a minute.</p><p><b>Lesson:</b> a monitor that is not applied watches nothing.</p></div>

<div class="iv"><p class="q">"Explain the components of Flexible NetFlow."</p><p>Strong answer: a record defines the key and non-key fields, an exporter defines the collector address, port, source and version, a monitor ties one record to one or more exporters and holds the cache and timeouts, and the monitor is applied to an interface in a direction. Mention that exports are UDP and one-way, so verify on both the router and the collector.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flexible NetFlow has four parts: record, exporter, monitor and the interface application.</li>
<li>Match fields are keys; collect fields add counters such as bytes and packets.</li>
<li>The exporter sets destination 10.1.50.100, source Loopback0, UDP 9995 and the protocol version.</li>
<li>ip flow monitor GF-MON-FLOW input on an interface turns the whole thing on.</li>
<li>Verify with show flow exporter, show flow monitor, show flow interface and show flows on the collector.</li>
</ul></div>
`,hi:`
<h3>Chaar building blocks, har ek ka ek idea</h3>
<p>Modern routers <b>Flexible NetFlow</b> use karte hain. Ek fixed switch ke bajaye aap feature ko chaar chhote parts se jodte ho. Office ki photocopy service socho. <b>Record</b> woh form hai jo batata hai kaun se boxes copy karne hain. <b>Exporter</b> courier ka address aur delivery rules hain. <b>Monitor</b> woh desk hai jo ek form ko ek courier se jodta hai aur kaam ka dher (cache) rakhta hai. <b>Interface</b> line woh darwaza hai jahan desk business ke liye khulta hai.</p>
<div class="dia">`+e+`<p class="cap">Record aur exporter monitor mein plug hote hain; monitor interface par ek direction mein apply hota hai.</p></div>
<table class="cmp"><tr><th>Block</th><th>Kaun sa sawal solve karta hai</th><th>Typical lines</th></tr>
<tr><td>Record</td><td>Hum kya track karein?</td><td>match (key fields), collect (extra counters)</td></tr>
<tr><td>Exporter</td><td>Records kahan aur kaise jaayein?</td><td>destination, source, transport udp, export-protocol</td></tr>
<tr><td>Monitor</td><td>Kaun sa record, kaun sa exporter, kitni der cache?</td><td>record, exporter, cache timeout</td></tr>
<tr><td>Interface</td><td>Kaun sa traffic dekha jaaye?</td><td>ip flow monitor NAME input</td></tr></table>

<h3>Step 1: record</h3>
<pre class="code">KCH-EDGE-R2(config)# flow record GF-REC
KCH-EDGE-R2(config-flow-record)# match ipv4 source address
KCH-EDGE-R2(config-flow-record)# match ipv4 destination address
KCH-EDGE-R2(config-flow-record)# match ipv4 protocol
KCH-EDGE-R2(config-flow-record)# match transport source-port
KCH-EDGE-R2(config-flow-record)# match transport destination-port
KCH-EDGE-R2(config-flow-record)# match interface input
KCH-EDGE-R2(config-flow-record)# collect counter bytes
KCH-EDGE-R2(config-flow-record)# collect counter packets
KCH-EDGE-R2(config-flow-record)# exit</pre>
<p>Chhe <code>match</code> lines key fields hain: five-tuple plus input interface. Do <code>collect</code> lines non-key fields hain jo traffic guzarte hue bharte hain. Byte counter ke bina aap top talkers rank nahi kar sakte. Agar custom layout nahi chahiye to kai platforms ready-made record dete hain jo classic NetFlow jaisa hai, monitor ke andar <code>record netflow ipv4 original-input</code> likha jaata hai. Custom record tab use karo jab timestamps ya DSCP jaise fields jodne hon.</p>

<h3>Step 2: exporter</h3>
<pre class="code">KCH-EDGE-R2(config)# flow exporter GF-EXPORT
KCH-EDGE-R2(config-flow-exporter)# destination 10.1.50.100
KCH-EDGE-R2(config-flow-exporter)# source Loopback0
KCH-EDGE-R2(config-flow-exporter)# transport udp 9995
KCH-EDGE-R2(config-flow-exporter)# export-protocol netflow-v9
KCH-EDGE-R2(config-flow-exporter)# exit</pre>
<ul>
<li><b>destination</b> collector hai. Yahan galat address sabse aam galti hai.</li>
<li><b>source Loopback0</b> datagrams ko 10.255.0.2 se bhejta hai. Lab ka collector sirf jaane-pehchane router loopbacks se exports accept karta hai. Koi aur source address reject hota hai, bilkul firewall ki tarah.</li>
<li><b>transport udp 9995</b> collector port hai. Yeh wahi hona chahiye jis par collector sunta hai.</li>
<li><b>export-protocol</b> <code>netflow-v9</code> ya <code>ipfix</code> ho sakta hai (aur classic ke liye <code>netflow-v5</code>). Jo version aap chuno use collector samajhna chahiye.</li>
</ul>

<h3>Step 3: monitor</h3>
<pre class="code">KCH-EDGE-R2(config)# flow monitor GF-MON-FLOW
KCH-EDGE-R2(config-flow-monitor)# record GF-REC
KCH-EDGE-R2(config-flow-monitor)# exporter GF-EXPORT
KCH-EDGE-R2(config-flow-monitor)# cache timeout active 60
KCH-EDGE-R2(config-flow-monitor)# cache timeout inactive 15
KCH-EDGE-R2(config-flow-monitor)# exit</pre>
<p>Monitor abhi kuch nahi karta. Yeh bina darwaze wala desk hai. Timeouts wahi hain jo chapter 1 mein the: inactive 15 second idle flow ko khatam karta hai; active 60 second lambe flow ko har minute export karta hai taaki aapke graphs 30 minute late na hon.</p>

<h3>Step 4: interface par apply karo</h3>
<pre class="code">KCH-EDGE-R2(config)# interface GigabitEthernet0/0
KCH-EDGE-R2(config-if)# ip flow monitor GF-MON-FLOW input
KCH-EDGE-R2(config-if)# exit
KCH-EDGE-R2(config)# interface GigabitEthernet0/1
KCH-EDGE-R2(config-if)# ip flow monitor GF-MON-FLOW input
KCH-EDGE-R2(config-if)# end</pre>
<p>Direction matter karti hai. <b>Input</b> matlab us interface par aane wala traffic. Agar aap har interface par input dekhte ho to har packet router mein ghuste waqt ek baar dikhta hai, jisse double counting nahi hoti. Ek hi box par input aur output dono dekhne se transit traffic do baar gina jaata hai. Users ki taraf aur circuit ki taraf wale interfaces chuno aur unpar input lagao.</p>

<h3>Verification</h3>
<pre class="code">KCH-EDGE-R2# show flow exporter GF-EXPORT
KCH-EDGE-R2# show flow monitor GF-MON-FLOW
KCH-EDGE-R2# show flow interface</pre>
<pre class="out">Flow Exporter GF-EXPORT:
  Description:              User defined
  Export protocol:          NetFlow Version 9
  Transport Configuration:
    Destination IP address: <span class="hl">10.1.50.100</span>
    Source IP address:      10.255.0.2
    Source Interface:       Loopback0
    Transport Protocol:     UDP
    Destination Port:       <span class="hl">9995</span>
    Source Port:            50312
  Export statistics:
    <span class="hl">86 records exported in 12 packets</span>
    0 records dropped (no route to collector)

Flow Monitor GF-MON-FLOW:
  Flow Record:       GF-REC
  Flow Exporter:     GF-EXPORT
  Cache:
    Status:               <span class="hl">allocated</span>
    Inactive Timeout:     15 secs
    Active Timeout:       60 secs

Interface GigabitEthernet0/0
  FNF:  monitor:         GF-MON-FLOW
        direction:       <span class="hl">Input</span></pre>
<p>Chaar cheezein check karo: destination aur port sahi hain; source interface Loopback0 hai; monitor <b>allocated</b> dikhata hai (kahin apply hua hai; "not allocated" matlab koi interface use nahi karta); aur "records exported" badh raha hai. Cache mein live flows dikhte hain:</p>
<pre class="code">KCH-EDGE-R2# show flow monitor GF-MON-FLOW cache format table</pre>
<pre class="out">IPV4 SOURCE ADDRESS   IPV4 DESTINATION ADDRESS  IP PROTOCOL  TRNS SOURCE PORT  TRNS DESTINATION PORT  INTERFACE INPUT  counter bytes  counter packets
===================   ========================  ===========  ================  =====================  ===============  =============  ===============
10.2.20.21            10.1.20.10                6            51044             443                    Gi0/0            184220         214
10.2.20.35            10.1.20.10                6            40122             443                    Gi0/0            91340          118
10.2.20.21            10.1.50.100               17           60001             53                     Gi0/0            148            2</pre>

<h3>Collector par</h3>
<pre class="code">NMS# show flows</pre>
<pre class="out">Flow records received (collector UDP 9995, v9)
SRC             DST             PROTO  SPORT  DPORT  BYTES     PKTS  EXPORTER
10.2.20.21      10.1.20.10      6      51044  443    184220    214   10.255.0.2
10.2.20.35      10.1.20.10      6      40122  443    91340     118   10.255.0.2</pre>
<p>10.255.0.2 se collector par aaye records poori chain sabit karte hain. Pehla record aane mein ek minute lag sakta hai, kyunki woh timeout aur template ka intezaar karta hai.</p>

<div class="eg"><p><b>Worked example.</b> 184,220 aur 91,340 bytes jodo: is chhoti window mein Kochi se ERP server tak 275,560 bytes. Agar active timeout 60 second hai aur raat ka backup 600 MB stream karta hai, to router lagbhag har minute ek record bhejta hai, har ek mein lagbhag 10 MB, poore transfer ke khatam hone ka intezaar karne ke bajaye.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Monitor banakar use interface par apply karna bhool jaana. (2) Har interface par input aur output dono lagana, double counting. (3) Exporter mein galat destination ya port. (4) IPFIX chunna jabki collector sirf v9 accept karta hai. (5) Source physical interface rakhna jabki collector loopback expect karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Order hai record, exporter, monitor, interface. Aisa monitor jo na-maujood record ya exporter ka naam le reject hota hai. Yaad rakho ki version, destination aur port exporter mein set hote hain, jabki timeouts monitor cache mein.</p></div>

<div class="scn"><h4>Sab configure, graphs khaali</h4><p>Ravi Menon ne R-KCH par record, exporter aur monitor configure kiye aur NMS par kuch nahi dikha. show flow monitor ne "not allocated" kaha. Usne kisi interface par ip flow monitor line kabhi type hi nahi ki thi. Gi0/0 aur Gi0/1 par input direction mein apply karne ke baad ek minute ke andar records aa gaye.</p><p><b>Seekh:</b> jo monitor apply nahi hua woh kuch nahi dekhta.</p></div>

<div class="iv"><p class="q">"Flexible NetFlow ke components samjhao."</p><p>Strong answer: record key aur non-key fields define karta hai, exporter collector address, port, source aur version define karta hai, monitor ek record ko ek ya zyada exporters se jodta hai aur cache aur timeouts rakhta hai, aur monitor interface par ek direction mein apply hota hai. Yeh bolo ki exports UDP aur one-way hain, isliye router aur collector dono par verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flexible NetFlow ke chaar parts hain: record, exporter, monitor aur interface application.</li>
<li>Match fields keys hain; collect fields bytes aur packets jaise counters jodte hain.</li>
<li>Exporter destination 10.1.50.100, source Loopback0, UDP 9995 aur protocol version set karta hai.</li>
<li>Interface par ip flow monitor GF-MON-FLOW input lagane se sab on hota hai.</li>
<li>show flow exporter, show flow monitor, show flow interface aur collector par show flows se verify karo.</li>
</ul></div>
`}};export{t as default};