var e={id:`app-needs`,h:{en:`What applications need: latency, jitter and loss`,hi:`Applications ko kya chahiye: latency, jitter aur loss`},body:{en:`
<p>A network does not care what it carries, but applications care a lot about how they are carried. Think of three kinds of mail: a live phone call is like a conversation through a pipe (every word must arrive quickly and in rhythm), a movie download is like a truck of crates (it only matters that everything arrives eventually), and a bank transaction is like a registered letter (it must arrive complete). Different needs, different roads.</p>

<h3>The three numbers</h3>
<dl class="terms">
<dt>Latency (delay)</dt><dd>How long a packet takes from sender to receiver, measured in milliseconds. Often measured as round-trip time (RTT) because it is easy to measure from one end. Distance, number of hops and queueing all add to it.</dd>
<dt>Jitter</dt><dd>The <b>variation</b> in latency from packet to packet. If packets arrive at 20, 21, 20, 55, 20 ms, the average is fine but the jitter is large. The 55 ms packet arrives late and a voice codec cannot play it in time.</dd>
<dt>Packet loss</dt><dd>The percentage of packets that never arrive. Loss comes from congestion, bad links or wireless interference. TCP retransmits lost packets (slowing down); real-time traffic usually cannot wait for a retransmission.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Latency, jitter and loss">
<text x="20" y="25" class="svg-ink" font-size="13">Sender sends one packet every 20 ms</text>
<line x1="20" y1="45" x2="620" y2="45" stroke="#64748b" stroke-width="1.5"/>
<circle cx="60" cy="45" r="7" fill="#bae6fd"/><circle cx="140" cy="45" r="7" fill="#bae6fd"/><circle cx="220" cy="45" r="7" fill="#bae6fd"/><circle cx="300" cy="45" r="7" fill="#bae6fd"/><circle cx="380" cy="45" r="7" fill="#bae6fd"/>
<text x="20" y="85" class="svg-ink" font-size="13">Receiver sees them arrive like this</text>
<line x1="20" y1="105" x2="620" y2="105" stroke="#64748b" stroke-width="1.5"/>
<circle cx="80" cy="105" r="7" fill="#bbf7d0"/><circle cx="160" cy="105" r="7" fill="#bbf7d0"/><circle cx="300" cy="105" r="7" fill="#fde68a"/><circle cx="380" cy="105" r="7" fill="#bbf7d0"/>
<text x="230" y="130" text-anchor="middle" class="svg-accent" font-size="12">lost packet</text>
<text x="300" y="130" text-anchor="middle" class="svg-accent" font-size="12">late (jitter)</text>
<text x="20" y="170" class="svg-muted" font-size="12">Even spacing = low jitter. Missing dot = loss. Shift of every dot = latency.</text>
</svg><p class="cap">The same stream of packets can suffer all three problems at once.</p></div>

<h3>What each application class needs</h3>
<table class="cmp"><tr><th>Application</th><th>Latency</th><th>Jitter</th><th>Loss</th><th>Why</th></tr>
<tr><td>Voice (VoIP)</td><td>under 150 ms one way</td><td>under 30 ms</td><td>under 1 %</td><td>Real time, small packets, no time to retransmit</td></tr>
<tr><td>Video conferencing</td><td>under 150 ms</td><td>under 30 ms</td><td>under 1 % (0.1 to 1)</td><td>Real time, large bursts, loss makes frozen frames</td></tr>
<tr><td>ERP (business apps)</td><td>under about 100 to 200 ms</td><td>tolerant</td><td>low</td><td>Chatty transactions: many round trips multiply latency</td></tr>
<tr><td>Web and SaaS</td><td>moderate</td><td>tolerant</td><td>tolerant</td><td>TCP recovers, users accept a short wait</td></tr>
<tr><td>Backup and bulk</td><td>tolerant</td><td>tolerant</td><td>tolerant</td><td>Throughput matters, timing does not</td></tr></table>
<p>The voice numbers (150 ms one way, 30 ms jitter, 1 % loss) come from classic guidance for interactive voice, and they are the numbers the course uses in the SLA profile <code>VOICE</code>. Real designs adjust them to the codec and the business.</p>

<h3>Why ERP is sensitive in a different way</h3>
<p>An ERP screen may need 40 small request and reply exchanges to draw one form. At 30 ms each, that is 1.2 seconds; at 200 ms each, it is 8 seconds. The application is not real time, but latency multiplies. This is why applications are classified individually and not simply as "real time" and "everything else".</p>

<div class="eg"><p><b>Worked example.</b> Delhi to Bengaluru, default circuits. MPLS is 20 ms / 2 ms / 0.05 %, Internet is 30 ms / 6 ms / 0.3 %, LTE is 60 ms / 15 ms / 1 %. Compare with the voice limits 150 / 30 / 1. All three meet voice. LTE meets it only barely: loss 1 % equals the limit, and the limits are inclusive (less than or equal). Now suppose LTE loss rises to 1.5 %. Latency and jitter still pass but loss fails, so LTE no longer meets VOICE. One bad metric is enough to fail.</p></div>

<h3>Why steer at all?</h3>
<p>Each transport has its own personality. MPLS is carrier-managed, with SLAs and low jitter, but costly. Broadband Internet is cheap and plentiful but has no guarantee. LTE is a backup that is available everywhere but has higher delay and loss and often a data cap. A good policy sends voice over the best-quality path, lets backup use the cheap path, and keeps LTE for emergencies.</p>

<div class="warn"><p><b>Common mistake:</b> comparing only latency. A path with 20 ms latency and 4 % loss is worse for a voice call than a path with 40 ms and 0.1 % loss. Always check all three numbers.</p></div>
<div class="exam"><p><b>Exam trap:</b> jitter is variation in delay, not delay itself. Bandwidth is not one of the three SLA numbers; a fat link can still have high latency.</p></div>

<div class="note"><p><b>Real Versa:</b> SLA metrics in real SD-WAN policy are measured per transport and per forwarding class, and Versa can also use forward and reverse loss separately (a link can be fine one way and bad the other). The course model uses one set of latency, jitter and loss per circuit.</p></div>

<div class="scn"><h4>ERP slow only in Kolkata</h4><p>Kolkata users say the ERP form takes 9 seconds to load. Ping to the ERP server shows 210 ms. Voice works because it rides MPLS, but ERP has no rule and is spread across Internet and LTE too. The Internet circuit has a 190 ms spike every afternoon. The team creates an ERP profile requiring 100 ms and sends ERP over MPLS first.</p><p><b>Lesson:</b> Chatty applications are latency-sensitive even though they are not real time.</p></div>

<div class="iv"><p class="q">"What are latency, jitter and loss, and which matters most for voice?"</p><p>Latency is delay, jitter is variation of delay, loss is dropped packets. For voice, jitter and loss usually hurt first because the codec has a small playout buffer and cannot wait for retransmission, while the delay budget is about 150 ms one way. Give the numbers 150 ms, 30 ms and 1 %.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three numbers define path quality: latency, jitter, loss.</li>
<li>Voice and video are real time; ERP is chatty; web and backup are tolerant.</li>
<li>Course VOICE limits: 150 ms, 30 ms, 1 %; all must pass, limits are inclusive.</li>
<li>Check all three metrics, not only latency.</li>
</ul></div>
`,hi:`
<p>Network ko parwah nahi ki woh kya carry kar raha hai, lekin applications ko bahut parwah hai ki unhe kaise carry kiya jaa raha hai. Teen tarah ki dak socho: live phone call ek pipe se baatcheet jaisi hai (har shabd jaldi aur rhythm mein pahunchna chahiye), movie download crates ke truck jaisa hai (bas yeh matter karta hai ki sab kuch eventually pahunch jaye), aur bank transaction registered letter jaisa hai (poora pahunchna chahiye). Alag zarooratein, alag roads.</p>

<h3>Teen numbers</h3>
<dl class="terms">
<dt>Latency (delay)</dt><dd>Packet ko sender se receiver tak pahunchne mein kitna time lagta hai, milliseconds mein. Aksar round-trip time (RTT) ke roop mein measure hota hai kyunki ek hi end se measure karna aasan hai. Distance, hops ki sankhya aur queueing sab ise badhate hain.</dd>
<dt>Jitter</dt><dd>Packet se packet latency ki <b>variation</b>. Agar packets 20, 21, 20, 55, 20 ms mein aate hain, to average theek hai lekin jitter bada hai. 55 ms wala packet late aata hai aur voice codec use time par play nahi kar sakta.</dd>
<dt>Packet loss</dt><dd>Un packets ka percentage jo kabhi pahunchte hi nahi. Loss congestion, kharab links ya wireless interference se aata hai. TCP lost packets dobara bhejta hai (slow hokar); real-time traffic aksar retransmission ka wait nahi kar sakta.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Latency, jitter aur loss">
<text x="20" y="25" class="svg-ink" font-size="13">Sender har 20 ms mein ek packet bhejta hai</text>
<line x1="20" y1="45" x2="620" y2="45" stroke="#64748b" stroke-width="1.5"/>
<circle cx="60" cy="45" r="7" fill="#bae6fd"/><circle cx="140" cy="45" r="7" fill="#bae6fd"/><circle cx="220" cy="45" r="7" fill="#bae6fd"/><circle cx="300" cy="45" r="7" fill="#bae6fd"/><circle cx="380" cy="45" r="7" fill="#bae6fd"/>
<text x="20" y="85" class="svg-ink" font-size="13">Receiver ko woh aise aate dikhte hain</text>
<line x1="20" y1="105" x2="620" y2="105" stroke="#64748b" stroke-width="1.5"/>
<circle cx="80" cy="105" r="7" fill="#bbf7d0"/><circle cx="160" cy="105" r="7" fill="#bbf7d0"/><circle cx="300" cy="105" r="7" fill="#fde68a"/><circle cx="380" cy="105" r="7" fill="#bbf7d0"/>
<text x="230" y="130" text-anchor="middle" class="svg-accent" font-size="12">lost packet</text>
<text x="300" y="130" text-anchor="middle" class="svg-accent" font-size="12">late (jitter)</text>
<text x="20" y="170" class="svg-muted" font-size="12">Barabar spacing = low jitter. Gayab dot = loss. Har dot ka shift = latency.</text>
</svg><p class="cap">Packets ki ek hi stream ko teeno problems ek saath ho sakti hain.</p></div>

<h3>Har application class ko kya chahiye</h3>
<table class="cmp"><tr><th>Application</th><th>Latency</th><th>Jitter</th><th>Loss</th><th>Kyun</th></tr>
<tr><td>Voice (VoIP)</td><td>150 ms se kam one way</td><td>30 ms se kam</td><td>1 % se kam</td><td>Real time, chhote packets, retransmit ka time nahi</td></tr>
<tr><td>Video conferencing</td><td>150 ms se kam</td><td>30 ms se kam</td><td>1 % se kam (0.1 se 1)</td><td>Real time, bade bursts, loss se frozen frames</td></tr>
<tr><td>ERP (business apps)</td><td>lagbhag 100 se 200 ms se kam</td><td>tolerant</td><td>low</td><td>Chatty transactions: bahut round trips latency ko multiply karte hain</td></tr>
<tr><td>Web aur SaaS</td><td>moderate</td><td>tolerant</td><td>tolerant</td><td>TCP recover kar leta hai, user thoda wait accept karta hai</td></tr>
<tr><td>Backup aur bulk</td><td>tolerant</td><td>tolerant</td><td>tolerant</td><td>Throughput matter karta hai, timing nahi</td></tr></table>
<p>Voice ke numbers (150 ms one way, 30 ms jitter, 1 % loss) interactive voice ki classic guidance se aate hain, aur yahi numbers course SLA profile <code>VOICE</code> mein use karta hai. Real designs inhe codec aur business ke hisaab se adjust karte hain.</p>

<h3>ERP alag tarah se sensitive kyun hai</h3>
<p>Ek ERP screen ko ek form draw karne ke liye 40 chhote request aur reply exchanges lag sakte hain. 30 ms par yeh 1.2 second hai; 200 ms par 8 seconds. Application real time nahi hai, lekin latency multiply hoti hai. Isliye applications ko individually classify kiya jaata hai, sirf "real time" aur "baaki sab" mein nahi.</p>

<div class="eg"><p><b>Worked example.</b> Delhi se Bengaluru, default circuits. MPLS 20 ms / 2 ms / 0.05 % hai, Internet 30 ms / 6 ms / 0.3 % hai, LTE 60 ms / 15 ms / 1 % hai. Voice limits 150 / 30 / 1 se compare karo. Teeno voice meet karte hain. LTE sirf mushkil se meet karta hai: loss 1 % limit ke barabar hai, aur limits inclusive hain (kam ya barabar). Ab maan lo LTE loss 1.5 % ho jaye. Latency aur jitter abhi bhi pass hain lekin loss fail hai, to LTE ab VOICE meet nahi karta. Ek bhi bad metric fail karne ke liye kaafi hai.</p></div>

<h3>Steer kyun karna hai?</h3>
<p>Har transport ki apni personality hai. MPLS carrier-managed hai, SLAs aur low jitter ke saath, lekin mehnga. Broadband Internet sasta aur bahut hai lekin koi guarantee nahi. LTE backup hai jo kahin bhi available hai lekin delay aur loss zyada aur aksar data cap. Achhi policy voice ko best-quality path par bhejti hai, backup ko sasta path use karne deti hai, aur LTE ko emergency ke liye rakhti hai.</p>

<div class="warn"><p><b>Common mistake:</b> sirf latency compare karna. 20 ms latency aur 4 % loss wala path voice call ke liye 40 ms aur 0.1 % loss wale path se kharab hai. Hamesha teeno numbers check karo.</p></div>
<div class="exam"><p><b>Exam trap:</b> jitter delay ki variation hai, delay khud nahi. Bandwidth teen SLA numbers mein se nahi hai; moti link bhi high latency de sakti hai.</p></div>

<div class="note"><p><b>Real Versa:</b> real SD-WAN policy mein SLA metrics har transport aur forwarding class ke hisaab se measure hote hain, aur Versa forward aur reverse loss alag alag bhi use kar sakta hai (link ek taraf theek aur doosri taraf kharab ho sakti hai). Course model har circuit ke liye latency, jitter aur loss ka ek hi set use karta hai.</p></div>

<div class="scn"><h4>ERP sirf Kolkata mein slow</h4><p>Kolkata users kehte hain ki ERP form load hone mein 9 second lagte hain. ERP server ko ping 210 ms dikhata hai. Voice theek chalti hai kyunki woh MPLS par jaati hai, lekin ERP ka koi rule nahi hai aur woh Internet aur LTE par bhi spread hota hai. Internet circuit mein har dopahar 190 ms ka spike aata hai. Team ek ERP profile banati hai jo 100 ms require karta hai aur ERP ko pehle MPLS par bhejti hai.</p><p><b>Lesson:</b> Chatty applications real time na hone par bhi latency-sensitive hoti hain.</p></div>

<div class="iv"><p class="q">"Latency, jitter aur loss kya hain, aur voice ke liye sabse zyada kya matter karta hai?"</p><p>Latency delay hai, jitter delay ki variation hai, loss dropped packets hain. Voice ke liye jitter aur loss aksar pehle hurt karte hain kyunki codec ka playout buffer chhota hota hai aur woh retransmission ka wait nahi kar sakta, jabki delay budget lagbhag 150 ms one way hai. Numbers batao: 150 ms, 30 ms aur 1 %.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Path quality teen numbers se define hoti hai: latency, jitter, loss.</li>
<li>Voice aur video real time hain; ERP chatty hai; web aur backup tolerant hain.</li>
<li>Course VOICE limits: 150 ms, 30 ms, 1 %; teeno pass hone chahiye, limits inclusive hain.</li>
<li>Teeno metrics check karo, sirf latency nahi.</li>
</ul></div>
`}};export{e as default};