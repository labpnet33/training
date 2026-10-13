var e={id:`preempt-timers`,h:{en:`Preempt, preempt delay and HSRP timers`,hi:`Preempt, preempt delay aur HSRP timers`},body:{en:`
<p>A shop owner goes on leave and the assistant runs the counter. When the owner returns, two things can happen. In a polite shop, the assistant keeps the counter until the end of the day, because "nobody told me to hand it back". In a well-run shop, the owner simply says "I am back, I will take over", but only after taking off the coat and checking the till, not while still at the door. That is <b>preempt</b> and <b>preempt delay</b>.</p>

<h3>Preempt: allowing a takeover</h3>
<p>In HSRP, preempt is <b>disabled by default</b>. Without it, a router with a better priority that appears later becomes Standby and stays there, as you saw in chapter 4. With <code>standby 10 preempt</code>, a router that hears an Active router with a <b>lower</b> priority sends a <b>Coup</b> message and takes the Active role. The old Active router falls back and becomes Standby.</p>
<p>Preempt matters in two situations:</p>
<ul>
<li><b>Return after an outage.</b> R1 reboots; R2 becomes Active. When R1 comes back, only preempt puts the preferred router back in charge. The broken lab of this module fails exactly here.</li>
<li><b>Tracking</b> (chapter 7). When the Active router's priority is lowered because its uplink died, the Standby only takes over if <b>the Standby</b> has preempt configured. When the uplink returns, the original router only takes back the role if <b>it</b> has preempt.</li>
</ul>
<p>Many designs therefore configure preempt on both routers. It does no harm on the lower-priority router: it never out-ranks the preferred router in normal conditions.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Preempt with and without delay">
<text x="20" y="30" class="svg-ink" font-size="13">R1 reloads at t=0 (priority 110), R2 is Active (priority 100)</text>
<line x1="20" y1="80" x2="620" y2="80" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="92" width="120" height="30" rx="6" fill="#e2e8f0"/><text x="80" y="112" text-anchor="middle" class="svg-ink" font-size="12">t=0 R1 boots</text>
<rect x="150" y="92" width="150" height="30" rx="6" fill="#fed7aa"/><text x="225" y="112" text-anchor="middle" class="svg-ink" font-size="12">t=40 Gi0/0 up</text>
<rect x="310" y="92" width="150" height="30" rx="6" fill="#fde68a"/><text x="385" y="112" text-anchor="middle" class="svg-ink" font-size="12">t=90 OSPF full</text>
<text x="20" y="160" class="svg-accent" font-size="13">No delay: Coup at t=40, black hole until t=90</text>
<text x="20" y="190" class="svg-ink" font-size="13">delay minimum 60: Coup at t=100, routes ready</text>
<rect x="470" y="92" width="150" height="30" rx="6" fill="#bbf7d0"/><text x="545" y="112" text-anchor="middle" class="svg-ink" font-size="12">t=100 R1 Active</text>
</svg><p class="cap">Preempt delay keeps a freshly booted router from grabbing the gateway before its routing is ready.</p></div>

<h3>Preempt delay: do not take over too early</h3>
<p>A router that boots brings its LAN interface up long before OSPF has formed adjacencies and filled the routing table. If it preempts at once, it becomes the gateway while it still has no route to the rest of the network: users' traffic arrives and is dropped. The fix:</p>
<pre class="code">R1(config)# interface GigabitEthernet0/0
<span class="c">! wait at least 60 s after the group comes up before a Coup</span>
R1(config-if)# standby 10 preempt delay minimum 60</pre>
<p><code>minimum</code> sets the wait after the interface or group comes up. There is also a <code>reload</code> keyword that applies only after a reload, and <code>sync</code> for other features, but <code>minimum</code> is the one you will meet most. The value should cover the time your routing protocol needs to converge, plus a margin.</p>

<h3>HSRP timers</h3>
<p>Default: <b>hello 3 s, hold 10 s</b>. You can make detection faster:</p>
<pre class="code"><span class="c">! hello 1 s, hold 3 s</span>
R1(config-if)# standby 10 timers 1 3
<span class="c">! or in milliseconds: hello 250 ms, hold 750 ms</span>
R1(config-if)# standby 10 timers msec 250 msec 750</pre>
<p>Rules of thumb: the hold time must be greater than the hello time (IOS rejects anything else), and should be about <b>three times</b> the hello so that one lost hello does not cause a failover. Configure the same timers on every router in the group. A router that has no timers configured <b>learns</b> them from the Active router's hellos, but do not rely on that: if the Active changes, the learned values can change too.</p>

<pre class="out">R1# show standby GigabitEthernet0/0
GigabitEthernet0/0 - Group 10
  State is Active
  Virtual IP address is 192.168.10.1
<span class="hl">  Hello time 1 sec, hold time 3 sec</span>
    Next hello sent in 0.412 secs
<span class="hl">  Preemption enabled, delay min 60 secs</span>
  Active router is local
  Standby router is 192.168.10.3, priority 100 (expires in 2.604 sec)
  Priority 110 (configured 110)</pre>

<div class="eg"><p><b>Worked example.</b> Default timers: a silent failure of the Active router is detected within 10 s. With <code>timers 1 3</code> it is detected within 3 s. With <code>timers msec 250 msec 750</code>, within 0.75 s, but every router now sends four hellos per second per group; with 200 VLAN groups on a distribution pair that is 800 hellos per second per router. Faster is not free.</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring preempt without a delay on routers that run a routing protocol upstream. The preferred router wins the gateway role back 30 to 60 seconds before it can route, and every reload causes a second outage that looks like "HSRP flapped". Another mistake: timers so aggressive that a busy CPU or a congested link makes the Standby declare the Active dead, causing constant flapping.</p></div>

<div class="exam"><p><b>Exam trap.</b> HSRP preempt is <b>off</b> by default; VRRP preempt is <b>on</b> by default. Also, raising the priority does nothing to the current Active role until preempt is enabled. Expect a question where R2 has priority 150 but R1 stays Active: the answer is "no preempt on R2".</p></div>

<div class="scn"><h4>Every reboot caused two outages</h4><p>A bank branch in Indore saw a strange pattern: after each scheduled reload of the primary router, users lost the network twice, once when it went down (expected, a few seconds) and again about 40 seconds after it came back. The logs showed R1 preempting as soon as Gi0/0 was up, while its BGP session to the WAN provider needed another minute. Adding <code>standby 10 preempt delay minimum 90</code> removed the second outage.</p><p><b>Lesson:</b> preempt tells a router it may take over; preempt delay tells it when it is ready.</p></div>

<div class="iv"><p class="q">"What does HSRP preempt do, and why would you add a delay?"</p><p>Strong answer: preempt lets a router with higher priority take the Active role from a lower-priority Active by sending a Coup; it is disabled by default in HSRP. It is needed so the preferred router returns after an outage and so tracking can move the role. A delay (<code>preempt delay minimum</code>) stops a freshly booted router from taking over before its routing protocol has converged, which would black-hole traffic.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HSRP preempt is off by default; with it, a better router sends a Coup and takes over.</li>
<li>Preempt is required for the preferred router to return and for tracking to work.</li>
<li><code>preempt delay minimum N</code> waits for routing to converge before taking over.</li>
<li>Default timers: hello 3 s, hold 10 s; keep hold about 3 times hello, same on all members.</li>
<li>Faster timers mean faster failover but more hellos and more risk of flapping.</li>
</ul></div>
`,hi:`
<p>Ek dukaan ka maalik chhutti par jaata hai aur assistant counter chalata hai. Jab maalik wapas aata hai, do cheezein ho sakti hain. Tameez wali dukaan mein assistant din khatam hone tak counter rakhta hai, kyunki "kisi ne wapas dene ko kaha hi nahi". Achhi tarah chalne wali dukaan mein maalik bas kehta hai "main wapas aa gaya, main sambhal leta hoon", lekin coat utaarne aur galla check karne ke baad, darwaze par khade khade nahi. Yahi <b>preempt</b> aur <b>preempt delay</b> hai.</p>

<h3>Preempt: takeover ki ijaazat</h3>
<p>HSRP mein preempt <b>default mein disabled</b> hai. Iske bina, baad mein aane wala better priority ka router Standby banta hai aur wahin rehta hai, jaisa aapne chapter 4 mein dekha. <code>standby 10 preempt</code> ke saath, jo router kisi <b>kam</b> priority wale Active router ko sunta hai woh <b>Coup</b> message bhejta hai aur Active role le leta hai. Purana Active router peeche hat kar Standby ban jaata hai.</p>
<p>Preempt do situations mein matter karta hai:</p>
<ul>
<li><b>Outage ke baad wapsi.</b> R1 reboot hota hai; R2 Active ban jaata hai. Jab R1 wapas aata hai, sirf preempt hi preferred router ko wapas incharge banata hai. Is module ka toota hua lab bilkul yahin fail hota hai.</li>
<li><b>Tracking</b> (chapter 7). Jab Active router ki priority uske uplink ke marne se kam hoti hai, Standby tabhi kaam sambhalta hai jab <b>Standby</b> par preempt configured ho. Jab uplink wapas aata hai, original router role tabhi wapas leta hai jab <b>us par</b> preempt ho.</li>
</ul>
<p>Isliye kai designs dono routers par preempt configure karte hain. Kam priority wale router par isse koi nuksaan nahi: normal haalat mein woh kabhi preferred router se upar nahi jaata.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Delay ke saath aur bina preempt">
<text x="20" y="30" class="svg-ink" font-size="13">R1 t=0 par reload (priority 110), R2 Active hai (priority 100)</text>
<line x1="20" y1="80" x2="620" y2="80" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="92" width="120" height="30" rx="6" fill="#e2e8f0"/><text x="80" y="112" text-anchor="middle" class="svg-ink" font-size="12">t=0 R1 boot</text>
<rect x="150" y="92" width="150" height="30" rx="6" fill="#fed7aa"/><text x="225" y="112" text-anchor="middle" class="svg-ink" font-size="12">t=40 Gi0/0 up</text>
<rect x="310" y="92" width="150" height="30" rx="6" fill="#fde68a"/><text x="385" y="112" text-anchor="middle" class="svg-ink" font-size="12">t=90 OSPF full</text>
<text x="20" y="160" class="svg-accent" font-size="13">Bina delay: t=40 par Coup, t=90 tak black hole</text>
<text x="20" y="190" class="svg-ink" font-size="13">delay minimum 60: t=100 par Coup, routes ready</text>
<rect x="470" y="92" width="150" height="30" rx="6" fill="#bbf7d0"/><text x="545" y="112" text-anchor="middle" class="svg-ink" font-size="12">t=100 R1 Active</text>
</svg><p class="cap">Preempt delay abhi abhi boot hue router ko routing ready hone se pehle gateway chheenne se rokta hai.</p></div>

<h3>Preempt delay: bahut jaldi takeover mat karo</h3>
<p>Boot hone wala router apna LAN interface bahut pehle up kar deta hai, OSPF ke adjacencies banane aur routing table bharne se kaafi pehle. Agar woh turant preempt kare, to woh gateway ban jaata hai jabki uske paas abhi baaki network ka route hi nahi hai: users ka traffic aata hai aur drop ho jaata hai. Fix:</p>
<pre class="code">R1(config)# interface GigabitEthernet0/0
<span class="c">! group up hone ke baad Coup se pehle kam se kam 60 s wait karo</span>
R1(config-if)# standby 10 preempt delay minimum 60</pre>
<p><code>minimum</code> interface ya group up hone ke baad ka wait set karta hai. Ek <code>reload</code> keyword bhi hai jo sirf reload ke baad lagta hai, aur doosre features ke liye <code>sync</code>, lekin aapko sabse zyada <code>minimum</code> hi milega. Value itni honi chahiye ki aapke routing protocol ka converge hone ka time plus thoda margin cover ho.</p>

<h3>HSRP timers</h3>
<p>Default: <b>hello 3 s, hold 10 s</b>. Aap detection tez kar sakte ho:</p>
<pre class="code"><span class="c">! hello 1 s, hold 3 s</span>
R1(config-if)# standby 10 timers 1 3
<span class="c">! ya milliseconds mein: hello 250 ms, hold 750 ms</span>
R1(config-if)# standby 10 timers msec 250 msec 750</pre>
<p>Thumb rules: hold time hello time se bada hona chahiye (IOS baaki sab reject karta hai), aur hello ka lagbhag <b>teen guna</b> hona chahiye taaki ek khoya hello failover na karwa de. Group ke har router par same timers configure karo. Jis router par timers configured nahi hain woh unhe Active router ke hellos se <b>seekh</b> leta hai, lekin is par bharosa mat karo: agar Active badle, to seekhe hue values bhi badal sakte hain.</p>

<pre class="out">R1# show standby GigabitEthernet0/0
GigabitEthernet0/0 - Group 10
  State is Active
  Virtual IP address is 192.168.10.1
<span class="hl">  Hello time 1 sec, hold time 3 sec</span>
    Next hello sent in 0.412 secs
<span class="hl">  Preemption enabled, delay min 60 secs</span>
  Active router is local
  Standby router is 192.168.10.3, priority 100 (expires in 2.604 sec)
  Priority 110 (configured 110)</pre>

<div class="eg"><p><b>Worked example.</b> Default timers: Active router ki silent failure 10 s ke andar detect hoti hai. <code>timers 1 3</code> ke saath 3 s ke andar. <code>timers msec 250 msec 750</code> ke saath 0.75 s ke andar, lekin ab har router har group ke liye har second chaar hellos bhejta hai; distribution pair par 200 VLAN groups ke saath yeh har router par har second 800 hellos hain. Tez hona free nahi hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Un routers par bina delay ke preempt configure karna jo upstream routing protocol chalate hain. Preferred router route kar paane se 30 se 60 second pehle gateway role wapas jeet leta hai, aur har reload doosra outage laata hai jo "HSRP flap hua" jaisa dikhta hai. Ek aur galti: itne aggressive timers ki busy CPU ya congested link ki wajah se Standby Active ko mara hua declare kar de, aur lagatar flapping ho.</p></div>

<div class="exam"><p><b>Exam trap.</b> HSRP preempt default mein <b>off</b> hai; VRRP preempt default mein <b>on</b> hai. Aur priority badhane se current Active role par tab tak kuch nahi hota jab tak preempt enable na ho. Aisa question expect karo jismein R2 ki priority 150 hai lekin R1 Active rehta hai: jawab hai "R2 par preempt nahi hai".</p></div>

<div class="scn"><h4>Har reboot do outage laata tha</h4><p>Indore ki ek bank branch ne ajeeb pattern dekha: primary router ke har scheduled reload ke baad users ka network do baar jaata tha, ek baar jab woh down hua (expected, kuch seconds) aur phir wapas aane ke lagbhag 40 second baad. Logs ne dikhaya ki R1 Gi0/0 up hote hi preempt kar raha tha, jabki WAN provider ke saath uske BGP session ko ek minute aur chahiye tha. <code>standby 10 preempt delay minimum 90</code> jodne se doosra outage khatam ho gaya.</p><p><b>Seekh:</b> preempt router ko batata hai ki woh kaam le sakta hai; preempt delay batata hai ki woh kab ready hai.</p></div>

<div class="iv"><p class="q">"HSRP preempt kya karta hai, aur aap delay kyun jodoge?"</p><p>Strong answer: preempt zyada priority wale router ko Coup bhej kar kam priority wale Active se Active role lene deta hai; HSRP mein yeh default disabled hai. Yeh zaroori hai taaki preferred router outage ke baad wapas aaye aur tracking role move kar sake. Delay (<code>preempt delay minimum</code>) abhi boot hue router ko uske routing protocol ke converge hone se pehle takeover karne se rokta hai, warna traffic black-hole hota.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HSRP preempt default off hai; iske saath better router Coup bhej kar kaam le leta hai.</li>
<li>Preferred router ki wapsi aur tracking ke kaam karne ke liye preempt zaroori hai.</li>
<li><code>preempt delay minimum N</code> takeover se pehle routing converge hone ka wait karta hai.</li>
<li>Default timers: hello 3 s, hold 10 s; hold ko hello ka lagbhag 3 guna rakho, saare members par same.</li>
<li>Tez timers matlab tez failover, lekin zyada hellos aur flapping ka zyada risk.</li>
</ul></div>
`}};export{e as default};