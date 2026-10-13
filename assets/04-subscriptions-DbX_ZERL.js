var e={id:`subscriptions`,h:{en:`Subscriptions: periodic, on-change, filters and streams`,hi:`Subscriptions: periodic, on-change, filters aur streams`},body:{en:`
<p><b>One idea:</b> a <b>subscription</b> is a standing order. Instead of asking for data again and again, you say once: "send me <i>this data</i>, <i>this often</i>, to <i>this place</i>". The device then keeps sending until the subscription is removed or the connection dies. This is like subscribing to a newspaper rather than walking to the shop every morning.</p>
<h3>The four parts of every subscription</h3>
<table class="cmp"><tr><th>Part</th><th>Question answered</th><th>Example</th></tr><tr><td>Data (filter)</td><td>What do I want?</td><td>/interfaces-ios-xe-oper:interfaces/interface/statistics</td></tr><tr><td>Trigger (update policy)</td><td>When should you send?</td><td>Every 60 s, or when a value changes</td></tr><tr><td>Receiver</td><td>Where does it go?</td><td>198.51.100.20 port 57000</td></tr><tr><td>Encoding and transport</td><td>In what form, over what?</td><td>kvGPB over gRPC</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Filter XPath to the data to Trigger periodic or on-change to Encode JSON or GPB to Receiver collector, port"><rect x="20" y="40" width="124" height="76" rx="10" fill="#bae6fd"/><text x="82" y="74" text-anchor="middle" class="svg-ink" font-size="13">Filter</text><text x="82" y="90" text-anchor="middle" class="svg-muted" font-size="12">XPath to the data</text><line x1="144" y1="78" x2="174" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="178,78 170,73 170,83" fill="#64748b"/><rect x="178" y="40" width="124" height="76" rx="10" fill="#fde68a"/><text x="240" y="74" text-anchor="middle" class="svg-ink" font-size="13">Trigger</text><text x="240" y="90" text-anchor="middle" class="svg-muted" font-size="12">periodic or on-change</text><line x1="302" y1="78" x2="332" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="336,78 328,73 328,83" fill="#64748b"/><rect x="336" y="40" width="124" height="76" rx="10" fill="#ddd6fe"/><text x="398" y="74" text-anchor="middle" class="svg-ink" font-size="13">Encode</text><text x="398" y="90" text-anchor="middle" class="svg-muted" font-size="12">JSON or GPB</text><line x1="460" y1="78" x2="490" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="494,78 486,73 486,83" fill="#64748b"/><rect x="494" y="40" width="124" height="76" rx="10" fill="#bbf7d0"/><text x="556" y="74" text-anchor="middle" class="svg-ink" font-size="13">Receiver</text><text x="556" y="90" text-anchor="middle" class="svg-muted" font-size="12">collector, port</text></svg><p class="cap">A subscription ties a data path to a trigger, an encoding and a receiver.</p></div>
<h3>Periodic versus on-change</h3>
<ul><li><b>Periodic</b> sends the whole selected data every <i>N</i> time units, whether or not it changed. It is ideal for counters, because you need a steady series to compute rates and draw graphs. Choose the interval to match what you must see (10 to 60 seconds is common for interfaces).</li><li><b>On-change</b> sends only when a value changes, such as an interface going up or down or a BGP neighbour state change. It is efficient and instant for state, but it is meaningless for counters (they change constantly) and not every path supports it. The platform tells you which paths are on-change capable.</li><li>Some designs combine both: on-change for state plus a slow periodic <b>sync</b> (a heartbeat) so the collector can recover after missing a message.</li></ul>
<p>The standards behind this are RFC 8639 (subscribed notifications, which defines the subscription itself) and RFC 8641 (YANG-Push, which adds periodic and on-change updates for datastore data). You will see the word <b>yang-push</b> as the stream name in configurations.</p>
<h3>Reference configuration: IOS XE</h3>
<pre class="code"><span class="c">! Reference code (not run in the simulator)</span>
telemetry ietf subscription 101
 encoding encode-kvgpb
 filter xpath /interfaces-ios-xe-oper:interfaces/interface/statistics
 source-address 192.0.2.10
 stream yang-push
 update-policy periodic 6000
 receiver ip address 198.51.100.20 57000 protocol grpc-tcp
<span class="c">!</span>
telemetry ietf subscription 102
 encoding encode-kvgpb
 filter xpath /interfaces-ios-xe-oper:interfaces/interface/oper-status
 source-address 192.0.2.10
 stream yang-push
 update-policy on-change
 receiver ip address 198.51.100.20 57000 protocol grpc-tcp</pre>
<p>Read it in plain words. Subscription 101 asks for interface statistics, encoded as kvGPB (key-value Google Protocol Buffers), from the <b>yang-push</b> stream. <code>update-policy periodic 6000</code> means every 6000 <i>centiseconds</i>, which is 60 seconds. The <code>source-address</code> is the device address the connection will come from. The <code>receiver</code> line names the collector, port 57000 and the protocol <code>grpc-tcp</code>. Subscription 102 is on-change, so interface up/down changes are pushed at once. The number after <code>subscription</code> is an ID you choose. To check, engineers use <code>show telemetry ietf subscription all</code> and look at each subscription's state and receiver state; chapter 8 explains what to look for.</p>
<h3>Reference configuration: IOS XR</h3>
<pre class="code"><span class="c">! Reference code (not run in the simulator)</span>
telemetry model-driven
 sensor-group INTF-COUNTERS
  sensor-path Cisco-IOS-XR-infra-statsd-oper:infra-statistics/interfaces/interface/latest/generic-counters
<span class="c"> !</span>
 destination-group COLLECTORS
  address-family ipv4 198.51.100.20 port 57500
   encoding self-describing-gpb
   protocol grpc no-tls
<span class="c">  !</span>
<span class="c"> !</span>
 subscription SUB-INTF
  sensor-group-id INTF-COUNTERS sample-interval 30000
  destination-id COLLECTORS</pre>
<p>IOS XR uses three separate building blocks, which you then tie together. A <b>sensor-group</b> lists the paths. A <b>destination-group</b> lists the collectors (address, port, encoding, protocol). A <b>subscription</b> joins them with a <code>sample-interval</code> in <i>milliseconds</i>: 30000 is 30 seconds. Splitting the parts lets one sensor group go to several collectors. Notice the unit difference: IOS XE counts centiseconds, IOS XR milliseconds. Mixing them up is a classic mistake. This style is covered in more depth in <i>spcor-telemetry</i>.</p>
<h3>Sizing the load</h3>
<pre class="code">devices = 200
interfaces = 48
for seconds in (300, 60, 10):
    updates_per_hour = devices * (3600 // seconds)       # one message per device per interval
    values_per_hour = updates_per_hour * interfaces       # each message carries every interface
    print(f"every {seconds:&gt;3} s -&gt; {updates_per_hour:&gt;7} messages/hour, {values_per_hour:&gt;9} interface records/hour")</pre>
<pre class="out">every 300 s -&gt;    2400 messages/hour,    115200 interface records/hour
every  60 s -&gt;   12000 messages/hour,    576000 interface records/hour
every  10 s -&gt;   72000 messages/hour,   3456000 interface records/hour</pre>
<p>The loop tries three intervals for 200 devices with 48 interfaces. The <code>//</code> operator divides and drops the remainder, and <code>:&gt;7</code> inside the f-string right-aligns the number in a 7-character column. Dropping the interval from five minutes to ten seconds makes thirty times more messages. Plan the collector and database capacity before you shorten an interval, not after the dashboard goes blank.</p>
<div class="warn"><p><b>Common mistake.</b> Using on-change for counters. The value changes every second, so the device either floods the collector or the platform rejects the subscription. Use periodic for counters and on-change for state.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the units: IOS XE <code>update-policy periodic</code> is in centiseconds, IOS XR <code>sample-interval</code> is in milliseconds. Know that on-change is for state and periodic is for counters, and that RFC 8641 defines YANG-Push.</p></div>
<div class="scn"><h4>Interface flaps seen in two seconds</h4><p>A branch uplink flapped overnight. The old 5-minute SNMP graph showed nothing. A team that had added an on-change subscription to <code>oper-status</code> saw each down and up event with its timestamp in the collector, matched them to the carrier's maintenance notice, and closed the ticket without a site visit.</p><p><b>Lesson:</b> On-change is the right trigger for state events.</p></div>
<div class="iv"><p class="q">"How do periodic and on-change subscriptions differ and when do you use each?"</p><p>Periodic sends the selected data at a fixed interval regardless of change, so it suits counters and gives a steady series for rates. On-change sends only when a value changes, so it suits state such as interface or BGP status with instant notification and low volume. I often use both, plus a slow periodic sync so the collector can recover after loss.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>A subscription has four parts: filter, trigger, encoding and receiver.</li><li>Periodic suits counters; on-change suits state; combine with a slow sync.</li><li>RFC 8639 defines subscribed notifications; RFC 8641 defines YANG-Push; the stream is yang-push.</li><li>Units differ: IOS XE centiseconds, IOS XR milliseconds.</li><li>Shorter intervals multiply load: size the collector first.</li></ul></div>
`,hi:`
<p><b>Ek idea:</b> <b>subscription</b> ek standing order hai. Baar-baar data maangne ki jagah aap ek baar kehte ho: "<i>yeh data</i>, <i>itni baar</i>, <i>is jagah</i> bhejo". Device tab tak bhejta rehta hai jab tak subscription hata na di jaaye ya connection toot na jaaye. Yeh akhbaar subscribe karne jaisa hai, roz dukaan tak chalne ke bajay.</p>
<h3>Har subscription ke chaar hisse</h3>
<table class="cmp"><tr><th>Hissa</th><th>Kaunsa sawaal</th><th>Example</th></tr><tr><td>Data (filter)</td><td>Mujhe kya chahiye?</td><td>/interfaces-ios-xe-oper:interfaces/interface/statistics</td></tr><tr><td>Trigger (update policy)</td><td>Kab bhejna hai?</td><td>Har 60 s, ya value badalne par</td></tr><tr><td>Receiver</td><td>Kahan jaana hai?</td><td>198.51.100.20 port 57000</td></tr><tr><td>Encoding and transport</td><td>Kis form mein, kispe?</td><td>gRPC par kvGPB</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Filter data ka XPath to Trigger periodic ya on-change to Encode JSON ya GPB to Receiver collector, port"><rect x="20" y="40" width="124" height="76" rx="10" fill="#bae6fd"/><text x="82" y="74" text-anchor="middle" class="svg-ink" font-size="13">Filter</text><text x="82" y="90" text-anchor="middle" class="svg-muted" font-size="12">data ka XPath</text><line x1="144" y1="78" x2="174" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="178,78 170,73 170,83" fill="#64748b"/><rect x="178" y="40" width="124" height="76" rx="10" fill="#fde68a"/><text x="240" y="74" text-anchor="middle" class="svg-ink" font-size="13">Trigger</text><text x="240" y="90" text-anchor="middle" class="svg-muted" font-size="12">periodic ya on-change</text><line x1="302" y1="78" x2="332" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="336,78 328,73 328,83" fill="#64748b"/><rect x="336" y="40" width="124" height="76" rx="10" fill="#ddd6fe"/><text x="398" y="74" text-anchor="middle" class="svg-ink" font-size="13">Encode</text><text x="398" y="90" text-anchor="middle" class="svg-muted" font-size="12">JSON ya GPB</text><line x1="460" y1="78" x2="490" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="494,78 486,73 486,83" fill="#64748b"/><rect x="494" y="40" width="124" height="76" rx="10" fill="#bbf7d0"/><text x="556" y="74" text-anchor="middle" class="svg-ink" font-size="13">Receiver</text><text x="556" y="90" text-anchor="middle" class="svg-muted" font-size="12">collector, port</text></svg><p class="cap">Subscription data path ko trigger, encoding aur receiver se jodti hai.</p></div>
<h3>Periodic versus on-change</h3>
<ul><li><b>Periodic</b> chuna hua poora data har <i>N</i> time units par bhejta hai, badla ho ya na badla ho. Counters ke liye ideal hai, kyunki rates nikalne aur graphs banane ke liye steady series chahiye. Interval us hisaab se chuno jo dekhna zaroori hai (interfaces ke liye 10 se 60 second aam hai).</li><li><b>On-change</b> sirf tab bhejta hai jab value badle, jaise interface up ya down hona ya BGP neighbour state change. State ke liye yeh efficient aur turant hai, lekin counters ke liye bekaar hai (woh lagatar badalte hain) aur har path ise support nahi karta. Platform batata hai kaun se paths on-change capable hain.</li><li>Kuch designs dono jodte hain: state ke liye on-change aur dheemi periodic <b>sync</b> (heartbeat) taaki collector message miss karne ke baad recover kar sake.</li></ul>
<p>Iske peeche ke standards RFC 8639 (subscribed notifications, jo subscription khud define karta hai) aur RFC 8641 (YANG-Push, jo datastore data ke liye periodic aur on-change updates jodta hai) hain. Configurations mein <b>yang-push</b> stream ka naam dikhega.</p>
<h3>Reference configuration: IOS XE</h3>
<pre class="code"><span class="c">! Reference code (not run in the simulator)</span>
telemetry ietf subscription 101
 encoding encode-kvgpb
 filter xpath /interfaces-ios-xe-oper:interfaces/interface/statistics
 source-address 192.0.2.10
 stream yang-push
 update-policy periodic 6000
 receiver ip address 198.51.100.20 57000 protocol grpc-tcp
<span class="c">!</span>
telemetry ietf subscription 102
 encoding encode-kvgpb
 filter xpath /interfaces-ios-xe-oper:interfaces/interface/oper-status
 source-address 192.0.2.10
 stream yang-push
 update-policy on-change
 receiver ip address 198.51.100.20 57000 protocol grpc-tcp</pre>
<p>Ise saadi bhasha mein padho. Subscription 101 interface statistics maangti hai, kvGPB (key-value Google Protocol Buffers) mein encoded, <b>yang-push</b> stream se. <code>update-policy periodic 6000</code> ka matlab har 6000 <i>centiseconds</i>, yaani 60 second. <code>source-address</code> woh device address hai jisse connection aayega. <code>receiver</code> line collector, port 57000 aur protocol <code>grpc-tcp</code> batati hai. Subscription 102 on-change hai, isliye interface up/down changes turant push hote hain. <code>subscription</code> ke baad ka number ID hai jo aap chunte ho. Check karne ke liye engineers <code>show telemetry ietf subscription all</code> use karte hain aur har subscription ki state aur receiver state dekhte hain; chapter 8 batata hai kya dekhna hai.</p>
<h3>Reference configuration: IOS XR</h3>
<pre class="code"><span class="c">! Reference code (not run in the simulator)</span>
telemetry model-driven
 sensor-group INTF-COUNTERS
  sensor-path Cisco-IOS-XR-infra-statsd-oper:infra-statistics/interfaces/interface/latest/generic-counters
<span class="c"> !</span>
 destination-group COLLECTORS
  address-family ipv4 198.51.100.20 port 57500
   encoding self-describing-gpb
   protocol grpc no-tls
<span class="c">  !</span>
<span class="c"> !</span>
 subscription SUB-INTF
  sensor-group-id INTF-COUNTERS sample-interval 30000
  destination-id COLLECTORS</pre>
<p>IOS XR teen alag building blocks use karta hai, jinhe phir aap jodte ho. <b>sensor-group</b> paths ki list deta hai. <b>destination-group</b> collectors (address, port, encoding, protocol) ki list deta hai. <b>subscription</b> unhe <i>milliseconds</i> mein <code>sample-interval</code> ke saath jodta hai: 30000 matlab 30 second. Parts alag karne se ek sensor group kai collectors ko ja sakta hai. Unit ka fark dhyan do: IOS XE centiseconds ginta hai, IOS XR milliseconds. Inhe mila dena classic galti hai. Is style ko <i>spcor-telemetry</i> mein gehrai se cover kiya gaya hai.</p>
<h3>Load ka andaza</h3>
<pre class="code">devices = 200
interfaces = 48
for seconds in (300, 60, 10):
    updates_per_hour = devices * (3600 // seconds)       # one message per device per interval
    values_per_hour = updates_per_hour * interfaces       # each message carries every interface
    print(f"every {seconds:&gt;3} s -&gt; {updates_per_hour:&gt;7} messages/hour, {values_per_hour:&gt;9} interface records/hour")</pre>
<pre class="out">every 300 s -&gt;    2400 messages/hour,    115200 interface records/hour
every  60 s -&gt;   12000 messages/hour,    576000 interface records/hour
every  10 s -&gt;   72000 messages/hour,   3456000 interface records/hour</pre>
<p>Loop 200 devices aur 48 interfaces ke liye teen intervals aazmata hai. <code>//</code> operator divide karke remainder hata deta hai, aur f-string ke andar <code>:&gt;7</code> number ko 7-character column mein right-align karta hai. Interval paanch minute se dus second karne par messages tees guna ho jaate hain. Interval chhota karne se pehle collector aur database capacity plan karo, dashboard khaali hone ke baad nahi.</p>
<div class="warn"><p><b>Aam galti.</b> Counters ke liye on-change use karna. Value har second badalti hai, isliye device collector ko flood karta hai ya platform subscription reject kar deta hai. Counters ke liye periodic aur state ke liye on-change use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Units yaad rakho: IOS XE <code>update-policy periodic</code> centiseconds mein hai, IOS XR <code>sample-interval</code> milliseconds mein. Yaad rakho ki on-change state ke liye hai aur periodic counters ke liye, aur RFC 8641 YANG-Push define karta hai.</p></div>
<div class="scn"><h4>Interface flaps do second mein dikhe</h4><p>Ek branch uplink raat ko flap hui. Purane 5-minute SNMP graph mein kuch nahi dikha. Jis team ne <code>oper-status</code> par on-change subscription jodi thi use collector mein har down aur up event timestamp ke saath dikha, unhone use carrier ke maintenance notice se match kiya aur site visit ke bina ticket band kiya.</p><p><b>Lesson:</b> State events ke liye on-change sahi trigger hai.</p></div>
<div class="iv"><p class="q">"Periodic aur on-change subscriptions mein kya difference hai aur kab kaun use karte ho?"</p><p>Periodic chuna hua data fixed interval par bhejta hai chahe badla ho ya nahi, isliye counters ke liye theek hai aur rates ke liye steady series deta hai. On-change sirf value badalne par bhejta hai, isliye interface ya BGP status jaisi state ke liye theek hai, turant notification aur kam volume ke saath. Main aksar dono use karta hoon, saath mein dheemi periodic sync taaki collector loss ke baad recover kar sake.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Subscription ke chaar hisse hain: filter, trigger, encoding aur receiver.</li><li>Periodic counters ke liye; on-change state ke liye; dheemi sync ke saath jodo.</li><li>RFC 8639 subscribed notifications define karta hai; RFC 8641 YANG-Push; stream yang-push hai.</li><li>Units alag hain: IOS XE centiseconds, IOS XR milliseconds.</li><li>Chhote intervals load badhate hain: pehle collector size karo.</li></ul></div>
`}};export{e as default};