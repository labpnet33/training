var e={id:`marking`,h:{en:`How a packet is marked and treated: DSCP, class, queue in one picture`,hi:`Packet kaise mark aur treat hota hai: DSCP, class, queue ek picture mein`},body:{en:`
<p>Imagine a courier company. At the counter, a clerk looks at each parcel and sticks a coloured label on it: red for urgent medicine, yellow for normal, grey for bulk. Later, at every sorting hub, nobody opens the parcel; the hub just reads the label and puts the parcel on the right belt. QoS works the same way. The first trusted device <b>classifies and marks</b>, and every later device just reads the mark and <b>treats</b> the packet accordingly.</p>

<h3>The label: DSCP</h3>
<p>Every IPv4 packet has a one-byte field called ToS (Type of Service). Its top six bits carry the <b>DSCP</b>, Differentiated Services Code Point, a number from 0 to 63. It is the label. Because it sits inside the IP header, it travels end to end with the packet, through routers. Three values to remember now:</p>
<table class="cmp"><tr><th>Name</th><th>Number</th><th>Typical use</th></tr>
<tr><td><b>EF</b> (Expedited Forwarding)</td><td>46</td><td>Voice calls</td></tr>
<tr><td><b>AF41</b> (Assured Forwarding)</td><td>34</td><td>Interactive video</td></tr>
<tr><td><b>default (CS0)</b></td><td>0</td><td>Everything not marked</td></tr></table>
<p>There are many more (AF11 for bulk-like data, CS3 for call signalling, CS6 for routing protocols). We study them all in mq-mark. A mark is only a <i>request</i>: the packet does not move faster by itself. It moves faster only if routers are configured to react to the label.</p>

<h3>The picture in four boxes</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Classify, mark, queue, schedule">
<rect x="10" y="50" width="130" height="100" rx="10" fill="#bae6fd"/><text x="75" y="85" text-anchor="middle" class="svg-ink" font-size="14">1. Classify</text><text x="75" y="108" text-anchor="middle" class="svg-muted" font-size="12">which flow is this?</text><text x="75" y="126" text-anchor="middle" class="svg-muted" font-size="12">class-map</text>
<rect x="170" y="50" width="130" height="100" rx="10" fill="#ddd6fe"/><text x="235" y="85" text-anchor="middle" class="svg-ink" font-size="14">2. Mark</text><text x="235" y="108" text-anchor="middle" class="svg-muted" font-size="12">write DSCP</text><text x="235" y="126" text-anchor="middle" class="svg-muted" font-size="12">set dscp ef</text>
<rect x="330" y="50" width="130" height="100" rx="10" fill="#bbf7d0"/><text x="395" y="85" text-anchor="middle" class="svg-ink" font-size="14">3. Queue</text><text x="395" y="108" text-anchor="middle" class="svg-muted" font-size="12">one queue per class</text><text x="395" y="126" text-anchor="middle" class="svg-muted" font-size="12">voice, data, default</text>
<rect x="490" y="50" width="130" height="100" rx="10" fill="#fde68a"/><text x="555" y="85" text-anchor="middle" class="svg-ink" font-size="14">4. Send</text><text x="555" y="108" text-anchor="middle" class="svg-muted" font-size="12">scheduler picks</text><text x="555" y="126" text-anchor="middle" class="svg-muted" font-size="12">voice first</text>
<line x1="140" y1="100" x2="170" y2="100" stroke="#64748b" stroke-width="3"/><line x1="300" y1="100" x2="330" y2="100" stroke="#64748b" stroke-width="3"/><line x1="460" y1="100" x2="490" y2="100" stroke="#64748b" stroke-width="3"/>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">Steps 1-2 happen at the edge (input). Steps 3-4 happen where the link is narrow (output).</text>
</svg><p class="cap">Classify and mark once, close to the source. Queue and schedule where congestion happens.</p></div>

<h3>Classify: which flow is this?</h3>
<p>Classification looks at the packet and sorts it. On a Cisco-style router you describe the sorting rule with a <b>class-map</b>. It can match an access list (source, destination, protocol, port), a DSCP value, an interface and more. In an access list used by a class-map, <code>permit</code> only means "this packet belongs to the class"; nothing is blocked. Voice from IP phones usually uses UDP ports 16384 to 32767, so we describe it like this:</p>
<pre class="code"><span class="c">! describe the voice flow</span>
ip access-list extended VOICE-RTP
 permit udp 10.10.10.0 0.0.0.255 any range 16384 32767
class-map match-any VOICE
 match access-group name VOICE-RTP</pre>

<h3>Mark and treat: the policy-map</h3>
<p>A <b>policy-map</b> says what to do with each class. It can mark (<code>set dscp ef</code>), limit (<code>police</code>), or give queue rules (<code>priority</code>, <code>bandwidth</code>). You attach a policy to an interface in one direction with <code>service-policy input</code> or <code>service-policy output</code>. Marking is usually done on <b>input</b>, where traffic enters from the untrusted user side; queuing is done on <b>output</b>, towards the narrow link.</p>
<pre class="code">policy-map MARK-IN
 class VOICE
  set dscp ef
interface GigabitEthernet0/0
 service-policy input MARK-IN</pre>
<p>This bundle (class-map, policy-map, service-policy) is called the <b>Modular QoS CLI, MQC</b>. It is the same on routers for all QoS jobs, so learning it once pays for the whole track.</p>

<div class="eg"><p><b>Worked example.</b> A phone sends a packet with DSCP 0. It enters R1 on Gi0/0. The class VOICE matches it (UDP port 20000, from the phone subnet), and the policy sets DSCP to 46. It leaves R1 towards the head office with DSCP 46. Every later router can now read 46 and place it in a priority queue, without examining ports again.</p></div>

<h3>Trust boundary</h3>
<p>A <b>trust boundary</b> is the point where you decide whether to believe the marks that arrive. Users can set any DSCP on their own PC, so a laptop that marks all its traffic EF would steal priority. At the edge of the company network, you either re-mark everything yourself or accept marks only from devices you control, such as IP phones. mq-mark covers this in depth.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Marking packets but never configuring a queue policy later; marking alone changes nothing on the wire. (2) Applying a marking policy in the wrong direction. A policy that should mark packets entering from the LAN must be <code>input</code> on the LAN interface. (3) Trusting every device's marks.</p></div>

<div class="exam"><p><b>Exam trap.</b> The usual voice value is EF, decimal 46. A class-map with <code>match-any</code> needs any one condition true; <code>match-all</code> needs all.</p></div>

<div class="scn"><h4>The policy that matched nothing</h4><p>A Pune engineer wrote a perfect class-map and policy-map for voice, applied it, and saw the counter for class VOICE stuck at zero while calls were running. The policy was attached <code>output</code> on the LAN port, but the phones' packets entered on that port, so they never passed through an output policy there. Moving it to <code>input</code> made the counter climb at once.</p><p><b>Lesson:</b> when a class counter is zero, check the direction and the interface before blaming the class-map.</p></div>

<div class="iv"><p class="q">"What is DSCP and where should you mark traffic?"</p><p>Strong answer: DSCP is a 6-bit value in the IP header used to tag a packet's class so later hops can queue it properly. Mark as close to the source as possible, on ingress at the trust boundary, and re-mark anything from untrusted devices. Mention EF 46 for voice and that a mark has no effect without a queuing policy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>QoS has three jobs: classify, mark, treat.</li>
<li>DSCP is the 6-bit label in the IP header; EF (46) is the usual voice value.</li>
<li>MQC uses class-map (what), policy-map (do what) and service-policy (where).</li>
<li>Mark on input at the trust boundary; queue on output at the narrow link.</li>
<li>A mark does nothing until some device is configured to act on it.</li>
</ul></div>
`,hi:`
<p>Ek courier company ki kalpana karo. Counter par clerk har parcel dekh kar usse ek rangeen label chipkata hai: urgent dawai ke liye laal, normal ke liye peela, bulk ke liye grey. Baad mein har sorting hub par koi parcel kholta nahi; hub bas label padhta hai aur parcel ko sahi belt par daal deta hai. QoS bhi aise hi kaam karta hai. Pehla trusted device <b>classify aur mark</b> karta hai, aur baad ka har device bas mark padhta hai aur packet ko <b>treat</b> karta hai.</p>

<h3>Label: DSCP</h3>
<p>Har IPv4 packet mein ek byte ka field hota hai jise ToS (Type of Service) kehte hain. Uske upar ke chhe bits mein <b>DSCP</b>, Differentiated Services Code Point, hota hai, 0 se 63 tak ka number. Yahi label hai. Kyunki yeh IP header ke andar hai, yeh packet ke saath end to end, routers ke paar bhi jaata hai. Abhi teen values yaad rakho:</p>
<table class="cmp"><tr><th>Naam</th><th>Number</th><th>Typical use</th></tr>
<tr><td><b>EF</b> (Expedited Forwarding)</td><td>46</td><td>Voice calls</td></tr>
<tr><td><b>AF41</b> (Assured Forwarding)</td><td>34</td><td>Interactive video</td></tr>
<tr><td><b>default (CS0)</b></td><td>0</td><td>Jo kuch mark nahi hua</td></tr></table>
<p>Aur bhi bahut hain (bulk-jaise data ke liye AF11, call signalling ke liye CS3, routing protocols ke liye CS6). Hum sab mq-mark mein padhenge. Mark sirf ek <i>request</i> hai: packet khud se tez nahi chalta. Woh tabhi tez chalta hai jab routers label par react karne ke liye configured hon.</p>

<h3>Chaar boxes mein picture</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Classify, mark, queue, schedule">
<rect x="10" y="50" width="130" height="100" rx="10" fill="#bae6fd"/><text x="75" y="85" text-anchor="middle" class="svg-ink" font-size="14">1. Classify</text><text x="75" y="108" text-anchor="middle" class="svg-muted" font-size="12">yeh kaunsa flow hai?</text><text x="75" y="126" text-anchor="middle" class="svg-muted" font-size="12">class-map</text>
<rect x="170" y="50" width="130" height="100" rx="10" fill="#ddd6fe"/><text x="235" y="85" text-anchor="middle" class="svg-ink" font-size="14">2. Mark</text><text x="235" y="108" text-anchor="middle" class="svg-muted" font-size="12">DSCP likho</text><text x="235" y="126" text-anchor="middle" class="svg-muted" font-size="12">set dscp ef</text>
<rect x="330" y="50" width="130" height="100" rx="10" fill="#bbf7d0"/><text x="395" y="85" text-anchor="middle" class="svg-ink" font-size="14">3. Queue</text><text x="395" y="108" text-anchor="middle" class="svg-muted" font-size="12">har class ki ek queue</text><text x="395" y="126" text-anchor="middle" class="svg-muted" font-size="12">voice, data, default</text>
<rect x="490" y="50" width="130" height="100" rx="10" fill="#fde68a"/><text x="555" y="85" text-anchor="middle" class="svg-ink" font-size="14">4. Send</text><text x="555" y="108" text-anchor="middle" class="svg-muted" font-size="12">scheduler chunta hai</text><text x="555" y="126" text-anchor="middle" class="svg-muted" font-size="12">voice pehle</text>
<line x1="140" y1="100" x2="170" y2="100" stroke="#64748b" stroke-width="3"/><line x1="300" y1="100" x2="330" y2="100" stroke="#64748b" stroke-width="3"/><line x1="460" y1="100" x2="490" y2="100" stroke="#64748b" stroke-width="3"/>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">Steps 1-2 edge par hote hain (input). Steps 3-4 wahan jahan link patli hai (output).</text>
</svg><p class="cap">Classify aur mark ek baar karo, source ke paas. Queue aur schedule wahan jahan congestion hota hai.</p></div>

<h3>Classify: yeh kaunsa flow hai?</h3>
<p>Classification packet ko dekh kar use baantta hai. Cisco-style router par sorting rule ko aap <b>class-map</b> se describe karte ho. Yeh access list (source, destination, protocol, port), DSCP value, interface aur bhi kuch match kar sakta hai. Class-map mein use hone wali access list mein <code>permit</code> ka matlab sirf "yeh packet is class ka hai"; kuch block nahi hota. IP phones ka voice aksar UDP ports 16384 se 32767 use karta hai, isliye hum use aise describe karte hain:</p>
<pre class="code"><span class="c">! voice flow describe karo</span>
ip access-list extended VOICE-RTP
 permit udp 10.10.10.0 0.0.0.255 any range 16384 32767
class-map match-any VOICE
 match access-group name VOICE-RTP</pre>

<h3>Mark aur treat: policy-map</h3>
<p><b>Policy-map</b> batata hai ki har class ke saath kya karna hai. Yeh mark kar sakta hai (<code>set dscp ef</code>), limit kar sakta hai (<code>police</code>), ya queue rules de sakta hai (<code>priority</code>, <code>bandwidth</code>). Policy ko interface par ek direction mein <code>service-policy input</code> ya <code>service-policy output</code> se attach karte hain. Marking aam taur par <b>input</b> par hoti hai, jahan traffic untrusted user side se andar aata hai; queuing <b>output</b> par hoti hai, patli link ki taraf.</p>
<pre class="code">policy-map MARK-IN
 class VOICE
  set dscp ef
interface GigabitEthernet0/0
 service-policy input MARK-IN</pre>
<p>Yeh bundle (class-map, policy-map, service-policy) <b>Modular QoS CLI, MQC</b> kehlata hai. Yeh routers par har QoS kaam ke liye same hai, isliye ek baar seekhna poore track ke kaam aata hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek phone DSCP 0 wala packet bhejta hai. Woh R1 mein Gi0/0 par aata hai. Class VOICE use match karti hai (UDP port 20000, phone subnet se), aur policy DSCP ko 46 set karti hai. Woh DSCP 46 ke saath R1 se head office ki taraf nikalta hai. Baad ka har router ab 46 padh kar use priority queue mein daal sakta hai, ports phir se jaanche bina.</p></div>

<h3>Trust boundary</h3>
<p><b>Trust boundary</b> woh point hai jahan aap decide karte ho ki aane wale marks par bharosa karna hai ya nahi. Users apne PC par koi bhi DSCP set kar sakte hain, isliye jo laptop apna sab traffic EF mark kare woh priority chura leta hai. Company network ke edge par aap ya to sab kuch khud re-mark karte ho ya marks sirf un devices se maante ho jo aapke control mein hain, jaise IP phones. mq-mark ise gehrai mein cover karta hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Packets mark kar dena par baad mein koi queue policy configure na karna; sirf marking se wire par kuch nahi badalta. (2) Marking policy galat direction mein lagana. Jo policy LAN se aate packets ko mark kare woh LAN interface par <code>input</code> honi chahiye. (3) Har device ke marks par bharosa karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Voice ki usual value EF hai, decimal 46. <code>match-any</code> wale class-map ko koi ek condition true chahiye; <code>match-all</code> ko sab.</p></div>

<div class="scn"><h4>Jis policy ne kuch match nahi kiya</h4><p>Pune ke ek engineer ne voice ke liye perfect class-map aur policy-map likha, apply kiya, aur dekha ki calls chalte waqt class VOICE ka counter zero par atka hai. Policy LAN port par <code>output</code> lagayi thi, lekin phones ke packets us port par andar aate the, isliye woh wahan kisi output policy se guzarte hi nahi the. Ise <code>input</code> mein badalte hi counter turant badhne laga.</p><p><b>Seekh:</b> jab class counter zero ho, class-map ko doshi thehraane se pehle direction aur interface check karo.</p></div>

<div class="iv"><p class="q">"DSCP kya hai aur traffic ko kahan mark karna chahiye?"</p><p>Strong answer: DSCP IP header mein 6-bit value hai jo packet ki class tag karti hai taaki baad ke hops use sahi queue kar sakein. Source ke jitna paas ho sake mark karo, trust boundary par ingress mein, aur untrusted devices ka sab kuch re-mark karo. EF 46 voice ke liye batao aur yeh ki queuing policy ke bina mark ka koi asar nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>QoS ke teen kaam hain: classify, mark, treat.</li>
<li>DSCP IP header ka 6-bit label hai; EF (46) voice ki usual value hai.</li>
<li>MQC class-map (kya), policy-map (kya karna) aur service-policy (kahan) use karta hai.</li>
<li>Trust boundary par input mein mark karo; patli link par output mein queue karo.</li>
<li>Mark tab tak kuch nahi karta jab tak koi device uspar act karne ke liye configured na ho.</li>
</ul></div>
`}};export{e as default};