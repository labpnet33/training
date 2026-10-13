var e={id:`big-picture`,h:{en:`Why gNMI: streaming telemetry, gRPC and the big picture`,hi:`gNMI kyon: streaming telemetry, gRPC aur big picture`},body:{en:`
<p><b>What you will learn.</b> In this module you talk to network devices over gNMI from Python. You will ask a device what it supports, read state and configuration, change configuration and read it back, stream interface counters, turn them into bits per second, catch a flapping port, and read the exact error when a connection fails. You work on Arista EOS and you will know what changes on Cisco IOS XE and Junos.</p>
<ul>
<li>Explain why streaming telemetry beats polling for fast-moving data.</li>
<li>Name the four gNMI operations and the ports the vendors use.</li>
<li>Write pygnmi scripts for capabilities, get, set and subscribe.</li>
<li>Diagnose connection, TLS, login, privilege and path errors from the error text alone.</li>
</ul>
<h3>Prerequisites</h3>
<p>Finish <code>auto-telemetry</code> first: it explains subscriptions, dial-in and dial-out in concept. From Program 1 you need Python basics, dictionaries and f-strings, <code>auto-formats</code> (JSON), <code>auto-ssh</code> and <code>py-secrets</code>. Nothing else is assumed.</p>

<h3>Analogy: the pizza shop</h3>
<p>SNMP polling is you phoning the pizza shop every five minutes: "Is my pizza ready?" Most calls say "not yet". If the oven stopped for 40 seconds between your calls, you never find out. gNMI streaming is the shop texting you the moment the status changes, and also every ten seconds with the oven temperature. You make one call, say what you care about, and the shop keeps talking.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Polling every 5 minutes misses a 40 second outage that on_change streaming reports at once">
<text x="12" y="30" class="svg-ink" font-size="13">SNMP poll, every 5 min</text>
<line x1="20" y1="48" x2="620" y2="48" stroke="#64748b" stroke-width="2"/>
<circle cx="40" cy="48" r="7" fill="#bae6fd"/><circle cx="560" cy="48" r="7" fill="#bae6fd"/>
<text x="40" y="70" text-anchor="middle" class="svg-muted" font-size="11">poll</text><text x="560" y="70" text-anchor="middle" class="svg-muted" font-size="11">poll</text>
<text x="12" y="104" class="svg-ink" font-size="13">Port state</text>
<rect x="20" y="114" width="600" height="14" rx="4" fill="#bbf7d0"/><rect x="250" y="114" width="40" height="14" rx="4" fill="#fecaca"/>
<text x="270" y="146" text-anchor="middle" class="svg-accent" font-size="11">down 40 s</text>
<text x="12" y="172" class="svg-ink" font-size="13">gNMI on_change</text>
<polygon points="250,160 244,170 256,170" fill="#fde68a"/><polygon points="290,160 284,170 296,170" fill="#bbf7d0"/>
<text x="420" y="172" class="svg-muted" font-size="11">events at the moment of change</text>
</svg><p class="cap">A 40-second outage falls between two polls. The stream reports both edges.</p></div>

<h3>What gNMI is</h3>
<p><b>gRPC</b> is a remote procedure call framework from Google. It runs over h&#116;tp/2, keeps one long-lived connection open, and encodes messages as <b>protocol buffers</b> (protobuf), a compact binary format. <b>gNMI</b> (gRPC Network Management Interface) is a small service the OpenConfig group defined on top of gRPC. The model is YANG, as in <code>auto-telemetry</code>. gNMI is <b>dial-in</b>: your client opens the connection and the device answers. It has four operations, called RPCs:</p>
<table class="cmp"><tr><th>RPC</th><th>Question it answers</th><th>pygnmi call</th></tr>
<tr><td>Capabilities</td><td>Which models, encodings and gNMI version?</td><td><code>gc.capabilities()</code></td></tr>
<tr><td>Get</td><td>What is the value now?</td><td><code>gc.get(path=[...])</code></td></tr>
<tr><td>Set</td><td>Change it (update, replace, delete)</td><td><code>gc.set(update=[...])</code></td></tr>
<tr><td>Subscribe</td><td>Tell me now and keep telling me</td><td><code>gc.subscribe2(subscribe={...})</code></td></tr></table>

<h3>Where each vendor listens</h3>
<table class="cmp"><tr><th>Vendor</th><th>Enable</th><th>Plaintext port</th><th>TLS port</th></tr>
<tr><td>Arista EOS</td><td><code>management api gnmi</code></td><td>6030 (default)</td><td>6030 with an SSL profile</td></tr>
<tr><td>Cisco IOS XE</td><td><code>gnxi</code></td><td>50052</td><td>9339 (<code>gnxi secure-server</code>)</td></tr>
<tr><td>Junos</td><td><code>extension-service request-response grpc</code></td><td>32767 (clear-text)</td><td>50051 (ssl) in our lab</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A poller asks every 300 s. A flapping link is down for 40 s. The poll lands inside the outage with probability 40 / 300, about 13 percent, so about 87 percent of such outages are never seen. A subscription with <code>on_change</code> sends an event within a second of each edge, and a sample every 10 s gives 30 counter readings in the same 300 s.</p></div>

<h3>The lab map</h3>
<p>Lab 1 builds five scripts on AUTO01 against LEAF1 and finds the flapping port towards LEAF2. Lab 2 hands you a broken audit script for three switches and you fix five faults. Both use the same EOS gNMI server.</p>
<pre class="code"><span class="c">! EOS: switch the gNMI server on (port 6030 by default)</span>
management api gnmi
   transport grpc default
      no shutdown</pre>
<pre class="out">LEAF1# show management api gnmi
Enabled: yes
<span class="hl">Server: running on port 6030, in default VRF</span>
SSL profile: none
QoS DSCP: none
Authorization required: no
Accounting requests: no
Notification timestamp: last change time
Listen addresses: ::
Authentication username priority: x509-spiffe, x509-common-name, metadata</pre>

<div class="warn"><p><b>Common mistake.</b> Forgetting that the server is off by default. Connection refused on 6030 usually means <code>no shutdown</code> was never typed, or the port was changed.</p></div>
<div class="exam"><p><b>Exam trap.</b> gNMI is dial-in. A device that opens the connection to a collector is dial-out telemetry, which is a different configuration.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> Production gNMI needs TLS. The labs use plaintext (<code>insecure=True</code>) so you can see the protocol; chapter 8 shows TLS.</p></div>

<div class="scn"><h4>The outage nobody saw</h4><p>Users complained of drops every afternoon, but the SNMP graphs for the uplink were flat. An engineer subscribed to oper-status with on_change and saw the port go down for a few seconds every few minutes. A bad optic was replaced the same day.</p><p><b>Lesson:</b> poll intervals hide short events. Streaming sees them.</p></div>
<div class="iv"><p class="q">"Why use gNMI instead of SNMP?"</p><p>Say: model-driven (YANG and OpenConfig), one long-lived gRPC connection over h&#116;tp/2, protobuf is compact, the device pushes samples at seconds-level intervals and events on change, and Set gives a transactional configuration path. Add that SNMP is still fine for slow, simple monitoring.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>gNMI = four RPCs over gRPC (h&#116;tp/2, protobuf), dial-in, defined by OpenConfig.</li>
<li>Ports: EOS 6030, IOS XE 50052 and 9339, Junos 32767.</li>
<li>Streaming sees short events and gives seconds-level data.</li>
<li>pygnmi maps one method to each RPC.</li>
<li>The server must be enabled on the device first.</li></ul></div>
`,hi:`
<p><b>Aap kya seekhoge.</b> Is module mein aap Python se network devices se gNMI par baat karte ho. Device se poochhoge ki woh kya support karta hai, state aur configuration padhoge, configuration badloge aur wapas padhoge, interface counters stream karoge, unhe bits per second mein badloge, flapping port pakdoge, aur connection fail hone par exact error padhoge. Kaam Arista EOS par hoga aur aapko pata hoga ki Cisco IOS XE aur Junos par kya badalta hai.</p>
<ul>
<li>Samjhao ki tez badalne wale data ke liye streaming telemetry polling se behtar kyon hai.</li>
<li>Chaar gNMI operations aur vendors ke ports ke naam batao.</li>
<li>Capabilities, get, set aur subscribe ke liye pygnmi scripts likho.</li>
<li>Sirf error text se connection, TLS, login, privilege aur path errors diagnose karo.</li>
</ul>
<h3>Prerequisites</h3>
<p>Pehle <code>auto-telemetry</code> poora karo: woh subscriptions, dial-in aur dial-out concept mein samjhata hai. Program 1 se Python basics, dictionaries aur f-strings, <code>auto-formats</code> (JSON), <code>auto-ssh</code> aur <code>py-secrets</code> chahiye. Aur kuch assume nahi kiya gaya.</p>

<h3>Analogy: pizza shop</h3>
<p>SNMP polling matlab aap har paanch minute mein pizza shop ko phone karte ho: "Mera pizza ready hai?" Zyadatar calls mein jawab "abhi nahi". Agar do calls ke beech oven 40 second ke liye ruka, to aapko pata hi nahi chalta. gNMI streaming matlab shop status badalte hi aapko text karta hai, aur har das second mein oven ka temperature bhi. Aap ek call karte ho, batate ho kis cheez mein dilchaspi hai, aur shop bolta rehta hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Har 5 minute ki polling 40 second ka outage miss karti hai jabki on_change streaming turant batati hai">
<text x="12" y="30" class="svg-ink" font-size="13">SNMP poll, har 5 min</text>
<line x1="20" y1="48" x2="620" y2="48" stroke="#64748b" stroke-width="2"/>
<circle cx="40" cy="48" r="7" fill="#bae6fd"/><circle cx="560" cy="48" r="7" fill="#bae6fd"/>
<text x="40" y="70" text-anchor="middle" class="svg-muted" font-size="11">poll</text><text x="560" y="70" text-anchor="middle" class="svg-muted" font-size="11">poll</text>
<text x="12" y="104" class="svg-ink" font-size="13">Port state</text>
<rect x="20" y="114" width="600" height="14" rx="4" fill="#bbf7d0"/><rect x="250" y="114" width="40" height="14" rx="4" fill="#fecaca"/>
<text x="270" y="146" text-anchor="middle" class="svg-accent" font-size="11">down 40 s</text>
<text x="12" y="172" class="svg-ink" font-size="13">gNMI on_change</text>
<polygon points="250,160 244,170 256,170" fill="#fde68a"/><polygon points="290,160 284,170 296,170" fill="#bbf7d0"/>
<text x="420" y="172" class="svg-muted" font-size="11">badalte hi events</text>
</svg><p class="cap">40 second ka outage do polls ke beech gir jaata hai. Stream dono edges batati hai.</p></div>

<h3>gNMI kya hai</h3>
<p><b>gRPC</b> Google ka remote procedure call framework hai. Yeh h&#116;tp/2 par chalta hai, ek lambi connection khuli rakhta hai, aur messages ko <b>protocol buffers</b> (protobuf) mein encode karta hai, jo ek compact binary format hai. <b>gNMI</b> (gRPC Network Management Interface) ek chhoti service hai jo OpenConfig group ne gRPC ke upar define ki. Model YANG hai, jaise <code>auto-telemetry</code> mein. gNMI <b>dial-in</b> hai: aapka client connection kholta hai aur device jawab deta hai. Iske chaar operations hain, jinhe RPCs kehte hain:</p>
<table class="cmp"><tr><th>RPC</th><th>Kaunsa sawaal</th><th>pygnmi call</th></tr>
<tr><td>Capabilities</td><td>Kaunse models, encodings aur gNMI version?</td><td><code>gc.capabilities()</code></td></tr>
<tr><td>Get</td><td>Abhi value kya hai?</td><td><code>gc.get(path=[...])</code></td></tr>
<tr><td>Set</td><td>Badlo (update, replace, delete)</td><td><code>gc.set(update=[...])</code></td></tr>
<tr><td>Subscribe</td><td>Abhi batao aur batate raho</td><td><code>gc.subscribe2(subscribe={...})</code></td></tr></table>

<h3>Har vendor kahan sunta hai</h3>
<table class="cmp"><tr><th>Vendor</th><th>Enable</th><th>Plaintext port</th><th>TLS port</th></tr>
<tr><td>Arista EOS</td><td><code>management api gnmi</code></td><td>6030 (default)</td><td>6030, SSL profile ke saath</td></tr>
<tr><td>Cisco IOS XE</td><td><code>gnxi</code></td><td>50052</td><td>9339 (<code>gnxi secure-server</code>)</td></tr>
<tr><td>Junos</td><td><code>extension-service request-response grpc</code></td><td>32767 (clear-text)</td><td>hamare lab mein 50051 (ssl)</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Poller har 300 s mein poochhta hai. Flapping link 40 s down rehta hai. Poll outage ke andar girne ki probability 40 / 300, yaani lagbhag 13 percent hai, isliye aise lagbhag 87 percent outages kabhi dikhte hi nahi. <code>on_change</code> wali subscription har edge ke ek second ke andar event bhejti hai, aur har 10 s ka sample usi 300 s mein 30 counter readings deta hai.</p></div>

<h3>Lab ka naksha</h3>
<p>Lab 1 mein AUTO01 par LEAF1 ke khilaf paanch scripts banti hain aur LEAF2 ki taraf ka flapping port milta hai. Lab 2 mein teen switches ka toota hua audit script milta hai aur aap paanch faults theek karte ho. Dono labs mein wahi EOS gNMI server hai.</p>
<pre class="code"><span class="c">! EOS: gNMI server on karo (port 6030 by default)</span>
management api gnmi
   transport grpc default
      no shutdown</pre>
<pre class="out">LEAF1# show management api gnmi
Enabled: yes
<span class="hl">Server: running on port 6030, in default VRF</span>
SSL profile: none
QoS DSCP: none
Authorization required: no
Accounting requests: no
Notification timestamp: last change time
Listen addresses: ::
Authentication username priority: x509-spiffe, x509-common-name, metadata</pre>

<div class="warn"><p><b>Aam galti.</b> Yeh bhool jaana ki server by default off hota hai. 6030 par Connection refused ka matlab aksar <code>no shutdown</code> type hi nahi hua, ya port badal diya gaya.</p></div>
<div class="exam"><p><b>Exam trap.</b> gNMI dial-in hai. Jo device collector ki taraf connection kholta hai woh dial-out telemetry hai, jiski configuration alag hoti hai.</p></div>
<div class="note"><p><b>Lab vs asli gear.</b> Production gNMI mein TLS zaroori hai. Labs plaintext (<code>insecure=True</code>) use karte hain taaki protocol dikhe; chapter 8 mein TLS hai.</p></div>

<div class="scn"><h4>Woh outage jo kisi ne nahi dekha</h4><p>Users har dopahar drops ki shikayat karte the, par uplink ke SNMP graphs seedhe the. Ek engineer ne oper-status par on_change subscribe kiya aur dekha ki port har kuch minute mein kuch second ke liye down hota hai. Kharab optic usi din badal diya gaya.</p><p><b>Lesson:</b> poll interval chhote events chhupa deta hai. Streaming unhe dekh leti hai.</p></div>
<div class="iv"><p class="q">"SNMP ki jagah gNMI kyon?"</p><p>Kaho: model-driven (YANG aur OpenConfig), h&#116;tp/2 par ek lambi gRPC connection, protobuf compact hai, device seconds-level intervals par samples aur badlav par events push karta hai, aur Set transactional configuration path deta hai. Jodo ki dheemi, saral monitoring ke liye SNMP abhi bhi theek hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>gNMI = gRPC (h&#116;tp/2, protobuf) par chaar RPCs, dial-in, OpenConfig ne define kiya.</li>
<li>Ports: EOS 6030, IOS XE 50052 aur 9339, Junos 32767.</li>
<li>Streaming chhote events dekhti hai aur seconds-level data deti hai.</li>
<li>pygnmi har RPC ke liye ek method deta hai.</li>
<li>Pehle device par server enable hona chahiye.</li></ul></div>
`}};export{e as default};