var e={id:`qos-models`,h:{en:`QoS design: classes, markings and trust boundaries`,hi:`QoS design: classes, markings aur trust boundaries`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn to design the network services around a customer network, not just configure them: end-to-end QoS, multicast, IPv6 transition, DHCP/DNS/NTP, AAA and segmentation with ISE and TrustSec, SD-Access and SD-WAN policy, wireless integration, and Internet edge and cloud services. Each chapter starts with a realistic customer, lists requirements and constraints, compares options in a trade-off table, then justifies a design. This follows the Network Services domain of the Cisco 300-420 ENSLD exam (v1.1).</p>
<p><b>Prerequisites.</b> You should know VLANs, OSPF/BGP basics, and what a WAN link is. Earlier ENSLD modules cover campus, WAN and fabric design; we refer back to them rather than repeat them.</p>

<h3>Customer case: Harbourline Insurance</h3>
<div class="eg"><p><b>Company:</b> Harbourline Insurance, 3,200 staff. Head office plus 14 branches, one DR site. <b>Budget:</b> no new WAN circuits this year. <b>Problem:</b> since the move to IP telephony and a cloud video meeting platform, claims agents complain of choppy calls every afternoon, while a nightly backup job runs over the same MPLS links. <b>Constraints:</b> 100 Mb/s MPLS at head office, 20 Mb/s at each branch, the provider offers 4 QoS classes, and the CIO wants the claims web app prioritised above general web browsing.</p></div>

<h3>Why QoS exists</h3>
<p>Think of a motorway with an ambulance lane. Without the lane, an ambulance waits behind lorries. <b>Quality of Service (QoS)</b> is the set of tools that gives time-sensitive traffic its own lane when a link is congested. If the link is never congested, QoS does nothing. Voice, video and critical applications care about three numbers: <b>delay</b>, <b>jitter</b> (variation in delay) and <b>loss</b>. Cisco guidelines for voice are one-way delay of 150 ms or less, jitter of 30 ms or less and loss of 1 percent or less. Interactive video has similar targets.</p>

<h3>Requirements, constraints, options</h3>
<p>Harbourline's requirements: (1) clear voice and video, (2) claims app responsive, (3) backups must finish overnight but never hurt daytime work. The constraint is the fixed circuit speed and the provider's 4-class offer. The design question is: how many classes do we use inside, and how do they map to the provider?</p>
<table class="cmp"><tr><th>Model</th><th>Classes</th><th>Good for</th><th>Trade-off</th></tr>
<tr><td><b>4-class</b></td><td>Real-time, signaling and control, critical data, best effort</td><td>Small sites, simple operations, provider offers few classes</td><td>Video and voice share one queue; no scavenger</td></tr>
<tr><td><b>8-class</b></td><td>Voice, interactive video, call signaling, network control, critical data, bulk data, scavenger, default</td><td>Most enterprises</td><td>Needs marking discipline and more policy</td></tr>
<tr><td><b>12-class</b></td><td>Adds broadcast video, multimedia conferencing, multimedia streaming, OAM, splits critical data</td><td>Large campuses with video-heavy business</td><td>Most granular; more queues and monitoring</td></tr></table>

<h3>Classification and marking</h3>
<p><b>Classification</b> is deciding which class a packet belongs to (by ACL, protocol, or NBAR2 application recognition). <b>Marking</b> writes the answer into the packet so every later device just reads it. Layer 3 marking is the <b>DSCP</b> (6 bits in the IP header). Layer 2 marking is <b>CoS</b> (3 bits in the 802.1Q tag). Classify and mark as close to the source as possible, then queue everywhere else based on the mark. Cisco's recommended values for the 12-class model are:</p>
<table class="cmp"><tr><th>Application</th><th>DSCP</th><th>Queue treatment</th></tr>
<tr><td>Voice</td><td>EF (46)</td><td>Strict priority (LLQ)</td></tr>
<tr><td>Broadcast video</td><td>CS5</td><td>Priority or guaranteed</td></tr>
<tr><td>Real-time interactive video</td><td>CS4</td><td>Priority or guaranteed</td></tr>
<tr><td>Multimedia conferencing</td><td>AF41</td><td>Guaranteed with DSCP-based WRED</td></tr>
<tr><td>Multimedia streaming</td><td>AF31</td><td>Guaranteed with WRED</td></tr>
<tr><td>Network control (routing)</td><td>CS6</td><td>Guaranteed, small</td></tr>
<tr><td>Call signaling</td><td>CS3</td><td>Guaranteed, small</td></tr>
<tr><td>OAM (management)</td><td>CS2</td><td>Guaranteed, small</td></tr>
<tr><td>Transactional data</td><td>AF21</td><td>Guaranteed with WRED</td></tr>
<tr><td>Bulk data</td><td>AF11</td><td>Guaranteed, limited</td></tr>
<tr><td>Scavenger</td><td>CS1</td><td>Minimum, below default</td></tr>
<tr><td>Default</td><td>0</td><td>Remaining bandwidth</td></tr></table>

<h3>Trust boundaries</h3>
<p>A <b>trust boundary</b> is the point in the network where you stop believing the markings that arrive and start enforcing your own. If a laptop user can set DSCP 46 on a download, they steal the voice lane. The best practice is to set the boundary at the access port. A Cisco IP phone is a trusted device, so its voice markings are accepted when the phone is detected (conditional trust). A PC is untrusted, so its traffic is re-marked by policy. Uplinks between your own switches and routers are trusted.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Trust boundary design">
<rect x="10" y="30" width="110" height="46" rx="8" fill="#fed7aa"/><text x="65" y="58" text-anchor="middle" class="svg-ink" font-size="13">PC (untrusted)</text>
<rect x="10" y="120" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="65" y="148" text-anchor="middle" class="svg-ink" font-size="13">IP phone</text>
<rect x="190" y="70" width="120" height="60" rx="8" fill="#bae6fd"/><text x="250" y="96" text-anchor="middle" class="svg-ink" font-size="13">Access switch</text><text x="250" y="114" text-anchor="middle" class="svg-muted" font-size="12">trust boundary</text>
<rect x="380" y="70" width="100" height="60" rx="8" fill="#ddd6fe"/><text x="430" y="105" text-anchor="middle" class="svg-ink" font-size="13">Distribution</text>
<rect x="540" y="70" width="90" height="60" rx="8" fill="#fde68a"/><text x="585" y="105" text-anchor="middle" class="svg-ink" font-size="13">WAN edge</text>
<line x1="120" y1="53" x2="190" y2="90" stroke="#64748b" stroke-width="2"/><line x1="120" y1="143" x2="190" y2="112" stroke="#64748b" stroke-width="2"/>
<line x1="310" y1="100" x2="380" y2="100" stroke="#64748b" stroke-width="2"/><line x1="480" y1="100" x2="540" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="190" y1="20" x2="190" y2="190" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="150" y="16" text-anchor="middle" class="svg-muted" font-size="12">re-mark</text><text x="330" y="16" text-anchor="middle" class="svg-muted" font-size="12">trust DSCP</text>
<rect x="190" y="200" width="14" height="14" fill="#fed7aa"/><text x="210" y="212" class="svg-ink" font-size="12">untrusted</text>
<rect x="290" y="200" width="14" height="14" fill="#bbf7d0"/><text x="310" y="212" class="svg-ink" font-size="12">trusted</text>
<rect x="380" y="200" width="14" height="14" fill="#fde68a"/><text x="400" y="212" class="svg-ink" font-size="12">provider edge</text>
</svg><p class="cap">The dashed line is the trust boundary. Left of it, markings are rewritten by policy; right of it, DSCP is trusted.</p></div>

<h3>Chosen design for Harbourline</h3>
<p>We choose the <b>8-class model</b> inside every site because the provider offers only 4 classes: at the CE edge we map 8 internal classes into the provider's 4 (real-time, critical, bulk, default) and re-mark on the way out. A 12-class model would add complexity the provider would erase anyway. The ingress policy on access ports looks like this:</p>
<pre class="code"><span class="c">! Mark on the access switch, close to the source</span>
class-map match-any VOICE
 match dscp ef
class-map match-any SIGNALING
 match dscp cs3
class-map match-any CRITICAL-APP
 match access-group name CLAIMS-APP
policy-map ACCESS-IN
 class VOICE
  set dscp ef
 class SIGNALING
  set dscp cs3
 class CRITICAL-APP
  set dscp af21
 class class-default
  set dscp default
interface GigabitEthernet1/0/10
 service-policy input ACCESS-IN</pre>
<pre class="out">Switch# show policy-map interface GigabitEthernet1/0/10 input
 Service-policy input: ACCESS-IN
  Class-map: CRITICAL-APP (match-any)
   <span class="hl">12840 packets, 9120300 bytes</span>
    QoS Set  dscp af21</pre>

<div class="warn"><p><b>Common mistake.</b> Trusting all DSCP on user ports "to keep it simple". One misconfigured application marking everything EF can fill the priority queue and starve real voice.</p></div>
<div class="exam"><p><b>Exam trap.</b> QoS only helps during congestion. If calls are choppy on an uncongested link, look for loss, a duplex issue or a wrong shaper, not for a missing queue.</p></div>

<div class="scn"><h4>Post-mortem: voice marked, yet still choppy</h4><p>After the rollout, branch calls were still choppy at 3 pm. The team had marked EF on phones but the WAN edge policy matched DSCP 46 only on the outbound side; the provider returned traffic re-marked to 0 and the head-office egress had no class for it, so return voice shared the default queue with backups. They added an agreed provider class map for real-time and re-marked on ingress at the head-office edge.</p><p><b>Lesson:</b> QoS is end to end and both directions; agree the mapping with the provider.</p></div>

<div class="iv"><p class="q">"Where would you place the trust boundary and why?"</p><p>At the access port, as close to the source as possible. Trust phones conditionally, re-mark PCs and everything unknown, trust DSCP on links between network devices you own. Mention why: otherwise any user can claim the priority queue.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>QoS manages delay, jitter and loss during congestion only.</li>
<li>4, 8 and 12-class models trade simplicity for granularity; match the model to the provider and the applications.</li>
<li>Voice is EF (46), signaling CS3, network control CS6, scavenger CS1.</li>
<li>Classify and mark near the source; set the trust boundary at the access edge.</li>
<li>Always design the mapping to the provider classes in both directions.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap customer network ke around network services ko sirf configure nahi, balki design karna seekhoge: end-to-end QoS, multicast, IPv6 transition, DHCP/DNS/NTP, AAA aur ISE-TrustSec ke saath segmentation, SD-Access aur SD-WAN policy, wireless integration, aur Internet edge aur cloud services. Har chapter ek realistic customer se shuru hota hai, requirements aur constraints likhta hai, trade-off table mein options compare karta hai, phir design justify karta hai. Yeh Cisco 300-420 ENSLD exam (v1.1) ke Network Services domain ko follow karta hai.</p>
<p><b>Prerequisites.</b> Aapko VLANs, OSPF/BGP basics, aur WAN link kya hota hai yeh pata hona chahiye. Pehle ke ENSLD modules campus, WAN aur fabric design cover karte hain; hum unhe repeat nahi karenge, bas refer karenge.</p>

<h3>Customer case: Harbourline Insurance</h3>
<div class="eg"><p><b>Company:</b> Harbourline Insurance, 3,200 staff. Head office, 14 branches aur ek DR site. <b>Budget:</b> is saal koi naya WAN circuit nahi. <b>Problem:</b> IP telephony aur cloud video meeting platform par shift hone ke baad claims agents har dopahar choppy calls ki shikayat karte hain, jabki raat ka backup job usi MPLS links par chalta hai. <b>Constraints:</b> head office par 100 Mb/s MPLS, har branch par 20 Mb/s, provider 4 QoS classes deta hai, aur CIO chahta hai ki claims web app general web browsing se upar prioritise ho.</p></div>

<h3>QoS kyun hota hai</h3>
<p>Motorway par ambulance lane socho. Lane na ho to ambulance lorries ke peeche phansi rehti hai. <b>Quality of Service (QoS)</b> woh tools ka set hai jo link congested hone par time-sensitive traffic ko apni alag lane deta hai. Agar link kabhi congested nahi hota, to QoS kuch nahi karta. Voice, video aur critical applications teen numbers ki parwah karti hain: <b>delay</b>, <b>jitter</b> (delay ka variation) aur <b>loss</b>. Voice ke liye Cisco guidelines hain: one-way delay 150 ms ya kam, jitter 30 ms ya kam aur loss 1 percent ya kam. Interactive video ke targets bhi lagbhag aise hi hain.</p>

<h3>Requirements, constraints, options</h3>
<p>Harbourline ki requirements: (1) saaf voice aur video, (2) claims app responsive, (3) backups raat mein khatam hon lekin din ke kaam ko kabhi hurt na karein. Constraint hai fixed circuit speed aur provider ka 4-class offer. Design question yeh hai: andar kitni classes use karein, aur woh provider se kaise map hon?</p>
<table class="cmp"><tr><th>Model</th><th>Classes</th><th>Kiske liye accha</th><th>Trade-off</th></tr>
<tr><td><b>4-class</b></td><td>Real-time, signaling aur control, critical data, best effort</td><td>Chhoti sites, simple operations, provider kam classes deta ho</td><td>Video aur voice ek hi queue share karte hain; scavenger nahi</td></tr>
<tr><td><b>8-class</b></td><td>Voice, interactive video, call signaling, network control, critical data, bulk data, scavenger, default</td><td>Zyada tar enterprises</td><td>Marking discipline aur zyada policy chahiye</td></tr>
<tr><td><b>12-class</b></td><td>Broadcast video, multimedia conferencing, multimedia streaming, OAM jodta hai, critical data ko split karta hai</td><td>Video-heavy business wale bade campuses</td><td>Sabse granular; zyada queues aur monitoring</td></tr></table>

<h3>Classification aur marking</h3>
<p><b>Classification</b> ka matlab hai tay karna ki packet kis class ka hai (ACL, protocol, ya NBAR2 application recognition se). <b>Marking</b> us jawab ko packet mein likh deta hai taaki baad ke devices sirf padhein. Layer 3 marking <b>DSCP</b> hai (IP header mein 6 bits). Layer 2 marking <b>CoS</b> hai (802.1Q tag mein 3 bits). Source ke jitna paas ho classify aur mark karo, phir baaki sab jagah mark ke basis par queue karo. 12-class model ke liye Cisco ki recommended values:</p>
<table class="cmp"><tr><th>Application</th><th>DSCP</th><th>Queue treatment</th></tr>
<tr><td>Voice</td><td>EF (46)</td><td>Strict priority (LLQ)</td></tr>
<tr><td>Broadcast video</td><td>CS5</td><td>Priority ya guaranteed</td></tr>
<tr><td>Real-time interactive video</td><td>CS4</td><td>Priority ya guaranteed</td></tr>
<tr><td>Multimedia conferencing</td><td>AF41</td><td>Guaranteed, DSCP-based WRED ke saath</td></tr>
<tr><td>Multimedia streaming</td><td>AF31</td><td>Guaranteed, WRED ke saath</td></tr>
<tr><td>Network control (routing)</td><td>CS6</td><td>Guaranteed, chhota</td></tr>
<tr><td>Call signaling</td><td>CS3</td><td>Guaranteed, chhota</td></tr>
<tr><td>OAM (management)</td><td>CS2</td><td>Guaranteed, chhota</td></tr>
<tr><td>Transactional data</td><td>AF21</td><td>Guaranteed, WRED ke saath</td></tr>
<tr><td>Bulk data</td><td>AF11</td><td>Guaranteed, limited</td></tr>
<tr><td>Scavenger</td><td>CS1</td><td>Minimum, default se neeche</td></tr>
<tr><td>Default</td><td>0</td><td>Bachi hui bandwidth</td></tr></table>

<h3>Trust boundaries</h3>
<p><b>Trust boundary</b> network ka woh point hai jahan aap aane wali markings par bharosa karna band karke apni markings enforce karte ho. Agar laptop user download par DSCP 46 set kar de, to woh voice ki lane chura leta hai. Best practice hai ki boundary access port par rakho. Cisco IP phone trusted device hai, isliye phone detect hone par uski voice marking accept hoti hai (conditional trust). PC untrusted hai, isliye uska traffic policy se re-mark hota hai. Apne hi switches aur routers ke beech uplinks trusted hote hain.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Trust boundary design">
<rect x="10" y="30" width="110" height="46" rx="8" fill="#fed7aa"/><text x="65" y="58" text-anchor="middle" class="svg-ink" font-size="13">PC (untrusted)</text>
<rect x="10" y="120" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="65" y="148" text-anchor="middle" class="svg-ink" font-size="13">IP phone</text>
<rect x="190" y="70" width="120" height="60" rx="8" fill="#bae6fd"/><text x="250" y="96" text-anchor="middle" class="svg-ink" font-size="13">Access switch</text><text x="250" y="114" text-anchor="middle" class="svg-muted" font-size="12">trust boundary</text>
<rect x="380" y="70" width="100" height="60" rx="8" fill="#ddd6fe"/><text x="430" y="105" text-anchor="middle" class="svg-ink" font-size="13">Distribution</text>
<rect x="540" y="70" width="90" height="60" rx="8" fill="#fde68a"/><text x="585" y="105" text-anchor="middle" class="svg-ink" font-size="13">WAN edge</text>
<line x1="120" y1="53" x2="190" y2="90" stroke="#64748b" stroke-width="2"/><line x1="120" y1="143" x2="190" y2="112" stroke="#64748b" stroke-width="2"/>
<line x1="310" y1="100" x2="380" y2="100" stroke="#64748b" stroke-width="2"/><line x1="480" y1="100" x2="540" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="190" y1="20" x2="190" y2="190" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="150" y="16" text-anchor="middle" class="svg-muted" font-size="12">re-mark</text><text x="330" y="16" text-anchor="middle" class="svg-muted" font-size="12">DSCP trust</text>
<rect x="190" y="200" width="14" height="14" fill="#fed7aa"/><text x="210" y="212" class="svg-ink" font-size="12">untrusted</text>
<rect x="290" y="200" width="14" height="14" fill="#bbf7d0"/><text x="310" y="212" class="svg-ink" font-size="12">trusted</text>
<rect x="380" y="200" width="14" height="14" fill="#fde68a"/><text x="400" y="212" class="svg-ink" font-size="12">provider edge</text>
</svg><p class="cap">Dashed line trust boundary hai. Iske left mein markings policy se rewrite hoti hain; right mein DSCP par trust kiya jaata hai.</p></div>

<h3>Harbourline ke liye chosen design</h3>
<p>Hum har site ke andar <b>8-class model</b> choose karte hain kyunki provider sirf 4 classes deta hai: CE edge par hum 8 internal classes ko provider ki 4 mein map karte hain (real-time, critical, bulk, default) aur bahar jaate waqt re-mark karte hain. 12-class model aisi complexity jodta jo provider waise bhi mita deta. Access ports par ingress policy aisi dikhti hai:</p>
<pre class="code"><span class="c">! Mark on the access switch, close to the source</span>
class-map match-any VOICE
 match dscp ef
class-map match-any SIGNALING
 match dscp cs3
class-map match-any CRITICAL-APP
 match access-group name CLAIMS-APP
policy-map ACCESS-IN
 class VOICE
  set dscp ef
 class SIGNALING
  set dscp cs3
 class CRITICAL-APP
  set dscp af21
 class class-default
  set dscp default
interface GigabitEthernet1/0/10
 service-policy input ACCESS-IN</pre>
<pre class="out">Switch# show policy-map interface GigabitEthernet1/0/10 input
 Service-policy input: ACCESS-IN
  Class-map: CRITICAL-APP (match-any)
   <span class="hl">12840 packets, 9120300 bytes</span>
    QoS Set  dscp af21</pre>

<div class="warn"><p><b>Common galti.</b> "Simple rakhne ke liye" user ports par saara DSCP trust kar lena. Ek misconfigured application jo sab kuch EF mark kare, priority queue bhar sakti hai aur asli voice ko starve kar sakti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> QoS sirf congestion mein madad karta hai. Agar uncongested link par calls choppy hain, to loss, duplex issue ya galat shaper dhundo, missing queue nahi.</p></div>

<div class="scn"><h4>Post-mortem: voice mark thi, phir bhi choppy</h4><p>Rollout ke baad branch calls 3 baje bhi choppy thi. Team ne phones par EF mark kiya tha lekin WAN edge policy sirf outbound side par DSCP 46 match karti thi; provider ne traffic wapas 0 par re-mark karke lautaya aur head-office egress par uske liye koi class nahi thi, isliye return voice backups ke saath default queue share kar rahi thi. Unhone real-time ke liye provider ke saath agreed class map jodi aur head-office edge par ingress par re-mark kiya.</p><p><b>Seekh:</b> QoS end to end hai aur dono directions mein; provider ke saath mapping agree karo.</p></div>

<div class="iv"><p class="q">"Trust boundary kahan rakhoge aur kyun?"</p><p>Access port par, source ke jitna paas ho sake. Phones ko conditionally trust karo, PCs aur har unknown cheez ko re-mark karo, aur apne network devices ke beech links par DSCP trust karo. Kyun batao: warna koi bhi user priority queue claim kar sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>QoS delay, jitter aur loss ko sirf congestion ke dauraan manage karta hai.</li>
<li>4, 8 aur 12-class models simplicity aur granularity ka trade-off hain; model ko provider aur applications se match karo.</li>
<li>Voice EF (46), signaling CS3, network control CS6, scavenger CS1.</li>
<li>Source ke paas classify aur mark karo; trust boundary access edge par rakho.</li>
<li>Provider classes ka mapping hamesha dono directions mein design karo.</li>
</ul></div>
`}};export{e as default};