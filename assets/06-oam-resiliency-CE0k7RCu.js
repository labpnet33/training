var e={id:`oam-resiliency`,h:{en:`Carrier Ethernet OAM and resiliency`,hi:`Carrier Ethernet OAM aur resiliency`},body:{en:`
<p>A leased line used to come with the carrier's promise: it works, or the carrier tells you. An Ethernet service rides over a shared packet network, so the provider needs tools to <b>detect faults, localise them and measure performance</b> end to end. Those tools are called <b>OAM</b> (Operations, Administration and Maintenance). Ethernet also needs fast, loop-free <b>resiliency</b>, because spanning tree is too slow and too wasteful for a metro network.</p>

<h3>Three layers of Ethernet OAM</h3>
<table class="cmp"><tr><th>Standard</th><th>Scope</th><th>Typical use</th></tr>
<tr><td>IEEE 802.3ah (Link OAM, EFM OAM)</td><td>A single link between two devices</td><td>Discovery, remote loopback, link-fault and dying-gasp notification</td></tr>
<tr><td>IEEE 802.1ag (CFM) and ITU-T Y.1731</td><td>End-to-end service, per VLAN or EVC</td><td>Continuity, loopback, linktrace, delay and loss measurement</td></tr>
<tr><td>MEF E-LMI</td><td>The UNI between customer and provider</td><td>Tells the customer which EVCs are active, inactive or partially active</td></tr></table>

<h3>Connectivity Fault Management (802.1ag)</h3>
<dl class="terms">
<dt>Maintenance domain (MD) and level</dt><dd>An administrative area with a level 0 to 7. Customer domains use high levels, the provider the middle levels, operator or link domains the low levels, so each party can monitor its own part without interfering with others.</dd>
<dt>Maintenance association (MA)</dt><dd>A set of MEPs monitoring one service (for example one VLAN or EVC) inside a domain.</dd>
<dt>MEP (maintenance end point)</dt><dd>Sits at the edge of a domain; generates and answers OAM frames. An <b>up MEP</b> faces the bridge, a <b>down MEP</b> faces the wire.</dd>
<dt>MIP (maintenance intermediate point)</dt><dd>Sits inside the domain and responds to loopback and linktrace requests.</dd>
</dl>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="CFM domains">
<rect x="10" y="20" width="620" height="170" rx="12" fill="#e2e8f0"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="12">Customer domain (high level, e.g. 5)</text>
<rect x="90" y="60" width="460" height="110" rx="12" fill="#bae6fd"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="12">Provider domain (level 3)</text>
<rect x="150" y="100" width="340" height="60" rx="12" fill="#bbf7d0"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="12">Operator domain (level 1)</text>
<circle cx="150" cy="140" r="9" fill="#fde68a" stroke="#64748b"/><circle cx="490" cy="140" r="9" fill="#fde68a" stroke="#64748b"/><circle cx="320" cy="145" r="7" fill="#ddd6fe" stroke="#64748b"/>
<text x="150" y="170" text-anchor="middle" class="svg-muted" font-size="11">MEP</text><text x="490" y="170" text-anchor="middle" class="svg-muted" font-size="11">MEP</text><text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="11">MIP</text>
</svg><p class="cap">Nested maintenance domains: the customer, provider and operator each monitor their own level.</p></div>
<ul>
<li><b>Continuity Check Messages (CCM)</b>: periodic multicast heartbeats between MEPs in an MA. Missing CCMs raise an alarm.</li>
<li><b>Loopback (LBM and LBR)</b>: the Ethernet equivalent of ping, to a MEP or MIP.</li>
<li><b>Linktrace (LTM and LTR)</b>: the Ethernet equivalent of traceroute, hop by hop through the MIPs.</li>
</ul>
<p><b>ITU-T Y.1731</b> adds performance monitoring: <b>delay measurement</b>, <b>loss measurement</b>, <b>AIS</b> (alarm indication signal) to suppress alarms downstream, and <b>RDI</b> (remote defect indication). Carriers use these to prove an SLA.</p>

<h3>Resiliency options</h3>
<table class="cmp"><tr><th>Mechanism</th><th>Where</th><th>Idea</th></tr>
<tr><td>MSTP and RSTP</td><td>Access and campus</td><td>Standard spanning tree; slower, blocks links</td></tr>
<tr><td>REP (Resilient Ethernet Protocol)</td><td>Cisco rings</td><td>Segment-based ring protocol, one blocked port per segment</td></tr>
<tr><td>G.8032 ERPS</td><td>Ethernet rings, multivendor</td><td>Ring Protection Link blocked, protection switching on failure, designed for sub-50 ms in the standard</td></tr>
<tr><td>MC-LAG and EVPN multihoming</td><td>Dual-homing a customer or access to two PEs</td><td>All-active or active-standby across devices</td></tr>
<tr><td>Pseudowire redundancy</td><td>Core</td><td>Backup PW to a different PE, with PW status signalling</td></tr></table>
<p>The numbers claimed for protection switching depend on the platform and configuration. Treat the standard's target as a design goal and confirm with the vendor's data and your own tests.</p>

<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! IOS XE style CFM: a provider-level domain with continuity checks</span>
ethernet cfm ieee
ethernet cfm global
ethernet cfm domain PROVIDER level 3
 service EVC100 evc EVC100 vlan 100
  continuity-check
<span class="c">! Link OAM on a single link</span>
interface GigabitEthernet0/0/2
 ethernet oam</pre>
<p>The exact syntax varies across IOS XE hardware families and IOS XR, and the output of the verification commands is not shown because it was not captured. What matters for the exam is the model: domain, level, MA, MEP, MIP and the three message types.</p>

<div class="eg"><p><b>Worked example.</b> A provider sells an E-Line between Pune and Mumbai. It places MEPs at both PEs in level 3 for service VLAN 100 and sends CCMs once a second. A fibre cut in a transit ring causes both MEPs to lose each other's CCMs within a few intervals, raising an alarm that tells the operations team the service, not just a link, is broken. A linktrace from Pune then shows the last MIP that answered, pointing at the failed segment.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using a customer-level number for the provider domain so OAM frames leak or are blocked; forgetting that CFM frames use VLAN-aware multicast addresses and can be filtered; and enabling Link OAM discovery on one side only.</p></div>
<div class="exam"><p><b>Exam trap.</b> 802.3ah is per link, 802.1ag/Y.1731 is per service end to end, E-LMI is at the UNI. Y.1731 adds delay and loss measurement.</p></div>

<div class="scn"><h4>The customer says it is the provider, the provider says it is the customer</h4><p>A branch lost connectivity. The provider ran loopback and linktrace at level 3 and proved the service was healthy to the customer edge. The customer's own CFM at level 5 showed their switch's port was the failing point. OAM moved the discussion from opinion to evidence.</p><p><b>Lesson:</b> nested OAM levels let each party prove its own segment.</p></div>

<div class="iv"><p class="q">"What is CFM and what do CCM, loopback and linktrace do?"</p><p>CFM (802.1ag) is end-to-end Ethernet service OAM using maintenance domains, levels, MEPs and MIPs. CCMs are heartbeats for continuity, loopback is ping-like, and linktrace is traceroute-like. Y.1731 adds delay and loss measurement.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>802.3ah = link OAM; 802.1ag = CFM per service; Y.1731 = performance; E-LMI = UNI status.</li>
<li>CFM model: domain and level 0 to 7, MA, MEP, MIP.</li>
<li>CCM, loopback and linktrace are the three core CFM tools.</li>
<li>Resiliency: REP, G.8032, MC-LAG, EVPN multihoming, PW redundancy.</li>
<li>Back SLA claims with measurement and your own tests.</li>
</ul></div>
`,hi:`
<p>Leased line ke saath carrier ka vaada hota tha: yeh chalti hai, ya carrier aapko batata hai. Ethernet service shared packet network par chalti hai, isliye provider ko end to end <b>faults detect karne, localise karne aur performance measure karne</b> ke tools chahiye. In tools ko <b>OAM</b> (Operations, Administration and Maintenance) kehte hain. Ethernet ko tez, loop-free <b>resiliency</b> bhi chahiye, kyunki spanning tree metro network ke liye bahut slow aur wasteful hai.</p>

<h3>Ethernet OAM ki teen layers</h3>
<table class="cmp"><tr><th>Standard</th><th>Scope</th><th>Typical use</th></tr>
<tr><td>IEEE 802.3ah (Link OAM, EFM OAM)</td><td>Do devices ke beech ek link</td><td>Discovery, remote loopback, link-fault aur dying-gasp notification</td></tr>
<tr><td>IEEE 802.1ag (CFM) aur ITU-T Y.1731</td><td>End-to-end service, per VLAN ya EVC</td><td>Continuity, loopback, linktrace, delay aur loss measurement</td></tr>
<tr><td>MEF E-LMI</td><td>Customer aur provider ke beech UNI</td><td>Customer ko batata hai kaun se EVCs active, inactive ya partially active hain</td></tr></table>

<h3>Connectivity Fault Management (802.1ag)</h3>
<dl class="terms">
<dt>Maintenance domain (MD) aur level</dt><dd>Level 0 se 7 wala administrative area. Customer domains high levels, provider middle levels, operator ya link domains low levels use karte hain, taaki har party doosron mein dakhal diye bina apna hissa monitor kar sake.</dd>
<dt>Maintenance association (MA)</dt><dd>Domain ke andar ek service (jaise ek VLAN ya EVC) monitor karne wale MEPs ka set.</dd>
<dt>MEP (maintenance end point)</dt><dd>Domain ke edge par baithta hai; OAM frames generate karta aur unka jawab deta hai. <b>Up MEP</b> bridge ki taraf, <b>down MEP</b> wire ki taraf dekhta hai.</dd>
<dt>MIP (maintenance intermediate point)</dt><dd>Domain ke andar baithta hai aur loopback tatha linktrace requests ka jawab deta hai.</dd>
</dl>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="CFM domains">
<rect x="10" y="20" width="620" height="170" rx="12" fill="#e2e8f0"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="12">Customer domain (high level, jaise 5)</text>
<rect x="90" y="60" width="460" height="110" rx="12" fill="#bae6fd"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="12">Provider domain (level 3)</text>
<rect x="150" y="100" width="340" height="60" rx="12" fill="#bbf7d0"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="12">Operator domain (level 1)</text>
<circle cx="150" cy="140" r="9" fill="#fde68a" stroke="#64748b"/><circle cx="490" cy="140" r="9" fill="#fde68a" stroke="#64748b"/><circle cx="320" cy="145" r="7" fill="#ddd6fe" stroke="#64748b"/>
<text x="150" y="170" text-anchor="middle" class="svg-muted" font-size="11">MEP</text><text x="490" y="170" text-anchor="middle" class="svg-muted" font-size="11">MEP</text><text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="11">MIP</text>
</svg><p class="cap">Nested maintenance domains: customer, provider aur operator apna-apna level monitor karte hain.</p></div>
<ul>
<li><b>Continuity Check Messages (CCM)</b>: MA ke MEPs ke beech periodic multicast heartbeats. CCMs missing hone par alarm uthta hai.</li>
<li><b>Loopback (LBM aur LBR)</b>: ping ka Ethernet equivalent, MEP ya MIP tak.</li>
<li><b>Linktrace (LTM aur LTR)</b>: traceroute ka Ethernet equivalent, MIPs ke zariye hop by hop.</li>
</ul>
<p><b>ITU-T Y.1731</b> performance monitoring jodta hai: <b>delay measurement</b>, <b>loss measurement</b>, downstream alarms dabane ke liye <b>AIS</b> (alarm indication signal), aur <b>RDI</b> (remote defect indication). Carriers SLA prove karne ke liye inhe use karte hain.</p>

<h3>Resiliency options</h3>
<table class="cmp"><tr><th>Mechanism</th><th>Kahan</th><th>Idea</th></tr>
<tr><td>MSTP aur RSTP</td><td>Access aur campus</td><td>Standard spanning tree; slow, links block karta hai</td></tr>
<tr><td>REP (Resilient Ethernet Protocol)</td><td>Cisco rings</td><td>Segment-based ring protocol, har segment mein ek blocked port</td></tr>
<tr><td>G.8032 ERPS</td><td>Ethernet rings, multivendor</td><td>Ring Protection Link blocked, failure par protection switching, standard mein sub-50 ms ke liye design</td></tr>
<tr><td>MC-LAG aur EVPN multihoming</td><td>Customer ya access ko do PEs se dual-home karna</td><td>Devices ke across all-active ya active-standby</td></tr>
<tr><td>Pseudowire redundancy</td><td>Core</td><td>Doosre PE tak backup PW, PW status signalling ke saath</td></tr></table>
<p>Protection switching ke liye claim kiye gaye numbers platform aur configuration par depend karte hain. Standard ke target ko design goal maano aur vendor ke data aur apne tests se confirm karo.</p>

<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! IOS XE style CFM: a provider-level domain with continuity checks</span>
ethernet cfm ieee
ethernet cfm global
ethernet cfm domain PROVIDER level 3
 service EVC100 evc EVC100 vlan 100
  continuity-check
<span class="c">! Link OAM on a single link</span>
interface GigabitEthernet0/0/2
 ethernet oam</pre>
<p>Exact syntax IOS XE hardware families aur IOS XR mein alag hota hai, aur verification commands ka output nahi dikhaya kyunki capture nahi hua. Exam ke liye model matter karta hai: domain, level, MA, MEP, MIP aur teen message types.</p>

<div class="eg"><p><b>Worked example.</b> Provider Pune aur Mumbai ke beech E-Line bechta hai. Woh service VLAN 100 ke liye level 3 mein dono PEs par MEPs rakhta hai aur har second CCM bhejta hai. Transit ring mein fibre cut dono MEPs ko kuch intervals mein ek-doosre ke CCMs khone par majboor karta hai, jisse alarm uthta hai jo operations team ko batata hai ki service, sirf link nahi, toot gayi hai. Pune se linktrace phir aakhri MIP dikhata hai jisne jawab diya, jo failed segment ki taraf ishara karta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Provider domain ke liye customer-level number use karna jisse OAM frames leak ya block hote hain; yeh bhoolna ki CFM frames VLAN-aware multicast addresses use karte hain aur filter ho sakte hain; aur Link OAM discovery sirf ek side enable karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> 802.3ah per link hai, 802.1ag/Y.1731 per service end to end, E-LMI UNI par. Y.1731 delay aur loss measurement jodta hai.</p></div>

<div class="scn"><h4>Customer kehta hai provider, provider kehta hai customer</h4><p>Ek branch ka connectivity gaya. Provider ne level 3 par loopback aur linktrace chalaya aur prove kiya ki service customer edge tak theek hai. Customer ke apne level 5 CFM ne dikhaya ki unke switch ka port fail ho raha tha. OAM ne baat ko raay se saboot tak pahunchaya.</p><p><b>Lesson:</b> nested OAM levels har party ko apna segment prove karne dete hain.</p></div>

<div class="iv"><p class="q">"CFM kya hai aur CCM, loopback aur linktrace kya karte hain?"</p><p>CFM (802.1ag) maintenance domains, levels, MEPs aur MIPs use karne wala end-to-end Ethernet service OAM hai. CCMs continuity ke liye heartbeats hain, loopback ping jaisa hai, aur linktrace traceroute jaisa. Y.1731 delay aur loss measurement jodta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>802.3ah = link OAM; 802.1ag = per service CFM; Y.1731 = performance; E-LMI = UNI status.</li>
<li>CFM model: domain aur level 0 se 7, MA, MEP, MIP.</li>
<li>CCM, loopback aur linktrace teen core CFM tools hain.</li>
<li>Resiliency: REP, G.8032, MC-LAG, EVPN multihoming, PW redundancy.</li>
<li>SLA claims ko measurement aur apne tests se back karo.</li>
</ul></div>
`}};export{e as default};