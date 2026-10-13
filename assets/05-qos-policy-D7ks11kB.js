var e={id:`qos-policy`,h:{en:`QoS policy: priority classes, transfer types, DSCP and bandwidth`,hi:`QoS policy: priority classes, transfer types, DSCP aur bandwidth`},body:{en:`
<p>When a circuit is full, someone has to wait. <b>QoS policy</b> decides who. Path policy picks the circuit, performance policy watches quality, and QoS policy shares the bandwidth of each circuit between applications. The exam covers it under <b>policy design: QoS</b>.</p>
<h3>Analogy: lanes on a motorway at rush hour</h3>
<p>At rush hour a motorway has a bus lane (Platinum), a car-pool lane (Gold), normal lanes (Silver) and a slow lane for lorries (Bronze). Inside each lane, ambulances still go first. QoS policy in Prisma SD-WAN has exactly that shape: <b>priority classes</b> and, inside each, <b>transfer types</b>.</p>
<h3>Priority classes and transfer types</h3>
<p>The documentation describes <b>four priority classes: Platinum, Gold, Silver and Bronze</b>, each containing four sub-queues for <b>real-time video, real-time audio, transactional and bulk</b>. A QoS rule assigns a flow to a priority class and a transfer type. When the circuit is congested, the ION shares capacity between the classes by their configured weights; inside a class, the queue service order is real-time audio, real-time video, transactional, then bulk.</p>
<table class="cmp"><tr><th></th><th>Real-time audio</th><th>Real-time video</th><th>Transactional</th><th>Bulk</th></tr>
<tr><td><b>Platinum</b></td><td>Voice</td><td></td><td>Payments</td><td></td></tr>
<tr><td><b>Gold</b></td><td></td><td>Video meetings</td><td>Core business apps</td><td></td></tr>
<tr><td><b>Silver</b></td><td></td><td></td><td>ERP, web</td><td>Updates</td></tr>
<tr><td><b>Bronze</b></td><td></td><td></td><td></td><td>Backups, guest</td></tr></table>
<p>For orientation, the ION CLI reference sample for the command <code>dump priority-policy config policy-sets all</code> shows a QoS policy set whose business priorities carry 50 percent for Platinum, 25 for Gold, 15 for Silver and 10 for Bronze, with a bandwidth split per type (bulk, real-time audio, real-time video, transactional) inside each. Treat these as a sample from the documentation, not as defaults to rely on: your policy set defines the weights.</p>
<h3>The QoS rule</h3>
<ul>
<li><b>Match:</b> network context, source and destination prefixes, applications (up to 256 per rule), users and groups, device profiles.</li>
<li><b>Action:</b> priority class and transfer type, plus DSCP handling: <b>no action</b> (the packet marking is not modified) or <b>mark or remark</b> with a value from 0 to 63, which is applied to all packets of the flow.</li>
<li><b>Order:</b> default 1024; lower numbers win.</li>
<li><b>Precedence when several rules could match:</b> network context first, then source prefix, then application, then destination prefix.</li>
</ul>
<p>A new QoS policy set can be created from a template that holds two default rules, <b>Default Rule</b> and <b>Enterprise Default Rule</b>, or by cloning an existing set or starting blank.</p>
<h3>DSCP trust: using the marks the LAN already sets</h3>
<p>Many sites already mark packets (voice as EF). The DSCP configuration in QoS policy lets the ION map existing marks to a priority and a transfer type, with a first-match lookup in the same order as the policy set. The documentation gives a standard mapping:</p>
<table class="cmp"><tr><th>DSCP</th><th>Priority</th><th>Transfer type</th></tr>
<tr><td>EF</td><td>Platinum</td><td>Audio</td></tr>
<tr><td>AF41, AF31</td><td>Gold</td><td>Video</td></tr>
<tr><td>CS6</td><td>Platinum</td><td>Transactional</td></tr>
<tr><td>AF21</td><td>Silver</td><td>Transactional</td></tr>
<tr><td>AF11</td><td>Bronze</td><td>Bulk</td></tr></table>
<p>Flows that match the default policy rules and a DSCP value are placed in the priority queue and transfer type given by the DSCP map. Up to 16 DSCP values can be configured. Remember the trust question from QoS design: only trust marks that come from devices you control. Guest networks must not be able to mark themselves EF.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="QoS classes">
<rect x="10" y="10" width="620" height="50" rx="8" fill="#bbf7d0"/><text x="30" y="40" class="svg-ink" font-size="13">Platinum</text><text x="140" y="40" class="svg-muted" font-size="12">voice (EF), payments (CS6)</text><text x="560" y="40" text-anchor="end" class="svg-ink" font-size="13">50%</text>
<rect x="10" y="68" width="440" height="50" rx="8" fill="#bae6fd"/><text x="30" y="98" class="svg-ink" font-size="13">Gold</text><text x="140" y="98" class="svg-muted" font-size="12">video (AF41, AF31)</text><text x="430" y="98" text-anchor="end" class="svg-ink" font-size="13">25%</text>
<rect x="10" y="126" width="330" height="50" rx="8" fill="#fde68a"/><text x="30" y="156" class="svg-ink" font-size="13">Silver</text><text x="140" y="156" class="svg-muted" font-size="12">ERP (AF21)</text><text x="320" y="156" text-anchor="end" class="svg-ink" font-size="13">15%</text>
<rect x="10" y="184" width="220" height="50" rx="8" fill="#fed7aa"/><text x="30" y="214" class="svg-ink" font-size="13">Bronze</text><text x="120" y="214" class="svg-muted" font-size="12">bulk (AF11)</text><text x="210" y="214" text-anchor="end" class="svg-ink" font-size="13">10%</text>
</svg><p class="cap">Illustration of a congested circuit with the sample weights from the documentation. Unused capacity of a class is not wasted; the weights matter when there is contention.</p></div>
<h3>Capacity matters</h3>
<p>QoS can only share what it knows. The stacked policies documentation lists <b>circuit capacity</b> next to DSCP configuration: set each circuit's capacity to the real contracted rate (upload and download), not to the interface speed. If a 100 Mbps contract is entered as 1 Gbps, the ION will not queue early enough and the provider will drop packets blindly instead.</p>
<h3>Portal walk-through (not run in the simulator)</h3>
<p>The documented path for DSCP mapping is Configuration, Prisma SD-WAN, Policies, QoS, QoS Stacks, Advanced, QoS Sets, then DSCP Configuration: enter DSCP values (up to 16), assign priority and traffic type, save. QoS policy sets and rules are created in the same QoS area, then placed in a simple or advanced QoS stack and bound to sites.</p>
<div class="eg"><p><b>Worked example: STORE-007 on a 100 Mbps MPLS circuit.</b> Offered load at the busy hour: voice 6 Mbps, payments 2 Mbps, video 20 Mbps, ERP 50 Mbps, backup 80 Mbps. Total 158 Mbps on a 100 Mbps circuit: congestion. With the sample weights, Platinum (50 Mbps share) carries voice and payments (8 Mbps) fully; Gold (25 Mbps share) carries video at 20 Mbps fully; Silver (15 Mbps) and Bronze (10 Mbps) are guaranteed their shares while spare capacity (72 Mbps left after Platinum and Gold use 28) is shared by the busy lower classes. Voice and payments never wait; backup is slowed, which is acceptable.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Putting every application in Platinum, which removes the meaning of priority. Wrong circuit capacity. Trusting DSCP from guest or user devices. Forgetting that QoS applies per circuit, so a flow moved by path policy gets the treatment of its new circuit.</p></div>
<div class="exam"><p><b>Exam trap.</b> Four classes (Platinum, Gold, Silver, Bronze) times four transfer types (real-time audio, real-time video, transactional, bulk). Rule precedence: network context, source prefix, application, destination prefix. DSCP marks 0 to 63; no action versus mark or remark; up to 16 DSCP map values.</p></div>
<div class="scn"><h4>The backup that killed voice</h4><p>A nightly backup started at 08:00 after a time-zone change and filled the 100 Mbps MPLS circuit of a call centre. Voice quality dropped although the path policy was perfect. The review found the backup application had been mapped to the Silver class with transactional type by a broad rule. A specific QoS rule put backup into Bronze bulk and voice stayed in Platinum audio; calls stayed clear even with the backup running.</p><p><b>Lesson:</b> path is not enough; the queue decides who waits.</p></div>
<div class="iv"><p class="q">"How does QoS work in Prisma SD-WAN?"</p><p>Rules assign flows to one of four priority classes (Platinum, Gold, Silver, Bronze) and one of four transfer types (real-time audio, real-time video, transactional, bulk). The ION shares circuit capacity by class weights and serves queues in a fixed order inside a class. Rules can mark DSCP, or trust existing marks through a DSCP map. Circuit capacity must be correct for shaping to work.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Four priority classes and four transfer types shape who waits when a circuit is full.</li>
<li>Rule match: context, prefixes, applications, users, devices; precedence puts context first.</li>
<li>DSCP: no action or mark 0 to 63; DSCP map for trusted marks, up to 16 values.</li>
<li>Set real circuit capacity; use Platinum sparingly.</li>
<li>Sample weights in the documentation (50, 25, 15, 10) are examples, not fixed defaults.</li>
</ul></div>
`,hi:`
<p>Jab circuit bhar jaata hai, kisi ko intezaar karna padta hai. <b>QoS policy</b> tay karti hai ki kisko. Path policy circuit chunti hai, performance policy quality dekhti hai, aur QoS policy har circuit ki bandwidth ko applications ke beech baantti hai. Exam ise <b>policy design: QoS</b> ke under cover karta hai.</p>
<h3>Analogy: rush hour mein motorway ki lanes</h3>
<p>Rush hour mein motorway par bus lane (Platinum), car-pool lane (Gold), normal lanes (Silver) aur lorries ke liye slow lane (Bronze) hoti hai. Har lane ke andar bhi ambulances pehle jaati hain. Prisma SD-WAN QoS policy ki shape bilkul yahi hai: <b>priority classes</b> aur har ek ke andar <b>transfer types</b>.</p>
<h3>Priority classes aur transfer types</h3>
<p>Documentation <b>chaar priority classes: Platinum, Gold, Silver aur Bronze</b> batati hai, har ek mein <b>real-time video, real-time audio, transactional aur bulk</b> ke chaar sub-queues. QoS rule flow ko priority class aur transfer type assign karta hai. Jab circuit congested ho, ION classes ke configured weights se capacity baantta hai; class ke andar queue service order real-time audio, real-time video, transactional, phir bulk hota hai.</p>
<table class="cmp"><tr><th></th><th>Real-time audio</th><th>Real-time video</th><th>Transactional</th><th>Bulk</th></tr>
<tr><td><b>Platinum</b></td><td>Voice</td><td></td><td>Payments</td><td></td></tr>
<tr><td><b>Gold</b></td><td></td><td>Video meetings</td><td>Core business apps</td><td></td></tr>
<tr><td><b>Silver</b></td><td></td><td></td><td>ERP, web</td><td>Updates</td></tr>
<tr><td><b>Bronze</b></td><td></td><td></td><td></td><td>Backups, guest</td></tr></table>
<p>Orientation ke liye, ION CLI reference ka command <code>dump priority-policy config policy-sets all</code> ka sample ek QoS policy set dikhata hai jiske business priorities mein Platinum 50 percent, Gold 25, Silver 15 aur Bronze 10 hai, har ek ke andar per type bandwidth split ke saath (bulk, real-time audio, real-time video, transactional). Ise documentation ka sample samjho, aisa default nahi jis par bharosa karo: weights aapka policy set define karta hai.</p>
<h3>QoS rule</h3>
<ul>
<li><b>Match:</b> network context, source aur destination prefixes, applications (har rule mein 256 tak), users aur groups, device profiles.</li>
<li><b>Action:</b> priority class aur transfer type, plus DSCP handling: <b>no action</b> (packet marking modify nahi hoti) ya 0 se 63 ki value ke saath <b>mark ya remark</b>, jo flow ke saare packets par lagu hoti hai.</li>
<li><b>Order:</b> default 1024; lower numbers jeette hain.</li>
<li><b>Kai rules match kar sakte hon to precedence:</b> pehle network context, phir source prefix, phir application, phir destination prefix.</li>
</ul>
<p>Naya QoS policy set template se bana sakte ho jisme do default rules hote hain, <b>Default Rule</b> aur <b>Enterprise Default Rule</b>, ya existing set clone karke ya blank shuru karke.</p>
<h3>DSCP trust: LAN jo marks pehle se lagata hai unka use</h3>
<p>Bahut si sites pehle se packets mark karti hain (voice ko EF). QoS policy mein DSCP configuration ION ko existing marks ko priority aur transfer type se map karne deti hai, policy set ke same order mein first-match lookup ke saath. Documentation standard mapping deti hai:</p>
<table class="cmp"><tr><th>DSCP</th><th>Priority</th><th>Transfer type</th></tr>
<tr><td>EF</td><td>Platinum</td><td>Audio</td></tr>
<tr><td>AF41, AF31</td><td>Gold</td><td>Video</td></tr>
<tr><td>CS6</td><td>Platinum</td><td>Transactional</td></tr>
<tr><td>AF21</td><td>Silver</td><td>Transactional</td></tr>
<tr><td>AF11</td><td>Bronze</td><td>Bulk</td></tr></table>
<p>Jo flows default policy rules aur DSCP value se match karte hain woh DSCP map ki di hui priority queue aur transfer type mein jaate hain. 16 tak DSCP values configure ho sakti hain. QoS design ka trust sawal yaad rakho: sirf un devices ke marks par bharosa karo jo aapke control mein hain. Guest networks khud ko EF mark nahi kar sakne chahiye.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="QoS classes">
<rect x="10" y="10" width="620" height="50" rx="8" fill="#bbf7d0"/><text x="30" y="40" class="svg-ink" font-size="13">Platinum</text><text x="140" y="40" class="svg-muted" font-size="12">voice (EF), payments (CS6)</text><text x="560" y="40" text-anchor="end" class="svg-ink" font-size="13">50%</text>
<rect x="10" y="68" width="440" height="50" rx="8" fill="#bae6fd"/><text x="30" y="98" class="svg-ink" font-size="13">Gold</text><text x="140" y="98" class="svg-muted" font-size="12">video (AF41, AF31)</text><text x="430" y="98" text-anchor="end" class="svg-ink" font-size="13">25%</text>
<rect x="10" y="126" width="330" height="50" rx="8" fill="#fde68a"/><text x="30" y="156" class="svg-ink" font-size="13">Silver</text><text x="140" y="156" class="svg-muted" font-size="12">ERP (AF21)</text><text x="320" y="156" text-anchor="end" class="svg-ink" font-size="13">15%</text>
<rect x="10" y="184" width="220" height="50" rx="8" fill="#fed7aa"/><text x="30" y="214" class="svg-ink" font-size="13">Bronze</text><text x="120" y="214" class="svg-muted" font-size="12">bulk (AF11)</text><text x="210" y="214" text-anchor="end" class="svg-ink" font-size="13">10%</text>
</svg><p class="cap">Documentation ke sample weights ke saath congested circuit ka illustration. Class ki unused capacity waste nahi hoti; weights tab matter karte hain jab contention ho.</p></div>
<h3>Capacity matter karti hai</h3>
<p>QoS sirf wahi baant sakti hai jo use pata hai. Stacked policies documentation DSCP configuration ke saath <b>circuit capacity</b> list karti hai: har circuit ki capacity real contracted rate (upload aur download) par set karo, interface speed par nahi. Agar 100 Mbps contract ko 1 Gbps likh diya, to ION samay par queue nahi karega aur provider andhadhund packets drop karega.</p>
<h3>Portal walk-through (not run in the simulator)</h3>
<p>DSCP mapping ka documented path hai Configuration, Prisma SD-WAN, Policies, QoS, QoS Stacks, Advanced, QoS Sets, phir DSCP Configuration: DSCP values (16 tak) daalo, priority aur traffic type assign karo, save karo. QoS policy sets aur rules usi QoS area mein bante hain, phir simple ya advanced QoS stack mein rakhe jaate hain aur sites se bind hote hain.</p>
<div class="eg"><p><b>Worked example: 100 Mbps MPLS circuit par STORE-007.</b> Busy hour par offered load: voice 6 Mbps, payments 2 Mbps, video 20 Mbps, ERP 50 Mbps, backup 80 Mbps. Total 158 Mbps 100 Mbps circuit par: congestion. Sample weights ke saath Platinum (50 Mbps share) voice aur payments (8 Mbps) ko poora uthata hai; Gold (25 Mbps share) video ko 20 Mbps par poora uthata hai; Silver (15 Mbps) aur Bronze (10 Mbps) ko unke shares guaranteed hain jabki spare capacity (Platinum aur Gold ke 28 use karne ke baad bachi 72 Mbps) busy lower classes mein baanti jaati hai. Voice aur payments kabhi wait nahi karte; backup slow hota hai, jo acceptable hai.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Har application ko Platinum mein daalna, jo priority ka matlab hata deta hai. Galat circuit capacity. Guest ya user devices ke DSCP par bharosa karna. Yeh bhoolna ki QoS har circuit par lagu hoti hai, isliye path policy se move hua flow apne naye circuit ka treatment paata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Chaar classes (Platinum, Gold, Silver, Bronze) guna chaar transfer types (real-time audio, real-time video, transactional, bulk). Rule precedence: network context, source prefix, application, destination prefix. DSCP marks 0 se 63; no action versus mark ya remark; DSCP map ki 16 tak values.</p></div>
<div class="scn"><h4>Backup jisne voice maar di</h4><p>Time-zone change ke baad nightly backup 08:00 baje shuru hua aur call centre ka 100 Mbps MPLS circuit bhar diya. Path policy perfect hone par bhi voice quality gir gayi. Review mein pata chala ki backup application ko broad rule ne Silver class aur transactional type mein map kar diya tha. Specific QoS rule ne backup ko Bronze bulk mein rakha aur voice Platinum audio mein rahi; backup chalte hue bhi calls clear rahin.</p><p><b>Seekh:</b> path kaafi nahi; queue tay karti hai kaun wait karega.</p></div>
<div class="iv"><p class="q">"Prisma SD-WAN mein QoS kaise kaam karti hai?"</p><p>Rules flows ko chaar priority classes (Platinum, Gold, Silver, Bronze) mein se ek aur chaar transfer types (real-time audio, real-time video, transactional, bulk) mein se ek assign karte hain. ION class weights se circuit capacity baantta hai aur class ke andar queues ko fixed order mein serve karta hai. Rules DSCP mark kar sakte hain, ya DSCP map se existing marks par trust kar sakte hain. Shaping ke kaam karne ke liye circuit capacity sahi honi chahiye.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chaar priority classes aur chaar transfer types tay karte hain ki circuit bharne par kaun wait karta hai.</li>
<li>Rule match: context, prefixes, applications, users, devices; precedence mein context sabse pehle.</li>
<li>DSCP: no action ya 0 se 63 mark; trusted marks ke liye DSCP map, 16 values tak.</li>
<li>Real circuit capacity set karo; Platinum kam use karo.</li>
<li>Documentation ke sample weights (50, 25, 15, 10) examples hain, fixed defaults nahi.</li>
</ul></div>
`}};export{e as default};