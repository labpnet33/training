var e={id:`what-qos-fixes`,h:{en:`What QoS fixes: congestion, delay, jitter, loss and four traffic types`,hi:`QoS kya theek karta hai: congestion, delay, jitter, loss aur chaar traffic types`},body:{en:`
<p>Picture a highway toll plaza. On a quiet night every car passes at once. At 6 pm a long queue builds. Some cars wait a little, some wait a lot, and if the queue grows beyond the road, cars get turned away. A network link behaves exactly like this. QoS (Quality of Service) is the set of rules that decide who is let through first, who waits, and who is turned away, so that important traffic still feels fast.</p>

<h3>Where problems begin: congestion</h3>
<p>A link can only send bits at its <b>line rate</b>. If packets arrive faster than the link can send them, the extra packets wait in a <b>queue</b>, which is a piece of memory in the router. <b>Congestion</b> is exactly this: arrival rate higher than departure rate. It happens mostly where a fast network meets a slower one, for example a 1 Gbps office LAN feeding a 10 Mbps WAN line. When the queue is full, new packets are <b>dropped</b>. This default behaviour is called <b>tail drop</b>, and it treats voice and backup packets alike.</p>

<h3>The four symptoms</h3>
<dl class="terms">
<dt>Bandwidth</dt><dd>How many bits per second the link can carry. Too little bandwidth means permanent congestion.</dd>
<dt>Delay (latency)</dt><dd>How long a packet takes from source to destination. A waiting queue adds delay. Voice needs one-way delay under about 150 ms.</dd>
<dt>Jitter</dt><dd>The variation in delay between packets. If packets arrive 20 ms, then 80 ms, then 25 ms apart, audio sounds choppy because the receiver does not get steady data.</dd>
<dt>Loss</dt><dd>Packets that never arrive because a full queue dropped them. Even 1 percent loss damages a voice call.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="A congested link with a queue">
<rect x="10" y="60" width="90" height="80" rx="8" fill="#e2e8f0"/><text x="55" y="95" text-anchor="middle" class="svg-ink" font-size="13">LAN</text><text x="55" y="115" text-anchor="middle" class="svg-muted" font-size="12">1 Gbps</text>
<rect x="130" y="70" width="200" height="60" rx="8" fill="#bae6fd"/><text x="230" y="95" text-anchor="middle" class="svg-ink" font-size="13">Router output queue</text>
<rect x="140" y="105" width="22" height="16" fill="#fed7aa"/><rect x="166" y="105" width="22" height="16" fill="#fed7aa"/><rect x="192" y="105" width="22" height="16" fill="#bbf7d0"/><rect x="218" y="105" width="22" height="16" fill="#fed7aa"/><rect x="244" y="105" width="22" height="16" fill="#fed7aa"/><rect x="270" y="105" width="22" height="16" fill="#fed7aa"/>
<line x1="100" y1="100" x2="130" y2="100" stroke="#64748b" stroke-width="8"/>
<line x1="330" y1="100" x2="500" y2="100" stroke="#64748b" stroke-width="3"/>
<text x="415" y="88" text-anchor="middle" class="svg-muted" font-size="12">WAN 10 Mbps</text>
<rect x="500" y="60" width="90" height="80" rx="8" fill="#e2e8f0"/><text x="545" y="105" text-anchor="middle" class="svg-ink" font-size="13">Head office</text>
<text x="230" y="165" text-anchor="middle" class="svg-muted" font-size="12">orange = backup, green = one voice packet stuck behind</text>
<text x="230" y="185" text-anchor="middle" class="svg-muted" font-size="12">queue full means tail drop</text>
</svg><p class="cap">A fast LAN feeding a slow WAN fills the queue. The voice packet waits behind backup packets.</p></div>

<div class="eg"><p><b>Worked example.</b> The Nashik LAN offers 14 Mbps towards a 10 Mbps WAN. Every second 4 Mbps (4 million bits) cannot be sent. A queue that holds, say, 1 Mbit fills in a quarter of a second, and after that roughly 29 percent of all packets (4 of 14) are dropped. Voice and backup are dropped in the same proportion, so a call suffers while a backup merely slows down.</p></div>

<h3>The four traffic types</h3>
<p>Not all traffic is equal. A beginner-friendly way to start is to sort it into four families by what the user feels when it is late or lost.</p>
<table class="cmp"><tr><th>Type</th><th>Example</th><th>Hates</th><th>Typical need</th></tr>
<tr><td><b>Voice</b></td><td>IP phone call</td><td>Delay, jitter, loss</td><td>Small packets, steady, about 100 kbps per call; must go first</td></tr>
<tr><td><b>Video</b></td><td>Live class, meeting</td><td>Loss, jitter</td><td>Large and bursty, several Mbps; needs guaranteed share</td></tr>
<tr><td><b>Critical data</b></td><td>Billing, ERP, database</td><td>Long delay, loss</td><td>Reliable; needs a fair, protected share</td></tr>
<tr><td><b>Bulk</b></td><td>Backups, downloads, updates</td><td>Nothing much</td><td>Can wait; takes whatever is left</td></tr></table>
<p>Later modules refine this into the eight-class models used by real networks (mq-mark, mq-queue and mq-voice). Four is enough to understand the idea.</p>

<h3>What QoS does about it</h3>
<p>QoS has three jobs, which we meet in the next chapter: <b>classify</b> (recognise which type a packet is), <b>mark</b> (write the type on the packet so later routers do not have to guess), and <b>treat</b> (give each type its own queue and rules, for example voice first). QoS tools you will meet later include queuing (decide the order), policing (cut traffic above a limit), shaping (smooth traffic to fit a slower link) and congestion avoidance (drop a few packets early to keep queues short).</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Applying QoS on a link that is not congested; it does nothing visible there, because queues stay empty. (2) Expecting QoS to fix a link that is always full. (3) Giving every application the top class; if everything is priority, nothing is.</p></div>

<div class="exam"><p><b>Exam trap.</b> Delay is how long, jitter is how uneven, loss is how many never arrive. Voice targets: one-way delay under 150 ms, jitter under 30 ms, loss under 1 percent.</p></div>

<div class="scn"><h4>The evening video freeze</h4><p>Sahyadri University ran live classes at 7 pm from a campus that also uploaded 200 GB of recorded lectures every night. Students in a hostel saw the live video freeze for a second every few minutes. Monitoring showed the WAN queue hitting its limit during uploads, and drops appearing in the video stream. The team did not buy more bandwidth. They marked the live class as video, the upload as bulk, and gave video a guaranteed share of the link. The uploads ran a little slower, and the freezes disappeared.</p><p><b>Lesson:</b> congestion cannot always be avoided, but who suffers from it can be chosen.</p></div>

<div class="iv"><p class="q">"What is jitter and why does it matter for voice?"</p><p>Strong answer: jitter is variation in packet delay. Voice is sent as a steady stream of small packets and the receiver plays them back at a fixed pace, so uneven arrival causes gaps or robotic sound. A small de-jitter buffer helps, but large jitter, usually from queuing behind big packets, needs QoS such as a priority queue.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Congestion happens when packets arrive faster than the link can send; the extra ones queue or are dropped.</li>
<li>Delay, jitter and loss are the three quality measures; bandwidth is the raw capacity.</li>
<li>Voice, video, critical data and bulk need different treatment.</li>
<li>QoS classifies, marks and treats; it does not add bandwidth.</li>
<li>It only matters where queues form, usually at a fast-to-slow boundary such as the WAN edge.</li>
</ul></div>
`,hi:`
<p>Ek highway toll plaza ki tasveer socho. Shaant raat mein har gaadi ek saath nikal jaati hai. Shaam 6 baje lambi line lag jaati hai. Kuch gaadiyan thoda ruki, kuch bahut, aur agar line sadak se bahar nikal jaaye to gaadiyan wapas bhej di jaati hain. Network link bilkul aisa hi behave karti hai. QoS (Quality of Service) un rules ka set hai jo decide karte hain ki kise pehle jaane diya jaaye, kaun ruke, aur kise wapas bheja jaaye, taaki important traffic phir bhi tez lage.</p>

<h3>Problem kahan se shuru hoti hai: congestion</h3>
<p>Link sirf apne <b>line rate</b> par bits bhej sakti hai. Agar packets link ke bhejne se tez aate hain, to extra packets ek <b>queue</b> mein ruk jaate hain, jo router mein memory ka ek hissa hai. <b>Congestion</b> yahi hai: arrival rate departure rate se zyada. Yeh zyada tar wahan hota hai jahan fast network slow se milta hai, jaise 1 Gbps office LAN 10 Mbps WAN line ko feed kare. Jab queue bhar jaati hai, naye packets <b>drop</b> ho jaate hain. Is default behaviour ko <b>tail drop</b> kehte hain, aur yeh voice aur backup packets ko ek jaisa treat karta hai.</p>

<h3>Chaar lakshan</h3>
<dl class="terms">
<dt>Bandwidth</dt><dd>Link kitne bits per second carry kar sakti hai. Bandwidth kam ho to congestion permanent ho jaata hai.</dd>
<dt>Delay (latency)</dt><dd>Packet ko source se destination tak pahunchne mein kitna time lagta hai. Intezaar karti queue delay badhati hai. Voice ko one-way delay lagbhag 150 ms se kam chahiye.</dd>
<dt>Jitter</dt><dd>Packets ke beech delay ka farak. Agar packets 20 ms, phir 80 ms, phir 25 ms ke gap par aayein, to audio choppy lagta hai kyunki receiver ko steady data nahi milta.</dd>
<dt>Loss</dt><dd>Woh packets jo kabhi pahunche hi nahi kyunki full queue ne unhe drop kar diya. 1 percent loss bhi voice call ko kharab karta hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Queue ke saath congested link">
<rect x="10" y="60" width="90" height="80" rx="8" fill="#e2e8f0"/><text x="55" y="95" text-anchor="middle" class="svg-ink" font-size="13">LAN</text><text x="55" y="115" text-anchor="middle" class="svg-muted" font-size="12">1 Gbps</text>
<rect x="130" y="70" width="200" height="60" rx="8" fill="#bae6fd"/><text x="230" y="95" text-anchor="middle" class="svg-ink" font-size="13">Router output queue</text>
<rect x="140" y="105" width="22" height="16" fill="#fed7aa"/><rect x="166" y="105" width="22" height="16" fill="#fed7aa"/><rect x="192" y="105" width="22" height="16" fill="#bbf7d0"/><rect x="218" y="105" width="22" height="16" fill="#fed7aa"/><rect x="244" y="105" width="22" height="16" fill="#fed7aa"/><rect x="270" y="105" width="22" height="16" fill="#fed7aa"/>
<line x1="100" y1="100" x2="130" y2="100" stroke="#64748b" stroke-width="8"/>
<line x1="330" y1="100" x2="500" y2="100" stroke="#64748b" stroke-width="3"/>
<text x="415" y="88" text-anchor="middle" class="svg-muted" font-size="12">WAN 10 Mbps</text>
<rect x="500" y="60" width="90" height="80" rx="8" fill="#e2e8f0"/><text x="545" y="105" text-anchor="middle" class="svg-ink" font-size="13">Head office</text>
<text x="230" y="165" text-anchor="middle" class="svg-muted" font-size="12">orange = backup, green = ek voice packet peeche phansa</text>
<text x="230" y="185" text-anchor="middle" class="svg-muted" font-size="12">queue full matlab tail drop</text>
</svg><p class="cap">Fast LAN slow WAN ko feed kare to queue bhar jaati hai. Voice packet backup packets ke peeche ruka rehta hai.</p></div>

<div class="eg"><p><b>Worked example.</b> Nashik LAN 10 Mbps WAN ki taraf 14 Mbps offer karta hai. Har second 4 Mbps (40 lakh bits) bheje nahi ja sakte. Ek queue jo maan lo 1 Mbit rakhti hai, wo aadhe second ke chauthai hisse mein bhar jaati hai, aur uske baad lagbhag 29 percent packets (14 mein se 4) drop hote hain. Voice aur backup same proportion mein drop hote hain, isliye call suffer karti hai jabki backup bas slow hota hai.</p></div>

<h3>Chaar traffic types</h3>
<p>Sab traffic barabar nahi hota. Beginner ke liye shuruat ka aasan tareeka hai ise chaar families mein baantna, is hisaab se ki late ya lost hone par user ko kya mehsoos hota hai.</p>
<table class="cmp"><tr><th>Type</th><th>Example</th><th>Kisse nafrat</th><th>Typical zaroorat</th></tr>
<tr><td><b>Voice</b></td><td>IP phone call</td><td>Delay, jitter, loss</td><td>Chhote packets, steady, lagbhag 100 kbps per call; pehle jaana chahiye</td></tr>
<tr><td><b>Video</b></td><td>Live class, meeting</td><td>Loss, jitter</td><td>Bade aur bursty, kai Mbps; guaranteed share chahiye</td></tr>
<tr><td><b>Critical data</b></td><td>Billing, ERP, database</td><td>Lamba delay, loss</td><td>Reliable; fair, protected share chahiye</td></tr>
<tr><td><b>Bulk</b></td><td>Backups, downloads, updates</td><td>Kuch khaas nahi</td><td>Ruk sakta hai; jo bache wo le leta hai</td></tr></table>
<p>Baad ke modules ise real networks ke eight-class models mein refine karte hain (mq-mark, mq-queue aur mq-voice). Idea samajhne ke liye chaar kaafi hain.</p>

<h3>QoS isme kya karta hai</h3>
<p>QoS ke teen kaam hain, jo agle chapter mein milenge: <b>classify</b> (pehchano packet kis type ka hai), <b>mark</b> (packet par type likh do taaki baad ke routers ko guess na karna pade), aur <b>treat</b> (har type ko apni queue aur rules do, jaise voice pehle). Baad mein jo QoS tools milenge: queuing (order decide karna), policing (limit se upar traffic kaatna), shaping (traffic ko slow link ke hisaab se smooth karna) aur congestion avoidance (queue chhoti rakhne ke liye kuch packets jaldi drop karna).</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Aisi link par QoS lagana jo congested nahi hai; wahan kuch dikhta nahi, kyunki queues khaali rehti hain. (2) Yeh ummeed karna ki QoS hamesha bhari rehne wali link ko theek kar dega. (3) Har application ko top class de dena; agar sab priority hain, to koi nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> Delay kitni der, jitter kitna uneven, loss kitne kabhi pahunche hi nahi. Voice targets: one-way delay 150 ms se kam, jitter 30 ms se kam, loss 1 percent se kam.</p></div>

<div class="scn"><h4>Shaam ko video freeze</h4><p>Sahyadri University shaam 7 baje live classes chalati thi ek campus se jo har raat 200 GB recorded lectures bhi upload karta tha. Hostel ke students ko live video har kuch minute mein ek second ke liye freeze hota dikha. Monitoring ne dikhaya ki uploads ke dauraan WAN queue apni limit par pahunchti thi, aur video stream mein drops aa rahe the. Team ne zyada bandwidth nahi kharidi. Unhone live class ko video mark kiya, upload ko bulk, aur video ko link ka guaranteed share diya. Uploads thode slow chale, aur freezes gayab ho gaye.</p><p><b>Seekh:</b> congestion hamesha avoid nahi ho sakta, lekin kaun suffer karega yeh chuna ja sakta hai.</p></div>

<div class="iv"><p class="q">"Jitter kya hai aur voice ke liye kyun matter karta hai?"</p><p>Strong answer: jitter packet delay mein variation hai. Voice chhote packets ki steady stream ki tarah bheji jaati hai aur receiver unhe fixed pace par play karta hai, isliye uneven arrival se gaps ya robotic sound aata hai. Chhota de-jitter buffer madad karta hai, lekin bada jitter, jo aksar bade packets ke peeche queue hone se aata hai, ko QoS chahiye jaise priority queue.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Congestion tab hota hai jab packets link ke bhejne se tez aate hain; extra queue mein ruke ya drop hote hain.</li>
<li>Delay, jitter aur loss teen quality measures hain; bandwidth raw capacity hai.</li>
<li>Voice, video, critical data aur bulk ko alag treatment chahiye.</li>
<li>QoS classify, mark aur treat karta hai; bandwidth add nahi karta.</li>
<li>Yeh sirf wahan matter karta hai jahan queues banti hain, aksar fast-to-slow boundary jaise WAN edge par.</li>
</ul></div>
`}};export{e as default};