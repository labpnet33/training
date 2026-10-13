var e={id:`bufferbloat`,h:{en:`Bufferbloat: when a big queue makes everything slow`,hi:`Bufferbloat: jab bada queue sab kuch slow kar deta hai`},body:{en:`
<p>Here is a puzzling complaint: "The line is not even full, speed tests are fine, and yet video calls freeze for seconds whenever someone downloads a file." Nothing is dropping, nothing is down, and the line was just upgraded. The cause is often not too little bandwidth but too much <b>buffer</b>. The name is <b>bufferbloat</b>.</p>

<h3>The idea in one picture: a queue at a petrol pump</h3>
<p>Think of a petrol pump with a road that holds ten cars in front of it. If you arrive and the queue is full, you drive away and try another pump: a short wait, a clear signal. Now imagine the road in front of the pump holds a thousand cars. Nobody ever drives away, everybody joins the queue, and the last car waits for hours. The pump served just as many cars per minute, yet everyone's experience got worse. Big buffers hide the signal that tells senders to slow down.</p>

<h3>Why TCP makes it worse</h3>
<p>TCP learns the speed of a path by looking for loss. It sends faster and faster until a packet is dropped, then it backs off. A giant queue never drops, so TCP never backs off; it keeps growing its window until the queue is completely full, and the queue stays full. Every packet, including a voice packet or a web request that has nothing to do with the download, now waits behind the whole queue. That standing queue is the bloat.</p>
<p>The wait is simple arithmetic: <code>delay = queue size in bits / drain rate</code>.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Queue size and delay at 19 Mbps">
<line x1="60" y1="180" x2="620" y2="180" stroke="#64748b" stroke-width="2"/><line x1="60" y1="20" x2="60" y2="180" stroke="#64748b" stroke-width="2"/>
<text x="20" y="30" class="svg-muted" font-size="11">delay</text><text x="610" y="200" text-anchor="end" class="svg-muted" font-size="11">queue-limit (packets of 1500 bytes)</text>
<rect x="100" y="172" width="60" height="8" fill="#16a34a"/><text x="130" y="196" text-anchor="middle" class="svg-ink" font-size="11">64</text><text x="130" y="164" text-anchor="middle" class="svg-ink" font-size="11">40 ms</text>
<rect x="210" y="164" width="60" height="16" fill="#65a30d"/><text x="240" y="196" text-anchor="middle" class="svg-ink" font-size="11">128</text><text x="240" y="156" text-anchor="middle" class="svg-ink" font-size="11">81 ms</text>
<rect x="320" y="148" width="60" height="32" fill="#f59e0b"/><text x="350" y="196" text-anchor="middle" class="svg-ink" font-size="11">256</text><text x="350" y="140" text-anchor="middle" class="svg-ink" font-size="11">162 ms</text>
<rect x="430" y="116" width="60" height="64" fill="#f97316"/><text x="460" y="196" text-anchor="middle" class="svg-ink" font-size="11">512</text><text x="460" y="108" text-anchor="middle" class="svg-ink" font-size="11">323 ms</text>
<rect x="540" y="30" width="60" height="150" fill="#dc2626"/><text x="570" y="196" text-anchor="middle" class="svg-ink" font-size="11">4096</text><text x="570" y="22" text-anchor="middle" class="svg-ink" font-size="11">2.6 s</text>
</svg><p class="cap">A full queue of 1500-byte packets draining at 19 Mbps. A voice call has a 150 ms one-way budget in total.</p></div>

<div class="eg"><p><b>Worked example.</b> Queue of 4096 packets of 1500 bytes: 4096 x 1500 x 8 = 49,152,000 bits. At 19 Mbps that drains in 49,152,000 / 19,000,000 = 2.59 seconds. A queue of 64 packets is 64 x 1500 x 8 = 768,000 bits, which is 40 ms. Same link, same download: 2.6 seconds against 40 milliseconds of extra delay.</p></div>

<h3>How to recognise it</h3>
<ul>
<li>Ping to a distant host is 20 ms when idle and jumps to hundreds of milliseconds or seconds during a large transfer, then returns.</li>
<li>Throughput tests look perfect; interactive things (calls, remote desktop, web clicks) feel sluggish only while something big runs.</li>
<li>In the policy counters, a class has a very large <code>queue limit</code>, a high queue depth and almost no drops.</li>
<li>The simulator does not measure delay with ping. You calculate it from the queue limit and the rate, exactly as above, which is also what an interviewer expects you to do.</li>
</ul>

<h3>The fixes, in order of value</h3>
<ol>
<li><b>Shape just below the circuit</b> (chapters 4 and 5). Otherwise the standing queue lives in the provider device or in a modem where you cannot manage it.</li>
<li><b>Limit the queue.</b> <code>queue-limit 64 packets</code> in the class that holds bulk traffic. Short queues drop sooner, so TCP slows down sooner and the queue stays short.</li>
<li><b>Fair queuing.</b> <code>fair-queue</code> gives each flow its own small queue (16 packets per flow in this simulator), so a download cannot stand in front of a web request.</li>
<li><b>Early drop.</b> <code>random-detect</code> (WRED) drops a few packets before the queue is full to signal senders gently. With ECN the router can mark instead of drop on platforms that support it.</li>
<li><b>Priority for what must not wait.</b> Voice in a priority class is never behind bulk in the first place (<b>mq-queue</b>).</li>
</ol>
<pre class="code">policy-map WAN-CHILD
 class VOICE
  priority 2000
 class class-default
  fair-queue
  queue-limit 64 packets</pre>
<pre class="out">        Class-map: class-default (match-any)
          Queueing
          queue limit <span class="hl">64 packets</span>
          (queue depth/total drops/no-buffer drops) 0/462455/0
          Fair-queue: per-flow queue limit 16 packets</pre>
<p>Trade-off: a shorter queue drops more bursts. For bulk traffic that is exactly what you want; for a class that carries short bursts of important data (billing), give it a guarantee and a moderate limit instead of the smallest one.</p>
<div class="note"><p><b>Junos note.</b> The buffer is a scheduler property, set in time rather than packets:</p>
<pre class="code">set class-of-service schedulers S-BE transmit-rate remainder
set class-of-service schedulers S-BE buffer-size temporal 50000
set class-of-service drop-profiles DP-BE interpolate fill-level [ 40 100 ] drop-probability [ 0 100 ]
set class-of-service schedulers S-BE drop-profile-map loss-priority any protocol any drop-profile DP-BE</pre>
<p>A temporal buffer of 50,000 microseconds caps the wait at 50 ms whatever the rate.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) "Fixing" a slow link by increasing queue-limit: it stops drops and raises delay. (2) Shaping above the contract so the queue forms at the provider. (3) Measuring only throughput. Always measure ping or a voice test <i>during</i> the load. (4) Setting a tiny queue on a class that carries one-off bursts such as a database sync, causing needless loss.</p></div>
<div class="exam"><p><b>Exam trap.</b> Bufferbloat is delay without loss. A policer cannot cause it (no queue); a shaper with a large queue can. WRED helps only when TCP traffic fills the queue.</p></div>

<div class="scn"><h4>The Surat store with the smooth speed test</h4><p>A Bharat Retail store in Surat has a 10 Mbps service and complains that the card machines time out whenever the cashier syncs the stock file. A speed test shows 9.6 Mbps. The engineer pings the head office while the sync runs: 24 ms idle, 1.9 seconds under load. The router had a shaper at 10 Mbps with a queue-limit of 2000 packets on class-default. He lowers the shaper to 9 Mbps, sets the limit to 64 packets and adds fair-queue. Ping under load is now 60 ms, the card machines stop timing out, and nobody bought bandwidth.</p><p><b>Lesson:</b> test latency under load. Throughput alone hides bufferbloat.</p></div>
<div class="iv"><p class="q">"What is bufferbloat and how do you fix it at a WAN edge?"</p><p>Excess latency caused by oversized queues that stay full because TCP only slows down on loss. Delay is queue size over drain rate; a 4096-packet queue at 19 Mbps is 2.6 seconds. I fix it by shaping just below the circuit so the queue is on my device, limiting the queue depth, using fair-queue so flows do not block each other, optionally WRED or ECN, and putting latency-sensitive traffic in a priority class.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bufferbloat is high delay with little loss, caused by a large standing queue.</li>
<li>Delay = queue bits / drain rate; 64 packets at 19 Mbps is 40 ms, 4096 is 2.6 s.</li>
<li>Fixes: shape below the circuit, short queue-limit, fair-queue, WRED or ECN, priority for voice.</li>
<li>A larger buffer is never a fix for loss on a bulk class.</li>
<li>Always test ping or voice during the load, not only throughput.</li>
</ul></div>
`,hi:`
<p>Ek ulajhan wali shikayat: "Line poori bhari bhi nahi hai, speed test theek aata hai, phir bhi koi file download kare to video calls kuch second ke liye freeze ho jaati hain." Kuch drop nahi ho raha, kuch down nahi hai, aur line abhi upgrade hui hai. Wajah aksar bandwidth ki kami nahi balki zaroorat se zyada <b>buffer</b> hota hai. Isi ka naam <b>bufferbloat</b> hai.</p>

<h3>Ek tasveer mein idea: petrol pump ki queue</h3>
<p>Ek petrol pump sochiye jiske saamne sadak par dus gaadiyan aa sakti hain. Aap aao aur queue full ho, to aap kisi aur pump par chale jaate ho: chhota intezaar, saaf signal. Ab socho pump ke saamne ki sadak par hazaar gaadiyan aa sakti hain. Koi kabhi nahi jaata, sab queue mein lagte hain, aur aakhri gaadi ghanton intezaar karti hai. Pump utni hi gaadiyan per minute serve karta hai, phir bhi sabka anubhav bigad gaya. Bade buffers woh signal chhupa lete hain jo senders ko dheema hone ko kehta hai.</p>

<h3>TCP ise aur kharab kyun karta hai</h3>
<p>TCP path ki speed loss dekh kar seekhta hai. Woh tez aur tez bhejta hai jab tak koi packet drop na ho, phir peeche hat jaata hai. Giant queue kabhi drop nahi karti, isliye TCP kabhi peeche nahi hatta; woh apni window badhata rehta hai jab tak queue poori full na ho jaaye, aur queue full hi rehti hai. Har packet, voice packet ya download se koi lena-dena na rakhne wali web request bhi, ab poori queue ke peeche intezaar karta hai. Yahi standing queue bloat hai.</p>
<p>Intezaar simple hisaab hai: <code>delay = queue size in bits / drain rate</code>.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="19 Mbps par queue size aur delay">
<line x1="60" y1="180" x2="620" y2="180" stroke="#64748b" stroke-width="2"/><line x1="60" y1="20" x2="60" y2="180" stroke="#64748b" stroke-width="2"/>
<text x="20" y="30" class="svg-muted" font-size="11">delay</text><text x="610" y="200" text-anchor="end" class="svg-muted" font-size="11">queue-limit (1500-byte packets)</text>
<rect x="100" y="172" width="60" height="8" fill="#16a34a"/><text x="130" y="196" text-anchor="middle" class="svg-ink" font-size="11">64</text><text x="130" y="164" text-anchor="middle" class="svg-ink" font-size="11">40 ms</text>
<rect x="210" y="164" width="60" height="16" fill="#65a30d"/><text x="240" y="196" text-anchor="middle" class="svg-ink" font-size="11">128</text><text x="240" y="156" text-anchor="middle" class="svg-ink" font-size="11">81 ms</text>
<rect x="320" y="148" width="60" height="32" fill="#f59e0b"/><text x="350" y="196" text-anchor="middle" class="svg-ink" font-size="11">256</text><text x="350" y="140" text-anchor="middle" class="svg-ink" font-size="11">162 ms</text>
<rect x="430" y="116" width="60" height="64" fill="#f97316"/><text x="460" y="196" text-anchor="middle" class="svg-ink" font-size="11">512</text><text x="460" y="108" text-anchor="middle" class="svg-ink" font-size="11">323 ms</text>
<rect x="540" y="30" width="60" height="150" fill="#dc2626"/><text x="570" y="196" text-anchor="middle" class="svg-ink" font-size="11">4096</text><text x="570" y="22" text-anchor="middle" class="svg-ink" font-size="11">2.6 s</text>
</svg><p class="cap">19 Mbps par khaali hoti 1500-byte packets ki full queue. Voice call ka kul one-way budget 150 ms hai.</p></div>

<div class="eg"><p><b>Worked example.</b> 1500 byte ke 4096 packets ki queue: 4096 x 1500 x 8 = 49,152,000 bits. 19 Mbps par yeh 49,152,000 / 19,000,000 = 2.59 second mein khaali hoti hai. 64 packets ki queue 64 x 1500 x 8 = 768,000 bits hai, yaani 40 ms. Wahi link, wahi download: 2.6 second ke muqable 40 millisecond extra delay.</p></div>

<h3>Ise kaise pehchanein</h3>
<ul>
<li>Door ke host ka ping idle mein 20 ms hota hai aur bade transfer ke dauran sau-hazaar millisecond ya second tak chala jaata hai, phir wapas aata hai.</li>
<li>Throughput tests perfect dikhte hain; interactive cheezein (calls, remote desktop, web clicks) sirf tab sust lagti hain jab koi bada kaam chal raha ho.</li>
<li>Policy counters mein ek class ka <code>queue limit</code> bahut bada hota hai, queue depth zyada aur drops lagbhag nahi.</li>
<li>Simulator ping se delay nahi naapta. Aap use queue limit aur rate se calculate karte ho, bilkul upar ki tarah, aur interviewer bhi yahi expect karta hai.</li>
</ul>

<h3>Fixes, keemat ke kram mein</h3>
<ol>
<li><b>Circuit se thoda neeche shape karo</b> (chapters 4 aur 5). Warna standing queue provider device ya modem mein hoti hai jahan aap manage nahi kar sakte.</li>
<li><b>Queue limit karo.</b> Bulk traffic wali class mein <code>queue-limit 64 packets</code>. Chhoti queues jaldi drop karti hain, isliye TCP jaldi dheema hota hai aur queue chhoti rehti hai.</li>
<li><b>Fair queuing.</b> <code>fair-queue</code> har flow ko apni chhoti queue deta hai (is simulator mein 16 packets per flow), isliye download web request ke aage khada nahi ho sakta.</li>
<li><b>Early drop.</b> <code>random-detect</code> (WRED) queue full hone se pehle kuch packets drop karke senders ko dheere se signal deta hai. ECN ke saath, jin platforms par supported hai, router drop ki jagah mark kar sakta hai.</li>
<li><b>Jise intezaar nahi karna uske liye priority.</b> Priority class mein voice pehle hi bulk ke peeche nahi hoti (<b>mq-queue</b>).</li>
</ol>
<pre class="code">policy-map WAN-CHILD
 class VOICE
  priority 2000
 class class-default
  fair-queue
  queue-limit 64 packets</pre>
<pre class="out">        Class-map: class-default (match-any)
          Queueing
          queue limit <span class="hl">64 packets</span>
          (queue depth/total drops/no-buffer drops) 0/462455/0
          Fair-queue: per-flow queue limit 16 packets</pre>
<p>Trade-off: chhoti queue zyada bursts drop karti hai. Bulk traffic ke liye aap yahi chahte ho; jis class mein important data ke chhote bursts hote hain (billing) use sabse chhoti limit ki jagah guarantee aur moderate limit do.</p>
<div class="note"><p><b>Junos note.</b> Buffer scheduler ki property hai, packets ki jagah time mein set hota hai:</p>
<pre class="code">set class-of-service schedulers S-BE transmit-rate remainder
set class-of-service schedulers S-BE buffer-size temporal 50000
set class-of-service drop-profiles DP-BE interpolate fill-level [ 40 100 ] drop-probability [ 0 100 ]
set class-of-service schedulers S-BE drop-profile-map loss-priority any protocol any drop-profile DP-BE</pre>
<p>50,000 microsecond ka temporal buffer rate kuch bhi ho, intezaar ko 50 ms par rokta hai.</p></div>

<div class="warn"><p><b>Aam galtiyan.</b> (1) Slow link ko queue-limit badha kar "theek" karna: drops ruk jaate hain aur delay badhta hai. (2) Contract se upar shape karna taaki queue provider par bane. (3) Sirf throughput naapna. Ping ya voice test hamesha load <i>ke dauran</i> naapo. (4) Aisi class par bahut chhoti queue rakhna jisme database sync jaise ek-do bursts jaate hain, jisse bekaar loss hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Bufferbloat loss ke bina delay hai. Policer ise paida nahi kar sakta (queue nahi hai); badi queue wala shaper kar sakta hai. WRED tabhi madad karta hai jab TCP traffic queue bhare.</p></div>

<div class="scn"><h4>Surat store ka smooth speed test</h4><p>Bharat Retail ke Surat store ki service 10 Mbps ki hai aur shikayat hai ki cashier stock file sync karta hai to card machines time out hoti hain. Speed test 9.6 Mbps dikhata hai. Engineer sync chalte waqt head office ko ping karta hai: idle mein 24 ms, load mein 1.9 second. Router par class-default mein 10 Mbps shaper aur 2000 packets ki queue-limit thi. Woh shaper ko 9 Mbps karta hai, limit 64 packets karta hai aur fair-queue jodta hai. Load mein ping ab 60 ms hai, card machines time out hona band karti hain, aur kisi ne bandwidth nahi kharidi.</p><p><b>Lesson:</b> load ke neeche latency test karo. Akela throughput bufferbloat chhupa deta hai.</p></div>
<div class="iv"><p class="q">"Bufferbloat kya hai aur WAN edge par ise kaise theek karte ho?"</p><p>Oversized queues se hone wala excess latency jo full rehti hain kyunki TCP sirf loss par dheema hota hai. Delay queue size ko drain rate se bhaag dene par milta hai; 19 Mbps par 4096 packets ki queue 2.6 second hai. Main ise circuit se thoda neeche shape karke theek karta hoon taaki queue mere device par ho, queue depth limit karke, fair-queue se taaki flows ek doosre ko block na karein, optionally WRED ya ECN, aur latency-sensitive traffic ko priority class mein rakhkar.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bufferbloat kam loss ke saath high delay hai, bade standing queue se.</li>
<li>Delay = queue bits / drain rate; 19 Mbps par 64 packets 40 ms, 4096 packets 2.6 s.</li>
<li>Fixes: circuit se neeche shape, chhoti queue-limit, fair-queue, WRED ya ECN, voice ke liye priority.</li>
<li>Bulk class ke loss ka fix bada buffer kabhi nahi hai.</li>
<li>Ping ya voice test load ke dauran karo, sirf throughput nahi.</li>
</ul></div>
`}};export{e as default};