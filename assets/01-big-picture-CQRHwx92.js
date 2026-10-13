var e={id:`big-picture`,h:{en:`Wireless QoS and multicast: the big picture`,hi:`Wireless QoS aur multicast: poori tasveer`},body:{en:`
<p>Think of an airport. Every passenger shares the same terminal, but a few have a priority lane: crew, business class, a medical emergency. The priority lane does not make the terminal bigger. It only decides who is served first when the hall is crowded. <b>Quality of Service (QoS)</b> is that priority lane for network traffic. On a wired link the router owns the queue, so it can be strict. On Wi-Fi the hall is a <b>shared radio channel</b>, so the lane is only a better chance, never a guarantee.</p>

<h3>What you will learn</h3>
<ul>
<li>How WMM and EDCA give voice, video, best effort and background traffic different odds on the air.</li>
<li>How a marking travels: client, AP, CAPWAP tunnel, switch, controller, router, and back.</li>
<li>The metal policies platinum, gold, silver and bronze, and your own MQC class-map and policy-map on the Catalyst 9800 style controller.</li>
<li>Why a switch port can silently destroy your marking (switch uplink trust).</li>
<li>AVC and the flexible NetFlow monitor, voice and video design, and CAC.</li>
<li>Multicast: multicast-unicast versus multicast-multicast, IGMP snooping, and the mDNS gateway for Bonjour.</li>
<li>How to troubleshoot all five labs of this module with the QoS trace.</li>
</ul>

<h3>Prerequisites</h3>
<p>You should know the 9800 profile-and-tag model (WLAN, policy profile, policy tag) from the earlier wireless modules. You should also know DSCP, classification and marking from the ENCOR QoS module (<b>encor-qos</b>). This module does not repeat that theory in depth: it is the <b>wireless side</b> of the same story. Review the encor-qos chapters on marking, MQC and wireless QoS if the words DSCP, EF or class-map feel new.</p>

<h3>The lab network you will use</h3>
<p>Every lab uses the same campus. <b>WLC1</b> is the 9800 style controller. <b>SW1</b> is the only switch and has no web UI, so you configure it in its console. <b>R1</b> is the router. <b>AP1</b> and <b>AP2</b> serve the clients <b>PHONE1</b> and <b>LAPTOP1</b> (and <b>LAPTOP2</b> in the multicast lab). The controller VLAN is 99 and the AP VLAN is 10. The lab model is a teaching model: it traces markings and checks rules, it does not simulate queues or radio contention.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Campus path of a voice packet">
<rect x="10" y="80" width="90" height="50" rx="8" fill="#ddd6fe"/><text x="55" y="102" text-anchor="middle" class="svg-ink" font-size="13">PHONE1</text><text x="55" y="119" text-anchor="middle" class="svg-muted" font-size="12">DSCP 46</text>
<rect x="135" y="80" width="80" height="50" rx="8" fill="#bae6fd"/><text x="175" y="102" text-anchor="middle" class="svg-ink" font-size="13">AP1</text><text x="175" y="119" text-anchor="middle" class="svg-muted" font-size="12">CAPWAP</text>
<rect x="250" y="80" width="80" height="50" rx="8" fill="#fde68a"/><text x="290" y="102" text-anchor="middle" class="svg-ink" font-size="13">SW1</text><text x="290" y="119" text-anchor="middle" class="svg-muted" font-size="12">mls qos</text>
<rect x="365" y="80" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="415" y="102" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text><text x="415" y="119" text-anchor="middle" class="svg-muted" font-size="12">policy-map</text>
<rect x="500" y="80" width="80" height="50" rx="8" fill="#fed7aa"/><text x="540" y="102" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="540" y="119" text-anchor="middle" class="svg-muted" font-size="12">servers</text>
<line x1="100" y1="105" x2="135" y2="105" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><line x1="215" y1="105" x2="250" y2="105" stroke="#64748b" stroke-width="2"/><line x1="330" y1="105" x2="365" y2="105" stroke="#64748b" stroke-width="2"/><line x1="465" y1="105" x2="500" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="118" y="70" text-anchor="middle" class="svg-accent" font-size="12">on air</text>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="13">Every hop can keep, cap or reset the marking</text>
<text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">Upstream: client to server. Downstream: server to client.</text>
</svg><p class="cap">The QoS path of the labs: the marking must survive each hop in both directions.</p></div>

<h3>Three families of ideas</h3>
<dl class="terms">
<dt>Air QoS</dt><dd>WMM and EDCA decide how often a frame wins the channel. Chapters 2 and 3.</dd>
<dt>Wire and controller QoS</dt><dd>DSCP markings, metal policies, MQC policy-maps, switch trust and AVC. Chapters 4 to 7.</dd>
<dt>Group traffic</dt><dd>Multicast and mDNS, which behave very differently from unicast on Wi-Fi. Chapters 9 and 10.</dd>
</dl>

<h3>How the module teaches</h3>
<p>Each concept is followed by the command form on the controller, the matching <b>web UI</b> path, and the verification output. The two web UI areas for this module are <b>Configuration &gt; Tags &amp; Profiles &gt; QoS</b> and <b>Configuration &gt; Wireless &gt; Multicast</b>. The web UI never does anything the CLI cannot: it only writes the same commands.</p>

<div class="note"><p><b>Honest labels.</b> Some topics are explained but are <b>concept only</b> in the labs: queueing and bandwidth statistics, <code>police</code> enforcement, CAC and Videostream, per-application AVC statistics, custom flexible NetFlow records, <code>match access-group</code>, and the mDNS data plane. Where this module says concept only, the lab accepts or shows the configuration but does not simulate the effect.</p></div>

<div class="eg"><p><b>Worked example.</b> A handset says EF (DSCP 46). The AP trusts it and tunnels it in CAPWAP with outer DSCP 46. SW1 keeps it because the AP port trusts DSCP. WLC1 applies the input policy platinum-up, which allows up to 46, so it passes. SW1 keeps it on the controller port. Result: DSCP 46 reaches the server. If SW1 had reset the marking at any one port, the remaining hops would see DSCP 0 and nothing downstream could repair it.</p></div>

<div class="warn"><p><b>Common mistake:</b> believing that QoS makes Wi-Fi faster. It only reorders. If the cell is overloaded with high-priority traffic, everyone suffers, including voice. That is why CAC and good design exist (chapter 8).</p></div>

<div class="scn"><h4>The choppy-call complaint</h4><p>A hospital reports choppy calls on Wi-Fi phones only when the cafeteria is busy. The engineer finds the phones are WMM capable, the WLAN is fine, but SW1 resets DSCP at the controller port, so downstream voice leaves the AP as best effort. Fixing one trust line removed the complaint.</p><p><b>Lesson:</b> QoS faults are rarely in the radio. Trace the marking hop by hop before touching anything.</p></div>

<div class="iv"><p class="q">"Why is QoS on Wi-Fi different from QoS on a wired link?"</p><p>A strong answer: Wi-Fi is half duplex and shared, the AP cannot schedule client uploads, so QoS changes contention parameters (EDCA) and gives statistical priority. Then add that the wired path and the CAPWAP tunnel must carry the marking too.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>QoS reorders, it does not create capacity; on Wi-Fi it is statistical priority.</li>
<li>A marking must survive client, AP, switch, controller and router in both directions.</li>
<li>The web UI areas are QoS under Tags &amp; Profiles and Multicast under Wireless.</li>
<li>Queueing, CAC, per-application stats and the mDNS data plane are concept only in the labs.</li>
<li>The troubleshooting tool of this module is the QoS trace on the client.</li>
</ul></div>
`,hi:`
<p>Ek airport socho. Terminal sab ke liye ek hi hai, lekin kuch logon ke paas priority lane hoti hai: crew, business class, medical emergency. Priority lane terminal ko bada nahi karti. Woh sirf yeh decide karti hai ki bheed mein pehle kise serve kiya jaye. <b>Quality of Service (QoS)</b> network traffic ki wahi priority lane hai. Wired link par queue router ke paas hoti hai, isliye woh strict ho sakta hai. Wi-Fi mein hall ek <b>shared radio channel</b> hai, isliye lane sirf behtar mauka deti hai, guarantee nahi.</p>

<h3>Aap kya seekhoge</h3>
<ul>
<li>WMM aur EDCA kaise voice, video, best effort aur background traffic ko air par alag mauke dete hain.</li>
<li>Ek marking kaise safar karti hai: client, AP, CAPWAP tunnel, switch, controller, router, aur wapas.</li>
<li>Metal policies platinum, gold, silver aur bronze, aur Catalyst 9800 style controller par apna MQC class-map aur policy-map.</li>
<li>Switch port kaise chupke se aapki marking kharab kar sakta hai (switch uplink trust).</li>
<li>AVC aur flexible NetFlow monitor, voice aur video design, aur CAC.</li>
<li>Multicast: multicast-unicast vs multicast-multicast, IGMP snooping, aur Bonjour ke liye mDNS gateway.</li>
<li>QoS trace se is module ke paanchon labs ko troubleshoot kaise karna hai.</li>
</ul>

<h3>Prerequisites</h3>
<p>Aapko pehle ke wireless modules se 9800 ka profile-and-tag model (WLAN, policy profile, policy tag) pata hona chahiye. DSCP, classification aur marking ENCOR QoS module (<b>encor-qos</b>) se aani chahiye. Yeh module us theory ko gehrai se repeat nahi karta: yeh usi kahani ka <b>wireless side</b> hai. Agar DSCP, EF ya class-map naye lagte hain to encor-qos ke marking, MQC aur wireless QoS chapters dobara dekho.</p>

<h3>Lab network jo aap use karoge</h3>
<p>Har lab mein wahi campus hai. <b>WLC1</b> 9800 style controller hai. <b>SW1</b> akela switch hai aur uska web UI nahi hai, isliye use console se configure karte hain. <b>R1</b> router hai. <b>AP1</b> aur <b>AP2</b> clients <b>PHONE1</b> aur <b>LAPTOP1</b> ko serve karte hain (multicast lab mein <b>LAPTOP2</b> bhi). Controller VLAN 99 hai aur AP VLAN 10. Lab model ek teaching model hai: yeh markings trace karta hai aur rules check karta hai, queues ya radio contention simulate nahi karta.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Voice packet ka campus path">
<rect x="10" y="80" width="90" height="50" rx="8" fill="#ddd6fe"/><text x="55" y="102" text-anchor="middle" class="svg-ink" font-size="13">PHONE1</text><text x="55" y="119" text-anchor="middle" class="svg-muted" font-size="12">DSCP 46</text>
<rect x="135" y="80" width="80" height="50" rx="8" fill="#bae6fd"/><text x="175" y="102" text-anchor="middle" class="svg-ink" font-size="13">AP1</text><text x="175" y="119" text-anchor="middle" class="svg-muted" font-size="12">CAPWAP</text>
<rect x="250" y="80" width="80" height="50" rx="8" fill="#fde68a"/><text x="290" y="102" text-anchor="middle" class="svg-ink" font-size="13">SW1</text><text x="290" y="119" text-anchor="middle" class="svg-muted" font-size="12">mls qos</text>
<rect x="365" y="80" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="415" y="102" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text><text x="415" y="119" text-anchor="middle" class="svg-muted" font-size="12">policy-map</text>
<rect x="500" y="80" width="80" height="50" rx="8" fill="#fed7aa"/><text x="540" y="102" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="540" y="119" text-anchor="middle" class="svg-muted" font-size="12">servers</text>
<line x1="100" y1="105" x2="135" y2="105" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><line x1="215" y1="105" x2="250" y2="105" stroke="#64748b" stroke-width="2"/><line x1="330" y1="105" x2="365" y2="105" stroke="#64748b" stroke-width="2"/><line x1="465" y1="105" x2="500" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="118" y="70" text-anchor="middle" class="svg-accent" font-size="12">air par</text>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="13">Har hop marking ko rakh, cap ya reset kar sakta hai</text>
<text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">Upstream: client se server. Downstream: server se client.</text>
</svg><p class="cap">Labs ka QoS path: marking ko har hop se dono direction mein bachna chahiye.</p></div>

<h3>Teen families of ideas</h3>
<dl class="terms">
<dt>Air QoS</dt><dd>WMM aur EDCA decide karte hain ki ek frame kitni baar channel jeetta hai. Chapters 2 aur 3.</dd>
<dt>Wire aur controller QoS</dt><dd>DSCP markings, metal policies, MQC policy-maps, switch trust aur AVC. Chapters 4 se 7.</dd>
<dt>Group traffic</dt><dd>Multicast aur mDNS, jo Wi-Fi par unicast se bahut alag behave karte hain. Chapters 9 aur 10.</dd>
</dl>

<h3>Module kaise sikhata hai</h3>
<p>Har concept ke baad controller ka command form, matching <b>web UI</b> path aur verification output aata hai. Is module ke do web UI areas hain: <b>Configuration &gt; Tags &amp; Profiles &gt; QoS</b> aur <b>Configuration &gt; Wireless &gt; Multicast</b>. Web UI woh kuch nahi karta jo CLI nahi kar sakta: woh sirf wahi commands likhta hai.</p>

<div class="note"><p><b>Imaandaar labels.</b> Kuch topics samjhaye gaye hain lekin labs mein <b>concept only</b> hain: queueing aur bandwidth statistics, <code>police</code> enforcement, CAC aur Videostream, per-application AVC statistics, custom flexible NetFlow records, <code>match access-group</code>, aur mDNS data plane. Jahan yeh module concept only kehta hai, wahan lab configuration accept karta ya dikhata hai lekin asar simulate nahi karta.</p></div>

<div class="eg"><p><b>Worked example.</b> Handset EF (DSCP 46) lagata hai. AP use trust karta hai aur CAPWAP mein outer DSCP 46 ke saath tunnel karta hai. SW1 use rakhta hai kyunki AP port DSCP trust karta hai. WLC1 input policy platinum-up lagata hai, jo 46 tak allow karti hai, isliye woh pass hota hai. SW1 controller port par bhi rakhta hai. Result: DSCP 46 server tak pahunchta hai. Agar SW1 kisi ek port par marking reset kar deta, to baaki hops ko DSCP 0 dikhta aur aage koi use repair nahi kar sakta.</p></div>

<div class="warn"><p><b>Common mistake:</b> yeh sochna ki QoS Wi-Fi ko tez bana deta hai. Woh sirf reorder karta hai. Agar cell high-priority traffic se overload ho jaye to sab ko takleef hoti hai, voice ko bhi. Isiliye CAC aur achha design hota hai (chapter 8).</p></div>

<div class="scn"><h4>Choppy-call ki shikayat</h4><p>Ek hospital report karta hai ki Wi-Fi phones par calls sirf tab choppy hoti hain jab cafeteria busy hoti hai. Engineer ko milta hai ki phones WMM capable hain, WLAN theek hai, lekin SW1 controller port par DSCP reset karta hai, isliye downstream voice AP se best effort jaati hai. Ek trust line fix karne se shikayat khatam ho gayi.</p><p><b>Lesson:</b> QoS faults radio mein kam hi hote hain. Kuch chhoone se pehle marking ko hop by hop trace karo.</p></div>

<div class="iv"><p class="q">"Wi-Fi par QoS wired link ke QoS se alag kyun hai?"</p><p>Strong answer: Wi-Fi half duplex aur shared hai, AP client uploads schedule nahi kar sakta, isliye QoS contention parameters (EDCA) badalta hai aur statistical priority deta hai. Phir jodo ki wired path aur CAPWAP tunnel ko bhi marking carry karni padti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>QoS reorder karta hai, capacity nahi banata; Wi-Fi par yeh statistical priority hai.</li>
<li>Marking ko client, AP, switch, controller aur router se dono direction mein bachna chahiye.</li>
<li>Web UI areas hain Tags &amp; Profiles ke andar QoS aur Wireless ke andar Multicast.</li>
<li>Queueing, CAC, per-application stats aur mDNS data plane labs mein concept only hain.</li>
<li>Is module ka troubleshooting tool client par QoS trace hai.</li>
</ul></div>
`}};export{e as default};