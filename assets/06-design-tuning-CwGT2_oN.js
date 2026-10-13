var e={id:`design`,h:{en:`Design and tuning: class count, bandwidth plan, queue-limit and the 75/25 guideline`,hi:`Design aur tuning: class count, bandwidth plan, queue-limit aur 75/25 guideline`},body:{en:`
<p>You now know the three tools. This chapter is about using them wisely: how many classes to create, how to divide a circuit, how long each queue should be, and what the well-known <b>75/25</b> and <b>one-third</b> guidelines really mean. A policy that is technically correct but badly sized can still hurt users, so design is half of the job.</p>

<h3>Think of planning a school timetable</h3>
<p>A school has a fixed number of periods each week. If you create twenty subjects, each gets a sliver of time and nothing works well. If you keep a few core subjects, give each a sensible share and leave some free periods for surprises, the timetable survives a sick teacher. A QoS policy is a timetable for the link: few classes, clear shares, and some spare room.</p>

<h3>How many classes?</h3>
<p>Every class costs a queue, configuration to maintain, and thinking when something breaks. Start with <b>three to five</b> classes and add more only when a real application needs different treatment:</p>
<ul>
<li><b>Voice</b> (EF): priority queue.</li>
<li><b>Signalling / network control</b> (CS3, CS6): small guaranteed share, so calls can be set up and routing stays alive.</li>
<li><b>Critical business data</b> (AF21 and similar): guaranteed share, maybe WRED.</li>
<li><b>Bulk / scavenger</b> (AF11, CS1): small guarantee, first to give way.</li>
<li><b>class-default</b>: everything else, with fair-queue.</li>
</ul>
<p>Large enterprises use eight or more classes; the voice and video module designs such a model end to end. For one WAN edge, five classes are usually enough. Platforms also cap the number of classes per policy (64 on classic IOS), but you will rarely come close.</p>

<h3>The bandwidth plan and the 75/25 guideline</h3>
<p>Add up all the guarantees. A long-standing guideline says that the sum of <b>priority plus bandwidth</b> guarantees should stay at or below <b>75 percent</b> of the link, leaving at least <b>25 percent</b> for class-default, routing protocols, management traffic and traffic you forgot. Classic IOS enforces this with the interface command <code>max-reserved-bandwidth</code> (default 75): a policy whose guarantees exceed it is refused. Newer IOS XE platforms differ in how strictly they check, so treat 75/25 as a design rule even where the router would accept more. Our simulator checks only that the guarantees fit into 100 percent of the line rate.</p>
<p>A second guideline limits the priority queue: keep all priority traffic below about <b>one third (33 percent)</b> of the link. A larger share leaves too little for everyone else when the priority class is fully used, and in practice a link that needs more than a third for voice should be upgraded.</p>

<table class="cmp"><tr><th>Class</th><th>Marking</th><th>Command</th><th>kbps on 10 Mbps</th></tr>
<tr><td>VOICE-Q</td><td>EF</td><td>priority percent 10</td><td>1000</td></tr>
<tr><td>SIGNAL-Q</td><td>CS3</td><td>bandwidth percent 5</td><td>500</td></tr>
<tr><td>ERP-Q</td><td>AF21</td><td>bandwidth percent 35</td><td>3500</td></tr>
<tr><td>BKP-Q</td><td>AF11</td><td>bandwidth percent 20</td><td>2000</td></tr>
<tr><td>class-default</td><td>everything else</td><td>fair-queue</td><td>30 percent left</td></tr>
</table>
<p>The guarantees add up to 10 + 5 + 35 + 20 = 70 percent. That fits the 75 percent rule, with 30 percent left for class-default. When the circuit is upgraded to 20 Mbps, percentages scale automatically, which is why percent is usually better than fixed kbps for a policy reused across sites. Use kbps only when you must match an exact need, such as the voice rate for a known number of calls.</p>

<h3>percent against remaining percent</h3>
<p><code>bandwidth percent 35</code> is taken from the whole interface. <code>bandwidth remaining percent 60</code> is taken from what is left <b>after the priority classes</b> have been served. It lets you say "ERP gets 60 percent of what voice does not use". Both forms are legal in a policy, but remember that classes using <code>percent</code> and <code>remaining percent</code> follow different rules: on real routers you cannot freely mix kbps, percent and remaining percent across classes in one policy, so pick one style and stay with it.</p>

<h3>queue-limit: how long is each queue?</h3>
<p>Every class queue has a maximum length. When it is full, new packets are tail-dropped (or handled by WRED). The length is set with <code>queue-limit</code>, in packets, and on IOS XE also in bytes or milliseconds. The trade-off is simple:</p>
<ul>
<li><b>A long queue</b> drops fewer packets but adds more delay. A very long queue on a slow link causes <b>bufferbloat</b>: the link looks lossless, yet everything is slow. The WAN module treats this in detail.</li>
<li><b>A short queue</b> keeps delay low but drops bursts earlier.</li>
</ul>
<p>The worst-case wait in a queue is its length times the packet size divided by the rate that class receives.</p>

<div class="eg"><p><b>Worked example.</b> BKP-Q has 3000 kbps and a queue limit of 64 packets of 1500 bytes. The last packet waits 64 x 1500 x 8 / 3,000,000 = 0.256 s, <b>256 ms</b>. For a backup that is fine, because TCP copes with delay. For the ERP at 3500 kbps with 64 packets the wait is 64 x 1500 x 8 / 3,500,000 = 219 ms, too slow for an interactive application, so you set <code>queue-limit 32 packets</code> and halve the maximum wait to about 110 ms. For voice, packets are 200 bytes: a 20 packet queue at 1000 kbps holds 20 x 200 x 8 / 1,000,000 = 32 ms. Voice should have a short queue, because a late voice packet is as useless as a lost one.</p></div>

<h3>A complete small-branch policy</h3>
<pre class="code">class-map match-any VOICE-Q
 match dscp ef
class-map match-any SIGNAL-Q
 match dscp cs3
class-map match-any ERP-Q
 match dscp af21
class-map match-any BKP-Q
 match dscp af11
policy-map WAN-OUT
 class VOICE-Q
  priority percent 10
 class SIGNAL-Q
  bandwidth percent 5
  queue-limit 32 packets
 class ERP-Q
  bandwidth percent 35
  queue-limit 32 packets
 class BKP-Q
  bandwidth percent 20
 class class-default
  fair-queue
interface GigabitEthernet0/0
 service-policy output WAN-OUT</pre>
<p>The simulator accepts this policy and prints the converted values, for example <code>Priority: 10% (1000 kbps)</code> and <code>bandwidth 35% (3500 kbps)</code>:</p>
<pre class="out">    Class-map: VOICE-Q (match-any)
      <span class="hl">Priority: 10% (1000 kbps), burst bytes 25000, b/w exceed drops: 0</span>
    Class-map: ERP-Q (match-any)
      queue limit 32 packets
      <span class="hl">bandwidth 35% (3500 kbps)</span></pre>
<div class="note"><p><b>In the simulator.</b> <code>queue-limit</code> is stored and printed, but it does not change which packets are dropped and the printed queue depth stays at 0; the model shares bandwidth per second rather than simulating each packet. Real routers will show a non-zero queue depth under load and drop at the limit.</p></div>

<h3>Where the policy must sit</h3>
<p>A policy on Gi0/0 only works if Gi0/0 is the <b>bottleneck</b>. In our lab, the interface runs at 10 Mbps, so packets wait at the router and the policy decides. In real life the router often hands traffic to a modem or carrier device over a 1 Gbps port while the circuit is only 10 Mbps. The router then never sees congestion and the queue forms in the provider device, where you have no control. The cure, shaping to the circuit rate and nesting the queuing policy under it, is the subject of the next module.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Reserving 100 percent. (2) Giving every application its own class. (3) Using long default queues on slow links. (4) Copying a policy from a 100 Mbps site to a 2 Mbps site without checking that the percentages still fit the voice load. (5) Forgetting that the guarantee of class-default is whatever remains.</p></div>

<div class="exam"><p><b>Exam trap.</b> "What does max-reserved-bandwidth control?" The portion of the interface bandwidth, 75 percent by default, that the sum of class guarantees may use. "What is the priority guideline?" About one third of the link at most.</p></div>

<div class="scn"><h4>Fifteen classes, one confused engineer</h4><p>A new network engineer at Zenith Logistics copied a fifteen-class enterprise policy onto a 4 Mbps branch circuit. Each class received 1 to 2 percent of the link, which on a small circuit is a handful of kbps. The ERP class had only 40 kbps guaranteed and was slower than before. The senior engineer rebuilt the policy with five classes, a 10 percent priority class for eight phones, 35 percent for ERP and 20 percent for bulk, leaving 30 percent for the default class. Complaints stopped the same day.</p><p><b>Lesson:</b> more classes do not mean better QoS. Fit the design to the circuit and to real applications.</p></div>

<div class="iv"><p class="q">"How would you plan the bandwidth for a 10 Mbps WAN with voice, ERP and backup?"</p><p>I would classify into voice, signalling, critical data, bulk and default. Voice gets a priority class sized from calls times per-call bandwidth, about 10 percent and never above a third of the link. Critical data and bulk get percent-based guarantees. The sum of guarantees stays at or under about 75 percent so class-default and control traffic have room. I would tune queue-limit to the delay each class can tolerate and confirm the result with a load test.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Start with three to five classes; more classes dilute the circuit.</li>
<li>Keep priority plus bandwidth guarantees at or below about 75 percent, priority at or below about one third.</li>
<li>Percent scales with the circuit; remaining percent is taken after priority traffic.</li>
<li>queue-limit trades drops against delay; the worst wait is length times packet size divided by the class rate.</li>
<li>A queuing policy only works where the interface is the real bottleneck; otherwise shape first.</li>
</ul></div>
`,hi:`
<p>Ab aap teen tools jaante ho. Yeh chapter unhe samajhdari se use karne ke baare mein hai: kitni classes banayein, circuit ko kaise baantein, har queue kitni lambi ho, aur mashhoor <b>75/25</b> aur <b>one-third</b> guidelines ka asli matlab kya hai. Technically sahi lekin kharab size ki policy bhi users ko nuksaan pahuncha sakti hai, isliye design aadha kaam hai.</p>

<h3>School timetable banane ki tarah socho</h3>
<p>School mein har hafte ke periods fixed hote hain. Agar aap bees subjects banao, har ek ko thoda sa waqt milta hai aur kuch achhe se nahi chalta. Agar kuch core subjects rakho, har ek ko samajhdaar hissa do aur surprises ke liye kuch free periods chhodo, to ek teacher bimar ho tab bhi timetable chal jaata hai. QoS policy link ka timetable hai: kam classes, saaf hisse, aur thodi spare jagah.</p>

<h3>Kitni classes?</h3>
<p>Har class ek queue, maintain karne wala configuration, aur kuch tootne par sochne ka kharcha hai. <b>Teen se paanch</b> classes se shuru karo aur aur tabhi jodo jab kisi asli application ko alag treatment chahiye:</p>
<ul>
<li><b>Voice</b> (EF): priority queue.</li>
<li><b>Signalling / network control</b> (CS3, CS6): chhota guaranteed hissa, taaki calls set ho sakein aur routing zinda rahe.</li>
<li><b>Critical business data</b> (AF21 jaisa): guaranteed hissa, shayad WRED.</li>
<li><b>Bulk / scavenger</b> (AF11, CS1): chhoti guarantee, sabse pehle raasta dene wala.</li>
<li><b>class-default</b>: baaki sab, fair-queue ke saath.</li>
</ul>
<p>Bade enterprises aath ya zyada classes use karte hain; voice aur video module aisa model end to end design karta hai. Ek WAN edge ke liye aam taur par paanch classes kaafi hain. Platforms ek policy mein classes ki sankhya bhi cap karte hain (classic IOS par 64), lekin aap shaayad hi kabhi uske paas pahunchoge.</p>

<h3>Bandwidth plan aur 75/25 guideline</h3>
<p>Saari guarantees jodo. Ek purani guideline kehti hai ki <b>priority plus bandwidth</b> guarantees ka sum link ke <b>75 percent</b> par ya usse neeche rahe, taaki kam se kam <b>25 percent</b> class-default, routing protocols, management traffic aur us traffic ke liye bache jo aap bhool gaye. Classic IOS ise interface command <code>max-reserved-bandwidth</code> (default 75) se enforce karta hai: jis policy ki guarantees isse zyada hon use mana kar diya jaata hai. Naye IOS XE platforms kitni sakhti se check karte hain isme farak hai, isliye 75/25 ko design niyam maano chahe router zyada accept kar le. Hamara simulator sirf check karta hai ki guarantees line rate ke 100 percent mein fit hoti hain.</p>
<p>Doosri guideline priority queue ko limit karti hai: saara priority traffic link ke lagbhag <b>ek tihayi (33 percent)</b> se neeche rakho. Isse bada hissa tab baaki ke liye bahut kam chhodta hai jab priority class poori use ho, aur practice mein jis link ko voice ke liye ek tihayi se zyada chahiye use upgrade karna chahiye.</p>

<table class="cmp"><tr><th>Class</th><th>Marking</th><th>Command</th><th>10 Mbps par kbps</th></tr>
<tr><td>VOICE-Q</td><td>EF</td><td>priority percent 10</td><td>1000</td></tr>
<tr><td>SIGNAL-Q</td><td>CS3</td><td>bandwidth percent 5</td><td>500</td></tr>
<tr><td>ERP-Q</td><td>AF21</td><td>bandwidth percent 35</td><td>3500</td></tr>
<tr><td>BKP-Q</td><td>AF11</td><td>bandwidth percent 20</td><td>2000</td></tr>
<tr><td>class-default</td><td>baaki sab</td><td>fair-queue</td><td>30 percent bacha</td></tr>
</table>
<p>Guarantees ka jod 10 + 5 + 35 + 20 = 70 percent hai. Yeh 75 percent niyam mein fit hota hai, class-default ke liye 30 percent bachta hai. Jab circuit 20 Mbps ho jaata hai, percentages apne aap scale ho jaate hain, isliye kai sites par reuse hone wali policy ke liye aam taur par fixed kbps se percent behtar hai. kbps tabhi use karo jab exact zaroorat match karni ho, jaise known calls ki sankhya ke liye voice rate.</p>

<h3>percent aur remaining percent</h3>
<p><code>bandwidth percent 35</code> poore interface se liya jaata hai. <code>bandwidth remaining percent 60</code> us se liya jaata hai jo <b>priority classes ke serve hone ke baad</b> bacha. Isse aap keh sakte ho "voice jo use nahi karti uska 60 percent ERP ko". Dono roop policy mein legal hain, lekin yaad rakho ki <code>percent</code> aur <code>remaining percent</code> use karne wali classes alag niyam follow karti hain: asli routers par ek policy mein classes ke beech kbps, percent aur remaining percent ko freely mix nahi kar sakte, isliye ek style chuno aur usi par raho.</p>

<h3>queue-limit: har queue kitni lambi?</h3>
<p>Har class queue ki ek maximum length hoti hai. Bhar jaaye to naye packets tail-drop hote hain (ya WRED sambhalta hai). Length <code>queue-limit</code> se set hoti hai, packets mein, aur IOS XE par bytes ya milliseconds mein bhi. Trade-off seedha hai:</p>
<ul>
<li><b>Lambi queue</b> kam packets drop karti hai lekin zyada delay jodti hai. Slow link par bahut lambi queue <b>bufferbloat</b> paida karti hai: link lossless dikhta hai, phir bhi sab dheema hai. WAN module ise detail mein dekhta hai.</li>
<li><b>Chhoti queue</b> delay kam rakhti hai lekin bursts ko jaldi drop karti hai.</li>
</ul>
<p>Queue mein worst-case intezaar = uski length guna packet size divided by us class ko milne wala rate.</p>

<div class="eg"><p><b>Worked example.</b> BKP-Q ke paas 3000 kbps hai aur queue limit 1500 byte ke 64 packets. Aakhri packet 64 x 1500 x 8 / 3,000,000 = 0.256 s, yaani <b>256 ms</b> intezaar karta hai. Backup ke liye yeh theek hai, kyunki TCP delay sambhal leta hai. 3500 kbps par ERP ke 64 packets ke saath intezaar 64 x 1500 x 8 / 3,500,000 = 219 ms hai, jo interactive application ke liye bahut dheema hai, isliye aap <code>queue-limit 32 packets</code> set karte ho aur maximum intezaar lagbhag 110 ms tak aadha kar dete ho. Voice ke liye packets 200 byte ke hote hain: 1000 kbps par 20 packet ki queue 20 x 200 x 8 / 1,000,000 = 32 ms rakhti hai. Voice ki queue chhoti honi chahiye, kyunki late voice packet kho gaye packet jitna hi bekaar hai.</p></div>

<h3>Ek poori chhoti branch policy</h3>
<pre class="code">class-map match-any VOICE-Q
 match dscp ef
class-map match-any SIGNAL-Q
 match dscp cs3
class-map match-any ERP-Q
 match dscp af21
class-map match-any BKP-Q
 match dscp af11
policy-map WAN-OUT
 class VOICE-Q
  priority percent 10
 class SIGNAL-Q
  bandwidth percent 5
  queue-limit 32 packets
 class ERP-Q
  bandwidth percent 35
  queue-limit 32 packets
 class BKP-Q
  bandwidth percent 20
 class class-default
  fair-queue
interface GigabitEthernet0/0
 service-policy output WAN-OUT</pre>
<p>Simulator is policy ko accept karta hai aur converted values chhaapta hai, jaise <code>Priority: 10% (1000 kbps)</code> aur <code>bandwidth 35% (3500 kbps)</code>:</p>
<pre class="out">    Class-map: VOICE-Q (match-any)
      <span class="hl">Priority: 10% (1000 kbps), burst bytes 25000, b/w exceed drops: 0</span>
    Class-map: ERP-Q (match-any)
      queue limit 32 packets
      <span class="hl">bandwidth 35% (3500 kbps)</span></pre>
<div class="note"><p><b>Simulator mein.</b> <code>queue-limit</code> store hota hai aur chhapta hai, lekin yeh nahi badalta ki kaun se packets drop hon aur chhapi hui queue depth 0 rehti hai; model har packet simulate karne ki jagah har second bandwidth baantta hai. Asli routers load mein non-zero queue depth dikhayenge aur limit par drop karenge.</p></div>

<h3>Policy kahan baithni chahiye</h3>
<p>Gi0/0 par policy tabhi kaam karti hai jab Gi0/0 <b>bottleneck</b> ho. Hamari lab mein interface 10 Mbps par chalta hai, isliye packets router par intezaar karte hain aur policy faisla karti hai. Asli zindagi mein router aksar traffic ko 1 Gbps port se modem ya carrier device ko deta hai jabki circuit sirf 10 Mbps ka hota hai. Tab router ko congestion kabhi dikhta hi nahi aur queue provider ke device mein banti hai, jahan aapka koi control nahi. Ilaaj, circuit rate par shaping aur uske neeche queuing policy nest karna, agle module ka vishay hai.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) 100 percent reserve karna. (2) Har application ko apni class dena. (3) Slow links par lambi default queues. (4) 100 Mbps site ki policy ko 2 Mbps site par copy karna bina check kiye ki percentages abhi bhi voice load mein fit hote hain. (5) Bhool jaana ki class-default ki guarantee woh hai jo bachti hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "max-reserved-bandwidth kya control karta hai?" Interface bandwidth ka woh hissa, default 75 percent, jitna class guarantees ka sum use kar sakta hai. "Priority guideline kya hai?" Zyada se zyada link ka lagbhag ek tihayi.</p></div>

<div class="scn"><h4>Pandrah classes, ek confused engineer</h4><p>Zenith Logistics ke ek naye network engineer ne pandrah-class enterprise policy ko 4 Mbps branch circuit par copy kar diya. Har class ko link ka 1 se 2 percent mila, jo chhote circuit par kuch kbps hai. ERP class ke paas sirf 40 kbps guaranteed tha aur woh pehle se dheema ho gaya. Senior engineer ne policy paanch classes mein dobara banayi: aath phones ke liye 10 percent priority class, ERP ke liye 35 percent aur bulk ke liye 20 percent, default class ke liye 30 percent chhodkar. Shikayatein usi din band ho gayi.</p><p><b>Lesson:</b> zyada classes ka matlab behtar QoS nahi. Design ko circuit aur asli applications ke hisaab se fit karo.</p></div>

<div class="iv"><p class="q">"Voice, ERP aur backup wale 10 Mbps WAN ke liye bandwidth ka plan kaise banaoge?"</p><p>Main traffic ko voice, signalling, critical data, bulk aur default mein classify karunga. Voice ko calls guna per-call bandwidth se size hui priority class milegi, lagbhag 10 percent aur link ke ek tihayi se kabhi upar nahi. Critical data aur bulk ko percent-based guarantees milengi. Guarantees ka sum lagbhag 75 percent par ya neeche rahega taaki class-default aur control traffic ke liye jagah ho. Main har class ki tolerable delay ke hisaab se queue-limit tune karunga aur load test se result confirm karunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen se paanch classes se shuru karo; zyada classes circuit ko patla kar deti hain.</li>
<li>Priority plus bandwidth guarantees lagbhag 75 percent par ya neeche rakho, priority lagbhag ek tihayi par ya neeche.</li>
<li>Percent circuit ke saath scale hota hai; remaining percent priority traffic ke baad liya jaata hai.</li>
<li>queue-limit drops aur delay ke beech trade-off hai; worst wait = length guna packet size divided by class rate.</li>
<li>Queuing policy tabhi kaam karti hai jab interface asli bottleneck ho; warna pehle shape karo.</li>
</ul></div>
`}};export{e as default};