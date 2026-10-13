var e={id:`traffic-types`,h:{en:`Traffic types and what each one needs`,hi:`Traffic ke types aur har ek ko kya chahiye`},body:{en:`
<p>Before you can classify traffic you must know what you are protecting and what you are sacrificing. Not all traffic suffers equally from a slow network. A web page that loads half a second later is annoying. A phone call that arrives half a second later is unusable. This chapter gives you the seven traffic types you will meet in almost every enterprise, and the three numbers that describe how each one feels congestion: <b>delay</b>, <b>jitter</b> and <b>loss</b>.</p>

<h3>Three measurements, defined</h3>
<dl class="terms">
<dt>Delay (latency)</dt><dd>How long a packet takes from sender to receiver. For voice we quote <b>one-way delay</b>, because people hear one direction at a time.</dd>
<dt>Jitter</dt><dd>The variation in delay from one packet to the next. If packets arrive 20 ms, 20 ms, 90 ms, 20 ms apart instead of evenly, the receiver must buffer to smooth the sound. Too much jitter overflows or starves that buffer and the call crackles.</dd>
<dt>Loss</dt><dd>The share of packets that never arrive, usually because a queue was full and dropped them. Voice and video ride on UDP, which never retransmits, so a lost packet is a hole in the sound.</dd>
</dl>

<h3>The seven traffic types</h3>
<table class="cmp"><tr><th>Type</th><th>Example</th><th>Delay</th><th>Jitter</th><th>Loss</th><th>Behaviour</th></tr>
<tr><td><b>Voice</b></td><td>IP phone call (RTP)</td><td>150 ms or less one way</td><td>30 ms or less</td><td>1% or less</td><td>Small packets, steady rate, UDP</td></tr>
<tr><td><b>Interactive video</b></td><td>Video meeting, live class with questions</td><td>150 ms or less</td><td>30 ms or less</td><td>1% or less</td><td>Bursty, bigger packets, UDP</td></tr>
<tr><td><b>Streaming video</b></td><td>Recorded lecture playback</td><td>4 to 5 s is fine</td><td>Absorbed by buffer</td><td>5% or less</td><td>Large buffer hides problems</td></tr>
<tr><td><b>Signalling</b></td><td>SIP call setup</td><td>Moderate</td><td>Low concern</td><td>Very sensitive</td><td>Few packets, but a lost one delays the call</td></tr>
<tr><td><b>Transactional data</b></td><td>Billing system, POS terminal</td><td>Seconds matter</td><td>Low concern</td><td>TCP recovers, slowly</td><td>Request and reply, TCP</td></tr>
<tr><td><b>Bulk data</b></td><td>Backup, file copy, software update</td><td>Tolerant</td><td>Tolerant</td><td>TCP recovers</td><td>Wants every spare bit</td></tr>
<tr><td><b>Scavenger</b></td><td>Personal downloads, games</td><td>Tolerant</td><td>Tolerant</td><td>Tolerant</td><td>Allowed only if nobody else needs the link</td></tr>
</table>
<p>The numbers for voice and interactive video are the usual design targets used by enterprise QoS guides; real products tolerate slightly more, but designing to these gives clean calls. Network control traffic (routing protocol hellos, spanning tree) is a special eighth case: tiny, but if it is dropped the network itself falls over, so it always gets the best treatment.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Sensitivity matrix">
<text x="170" y="22" class="svg-muted" font-size="12" text-anchor="middle">Delay</text><text x="260" y="22" class="svg-muted" font-size="12" text-anchor="middle">Jitter</text><text x="350" y="22" class="svg-muted" font-size="12" text-anchor="middle">Loss</text>
<text x="10" y="52" class="svg-ink" font-size="13">Voice</text><rect x="130" y="34" width="80" height="26" rx="5" fill="#fecaca"/><rect x="220" y="34" width="80" height="26" rx="5" fill="#fecaca"/><rect x="310" y="34" width="80" height="26" rx="5" fill="#fecaca"/>
<text x="10" y="86" class="svg-ink" font-size="13">Interactive video</text><rect x="130" y="68" width="80" height="26" rx="5" fill="#fecaca"/><rect x="220" y="68" width="80" height="26" rx="5" fill="#fecaca"/><rect x="310" y="68" width="80" height="26" rx="5" fill="#fecaca"/>
<text x="10" y="120" class="svg-ink" font-size="13">Signalling</text><rect x="130" y="102" width="80" height="26" rx="5" fill="#fde68a"/><rect x="220" y="102" width="80" height="26" rx="5" fill="#bbf7d0"/><rect x="310" y="102" width="80" height="26" rx="5" fill="#fecaca"/>
<text x="10" y="154" class="svg-ink" font-size="13">Transactional</text><rect x="130" y="136" width="80" height="26" rx="5" fill="#fde68a"/><rect x="220" y="136" width="80" height="26" rx="5" fill="#bbf7d0"/><rect x="310" y="136" width="80" height="26" rx="5" fill="#fde68a"/>
<text x="10" y="188" class="svg-ink" font-size="13">Bulk and scavenger</text><rect x="130" y="170" width="80" height="26" rx="5" fill="#bbf7d0"/><rect x="220" y="170" width="80" height="26" rx="5" fill="#bbf7d0"/><rect x="310" y="170" width="80" height="26" rx="5" fill="#bbf7d0"/>
<rect x="430" y="40" width="14" height="14" fill="#fecaca"/><text x="452" y="52" class="svg-ink" font-size="12">very sensitive</text>
<rect x="430" y="64" width="14" height="14" fill="#fde68a"/><text x="452" y="76" class="svg-ink" font-size="12">moderate</text>
<rect x="430" y="88" width="14" height="14" fill="#bbf7d0"/><text x="452" y="100" class="svg-ink" font-size="12">tolerant</text>
</svg><p class="cap">Classes with a lot of red are the ones you protect first. The green rows are the ones you can sacrifice.</p></div>

<h3>Why bulk traffic can safely be dropped</h3>
<p>Bulk transfers use TCP. TCP notices a lost packet, retransmits it and, importantly, <b>slows down</b>. A backup that loses 2 percent of its packets just finishes a few minutes later. A call that loses 2 percent of its packets sounds broken. Because of this difference, congestion hurts voice and video and barely hurts a backup, which is the whole business case for treating them differently.</p>

<div class="eg"><p><b>Worked example: how much bandwidth is a call?</b> A G.711 call sends one packet every 20 ms, so 50 packets per second. Each packet carries 160 bytes of voice plus 12 bytes RTP, 8 bytes UDP and 20 bytes IP: 200 bytes. 200 bytes x 8 bits x 50 packets = 80 kbps at the IP layer. Add 18 bytes of Ethernet header and the wire carries 218 bytes x 8 x 50 = 87.2 kbps. Five simultaneous calls therefore need about 400 kbps at the IP layer, which is the call size used in this module's labs (250 packets per second of 200 bytes). A G.729 call, compressed to 20 bytes of voice, is 60 bytes per packet and about 24 kbps. Chapter on voice design in the last module of this track goes deeper.</p></div>

<h3>Sorting your own network</h3>
<p>A practical first step in any QoS project is an inventory. List every application on the WAN, put it into one of the seven types, and note the port or address that identifies it. A company rarely needs more than six to eight classes. More classes means more policy to maintain and more ways to misclassify. In this module the Pune branch uses four: voice RTP (UDP 16384 to 32767), SIP signalling (UDP or TCP 5060), web (TCP 80 and 443) and the SMB backup (TCP 445). Everything else will fall into the default class.</p>

<div class="warn"><p><b>Common mistake.</b> Giving every important application its own priority. If six applications are all "critical", none is. Reserve the strictest treatment for voice (and sometimes interactive video), and let the rest share bandwidth by weight.</p></div>
<div class="exam"><p><b>Exam trap.</b> Remember who retransmits. Voice and video over UDP do not, so loss damages them directly. TCP traffic retransmits and slows, so it survives loss. Delay and jitter hurt voice; loss hurts everything but is most visible on real-time traffic.</p></div>

<div class="scn"><h4>Sahyadri University: the live class that froze</h4><p>During a live Python class streamed from Pune, students saw the video freeze while the audio stayed fine. The network team found the lecture hall uplink full of a large video upload from another room. The interactive video was sharing a queue with that upload and losing packets in bursts, which video codecs show as freezing, while the much smaller voice stream happened to survive. Moving the upload to a bulk class and the live class to an interactive video class cured it.</p><p><b>Lesson:</b> classify by what the traffic needs, not by how important the sender feels.</p></div>
<div class="iv"><p class="q">"What are the quality targets for voice on an IP network?"</p><p>One-way delay of 150 ms or less, jitter of 30 ms or less and packet loss of 1 percent or less. Mention that these are design targets, that voice uses UDP so lost packets are not recovered, and that a single G.711 call needs about 80 kbps at the IP layer.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Delay, jitter and loss are the three numbers; voice and interactive video are sensitive to all three.</li>
<li>Targets for voice: 150 ms one-way, 30 ms jitter, 1 percent loss.</li>
<li>TCP bulk traffic recovers from loss and slows down, so it is safe to sacrifice.</li>
<li>One G.711 call is about 80 kbps at the IP layer (200 byte packets at 50 per second).</li>
<li>Keep the class count small (six to eight) and reserve the strict treatment for voice.</li>
</ul></div>
`,hi:`
<p>Traffic ko classify karne se pehle aapko pata hona chahiye ki aap kya bacha rahe ho aur kya qurbaan kar rahe ho. Slow network se saara traffic ek jaisa pareshan nahi hota. Web page aadhe second der se khule to khijh hoti hai. Phone call aadhe second der se aaye to bekaar hai. Yeh chapter aapko woh saat traffic types deta hai jo lagbhag har enterprise mein milte hain, aur woh teen numbers jo batate hain ki har ek congestion kaisa mehsoos karta hai: <b>delay</b>, <b>jitter</b> aur <b>loss</b>.</p>

<h3>Teen measurements, define karke</h3>
<dl class="terms">
<dt>Delay (latency)</dt><dd>Packet ko sender se receiver tak pahunchne mein kitna time lagta hai. Voice ke liye hum <b>one-way delay</b> bolte hain kyunki log ek waqt mein ek hi direction sunte hain.</dd>
<dt>Jitter</dt><dd>Ek packet se doosre packet tak delay ka badlaav. Agar packets barabar ke bajaye 20 ms, 20 ms, 90 ms, 20 ms ke gap par aayein, to receiver ko awaaz smooth karne ke liye buffer karna padta hai. Jitter zyada ho to woh buffer overflow ya khaali ho jaata hai aur call mein crackle aata hai.</dd>
<dt>Loss</dt><dd>Un packets ka hissa jo kabhi pahunchte hi nahi, aam taur par isliye ki queue bhar gayi thi aur unhe drop kar diya. Voice aur video UDP par chalte hain jo kabhi retransmit nahi karta, isliye khoya hua packet awaaz mein ek sannata hai.</dd>
</dl>

<h3>Saat traffic types</h3>
<table class="cmp"><tr><th>Type</th><th>Example</th><th>Delay</th><th>Jitter</th><th>Loss</th><th>Behaviour</th></tr>
<tr><td><b>Voice</b></td><td>IP phone call (RTP)</td><td>One way 150 ms ya kam</td><td>30 ms ya kam</td><td>1% ya kam</td><td>Chhote packets, steady rate, UDP</td></tr>
<tr><td><b>Interactive video</b></td><td>Video meeting, sawalon wali live class</td><td>150 ms ya kam</td><td>30 ms ya kam</td><td>1% ya kam</td><td>Bursty, bade packets, UDP</td></tr>
<tr><td><b>Streaming video</b></td><td>Recorded lecture playback</td><td>4 se 5 s chalega</td><td>Buffer absorb karta hai</td><td>5% ya kam</td><td>Bada buffer problems chhupata hai</td></tr>
<tr><td><b>Signalling</b></td><td>SIP call setup</td><td>Moderate</td><td>Kam chinta</td><td>Bahut sensitive</td><td>Kam packets, par ek khoya to call der se judti hai</td></tr>
<tr><td><b>Transactional data</b></td><td>Billing system, POS terminal</td><td>Seconds matter karte hain</td><td>Kam chinta</td><td>TCP recover karta hai, dheere</td><td>Request aur reply, TCP</td></tr>
<tr><td><b>Bulk data</b></td><td>Backup, file copy, software update</td><td>Tolerant</td><td>Tolerant</td><td>TCP recover karta hai</td><td>Har bacha hua bit maangta hai</td></tr>
<tr><td><b>Scavenger</b></td><td>Personal downloads, games</td><td>Tolerant</td><td>Tolerant</td><td>Tolerant</td><td>Tabhi chalne do jab link ki kisi aur ko zaroorat na ho</td></tr>
</table>
<p>Voice aur interactive video ke numbers enterprise QoS guides ke usual design targets hain; asli products thoda zyada tolerate kar lete hain, lekin in targets par design karne se calls saaf rehti hain. Network control traffic (routing protocol hellos, spanning tree) ek khaas aathva case hai: chhota hai, par drop ho jaaye to network khud gir jaata hai, isliye use hamesha sabse achha treatment milta hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Sensitivity matrix">
<text x="170" y="22" class="svg-muted" font-size="12" text-anchor="middle">Delay</text><text x="260" y="22" class="svg-muted" font-size="12" text-anchor="middle">Jitter</text><text x="350" y="22" class="svg-muted" font-size="12" text-anchor="middle">Loss</text>
<text x="10" y="52" class="svg-ink" font-size="13">Voice</text><rect x="130" y="34" width="80" height="26" rx="5" fill="#fecaca"/><rect x="220" y="34" width="80" height="26" rx="5" fill="#fecaca"/><rect x="310" y="34" width="80" height="26" rx="5" fill="#fecaca"/>
<text x="10" y="86" class="svg-ink" font-size="13">Interactive video</text><rect x="130" y="68" width="80" height="26" rx="5" fill="#fecaca"/><rect x="220" y="68" width="80" height="26" rx="5" fill="#fecaca"/><rect x="310" y="68" width="80" height="26" rx="5" fill="#fecaca"/>
<text x="10" y="120" class="svg-ink" font-size="13">Signalling</text><rect x="130" y="102" width="80" height="26" rx="5" fill="#fde68a"/><rect x="220" y="102" width="80" height="26" rx="5" fill="#bbf7d0"/><rect x="310" y="102" width="80" height="26" rx="5" fill="#fecaca"/>
<text x="10" y="154" class="svg-ink" font-size="13">Transactional</text><rect x="130" y="136" width="80" height="26" rx="5" fill="#fde68a"/><rect x="220" y="136" width="80" height="26" rx="5" fill="#bbf7d0"/><rect x="310" y="136" width="80" height="26" rx="5" fill="#fde68a"/>
<text x="10" y="188" class="svg-ink" font-size="13">Bulk aur scavenger</text><rect x="130" y="170" width="80" height="26" rx="5" fill="#bbf7d0"/><rect x="220" y="170" width="80" height="26" rx="5" fill="#bbf7d0"/><rect x="310" y="170" width="80" height="26" rx="5" fill="#bbf7d0"/>
<rect x="430" y="40" width="14" height="14" fill="#fecaca"/><text x="452" y="52" class="svg-ink" font-size="12">bahut sensitive</text>
<rect x="430" y="64" width="14" height="14" fill="#fde68a"/><text x="452" y="76" class="svg-ink" font-size="12">moderate</text>
<rect x="430" y="88" width="14" height="14" fill="#bbf7d0"/><text x="452" y="100" class="svg-ink" font-size="12">tolerant</text>
</svg><p class="cap">Jin classes mein zyada laal hai unhe pehle protect karte hain. Hare rows qurbaan kiye ja sakte hain.</p></div>

<h3>Bulk traffic ko drop karna safe kyun hai</h3>
<p>Bulk transfers TCP use karte hain. TCP khoya hua packet notice karta hai, use retransmit karta hai aur, sabse zaroori, <b>slow ho jaata hai</b>. Jis backup ke 2 percent packets kho jaayein woh bas kuch minute der se khatam hota hai. Jis call ke 2 percent packets kho jaayein woh toota hua sunai deti hai. Isi farak ki wajah se congestion voice aur video ko nuksaan deta hai aur backup ko lagbhag nahi, aur yahi in sab ko alag treat karne ka poora business case hai.</p>

<div class="eg"><p><b>Worked example: ek call kitni bandwidth leti hai?</b> G.711 call har 20 ms mein ek packet bhejti hai, yaani 50 packets per second. Har packet mein 160 bytes voice, 12 bytes RTP, 8 bytes UDP aur 20 bytes IP hota hai: 200 bytes. 200 bytes x 8 bits x 50 packets = IP layer par 80 kbps. 18 bytes Ethernet header jodo to wire par 218 bytes x 8 x 50 = 87.2 kbps jaata hai. Paanch simultaneous calls ko IP layer par lagbhag 400 kbps chahiye, jo is module ke labs mein call ka size hai (250 packets per second, 200 bytes). G.729 call, jo 20 bytes voice mein compress hoti hai, 60 bytes per packet aur lagbhag 24 kbps hai. Is track ke aakhri module mein voice design ka chapter aur gehrai mein jaata hai.</p></div>

<h3>Apne network ko sort karna</h3>
<p>Kisi bhi QoS project ka practical pehla step inventory hai. WAN par har application ki list banao, use saat types mein se ek mein daalo, aur woh port ya address likho jo use pehchanta hai. Company ko kam hi kabhi chhe se aath se zyada classes chahiye. Zyada classes ka matlab zyada policy maintain karna aur galat classify karne ke zyada tareeke. Is module mein Pune branch chaar use karti hai: voice RTP (UDP 16384 se 32767), SIP signalling (UDP ya TCP 5060), web (TCP 80 aur 443) aur SMB backup (TCP 445). Baaki sab default class mein girega.</p>

<div class="warn"><p><b>Common mistake.</b> Har important application ko apni priority de dena. Agar chhe applications sab "critical" hain, to koi bhi nahi hai. Sabse strict treatment voice (aur kabhi kabhi interactive video) ke liye rakho, baaki ko weight ke hisaab se bandwidth share karne do.</p></div>
<div class="exam"><p><b>Exam trap.</b> Yaad rakho kaun retransmit karta hai. UDP par voice aur video nahi karte, isliye loss unhe seedha nuksaan deta hai. TCP traffic retransmit karke slow hota hai, isliye woh loss se bach jaata hai. Delay aur jitter voice ko hurt karte hain; loss sabko hurt karta hai par real-time traffic par sabse zyada dikhta hai.</p></div>

<div class="scn"><h4>Sahyadri University: woh live class jo freeze ho gayi</h4><p>Pune se stream hui live Python class ke dauran students ko video freeze hota dikha jabki audio theek raha. Network team ko lecture hall uplink doosre room ke bade video upload se bhara mila. Interactive video usi queue mein us upload ke saath share kar raha tha aur bursts mein packets kho raha tha, jo video codecs freezing ki tarah dikhate hain, jabki bahut chhota voice stream bach gaya. Upload ko bulk class mein aur live class ko interactive video class mein daalne se fix ho gaya.</p><p><b>Lesson:</b> traffic ko is hisaab se classify karo ki use kya chahiye, is hisaab se nahi ki bhejne wala kitna important mehsoos karta hai.</p></div>
<div class="iv"><p class="q">"IP network par voice ke quality targets kya hain?"</p><p>One-way delay 150 ms ya kam, jitter 30 ms ya kam aur packet loss 1 percent ya kam. Bolo ki yeh design targets hain, voice UDP use karti hai isliye khoye packets recover nahi hote, aur ek G.711 call ko IP layer par lagbhag 80 kbps chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Delay, jitter aur loss teen numbers hain; voice aur interactive video teeno ke liye sensitive hain.</li>
<li>Voice ke targets: 150 ms one-way, 30 ms jitter, 1 percent loss.</li>
<li>TCP bulk traffic loss se recover karke slow ho jaata hai, isliye use qurbaan karna safe hai.</li>
<li>Ek G.711 call IP layer par lagbhag 80 kbps hai (200 byte packets, 50 per second).</li>
<li>Class count chhota rakho (chhe se aath) aur strict treatment voice ke liye reserve karo.</li>
</ul></div>
`}};export{e as default};