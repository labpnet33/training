var e={id:`subscriptions`,h:{en:`Subscriptions: sensor groups, destinations, periodic and on-change`,hi:`Subscriptions: sensor groups, destinations, periodic aur on-change`},body:{en:`
<p><b>The recipe in one sentence.</b> A telemetry subscription answers three questions: <i>what</i> data (the sensor paths), <i>where</i> to send it (the destination) and <i>how often</i> (the interval or a change trigger). On Cisco IOS XR these three answers are three small objects that you then tie together.</p>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="diagram"><rect x="20" y="25" width="127" height="60" rx="10" fill="#bae6fd"/><text x="83.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Sensor group</text><text x="83.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">paths (what)</text><line x1="147" y1="55" x2="177" y2="55" stroke="#64748b" stroke-width="2"/><rect x="177" y="25" width="127" height="60" rx="10" fill="#bbf7d0"/><text x="240.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Destination group</text><text x="240.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">collector (where)</text><line x1="304" y1="55" x2="334" y2="55" stroke="#64748b" stroke-width="2"/><rect x="334" y="25" width="127" height="60" rx="10" fill="#ddd6fe"/><text x="397.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Subscription</text><text x="397.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">interval (how often)</text><line x1="461" y1="55" x2="491" y2="55" stroke="#64748b" stroke-width="2"/><rect x="491" y="25" width="127" height="60" rx="10" fill="#fde68a"/><text x="554.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Streamed data</text><text x="554.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">to the collector</text></svg><p class="cap">A subscription ties sensor groups to destination groups at a sample interval.</p></div>
<h3>IOS XR model-driven telemetry (dial-out)</h3>
<p><b>Reference configuration (not run in the simulator).</b> The collector address is a documentation placeholder. Sample interval is in milliseconds.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator) - IOS XR</span>
telemetry model-driven
 destination-group DG-COLLECTOR
  address-family ipv4 192.0.2.50 port 57500
   encoding self-describing-gpb
   protocol grpc tls-hostname collector.example
 !
 sensor-group SG-INTERFACES
  sensor-path Cisco-IOS-XR-infra-statsd-oper:infra-statistics/interfaces/interface/latest/generic-counters
 !
 sensor-group SG-BGP
  sensor-path Cisco-IOS-XR-ipv4-bgp-oper:bgp/instances/instance/instance-active/default-vrf/neighbors/neighbor
 !
 subscription SUB-IF
  sensor-group-id SG-INTERFACES sample-interval 30000
  destination-id DG-COLLECTOR
 !
 subscription SUB-BGP
  sensor-group-id SG-BGP sample-interval 60000
  destination-id DG-COLLECTOR</pre>
<p>Read it from the bottom up: SUB-IF says "every 30000 ms send the interface counters to the collector". One destination group can serve many subscriptions, and one sensor group can be used in many subscriptions with different intervals. The <code>tls-hostname</code> keyword makes the router verify the collector certificate; older labs use <code>no-tls</code>, which you should avoid.</p>
<p><b>Verification commands</b> on IOS XR (the output depends on your release, so only the commands are given):</p>
<pre class="code">show telemetry model-driven subscription
show telemetry model-driven destination
show telemetry model-driven sensor-group</pre>
<h3>IOS XE telemetry (RFC 8641 style)</h3>
<p>IOS XE uses the IETF YANG-push model. A subscription has an ID, an XPath filter, an encoding, an update policy and a receiver.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator) - IOS XE</span>
telemetry ietf subscription 101
 encoding encode-kvgpb
 filter xpath /interfaces-ios-xe-oper:interfaces/interface/statistics
 stream yang-push
 update-policy periodic 3000
 receiver ip address 192.0.2.50 57500 protocol grpc-tcp
<span class="c">! periodic 3000 means 3000 centiseconds = 30 seconds</span>
show telemetry ietf subscription all</pre>
<h3>Periodic or on-change</h3>
<table class="cmp"><tr><th>Type</th><th>What is sent</th><th>Best for</th></tr><tr><td>Periodic (sample)</td><td>The current value every interval, even if unchanged</td><td>Counters and gauges: bytes, errors, utilisation, optics power</td></tr><tr><td>On-change</td><td>An update only when the value changes (plus an initial snapshot)</td><td>State: interface up/down, BGP session state, alarms</td></tr></table>
<p>On-change is cheap for rare events and gives instant notification, but only paths that the platform marks as on-change capable support it. Many providers combine both: on-change for state transitions, and periodic for counters. gNMI uses the names <code>SAMPLE</code>, <code>ON_CHANGE</code> and <code>TARGET_DEFINED</code> (let the device choose the best mode per path). A <b>heartbeat interval</b> makes an on-change subscription send the value periodically anyway, so the collector knows the stream is alive.</p>
<div class="eg"><p><b>Worked example.</b> Interface state: ON_CHANGE with a 5-minute heartbeat. Interface counters: SAMPLE every 30 seconds. BGP neighbor state: ON_CHANGE. Optics receive power: SAMPLE every 60 seconds. Total load on the router stays low because each path uses the cheapest mode that meets the need.</p></div>
<div class="warn"><p><b>Common mistake.</b> Setting very short intervals everywhere. A 1-second subscription of every counter on a router with thousands of interfaces creates a flood of data and can overload the router and the collector. Pick the interval from the use case, and subscribe only to the paths you need. Many platforms enforce a minimum interval.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the three Cisco objects (destination-group, sensor-group, subscription), that the sample-interval is in milliseconds on IOS XR, and that on-change suits state while periodic suits counters.</p></div>
<div class="scn"><h4>The subscription that flooded the collector</h4><p>A new engineer set a 1-second sample interval on all interface counters on 300 PEs. The collector queue grew, data arrived late and the router CPU rose. The fix was a 30-second interval for counters, on-change for state, and a rule that new subscriptions are reviewed for path scope and interval.</p><p><b>Lesson:</b> Interval and scope are capacity decisions.</p></div>
<div class="iv"><p class="q">"Walk me through configuring MDT dial-out on IOS XR."</p><p>Under telemetry model-driven I create a destination-group with the collector address, port, encoding and TLS protocol, a sensor-group with the YANG sensor paths, and a subscription that ties them with a sample-interval in milliseconds. Then I verify with show telemetry model-driven subscription and destination, and confirm at the collector that records arrive.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>A subscription = what (sensor group) + where (destination group) + how often (interval).</li>
<li>IOS XR sample-interval is in milliseconds; IOS XE periodic is in centiseconds.</li>
<li>Periodic for counters; on-change for state.</li>
<li>Use TLS to the collector and review scope and intervals.</li>
<li>Verify with the show telemetry commands and at the collector.</li></ul></div>
`,hi:`
<p><b>Recipe ek sentence mein.</b> Telemetry subscription teen sawaalon ka jawab deti hai: <i>kya</i> data (sensor paths), <i>kahan</i> bhejna hai (destination) aur <i>kitni baar</i> (interval ya change trigger). Cisco IOS XR par yeh teen jawab teen chhote objects hain jinhe phir jod dete hain.</p>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="diagram"><rect x="20" y="25" width="127" height="60" rx="10" fill="#bae6fd"/><text x="83.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Sensor group</text><text x="83.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">paths (kya)</text><line x1="147" y1="55" x2="177" y2="55" stroke="#64748b" stroke-width="2"/><rect x="177" y="25" width="127" height="60" rx="10" fill="#bbf7d0"/><text x="240.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Destination group</text><text x="240.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">collector (kahan)</text><line x1="304" y1="55" x2="334" y2="55" stroke="#64748b" stroke-width="2"/><rect x="334" y="25" width="127" height="60" rx="10" fill="#ddd6fe"/><text x="397.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Subscription</text><text x="397.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">interval (kitni baar)</text><line x1="461" y1="55" x2="491" y2="55" stroke="#64748b" stroke-width="2"/><rect x="491" y="25" width="127" height="60" rx="10" fill="#fde68a"/><text x="554.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Streamed data</text><text x="554.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">collector tak</text></svg><p class="cap">Subscription sensor groups ko destination groups se sample interval par jodti hai.</p></div>
<h3>IOS XR model-driven telemetry (dial-out)</h3>
<p><b>Reference configuration (not run in the simulator).</b> Collector address documentation placeholder hai. Sample interval milliseconds mein hai.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator) - IOS XR</span>
telemetry model-driven
 destination-group DG-COLLECTOR
  address-family ipv4 192.0.2.50 port 57500
   encoding self-describing-gpb
   protocol grpc tls-hostname collector.example
 !
 sensor-group SG-INTERFACES
  sensor-path Cisco-IOS-XR-infra-statsd-oper:infra-statistics/interfaces/interface/latest/generic-counters
 !
 sensor-group SG-BGP
  sensor-path Cisco-IOS-XR-ipv4-bgp-oper:bgp/instances/instance/instance-active/default-vrf/neighbors/neighbor
 !
 subscription SUB-IF
  sensor-group-id SG-INTERFACES sample-interval 30000
  destination-id DG-COLLECTOR
 !
 subscription SUB-BGP
  sensor-group-id SG-BGP sample-interval 60000
  destination-id DG-COLLECTOR</pre>
<p>Ise neeche se upar padho: SUB-IF kehti hai "har 30000 ms par interface counters collector ko bhejo". Ek destination group kai subscriptions ko serve kar sakta hai, aur ek sensor group alag intervals ke saath kai subscriptions mein use ho sakta hai. <code>tls-hostname</code> keyword router ko collector certificate verify karne deta hai; purane labs <code>no-tls</code> use karte hain, jisse bachna chahiye.</p>
<p><b>Verification commands</b> IOS XR par (output release par depend karta hai, isliye sirf commands diye hain):</p>
<pre class="code">show telemetry model-driven subscription
show telemetry model-driven destination
show telemetry model-driven sensor-group</pre>
<h3>IOS XE telemetry (RFC 8641 style)</h3>
<p>IOS XE IETF YANG-push model use karta hai. Subscription mein ID, XPath filter, encoding, update policy aur receiver hota hai.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator) - IOS XE</span>
telemetry ietf subscription 101
 encoding encode-kvgpb
 filter xpath /interfaces-ios-xe-oper:interfaces/interface/statistics
 stream yang-push
 update-policy periodic 3000
 receiver ip address 192.0.2.50 57500 protocol grpc-tcp
<span class="c">! periodic 3000 means 3000 centiseconds = 30 seconds</span>
show telemetry ietf subscription all</pre>
<h3>Periodic ya on-change</h3>
<table class="cmp"><tr><th>Type</th><th>Kya bheja jaata hai</th><th>Kiske liye best</th></tr><tr><td>Periodic (sample)</td><td>Har interval par current value, badli na ho tab bhi</td><td>Counters aur gauges: bytes, errors, utilisation, optics power</td></tr><tr><td>On-change</td><td>Update sirf value badalne par (plus initial snapshot)</td><td>State: interface up/down, BGP session state, alarms</td></tr></table>
<p>On-change rare events ke liye sasta hai aur instant notification deta hai, par sirf wahi paths support karte hain jinhe platform on-change capable mark karta hai. Kai providers dono combine karte hain: state transitions ke liye on-change, counters ke liye periodic. gNMI naam use karta hai <code>SAMPLE</code>, <code>ON_CHANGE</code> aur <code>TARGET_DEFINED</code> (device har path ke liye best mode chune). <b>Heartbeat interval</b> on-change subscription ko phir bhi periodically value bhejne deta hai, taaki collector ko pata rahe ki stream zinda hai.</p>
<div class="eg"><p><b>Worked example.</b> Interface state: 5-minute heartbeat ke saath ON_CHANGE. Interface counters: har 30 seconds SAMPLE. BGP neighbor state: ON_CHANGE. Optics receive power: har 60 seconds SAMPLE. Router par total load kam rehta hai kyunki har path wo sabse sasta mode use karta hai jo zaroorat poori kare.</p></div>
<div class="warn"><p><b>Common mistake.</b> Har jagah bahut chhote intervals set karna. Hazaron interfaces wale router par har counter ki 1-second subscription data ki baadh la deti hai aur router aur collector dono overload kar sakti hai. Interval use case se chuno, aur sirf zaroori paths subscribe karo. Kai platforms minimum interval enforce karte hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Teen Cisco objects (destination-group, sensor-group, subscription) yaad rakho, IOS XR par sample-interval milliseconds mein hai, aur on-change state ke liye aur periodic counters ke liye hai.</p></div>
<div class="scn"><h4>Subscription jisne collector par baadh la di</h4><p>Ek naye engineer ne 300 PEs par saare interface counters par 1-second sample interval set kiya. Collector queue badhi, data der se aaya aur router CPU badha. Fix tha counters ke liye 30-second interval, state ke liye on-change, aur rule ki nayi subscriptions ka path scope aur interval review ho.</p><p><b>Lesson:</b> Interval aur scope capacity decisions hain.</p></div>
<div class="iv"><p class="q">"IOS XR par MDT dial-out configure karna samjhao."</p><p>Telemetry model-driven ke neeche main collector address, port, encoding aur TLS protocol wala destination-group, YANG sensor paths wala sensor-group, aur dono ko milliseconds mein sample-interval ke saath jodne wali subscription banata hoon. Phir show telemetry model-driven subscription aur destination se verify karta hoon aur collector par confirm karta hoon ki records aa rahe hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Subscription = kya (sensor group) + kahan (destination group) + kitni baar (interval).</li>
<li>IOS XR sample-interval milliseconds mein hai; IOS XE periodic centiseconds mein.</li>
<li>Counters ke liye periodic; state ke liye on-change.</li>
<li>Collector tak TLS use karo aur scope aur intervals review karo.</li>
<li>show telemetry commands aur collector par verify karo.</li></ul></div>
`}};export{e as default};