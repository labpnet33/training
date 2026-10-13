var e={id:`tools`,h:{en:`Queuing tools: FIFO, PQ, WFQ, CBWFQ, LLQ and how they evolved`,hi:`Queuing tools: FIFO, PQ, WFQ, CBWFQ, LLQ aur woh kaise evolve hue`},body:{en:`
<p>Chapter 1 showed that a congested link needs rules for who waits and who goes first. This chapter walks through the tools that were invented to express those rules, in the order the industry built them. You do not need to configure the old ones today, but you must recognise their names and, above all, understand why each new tool was needed. Exams and interviews love this history, and it explains why today's design looks the way it does.</p>

<h3>Think of a bank with different counters</h3>
<p>A small bank starts with one counter and one line: whoever comes first is served first. That is fair, but a customer who only wants to collect a cheque waits behind someone depositing a whole bag of coins. The bank adds an express counter. Then it adds a rule that lets senior citizens go first. Then it makes a rule that gives each type of customer a guaranteed number of minutes per hour. Each rule fixes a complaint caused by the previous design. Router queuing grew the same way.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Evolution of queuing tools">
<rect x="8" y="40" width="96" height="70" rx="8" fill="#e2e8f0"/><text x="56" y="70" text-anchor="middle" class="svg-ink" font-size="13">FIFO</text><text x="56" y="90" text-anchor="middle" class="svg-muted" font-size="11">one line</text>
<rect x="116" y="40" width="96" height="70" rx="8" fill="#fed7aa"/><text x="164" y="70" text-anchor="middle" class="svg-ink" font-size="13">PQ / CQ</text><text x="164" y="90" text-anchor="middle" class="svg-muted" font-size="11">strict or turns</text>
<rect x="224" y="40" width="96" height="70" rx="8" fill="#bbf7d0"/><text x="272" y="70" text-anchor="middle" class="svg-ink" font-size="13">WFQ</text><text x="272" y="90" text-anchor="middle" class="svg-muted" font-size="11">fair per flow</text>
<rect x="332" y="40" width="148" height="70" rx="8" fill="#bae6fd"/><text x="406" y="70" text-anchor="middle" class="svg-ink" font-size="13">CBWFQ</text><text x="406" y="90" text-anchor="middle" class="svg-muted" font-size="11">your classes, guaranteed</text>
<rect x="492" y="40" width="140" height="70" rx="8" fill="#ddd6fe"/><text x="562" y="70" text-anchor="middle" class="svg-ink" font-size="13">LLQ</text><text x="562" y="90" text-anchor="middle" class="svg-muted" font-size="11">CBWFQ + priority lane</text>
<path d="M104 75 H116 M212 75 H224 M320 75 H332 M480 75 H492" stroke="#64748b" stroke-width="2" fill="none"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">each tool fixes the weakness of the one before it</text>
</svg><p class="cap">Today you will configure the last two, CBWFQ and LLQ, with Modular QoS CLI (MQC).</p></div>

<h3>FIFO: first in, first out</h3>
<p><b>FIFO</b> is a single queue. It needs no configuration and is the default on fast interfaces. It is perfectly fair to <i>packets</i> but blind to <i>traffic types</i>: a voice packet and a backup packet look the same. FIFO also lets one greedy flow fill the whole queue and starve the others.</p>

<h3>PQ and CQ: the first attempts at control</h3>
<p><b>Priority Queuing (PQ)</b> has four queues: high, medium, normal and low. A router always serves a higher queue first. Voice in the high queue gets excellent service, but if the high queue is never empty the lower queues get <b>nothing at all</b>. This is called <b>starvation</b>. <b>Custom Queuing (CQ)</b> served queues in turn, taking a configured number of bytes from each, which avoided starvation but could not give voice low delay. Both are obsolete, but starvation is a word you will meet again in Chapter 4.</p>

<h3>WFQ: fairness without configuration</h3>
<p><b>Weighted Fair Queuing (WFQ)</b> automatically sorts packets into <b>flows</b> (same source, destination, protocol and ports) and gives every flow an equal share of the link, with a bonus for higher IP precedence. Small flows such as telnet or voice are served promptly; large flows are slowed. WFQ is clever, but you cannot say "the ERP must get 4 Mbps": it only knows flows, not business classes, and in older IOS it did not scale to many flows on fast links.</p>

<div class="eg"><p><b>Worked example.</b> A 10 Mbps link carries three flows: voice 0.4 Mbps, web 5 Mbps, and a file transfer trying to send 20 Mbps. Fair share would be 10 / 3 = 3.33 Mbps each. Voice needs only 0.4, so it gets everything it asks for. That frees 3.33 - 0.4 = 2.93 Mbps, which is shared by the other two: 9.6 Mbps remains, so web and FTP are each entitled to 4.8 Mbps. The web flow, offering 5, loses a little; FTP is cut to 4.8. This "give small flows everything, split the rest equally" rule is called <b>max-min fairness</b>. It is fair, but it treats an unimportant flow and the finance ERP the same.</p></div>

<h3>CBWFQ: your classes, your guarantees</h3>
<p><b>Class-Based Weighted Fair Queuing (CBWFQ)</b> lets you define the classes yourself with the class-maps from the previous module, and attach a <b>guaranteed minimum bandwidth</b> to each, using a policy-map. Everything not matched goes to <b>class-default</b>. The router builds one queue per class and serves the queues in proportion to their configured bandwidth. CBWFQ answers the business question: "The ERP gets at least 40 percent of the WAN during congestion." You will configure it in Chapter 3.</p>

<h3>LLQ: CBWFQ plus a priority lane</h3>
<p>CBWFQ is fair, but it has no way to guarantee <b>low delay</b>, because queues are served in turns and a voice packet may wait for other queues to take theirs. <b>Low Latency Queuing (LLQ)</b> adds one <b>strict-priority queue</b> to CBWFQ using the <code>priority</code> command. Packets in that queue are sent first, which gives voice minimal delay and jitter. To avoid PQ's starvation problem, the priority queue is limited by an <b>implicit policer</b>. LLQ is the standard design for voice and interactive video, and Chapter 4 is devoted to it.</p>

<table class="cmp"><tr><th>Tool</th><th>Classes</th><th>Guarantee</th><th>Low delay for voice</th><th>Status today</th></tr>
<tr><td>FIFO</td><td>None</td><td>None</td><td>No</td><td>Default on uncongested links</td></tr>
<tr><td>PQ</td><td>4 fixed</td><td>None, starves low queues</td><td>Yes</td><td>Obsolete</td></tr>
<tr><td>CQ</td><td>16</td><td>Byte count share</td><td>No</td><td>Obsolete</td></tr>
<tr><td>WFQ</td><td>Automatic flows</td><td>Equal per flow</td><td>Partial</td><td>Inside class-default</td></tr>
<tr><td>CBWFQ</td><td>You define</td><td>Minimum bandwidth</td><td>No</td><td>Standard</td></tr>
<tr><td>LLQ</td><td>You define + 1 priority</td><td>Minimum + capped priority</td><td>Yes</td><td>Standard for voice</td></tr>
</table>

<h3>Two practical details</h3>
<p><b>Hardware queue (tx-ring).</b> Between the software queues you configure and the wire there is a small hardware queue called the <b>transmit ring</b>. The software queuing engine only takes over when this ring is full. On a lightly loaded link everything flows straight through, which again shows that queuing policies matter only under congestion.</p>
<p><b>Where WFQ lives today.</b> You will still see <code>fair-queue</code> inside <code>class-default</code>. It means that the unclassified traffic is split fairly per flow instead of in one FIFO line, a cheap improvement that prevents one big download from squeezing every small flow in the default class.</p>

<pre class="code"><span class="c">! The smallest useful CBWFQ policy: one class, plus fair sharing of the rest</span>
policy-map WAN-OUT
 class ERP-Q
  bandwidth percent 40
 class class-default
  fair-queue</pre>

<div class="warn"><p><b>Common mistakes.</b> (1) Thinking WFQ lets you set bandwidth per application: it cannot. (2) Calling LLQ a separate feature from CBWFQ: LLQ is CBWFQ with one extra command, <code>priority</code>. (3) Forgetting that class-default always exists, even if you never write it.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which queuing method provides strict priority plus guaranteed bandwidth for other classes?" LLQ. "Which one starves lower queues?" PQ, and an unlimited priority queue in general. "Which is flow-based and needs no class-maps?" WFQ.</p></div>

<div class="scn"><h4>The old serial link and the new MPLS circuit</h4><p>A logistics company migrated a branch from a 2 Mbps serial line to a 20 Mbps provider circuit. On the old router, the engineer had never configured queuing, yet telnet still felt snappy: the serial interface used WFQ by default, so small interactive flows were served first automatically. After the migration to a fast Ethernet handoff, the same router used plain FIFO, and interactive sessions slowed down during file copies. The engineer learned that "it used to work without QoS" had really meant "WFQ was on by default". The permanent fix was an MQC policy with a priority class for voice and CBWFQ classes for business data.</p><p><b>Lesson:</b> know which queuing method your interface really uses. Defaults depend on interface speed and platform.</p></div>

<div class="iv"><p class="q">"What is the difference between CBWFQ and LLQ?"</p><p>CBWFQ gives each class a guaranteed minimum share and serves queues in proportion to their bandwidth, but it cannot promise low delay. LLQ is CBWFQ plus one strict-priority queue, configured with the priority command, which is served first and gives voice low delay and jitter. Because a strict queue could starve the others, LLQ polices it to its configured rate when the link is congested.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FIFO treats everything alike; PQ gives strict order but starves; CQ shares by turns; WFQ shares fairly per flow.</li>
<li>CBWFQ adds user-defined classes with guaranteed minimum bandwidth through MQC.</li>
<li>LLQ is CBWFQ plus a strict-priority queue, limited by an implicit policer.</li>
<li>Software queuing only works when the hardware transmit ring is full, that is during congestion.</li>
<li>class-default always exists and often uses fair-queue.</li>
</ul></div>
`,hi:`
<p>Chapter 1 mein dikha ki congested link ko niyam chahiye ki kaun ruke aur kaun pehle jaaye. Yeh chapter un tools ko dikhata hai jo yeh niyam likhne ke liye banaye gaye, usi order mein jis order mein industry ne unhe banaya. Purane tools aaj configure karne ki zaroorat nahi, lekin unke naam pehchanne chahiye aur sabse zaroori yeh samajhna ki har naye tool ki zaroorat kyun padi. Exams aur interviews ko yeh history bahut pasand hai, aur yeh batati hai ki aaj ka design aisa kyun dikhta hai.</p>

<h3>Alag counters wale bank ki tarah socho</h3>
<p>Chhota bank ek counter aur ek line se shuru karta hai: jo pehle aaya woh pehle serve hota hai. Yeh fair hai, lekin jo customer sirf cheque lene aaya hai woh us insaan ke peeche rukta hai jo sikkon ka poora thaila jama kar raha hai. Bank express counter jodta hai. Phir senior citizens ko pehle jaane ka niyam. Phir har tarah ke customer ko har ghante kuch minute guaranteed dene ka niyam. Har niyam pichhle design ki shikayat theek karta hai. Router queuing bhi isi tarah badhi.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Evolution of queuing tools">
<rect x="8" y="40" width="96" height="70" rx="8" fill="#e2e8f0"/><text x="56" y="70" text-anchor="middle" class="svg-ink" font-size="13">FIFO</text><text x="56" y="90" text-anchor="middle" class="svg-muted" font-size="11">ek line</text>
<rect x="116" y="40" width="96" height="70" rx="8" fill="#fed7aa"/><text x="164" y="70" text-anchor="middle" class="svg-ink" font-size="13">PQ / CQ</text><text x="164" y="90" text-anchor="middle" class="svg-muted" font-size="11">strict ya baari baari</text>
<rect x="224" y="40" width="96" height="70" rx="8" fill="#bbf7d0"/><text x="272" y="70" text-anchor="middle" class="svg-ink" font-size="13">WFQ</text><text x="272" y="90" text-anchor="middle" class="svg-muted" font-size="11">flow ke hisaab se fair</text>
<rect x="332" y="40" width="148" height="70" rx="8" fill="#bae6fd"/><text x="406" y="70" text-anchor="middle" class="svg-ink" font-size="13">CBWFQ</text><text x="406" y="90" text-anchor="middle" class="svg-muted" font-size="11">aapki classes, guaranteed</text>
<rect x="492" y="40" width="140" height="70" rx="8" fill="#ddd6fe"/><text x="562" y="70" text-anchor="middle" class="svg-ink" font-size="13">LLQ</text><text x="562" y="90" text-anchor="middle" class="svg-muted" font-size="11">CBWFQ + priority lane</text>
<path d="M104 75 H116 M212 75 H224 M320 75 H332 M480 75 H492" stroke="#64748b" stroke-width="2" fill="none"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">har tool pichhle tool ki kamzori theek karta hai</text>
</svg><p class="cap">Aaj aap aakhri do, CBWFQ aur LLQ, Modular QoS CLI (MQC) se configure karoge.</p></div>

<h3>FIFO: first in, first out</h3>
<p><b>FIFO</b> ek akeli queue hai. Isme configuration nahi lagta aur fast interfaces par yahi default hai. Yeh <i>packets</i> ke saath bilkul fair hai lekin <i>traffic types</i> ke liye andha: voice packet aur backup packet ek jaise dikhte hain. FIFO ek lalchi flow ko poori queue bharne aur baaki ko bhookha rakhne bhi deta hai.</p>

<h3>PQ aur CQ: control ki pehli koshishen</h3>
<p><b>Priority Queuing (PQ)</b> mein chaar queues hoti hain: high, medium, normal aur low. Router hamesha upar wali queue pehle serve karta hai. High queue mein voice ko behtareen service milti hai, lekin agar high queue kabhi khali na ho to neeche wali queues ko <b>kuch bhi nahi</b> milta. Ise <b>starvation</b> kehte hain. <b>Custom Queuing (CQ)</b> queues ko baari baari serve karta tha, har ek se configured bytes leke, jisse starvation to bachi lekin voice ko low delay nahi mil sakta tha. Dono obsolete hain, lekin starvation lafz Chapter 4 mein phir milega.</p>

<h3>WFQ: bina configuration ke fairness</h3>
<p><b>Weighted Fair Queuing (WFQ)</b> packets ko apne aap <b>flows</b> mein baant deta hai (same source, destination, protocol aur ports) aur har flow ko link ka barabar hissa deta hai, zyada IP precedence walon ko thoda bonus ke saath. Chhote flows jaise telnet ya voice jaldi serve hote hain; bade flows dheeme kiye jaate hain. WFQ smart hai, lekin aap yeh nahi keh sakte ki "ERP ko 4 Mbps milna chahiye": yeh sirf flows jaanta hai, business classes nahi, aur purane IOS mein fast links par bahut flows ke saath scale nahi karta tha.</p>

<div class="eg"><p><b>Worked example.</b> 10 Mbps link par teen flows hain: voice 0.4 Mbps, web 5 Mbps, aur ek file transfer jo 20 Mbps bhejna chahta hai. Fair share 10 / 3 = 3.33 Mbps har ek ka hota. Voice ko sirf 0.4 chahiye, isliye use woh sab mil jaata hai jo woh maangti hai. Isse 3.33 - 0.4 = 2.93 Mbps khuli, jo baaki do mein bantti hai: 9.6 Mbps bachte hain, isliye web aur FTP har ek 4.8 Mbps ke hakdaar hain. Web flow, jo 5 offer kar raha hai, thoda loss karta hai; FTP 4.8 par kat jaata hai. Yeh "chhote flows ko sab do, baaki barabar baanto" niyam <b>max-min fairness</b> kehlata hai. Yeh fair hai, lekin kam zaroori flow aur finance ERP ko ek jaisa maanta hai.</p></div>

<h3>CBWFQ: aapki classes, aapki guarantees</h3>
<p><b>Class-Based Weighted Fair Queuing (CBWFQ)</b> aapko pichhle module ke class-maps se khud classes banane deta hai, aur policy-map ke zariye har class ko <b>guaranteed minimum bandwidth</b> dene deta hai. Jo kuch match nahi hota woh <b>class-default</b> mein jaata hai. Router har class ke liye ek queue banata hai aur queues ko unki configured bandwidth ke anupaat mein serve karta hai. CBWFQ business ke sawal ka jawab deta hai: "Congestion ke dauran ERP ko WAN ka kam se kam 40 percent milega." Ise aap Chapter 3 mein configure karoge.</p>

<h3>LLQ: CBWFQ aur ek priority lane</h3>
<p>CBWFQ fair hai, lekin <b>low delay</b> ki guarantee nahi de sakta, kyunki queues baari baari serve hoti hain aur voice packet ko doosri queues ki baari ka intezaar karna pad sakta hai. <b>Low Latency Queuing (LLQ)</b> CBWFQ mein <code>priority</code> command se ek <b>strict-priority queue</b> jodti hai. Us queue ke packets sabse pehle bheje jaate hain, jisse voice ko minimal delay aur jitter milta hai. PQ ki starvation wali dikkat se bachne ke liye priority queue ko ek <b>implicit policer</b> se limit kiya jaata hai. LLQ voice aur interactive video ka standard design hai, aur Chapter 4 poora isi par hai.</p>

<table class="cmp"><tr><th>Tool</th><th>Classes</th><th>Guarantee</th><th>Voice ke liye low delay</th><th>Aaj ki sthiti</th></tr>
<tr><td>FIFO</td><td>Koi nahi</td><td>Koi nahi</td><td>Nahi</td><td>Uncongested links par default</td></tr>
<tr><td>PQ</td><td>4 fixed</td><td>Koi nahi, low queues starve</td><td>Haan</td><td>Obsolete</td></tr>
<tr><td>CQ</td><td>16</td><td>Byte count share</td><td>Nahi</td><td>Obsolete</td></tr>
<tr><td>WFQ</td><td>Automatic flows</td><td>Har flow barabar</td><td>Aanshik</td><td>class-default ke andar</td></tr>
<tr><td>CBWFQ</td><td>Aap define karte ho</td><td>Minimum bandwidth</td><td>Nahi</td><td>Standard</td></tr>
<tr><td>LLQ</td><td>Aap define + 1 priority</td><td>Minimum + capped priority</td><td>Haan</td><td>Voice ke liye standard</td></tr>
</table>

<h3>Do practical details</h3>
<p><b>Hardware queue (tx-ring).</b> Aapki configure ki hui software queues aur wire ke beech ek chhoti hardware queue hoti hai jise <b>transmit ring</b> kehte hain. Software queuing engine tabhi kaam sambhalta hai jab yeh ring bhar jaaye. Halke load wale link par sab seedha nikal jaata hai, jo phir dikhata hai ki queuing policies sirf congestion mein matter karti hain.</p>
<p><b>WFQ aaj kahan rehta hai.</b> Aap <code>class-default</code> ke andar ab bhi <code>fair-queue</code> dekhoge. Iska matlab hai ki unclassified traffic ek FIFO line ki jagah flow ke hisaab se fairly baanta jaata hai, ek sasta sudhaar jo ek bade download ko default class ke saare chhote flows ko dabane se rokta hai.</p>

<pre class="code"><span class="c">! Sabse chhoti kaam ki CBWFQ policy: ek class, aur baaki ka fair sharing</span>
policy-map WAN-OUT
 class ERP-Q
  bandwidth percent 40
 class class-default
  fair-queue</pre>

<div class="warn"><p><b>Common mistakes.</b> (1) Yeh sochna ki WFQ application ke hisaab se bandwidth set karne deta hai: nahi deta. (2) LLQ ko CBWFQ se alag feature kehna: LLQ CBWFQ hai ek extra command, <code>priority</code>, ke saath. (3) Bhool jaana ki class-default hamesha maujood rehti hai, chahe aap use kabhi na likho.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaun si queuing method strict priority aur baaki classes ke liye guaranteed bandwidth deti hai?" LLQ. "Kaun si lower queues ko starve karti hai?" PQ, aur aam taur par bina limit ki priority queue. "Kaun si flow-based hai aur class-maps nahi maangti?" WFQ.</p></div>

<div class="scn"><h4>Purani serial link aur nayi MPLS circuit</h4><p>Ek logistics company ne branch ko 2 Mbps serial line se 20 Mbps provider circuit par migrate kiya. Purane router par engineer ne kabhi queuing configure nahi ki thi, phir bhi telnet tez lagta tha: serial interface default mein WFQ use karta tha, isliye chhote interactive flows apne aap pehle serve hote the. Fast Ethernet handoff par migrate karne ke baad wahi router plain FIFO use karne laga, aur file copy ke dauran interactive sessions dheeme ho gaye. Engineer ne seekha ki "bina QoS ke chalta tha" ka asli matlab "WFQ default mein on tha" tha. Permanent fix MQC policy thi jisme voice ke liye priority class aur business data ke liye CBWFQ classes thi.</p><p><b>Lesson:</b> jaano ki aapka interface asal mein kaun si queuing method use karta hai. Defaults interface speed aur platform par nirbhar karte hain.</p></div>

<div class="iv"><p class="q">"CBWFQ aur LLQ mein kya fark hai?"</p><p>CBWFQ har class ko guaranteed minimum hissa deta hai aur queues ko unki bandwidth ke anupaat mein serve karta hai, lekin low delay ka vaada nahi kar sakta. LLQ CBWFQ plus ek strict-priority queue hai, jo priority command se configure hoti hai, pehle serve hoti hai aur voice ko low delay aur jitter deti hai. Kyunki strict queue baaki ko starve kar sakti hai, link congested hone par LLQ use configured rate par police karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FIFO sab ko ek jaisa maanta hai; PQ strict order deta hai lekin starve karta hai; CQ baari se baantta hai; WFQ flow ke hisaab se fairly baantta hai.</li>
<li>CBWFQ MQC ke zariye user-defined classes aur guaranteed minimum bandwidth jodta hai.</li>
<li>LLQ CBWFQ plus strict-priority queue hai, jo implicit policer se limited hoti hai.</li>
<li>Software queuing tabhi kaam karti hai jab hardware transmit ring bhari ho, yaani congestion mein.</li>
<li>class-default hamesha maujood hoti hai aur aksar fair-queue use karti hai.</li>
</ul></div>
`}};export{e as default};